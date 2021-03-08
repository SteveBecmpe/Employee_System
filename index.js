// const express = require('express');
// const app = express();
const inquirer = require("inquirer");
const fs = require('fs');
const chalk = require('chalk');

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

const chalkText =
    `   ***********  CMS Employee Management System  ********** 
 |***********************************************************|
 |     ********         *****      *****           *****     |                     
 |   ***      ***     ***   ***  ***   ***       ***   ***   |                      
 |  ***        ***   ***     ******     ***      ***    **   |               
 |  ***              ***       **       ***       ****       |                     
 |  ***              ***                ***          ****    |
 |  ***        ***   ***                ***      **    ***   |     
 |   ***      ***    ***                ***      ***   ***   |                 
 |    *********      ***                ***        *****     |
  ***********************************************************
    **********  CMS Employee Management System  ***********   `;

function addEmployee() {
    console.clear();
    //Get all Roles
    const roleList = [];
    const roleGet = 'SELECT * FROM role';
    connection.query(roleGet, function (err, res) {
        if (err) throw err;
        if (res.lenght === 0) {
        } else {
            const roleLength = res.length;
            for (i = 0; i < roleLength; i++) {
                roleList.push({ name: res[i].title, value: res[i].id });
            }
        }
        //Get All Departments
        const managerList = [];
        // const managerGet = 'SELECT * FROM employee WHERE employee.manager_id is NULL ';
        const managerGet ='SELECT employee.id, employee.first_name, employee.last_name, title, department_name FROM employee LEFT JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id Where manager_id is NULL AND title = "Manager"';

        connection.query(managerGet, function (err, res) {
            if (err) throw err;
            if (res.lenght === 0) {
            } else {
                const manLength = res.length;
                for (i = 0; i < manLength; i++) {
                    let tempName = res[i].first_name;
                    tempName += ' ';
                    tempName += res[i].last_name;
                    tempName += ' ';
                    tempName += res[i].title;
                    tempName += ' ';
                    tempName += res[i].department_name;
                    managerList.push({ name: tempName, value: res[i].id });
                }
            }
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
                    let tempRoleId = data.role;
                    let tempManId = data.manager;
                    const empVal = {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        role_id: tempRoleId,
                        manager_id: tempManId
                    };
                    const employeePOST = 'INSERT INTO employee SET ?';
                    connection.query(employeePOST,
                        empVal, function (err, res) {
                            if (err) throw err;
                            init();
                        })
                })
        });
    });
}

const MenuQuestions = [
    {
        type: 'list',
        message: 'CMS Employee Management System: What would you like to do next',
        name: 'choice',
        choices: [
            'View All Employees',
            'View Employee',
            'View All Employees By Department',
            'View All Employees By Manager',
            'View All Departments',
            'View All Roles',
            'Add Employee',
            'Remove Employee',
            'Update Employee Role',
            'Update Employee Manager',
            'Add Role',
            'Add Department',
            'Exit']
    }
];

function viewEmployee() {//redo this to find employee id and redo DB query then console.table(res)
    //Get all employee data from DB
    const allEmployeeGet = 'SELECT employee.id, employee.first_name, employee.last_name, title, department_name AS Department, salary, CONCAT(e.first_name, " ", e.last_name) AS Manager FROM employee LEFT JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS e ON employee.manager_id = e.id';
    connection.query(allEmployeeGet, function (err, res) {
        if (err) throw err;
        //Convert All employee data into an array of objects (to hold ID) and an array of just names To display in choices
        const empOrigResArr = res;
        const empArrList = [];
        const responseLength = res.length;
        for (i = 0; i < responseLength; i++) {
            let empTempObj = '';
            empTempObj += res[i].first_name;
            empTempObj += ' ';
            empTempObj += res[i].last_name;
            // console.log(empTempObj);
            empArrList.push({name: empTempObj, value: res[i].id});
        }
        //choose an employee to modify 
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'id',
                    message: 'Select Employee to View.',
                    choices: empArrList
                }
            ])
            .then((data) => {
                // console.log("employee id chosen");
                // console.log(data);
                // console.log(data.id);
                //save response data into Target Employee variable for use later. NOTE data will get used again
                const TargetEmployeeID = data;//id of employee choosen
                const allEmployeeArrLength = empOrigResArr.length;
                let TargetEmployeeData;
                for (i = 0; i < allEmployeeArrLength; i++) {
                    if (empOrigResArr[i].id === TargetEmployeeID.id) {
                        TargetEmployeeData = empOrigResArr[i];
                        break;
                    }
                }
                // console.log(TargetEmployeeData);
                console.table('EMPLOYEE DETAILS', [TargetEmployeeData]);
                init();
            })

    })
};


