# Todo List

### Installation

Install PHP, MySQL, and composer

Make a VirtualHost, ex: 
- C:\xampp\apache\conf\extra\httpd-vhosts.conf
- https://www.codementor.io/@magarrent/how-to-install-laravel-5-xampp-windows-du107u9ji

Install MySQL and:

```sql
CREATE USER 'homestead'@'%' IDENTIFIED BY '...';
GRANT USAGE ON *.* TO 'homestead'@'%' REQUIRE NONE WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;
CREATE DATABASE IF NOT EXISTS `homestead`;
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER ON *.* TO 'homestead'@'%';
```

Install Laravel, and configure .env file

# TODO

1. Fix the homepage
1. Make the paint window
1. Fix #painting-list .created-timestamp
1. Secure paintings
