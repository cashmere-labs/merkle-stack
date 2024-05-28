import pandas as pd
import json

df = pd.read_excel("./data/airdrop_raw/airdrop.xlsx", sheet_name="Sheet1")

df2 = df[["address","maxClaimable"]]
#to-wei
df2["maxClaimable"] = df2["maxClaimable"].mul(10**18)
#dropna-values
df2 = df2.dropna()
#convert-str
df_str = df2.applymap(lambda x: format(float(x), 'f') if isinstance(x, (int, float)) else x)
df_str['maxClaimable'] = df_str['maxClaimable'].apply(lambda x: "{:.6f}".format(float(x)).rstrip('0').rstrip('.'))

with open("data/airdrop_data.json", "w") as outfile:
    json.dump(json.loads(df_str[["address","maxClaimable"]].reset_index(drop=True).to_json(orient='values')),outfile)