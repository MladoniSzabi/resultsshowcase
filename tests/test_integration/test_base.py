import pytest
from splinter import Browser
from dotenv import load_dotenv
import os
import time

browser = None
def setup_module(module):
    global browser
    load_dotenv("../.env")
    browser = Browser()
    
def test_show_settings():
    browser.visit(os.getenv("TEST_URL"))
    settings_modal = browser.find_by_id("settings-modal")[0]
    assert settings_modal.is_not_visible()

    settings_button = browser.find_by_id("setting-button")[0]
    settings_button.click()
    assert settings_modal.is_visible()

def teardown_module(module):
    browser.quit()