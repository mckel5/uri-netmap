from os import getenv
from dotenv import load_dotenv
import netmiko
import json
from pymongo import MongoClient, database
from datetime import datetime
import re


def main():
    load_dotenv()

    db_client = MongoClient()
    db = db_client.netmap

    all_stats = scan_nodes(db)

    # Clear the statistics table
    db.sla_stats.delete_many({})

    for node_stats in all_stats:
        db.sla_stats.insert_many(node_stats)


def scan_nodes(db: database.Database) -> list[list[dict[str, any]]]:
    parsed_stats = []

    for node in db.nodes.find():
        device = {
            "device_type": "cisco_ios",
            "ip": node["ip"],
            "username": getenv("MONITOR_USERNAME"),
            "password": getenv("MONITOR_PASSWORD"),
        }

        with netmiko.ConnectHandler(**device) as connection:
            try:
                sla_configuration = json.loads(
                    connection.send_command("show ip sla configuration | json")
                )["TABLE_configuration"]["ROW_configuration"]
            except json.JSONDecodeError:
                # SLA is not configured on this device
                continue

            # Device will return a single object if only one entry exists
            if not isinstance(sla_configuration, list):
                sla_configuration = [sla_configuration]

            parsed_stats.append(
                format_sla_stats(sla_configuration, connection, device["ip"])
            )

    return parsed_stats


def format_sla_stats(
    sla_configuration: list[dict[str, str]],
    connection: netmiko.ConnectHandler,
    source_address: str,
) -> list[dict[str, any]]:
    result = []

    DESIRED_STATISTICS = {
        "ds-jitter-avg": "int",
        "ds-jitter-max": "int",
        "ds-jitter-min": "int",
        "ds-lat-ow-avg": "int",
        "ds-lat-ow-max": "int",
        "ds-lat-ow-min": "int",
        "latest-start-time": "date",
        "pkt-loss-ds": "int",
        "pkt-loss-sd": "int",
        "rtt-avg": "int",
        "rtt-max": "int",
        "rtt-min": "int",
        "sd-jitter-avg": "int",
        "sd-jitter-max": "int",
        "sd-jitter-min": "int",
        "sd-lat-ow-avg": "int",
        "sd-lat-ow-max": "int",
        "sd-lat-ow-min": "int",
    }

    for entry in sla_configuration:
        index = entry["index"]
        source_address = source_address
        target_address = entry["dest-ip"]

        sla_result = json.loads(
            connection.send_command(f"show ip sla statistics {index} | json")
        )["TABLE_stats"]["ROW_stats"]["TABLE_detail"]["ROW_detail"]

        formatted_result = {}

        # Convert data to proper types, if needed
        for statistic, datatype in DESIRED_STATISTICS.items():
            match datatype:
                case "int":
                    formatted_result[statistic] = int(sla_result[statistic])
                case "date":
                    formatted_result[statistic] = datetime.strptime(
                        sla_result[statistic], "%H:%M:%S.%f %Z %a %b %d %Y"
                    )

        formatted_result["src-ip"] = source_address
        formatted_result["dest-ip"] = target_address
        formatted_result["successes"] = int(
            re.search("\d+", sla_result["outstring1"]).group()
        )
        formatted_result["failures"] = int(
            re.search("\d+", sla_result["outstring2"]).group()
        )

        result.append(formatted_result)

    return result


if __name__ == "__main__":
    main()
