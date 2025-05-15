const express = require('express');

const emails = require('./emails');
const brands = require('./brands');
const payments = require('./payments');
const router = express.Router();

// domain.com/api/emails /POST -> add email
// domain.com/api/emails /GET -> get all emails
// domain.com/api/emails /DELETE -> delete all emails
// domain.com/api/emails/id /GET -> get specific emails

// domain.com/api/brands /POST -> add brand
// domain.com/api/brands /GET -> get all brands
// domain.com/api/brands /DELETE -> delete all brands
// domain.com/api/brands/id /GET -> get specific brands

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

router.use('/emails', emails);
router.use('/brands', brands);
router.use('/payments', payments);

module.exports = router;
