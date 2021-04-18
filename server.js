const mysql = require('mysql');
const inquirer = require('inquirer');
require('dotenv').config();
const cTable = require('console.table');

  //creates connection to mysql database via .env parameters; please set up the .env for your local computer if you wish to use this program
const connection = mysql.createConnection({
  host: process.env.DB_HOST,

  port: 3306,

  user: process.env.DB_USER,

  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

  //"main menu" for program, navigates to view, add, update, and delete option functions
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

  //view options - navigates to view department, roles, or employees functions
const viewOpt = () => {
  inquirer
  .prompt({
    name: 'route',
    type: 'list',
    message: 'What would you like to view?',
    choices: ['VIEW DEPARTMENT', 'VIEW ROLES', 'VIEW EMPLOYEES', 'VIEW EMPLOYEES BY MANAGER','BACK'],
  })
  .then((answer) => {
    switch(answer.route){
      case 'VIEW DEPARTMENT':
        return viewDept();
      case 'VIEW ROLES':
        return viewRoles();
      case 'VIEW EMPLOYEES':
        return viewEmployees();
      case 'VIEW EMPLOYEES BY MANAGER':
        return viewEmployees("byMan");
      case 'BACK':
        return welcome();
    }
  });
}

  //displays all departments to user
const viewDept = () => {
  connection.query('SELECT department.name as Department, CONCAT("$", SUM(IFNULL(role.salary, 0))) as Budget, COUNT(employee.id) as "Employee Count" FROM department LEFT JOIN role ON role.department_id = department.id LEFT JOIN employee ON employee.role_id = role.id GROUP BY Department;', (err, results) => {
    if (err) throw err;
    console.table(results);
    welcome();
  })
}
  
  //displays all roles to user
const viewRoles = () => {
  connection.query('SELECT role.title as Role, CONCAT("$", role.salary) as Salary, department.name AS Department FROM role JOIN department ON role.department_id = department.id;', (err, results) => {
    if (err) throw err;
    console.table(results);
    welcome();
  })
}

  //by default: displays all employees to user. opt parameter allows for view employees by manager
const viewEmployees = (opt) => {
  switch(opt){
    case "byMan":
      return connection.query('SELECT id, CONCAT(employee.first_name, " ", employee.last_name) as manager FROM employee WHERE id = ANY (SELECT manager_id FROM employee);',  (err, results) => {
       if (err) throw err;
       inquirer
       .prompt({
         name: 'choice',
         type: 'rawlist',
         choices() {
           const choiceArray = [];
           results.forEach(({manager}) => {
           choiceArray.push(manager);
         });
               return choiceArray;
             },
             message: 'Whose employees would you like to see?',
           },
       ).then((answer) => {
         let choiceId;
         results.forEach((employee) => { 
          if(answer.choice === employee.manager){
             choiceId = employee.id;
           }
         });
         connection.query(`SELECT employee.first_name as First, employee.last_name, role.title as Role, department.name as Department, CONCAT("$", role.salary) as Salary FROM employee JOIN role on employee.role_id = role.id JOIN Department ON role.department_id = department.id WHERE employee.manager_id = ${choiceId}`, (err, results) => {
           if (err) throw err;
           console.table(results);
           welcome();
         })
       });
      });
    default: 
      connection.query('SELECT a.first_name AS First, a.last_name AS Last, role.title as Role, department.name as Department, CONCAT("$", role.salary) as Salary, CONCAT(b.first_name, " ", b.last_name) AS Manager FROM employee a LEFT JOIN employee b ON a.manager_id = b.id JOIN role ON a.role_id = role.id JOIN Department ON role.department_id = department.id;', (err, results) => {
        if (err) throw err;
        console.table(results);
        welcome();
      });
  }
}

  //add options - navigates to add department, role, or employee functions
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

  //queries the user for department info and creates a new department
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

  //queries the user for role info and creates a new role
const addRole = () => {
  connection.query('SELECT * FROM department', (err, results) => {
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
      let choiceId;
      results.forEach((dept) => {
        if(dept.name === answer.department){
          choiceId = dept.id;
        }
      })
      connection.query('INSERT INTO role SET ?', 
      {
        title: answer.title,
        salary: answer.salary,
        department_id: choiceId
      },
      (error) => {
        if (error) throw err;
        console.log(`${answer.title} successfully added to roles.`)
        viewRoles();
      });
    })
  })
}

  //queries the user for employee info and creates a new employee
