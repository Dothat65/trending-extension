from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import isodate
import os
from dotenv import load_dotenv
from google import genai
from urllib.parse import quote
import sqlite3


app = Flask(__name__)
CORS(app)
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

# @app.route('/', methods=['GET'])
# def main():
#     reviews = getYelpReviews("Sakura Japanese Restaurant", "4713 Kirkwood Hwy, Wilmington, DE 19808")
#     return jsonify(reviews)

@app.route('/getData', methods = ['GET'])
def getData():
    name = request.args.get('name')
    address = request.args.get('address')
    location = name + " " + address    
    print(location)
    if not location:
        return jsonify({'error': 'Missing location parameters'}), 400
    
    if name == "testing" or address == "testing":
        return
    
    dictionary = dict()
    reviews = getGoogleReviews(location)
    dictionary["pros"] = getPoints(reviews, "positive")
    dictionary["cons"] = getPoints(reviews, "negative")
    dictionary["shorts"] = getShorts(location)
    print("Complete")
    return jsonify(dictionary)


def getYelpReviews(name, address):
    address = address.strip()
    partsOfAddress = address.split(",") # [Street, City, State + Postal Code]
    print(partsOfAddress)
    state_zip = partsOfAddress[2].split(" ")

    connection = sqlite3.connect("database/yelp.db")
    cursor = connection.cursor()

    cursor.execute('''
        SELECT id FROM users
        WHERE name = ? AND address = ? AND state = ? AND postal_code = ?
    ''', (name, partsOfAddress[0].strip(), state_zip[1], state_zip[2]))

    row = cursor.fetchone()
    if not row:
        return []

    business_id = row[0]
    
    cursor.execute('''
        SELECT review from reviews where id = ?
    ''', (business_id,))

    reviews = cursor.fetchall()

    cursor.execute('''
        SELECT tip from tips where id = ?
    ''', (business_id,))

    tips = cursor.fetchall()

    return tips + reviews

def getGoogleReviews(location):
    post_data = {
        "textQuery": location
    }

    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.reviews,places.reviewSummary'
    }

    try:
        response = requests.post(
            'https://places.googleapis.com/v1/places:searchText', 
            data=json.dumps(post_data), 
            headers=headers
        )
        
        data = response.json()
        #print(data)
        if 'places' not in data:
            return 

        google_reviews = data['places'][0]["reviews"]

        reviews = [review["text"]["text"] for review in google_reviews]
        reviews.append(data['places'][0]["reviewSummary"]["text"]["text"])

        return reviews

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
def getShorts(location):
    ids = getVideoIDs(location)
    if len(ids) <= 0:
        return []

    shorts = []
    for id in ids:
        url = f"https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id={id}&key={GOOGLE_API_KEY}"

        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            duration = getDuration(data["items"][0]["contentDetails"]["duration"])
            if duration < 60:
                shorts.append(id)

        else:
            print(f"Error: {response.status_code}, {response.text}")
            continue  # Don't return error response here, just continue
    
    return shorts[:4]
    

def getVideoIDs(location):
    encoded_location = quote(location)
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={encoded_location}&type=video&videoDuration=short&maxResults=50&key={GOOGLE_API_KEY}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        videoIDs = [video["id"]["videoId"] for video in data["items"]]
        return videoIDs
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return []

def getDuration(duration):
    time = isodate.parse_duration(duration)
    return int(time.total_seconds())

def getPoints(reviews, reviews2, reviewTone, existingPoints):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"""
        You are given a list of customer reviews and a list of existing summarized points.

        Goal:
        - Identify up to 3 distinct {reviewTone.lower()} aspects commonly mentioned across all reviews.
        - Do not duplicate any themes already present in the existing points.
        - Each identified aspect must be a single-line summary starting with a capital letter, no space after commas, and no period, but there should still be a space between words.

        Input:
        Reviews:
        {reviews}
        {reviews2}

        Existing Points (Do not repeat themes from these):
        {existingPoints}

        Output Format:
        - Return a single string with the identified aspects separated by commas.
        - Do not include bullet points, newlines, or introductory text.
        - If no valid aspects are identified, return an empty string: "".
        """
    )


    results = response.text
    results = results.rstrip('\n')

    points = []
    for point in results.split(","):
        tmp = point.strip()
        points.append(tmp + ".")

    return points

if __name__ == '__main__':
    app.run()