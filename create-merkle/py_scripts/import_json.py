import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# GET Mongo URI
mongo_uri = os.getenv('MONGO_URI')

client = MongoClient(mongo_uri) # MongoDB connection
db = client.get_database('tree_3') #db_name
collection = db.get_collection('tree') #get collection

#tree_chunks import
for i in range(4):
    with open(f'./data/chunks/tree_index_{i}.json', 'r') as file:
        data = json.load(file)
        collection.insert_many(data)
        print('JSON data inserted MongoDB')


collection = db.get_collection('address_list')

#addresses_chunks import
for i in range(4):
    with open(f'./data/chunks/address_index_{i}.json', 'r') as file:
        data = json.load(file)
        collection.insert_many(data)
        print('JSON data inserted MongoDB')