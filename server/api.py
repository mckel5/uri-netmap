from flask import Flask, Response
from pymongo import MongoClient
from bson import json_util

app = Flask(__name__)

db_client = MongoClient()
db = db_client.netmap
nodes = db.node
sla_stats = db.sla_stats


@app.route("/api/source/<address>")
def source(address: str):
    return Response(
        json_util.dumps(sla_stats.find(filter={"src-ip": address}).to_list()), mimetype="application/json"
    )

@app.route("/api/dest/<address>")
def dest(address: str):
    return Response(
        json_util.dumps(sla_stats.find(filter={"dest-ip": address}).to_list()), mimetype="application/json"
    )