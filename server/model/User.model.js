const { Schema, model } = require("mongoose")


const UsersSchema= new Schema({
    name: String
})

module.exports.UsersSchema=UsersSchema
