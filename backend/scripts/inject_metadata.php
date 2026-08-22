<?php
/**
 * Metadata Injection Script (No GD Required)
 *
 * Appends searchable text metadata to card PNG files.
 * Discoverable with: strings, exiftool, or hex/text search.
 *
 * Usage: php backend/scripts/inject_metadata.php
 */

require_once __DIR__ . '/../config/ctf.php';

$cardsDir = __DIR__ . '/../challenges/cards';

$cardMetadata = [
    'card_j.png' => [
        'Title' => 'Jack Card - Cyber Security Lab',
        'Author' => 'CyberSecLab',
        'Copyright' => 'For Educational Use Only',
        'Description' => 'Jack of Spades - Challenge Card',
        'Comment' => 'coba pilih kartu yang lain',
        'Software' => 'CyberSecLab Card Generator v1.0',
        'CreationDate' => '2025-07-15',
    ],
    'card_q.png' => [
        'Title' => 'Queen Card - Cyber Security Lab',
        'Author' => 'CyberSecLab',
        'Copyright' => 'For Educational Use Only',
        'Description' => 'Queen of Hearts - Challenge Card',
        'Comment' => 'coba pilih kartu yang lain',
        'Software' => 'CyberSecLab Card Generator v1.0',
        'CreationDate' => '2025-07-15',
    ],
    'card_k.png' => [
        'Title' => 'King Card - Cyber Security Lab',
        'Author' => 'CyberSecLab',
        'Copyright' => 'For Educational Use Only',
        'Description' => 'King of Diamonds - Challenge Card. Something is encoded here.',
        'Comment' => CTF_BASE64_PAYLOAD,
        'Encoding' => 'base64',
        'Software' => 'CyberSecLab Card Generator v2.0',
        'CreationDate' => '2026-03-01',
    ],
    'card_a.png' => [
        'Title' => 'Ace Card - Cyber Security Lab',
        'Author' => 'CyberSecLab',
        'Copyright' => 'For Educational Use Only',
        'Description' => 'Ace of Clubs - Challenge Card',
        'Comment' => 'coba pilih kartu yang lain',
        'Software' => 'CyberSecLab Card Generator v1.0',
        'CreationDate' => '2025-07-15',
    ],
    'card_s.png' => [
        'Title' => 'Spade Card - Special Bounty Challenge',
        'Author' => 'CyberSecLab',
        'Copyright' => 'For Educational CTF Lab Use Only',
        'Description' => 'Special Secret Card S - Bounty Challenge. Crack the cipher to unlock the prize!',
        'Comment' => 'CIPHER: ' . ctf_xor_encrypt(CTF_BOUNTY_DEFAULT_FLAG, CTF_BOUNTY_DEFAULT_KEY) . ' | Key: ' . CTF_BOUNTY_DEFAULT_KEY . ' | Type: XOR-HEX',
        'Encoding' => 'xor-hex',
        'Software' => 'CyberSecLab Bounty Engine v3.0',
        'CreationDate' => '2026-03-01',
    ],
];

function stripMetadataBlock(string $filepath): void
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

function injectJpegComment(string $filepath, string $comment): void
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
        // Insert right after SOI (0xFF 0xD8)
        $newData = substr($cleanData, 0, 2) . $comSegment . substr($cleanData, 2);
        file_put_contents($filepath, $newData);
    }
}

echo "=== EXIF Metadata Injection ===\n\n";

foreach ($cardMetadata as $filename => $metadata) {
    $filepath = $cardsDir . '/' . $filename;

    if (!file_exists($filepath)) {
        // If card_s is missing, duplicate from template
        if ($filename === 'card_s.png' && file_exists($cardsDir . '/card_k.png')) {
            copy($cardsDir . '/card_k.png', $filepath);
        } else {
            echo "[SKIP] $filename - file not found\n";
            continue;
        }
    }

    stripMetadataBlock($filepath);

    if (isset($metadata['Comment'])) {
        injectJpegComment($filepath, $metadata['Comment']);
    }

    $metaBlock = "\n\n<!-- METADATA START -->\n";
    foreach ($metadata as $key => $value) {
        $metaBlock .= "[$key] $value\n";
    }
    $metaBlock .= "<!-- METADATA END -->\n";

    file_put_contents($filepath, $metaBlock, FILE_APPEND);

    $flagIndicator = ($filename === 'card_k.png') ? ' << BASE64 PAYLOAD' : (($filename === 'card_s.png') ? ' << XOR-HEX CIPHER' : '');
    echo "[OK] $filename - metadata injected$flagIndicator\n";
}

echo "\n=== Done! ===\n";
echo "\nVerification:\n";
echo "  findstr /C:\"bWRfNG40\" backend\\challenges\\cards\\card_k.png\n";
echo "  Decode base64 → " . CTF_FLAG_INNER . "\n";
echo "  Flag → " . CTF_FLAG . "\n";
