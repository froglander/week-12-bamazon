// required packages
var mysql = require('mysql');
var inquirer = require('inquirer');

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
				viewProducts();
			},
			"View Low Inventory" : function () {
				viewLowInventory();
			},
			"Add to Inventory" : function() {
				addInventory();
			},
			"Add New Product" : function() {
				addNewProduct();
			},
			"Quit" : function() {
				console.log("Thanks for using Bamazon Manager!");
			}
		}

		menuChoice[choice.menu]();

	})
}

function viewProducts() {
	console.log("View products");
	displayMenu();
}

function viewLowInventory() {
	console.log("View low inventory");
	displayMenu();
}

function addInventory() {
	console.log("Add to Inventory");
	displayMenu();
}

function addNewProduct() {
	console.log("Add New Product");
	displayMenu();
}