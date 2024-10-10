from os import getenv
from dotenv import load_dotenv
import netmiko
import json
from pymongo import MongoClient
from datetime import datetime
import re

load_dotenv()

db_client = MongoClient()
db = db_client.netmap

# Clear the statistics table
db.sla_stats.delete_many({})

for node in db.nodes.find():
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
            )["TABLE_stats"]["ROW_stats"]["TABLE_detail"]["ROW_detail"]

            # desired_keys: dict[str, type] = {
            #     "ds-jitter-avg": int,
            #     "ds-jitter-max": int,
            #     "ds-jitter-min": int,
            #     "ds-lat-ow-avg": int,
            #     "ds-lat-ow-max": int,
            #     "ds-lat-ow-min": int,
            #     "latest-start-time": datetime,
            #     "pkt-loss-ds": int,
            #     "pkt-loss-sd": int,
            #     "rtt-avg": int,
            #     "rtt-max": int,
            #     "rtt-min": int,
            #     "sd-jitter-avg": int,
            #     "sd-jitter-max": int,
            #     "sd-jitter-min": int,
            #     "sd-lat-ow-avg": int,
            #     "sd-lat-ow-max": int,
            #     "sd-lat-ow-min": int,
            # }

            # Filter out unnecessary data, converting values to proper data type if applicable
            # document = {k: sla_stats[k] for k in desired_keys}
            # document = {
            #     k: int(v) if desired_keys[k] is int else v for k, v in document.items()
            # }
            # document = dict()

            # for key, type in desired_keys.items():
            #     if type is int:
            #         document[key] = int(sla_stats[key])
            #     if type is datetime:
            #         document[key] = datetime.strptime(
            #             sla_stats[key], "%H:%M:%S.%f %Z %a %b %d %Y"
            #         )

            for stat_name in sla_stats:
                if stat_name == "latest-start-time":
                    sla_stats[stat_name] = datetime.strptime(
                        sla_stats[stat_name], "%H:%M:%S.%f %Z %a %b %d %Y"
                    )
                    continue

                sla_stats[stat_name] = int(sla_stats[stat_name])



            # '%H:%M:%S.%f %Z %a %b %d %Y'

            # # Convert values to integers, if applicable
            # document = {key: int(document[key]) if document[key].isdecimal() else document[key] for key in document.keys()}

            sla_stats["src-ip"] = source_address
            sla_stats["dest-ip"] = target_address
            sla_stats["successes"] = int(re.search("\d+", sla_stats["outstring1"]))
            sla_stats["failures"] = int(re.search("\d+", sla_stats["outstring2"]))

            db.sla_stats.insert_one(sla_stats)
