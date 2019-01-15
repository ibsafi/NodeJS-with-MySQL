var mysql = require("mysql");
var inquirer = require("inquirer");

var options = [
    "View Products by Department", 
    "Create New Department",
    "No Thanks!"
];

var items,departments;

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
                viewProductsbyDepartment();
                break;

            case 1:
                createNewDepartment();
                break;

            case 2:
                console.log("GoodBye!");
                connection.end();
        }
    });
}

function getSQLdata(){
    items = [];
    departments = [];

    //retrieve data from SQL
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        var row;
        for(var key in res){
            row = res[key];
            items[row.item_id] = {
                id:     row.item_id,
                name:   row.product_name,
                price:  row.price,
                cnt:    row.stock_quantity,
                department: row.department_name,
                sales: row.product_sales
            };
            if(departments.indexOf(row.department_name) === -1){
                departments.push(row.department_name);
            }
        }
    });
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;

        var row;
        for(var key in res){
            row = res[key];
            departments[row.department_id] = {
                id:     row.department_id,
                name:   row.department_name,
                costs:  row.over_head_costs
            };
        }
        askWhich();
    });
    
}
function createNewDepartment(){
    inquirer.prompt([
        {
            type: "input",
            message: "What is the department's name?",
            name: "name"
        },
        {
            type: "input",
            message: "What is the overhead costs?",
            name: "costs",
        }
    ]).then(function(answers){
        if(isNaN(answers.costs)){
            console.log("Invalid input!");
            createNewDepartment();
        }else{
            connection.query(
                "INSERT INTO departments(department_name,over_head_costs) VALUES(?,?)", 
                [answers.name, answers.costs], function(err){
                    if(err) throw err;
                });
            getSQLdata();
        }
    });
}

function viewProductsbyDepartment(){
    console.log("| department_id | department_name | over_head_costs | product_sales | total_profit  |");
    console.log("| ------------- | --------------- | --------------- | ------------- | ------------- |");

    for(var key in departments){
        var department = departments[key];
        var sales = 0;
        for(var i in items){
            var item = items[i];
            if(item.deparment === department){
                sales += item.sales*item.price;
            }
        }
        if(department.id !== undefined){

            while(department.name.length < 15){
                department.name += " ";
            }
            department.costs = department.costs + "";
            while(department.costs.length < 15){
                department.costs += " ";
            }
            console.log(
                
                "| " + department.id +"\t\t| " + department.name + " | " + department.costs + 
                " | " + sales + "\t\t    | " + (sales - parseInt(department.costs)) + "\t    |"
            );
        }
    }
    askWhich();
}