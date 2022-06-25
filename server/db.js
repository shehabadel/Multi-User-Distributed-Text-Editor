const mongoose = require('mongoose')

const connect = async () => {
    //Replace the database URI with process.env.DB_URL
    //Which must be the MongoDB replicaSet URI
    //const dbURL = `mongodb://${process.env.DB1},${process.env.DB2},${process.env.DB3}?replicaSet=Dist`
    const dbURL= process.env.DB_URL
    try {
        mongoose.connect(dbURL)
        console.log(`Connected to database successfully ${dbURL}`)
    } catch (e) {
        console.log(e)
    }
}

module.exports.connect = connect
