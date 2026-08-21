<?php

class Response {
    public static function success($data = null, $message = "", $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => true,
            "data" => $data,
            "message" => $message,
            "errors" => []
        ]);
        exit;
    }

    public static function error($message = "", $code = 400, $errors = []) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            "success" => false,
            "data" => null,
            "message" => $message,
            "errors" => $errors
        ]);
        exit;
    }
}
