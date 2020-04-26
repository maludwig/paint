# Todo List

### Installation

Install PHP, MySQL, and composer

Make a VirtualHost, ex: 
- C:\xampp\apache\conf\extra\httpd-vhosts.conf
- https://www.codementor.io/@magarrent/how-to-install-laravel-5-xampp-windows-du107u9ji

Install MySQL and:

```sql
CREATE USER 'homestead'@'localhost' IDENTIFIED VIA mysql_native_password USING '***';
GRANT USAGE ON *.* TO 'homestead'@'localhost' REQUIRE NONE WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;
CREATE DATABASE IF NOT EXISTS `homestead`;GRANT ALL PRIVILEGES ON `homestead`.* TO 'homestead'@'localhost';
```

Install Laravel, and configure .env file

# TODO

1. Fix the homepage
1. Make the paint window
