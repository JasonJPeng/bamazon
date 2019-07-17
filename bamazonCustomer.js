const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const connectionParams = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345678",
    database: "bamazon"
  };

function showProducts(arrProducts) {
    arrProducts.forEach(function (e) {
      console.log(e.item_id, e.department_name, e.product_name, e.price); 
    })
    
}  

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

function buyProduct() {
    arrPrompts = [
        {
            message: "Please eneter the product Id:  ",
            type: 'input',
            name: 'id'
        },
        {
            message: "Please enter the quantity:  ",
            type: 'input',
            name: 'num'
        }
    ];
    inquirer.prompt(arrPrompts).then(ans => {
        updateProductNum(ans.id, ans.num);         
    })
}

async function listAll() {
    try {
      let conn = await mysql.createConnection(connectionParams);
      let [rows,fields] = await conn.query("SELECT * FROM products");
      showProducts(rows); 
      buyProduct();
    //   console.log(rows);
      conn.end();
    } catch (err) {
      console.log(err);
    };
  }

listAll();