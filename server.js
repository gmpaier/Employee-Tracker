const mysql = require('mysql');
const inquirer = require('inquirer');
require('dotenv').config();

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: process.env.DB_USER,

  // Your password
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});