const mysql = require('mysql2/promise');
const inquirer = require('inquirer');
const asTable = require ('as-table').configure({
    "delimiter": ' | ',
    "right": true
  });

const connectionParams = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345678",
    database: "bamazon"
  };

const arrChoices = [
    "View product for sales",  
    "View low inventory",    
    "Add to inventory",    
    "Change price",    
    "Add a new product",   
    "Quit"     
];
var conn; // global variable for DB connection
var allDept = [];


var mgrPrompts = [{ message: "\n\n", type: "rawlist", name: "choice", choices: arrChoices}];
var mgrPromptsInv = [ 
    {message: "Enter the product Id: ", type: "inpout", name:  "id"},
    {message: "How many items are added: ", type: "input", name: "num"}
];
var mgrPromptsPrice = [ 
    {message: "Enter the product Id: ", type: "inpout", name: "id"},
    {message: "Enter the new price: ", type: "input", name: "price"}
];
var mgrPromptsNew = [
    {message: "Which department ?", type: "list", name: "dept", choices: allDept},
    {message: "Enter the product name: ", type: "input",name: "product"},
    {message: "Enter the price of the product: ", type: "input", name:"price"},
    {message: "Enter the inventory of the product", type: "input", name: "num"}
];

async function listAll(){
    try {
        // let conn = await mysql.createConnection(connectionParams);
        let [rows,fields] = await conn.query("SELECT * FROM products ORDER BY department_name");
        // console.table(rows); 
        console.log("\n\n\n");
        console.log(asTable(rows));
        console.log("\n\n\n");
      //   console.log(rows);
        // conn.end();
      } catch (err) {
        console.log("ERROR: list all products fails.  ")  
        console.log(err);
      };
}

async function listLow(){
    try {
        let [rows,fields] = await conn.query("SELECT * FROM products WHERE stock_quantity < 5 ORDER BY department_name");
        if (rows.length === 0) {
            console.log("No products are in low inventory");
        } else {
            console.log("Low inventory list");  
            // console.table(rows); 
            console.log("\n\n\n");
            console.log(asTable(rows));
            console.log("\n\n\n");
        }
      } catch (err) {
        console.log("ERROR: Liost low inventory fails...")
        console.log(err);
      };
}

async function addInventory(pmt) {
    try {
       let ans = await inquirer.prompt(pmt);
       let [rows,fields] = await conn.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?",
                                                         [ans.num, ans.id]);  
       console.log("Inventory updated");                                                    
    } catch(err) {
       console.log("ERROR: Fail to update inventory");
       console.log(err);
    }
}

async function changePrice(pmt) {
    try {
       let ans = await inquirer.prompt(pmt);
       let [rows,fields] = await conn.query("UPDATE products SET price = ? WHERE item_id = ?",
                                                            [ans.price, ans.id]);
        console.log("Price chnaged to ${ans.price}");                                                    
    }  catch (err) {
        console.log("ERROR: fail to update price...") 
        console.log(err); 
    }    
}

async function addProduct(pmt) {
    try {
        let ans = await inquirer.prompt(pmt);
        let res = await conn.query("INSERT INTO products SET ?", [{
           "department_name": ans.dept,
           "product_name": ans.product,
           "price": ans.price,
           "stock_quantity": ans.num
        }]);
        // console.log(res);
        console.log("New product created")
    } catch (err) {    
        console.log("ERR: Fail to create a new product");
        console.log(err);    
    }    
}

function askManager(pmt) {
    inquirer.prompt(pmt).then(async ans => {  // Need to use async 
        switch (ans.choice) {
            case arrChoices[0]: // View Products
                await listAll();
                askManager(mgrPrompts);
                break;    
            case arrChoices[1]: // View low inventory
                await listLow();
                askManager(mgrPrompts);
                break; 
            case arrChoices[2]: // Add to inventory
                await addInventory(mgrPromptsInv);
                askManager(mgrPrompts);
                break;  
            case arrChoices[3]: // Change Price
                await changePrice(mgrPromptsPrice);
                askManager(mgrPrompts);
                break;     
            case arrChoices[4]: // Add New Product
                await addProduct(mgrPromptsNew);
                askManager(mgrPrompts);
                break;                              
            case arrChoices[5]: // Quit
                conn.end();
                return;
        } 
    })
}


// create allDept []  for all departments
async function createAllDept() {
    try { 
      let [rows,fields] = await conn.query("SELECT * FROM departments");
      rows.forEach(function(e){
         allDept.push(e.department_name);
      })   
   } catch(err) {
       console.log("ERROR: List all departments fails ..");
       console.log(err);
   } 
}


// Start and end program
// This program connects connects the DB but the connectipon would not end until "Quit"
async function startProgram () {
    try {
      conn = await mysql.createConnection(connectionParams);
      createAllDept();
      await askManager(mgrPrompts);
    //   conn.end();
    } catch (err) {
      console.log("fail to connect to database");
      console.log(err);
    };
  }

startProgram();