const addEmployee = () => {
  connection.query('SELECT * FROM role', (err, resRole) => {
    if (err) throw err;
    connection.query('SELECT *, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, resName) => {
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
        type: 'rawlist',
        name: "role",
        message: "Which role will this employee take?",
        choices(){
          const choiceArray = [];
          resRole.forEach(({title}) => {
            choiceArray.push(title);
          });
          return choiceArray;
        },
      },
      {
        type: 'rawlist',
        name: "man",
        message: "Who is this employee's manager?",
        choices(){
          const choiceArray = ["Do not set a Manager."];
          resName.forEach(({name}) => {
            choiceArray.push(name);
          });
          return choiceArray;
        }
      }
    ]).then((answer) => {
      let choiceRole;
      let choiceMan = {id: null};
      resRole.forEach((role) => {
        if(role.title === answer.role){
          choiceRole = role;
        }
      });
      resName.forEach((employee) => {
        if(employee.name === answer.man){
          choiceMan = employee;
        }
      })
      connection.query('INSERT INTO employee SET ?', 
      {
        first_name: answer.first,
        last_name: answer.last,
        role_id: choiceRole.id,
        manager_id: choiceMan.id
      },
      (err) => {
        if (err) throw err;
        console.log(`${answer.first} ${answer.last} successfully added to employees.`)
        viewEmployees();
      });
    })
    })
  });
}

  //update options - ask user to select an employee to update and to choose either update role or manager. triggers update employee
const updateOpt = () => {
  connection.query('SELECT *, CONCAT(first_name," ",last_name) AS name FROM employee', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'route',
        type: 'list',
        message: 'What would you like to update?',
        choices: ['UPDATE EMPLOYEE ROLE', 'UPDATE EMPLOYEE MANAGER', 'BACK'],
      },
      {
        name: 'employee',
        type: 'rawlist',
        message: "Which employee would you like to update?",
        choices(){
          const choiceArray = [];
          results.forEach(({name}) => {
          choiceArray.push(name);
        });
              return choiceArray;
            },
      }
    ])
    .then((answer) => {
      let chosenEmployee;
      results.forEach((employee) =>{
        if (employee.name === answer.employee){
          chosenEmployee = employee;
        }
      })
      switch(answer.route){
        case 'UPDATE EMPLOYEE ROLE':
          return updateEmployee("role", chosenEmployee);
        case 'UPDATE EMPLOYEE MANAGER':
          return updateEmployee("man", chosenEmployee);
        case 'BACK':
          return welcome();
      }
    });
  });
}

  //updates either employee manager or role based on opt parameter 
const updateEmployee = (opt, employee) => {
  switch(opt){
    case "role":
      return connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt({
          name: "role",
          type: "rawlist",
          message: "Which role would you like to assign this employee?",
          choices(){
            const choiceArray = [];
            results.forEach(({title, id}) => {
              if (id !== employee.role_id){
                choiceArray.push(title);
              };
            });
            return choiceArray;
          },
        }).then((answer) => {
          let choiceRole;
          results.forEach((role) => {
            if(answer.role === role.title){
              choiceRole = role;
            }
          })
          connection.query('UPDATE employee SET ? WHERE ?', 
          [{
            role_id: choiceRole.id
          },
          {
            id: employee.id
          }])
          viewEmployees();
        }) 
      })
    case "man":
      return connection.query('SELECT *, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt({
          name: "man",
          type: "rawlist",
          message: `Which employee would you like to assign ${employee.name} as a manager?`,
          choices(){
            const choiceArray = [];
            results.forEach(({name, id}) => {
              if (id !== employee.manager_id && id !== employee.id){
                choiceArray.push(name);
              };
            });
            return choiceArray;
          },
        }).then((answer) => {
          let choiceMan;
          results.forEach((employee) => {
            if(answer.man === employee.name){
              choiceMan = employee;
            }
          })
          connection.query('UPDATE employee SET ? WHERE ?', 
          [{
            manager_id: choiceMan.id
          },
          {
            id: employee.id
          }])
          viewEmployees();
        }) 
      })
  }
}

  //delete options - navigates to delete department, role, and employee functions
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
        return delDept();
      case 'DELETE ROLE':
        return delRole();
      case 'DELETE EMPLOYEE':
        return delEmployee();
      case 'BACK':
        return welcome();
    }
  });
}

  //deletes a department, along with all roles and employees within said department. resets employees' manager to null if manager deleted.
