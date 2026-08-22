<?php

require_once dirname(__DIR__, 2) . '/config/ctf.php';

class MetadataInjector
{
    private static function getCardsDir(): string
    {
        return dirname(__DIR__, 2) . '/challenges/cards';
    }

    public static function stripMetadataBlock(string $filepath): void
    {
        if (!file_exists($filepath)) {
            return;
        }
        $content = file_get_contents($filepath);
        $marker = "\n\n<!-- METADATA START -->";
        $pos = strpos($content, $marker);
        if ($pos !== false) {
            file_put_contents($filepath, substr($content, 0, $pos));
        }
    }

    public static function injectJpegComment(string $filepath, string $comment): void
    {
        $data = file_get_contents($filepath);
        if (substr($data, 0, 2) === "\xFF\xD8") {
            // Strip previous COM markers if any
            $cleanData = substr($data, 0, 2);
            $offset = 2;
            $len = strlen($data);
            while ($offset < $len) {
                if ($data[$offset] === "\xFF" && $offset + 1 < $len && ord($data[$offset + 1]) === 0xFE) {
                    $segLen = (ord($data[$offset + 2]) << 8) + ord($data[$offset + 3]);
                    $offset += 2 + $segLen;
                    continue;
                }
                if ($data[$offset] === "\xFF" && $offset + 1 < $len && ord($data[$offset + 1]) === 0xDA) { // SOS
                    $cleanData .= substr($data, $offset);
                    break;
                }
                $cleanData .= $data[$offset];
                $offset++;
            }

            // Build JPEG COM segment: 0xFF 0xFE + 2-byte length + comment
            $len = strlen($comment) + 2;
            $comSegment = "\xFF\xFE" . chr(($len >> 8) & 0xFF) . chr($len & 0xFF) . $comment;
            $newData = substr($cleanData, 0, 2) . $comSegment . substr($cleanData, 2);
            file_put_contents($filepath, $newData);
        }
    }

    public static function injectPngTextChunk(string $filepath, string $keyword, string $text): void
    {
        $data = file_get_contents($filepath);
        // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
        if (substr($data, 0, 8) === "\x89PNG\r\n\x1a\n") {
            // Build tEXt chunk: Keyword + null byte + text string
            $chunkData = $keyword . "\0" . $text;
            $length = strlen($chunkData);
            $type = 'tEXt';
            $crc = crc32($type . $chunkData);
            
            $chunk = pack('N', $length) . $type . $chunkData . pack('N', $crc);
            
            // Insert chunk right after IHDR chunk (typically offset 33)
            $ihdrPos = strpos($data, 'IHDR');
            if ($ihdrPos !== false) {
                $insertPos = $ihdrPos + 4 + 13 + 4; // IHDR + 13 bytes data + 4 bytes CRC
                $newData = substr($data, 0, $insertPos) . $chunk . substr($data, $insertPos);
                file_put_contents($filepath, $newData);
            }
        }
    }

    public static function injectCardS(string $comment, array $customMeta = []): bool
    {
        $filepath = self::getCardsDir() . '/card_s.png';
        if (!file_exists($filepath)) {
            // Try creating from template card_k or card_a if card_s is not present
            $template = self::getCardsDir() . '/card_k.png';
            if (file_exists($template)) {
                copy($template, $filepath);
            } else {
                return false;
            }
        }

        self::stripMetadataBlock($filepath);
        self::injectJpegComment($filepath, $comment);
        self::injectPngTextChunk($filepath, 'Comment', $comment);

        $defaultMeta = [
            'Title' => 'Spade Card - Special Bounty Challenge',
            'Author' => 'CyberSecLab',
            'Copyright' => 'For Educational CTF Lab Use Only',
            'Description' => 'Special Secret Card S - Bounty Challenge. Crack the cipher to unlock the prize!',
            'Comment' => $comment,
            'Algorithm' => 'XOR-HEX / Multi-Layer Stream Cipher',
            'Software' => 'CyberSecLab Bounty Engine v3.0',
            'CreationDate' => date('Y-m-d'),
        ];

        $meta = array_merge($defaultMeta, $customMeta);
        $metaBlock = "\n\n<!-- METADATA START -->\n";
        foreach ($meta as $key => $value) {
            $metaBlock .= "[$key] $value\n";
        }
        $metaBlock .= "<!-- METADATA END -->\n";

        return file_put_contents($filepath, $metaBlock, FILE_APPEND) !== false;
    }
}
