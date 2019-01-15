var mysql = require("mysql");
var inquirer = require("inquirer");

var items,ids;
var cart = [];
var selected = { id: 0, cnt: 0 };

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


function askWhichItem(){
    inquirer.prompt([
        {
            type: "list",
            message: "Which item you want to buy?",
            choices: ids,
            name: "id"
        }
    ]).then(function(answers){
        selected.id = parseInt(answers.id);
        selected.cnt = 1;
        //check for availablity
        if( chechAvailability() ){
            //ask how many is wanted
            askHowMany();
        }else{
            console.log("Insufficient quantity!");
            askWhichItem();
        }
    });
}
function askHowMany(){
    //asks user for quantity
    inquirer.prompt([
        {
            type: "input",
            message: "How many do you want?",
            name: "cnt",
        }
    ]).then(function(answers){
        selected.cnt = parseInt(answers.cnt);
        if( isNaN(answers.cnt) ){
            console.log("Please enter a valid input!");
            askHowMany();
        }else{
            if( chechAvailability() ){
                //add that item to the shopping cart
                addToCart();
                selected = {id: 0, cnt: 0};
                // ask if the user wants anything more than this item
                askSomethingElse();
            }else{
                console.log("Insufficient quantity!");
                askHowMany();
            }
        }
    });
}

function askSomethingElse(){
    inquirer.prompt([
        {
            type: "list",
            message: "Do You Want to anything else!",
            name: "confirm",
            choices: ["Yes", "No"]
        }
    ]).then(function(answers){
        if(answers.confirm === "Yes"){
            //ask for the a new item
            askWhichItem();
        }else{
            //make the checkout
            checkout();
        }
    });
}

function chechAvailability(){
    //check if this item had been selected before and get the applicable quantity
    //caculate the total selected quantity of the cart items
    var cnt = selected.cnt;
    for(var key in cart){
        if(cart[key].id === selected.id){
            cnt += cart[key].cnt;
        }
    }

    for(var key in items){
        if(items[key].id === selected.id){
            if(items[key].cnt >= cnt){
                return true;
            }else{
                return false;
            }
        }
    }
}

function addToCart(){
    for(var key in cart){
        if(cart[key].id === selected.id){
            cart[key].cnt += selected.cnt;
            return 0;
        }
    }
    cart.push( selected );
}

function checkout(){
    var total, item_id;
    total = 0;
    //reduce quantity localy, set SQL table and calculate the total
    for(var key in cart){
        cart_item = cart[key];

        //reduce quantity
        items[ cart_item.id ].cnt -= cart_item.cnt;

        //set data into sql
        connection.query("UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?", [items[ cart_item.id ].cnt, cart_item.cnt, cart_item.id], function(err) {
            if (err) throw err;
          });

        // calculate total
        total += items[ cart_item.id ].price * cart_item.cnt;
    }

    //showing the total amount of bill
    console.log("Your Total is: $"+ total);
    console.log("Goodbye!");
    connection.end();
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
        showitems();
        askWhichItem();
      });
}

function showitems(){
    console.log("\n items:" );

    for(var key in items){
        console.log(
            "("+ items[key].id +"):  "+ items[key].name +
            " $"+ items[key].price + "\t\t["+ items[key].cnt +"]"
        );
    }
}