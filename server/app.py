from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import isodate
import os
from dotenv import load_dotenv
from google import genai
from urllib.parse import quote

app = Flask(__name__)
CORS(app)
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

# @app.route("/", methods = ['GET'])
# def main():
#     return jsonify(GOOGLE_API_KEY)


@app.route('/getData', methods = ['GET'])
def getData():
    location = request.args.get('location')
    if not location:
        return jsonify({'error': 'Missing location parameters'}), 400
    
    dictionary = dict()
    reviews = getGoogleReviews(location)
    dictionary["pros"] = getPoints(reviews, "positive")
    dictionary["cons"] = getPoints(reviews, "negative")
    dictionary["shorts"] = getShorts(location)
    return jsonify(dictionary)


def getGoogleReviews(location):
    post_data = {
        "textQuery": location
    }

    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.reviews'
    }

    try:
        response = requests.post(
            'https://places.googleapis.com/v1/places:searchText', 
            data=json.dumps(post_data), 
            headers=headers
        )
        
        data = response.json()

        if 'places' not in data:
            return 

        google_reviews = data['places'][0]["reviews"]

        reviews = [review["text"]["text"] for review in google_reviews]

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
                shorts.append("https://www.youtube.com/watch?v=" + id)

        else:
            print(f"Error: {response.status_code}, {response.text}")
            continue  # Don't return error response here, just continue
    
    return shorts
    

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

def getPoints(reviews, reviewTone):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"""
            Given the following reviews:
            {reviews}

            Identify the common {reviewTone} aspects mentioned in these reviews. 
            Summarize these into at most 3 distinct points, with each point being a single line long.
            The start of each point should be capitalized, there should be no space after the comma, and no period.
            Finally, return these points as a comma-separated list.             
            Do not include any introductory phrases, bullet points, or new line symbols.
            If there are no {reviewTone} aspects identified in the reviews, return the word "".
        """,
    )

    results = response.text
    results = results.rstrip('\n')

    points = []
    for point in results.split(","):
        points.append(point + ".")

    return points

if __name__ == '__main__':
    app.run()
