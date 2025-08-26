// api/admin.js
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// init firebase admin only once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  await new Promise((r) => cors(req, res, r));

  const SECRET = process.env.ADMIN_API_SECRET;
  const auth = req.headers['x-admin-secret'];
  if (!auth || auth !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { action, claimId, note } = req.body;
    if (!action || !claimId) return res.status(400).json({ error: 'Missing action or claimId' });

    const claimRef = db.collection('claims').doc(claimId);
    const claimSnap = await claimRef.get();
    if (!claimSnap.exists) return res.status(404).json({ error: 'Claim not found' });

    const claim = claimSnap.data();

    if (action === 'approve') {
      await claimRef.update({ status: 'approved', adminNote: note || '', approvedAt: admin.firestore.FieldValue.serverTimestamp() });
      // add to wallet
      if (claim.userId && typeof claim.amount === 'number') {
        const walletRef = db.collection('wallets').doc(claim.userId);
        await db.runTransaction(async (t) => {
          const w = await t.get(walletRef);
          if (!w.exists) {
            t.set(walletRef, { balance: claim.amount, history: [{ type: 'claim', amount: claim.amount, claimId, createdAt: admin.firestore.FieldValue.serverTimestamp() }] });
          } else {
            const wb = w.data();
            const newBal = (wb.balance || 0) + claim.amount;
            const hist = (wb.history || []).concat([{ type: 'claim', amount: claim.amount, claimId, createdAt: admin.firestore.FieldValue.serverTimestamp() }]);
            t.update(walletRef, { balance: newBal, history: hist });
          }
        });
      }
      return res.json({ ok: true });
    }

    if (action === 'reject') {
      await claimRef.update({ status: 'rejected', adminNote: note || '', rejectedAt: admin.firestore.FieldValue.serverTimestamp() });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
