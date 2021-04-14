const mysql = require('mysql');
const inquirer = require('inquirer');
require('dotenv').config();
const cTable = require('console.table');


const connection = mysql.createConnection({
  host: process.env.DB_HOST,

  port: 3306,

  user: process.env.DB_USER,

  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const welcome = () => {

}

const viewOpt = () => {

}

const viewDept = () => {

}

const viewRoles = () => {

}

const viewEmployees = (opt) => {
// switch(opt)
// case "viewByManager"
// default --"viewAll"
}

const addOpt = () => {

}

const addDept = () => {

}

const addRole = () => {

}

const addEmployee = () => {

}

const updateOpt = () => {

}

const updateEmployee = (opt) => {

}

const delOpt = () => {

}

const delDept = () => {

}

const delRole = () => {

}

const delEmployee = () => {

}

const fullName = (first, last) => {
  return `${first} ${last}`
}

connection.connect((err) => {
  if (err) throw err;
  
  welcome();
});