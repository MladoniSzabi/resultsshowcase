import gzip
import os
import json
import sqlite3

from dotenv import load_dotenv
from flask import Flask, render_template, make_response, request, send_from_directory

from SQLiteDatabase import SQLiteDatabase

load_dotenv()


def is_debug():
    if not "DEBUG" in os.environ:
        return False

    debug_env_var = os.getenv("DEBUG")
    if debug_env_var == "1" or debug_env_var.lower() == "true":
        return True

    return False


if is_debug():
    os.environ["FLASK_DEBUG"] = "1"

app = Flask(__name__, static_url_path='', static_folder='frontend',
            template_folder='frontend/views')


def get_filters():
    return {
        'id': request.args.get('id'),
        'cpc_code': request.args.get('cpc-code'),
        'cpc_name': request.args.get('cpc-name'),
        'name': request.args.get('name'),
        'product': request.args.get('product'),
        'graph_type': request.args.get('graph-type'),
        'geography': request.args.get('geography'),
        'node_count': request.args.get('node-count'),
        'depth': request.args.get('depth'),
        'graph_id': request.args.get('graph_id'),

        'sort_by': request.args.get('sort-by'),
        'sort-order': request.args.get('sort-order')
    }


if not is_debug():
    print("Environment is Production")

    def compile_view(view_path):
        content = gzip.compress(render_template(view_path).encode('utf-8'), 9)
        response = make_response(content)
        response.headers['Content-length'] = len(content)
        response.headers['Content-encoding'] = 'gzip'
        return response

    with app.app_context():
        views = {
            "browse": compile_view('browse.html'),
            "graph": compile_view('graph.html'),
            "sankey": compile_view('sankey.html'),
            "carbon_prices": compile_view("TEMP_carbon_prices.html"),
            "llmresults": compile_view("TEMP_llmresults.html")
        }


@app.route('/')
def index():
    return browse()


@app.route('/browse')
def browse():
    if os.getenv("ENVIRONMENT") == "PROD":
        return views['browse']
    else:
        return render_template("browse.html")


@app.route('/graph')
def graph_view():
    if os.getenv("ENVIRONMENT") == "PROD":
        return views['graph']
    else:
        return render_template("graph.html")


@app.route("/api/graphs/total", methods=["GET"])
def get_graphs_count():
    filters = get_filters()

    with SQLiteDatabase("graphs.db") as db:
        query = db.generate_query(filters)
        result = db.get_count(query)
        return str(result)


@app.route("/api/graphs/page", methods=["GET"])
def get_graphs_page():
    filters = get_filters()

    page_number = int(request.args.get("page", 0))
    page_size = min(int(request.args.get("count", 0)), 50)

    with SQLiteDatabase("graphs.db") as db:
        query = db.generate_query(filters)
        collection = db.get_page(query, page_size, page_number)

        if len(collection) == 0:
            return "[]"

        return json.dumps(collection)


@app.route("/api/graph/<int:graph_id>", methods=["GET"])
def get_graph(graph_id):
    assert (graph_id >= 0)

    with SQLiteDatabase("graphs.db") as db:
        graph_entry = db.get_graph(graph_id, ["Path"])
        with open(graph_entry["path"]) as f:
            return f.read()


@app.route("/api/ping", methods=["GET"])
def ping():
    return ""


@app.route("/sankey")
def get_sankey():
    if os.getenv("ENVIRONMENT") == "PROD":
        return views['sankey']
    else:
        return render_template("sankey.html")


@app.route("/api/sankey/total", methods=["GET"])
def get_sankey_total_items():
    filters = get_filters()

    with SQLiteDatabase("sankey.db", "sankey") as db:
        query = db.generate_query(filters)
        result = db.get_count(query)
        return str(result)


@app.route("/api/sankey/page", methods=["GET"])
def get_sankey_page():
    filters = get_filters()

    page_number = int(request.args.get("page", 0))
    page_size = min(int(request.args.get("count", 0)), 50)

    with SQLiteDatabase("sankey.db", "sankey") as db:
        query = db.generate_query(filters)
        collection = db.get_page(query, page_size, page_number)

        if len(collection) == 0:
            return "[]"

        return json.dumps(collection)


@app.route("/llmresults")
def get_llm_results():
    if os.getenv("ENVIRONMENT") == "PROD":
        return views['llmresults']
    else:
        return render_template("TEMP_llmresults.html")


@app.route("/api/sankey/<int:sankey_id>")
def get_sankey_data(sankey_id):
    assert (sankey_id >= 0)

    with SQLiteDatabase("sankey.db", "sankey") as db:
        graph_entry = db.get_graph(sankey_id, ["path"])
        with open(graph_entry["path"]) as f:
            return f.read()


@app.route("/carbon_prices")
def get_carbon_prices_view():
    if os.getenv("ENVIRONMENT") == "PROD":
        return views['carbon_prices']
    else:
        return render_template("TEMP_carbon_prices.html")


@app.route("/api/carbonprices/map")
def get_world_map():
    return send_from_directory("results", "countries-50m.json")


@app.route("/api/carbonprices/data")
def get_carbon_prices():
    return send_from_directory("results", "carbon_prices.json")


@app.route("/nodecount")
def get_node_count_page():
    return render_template("node_count.html")


@app.route("/api/nodecount")
def get_node_count_data():
    return send_from_directory("results", "node-counts.json")


@app.route("/consensusgraphlets/browse")
def get_consensus_graphlet_browser():
    return render_template("consensus_graphlet_browse.html")


@app.route("/consensusgraphlets/graph")
def get_consensus_graphlet_view():
    return render_template("consensus_graphlet.html")


@app.route("/api/consensusgraphlets/page")
def get_consensus_graphlet_table():
    filters = get_filters()

    page_number = int(request.args.get("page", 0))
    page_size = min(int(request.args.get("count", 0)), 50)

    with SQLiteDatabase("consensus.db", "Graphs") as db:
        query = db.generate_query(filters)
        collection = db.get_page(query, page_size, page_number)

        if len(collection) == 0:
            return "[]"

        return json.dumps(collection)


@app.route("/api/consensusgraphlets/total")
def get_consensus_graphlet_total_count():
    filters = get_filters()

    with SQLiteDatabase("consensus.db", "Graphs") as db:
        query = db.generate_query(filters)
        result = db.get_count(query)
        return str(result)


@app.route("/api/consensusgraphlets/<int:graphid>")
def get_consensus_graphlet(graphid):
    assert (graphid > 0)

    with SQLiteDatabase("consensus.db", "Graphs") as db:
        graph_entry = db.get_graph(graphid, ["path"])
        with open(graph_entry["path"]) as f:
            return f.read()
