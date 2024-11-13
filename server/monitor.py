from os import getenv
from dotenv import load_dotenv
import netmiko
import json
import netmiko.exceptions
from pymongo import MongoClient
from pymongo.synchronous.cursor import Cursor
from pymongo.collection import Collection
from dateutil.parser import parse as parse_date
import re
from typing import Any


def main():
    load_dotenv()

    db = MongoClient().netmap
    nodes = db.nodes.find()

    all_stats = scan_nodes(nodes)

    # Clear the statistics table
    db.sla_stats.delete_many({})

    for node_stats in all_stats:
        db.sla_stats.insert_many(node_stats)


def scan_nodes(nodes: Cursor) -> tuple[list[list[dict[str, Any]]], list[str]]:
    """Search each node for SLA entries"""

    parsed_stats = []

    for node in nodes:
        device = {
            "device_type": "cisco_ios",
            "ip": node["ip"],
            "username": getenv("MONITOR_USERNAME"),
            "password": getenv("MONITOR_PASSWORD"),
        }

        try:
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

                stats = gather_sla_statistics(sla_configuration, connection)
                formatted_stats = format_sla_statistics(stats)

                parsed_stats.append(formatted_stats)

        except netmiko.exceptions.NetmikoAuthenticationException:
            print(f"Error logging into {node['hostname']} ({node['ip']})")

    return parsed_stats


def gather_sla_statistics(
    sla_configuration: list[dict[str, str]],
    connection: netmiko.BaseConnection,
) -> tuple[list[dict[str, str]], list[str]]:
    """Gather all SLA statistics configured on a node"""

    stats = []

    for entry in sla_configuration:
        index = entry["index"]

        statistic = json.loads(
            connection.send_command(f"show ip sla statistics {index} | json")
        )["TABLE_stats"]["ROW_stats"]["TABLE_detail"]["ROW_detail"]

        statistic["src-ip"] = connection.host
        statistic["dest-ip"] = entry["dest-ip"]
        statistic["successes"] = re.search("\d+", statistic["outstring1"]).group()
        statistic["failures"] = re.search("\d+", statistic["outstring2"]).group()

        stats.append(statistic)

    return stats


def format_sla_statistics(raw_stats: list[dict[str, str]]) -> list[dict[str, any]]:
    """Format SLA statistics, excluding unnecessary stats"""

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
        "src-ip": "str",
        "dest-ip": "str",
        "successes": "int",
        "failures": "int",
    }

    formatted_stats = []

    for statistic in raw_stats:
        formatted_statistic = {}

        # Convert data to proper types, if needed
        for stat_name, stat_type in DESIRED_STATISTICS.items():
            match stat_type:
                case "int":
                    formatted_statistic[stat_name] = int(statistic[stat_name])
                case "date":
                    try:
                        formatted_statistic[stat_name] = parse_date(
                            statistic[stat_name],
                            tzinfos={
                                "EDT": "UTC-4",
                                "edt": "UTC-4",
                                "EST": "UTC-5",
                                "est": "UTC-5",
                            },
                        )
                    except:
                        # Date format not recognized in some instances
                        formatted_statistic[stat_name] = "N/A"
                case _:
                    formatted_statistic[stat_name] = statistic[stat_name]

        formatted_stats.append(formatted_statistic)

    return formatted_stats


if __name__ == "__main__":
    main()
