// required packages
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table2');
var os = require('os');

// set up mysql connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "bamazon"
});

// make the connection and throw an error if there is one
connection.connect(function(err) {
	if(err) throw err;
});

displayMenu();

function displayMenu() {
	inquirer.prompt([
	{
		type: "list",
		name: "menu",
		message: "Choose a menu option:",
		choices: [ "View Products for Sale",
				   "View Low Inventory",
				   "Add to Inventory",
				   "Add New Product",
				   "Quit"
				]
	}
	]).then(function(choice) {
		console.log("You chose:", choice.menu);

		var menuChoice = {
			"View Products for Sale" : function () {
				var qryString = "SELECT `ItemID`, `ProductName`, `DepartmentName`, `Price`, `StockQuantity`  FROM `products`";
				viewProducts(qryString);
			},
			"View Low Inventory" : function () {
				inquirer.prompt([
					{ 
						type: "input",
					  	name: "low",
					  	message: "Low inventory threshold: ",
					  	validate: function(value) {
							// Make sure it is a valid digit answer
							var pass = value.match(/^\d+$/);
							if (pass) {
								return true;					
							}
							return 'Please enter a valid quantity';
						}
					}
				]).then(function(answer) {
					var qryString = "SELECT `ItemID`, `ProductName`, `DepartmentName`, `Price`, `StockQuantity`  FROM `products` WHERE `StockQuantity` < " + answer.low;
					viewProducts(qryString);	
				})				
			},
			"Add to Inventory" : function() {
				addInventory();
			},
			"Add New Product" : function() {
				addNewProduct();
			},
			"Quit" : function() {
				console.log("Thanks for using Bamazon Manager!");
				connection.end();
			}
		}

		menuChoice[choice.menu]();

	})
}

function viewProducts(qryString) {
	//console.log("View products");
	//var qryString = "SELECT `ItemID`, `ProductName`, `DepartmentName`, `Price`, `StockQuantity`  FROM `products`";
	connection.query(qryString, function(err, rows, fields) {
		var table = new Table({
			head: ['Item ID', 'Product Name', 'Deptment Name', 'Price', 'Stock'],
			colWidths: [10, 20, 20, 8, 8]
		})
		for (var i = 0; i < rows.length; i++) {
			table.push([rows[i].ItemID,
			           rows[i].ProductName,
			           rows[i].DepartmentName,
			           rows[i].Price,
			           rows[i].StockQuantity
			          ]);			
		}
		console.log(os.EOL + table.toString());
		displayMenu();
	});
}

// function viewLowInventory() {
// 	console.log("View low inventory");
// 	console.log("View products");
// 	var qryString = "SELECT `ItemID`, `ProductName`, `DepartmentName`, `Price`, `StockQuantity`  FROM `products` WHERE `StockQuantity` < 5";
// 	connection.query(qryString, function(err, rows, fields) {
// 		var table = new Table({
// 			head: ['Item ID', 'Product Name', 'Deptment Name', 'Price', 'Stock'],
// 			colWidths: [10, 20, 20, 8, 8]
// 		})

// 		//console.log(rows);
// 		for (var i = 0; i < rows.length; i++) {
// 			//console.log("row" + i + rows[i]);

// 			table.push([rows[i].ItemID,
// 			           rows[i].ProductName,
// 			           rows[i].DepartmentName,
// 			           rows[i].Price,
// 			           rows[i].StockQuantity
// 			          ]);			
// 		}
// 		//console.log("table:", table);

// 		console.log(os.EOL + table.toString());
// 		displayMenu();
// 	});

// }

function addInventory() {
	console.log("Add to Inventory");
	displayMenu();
}

function addNewProduct() {
	console.log("Add New Product");
	displayMenu();
}