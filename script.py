import os
import json

for diet in os.listdir("results/diets/food_clustering/"):
    for graphname in os.listdir("results/diets/food_clustering/" + diet):
        with open(os.path.join("results/diets/food_clustering/", diet, graphname)) as f:
            graph = json.load(f)

        print(diet, graphname)
        for i in range(len(graph['links'])):
            graph['links'][i]['targetIndex'] = graph['links'][i]['valueIndex']
            # del graph['links'][i]['valueIndex']

        with open(os.path.join("results/diets/food_clustering/", diet, graphname), "w") as f:
            json.dump(graph, f)
