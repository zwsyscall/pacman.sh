import os
import json
import re
import datetime
import http.server
import socketserver
from pathlib import Path

PORT = 8000
DOCS_DIR = 'docs'
METADATA_FILE = 'metadata.json'

def generate_metadata():
    print(f"Scanning '{DOCS_DIR}/' for markdown files...")
    metadata = []
    
    if not os.path.exists(DOCS_DIR):
        print(f"Error: Directory '{DOCS_DIR}' not found.")
        return

    docs_path = Path(DOCS_DIR)
    
    for file_path in docs_path.rglob('*.md'):
        rel_path = file_path.relative_to(docs_path).as_posix()
        
        title = file_path.stem
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                match = re.search(r'^#\s+(.*)', content, re.MULTILINE)
                if match:
                    title = match.group(1).strip()
        except Exception as e:
            print(f"Warning: Could not read {file_path}: {e}")

        stat = file_path.stat()
        date_timestamp = getattr(stat, 'st_birthtime', stat.st_mtime)
        date_str = datetime.datetime.fromtimestamp(date_timestamp, tz=datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')

        parts = rel_path.split('/')
        folder = parts[0] if len(parts) > 1 else 'root'
        post_id = rel_path.replace('.md', '').replace('/', '-')

        metadata.append({
            "id": post_id,
            "title": title,
            "file": f"{DOCS_DIR}/{rel_path}",
            "date": date_str,
            "folder": folder
        })

    metadata.sort(key=lambda x: x['date'], reverse=True)

    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"'{METADATA_FILE}' generated successfully with {len(metadata)} posts.")

def start_server():
    class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            super().end_headers()

    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Serving local blog at: http://localhost:{PORT}")
        print("Press CTRL+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shutting down...")

if __name__ == '__main__':
    generate_metadata()
    start_server()
    
    if os.path.exists(METADATA_FILE):
        print(f"Cleaning up: removing '{METADATA_FILE}'...")
        os.remove(METADATA_FILE)
        print("Cleanup complete.\nGoodbye")