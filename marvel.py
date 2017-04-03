from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os

app = Flask(__name__)

# Connect to MONGODB Database
MONGODB_HOST = 'ds151070.mlab.com:51070'
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'marvel')
COLLECTION_NAME = 'avengers-clean'
FIELDS = {'_id': False, 'Name-Alias': True, 'Appearances': True, 'Current': True, 'Gender': True,
          'Full-Reserve': True, 'Year': True, 'Honorary': True, 'Death1': True}


# Route to index to render the html template with the graphs
@app.route("/")
def index():
    return render_template("index.html")

# Route to connect to Mongo DB, get the data from the DB and store it in json_projects
@app.route("/marvel/avengers-clean")
def marvel_avengers():
    with MongoClient(MONGO_URI) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to a lower limit of 20000
        avengers = collection.find(projection=FIELDS, limit=20000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(avengers))


if __name__ == "__main__":
    app.run(debug=True)
