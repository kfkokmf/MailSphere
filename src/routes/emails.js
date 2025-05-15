const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();

// Rota para buscar todos os emails
router.get('/', async (req, res) => {
  try {
    const emailsSnapshot = await db.collection('Emails').get();
    const emails = [];
    
    // Buscar todas as marcas para mapear IDs para nomes
    const brandsSnapshot = await db.collection('Brands').get();
    const brandsMap = {};
    brandsSnapshot.forEach((brandDoc) => {
      brandsMap[brandDoc.id] = brandDoc.data().name;
    });

    // Processar cada email
    for (const doc of emailsSnapshot.docs) {
      const emailData = doc.data();
      emails.push({
        id: doc.id,
        ...emailData,
        brand: brandsMap[emailData.brand] || emailData.brand // Usar o nome da marca se disponível
      });
    }

    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).send('Error fetching emails: ' + error.message);
  }
});

// Rota para buscar o último email de cada marca
router.get('/latest-by-brand', async (req, res) => {
  try {
    // Passo 1: Buscar todos os documentos da coleção 'Brands' e armazenar num mapa
    const brandsSnapshot = await db.collection('Brands').get();
    const brandsMap = {};

    brandsSnapshot.forEach((brandDoc) => {
      brandsMap[brandDoc.id] = brandDoc.data().name;  // Mapa de ID da marca -> Nome da marca
    });

    // Passo 2: Para cada marca, buscar o último e-mail mais recente (limitado a 1)
    const latestEmailsPromises = Object.keys(brandsMap).map(async (brandId) => {
      const emailsSnapshot = await db.collection('Emails')
        .where('brand', '==', brandId)  // Filtrar por marca
        .orderBy('date', 'desc')  // Ordenar pela data em ordem decrescente (mais recente primeiro)
        .limit(1)  // Limitar a apenas 1 e-mail
        .get();

      if (!emailsSnapshot.empty) {
        const emailData = emailsSnapshot.docs[0].data();
        return {
          ...emailData,
          brand: brandsMap[brandId],  // Substitui o ID da marca pelo nome da marca
        };
      }
      return null;  // Se nenhum e-mail for encontrado, retornar null
    });

    // Executa todas as promessas e filtra os resultados válidos (não-nulos)
    const latestEmails = (await Promise.all(latestEmailsPromises)).filter(email => email !== null);

    res.status(200).json(latestEmails);  // Enviar a lista de e-mails com os nomes das marcas
  } catch (error) {
    console.error("Error fetching emails by brand:", error);
    res.status(500).send('Error fetching emails by brand: ' + error.message);
  }
});

// Rota para adicionar um novo email
router.post('/', async (req, res) => {
  try {
    const { subject, content, brand, flow, campaign } = req.body;
    if (!subject || !content || !brand || (!flow && !campaign) || (flow && campaign)) {
      return res.status(400).json({ error: 'Invalid data. Required: subject, content, brand, and either flow or campaign (not both).' });
    }

    // Buscar o ID da brand pelo nome
    const brandsSnapshot = await db.collection('Brands').where('name', '==', brand).get();
    let brandId = null;
    if (!brandsSnapshot.empty) {
      brandId = brandsSnapshot.docs[0].id;
    } else {
      // Se não existir, criar nova brand
      const newBrandRef = await db.collection('Brands').add({ name: brand });
      brandId = newBrandRef.id;
    }

    // Criar o novo email
    const newEmail = {
      subject,
      content,
      brand: brandId,
      ...(flow ? { flow } : {}),
      ...(campaign ? { campaign } : {}),
      date: new Date().toISOString()
    };

    const docRef = await db.collection('Emails').add(newEmail);

    res.status(201).json({ id: docRef.id, ...newEmail });
  } catch (error) {
    console.error("Error adding email:", error);
    res.status(500).send('Error adding email: ' + error.message);
  }
});

module.exports = router;
