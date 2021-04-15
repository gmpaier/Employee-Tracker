INSERT INTO department (name)
VALUES ("Sales"), ("Operations"), ("Finance"), ("HR"), ("IT");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Rep", 50000, 1), ("Head of Sales", 100000, 1), ("Operation Rep", 60000, 2), ("COO", 120000, 2), ("Budget Analyst", 80000, 3), ("CFO", 200000, 3), ("HR Rep", 55000, 4), ("Director of HR", 95000, 4), ("Engineer", 65000, 5), ("CTO", 150000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES("John", "Doe", 2, null), ("Sally", "Price", 6, null), ("Harold", "Schultz", 4, null), ("Kenneth", "Loggins", 8, null), ("Steve", "Jobs", 10, null), ("Eric", "Hart", 1, 1), ("Eric", "Andre", 9, 5), ("Lana", "Black", 7, 4), ("Laura", "Bowmen", 3, 3), ("Jane", "Carter", 5, 2), ("Danny", "Brown", 9, 5), ("Richard", "Priest", 1, 1), ("Walter", "Payton", 3, 3), ("Michael", "McDonald", 7, 4), ("Griffin", "Peters", 5, 2);
