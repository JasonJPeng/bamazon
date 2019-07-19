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
var conn; // global variable for DB connection

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

// async function updateProductNum(id, num) {
//     try {
//         let conn = await mysql.createConnection(connectionParams);
//         let [rows,fields] = await conn.query("SELECT * FROM products WHERE item_id = ?", [id]);
//         conn.end();
//         if (rows.length !== 1) {
//             console.log(`${id} is not a valid product Id.`);
//             return 0;
//         } else {
//             var newNum = rows[0].stock_quantity - num;
//             var totalPrice = rows[0].price * num;
//             var productName = rows[0].product_name;
//             if (newNum < 0 ) {
//                console.log("Insufficient quantity!");
//                return 0;
//             } else {
//                 try {
//                    let conn = await mysql.createConnection(connectionParams);
//                    let [rows,fields] = await conn.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?",
//                                                          [newNum, id]);
//                     console.log(`You bought ${num} ${productName} !  $${totalPrice} will be deducted from your account`);                                     
//                     conn.end();
//                 } catch (err) {
//                     console.log(err);
//                 }   
//             }
//         }        
//       } catch (err) {
//         console.log(err);
//         return 0;
//       };
//     }    
   // update only ONE item, ONE column
   async function updateProduc(id, obj) {
        var column = Object.keys(obj)[0];
        var value =  Object.values(obj)[0];
        try {
            let conn = await mysql.createConnection(connectionParams);
            let [rows,fields] = await conn.query(`UPDATE products SET ${column} = '${value}' WHERE item_id = ${id}`);
            conn.end();
            return 1;
        } catch (err) {    
            console.log(err);    
        }   
    }    
   //======================================================================   


// when the program started, print out all products and 
//  also use push to create a department list -- [allDept]

// function showProductMgr(arrProducts) {
//     arrProducts.forEach(function (e) {
//       console.log(e.item_id, e.department_name, e.product_name, e.price, e.stock_quantity); 
//       if (allDept.indexOf(e.department_name) < 0 ) {
//           allDept.push(e.department_name);
//       }
//     })
//     // console.log(mgrPromptsNew);    
// }  

async function listAll(){
    try {
        // let conn = await mysql.createConnection(connectionParams);
        let [rows,fields] = await conn.query("SELECT * FROM products");
        console.table(rows); 
      //   console.log(rows);
        // conn.end();
      } catch (err) {
        console.log("ERROR: list all products fails.  ")  
        console.log(err);
      };
}

async function listLow(){
    try {
        let [rows,fields] = await conn.query("SELECT * FROM products WHERE stock_quantity < 5");
        if (rows.length === 0) {
            console.log("No products are in low inventory");
        } else {
            console.log("Low inventory list");  
            console.table(rows); 
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
       console.log("ERROR: Fail to update einventory");
       console.log(err);
    }
}

function changePrice(pmt) {
    inquirer.prompt(pmt).then(ans => {
        updateProduc(ans.id, {"price":ans.price});
        askManager(mgrPrompts);
    })
}

function addProduct(pmt) {
    inquirer.prompt(pmt).then(async ans => {
    try {
        let conn = await mysql.createConnection(connectionParams);
        let res = await conn.query("INSERT INTO products SET ?", [{
           "department_name": ans.dept,
           "product_name": ans.product,
           "price": ans.price,
           "stock_quantity": ans.num
        }]);
        console.log(res);
        conn.end();
        askManager(mgrPrompts);
         return 1;
    } catch (err) {    
        console.log(err);    
    }    
        
    })
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
                // await askManager(mgrPrompts);
                break;     
            case arrChoices[4]: // Add New Product
                await addProduct(mgrPromptsNew);
                // await askManager(mgrPrompts);
                break;                              
            case arrChoices[5]: // Quit
                conn.end();
                return;
        } 
    })
}

var allDept = [];
// create allDept []  for all departments
async function createAllDept() {
    try {
      allDept = [];  
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





