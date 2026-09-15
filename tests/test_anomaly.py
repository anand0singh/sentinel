import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.detectors.anomaly_detector import AnomalyDetector


def test_beaconing_detection():
    detector = AnomalyDetector(beacon_window_size=8)
    src = "192.168.1.100"
    dst = "198.51.100.44"

    # Feed consistent periodic timestamps at exactly 1.0s interval
    detected = None
    for i in range(10):
        t = 1000.0 + (i * 1.0)
        res = detector.inspect_beaconing(src, dst, timestamp=t)
        if res:
            detected = res

    assert detected is not None, "Beaconing should have been detected"
    assert "C2 Beaconing Detected" in detected["title"]
    assert detected["severity"] == "CRITICAL"
    assert detected["mitre_technique"] == "T1071.001"
    print("[+] test_beaconing_detection PASSED")


def test_volumetric_anomaly():
    detector = AnomalyDetector()
    extreme_event = {
        "source_ip": "192.168.1.100",
        "destination_ip": "203.0.113.88",
        "bytes_out": 99999999,
        "bytes_in": 100,
        "duration": 50.0,
        "packet_count": 80000,
    }
    alert = detector.inspect_payload_anomaly(extreme_event)
    assert alert is not None, "Volumetric anomaly should have triggered"
    assert alert["attack_chain_stage"] == "EXFILTRATION"
    print("[+] test_volumetric_anomaly PASSED")


if __name__ == "__main__":
    test_beaconing_detection()
    test_volumetric_anomaly()
