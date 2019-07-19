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
const arrPrompts = [
  {message: "\n\nPurchasing a product: \nPlease eneter the product ID:  ", type: 'input', name: 'id'},
  {message: "Please enter the quantity:  ", type: 'input', name: 'num'}
];  

var conn;



async function showProducts(arrProducts) {
  try {
    let [rows,fields] = await conn.query("SELECT item_id, product_name, price FROM products");
    // console.table(rows);
    console.log("\n\n\n")
    console.log(asTable(rows));
    console.log("\n\n\n");
    let ans = await inquirer.prompt(arrPrompts)//.then(ans => {
      await updateProductNum(ans.id, ans.num);         
  //  })
  } catch(err) {
    console.log("Fail to list all products");
    console.log(err);
  }         
}  

async function updateProductNum(id, num) {
    try {      
        let [rows,fields] = await conn.query("SELECT * FROM products WHERE item_id = ?", [id]);
        if (rows.length !== 1) {
            console.log(`${id} is not a valid product Id.`);
            return 0;
        } 
        var newNum = rows[0].stock_quantity - num;
        if (newNum < 0) {
             console.log("Insufficient quantity!");
             return  0;
        }
        var totalPrice = parseInt(rows[0].price) * num;
        var productName = rows[0].product_name;
        var newSales = parseInt(rows[0].product_sales) + totalPrice;
        let res = await conn.query("UPDATE products SET ? WHERE item_id = ?",
                                               [{  "stock_quantity": newNum,
                                                   "product_sales" : newSales 
                                                 }, 
                                                    id]);
        console.log(`You bought ${num} ${productName} !  $${totalPrice} will be deducted from your account`);                                             
      } catch (err) {
        console.log("ERROR: Sales NOT completed")
        console.log(err);
        return 0;
      };
}
// Start and end program
// This program connects and ends database
async function startProgram () {
    try {
      conn = await mysql.createConnection(connectionParams);
      await showProducts();
      conn.end();
    } catch (err) {
      console.log("fail to connect to database");
      console.log(err);
    };
  }

startProgram();
