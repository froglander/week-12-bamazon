CREATE SCHEMA `bamazon` ;

CREATE TABLE `bamazon`.`products` (
  `ItemID` INT NOT NULL AUTO_INCREMENT COMMENT 'Unique ID for each product',
  `ProductName` VARCHAR(45) NOT NULL COMMENT 'Name of product',
  `DepartmentName` VARCHAR(45) NOT NULL COMMENT 'Name of department',
  `Price` DECIMAL(10,2) NOT NULL COMMENT 'Retail price for customer',
  `StockQuantity` INT NOT NULL COMMENT 'How much product is available',
  PRIMARY KEY (`ItemID`));

INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Saddle', 'Tack', '1000', '2');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Bridle', 'Tack', '100', '10');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Hay', 'Feed', '7', '1000');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Grain', 'Feed', '20', '100');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Grooming Brush', 'Equipment', '8', '50');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Bucket', 'Equipment', '10', '20');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Halter', 'Tack', '25', '37');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Shampoo', 'Equipment', '10', '30');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Breeches', 'Clothing', '80', '40');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Boots', 'Clothing', '120', '50');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Helmet', 'Clothing', '75', '20');
INSERT INTO `bamazon`.`products` (`ProductName`, `DepartmentName`, `Price`, `StockQuantity`) VALUES ('Saddle Pad', 'Tack', '150', '10');

