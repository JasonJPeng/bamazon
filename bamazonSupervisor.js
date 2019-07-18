const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connectionParams = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345678",
    database: "bamazon"
  };

const arrChoices = [
    "View Product Sales by Department",  
    "Create a new department",    
    "Add overhead to a department"    
];

var promptAction = [{ message: "\n\n", type: "rawlist", name: "choice", choices: arrChoices}];
var promptsNew = [ 
    {message: "Enter the department name: ", type: "inpout", name:  "dept"},
    {message: "Enter the department overhead cost: ", type: "input", name: "cost"}
];
var promptsChange = [ 
    {message: "Enter the department id: ", type: "inpout", name:  "id"},
    {message: "Add overhead cost to the department: ", type: "input", name: "cost"}
];


//  SQL to join products and departments and find profits
// NOTE: need to set department name unique
// select departments.department_id, departments.department_name, departments.overhead_costs, 
// sum(products.product_sales) as product_sales, 
// sum(products.product_sales) - departments.overhead_costs as total_profit from products 
// join departments on departments.department_name = products.department_name
// group by products.department_name order by department_id asc;

var strSqlProfit =
"select departments.department_id, departments.department_name, departments.overhead_costs, " + 
"sum(products.product_sales) as product_sales, " + 
"sum(products.product_sales) - departments.overhead_costs as total_profit from products " + 
"join departments on departments.department_name = products.department_name " +
"group by products.department_name order by department_id asc;";




async function supervisor(pmt) {
    let conn = await mysql.createConnection(connectionParams);
    let [rows,fields] = await conn.query(strSqlProfit);
    console.table(rows);
    
    conn.end();
}

supervisor(promptAction);
