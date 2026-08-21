<?php

function checkRateLimit($key, $maxAttempts = 5, $windowSeconds = 60) {
    $hashKey = md5($key);
    $limitDir = __DIR__ . '/../../storage/rate_limits/';
    
    if (!is_dir($limitDir)) {
        mkdir($limitDir, 0755, true);
    }
    
    $limitFile = $limitDir . $hashKey . '.json';
    $now = time();
    $attempts = [];
    
    if (file_exists($limitFile)) {
        $content = file_get_contents($limitFile);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) {
                $attempts = array_filter($data, function($timestamp) use ($now, $windowSeconds) {
                    return ($now - $timestamp) < $windowSeconds;
                });
            }
        }
    }
    
    if (count($attempts) >= $maxAttempts) {
        Response::error("Rate limit exceeded. Please try again later.", 429);
    }
    
    $attempts[] = $now;
    file_put_contents($limitFile, json_encode(array_values($attempts)));
}