//---------------------------------------------------------------------------------------------------------------------------------------------------
function updateEmployeeRole() {
    //Get all employee data from DB
    const allEmployeeGet = 'SELECT employee.id, employee.first_name, employee.last_name, title, department_name AS Department, salary, CONCAT(e.first_name, " ", e.last_name) AS Manager FROM employee LEFT JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS e ON employee.manager_id = e.id';
    connection.query(allEmployeeGet, function (err, res) {
        if (err) throw err;
        //Convert All employee data into an array of objects (to hold ID) and an array of just names To display in choices
        const empArrArr = [];
        const empArrList = [];
        const responseLength = res.length;
        for (i = 0; i < responseLength; i++) {
            let empTempObj = '';
            empTempObj += res[i].first_name;
            empTempObj += ' ';
            empTempObj += res[i].last_name;
            // console.log(empTempObj);
            empArrArr.push({ empID: res[i].id, empName: empTempObj });
            empArrList.push(empTempObj);
        }
        //choose an employee to modify 
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'targetEmployeeUpdateRole',
                    message: 'Select Employee to Update Role?',
                    choices: empArrList
                }
            ])
            .then((data) => {
                // console.log(data);
                //save response data into Target Employee variable for use later. NOTE data will get used again
                const TargetEmployee = data;
                // console.log(TargetEmployee);

                //get all roles from DB
                // const allRoles = 'SELECT * FROM role';
                const allRoles = 'SELECT role.id, title, department_name FROM role JOIN department ON role.department_id = department.id';

                connection.query(allRoles, function (err, res) {
                    if (err) throw err;
                    let allRolesLength = res.length;
                    const allRoles = [];
                    const allRolesList = [];
                    for (i = 0; i < allRolesLength; i++) {
                        let tempRoleDepart = '';
                        tempRoleDepart += res[i].title;
                        tempRoleDepart += ', ';
                        tempRoleDepart += res[i].department_name;
                        tempRoleDepart += ' Department';
                        allRoles.push({ roleID: res[i].id, roleTitleDepart: tempRoleDepart });
                        allRolesList.push(tempRoleDepart);
                    }
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'targetRole2Add2Employee',
                                message: 'Select Role to add to Employee',
                                choices: allRolesList
                            }
                        ])
                        .then((data) => {
                            const TargetRole = data;
                            // console.log(TargetEmployee);
                            // console.log(TargetRole);

                            //Find Target Role ID
                            allRolesLength = allRoles.length;
                            let TargetRoleID = 0;
                            for (i = 0; i < allRolesLength; i++) {
                                if (allRoles[i].roleTitleDepart === TargetRole.targetRole2Add2Employee) {
                                    TargetRoleID = allRoles[i].roleID;
                                    break;
                                }
                            }
                            //Find Target Employee ID
                            const allEmployeeArrLength = empArrArr.length;
                            let TargetEmployeeID = 0;
                            for (i = 0; i < allEmployeeArrLength; i++) {
                                if (empArrArr[i].empName === TargetEmployee.targetEmployeeUpdateRole) {
                                    TargetEmployeeID = empArrArr[i].empID;
                                    break;
                                }
                            }
                            // console.log(TargetEmployee);
                            // console.log(TargetEmployeeID);
                            // console.log(TargetRole);
                            // console.log(TargetRoleID);
                            const UpdateRoleForEmployee = 'UPDATE employee SET role_id = ? WHERE id = ?';
                            const TargetValues = [TargetRoleID, TargetEmployeeID];
                            connection.query(UpdateRoleForEmployee, TargetValues, function (err, res) {
                                if (err) throw err;
                                console.clear();
                                init();
                            })

                            // console.log(allRoles);
                        })
                });
            });
        // init();
    })
    // console.log(empArrList);
    // console.table(res);

}


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

    // console.log(teamMembers);


    inquirer

        .prompt(MenuQuestions)

        .then((data) => {
            // console.log(data);
            // console.log(data.choice);

            switch (data.choice) {
                case 'Add Employee':
                    console.clear();
                    // console.log("Yeah add a manager");
                    addEmployee();//(data.id)
                    break;
                case 'Add Role':
                    console.clear();
                    // console.log("Yeah add a engineer ");
                    addRole();//(data.id)
                    break;
                case 'Add Department':
                    console.clear();
                    // console.log("Yeah add a intern");
                    addDepartment();
                    break;
                case 'View All Employees':
                    console.clear();
                    // console.log("Yeah add a intern");
                    viewAllEmployees();
                    break;
                case 'View Employee':
                    console.clear();
                    // console.log("Yeah add a intern");
                    viewEmployee();
                    break;
                case 'View All Departments':
                    console.clear();
                    // console.log("Yeah add a intern");
                    veiwAllDepartments();
                    break;
                case 'View All Roles':
                    console.clear();
                    // console.log("Yeah add a intern");
                    viewAllRoles();
                    break;
                case 'Update Employee Role'://---------------
                    console.clear();
                    // console.log("Yeah add a intern");
                    updateEmployeeRole();
                    break;
                case 'Exit':
                    console.clear();
                    connection.end();
                    // console.log("Yeah finish");
                    // fs.writeFile('./distributeRelease/index.html', generateHtmlContent(teamMembers), (err) =>
                    //     err ? console.error(err) : console.log('Team HTML File Generated!'));
                    break;
                default:
                    console.clear();
                    console.log("");
                    console.log("Whoops! something went wrong, please try again");
                    console.log("");
                    init();
            }

        })

}


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected to MySql");
    console.log(chalk.blue(chalkText));
    setTimeout(() => {
        console.clear();
        init();
    }, 1000);

})
