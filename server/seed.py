#!/usr/bin/env python3
"""Generate mock video files and seed the database."""
import os
import sqlite3
import struct
import time

DB_PATH = os.path.join(os.path.dirname(__file__), 'data.sqlite')
UPLOADS = os.path.join(os.path.dirname(__file__), 'uploads', 'videos')
THUMBS = os.path.join(os.path.dirname(__file__), 'uploads', 'thumbnails')
os.makedirs(UPLOADS, exist_ok=True)
os.makedirs(THUMBS, exist_ok=True)

def make_mock_video(path, duration_sec=10, width=640, height=360):
    """Create a minimal valid MP4 file."""
    # Minimal MP4 with a single black frame
    ftyp = b'\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42mp41'
    moov = b'\x00\x00\x00\x08moov'
    # Just write a valid enough file that browsers can open
    with open(path, 'wb') as f:
        f.write(ftyp)
        f.write(moov)
        # Pad to simulate duration
        f.write(b'\x00' * max(0, duration_sec * 100 - len(ftyp) - len(moov)))

def make_thumbnail(path, color=b'\x2d\x2d\x2d'):
    """Create a minimal PNG thumbnail."""
    # Minimal 1x1 PNG
    png = b'\x89PNG\r\n\x1a\n' \
          b'\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde' \
          b'\x00\x00\x00\x0cIDAT' + color + b'\x00\x00\x00\x00\x00\x00' \
          b'\x00\x00\x00\x00IEND\xaeB`\x82'
    with open(path, 'wb') as f:
        f.write(png)

series_data = [
    {
        "title": "Breaking Bad",
        "description": "A high school chemistry teacher turned methamphetamine producer.",
        "episodes": [
            ("Pilot", 1), ("Cat's in the Bag...", 2), ("...And the Bag's in the River", 3),
            ("Cancer Man", 4), ("Gray Matter", 5), ("Crazy Handful of Nothin'", 6),
        ]
    },
    {
        "title": "Stranger Things",
        "description": "When a young boy disappears, his mother and friends uncover a mystery.",
        "episodes": [
            ("Chapter One: The Vanishing of Will Byers", 1),
            ("Chapter Two: The Weirdo on Maple Street", 2),
            ("Chapter Three: Holly, Jolly", 3),
            ("Chapter Four: The Body", 4),
        ]
    },
    {
        "title": "The Office",
        "description": "A mockumentary on a group of typical office workers.",
        "episodes": [
            ("Pilot", 1), ("Diversity Day", 2), ("Health Care", 3),
            ("The Alliance", 4), ("Basketball", 5), ("Hot Girl", 6),
        ]
    },
    {
        "title": "Planet Earth",
        "description": "A stunning nature documentary series exploring the world's habitats.",
        "episodes": [
            ("From Pole to Pole", 1), ("Mountains", 2), ("Fresh Water", 3),
            ("Caves", 4), ("Deserts", 5), ("Ice Worlds", 6),
        ]
    },
]

db = sqlite3.connect(DB_PATH)
db.row_factory = sqlite3.Row
db.execute("PRAGMA foreign_keys = ON")

for s in series_data:
    thumb_file = f"thumb_{s['title'].lower().replace(' ', '_')}.png"
    make_thumbnail(os.path.join(THUMBS, thumb_file), color=b'\x2d\x2d\x2d' if s['title'] != 'Stranger Things' else b'\xcc\x00\x00')

    cur = db.execute(
        "INSERT INTO series (title, description, thumbnail) VALUES (?, ?, ?)",
        (s['title'], s['description'], thumb_file)
    )
    series_id = cur.lastrowid

    for ep_title, ep_num in s['episodes']:
        vid_file = f"vid_{series_id}_{ep_num}.mp4"
        make_mock_video(os.path.join(UPLOADS, vid_file), duration_sec=15)
        db.execute(
            "INSERT INTO videos (series_id, title, filename, filepath, episode_number) VALUES (?, ?, ?, ?, ?)",
            (series_id, ep_title, vid_file, f"uploads/videos/{vid_file}", ep_num)
        )
    print(f"  Created: {s['title']} ({len(s['episodes'])} episodes)")

db.commit()
db.close()
print("\nDone! 4 series with mock videos seeded.")
