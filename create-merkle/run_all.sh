#!/bin/bash

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Run the Python and Node.js scripts in sequence
python py_scripts/extract_value.py
node merkleTree.js
python py_scripts/prepare_mongo.py
python py_scripts/import_json.py