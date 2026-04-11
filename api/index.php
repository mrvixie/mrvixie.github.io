<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$dataFile = __DIR__ . '/data/posts.json';
$ordersFile = __DIR__ . '/data/orders.json';
$settingsFile = __DIR__ . '/data/settings.json';

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

function readJson($file) {
    if (!file_exists($file)) {
        file_put_contents($file, json_encode(['posts' => [], 'orders' => [], 'settings' => []]));
    }
    return json_decode(file_get_contents($file), true);
}

function writeJson($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function auth($token) {
    $storedToken = file_get_contents(__DIR__ . '/.token');
    return $token === $storedToken;
}

function getToken() {
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    return str_replace('Bearer ', '', $token);
}

if (preg_match('#/api/health#', $requestUri)) {
    echo json_encode(['status' => 'ok', 'timestamp' => time()]);
    exit;
}

if (preg_match('#/api/posts#', $requestUri)) {
    $data = readJson($dataFile);
    
    if ($method === 'GET') {
        $category = $_GET['category'] ?? null;
        $posts = $category ? array_filter($data['posts'], fn($p) => $p['category'] === $category) : $data['posts'];
        echo json_encode(['posts' => array_values($posts)]);
    }
    exit;
}

if (preg_match('#/api/orders#', $requestUri)) {
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $data = readJson($ordersFile);
        $input['id'] = time();
        $input['date'] = date('Y-m-d H:i:s');
        $input['status'] = 'new';
        $data['orders'][] = $input;
        writeJson($ordersFile, $data);
        echo json_encode(['success' => true, 'id' => $input['id']]);
    }
    exit;
}

if (preg_match('#/api/admin/auth#', $requestUri)) {
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';
        
        $storedPass = trim(file_get_contents(__DIR__ . '/.password'));
        
        if ($password === $storedPass && strlen($password) === 39) {
            $token = bin2hex(random_bytes(32));
            file_put_contents(__DIR__ . '/.token', $token);
            echo json_encode(['success' => true, 'token' => $token]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid password']);
        }
    }
    exit;
}

if (preg_match('#/api/admin/posts#', $requestUri) && auth(getToken())) {
    $data = readJson($dataFile);
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $input['id'] = time();
        $input['date'] = date('Y-m-d');
        $data['posts'][] = $input;
        writeJson($dataFile, $data);
        echo json_encode(['success' => true]);
    }
    exit;
}

if (preg_match('#/api/admin/orders#', $requestUri) && auth(getToken())) {
    $data = readJson($ordersFile);
    echo json_encode($data);
    exit;
}

if (preg_match('#/api/admin/settings#', $requestUri) && auth(getToken())) {
    $data = readJson($settingsFile);
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $data['settings'] = array_merge($data['settings'] ?? [], $input);
        writeJson($settingsFile, $data);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode($data['settings'] ?? []);
    }
    exit;
}

if (preg_match('#/api/admin/stats#', $requestUri) && auth(getToken())) {
    $posts = readJson($dataFile);
    $orders = readJson($ordersFile);
    echo json_encode([
        'posts' => count($posts['posts']),
        'orders' => count($orders['orders']),
        'shopItems' => 6,
        'galleryItems' => 8
    ]);
    exit;
}

echo json_encode(['error' => 'Not found', 'path' => $requestUri]);
