<?php

class ChallengeController {
    public function index() {
        $challenges = [
            [
                'id' => 1,
                'name' => 'Metadata Analysis - Card Challenge',
                'difficulty' => 'beginner-intermediate',
                'category' => 'metadata-analysis',
                'cards' => ['card_j.png', 'card_q.png', 'card_k.png', 'card_a.png']
            ],
            [
                'id' => 2,
                'name' => 'Bounty Hunt - Kartu S Challenge',
                'difficulty' => 'intermediate-hard',
                'category' => 'stream-cipher-stego',
                'cards' => ['card_s.png']
            ]
        ];
        Response::success($challenges);
    }

    public function downloadCard($filename) {
        $filepath = __DIR__ . '/../../challenges/cards/' . basename($filename);
        if (file_exists($filepath)) {
            header('Content-Type: image/png');
            header('Content-Length: ' . filesize($filepath));
            readfile($filepath);
            exit;
        } else {
            Response::error("Card not found", 404);
        }
    }
}
