const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 80;
const mysql = require('mysql');
const util = require('util');

const http = require('http');
var socketio = require('socket.io')
const cors = require('cors'); // Import the cors middleware


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sharon616",
    database: 'foodiefriend',
    port: 3306, // MySQL default port
    insecureAuth: true,
  });
  
const query = util.promisify(connection.query).bind(connection);


var server = http.createServer();
// var io = socketio(server);
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:4040",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});
let relationships = []
let UserA
let UserB
// Socket.io connection event
function initializeSocket(){
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



// Inside the 'like' event on the server
socket.on('like', async(likedUserId) => {
  UserB = likedUserId

  let pairArr=await getPair()
  console.log("Pairs in DB: ",pairArr)
  let relationships =await repair()

 let mutualLike =await check(pairArr,relationships)
 console.log("Pair results: ",mutualLike)
  if (mutualLike) {
    
    // Notify both users
    socket.emit('notification', `You have a new match with ${likedUserId}!`);
    console.log("被liked的: ",likedUserId)
    io.to(connectedUsers[likedUserId]).emit('notification',  `You have a new match with ${UserA}!`);
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
    throw error; // Re-throw the error for handling elsewhere if needed
  }
}

//生成要比對的pair和將pari放入db
async function repair(){
  if(UserA!=null&&UserB!=null){
    relationships.push([UserA,UserB])
    console.log("The relationship pair is: ",relationships[0])
    const insertQuery = `INSERT INTO pairs(UserA,UserB)values(?,?);`
    const values = [UserA, UserB];
    connection.query(insertQuery, values);   
    return  relationships
  }
}


  async function check(pairArr,relationships){
    if(relationships!=null&&pairArr!=null){
      console.log(relationships,"++++++")
      console.log("++++++")

      console.log(pairArr,"++++++")

      let pairResult = pairArr.some((aPair)=>aPair[0]===relationships[0][1]&&aPair[1]===relationships[0][0])
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

}
module.exports = initializeSocket;