<?php

class UploadController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function upload() {
        if (!isset($_FILES['file'])) {
            Response::error("No file uploaded", 400);
        }

        $file = $_FILES['file'];
        $originalName = $file['name'];
        $tmpName = $file['tmp_name'];

        // INTENTIONALLY VULNERABLE: No validation on file type or extension!
        $randomPrefix = substr(bin2hex(random_bytes(4)), 0, 8);
        $storedFilename = $randomPrefix . '_' . $originalName;

        $uploadDir = __DIR__ . '/../../public/uploads/';
        $destination = $uploadDir . $storedFilename;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (move_uploaded_file($tmpName, $destination)) {
            $userId = $_SESSION['user_id'] ?? null;
            $fileSize = $file['size'];
            $mimeType = $file['type'];

            // Use correct column names matching schema: filename, stored_filename, uploaded_by
            $stmt = $this->db->prepare(
                "INSERT INTO uploads (filename, stored_filename, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$originalName, $storedFilename, $fileSize, $mimeType, $userId]);

            // Update site_content to show defaced homepage
            $fileUrl = '/uploads/' . $storedFilename;
            $htmlContent = $this->buildDefaceContent($originalName, $fileUrl, $destination);
            
            // Replace custom content (delete old non-default, insert new one)
            $this->db->query("DELETE FROM site_content WHERE is_default = 0");
            $stmt2 = $this->db->prepare(
                "INSERT INTO site_content (title, content, is_default, updated_by) VALUES (?, ?, 0, ?)"
            );
            $stmt2->execute(['Custom Content', $htmlContent, $userId]);

            Response::success([
                'stored_filename' => $storedFilename,
                'original_filename' => $originalName,
                'url' => $fileUrl
            ], "File uploaded successfully");
        } else {
            Response::error("Failed to move uploaded file", 500);
        }
    }

    public function history() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM uploads");
        $stmt->execute();
        $total = $stmt->fetch()['total'];

        $stmt = $this->db->prepare("
            SELECT u.id, u.filename AS original_filename, u.stored_filename, u.uploaded_at, u.file_size, usr.username
            FROM uploads u
            LEFT JOIN users usr ON u.uploaded_by = usr.id
            ORDER BY u.uploaded_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindParam(1, $limit, PDO::PARAM_INT);
        $stmt->bindParam(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $uploads = $stmt->fetchAll();

        // Return as 'data' key to match frontend expectations
        Response::success([
            'data' => $uploads,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function restore() {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            Response::error("Forbidden: admin only", 403);
        }

        $this->db->query("DELETE FROM site_content WHERE is_default = 0");
        Response::success(null, "Homepage restored to default");
    }

    public function cleanAll() {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            Response::error("Forbidden: admin only", 403);
        }

        $uploadDir = __DIR__ . '/../../public/uploads/';
        $deletedCount = 0;
        if (is_dir($uploadDir)) {
            $files = glob($uploadDir . '*');
            if ($files) {
                foreach ($files as $filePath) {
                    if (is_file($filePath) && basename($filePath) !== '.gitkeep') {
                        @unlink($filePath);
                        $deletedCount++;
                    }
                }
            }
        }

        // Clean database records
        $this->db->query("DELETE FROM uploads");
        $this->db->query("DELETE FROM site_content WHERE is_default = 0");

        Response::success([
            'deleted_files' => $deletedCount
        ], "Berhasil menghapus $deletedCount file deface dan membersihkan riwayat upload.");
    }

    public function deleteSingle() {
        if (($_SESSION['role'] ?? '') !== 'admin') {
            Response::error("Forbidden: admin only", 403);
        }

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        $id = $data['id'] ?? ($_GET['id'] ?? null);

        if (!$id) {
            Response::error("Upload ID is required", 400);
        }

        $stmt = $this->db->prepare("SELECT * FROM uploads WHERE id = ?");
        $stmt->execute([$id]);
        $upload = $stmt->fetch();

        if (!$upload) {
            Response::error("File record not found", 404);
        }

        $uploadDir = __DIR__ . '/../../public/uploads/';
        $filePath = $uploadDir . $upload['stored_filename'];
        if (file_exists($filePath) && is_file($filePath)) {
            @unlink($filePath);
        }

        $stmtDel = $this->db->prepare("DELETE FROM uploads WHERE id = ?");
        $stmtDel->execute([$id]);

        // If no uploads remain, also restore homepage to default
        $remaining = $this->db->query("SELECT COUNT(*) as count FROM uploads")->fetch()['count'];
        if ($remaining == 0) {
            $this->db->query("DELETE FROM site_content WHERE is_default = 0");
        }

        Response::success(null, "File berhasil dihapus.");
    }

    private function buildDefaceContent(string $originalName, string $fileUrl, string $filePath): string {
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $safeName = htmlspecialchars($originalName, ENT_QUOTES, 'UTF-8');
        $safeUrl = htmlspecialchars($fileUrl, ENT_QUOTES, 'UTF-8');

        if ($ext === 'html' || $ext === 'htm') {
            if (file_exists($filePath)) {
                $rawContent = file_get_contents($filePath);
                if (!empty(trim($rawContent))) {
                    return $rawContent;
                }
            }
        }

        if ($ext === 'php') {
            return "<div class=\"deface-card\">"
                . "<div class=\"deface-badge\">🚨 SYSTEM COMPROMISED - WEB SHELL ACTIVE</div>"
                . "<h1 class=\"deface-title\">HACKED / DEFACED</h1>"
                . "<p class=\"deface-desc\">Remote Code Execution payload / Web Shell berhasil diupload ke server!</p>"
                . "<div class=\"deface-details\">"
                . "  <div class=\"deface-row\"><span class=\"label\">Uploaded Shell:</span> <code>$safeName</code></div>"
                . "  <div class=\"deface-row\"><span class=\"label\">Shell Endpoint:</span> <code>$safeUrl</code></div>"
                . "</div>"
                . "<div class=\"deface-actions\">"
                . "  <a href=\"$safeUrl\" target=\"_blank\" rel=\"noopener\" class=\"deface-btn deface-btn--primary\">⚡ Akses Web Shell Sekarang</a>"
                . "</div>"
                . "</div>";
        }

        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'], true)) {
            return "<div class=\"deface-card\">"
                . "<div class=\"deface-badge\">⚠️ SITE DEFACED</div>"
                . "<h1 class=\"deface-title\">THIS SITE HAS BEEN DEFACED</h1>"
                . "<p class=\"deface-desc\">Gambar deface berhasil menggantikan tampilan utama situs.</p>"
                . "<div class=\"deface-image-container\">"
                . "  <img src=\"$safeUrl\" alt=\"Deface Image\" class=\"deface-image\" />"
                . "</div>"
                . "</div>";
        }

        return "<div class=\"deface-card\">"
            . "<div class=\"deface-badge\">⚠️ SITE CONTENT MODIFIED</div>"
            . "<h1 class=\"deface-title\">CUSTOM CONTENT APPLIED</h1>"
            . "<p class=\"deface-desc\">File baru telah diupload: <strong>$safeName</strong></p>"
            . "<div class=\"deface-actions\">"
            . "  <a href=\"$safeUrl\" target=\"_blank\" rel=\"noopener\" class=\"deface-btn\">Lihat File</a>"
            . "</div>"
            . "</div>";
    }
}

