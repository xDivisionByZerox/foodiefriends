const express = require("express")
const mysql = require('mysql');
const path = require("path")
const port = 80;
const app = express();
const bodyParser = require('body-parser');
const { Sequelize } = require("sequelize");
const _ = require("lodash");
const jwt = require('jsonwebtoken');

const aws = require('aws-sdk');
const faker = require('faker');

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


const ProfileModel = {
    
    newProfile: (nickname, gender,birthday,relationship,diet,member_id, callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const insertQuery = `INSERT INTO profile
                           (nickname, gender,birthday,relationship,diet,member_id) 
                           VALUES (?, ?, ?,?,?,?)`;
      const values = [nickname, gender,birthday,relationship,diet,member_id];
  
      connection.query(insertQuery, values, (queryError, results) => {
        // Release the connection back to the pool
        connection.release();
  
        // Forward the callback with the query results or error
        callback(queryError, results);
      });
    });
    },
    ifProfileExist: (member_id, callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const selectQuery = `select * from profile where member_id = ?`;  
      connection.query(selectQuery, member_id, (queryError, results) => {
        // Release the connection back to the pool
        connection.release();
  
        // Forward the callback with the query results or error
        callback(queryError, results);
      });
    });
    },
    CurrentUserProfileAndFilter:(member_id, callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const selectQuery = 
        `SELECT * FROM profile
        INNER JOIN filter ON profile.member_id = filter.member_id
        WHERE profile.member_id = ? `;  
      // connection.query(selectQuery, member_id, callback);
      connection.query(selectQuery, member_id, (queryError, results) => {
        // Release the connection back to the pool
        connection.release();
  
        // Forward the callback with the query results or error
        callback(queryError, results);
      });
    });
    },
    updateProfile: (nickname,relationship,diet,member_id, callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const updateQuery = `UPDATE profile SET nickname = ?, relationship = ?, diet = ? where member_id = ?`;

      const values = [nickname,relationship,diet,member_id];
  
      connection.query(updateQuery, values, (queryError, results) => {
        // Release the connection back to the pool
        connection.release();
  
        // Forward the callback with the query results or error
        callback(queryError, results);
      });
    });
    },
    // FilteringAll:(min,max,gender,diet,relationship,callback) => {
        
    //   const selectQuery = 
    //     `SELECT *
    //     FROM profile
    //     WHERE
    //       TIMESTAMPDIFF(YEAR, birthday, CURDATE()) BETWEEN ? AND ?
    //       AND gender = ?
    //       AND diet = ?
    //       AND relationship = ?
    //     ORDER BY member_id DESC;`;  
    //     const values = [min,max,gender,diet,relationship];

    //   connection.query(selectQuery, values, callback);
    // },


    FilteringAll:(min, max, gender, diet, relationship, callback) => {
      // Acquire a connection from the pool
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
        console.log(connection)
    
        const selectQuery =
          `SELECT *
           FROM profile
           WHERE
             TIMESTAMPDIFF(YEAR, birthday, CURDATE()) BETWEEN ? AND ?
             AND gender = ?
             AND diet = ?
             AND relationship = ?
           ORDER BY member_id DESC;`;
    
        const values = [min, max, gender, diet, relationship];
    
        // Perform the query using the acquired connection
        connection.query(selectQuery, values, (queryError, results) => {
          // Release the connection back to the pool
          connection.release();
    
          // Forward the callback with the query results or error
          callback(queryError, results);
        });
      });
    },

}

module.exports = ProfileModel;