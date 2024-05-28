import pandas as pd
import json
import  math
f = open('./data/tree/tree.json')

json_o = json.load(f)

#Get tree leafs for chunks
df_tree = pd.DataFrame(json_o["tree"])

record_count = len(df_tree)
chunk_size = math.ceil(record_count / (4))

chunks = [df_tree.iloc[i:i+chunk_size] for i in range(0, record_count, chunk_size)]
for i, chunk in enumerate(chunks):
    with open(f"./data/chunks/tree_index_{i}.json", "w") as writefile:
        json_records = json.loads(chunk.reset_index().to_json(orient='records'))
        json.dump(json_records, writefile)

#Get tree adresses for chunks
df_values = pd.DataFrame(json_o["values"])
record_count = len(df_values)
chunk_size = math.ceil(record_count / (4))


chunks = [df_values.iloc[i:i+chunk_size] for i in range(0, record_count, chunk_size)]
for i, chunk in enumerate(chunks):
    with open(f"./data/chunks/address_index_{i}.json", "w") as writefile:
        json_records = json.loads(chunk.reset_index().to_json(orient='records'))
        json.dump(json_records, writefile)