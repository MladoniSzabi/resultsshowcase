import pytest
from splinter import Browser
from dotenv import load_dotenv
import os
import time
import json
import math
from splinter.driver import ElementAPI

browser = None


def get_layer_count(data):
    max_contribution = 0
    for child in data["children"]:
        max_contribution = max(
            max_contribution, round(child["contribution"] * 100))

    max_contribution = math.ceil(max_contribution / 10) * 10
    category_count = {}
    for i in range(int(max_contribution)+1):
        category_count[i] = 0

    for child in data["children"]:
        category = math.ceil(round(
            child["contribution"]) * 10)
        category_count[category] += 1

    layer = 0
    category_to_layer = {}
    for i in range(int(max_contribution / 10), -1, -1):
        if category_count[i] != 0:
            category_to_layer[i] = layer
            layer += 1

    return layer


max_layer = 0
max_layer_graph = 0
for dirpath, dirnames, filenames in os.walk("results/consensus_graphlets/"):
    for filename in filenames:
        with open(os.path.join(dirpath, filename)) as f:
            data = json.load(f)
        layer_count = get_layer_count(data)
        if max_layer < layer_count:
            max_layer = layer_count
        max_layer_graph = data["id"]


def setup_module(module):
    global browser
    load_dotenv("../.env")
    browser = Browser()


# TODO:
def test_fits_screen_720p():
    browser.driver.set_window_size(720, 1280)
    browser.visit(os.path.join(os.getenv("TEST_URL"),
                  "graphid?id=") + max_layer_graph)
    rect = browser.evaluate_script(
        "document.getElementsByTagName('svg').getBoundingClientRect()")
    print(rect)


def teardown_module(module):
    browser.quit()
