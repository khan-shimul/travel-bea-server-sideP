const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je3vw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function server() {
    try {
        await client.connect();

        const database = client.db('travel_bea');
        const packageCollection = database.collection('packages');
        const bookedCollection = database.collection('booked');

        // Find packages GET API
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        // Find single package use id
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packageCollection.findOne(query);
            res.send(package);
        });

        // Booked package POST API
        app.post('/booked', async (req, res) => {
            const bookedPackage = req.body.packaged;
            const booked = await bookedCollection.insertOne(bookedPackage);
            res.json(booked);
        });

        // Booked packages GET API
        app.get('/booked', async (req, res) => {
            const cursor = bookedCollection.find({});
            const bookedPackages = await cursor.toArray();
            res.send(bookedPackages);
        })

        // My Orders DELETE API
        app.delete('/booked/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const result = await bookedCollection.deleteOne(query);
            res.json(result);
        })

        // Add package POST API
        app.post('/packages', async (req, res) => {
            const package = req.body.data;
            const result = await packageCollection.insertOne(package);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}

server().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Travel Bea server is running');
});

app.listen(port, () => {
    console.log('TavelBea listening to at port ', port);
});