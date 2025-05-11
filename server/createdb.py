import sqlite3
import json

# Create database connection
connection = sqlite3.connect("database/yelp.db")
cursor = connection.cursor()

# Create 'users' table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id STRING PRIMARY KEY,
    name TEXT,
    address TEXT,
    state TEXT,
    postal_code INTEGER,
    reviews INTEGER,
    rating DOUBLE
)
''')

# Open file and insert users data line by line
# with open("YelpData/yelp_business.json", "r") as file:
#     for line in file:
#         item = json.loads(line)
#         if item.get('categories') and "Restaurants" in item['categories']:
#             cursor.execute('''
#             INSERT OR IGNORE INTO users (id, name, address, state, postal_code, reviews, rating)
#             VALUES (?, ?, ?, ?, ?, ?, ?)
#             ''', (item['business_id'], item['name'], item['address'], item['state'], item['postal_code'], item['review_count'], item['stars']))

# Create 'reviews' table
cursor.execute('''
CREATE TABLE IF NOT EXISTS reviews (
    id STRING,
    review TEXT,
    stars INTEGER,
    date TEXT
)
''')

# Open file and insert reviews data line by line
# with open("YelpData/yelp_review.json", "r") as file:
#     for line in file:
#         item = json.loads(line)
#         cursor.execute('''
#         INSERT OR IGNORE INTO reviews (id, review, stars, date)
#         VALUES (?, ?, ?, ?)
#         ''', (item['business_id'], item['text'], item['stars'], item['date']))

# Create 'tips' table
cursor.execute('''
CREATE TABLE IF NOT EXISTS tips (
    id STRING,
    tip TEXT,
    date TEXT
)
''')

# Open file and insert tips data line by line
with open("YelpData/yelp_tip.json", "r") as file:
    for line in file:
        item = json.loads(line)
        cursor.execute('''
        INSERT OR IGNORE INTO tips (id, tip, date)
        VALUES (?, ?, ?)
        ''', (item['business_id'], item['text'], item['date']))

# Commit changes and close connection
connection.commit()
connection.close()
