-- Add a new table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(50)
);

INSERT INTO categories (category_name) VALUES
('Electronics'),
('Books'),
('Clothing');

-- Rename a column in the users table
ALTER TABLE users CHANGE username user_name VARCHAR(50);

-- Change data type of a column in the products table
ALTER TABLE products MODIFY price FLOAT;

-- Add a new column to the orders table
ALTER TABLE orders ADD order_date DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add new rows to the users table
INSERT INTO users (user_name, email) VALUES
('frank', 'frank@example.com'),
('grace', 'grace@example.com');

-- Delete a row from the products table
DELETE FROM products WHERE product_name = 'Doodad';

-- Update some data in the orders table
UPDATE orders SET product_id = 2 WHERE id = 3;
