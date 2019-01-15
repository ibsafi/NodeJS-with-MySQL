drop database if exists bamazon;

create database bamazon;

use bamazon;

create table products(
    item_id INTEGER(10) not null AUTO_INCREMENT,
    product_name VARCHAR(20),
    department_name VARCHAR(20),
    price DECIMAL(10,4),
    stock_quantity INTEGER(10),
    product_sales INTEGER(10) DEFAULT 0,
    PRIMARY KEY (item_id)
);

create table departments(
    department_id INTEGER(10) not null AUTO_INCREMENT,
    department_name VARCHAR(20),
    over_head_costs INTEGER(10),
    PRIMARY KEY (department_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES
("chocolate", "sweet"       , 2.99  , 120),
("w-clock"  , "home"        , 12.00 , 10),
("laptop"   , "electronics" , 1355.0, 2),
("lettuce"  , "vegetables"  , 2.23  , 80),
("table"    , "home"        , 45.33 , 14 ),
("sofa"     , "home"        , 699.99, 6),
("water"    , "home"        ,1.00   , 1000),
("TV"       , "electronics" , 266.99, 14),
("bulb LED" , "home"        , 2.99  , 1500),
("freezer"  , "home"        , 799.99, 4);

INSERT INTO departments(department_name, over_head_costs) VALUES
("sweet", 200),
("home", 300),
("vegetables", 440),
("electronics", 350);
/*update bamazon.products set stock_quantity = 1450 where item_id = 9 and stock_quantity = 10 where item_id = 6;*/
select * from bamazon.products;
