const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors'); // Importar o pacote CORS
const path = require('path');

const serviceAccount = require('../config/service-account-file.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const routes = require('./routes');

const app = express();

app.use(cors()); // Usar o middleware CORS
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

module.exports = app;
