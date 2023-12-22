// const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 80;
const mysql = require('mysql');
const util = require('util');

// const http = require('http');
var socketio = require('socket.io')
const cors = require('cors'); // Import the cors middleware

// const app = express();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = new Server(server,{
//   cors: {
//       origin: "http://13.55.201.157:4040",
//       methods: ["GET", "POST"],
//       transports: ['websocket', 'polling'],
//       credentials: true
//   },
//   allowEIO3: true
// });



const aws = require('aws-sdk');


require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const awsID = process.env.AWS_KEY_ID;
const awsKEY = process.env.AWS_SECRET_KEY;
const awsRegion = process.env.AWS_REGION;

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const connection = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: 'foodiefriend',
  port: 3306, // MySQL default port
});

const query = util.promisify(connection.query).bind(connection);

// // var server = http.createServer();
const io = require('socket.io')(server, {
  cors: {
      origin: "https://foodiefriends.online",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});
// const io = require('socket.io')(server, {
//   cors: {
//       origin: "http://localhost",
//       methods: ["GET", "POST"],
//       transports: ['websocket', 'polling'],
//       credentials: true
//   },
//   allowEIO3: true
// });





// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:80'); // Change to your frontend origin
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//   next();
// });


app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views', 'index.ejs'));
});


  // app.get('/', (req, res) => {
  //   res.render(path.join(__dirname, 'views', 'index.ejs'));
  // });
app.get('/profile', (req, res) => {
    res.render(path.join(__dirname, 'views', 'profile.ejs'));
  });

  app.get('/match', (req, res) => {
    res.render(path.join(__dirname, 'views', 'matches.ejs'));
  });
  app.get('/member', (req, res) => {
    res.render(path.join(__dirname, 'views', 'member.ejs'));
  });

  app.get('/my-matches', (req, res) => {
    res.render(path.join(__dirname, 'views', 'my-matches.ejs'));
  });
app.get('/api/getApiKey', (req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

app.get('/api/getUnsplashApiKey', (req, res) => {
  res.json({ apiKey: process.env.UNSPLASH_API_KEY });
});

app.get('/getPlaceDetails/:placeId', async (req, res) => {
  const placeId = req.params.placeId;
  const gMapKey = process.env.GOOGLE_MAPS_API_KEY;
  const detailsUrl = `https://mas.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${gMapKey}`;
  console.log(detailsUrl)
  try {
    const response = await fetch(detailsUrl);
    const detailsData = await response.json();
    res.json(detailsData);
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Routes
const userRoute = require('./routes/user');
const { Console } = require('console');
app.use(userRoute);

const connectedUsers = {};
let relationships = []
let UserA
let UserB
// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected with default socket ID:', socket.id);

  // Listen for the 'setUserId' event
  socket.on('setUserId', (userId) => {
    // Set a custom user ID and associate it with the socket ID
    socket.userId = userId;
    UserA = userId
    console.log("現在的user是: ",UserA)
    connectedUsers[userId] = socket.id;
    console.log(connectedUsers)
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

socket.on('like', async(likedUserId) => {
  UserB = likedUserId
  console.log(UserA," like ",UserB)
  let pairArr=await getPair()
  console.log("Pairs in DB: ",pairArr)
  let relationships =await repair()

 let mutualLike =await check(pairArr,relationships)
 relationships = []
 console.log("Pair results: ",mutualLike)
  if (mutualLike) {
    
    // Notify both users
    socket.emit('notification', `You have a new match with ${likedUserId}!`);
    console.log("被liked的: ",likedUserId)
    console.log("SEND like to: ",likedUserId,connectedUsers[likedUserId])

    if(likedUserId in connectedUsers){
      io.to(connectedUsers[likedUserId]).emit('notification',  `You have a new match with ${UserA}!`);
    }

    
  }

});

//從db撈出配對
async function getPair() {
  try {
    const pairArr = [];
    const selectQuery = `SELECT * FROM pairs;`;

    // Wrap the connection.query in a Promise
    const results = await new Promise((resolve, reject) => {
      connection.query(selectQuery, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    results.forEach((element) => {
      pairArr.push([element.UserA, element.UserB]);
    });

    return pairArr;
  } catch (error) {
    console.error('Error in getPair:', error.message);
    throw error; 
  }
}

//生成要比對的pair和將pari放入db
async function repair(){
  if(UserA!=null&&UserB!=null){
    relationships.push([UserA,UserB])
    console.log("The relationship pair is: ",relationships[relationships.length-1])
    console.log("The relationship pair is: ",relationships)

    const insertQuery = `INSERT INTO pairs(UserA,UserB)values(?,?);`
    const values = [UserA, UserB];
    connection.query(insertQuery, values);   
    return  relationships
  }
}


  async function check(pairArr,relationships){
    if(relationships!=null&&pairArr!=null){
      let pairResult = pairArr.some((aPair)=>aPair[0]===relationships[relationships.length-1][1]&&aPair[1]===relationships[relationships.length-1][0])
      return pairResult
  }else{
    return false
  }

  }

  // Listen for user disconnection
  socket.on('disconnect', () => {
    
    console.log('User disconnected');
  });

  function checkMutualLike() {

    let results
    const selectQuery = `SELECT * FROM pairs;`
    connection.query(selectQuery,(err,res)=>{
      results = res

    });
    return results
  }
  
});

server.listen(port, () => {
  console.log(`Server is running on port 80`);
});


