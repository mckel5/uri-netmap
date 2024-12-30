from os import getenv
from dotenv import load_dotenv
from easysnmp import Session
from pymongo import MongoClient
from typing import Any
from easysnmp.exceptions import EasySNMPError


def main():
    load_dotenv()

    db = MongoClient().netmap_test
    sla_entries = db.sla_entries.find()

    # Clear the statistics table
    db.sla_stats.delete_many({})

    all_stats = []

    for entry in sla_entries:
        index = entry["index"]
        source_ip = db.nodes.find_one({"hostname": entry["source"]}).get("ip")
        statistics = retrieve_sla_statistics(source_ip, index)
        all_stats.append(statistics)

    for node_stats in all_stats:
        db.sla_stats.insert_many(node_stats)


def retrieve_sla_statistics(
    ip: str,
    index: int,
) -> dict[str, Any]:
    """Gather all statistics associated with an IP SLA entry"""

    OBJECT_IDS = {
        "rttMonJitterStatsOWMinSDNew": 52,
        "rttMonJitterStatsOWMaxSDNew": 53,
        "rttMonJitterStatsOWMinDSNew": 54,
        "rttMonJitterStatsOWMaxDSNew": 55,
        "rttMonJitterStatsAvgJitterSD": 63,
        "rttMonJitterStatsAvgJitterDS": 64,
    }

    session = Session(
        hostname=ip,
        version=3,
        security_level="auth_with_privacy",
        security_username=getenv("SNMP_USER"),
        auth_protocol="MD5",
        auth_password=getenv("SNMP_AUTH_PASS"),
        privacy_protocol="AES-256-C",
        privacy_password=getenv("SNMP_PRIV_PASS"),
    )

    def get_most_recent_stat(object_id) -> list | None:
        try:
            return session.walk(f"1.3.6.1.4.1.9.9.42.1.3.5.1.{object_id}.{index}")[-1].value
        except EasySNMPError:
            return None

    return {
        "index": index,
        "latest-start-time": ...,
        "sd-jitter-avg": get_most_recent_stat(
            OBJECT_IDS["rttMonJitterStatsAvgJitterSD"]
        ),
        "sd-jitter-max": get_most_recent_stat(
            OBJECT_IDS["rttMonJitterStatsOWMaxSDNew"]
        ),
        "sd-jitter-min": get_most_recent_stat(
            OBJECT_IDS["rttMonJitterStatsOWMinSDNew"]
        ),
        "ds-jitter-avg": get_most_recent_stat(
            OBJECT_IDS["rttMonJitterStatsAvgJitterDS"]
        ),
        "ds-jitter-max": get_most_recent_stat(
            OBJECT_IDS["rttMonJitterStatsOWMaxDSNew"]
        ),
        "ds-jitter-min": get_most_recent_stat(
            OBJECT_IDS["rttMonJitterStatsOWMinDSNew"]
        ),
    }


if __name__ == "__main__":
    main()
