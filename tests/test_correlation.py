import sys
import os

# Set path to include project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.detectors.attack_chain import AttackChainCorrelator


def test_attack_chain_correlation():
    correlator = AttackChainCorrelator(window_seconds=60)
    target = "192.168.1.100"

    # Stage 1: Recon
    alert_recon = {
        "title": "Port Scan Detected",
        "severity": "MEDIUM",
        "destination_ip": target,
        "source_ip": "198.51.100.44",
        "attack_chain_stage": "RECON",
        "process_name": "nmap",
    }
    res1 = correlator.ingest_alert(alert_recon)
    assert res1 is None, f"Expected None for stage 1, got {res1}"

    # Stage 2: Exploitation
    alert_exploit = {
        "title": "Reverse Shell Spawned",
        "severity": "CRITICAL",
        "destination_ip": target,
        "source_ip": "198.51.100.44",
        "attack_chain_stage": "EXPLOITATION",
        "process_name": "sh",
    }
    res2 = correlator.ingest_alert(alert_exploit)
    assert res2 is None, f"Expected None for stage 2, got {res2}"

    # Stage 3: C2 Beaconing -> Must trigger root ATTACK-CHAIN-DETECTED
    alert_c2 = {
        "title": "C2 Beaconing Channel Established",
        "severity": "CRITICAL",
        "destination_ip": target,
        "source_ip": "198.51.100.44",
        "attack_chain_stage": "C2",
        "process_name": "beacon",
    }
    res3 = correlator.ingest_alert(alert_c2)
    assert res3 is not None, "Expected synthesized root attack chain alert"
    assert res3["mitre_technique"] == "ATTACK-CHAIN-DETECTED"
    assert res3["severity"] == "CRITICAL"
    assert "Multi-Stage Attack Chain Detected" in res3["title"]
    print("[+] test_attack_chain_correlation PASSED")


if __name__ == "__main__":
    test_attack_chain_correlation()
