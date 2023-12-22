const express = require("express");
const mysql = require('mysql');
const path = require("path");
const port = 80;
const app = express();
const bodyParser = require('body-parser');
const _ = require("lodash");
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');

require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const awsID = process.env.AWS_KEY_ID;
const awsKEY = process.env.AWS_SECRET_KEY;
const awsRegion = process.env.AWS_REGION;


// Create a connection pool
const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: 'foodiefriend',
  port: 3306, // MySQL default port
  insecureAuth: true,
  connectionLimit: 10, // Adjust based on your needs
});


// Configure AWS SDK
aws.config.update({
  accessKeyId: awsID,
  secretAccessKey:awsKEY,
  region:awsRegion
});

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL!');
// });



const UserModel = {

  newUser: (email, password, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = `INSERT INTO member (email, password) VALUES (?, ?)`;
      const values = [email, password];

    // connection.query(selectQuery, member_id, callback);
    connection.query(insertQuery, values, (queryError, results) => {
      // Release the connection back to the pool
      connection.release();

      // Forward the callback with the query results or error
      callback(queryError, results);
    });
  });
  },
  ifUserExist:(email, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM member WHERE email = ? ;`
      connection.query(selectQuery,email, (queryError, results) => {
      // Release the connection back to the pool
      connection.release();

      // Forward the callback with the query results or error
      callback(queryError, results);
    });
  });
  },


  findByEmailAndPassword: (email, password, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM member WHERE email = ? AND password = ?`;
      const values = [email, password];
  
      connection.query(selectQuery, values, (queryError, results) => {
      // Release the connection back to the pool
      connection.release();

      // Forward the callback with the query results or error
      callback(queryError, results);
    });
  });
  },
  
};

module.exports = UserModel;
