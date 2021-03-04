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

const EmployeeQuestions = [
    {
        type: 'input',
        name: 'first_name',
        message: 'What is the first name of the employee you are adding?',
    }
];

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
        'Add Employee', 'Remove Employee', 'Update Employee Role','Update Employee Manager', 'Add Role', 'Add Department', 
        'View All Employees', 'View All Departments', 'View All Roles', 'Exit']
    }
];

function veiwAllDepartments() {
    const departGet = 'SELECT * FROM department';

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