const delDept = () => {
  connection.query('SELECT * FROM department', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'department',
        type: 'rawlist',
        message: "Which department would you like to delete?",
        choices(){
          const choiceArray = [];
          results.forEach(({name}) => {
            choiceArray.push(name);
          });
          return choiceArray;
        }
      },
      {
        name: 'confirm',
        type: 'list',
        message: "Deleting a department will delete all employees and roles within the chosen department; would you like to continue?",
        choices: ["YES", "NO"]
      },
    ]).then((answer) => {
      switch(answer.confirm){
        case "NO":
          return welcome();
        default:
          let choiceDept;
          results.forEach((dept) => {
            if (dept.name === answer.department){
              choiceDept = dept;
            }
          })
          connection.query('UPDATE employee SET ? WHERE manager_id IN (SELECT myid FROM (SELECT id as myid from employee WHERE role_id = ANY (SELECT id FROM role WHERE ?)) as b)',[
            {
              manager_id: null
            },
            {
              department_id: choiceDept.id
            }
          ], (err) => {
            if (err) throw err;
            connection.query('DELETE FROM employee WHERE role_id = ANY (SELECT id FROM role WHERE ?)',
            {
              department_id: choiceDept.id
            }, (err) => {
              if (err) throw err;
              connection.query('DELETE FROM role WHERE ?', 
              {
                department_id: choiceDept.id
              }, (err) => {
                if (err) throw err;
                connection.query('DELETE FROM department WHERE ?', 
                {
                  id: choiceDept.id
                }, (err) => {
                  if (err) throw err;
                  console.log(`${choiceDept.name} successfully deleted from departments.`);
                  viewDept();
                })
              })
            })
          })
      }
    })
  })
}

  //deletes a role, along with all employees with said role. resets employees' manager to null if manager deleted.
const delRole = () => {
  connection.query('SELECT * FROM role', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'role',
        type: 'rawlist',
        message: "Which role would you like to delete?",
        choices(){
          const choiceArray = [];
          results.forEach(({title}) => {
            choiceArray.push(title);
          });
          return choiceArray;
        },
      },
      {
        name: 'confirm',
        type: 'list',
        message: "Deleting a role will delete all employees with the chosen role; would you like to continue?",
        choices: ["YES", "NO"]
      }
    ]).then((answer) => {
      switch(answer.confirm){
        case "NO":
          return welcome();
        default:
          let choiceRole;
          results.forEach((role) => {
            if (role.title === answer.role){
              choiceRole = role;
            }
          })
          connection.query('UPDATE employee SET ? WHERE manager_id IN (SELECT myid FROM(SELECT id AS myid FROM employee WHERE ?) as b)',[
            {
              manager_id: null
            },
            {
              role_id: choiceRole.id
            }], (err) => {
              if (err) throw err;
            connection.query('DELETE FROM employee WHERE ?', 
            {
              role_id: choiceRole.id
            }, (err) => {
              if (err) throw err;
              connection.query('DELETE FROM role WHERE ?',
              {
                id: choiceRole.id
              }, (err) => {
                if (err) throw err;
                console.log(`Role of ${choiceRole.title} deleted successfully.`);
                viewRoles();
              })
            })
          })
      }
    })
  })
}
  //deletees an employee. resets employees' manager to null if manager deleted.
const delEmployee = () => {
  connection.query('SELECT *, CONCAT(first_name, " ", last_name) as name FROM employee', (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: 'employee',
        type: 'rawlist',
        message: 'Which employee would you like to delete?',
        choices(){
          const choiceArray = [];
          results.forEach(({name}) => {
            choiceArray.push(name);
          });
          return choiceArray;
        },
      },
      {
        name: 'confirm',
        type: 'list',
        message: "Are you sure you'd like to delete this employee?",
        choices: ["YES", "NO"]
      }
    ]).then((answer) => {
      switch(answer.confirm){
        case "NO":
          return welcome();
        default:
          let chosenEmployee;
          results.forEach((employee) => {
            if (employee.name === answer.employee){
              chosenEmployee = employee;
            }})
          connection.query('UPDATE employee SET ? WHERE ?', [
            {
              manager_id: null
            },
            {
              manager_id: chosenEmployee.id
            }
          ], 
          (err) => {
            if (err) throw err;
            connection.query('DELETE FROM employee WHERE ?', 
              {
                id: chosenEmployee.id
              },
              (err) => {
                if (err) throw err;
                console.log(`${chosenEmployee.name} successfully deleted from database.`);
                viewEmployees();
              })
          })
      }
    })
  })
}

  //Connection to server, triggers welcome function 
connection.connect((err) => {
  if (err) throw err;
  console.log("\n Welcome to the Employee Tracker program.")
  welcome();
});