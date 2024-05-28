# Project Setup Instructions

To set up this project, please follow the instructions below:

## Prerequisites

- Node.js installed on your system
- Python 3.x installed on your system
- MongoDB running and accessible

## Steps

1. **Upload the Excel File**:
   - Upload an Excel file with columns `address` and `maxclaimable` to the `data/airdrop_raw/airdrop.xlsx` directory.

2. **Update Environment Variables**:
   - Open the `env.example` file.
   - Update the `MONGO_URI` with your MongoDB URI.
   - Rename the file to `.env` by removing the `.example` extension.

3. **Install Dependencies**:
   - Open a terminal and navigate to the project directory.
   - Run the following command to install Node.js dependencies:
     ```bash
     npm install
     ```
   - Run the following command to install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```

4. **Run the Scripts**:
   - Execute the following commands in sequence:
     ```bash
     python py_scripts/extract_value.py
     node merkleTree.js
     python py_scripts/prepare_mongo.py
     python py_scripts/import_json.py
     ```

Alternatively, you can run the provided bash script to execute all the steps in sequence.

## Bash Script

Save the following script as `run_all.sh` and execute it to perform all the steps in sequence:

```bash
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
```
```bash
Directory Structure
project-root/
├── data/
│   └── airdrop_raw/
│       └── airdrop.xlsx
│   └── chunks/
│       └── tree_index_(n).xlsx
│       └── tree_index_(n+1).xlsx
│       └── address_index_(n).xlsx
│       └── address_index_(n+1).xlsx
│   └── tree/
│       └── tree.json
│   └── airdrop_data.json
├── py_scripts/
│   ├── extract_value.py
│   ├── prepare_mongo.py
│   └── import_json.py
├── merkleTree.js
├── requirements.txt
├── env
├── env.example
├── run_all.sh
└── README.md
```
