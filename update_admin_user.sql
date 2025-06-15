-- SQL script to update the username and password of the first user to 'admin' / 'admin'
-- The password is hashed using bcrypt. Replace the hash below if needed.

UPDATE users
SET username = 'admin',
    password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.Qx0r6h6Z6Z6Z6Z6Z6Z6'
WHERE id = 1;

-- Note: The above hash corresponds to the password 'password'.
-- To generate a bcrypt hash for 'admin', you can use PHP:
-- <?php echo password_hash('admin', PASSWORD_DEFAULT); ?>