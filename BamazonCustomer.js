var mysql = require('mysql');
var inquirer = require('inquirer');
var os = require('os');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err) {
	if(err) throw err;
});

var product_array = [];

getCustOrder();

function getCustOrder() {
	connection.query("SELECT * FROM `products`", function(err, rows, fields) {
		if (err) throw err;
		//console.log(rows);
		//var product_array = [];
		for (var i = 0; i < rows.length; i++) {
			var itemInfo = {
				ItemID : rows[i].ItemID,
				ProductName : rows[i].ProductName,
				DepartmentName : rows[i].DepartmentName,
				Price : rows[i].Price
			}
			product_array.push(itemInfo);
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
			console.log(choice.prodID);

			inquirer.prompt([
			{
				type: 'input',
				name: 'quantity',
				message: 'How many would you like to purchase?',
				validate: function(value) {
					var pass = value.match(/^\d+$/);
					if (pass) {
						return true;					
					}
					return 'Please enter a valid quantity';
				}
			}
			]).then(function(answer) {
				connection.query("SELECT `StockQuantity` FROM `products` WHERE `ItemID` = ?", [choice.prodID], function(err, rows, fields) {
					if (err) throw err;

					console.log("You want " + answer.quantity + " of item ID: " + choice.prodID);
					console.log("There are " + rows[0].StockQuantity + " available of that item");
					if(rows[0].StockQuantity < answer.quantity) {
						console.log("Insufficient quantity available");
						inquirer.prompt([
							{
								type: 'confirm',
								name: 'continue',
								message: 'Would you like to place another order?'
							}
						]).then(function(again) {
								getCustOrder();
						});						
						
					} else {
						console.log("Let's place an order");
					}

				});

			})
		});
		
	});
} // end getCustOrder


function displayProducts(products) {
	var padding = Array(45).join(' ');
	var header = pad('            ','Product ID', false) + pad(padding, 'Product Name', false) + pad('          ', 'Price', true);
	var line = Array(67).join('-');
	console.log(header + os.EOL + line);

	for (var i = 0; i < products.length; i++) {
		console.log(pad('            ',products[i].ItemID, false) + pad(padding, products[i].ProductName, false) + pad('          ', products[i].Price, true));
	}
}

/* From http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng */
function pad(pad, str, padLeft) {
	if (typeof str === 'undefined')
		return pad;
	if (padLeft) {
		return (pad + str).slice(-pad.length);
	} else {
		return (str + pad).substring(0, pad.length);
	}
}