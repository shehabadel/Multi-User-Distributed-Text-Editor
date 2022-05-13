//Importing .env file configurations
//To be able to use .env variables
require("dotenv").config();
const dbConnect = require('./db').connect;
const { Server } = require('socket.io');
const Document = require('./model/Document.model');


//Connecting to the MongoDB database using 
dbConnect()



//TODO Create Publish and subscribe clients for the redis channels




//Setup the server using environment
//variables for port number, and allowing
//CORS in order to allow access from
//The client code to our resources here.
const io = new Server(process.env.PORT, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
})

//default value that is added to the document
//whenever we create a new document to be added
//to the database.
const defaultValue = ""

//Array contains all sockets that establish the connections
//with the server in order to keep track of number of clients
//connected and number of clients disconnected
var allClients = [];

//Creating event listener for connection event
//That is listened to whenever a client establishes
//A connection with the server
io.on("connection", (socket) => {
    allClients.push(socket)

    var username = socket.handshake.query.username
    console.log(`A client is connected! ${username} - Number of sockets is: ${allClients.length}`)
    //TODO: if the client disconnects due to network error block the editing process and show a `RECONNECTING...' popup 

    //Event listener for client's socket disconnect
    //Event that listens to any
    socket.on('disconnect', function (reason) {
        console.log(`${username} got disconnected due to ${reason}`)
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        console.log(`Number of sockets now is: ${allClients.length}`)
    })


    socket.on('get-document', async (documentID) => {
        const document = await lookUpDocument(documentID);
        //TODO subscribe the socket to redis channel using the documentID
        socket.join(documentID);
        socket.emit("load-document", document.data);
        socket.on("send-changes", (delta) => {
            socket.broadcast.to(documentID).emit("receive-changes", delta)
        })

        socket.on("save-document", async (data) => {
            await Document.findByIdAndUpdate(documentID, { data })

        })
        //TODO Group the last 3 minutes of changes into one 'commit'
        socket.on('commit-history', async (data) => {
            //Add the commit history to the database based on current
            //Date for example
        })

    })
})


async function lookUpDocument(id) {
    if (id == null) return

    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
}


