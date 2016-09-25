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
				connection.query("SELECT `StockQuantity`, `Price` FROM `products` WHERE `ItemID` = ?", [choice.prodID], function(err, rows, fields) {
					if (err) throw err;

					console.log("There are " + rows[0].StockQuantity + " available of that item.");
					//console.log("product_array[0]:", product_array[0]);
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
									connection.end();
								}
						});						
						
					} else {
						console.log("Let's place your order!");
						// Display order details, product name, qty, and total price
						console.log(printReceipt(product_array, choice.prodID, answer.quantity));
						// var elementPos = product_array.map(function(x) {return x.ItemID; }).indexOf(parseInt(choice.prodID));
						// var orderTotal = parseInt(answer.quantity) * product_array[elementPos].Price;
						// console.log("You bought " + answer.quantity + " of " + product_array[elementPos].ProductName 
						// 			+ " at $" + product_array[elementPos].Price + " each for a total of $" + orderTotal);


						var newQuantity = rows[0].StockQuantity - parseInt(answer.quantity);
						connection.query("UPDATE `products` SET `StockQuantity` = ? WHERE `ItemID` = ?", [newQuantity, choice.prodID], function(err, rows, fields) {
							if (err) throw err;
							// console.log("updated quantity to " + newQuantity);
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

function displayProducts(products) {
	var prodPad = Array(45).join(' ');
	var idPad = Array(14).join(' ');
	var pricePad = Array(10).join(' ');

	var header = pad(idPad,'Product ID', false) + pad(prodPad, 'Product Name', false) + pad(pricePad, 'Price', true);
	var line = Array(67).join('-');
	console.log(header + os.EOL + line);

	for (var i = 0; i < products.length; i++) {
		console.log(pad(idPad,products[i].ItemID, false) + pad(prodPad, products[i].ProductName, false) + pad(pricePad, products[i].Price, true));
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

function printReceipt(arr, prodID, qty) {
	var elementPos = arr.map(function(el) { return el.ItemID; }).indexOf(parseInt(prodID));
	var orderTotal = parseInt(qty) * arr[elementPos].Price;

	var receiptString = `
	===========================================
	Product:                       ${arr[elementPos].ProductName}
	Price:                         $${arr[elementPos].Price.toFixed(2)}
	Quantity:                      ${qty}
	-------------------------------------------
	Total:                         $${orderTotal.toFixed(2)}
	===========================================
	`;

	return receiptString;
}