<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$discordId = $_GET['discordId'] ?? $_POST['discordId'] ?? '';

if ($action !== 'check_admin' || !$discordId) {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit();
}

// === CONFIGURA AQUI ===
$DISCORD_SERVER_ID = getenv('DISCORD_SERVER_ID');
$DISCORD_BOT_TOKEN = getenv('DISCORD_BOT_TOKEN');
$ADMIN_ROLE_ID = '1246102365203988695'; // ← SEU CARGO DE ADMIN
// ======================

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://discord.com/api/v10/guilds/$DISCORD_SERVER_ID/members/$discordId");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bot $DISCORD_BOT_TOKEN"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode([
        'success' => true,
        'isAdmin' => false,
        'rank' => 0
    ]);
    exit();
}

$member = json_decode($response, true);

$isAdmin = in_array($ADMIN_ROLE_ID, $member['roles'] ?? []);

echo json_encode([
    'success' => true,
    'isAdmin' => $isAdmin,
    'rank' => $isAdmin ? 10 : 0,
    'user' => [
        'id' => $member['user']['id'],
        'username' => $member['user']['global_name'] ?? $member['user']['username'],
        'avatar' => $member['user']['avatar']
            ? "https://cdn.discordapp.com/avatars/{$member['user']['id']}/{$member['user']['avatar']}.png"
            : null
    ]
]);
