const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connectionParams = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345678",
    database: "bamazon"
  };
  var conn;

const arrChoices = [
    "View Product Sales by Department",  
    "Create a new department",    
    "Add overhead to a department",
    "Quit"    
];

var promptsAction = [{ message: "\n\n", type: "rawlist", name: "choice", choices: arrChoices}];
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

async function createNewDept() {
    inquirer.prompt(promptsNew).then( async ans=> {
        try {
             let res = await conn.query("INSERT INTO departments SET ?", [{
                         "department_name": ans.dept,
                         "overhead_costs": ans.cost
             }])
             console.log(res);
             action(promptsAction);
        } catch (err) {
             console.log("ERROR: Fail to creatye a new departmrnt");
             console.log(err);
             conn.end();
        }      
    })    
}

async function changeOverheadCosts() {
    inquirer.prompt(promptsNew).then( async ans=> {
        try {
          let [rows, fields] = await conn.query(); 
        } catch (err) {
           console.log("Fail to change the overhaed costs"); 
           conslog.log(err);
           conn.end();
        }
    })       
}

async function action(pmt) {
    inquirer.prompt(pmt).then( async ans=> {
        switch (ans.choice) {
            case arrChoices[0]: // vire profit
                let [rows,fields] = await conn.query(strSqlProfit);
                console.table(rows);
                await action(pmt);
                break;
            case arrChoices[1]:  // Create a new department
                await createNewDept();
                break;
            case arrChoices[2]:  // Change Overhead cost
                await changeOverheadCosts();
                break;
            case arrChoices[3]: // Quit   
                conn.end();
        }
    })

}


// This function connects to database and call the main program
async function supervisor(pmt) { 
  try {
    conn = await mysql.createConnection(connectionParams);
    await action(pmt); 
  } catch(err) {
        console.log("fail to connect to database");
        console.log(err);
  }
}

supervisor(promptsAction);
