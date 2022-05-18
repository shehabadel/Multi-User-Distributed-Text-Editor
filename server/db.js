const mongoose = require('mongoose')

const connect = () => {
    //Replace the database URI with process.env.DB_URL
    //Which must be the MongoDB replicaSet URI
    const dbURL = process.env.DB_URL
    mongoose.connect(dbURL)
    console.log(`Connected to database successfully ${dbURL}`)
}

module.exports.connect = connect
