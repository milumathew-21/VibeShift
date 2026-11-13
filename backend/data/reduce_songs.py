# reduce_songs.py
# Makes a smaller songs.csv: up to 8 songs per mood for each language.

import shutil
from pathlib import Path
import pandas as pd

DATA = Path(__file__).parent
SONGS = DATA / "songs.csv"
BACKUP = DATA / "songs_400_backup.csv"
REVIEW = Path(r"C:\Users\NETHRA\Downloads\malayalam_review.csv")

LANGUAGES = ["Malayalam", "Hindi", "Tamil", "English"]
# Rarest moods first, so they get their songs before the common ones.
MOODS = ["calm", "angry", "sad", "neutral", "energetic", "happy"]
PER_MOOD = 8
OTHER_LANGUAGE_WORDS = ["kannada", "telugu", "tamil", "hindi"]

# Keep a safe copy of the 400-song list (only made once).
if not BACKUP.exists():
    shutil.copy(SONGS, BACKUP)

df = pd.read_csv(BACKUP)

# Remove "Malayalam" songs whose title names another language.
other = df["title"].str.lower().str.contains("|".join(OTHER_LANGUAGE_WORDS), na=False)
df = df[~((df["language"] == "Malayalam") & other)]

chosen = []
used_ids = set()
for lang in LANGUAGES:
    part = df[df["language"] == lang]
    for mood in MOODS:
        has_mood = part["mood_tags"].str.split("|").apply(lambda tags: mood in tags)
        pick = part[has_mood & ~part["id"].isin(used_ids)].head(PER_MOOD)
        used_ids.update(pick["id"])
        chosen.append(pick)

small = pd.concat(chosen)
small = small.sort_values(["language", "id"]).reset_index(drop=True)
small["id"] = range(1, len(small) + 1)
small.to_csv(SONGS, index=False)

# A short list of Malayalam songs for you to check by hand.
small[small["language"] == "Malayalam"][["id", "title", "artist"]].to_csv(REVIEW, index=False)

print("Saved", len(small), "songs")
print(small["language"].value_counts())
for mood in MOODS:
    count = small["mood_tags"].str.split("|").apply(lambda t: mood in t).sum()
    print(mood, count)