//Importing .env file configurations
//To be able to use .env variables
require("dotenv").config();
const dbConnect = require('./db').connect;
const { Server } = require('socket.io');
const Document = require('./model/Document.model');

const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

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
var redisPub = []
var redisSub = []
/**
 *  host: 'redis-19032.c55.eu-central-1-1.ec2.cloud.redislabs.com',
    port:19032,
    auth:'kyhTF1zQ5VO2Xqj3Ruo62qHgZoMhFLOu'
 */

//Initilizaed Publisher and Subscriber Redis Clients in order
//To subscribe to a single channel so that all websockets servers
//Can be connected to each other using it.
var pubClient = createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
pubClient.on('ready', () => {
    console.log('Publisher connected to redis and ready to use')
})
pubClient.on('error', (err) => console.log('Publisher Client Error', err));

Promise.all([pubClient.connect()]).then(() => {
    redisPub.push(pubClient)
    console.log(`number of publishers is ${redisPub.length}`)
})
//Creating event listener for connection event
//That is listened to whenever a client establishes
//A connection with the server

io.on("connection", (socket) => {

    const subClient = pubClient.duplicate();
    subClient.on('ready', () => {
        console.log('Subscriber connected to redis and ready to use')
    })
    subClient.on('error', (err) => console.log('Subscriber Client Error', err));

    Promise.all([subClient.connect()]).then(() => {
        //Connecting the socket server to the redis channel
        //using Socket.io Redis-Adapter
        console.log(`A Subscriber clients connected ${username}`)
        redisSub.push(subClient);
        console.log(`number of subscribers is ${redisSub.length}`)
    });

    //Whenever a client connects to a server
    //We fetch his username from the handshake.query
    //and log it
    allClients.push(socket)
    var username = socket.handshake.query.username
    console.log(`A client is connected! ${username} - Number of sockets is: ${allClients.length}`)


    //TODO: if the client disconnects due to network error block the editing process and show a `RECONNECTING...' popup

    //Event listener for client's socket disconnect
    //Event that listens to any
    socket.on('disconnect', function (reason) {
        //Unsubscribe from the redis channel
        console.log(`${username} got disconnected due to ${reason}`)
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        console.log(`Number of sockets now is: ${allClients.length}`)
        var subI = redisSub.indexOf(subClient)
        redisSub.splice(subI, 1)
    })


    socket.on('get-document', async (documentID) => {
        try {
            //when receiving as a subscriber pare the data sent by the publisher to return to its form
            await subClient.subscribe(documentID, (message) => {
                const msg = JSON.parse(message)
                console.log(msg.sender)
                console.log(msg.data)
                console.log(username)
                if (socket.id !== msg.sender) {
                    socket.emit('receive-changes', msg.data)
                }
            })
        } catch (error) {
            console.error(error)
        }
        const document = await lookUpDocument(documentID);
        //TODO subscribe the socket to redis channel using the documentID
        socket.join(documentID);
        socket.emit("load-document", document.data); //on load/reload
        socket.on("send-changes", async (delta) => {
            //Change delta to string when publishing
            //socket.to(documentID).emit("receive-changes", delta)
            try {
                const message = {
                    'sender': socket.id,
                    'data': delta
                }
                const sentMsg = JSON.stringify(message)
                await pubClient.publish(documentID, sentMsg)
                console.log(`${username} published`)
            } catch (error) {
                console.error(error)
            }
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


/**
 *  try {
            await io.of('/').adapter.remoteJoin(socket.id, documentID);
            const sockets = await io.in(documentID).allSockets();
            console.log(`sockets in ${documentID} are: `)
            console.log(sockets)

            const rooms = await io.of('/').adapter.allRooms();
            console.log(`Rooms are : `)
            console.log(rooms)
          } catch (e) {
            // the socket was not found
          }

 */