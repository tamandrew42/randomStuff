const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Cosmos DB setup
const cosmosClient = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING);
const database = cosmosClient.database('FamilyRecords');
const peopleContainer = database.container('People');

// Blob Storage setup
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient('family-photos');

// Routes
app.get('/', async (req, res) => {
  const { resources: people } = await peopleContainer.items.query('SELECT * FROM c').fetchAll();
  res.render('index', { people });
});

app.post('/person', async (req, res) => {
  const { name, birthDate, birthPlace } = req.body;
  const newPerson = {
    id: Date.now().toString(),
    name,
    birthDate,
    birthPlace
  };
  
  await peopleContainer.items.create(newPerson);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Genealogy app listening at http://localhost:${port}`);
});
