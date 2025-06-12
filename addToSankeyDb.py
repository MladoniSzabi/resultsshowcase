import brightway2 as bw
import bw2data as bd
import bw2io as bi
import bw2calc as bc
import bw2analyzer as bwa

import sqlite3
import os
import sys
import json

conn = sqlite3.connect("sankey.db")
cur = conn.cursor()

table = """CREATE TABLE IF NOT EXISTS sankey (
    activity TEXT,
    product TEXT,
    geography TEXT,
    cpc_code TEXT,
    cpc_name TEXT,
    layers INTEGER,
    path TEXT
)"""

cur.execute(table)
conn.commit()

PROJECT_NAME = 'default'
#PROJECT_NAME = 'ecoinvent-3.10-lci-4-2'
bd.projects.set_current(PROJECT_NAME)

DB_NAME="ecoinvent-3.11-cutoff"
#DB_NAME="ecoinvent-3.10-cutoff-2"
eidb = bd.Database(DB_NAME)

acts = {}

for act in eidb:
    sanitised_name = act['name'].replace("/", "_") + "_" + act['reference product'].replace("/", "_") + "_" + act["location"].lower()
    acts[sanitised_name] = act

def importSankey(filename):
    basename = os.path.basename(filename)
    basename = os.path.splitext(basename)[0]
    separator_pos = basename.rfind("_")
    layer_count = int(basename[separator_pos+1:])
    basename = basename[:separator_pos]
    if basename not in acts:
        print("Could not find activity for:", basename)
        return
    
    act = acts[basename]
    cpc = ""
    for cname, cval in act["classifications"]:
        if cname == "CPC":
            cpc = cval
    if cpc == "":
        cpc_name = ""
        cpc_code = ""
    else:
        separator = cpc.find(":")
        cpc_code = cpc[:separator]
        cpc_name = cpc[separator+2:]
    select_query = "SELECT rowid FROM sankey WHERE activity=? AND product=? AND geography=? AND layers=?"
    res = cur.execute(select_query, (act["name"], act["reference product"], act["location"], layer_count)).fetchone()
    if res != None:
        print("This diagram already exists,", filename)
        return
    insert_query = "INSERT INTO sankey (activity, product, geography, cpc_code, cpc_name, layers, path) VALUES (?,?,?,?,?,?,?)"
    cur.execute(insert_query, (act["name"], act["reference product"], act['location'], cpc_code, cpc_name, layer_count, filename))
    conn.commit()

def importFromText(text):
    files = [x.strip() for x in text.split('\n')]
    for file in files:
        importSankey(file)

if __name__ == "__main__":
    if len(sys.argv) <= 1:
        print("You need to provide a file to import")
        exit()
    
    with open(sys.argv[1]) as f:
        text = f.read()
    
    try:
        data = json.loads(text)
    except ValueError:
        importFromText(text)
        exit()
    
    if "nodes" in data and "edges" in data:
        importSankey(sys.argv[1])
        exit()
    
    if "files" in data:
        data = data["files"]
    
    if type(data) is list:
        for file in data:
            importSankey(file)
        exit()
    
    print("Could not identify format of file")
    print("Did not import anything")
    exit()
