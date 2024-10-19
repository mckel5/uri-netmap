from flask import Flask, Response
from flask_cors import CORS
from pymongo import MongoClient
from bson import json_util

app = Flask(__name__)
CORS(app)

db_client = MongoClient()
db = db_client.netmap
nodes = db.nodes
sla_stats = db.sla_stats


@app.route("/api/node/<hostname>/source")
def source(hostname: str):
    ip = nodes.find_one(filter={"hostname": hostname})["ip"]

    return Response(
        json_util.dumps(sla_stats.find(filter={"src-ip": ip}).to_list()),
        mimetype="application/json",
    )


@app.route("/api/node/<hostname>/target")
def target(hostname: str):
    ip = nodes.find_one(filter={"hostname": hostname})["ip"]

    return Response(
        json_util.dumps(sla_stats.find(filter={"dest-ip": ip}).to_list()),
        mimetype="application/json",
    )
