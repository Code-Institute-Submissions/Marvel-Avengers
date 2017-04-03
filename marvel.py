from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)

# Connect to MONGODB Database
MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'marvel'
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
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    avengers = collection.find(projection=FIELDS, limit=55000)
    json_avengers = []
    for avenger in avengers:
        json_avengers.append(avenger)
    json_avengers = json.dumps(json_avengers)
    connection.close()
    return json_avengers


if __name__ == "__main__":
    app.run()
