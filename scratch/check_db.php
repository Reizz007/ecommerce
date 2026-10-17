<?php
$pdo = new PDO('sqlite:laravel-backend/database/database.sqlite');
$stmt = $pdo->query('SELECT * FROM settings');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
