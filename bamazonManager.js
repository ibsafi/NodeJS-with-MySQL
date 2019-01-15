var mysql = require("mysql");
var inquirer = require("inquirer");

var options = [
    "View Products", 
    "View Low Inventory",
    "Add to Inventory",
    "Add New Product",
    "No Thanks!"
];

var items,ids;

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect();


getSQLdata();


function askWhich(){
    inquirer.prompt([
        {
            type: "list",
            message: "Which item you want to buy?",
            choices: options,
            name: "ans"
        }
    ]).then(function(answers){
        switch( options.indexOf(answers.ans) ){
            case 0:
                viewProductsforSale();
                break;

            case 1:
                viewLowInventory();
                break;

            case 2:
                addtoInventory();
                break;

            case 3:
                addNewProduct();
                break;
            case 4:
                console.log("GoodBye!");
                connection.end();
        }
    });
}

function getSQLdata(){
    //retrieve data from SQL
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        var row;
        items = [];
        ids = [];
        for(var key in res){
            row = res[key];
            items[row.item_id] = {
                id:     row.item_id,
                name:   row.product_name,
                price:  row.price,
                cnt:    row.stock_quantity,
            };
            ids.push("" + row.item_id);
        }
        askWhich();
      });
}
function addNewProduct(){
    inquirer.prompt([
        {
            type: "input",
            message: "What is the item's name?",
            name: "name"
        },
        {
            type: "input",
            message: "Which department this item is from?",
            name: "department",
        },
        {
            type: "input",
            message: "What is the price for it?",
            name: "price",
        },
        {
            type: "input",
            message: "How many item do you have?",
            name: "quantity",
        }
    ]).then(function(answers){
        if(isNaN(answers.price) || isNaN(answers.quantity)){
            console.log("Invalid input!");
            addNewProduct();
        }else{
            connection.query(
                "INSERT INTO products(Product_name, department_name, price, stock_quantity) VALUES(?,?,?,?)", 
                [answers.name, answers.department, answers.price, answers.quantity], function(err){
                    if(err) throw err;
                });
            getSQLdata();
        }
    });
}

function addtoInventory(){
    inquirer.prompt([
        {
            type: "list",
            message: "Which item?",
            choices: ids,
            name: "id"
        },
        {
            type: "input",
            message: "How many!",
            name: "cnt",
        }
    ]).then(function(answers){
        if( isNaN(answers.cnt) ){
            //invalid input
            console.log("invalid input!");
            addtoInventory();
        }else{
            //set data into sql
            var item_id = parseInt(answers.id);
            var item_quantity = parseInt(answers.cnt) + items[item_id].cnt;
            
            connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [item_quantity, item_id], function(err) {
                if (err) throw err;
            });
            getSQLdata();
        }
    });
}
function viewLowInventory(){
    console.log("Low Inventory items:" );

    for(var key in items){
        if(items[key].cnt < 5){
            console.log(
                "("+ items[key].id +"):  "+ items[key].name +
                " $"+ items[key].price + "\t\t["+ items[key].cnt +"]"
            );
        }
    }
    askWhich();
}
function viewProductsforSale(){
    console.log("\n items:" );
    
    for(var key in items){
        console.log(
            "("+ items[key].id +"):  "+ items[key].name +
            " $"+ items[key].price + "\t\t["+ items[key].cnt +"]"
        );
    }
    askWhich();
}