-- view departments w/o Budget
SELECT * FROM department;

-- view roles (messy)
SELECT * FROM role;

-- view employees (messy)
SELECT * FROM employee;

-- view employees by manager (messy)
SELECT * FROM employee 
WHERE manager_id = ?;

-- view roles (clean)
SELECT role.title as Title, role.salary as Salary, department.name AS Department
FROM role
JOIN department ON role.department_id = department.id;

-- view employees (clean)
SELECT a.first_name AS First, a.last_name AS Last, role.title as Title, role.salary as Salary, CONCAT(b.first_name, " ", b.last_name) AS Manager
FROM employee a
JOIN employee b 
	on a.manager_id = b.id
JOIN role 
	ON a.role_id = role.id;
    
-- view employee by manager (clean)
SELECT employee.first_name AS First, employee.last_name AS Last, role.title as Title, role.salary as Salary
FROM employee
JOIN role 
	ON a.role_id = role.id
WHERE manager_id = ?;

-- add department
INSERT INTO department(name)
VALUE(?);

-- add role
INSERT INTO role(title, salary, department_id)
VALUE(?, ?, ?);

-- add employee
INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUE(?, ?, ?, ?);

-- update employee role
UPDATE employee
SET role_id = ?
WHERE id = ?;

-- update employee manager
UPDATE employee
SET manager_id = ?
WHERE id = ?;

-- delete department (unclean)
DELETE FROM department
WHERE id = ?;

-- delete role (unclean)
DELETE FROM role
WHERE id = ?;

-- delete employee (unclean)
DELETE FROM employee
WHERE id = ?;

-- delete department (clean|sets null)
	-- may conflict with foreign key constraint
DELETE FROM department
WHERE id = ?;

UPDATE role
SET department_id = NULL
WHERE department_id = NULL;

-- delete role (clean|sets null)
	-- may conflict with foreign key constraint
DELETE FROM role
WHERE id = ?;

UPDATE employee
SET role_id = NULL
WHERE role_id = ?;

-- delete department (clean|deletes roles & employees)
DELETE FROM department
WHERE id = ?;

SELECT id FROM role
WHERE department_id = ?;

DELETE FROM role
WHERE department_id = ?;

DELETE FROM employee
WHERE role_id = ?;

-- delete role (clean|deletes employees)
DELETE FROM role
WHERE id = ?;

DELETE FROM employee
WHERE role_id = ?;





