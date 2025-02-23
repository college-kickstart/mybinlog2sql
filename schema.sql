DROP DATABASE IF EXISTS test;
CREATE DATABASE IF NOT EXISTS test;
USE test;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100)
);

INSERT INTO users (username, email) VALUES
('alice', 'alice@example.com'),
('bob', 'bob@example.com'),
('charlie', 'charlie@example.com'),
('dave', 'dave@example.com'),
('eve', 'eve@example.com');

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(50),
  price DECIMAL(10,2)
);

INSERT INTO products (product_name, price) VALUES
('Widget', 19.99),
('Gadget', 29.99),
('Thingamajig', 9.99),
('Doodad', 14.49),
('Gizmo', 24.95);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT
);

INSERT INTO orders (user_id, product_id) VALUES
(1, 2),
(2, 3),
(3, 1),
(4, 4),
(5, 5);
