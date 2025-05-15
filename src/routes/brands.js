const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('Brands').get();
    const brands = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).send('Error fetching brands: ' + error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const brand = await db.collection('Brands').doc(id).get();
    res.json(brand);
  } catch (error) {
    res.status(500).send('Error fetching brand: ' + error.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const brand = req.body;
    const newBrand = await db.collection('Brands').add(brand);
    res.status(200).json(newBrand);
  } catch (error) {
    res.status(500).send('Error adding brand: ' + error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Apagar todos os emails associados a esta brand
    const emailsSnapshot = await db.collection('Emails').where('brand', '==', id).get();
    const batch = db.batch();
    emailsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    await db.collection('Brands').doc(id).delete();
    res.status(200).send({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).send('Error deleting brand: ' + error.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection('Brands').doc(id).update(data);
    res.status(200).json({ message: 'Brand updated successfully' });
  } catch (error) {
    res.status(500).send('Error updating brand: ' + error.message);
  }
});

module.exports = router;
