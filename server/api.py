from flask import Flask, Response, request, abort
from flask_cors import CORS
from pymongo import MongoClient
from bson import json_util

app = Flask(__name__)
CORS(app)  # Prevents "Cross-Origin Request Blocked" errors

db = MongoClient().netmap


@app.route("/api/stats")
def stats():
    source_hostname = request.args.get("source")
    target_hostname = request.args.get("target")

    filter_options = {}

    if source_hostname:
        try:
            source_ip = db.nodes.find_one({"hostname": source_hostname})["ip"]
            filter_options["src-ip"] = source_ip
        except TypeError:
            filter_options["src-ip"] = None

    if target_hostname:
        try:
            target_ip = db.nodes.find_one({"hostname": target_hostname})["ip"]
            filter_options["dest-ip"] = target_ip
        except TypeError:
            filter_options["dest-ip"] = None

    result = db.sla_stats.find(filter_options).to_list()

    return Response(
        json_util.dumps(result),
        mimetype="application/json",
    )


@app.route("/api/nodes")
def all_nodes():
    hostname = request.args.get("hostname")
    ip = request.args.get("ip")

    filter_options = {}

    if hostname:
        filter_options["hostname"] = hostname
    if ip:
        filter_options["ip"] = ip

    if filter_options:
        # Return object if options specified
        # Hostnames and IPs are unique, so at most one object will be returned
        result = db.nodes.find_one(filter_options)
    else:
        # Return list of objects otherwise
        result = db.nodes.find().to_list()

    return Response(
        json_util.dumps(result),
        mimetype="application/json",
    )
