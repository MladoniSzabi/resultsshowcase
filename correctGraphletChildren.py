import os
import json

folder = "data/steel/graphlets"
files = os.listdir(folder)


def parseTree(tree):
    if len(tree["children"]) == 0:
        if tree["name"] == 'Production Processes':
            tree["expandable"] = False
            return
        if "graphId" in tree or (tree["activityID"] + "_" + tree["productID"] + ".json" in files):
            tree["expandable"] = True
        else:
            tree["expandable"] = False
    else:
        tree["expandable"] = False
        for child in tree["children"]:
            parseTree(child)


def parseRegion(tree):
    if len(tree["children"]) == 0:
        if tree["activityID"] + "_" + tree["productID"] + ".json" in files:
            tree["expandable"] = True
        else:
            tree["expandable"] = False
    else:
        for child in tree["children"]:
            parseRegion(child)


for file in os.listdir(folder):
    with open(folder + "/" + file) as f:
        data = json.load(f)
    parseTree(data)
    with open(folder + "/" + file, "w") as f:
        json.dump(data, f)

# for file in os.listdir("data/regions"):
#     with open("data/regions/" + file) as f:
#         data = json.load(f)
#     parseRegion(data)
#     with open("data/regions/" + file, "w") as f:
#         json.dump(data, f)
