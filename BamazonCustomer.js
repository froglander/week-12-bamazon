// required packages
require("dotenv").config();

const keys = require("./keys.js");

var mysql = require('mysql');
var inquirer = require('inquirer');
var os = require('os');

// var client = new Twitter(keys.twitter);

// Set up mysql connection
// var connection = mysql.createConnection({
// 	host: "localhost",
// 	port: 3306,
// 	user: "root",
// 	password: "",
// 	database: "bamazon"
// });
console.log(keys.mysql);
var connection = mysql.createConnection(keys.mysql);

// Make the connection and throw an error if there is one
connection.connect(function(err) {
	if(err) throw err;
});

// Made this array global since I didn't want to keep redeclaring it 
// in the getCustOrder function...although maybe that would get rid of
// that if statement?
var product_array = [];

// Call the function to get things going
getCustOrder();

/* ************************************************************	*/
/* Method : getCustOrder										*/
/* Parameters : none											*/
/* Description : This function pretty much does everything. 	*/
/*               Since it is asynchronous I had to nest it all  */
/*               within this function. Wrapped the query in a 	*/
/*               function so I could call it again if the user 	*/
/*               wanted to order another item. 					*/
/* ************************************************************	*/
function getCustOrder() {
	connection.query("SELECT `ItemID`, `ProductName`, `DepartmentName`, `Price` FROM `products`", function(err, rows, fields) {
		if (err) throw err;

		// Feels like a hacky way to make sure I don't keep pushing stuff to array
		if (product_array.length <= 0){
			for (var i = 0; i < rows.length; i++) {
				var itemInfo = {
					ItemID : rows[i].ItemID,
					ProductName : rows[i].ProductName,
					DepartmentName : rows[i].DepartmentName,
					Price : rows[i].Price
				}
				product_array.push(itemInfo);
			}
		}
		// Display the products in the array you just built
		console.log("display products");
		displayProducts(product_array);	
		// Ask user for a product ID
		inquirer.prompt([
		{
			type: 'input',
			name: 'prodID',
			message: 'Choose a product by ID',
			// Make sure it is a valid ID
			validate: function(value) {
				var found = product_array.some(function(el) {
					return el.ItemID == value;
				});
				if (found) {
					return true;			
				}
				return 'Please enter a valid product id';
			}
		}
		]).then(function(choice) {
			// Then find out how many of that item they want
			inquirer.prompt([
			{
				type: 'input',
				name: 'quantity',
				message: 'How many would you like to purchase?',
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
				// Get the stockquantity and price from the database. I could probably have put all of this 
				// in the product_array and pulled it from there, but seemed like better practice to pull
				// the info from database
				connection.query("SELECT `StockQuantity`, `Price` FROM `products` WHERE `ItemID` = ?", [choice.prodID], function(err, rows, fields) {
					if (err) throw err;

					console.log("There are " + rows[0].StockQuantity + " available of that item.");					
					if(rows[0].StockQuantity < answer.quantity) {
						console.log("Insufficient quantity available");
						inquirer.prompt([
							{
								type: 'confirm',
								name: 'continue',
								message: 'Would you like to place another order?'
							}
						]).then(function(again) {
								if(again.continue) {
										getCustOrder();
								} else {
									console.log("Come again soon!");
									// End the mysql connection since we are done
									connection.end();
								}
						});						
						
					} else {
						console.log("Let's place your order!");
						// Display order details, product name, qty, and total price
						console.log(printReceipt(product_array, choice.prodID, answer.quantity));
						
						// Variable to hold newQuantity for updating database, was less messy to read than putting this in the query line
						var newQuantity = rows[0].StockQuantity - parseInt(answer.quantity);
						// Update quantity in database
						connection.query("UPDATE `products` SET `StockQuantity` = ? WHERE `ItemID` = ?", [newQuantity, choice.prodID], function(err, rows, fields) {
							if (err) throw err;
							// Check if user wants something else
							inquirer.prompt([
							{
								type: 'confirm',
								name: 'continue',
								message: 'Would you like to place another order?'
							}
							]).then(function(again) {
									if(again.continue) {
										getCustOrder();
									} else {
										console.log("Come again soon!");
										// End the mysql connection since we are done
										connection.end();
									}
							});	
						});
					}
				});
			})
		});		
	});
} // end getCustOrder


/* ************************************************************	*/
/* Method : displayProducts										*/
/* Parameters : products array									*/
/* Description : This function displays the products 			*/
/* ************************************************************	*/
function displayProducts(products) {
	var prodPad = Array(45).join(' ');
	var idPad = Array(14).join(' ');
	var pricePad = Array(10).join(' ');

	var header = pad(idPad,'Product ID', false) + pad(prodPad, 'Product Name', false) + pad(pricePad, 'Price', true);
	var line = Array(67).join('-');
	console.log(header + os.EOL + line);

	for (var i = 0; i < products.length; i++) {
		console.log(pad(idPad,products[i].ItemID, false) 
			      + pad(prodPad, products[i].ProductName, false) 
			      + pad(pricePad, products[i].Price, true));
	}
}

/* From http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng */
/* ************************************************************	*/
/* Method : pad 												*/
/* Parameters : pad--what you want to pad with					*/
/*			    str--the string you are padding 				*/
/*				padLeft--if true, padLeft, otherwise pad right 	*/
/* Description : This function adds padding to a string to make	*/
/* 				 things line up nice. Thank you stackoverflow! 	*/
/* ************************************************************	*/
function pad(pad, str, padLeft) {
	if (typeof str === 'undefined')
		return pad;
	if (padLeft) {
		return (pad + str).slice(-pad.length);
	} else {
		return (str + pad).substring(0, pad.length);
	}
}

/* ************************************************************	*/
/* Method : printReceipt										*/
/* Parameters : arr--array that contains product info			*/
/*			    prodID--the product's ID 		 				*/
/*				qty--how many user orderd 					 	*/
/* Description : Returns a nicely formatted string to display 	*/
/* 				 purchase info 								 	*/
/* ************************************************************	*/
function printReceipt(arr, prodID, qty) {
	var elementPos = arr.map(function(el) { return el.ItemID; }).indexOf(parseInt(prodID));
	var orderTotal = parseInt(qty) * arr[elementPos].Price;

	var receiptString = `
	===========================================
	Product:                       ${arr[elementPos].ProductName}
	Price:                         $${parseFloat(arr[elementPos].Price).toFixed(2)}
	Quantity:                      ${qty}
	-------------------------------------------
	Total:                         $${orderTotal.toFixed(2)}
	===========================================
	`;

	return receiptString;
}