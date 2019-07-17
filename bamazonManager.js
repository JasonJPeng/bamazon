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
    "View product for sales",  
    "View low inventory",    
    "Add to inventory",    
    "Change price",    
    "Add a new product",   
    "Quit"     
];

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

//======================================================================
// Cut and paste from customer . js need to re-organize
//===============================================================

async function updateProductNum(id, num) {
    try {
        let conn = await mysql.createConnection(connectionParams);
        let [rows,fields] = await conn.query("SELECT * FROM products WHERE item_id = ?", [id]);
        conn.end();
        if (rows.length !== 1) {
            console.log(`${id} is not a valid product Id.`);
            return 0;
        } else {
            var newNum = rows[0].stock_quantity - num;
            var totalPrice = rows[0].price * num;
            var productName = rows[0].product_name;
            if (newNum < 0 ) {
               console.log("Insufficient quantity!");
               return 0;
            } else {
                try {
                   let conn = await mysql.createConnection(connectionParams);
                   let [rows,fields] = await conn.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?",
                                                         [newNum, id]);
                    console.log(`You bought ${num} ${productName} !  $${totalPrice} will be deducted from your account`);                                     
                    conn.end();
                } catch (err) {
                    console.log(err);
                }   
            }
        }        
      } catch (err) {
        console.log(err);
        return 0;
      };
    }    
   //======================================================================   


// when the program started, print out all products and 
//  also use push to create a department list -- [allDept]
function showProductMgr(arrProducts) {
    arrProducts.forEach(function (e) {
      console.log(e.item_id, e.department_name, e.product_name, e.price, e.stock_quantity); 
      if (allDept.indexOf(e.department_name) < 0 ) {
          allDept.push(e.department_name);
      }
    })
    // console.log(mgrPromptsNew);    
}  

async function listAll(){
    try {
        let conn = await mysql.createConnection(connectionParams);
        let [rows,fields] = await conn.query("SELECT * FROM products");
        showProductMgr(rows); 
      //   console.log(rows);
        conn.end();
      } catch (err) {
        console.log(err);
      };
}

async function listLow(){
    try {
        let conn = await mysql.createConnection(connectionParams);
        let [rows,fields] = await conn.query("SELECT * FROM products WHERE stock_quantity < 5");
        if (rows.length === 0) {
            console.log("No products are in low inventory");
        } else {
            console.log("Low inventory list");  
            rows.forEach(function (e) {
                console.log(e.item_id, e.department_name, e.product_name, e.price, e.stock_quantity);
            })     
        }
        conn.end();
      } catch (err) {
        console.log(err);
      };
}

function addInventory(pmt) {
    inquirer.prompt(pmt).then(ans => {

        updateProductNum(ans.id, ans.num*(-1));
        askManager(mgrPrompts);
    })
}

function askManager(pmt) {
    inquirer.prompt(pmt).then(async ans => {  // Need to use async 
        switch (ans.choice) {
            case arrChoices[0]: // View Products
                await listAll();
                await askManager(mgrPrompts);
                break;    
            case arrChoices[1]: // View low inventory
                await listLow();
                await askManager(mgrPrompts);
                break; 
            case arrChoices[2]: // Add to inventory
                await addInventory(mgrPromptsInv);
                // await askManager(mgrPrompts);
                break;                         
            case arrChoices[5]: // Quit
                return;
        } 
    })
}

askManager(mgrPrompts);





