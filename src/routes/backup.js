const express = require('express');
const admin = require('firebase-admin');
//
const router = express.Router();

const db = admin.firestore();

// get all emails
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // type -> campaign or flow

    const snapshot = await db.collection('Emails').get(); // filter with type
    const emails = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).send('Error fetching emails: ' + error.message);
  }
});

// get specific email
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const email = await db.collection('Emails').doc(id).get();

    res.json(email);
  } catch (error) {}
});

// add email
router.post('/', async (req, res) => {
  try {
    const email = req.body;

    // validar estrutura do email
    const newEmail = await db.collection('Emails').add(email); // validar se isto funciona

    res.status(200).json(newEmail);
  } catch (error) {
    res.status(500).send('Error adding email: ' + error.message);
  }
});

// delete a specific email
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('Emails').doc(id).delete();
    res.status(200).send({ message: 'Email deleted successfully' });
  } catch (error) {
    res.status(500).send('Error deleting email: ' + error.message);
  }
});

module.exports = router;