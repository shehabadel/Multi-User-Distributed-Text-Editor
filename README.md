# Multi-User-Distributed-Text-Editor
## Description

The source code for Multi-User-Distributed-Text-Editor. It is a text editor that allows several users to collaborate together in reading, and modifying documents together in a real-time environment. Basically, it is a Google documents clone. The project was made for Distributed Systems (CSE354) course.

## Stack used

| Tech     | Usage                                                                                                                                                                            |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| React.js | Implementing and writing the UI.                                                                                                                                                 |
| Quill.js | Text-Editor component implementing Operational Transformation Algorithm needed for real-time collaboration.                                                                      |
| SocketIO | Web socket Node.js library for writing web socket servers. the main  component in our system.                                                                                    |
| Redis    | In-Memory Data store. We used it in implementing a Publish/Subscribe approach for achieving communication between web socket servers which successfully implemented scalability. |
| MongoDB  | NoSQL Schemaless Database. We used it to store our data in it. Also, used MongoDB replicaSets to achieve Database Replication.                                                   |
| Docker   | Container Engine that runs containers. We used it to run several MongoDB instances to connect them together using Replica Sets.                                                  |

# Installing NodeJS
 Follow [Installation guide](https://nodejs.dev/learn/how-to-install-nodejs)
## Installing required NodeJS packages
> For packages used by server side
```bash
# Terminal in project's root folder
cd server
npm i
```
> For packages used by client side 
```bash
# Terminal in project's root folder
cd client
npm i
``` 
## Connecting to Redis
1. Create an account on [Redis Labs](https://app.redislabs.com/)
2. Retrieve your database `port` number and your credentials.
3. Add the following `.env` environmental variables in the `server` directory
- `process.env.REDIS_PASSWORD` --> Your account authentication password
- `process.env.REDIS_HOST` --> Your database host address
- `process.env.REDIS_PORT` --> Your database port number


## Deploying Frontend and Backend apps on Heroku

1. Create an app for the client code
2. Create an app for the server code
3. Log into heroku cli
4. Change directory to the `client` folder, and follow instructions in the `Deploy` tab.
5. Change directory to the `server` folder, and follow instructions in the `Deploy` tab.
6. Add the server app url in the config vars for the client code. for example,
      ```
      REACT_APP_SERVER : https://dist-ws2.herokuapp.com
      ```

6. For the server the following config vars
- `DB_URL` -> MongoDB ReplicaSet
- `REDIS_HOST` -> Redis lab host
- `REDIS_PASSWORD` -> Redis lab password
- `REDIS_PORT` -> Redis lab port number



## Installing requirements for database
> For Ubuntu(20.04 LTS)
> > Install MongoDB by following the [Installation Guide.](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

> > Install Docker by following [Installation Guide.](https://docs.docker.com/engine/install/ubuntu/)

> > To host MongoDB replicaSet online you can use [DigitalOcean Droplets](https://cloud.digitalocean.com/welcome)

## Dockerize MongoDB

> `sudo docker network create DistN`
- Creates a network called `DistN`


>`sudo docker run -d -p 30001:27017 --net DistN --name db1 mongo:latest --replSet Dist`

- The -d (detach) flag means the container will run in the background, separately to your shell process.
The container external port 30001 is bound back to the internal port of the container 27017 on your host. You???ll be able to connect to your Mongo instance on localhost:30001. If you want to change the port number, modify the first part of the -p flag, such as 9000:27017 to use localhost:9000.

- Bound it to the network we created `DistN`
- Giving the container  a name `db1`
- Creating a replicaSet `Dist`

- Run the second and third containers using the following commands. We'll have to change the external ports and database names

>`sudo docker run -d -p 30002:27017 --net DistN --name db2 mongo:latest --replSet Dist`

>`sudo docker run -d -p 30003:27017 --net DistN --name db3 mongo:latest --replSet Dist`

>In order to create the replicaSet we have to login to the first database in an interactive mode and launch the mongo shell
`sudo docker exec -it db1 mongo`

 - Then create a configuration

>`rsconfig={_id:"Dist",
members:[
{_id:0, host:"Enter your machine public IP:30001"},`

>`{_id:1, host:"Enter your machine public IP:30002"},`

>`{_id:2, host:"Enter your machine public IP:30003"}
]}`

> * Run `rs.initiate(rsconfig)`
* It must be working now!
> Run `rs.status()` to make sure it is working well.

* To connect to the replicaSet either through an app or Using [Mongo Compass](https://www.mongodb.com/try/download/compass), the URI connection string should look something like that 
>"mongodb://**EnterYourMachineIP** : **PortHostingtheReplicaSet**/?replicaSet=**ReplicaSetID**"

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
