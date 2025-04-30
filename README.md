# Trending Chrome Extension

## How to run the server

1. Create a virtual environment:

   ```
   python3 -m venv myenv
   ```

2. Activate the virtual environment:

   - On Mac/Linux:
     ```
     source myenv/bin/activate
     ```

3. Install the requirements:

   ```
   pip install -r requirements.txt
   ```

4. In the server directory, create a file named `.env`

5. In `.env`, include the following:

   ```
    GOOGLE_API_KEY = ""
    GEMINI_API_KEY = ""
   ```

6. Run the Flask Server:
   ```
    flask run
   ```
