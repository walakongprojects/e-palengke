const myDb = require('../config/database');
const mongoose = require('mongoose')
const categoryModel = require('../models/category');

mongoose
    .connect(myDb.databaseDev, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to database'))

const seed = async () => {
    try {
        const doc = await categoryModel.findOne({ title: 'general' })
        if(!doc) {
            await categoryModel.create({ title: 'general', slug: 'general' })
        }
        console.log('Seeding finished.')
    }
    catch(err) {
        throw new Error(`Error on seeding: ${err.message}`)
    }
    finally {
        process.exit(0)
    }
}

seed()

