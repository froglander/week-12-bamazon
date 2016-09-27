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
				   "Add New Product"
				]
	}
	]).then(function(choice) {
		console.log("You chose:", choice.menu);

	})
}