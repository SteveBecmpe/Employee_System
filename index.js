// const express = require('express');
// const app = express();
const inquirer = require("inquirer");
const fs = require('fs');

// const { inherits } = require("util");
const mysql = require('mysql');
const cTable = require('console.table');

const mysqlpw = process.env.MySQL_Password;

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: mysqlpw,
    database: 'employee_system_db',
});



function addEmployee() {
    console.clear();
    //Get all Roles
    const roleArr = [];
    const roleList = [];
    const roleGet = 'SELECT * FROM role';
    connection.query(roleGet, function (err, res) {
        if (err) throw err;
        if (res.lenght === 0) {
        } else {
            const roleLength = res.length;
            for (i = 0; i < roleLength; i++) {
                roleArr.push({ roleID: res[i].id, roleName: res[i].title });
                roleList.push(res[i].title);

            }
            console.log(roleArr);
            // console.log(roleList);
            // console.table(res);
            // init();
        }

        //Get All Departments
        const managerArr = [];
        const managerList = [];
        const managerGet = 'SELECT * FROM employee WHERE employee.manager_id is NULL';
        connection.query(managerGet, function (err, res) {
            if (err) throw err;
            if (res.lenght === 0) {

            } else {
                const manLength = res.length;
                for (i = 0; i < manLength; i++) {
                    managerArr.push({ manID: res[i].id, firstName: res[i].first_name, lastName: res[i].last_name });
                    managerList.push(res[i].first_name + ' ' + res[i].last_name);
                }
                // console.log(managerArr);
                // console.table(res);
                // init();
            }

            const EmployeeQuestions = [
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'What is the employees first name?',
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'What is the employees last name?',
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the employees role?',
                    choices: roleArr
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is the employees manager?',
                    choices: managerArr
                },


            ];
            // console.log(roleList);
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: 'What is the employees first name?',
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: 'What is the employees last name?',
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is the employees role?',
                        choices: roleList
                    },
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Who is the employees manager?',
                        choices: managerList
                    },


                ])//EmployeeQuestions)

                .then((data) => {
                    // console.log("data");
                    // console.log(data);
                    let tempRoleId = 0;
                    // console.log(roleArr.length);
                    for (i = 0; i < roleArr.length; i++) {
                        // console.log(roleArr[i].roleName);
                        // console.log(data.role);
                        if (roleArr[i].roleName === data.role) {
                            tempRoleId = roleArr[i].roleID;
                        }
                    }
                    let tempManId = 0;
                    let tempName = '';
                    // console.log(managerArr.length);
                    for (i = 0; i < managerArr.length; i++) {
                        tempName = managerArr[i].firstName;
                        tempName += ' ';
                        tempName += managerArr[i].lastName;
                        // console.log(tempName);
                        if (tempName === data.manager) {
                            tempManId = managerArr[i].manID;
                        }
                    }

                    const empVal = {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        role_id: tempRoleId,
                        manager_id: tempManId
                    };

                    // console.log(empVal);

                    const employeePOST = 'INSERT INTO employee SET ?';
                    connection.query(employeePOST, 
                        empVal, function (err, res) {
                        if (err) throw err;
                        init();
                    })
                    //INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("Steve", "Black", 1 , NULL);


                    // const empVar = 'first_name, last_name, role_id, manager_id';

                    // const employeePut = 'INSERT INTO employee ? VALUES ?';
                    // empVar, empVal,
                    // connection.query(employeePut, function (err, res) {
                    //     if (err) throw err;
                    //     console.table(res);
                    //     init();
                    // })
                    //INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("Steve", "Black", 1 , NULL);
                })
        });
    });
}
//      function addEmployee() {
//     inquirer
//         .prompt(EmployeeQuestions)
//         .then((data) => {
//      parse out data appropriotly
//      data.name == first_name
//      const url = "INSERT INTO <table> (col1, col2, col3) VALUE (?, ?, ?)" 
//      "UPDATE employee SET manager_id = ? WHERE id = ?;"   
//      connection.query(departGet, [val1, val2, val3], function (err, res) {
//     if (err) throw err;
//     console.table(res);
//     init();
// })
//         }
// };

const MenuQuestions = [
    {
        type: 'list',
        message: 'CMS Employee Management System: What would you like to do next',
        name: 'choice',
        choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager',
            'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager', 'Add Role', 'Add Department',
            'View All Employees', 'View All Departments', 'View All Roles', 'Exit']
    }
];

function veiwAllDepartments() {
    console.clear();
    const departGet = 'SELECT department.department_name AS Department FROM department';

    connection.query(departGet, function (err, res) {
        if (err) throw err;
        console.table(res);
        init();
    })

};

function viewAllEmployees() {
    console.clear();
    // const allEmployeeGet = 'SELECT department.department_name AS Department FROM department';

    const allEmployeeGet = 'SELECT employee.id, employee.first_name, employee.last_name, title, department_name AS Department, salary, CONCAT(e.first_name, " ", e.last_name) AS Manager FROM employee LEFT JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS e ON employee.manager_id = e.id';

    connection.query(allEmployeeGet, function (err, res) {
        if (err) throw err;
        console.table(res);
        init();
    })

};


function viewAllRoles() {
    console.clear();
    // const departGet = 'SELECT * FROM role';
    const departGet = 'SELECT role.title, role.salary, department.department_name AS Department FROM role LEFT JOIN department ON role.department_id = department.id';

    connection.query(departGet, function (err, res) {
        if (err) throw err;
        console.table(res);
        init();
    })

};

function init() {
    // console.clear();
    // console.log(teamMembers);
    inquirer
        .prompt(MenuQuestions)

        .then((data) => {
            // console.log(data);
            // console.log(data.choice);

            switch (data.choice) {
                case 'Add Employee':
                    // console.log("Yeah add a manager");
                    addEmployee();//(data.id)
                    break;
                case 'Add Role':
                    // console.log("Yeah add a engineer ");
                    addRole();//(data.id)
                    break;
                case 'Add Department':
                    // console.log("Yeah add a intern");
                    addDepartment();
                    break;
                case 'View All Employees':
                    // console.log("Yeah add a intern");
                    viewAllEmployees();
                    break;
                case 'View All Departments':
                    // console.log("Yeah add a intern");
                    veiwAllDepartments();
                    break;
                case 'View All Roles':
                    // console.log("Yeah add a intern");
                    viewAllRoles();
                    break;
                case 'Exit':
                    connection.end();
                    // console.log("Yeah finish");
                    // fs.writeFile('./distributeRelease/index.html', generateHtmlContent(teamMembers), (err) =>
                    //     err ? console.error(err) : console.log('Team HTML File Generated!'));
                    break;
                default:
                    console.log("Whoops! something went wrong, please try again");
            }

        })
}


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected to MySql");
    init();
})
