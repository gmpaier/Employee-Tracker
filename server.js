"use strict";
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
  inquirer
  .prompt({
    name: 'route',
    type: 'list',
    message: 'What would you like to do?',
    choices: ['VIEW', 'ADD', 'UPDATE', 'DELETE', 'EXIT'],
  })
  .then((answer) => {
    switch(answer.route){
      case 'VIEW':
        return viewOpt();
      case 'ADD':
        return addOpt();
      case 'UPDATE':
        return updateOpt();
      case 'DELETE':
        return delOpt();
      case 'EXIT':
        console.log("Goodbye");
        connection.end();
    }
  });
}

const viewOpt = () => {
  inquirer
  .prompt({
    name: 'route',
    type: 'list',
    message: 'What would you like to view?',
    choices: ['VIEW DEPARTMENT', 'VIEW ROLES', 'VIEW EMPLOYEES', 'BACK'],
  })
  .then((answer) => {
    switch(answer.route){
      case 'VIEW DEPARTMENT':
        return viewDept();
      case 'VIEW ROLES':
        return viewRoles();
      case 'VIEW EMPLOYEES':
        return viewEmployees();
      case 'BACK':
        return welcome();
    }
  });
}

const viewDept = () => {
  connection.query('SELECT * FROM department;', (err, results) => {
    if (err) throw err;
    console.table(results);
    welcome();
  })
}

const viewRoles = () => {
  connection.query('SELECT role.title as Title, role.salary as Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id;', (err, results) => {
    if (err) throw err;
    console.table(results);
    welcome();
  })
}

const viewEmployees = (opt) => {
  connection.query('SELECT a.id, a.first_name AS First, a.last_name AS Last, role.title as Title, role.salary as Salary, CONCAT(b.first_name, " ", b.last_name) AS Manager FROM employee a JOIN employee b on a.manager_id = b.id JOIN role ON a.role_id = role.id;', (err, results) => {
    if (err) throw err;
    console.table(results);
    welcome();
  })
}


const addOpt = () => {
  inquirer
  .prompt({
    name: 'route',
    type: 'list',
    message: 'What would you like to add?',
    choices: ['ADD NEW DEPARTMENT', 'ADD NEW ROLE', 'ADD NEW EMPLOYEE', 'BACK'],
  })
  .then((answer) => {
    switch(answer.route){
      case 'ADD NEW DEPARTMENT':
        return addDept();
      case 'ADD NEW ROLE':
        return addRole();
      case 'ADD NEW EMPLOYEE':
        return addEmployee();
      case 'BACK':
        return welcome();
    }
  });
}

const addDept = () => {
  inquirer
  .prompt({
    name: 'name',
    message: 'What is the name of your new department?' 
  })
  .then((answer) => {
    connection.query('INSERT INTO department SET ?',
    {
      name: answer.name
    },
    (err) => {
      if (err) throw err;
      console.log(`${answer.name} added to departments.`);
      viewDept();
    }
    )
  })
}

const addRole = () => {
  connection.query('SELECT * FROM deparment', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'title',
        message: 'What is the name of your new role?' 
      },
      {
        name: 'salary',
        message: 'What is the salary amount for this role?',
        validate(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        type: "list",
        name: 'department',
        message: 'Which department does this role belong to?',
        choices(){
          const choiceArray = [];
          results.forEach(({name}) => {
            choiceArray.push(name);
          });
          return choiceArray;
        },
      }
    ]).then((answer) => { 
      connection.query(`SELECT id FROM department WHERE name = ${answer.list}`, (err, results) => {
        if (err) throw err;
        console.log(results)
        connection.query('INSERT INTO role SET ?', 
        {
          title: answer.title,
          salary: answer.salary,
          department_id: results[0].id
        },
        (error) => {
          if (error) throw err;
          console.log(`${answer.title} successfully added to roles.`)
          viewRoles();
        });
      });
    });
  });
}

const addEmployee = () => {
  connection.query('SELECT title FROM role', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'first',
        message: "What is your new employee's first name?"
      },
      {
        name: 'last',
        message: "What is your new employee's last name?"
      },
      {
        type: 'list',
        name: "role",
        message: "Which role will this employee take?",
        choices(){
          const choiceArray = [];
          results.forEach(({title}) => {
            choiceArray.push(title);
          });
          return choiceArray;
        },
      }
    ])
  })
}

const updateOpt = () => {
  connection.query('SELECT CONCAT("first_name"," ","last_name") AS Name FROM employee', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'route',
        type: 'list',
        message: 'What would you like to update?',
        choices: ['UPDATE EMPLOYEE ROLE', 'UPDATE EMPLOYEE MANAGER', 'BACK'],
      },

    ])
    .then((answer) => {
      switch(answer.route){
        case 'UPDATE EMPLOYEE ROLE':
          return updateEmployee("role");
        case 'UPDATE EMPLOYEE MANAGER':
          return updateEmployee("man");
        case 'BACK':
          return welcome();
      }
    });
  });
}

const updateEmployee = (opt) => {
  switch(opt){
    case "role":
      return connection.query('SELECT title FROM role', (err, results) => {})
    case "man":
  }

}

const delOpt = () => {
  inquirer
  .prompt({
    name: 'route',
    type: 'list',
    message: 'What would you like to delete?',
    choices: ['DELETE DEPARTMENT', 'DELETE ROLE', 'DELETE EMPLOYEE', 'BACK'],
  })
  .then((answer) => {
    switch(answer.route){
      case 'DELETE DEPARTMENT':
        return addDept();
      case 'DELETE ROLE':
        return addRole();
      case 'DELETE EMPLOYEE':
        return addEmployee();
      case 'BACK':
        return welcome();
    }
  });
}

const delDept = () => {

}

const delRole = () => {

}

const delEmployee = () => {

}

connection.connect((err) => {
  if (err) throw err;
  console.log("Welcome to the Employee Tracker program. \n")
  welcome();
});