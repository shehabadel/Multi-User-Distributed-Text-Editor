const { Schema, model } = require("mongoose")
const { UsersSchema } = require("./User.model")

const DocumentSchema = new Schema({
    _id: String,
    data: Object,
    dateCreated: { type: Date, default: Date.now },
    users: [UsersSchema]
})

module.exports = model("Document", DocumentSchema)




//TODO: Add lastUpdatedAt function whenever the document has no active users ??