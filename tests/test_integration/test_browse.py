import pytest
from splinter import Browser
from dotenv import load_dotenv
import os
import time
from splinter.driver import ElementAPI

browser = None


def setup_module(module):
    global browser
    load_dotenv("../.env")
    browser = Browser()


def test_load():
    browser.visit(os.getenv("TEST_URL"))
    table = browser.find_by_id("table-container").first
    assert table.is_visible()

    table_body = browser.find_by_id("graphs-table").first
    assert table_body.is_visible()
    rows = table_body.find_by_css("#graphs-table>*")
    assert len(rows) == 5


def test_pagination_size():
    browser.visit(os.getenv("TEST_URL"))
    table_body = browser.find_by_id("graphs-table").first
    rows = table_body.find_by_css("#graphs-table>*")
    assert len(rows) == 5

    pagination_page_size = browser.find_by_id("pagination-page-size")
    pagination_page_size.select("25")
    time.sleep(1)
    rows = table_body.find_by_css("#graphs-table>*")
    assert len(rows) == 25


def teardown_module(module):
    browser.quit()
