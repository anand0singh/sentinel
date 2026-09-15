import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.response.actions import ContainmentActions
from engine.response.orchestrator import ResponseOrchestrator


def test_containment_actions():
    block_res = ContainmentActions.block_ip("198.51.100.44")
    assert block_res["status"] == "SUCCESS"
    assert block_res["action"] == "BLOCK_IP"

    kill_res = ContainmentActions.kill_process(pid=9999, process_name="malware.sh")
    assert kill_res["status"] == "SUCCESS"
    assert kill_res["action"] == "KILL_PROCESS"

    # PID 1 protection check
    safe_res = ContainmentActions.kill_process(pid=1, process_name="init")
    assert safe_res["status"] == "REJECTED"
    print("[+] test_containment_actions PASSED")


def test_soar_orchestrator():
    soar = ResponseOrchestrator()
    soar.auto_containment = True

    root_alert = {
        "title": "CRITICAL: Multi-Stage Attack Chain Detected on 192.168.1.100",
        "severity": "CRITICAL",
        "mitre_technique": "ATTACK-CHAIN-DETECTED",
        "source_ip": "198.51.100.44",
        "destination_ip": "192.168.1.100",
        "process_pid": 0,
    }
    action = soar.handle_alert(root_alert)
    assert action is not None
    assert action["action"] == "ISOLATE_HOST"
    print("[+] test_soar_orchestrator PASSED")


if __name__ == "__main__":
    test_containment_actions()
    test_soar_orchestrator()
