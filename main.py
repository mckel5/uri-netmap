from os import getenv
from dotenv import load_dotenv
import netmiko
import json
from pymongo import MongoClient

load_dotenv()

db_client = MongoClient()
db = db_client.netmap
nodes = db.node

for node in nodes.find():
    device = {
        "device_type": "cisco_ios",
        "ip": node["ip"],
        "username": getenv("MONITOR_USERNAME"),
        "password": getenv("MONITOR_PASSWORD"),
    }

    with netmiko.ConnectHandler(**device) as connection:
        sla_entries = json.loads(
            connection.send_command("show ip sla configuration | json")
        )["TABLE_configuration"]["ROW_configuration"]

        for entry in sla_entries:
            index = entry["index"]
            source_address = device["ip"]
            target_address = entry["dest-ip"]

            sla_stats = json.loads(
                connection.send_command(f"show ip sla statistics {index} | json")
            )
