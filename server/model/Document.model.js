const { Schema, model } = require("mongoose")

const Document = new Schema({
    _id: String,
    data: Object,
    dateCreated: {type:Date, default:Date.now},
})

module.exports = model("Document", Document)


//TODO: Add lastUpdatedAt function whenever the document has no active users ??