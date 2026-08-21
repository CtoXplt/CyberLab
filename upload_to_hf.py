"""
Upload CyberLab ke Hugging Face Spaces menggunakan upload_large_folder
yang mendukung Xet storage dan chunked commits.
"""
from huggingface_hub import HfApi

import os
TOKEN = os.environ.get("HF_TOKEN", "")  # Set via: $env:HF_TOKEN="hf_..."
REPO_ID = "CtoXplt/CyberLab"
FOLDER_PATH = "."

IGNORE = [
    # Dependencies
    "node_modules",
    "node_modules/**",
    "**/node_modules/**",
    "frontend/node_modules/**",
    # Build output
    "dist",
    "dist/**",
    "frontend/dist/**",
    # Uploads & secrets
    "backend/public/uploads/**",
    ".env",
    "*.env",
    ".env.*",
    # Git
    ".git/**",
    ".gitignore",
    ".gitattributes",
    # Logs & temp
    "*.log",
    "*.tmp",
    "*.temp",
    # OS
    ".DS_Store",
    "Thumbs.db",
    # This script itself
    "upload_to_hf.py",
    # Python cache
    "__pycache__/**",
    "*.pyc",
]

api = HfApi(token=TOKEN)

print("Mulai upload ke Hugging Face Spaces...")
print(f"Repo: {REPO_ID}")
print(f"Folder: {FOLDER_PATH}")
print("Memastikan Space sudah ada...")

# Pastikan space sudah ada (exist_ok=True agar tidak error jika sudah ada)
try:
    api.create_repo(
        repo_id=REPO_ID,
        repo_type="space",
        space_sdk="docker",
        private=False,
        exist_ok=True,
    )
    print("Space sudah siap.")
except Exception as e:
    print(f"Info create_repo: {e}")

print("\nMenggunakan upload_large_folder (chunked commit, lebih stabil)...\n")

api.upload_large_folder(
    repo_id=REPO_ID,
    repo_type="space",
    folder_path=FOLDER_PATH,
    ignore_patterns=IGNORE,
)

print("\n✅ Upload berhasil!")
print(f"Cek di: https://huggingface.co/spaces/{REPO_ID}")
