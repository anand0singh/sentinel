"""
Sentinel GeoIP Service
Lightweight geolocation and ASN lookup helper.
"""
import ipaddress


class GeoIPService:
    @staticmethod
    def is_private(ip_str: str) -> bool:
        try:
            ip = ipaddress.ip_address(ip_str)
            return ip.is_private or ip.is_loopback or ip.is_reserved
        except ValueError:
            return False

    @classmethod
    def lookup(cls, ip_str: str) -> dict:
        """Returns country ISO code and metadata for given IP."""
        if cls.is_private(ip_str):
            return {"country_iso": "PRIVATE", "asn": "LOCAL", "is_threat_region": False}

        # Simulated high-performance GeoIP mapper
        # Maps simulated external ranges to realistic geographic identifiers
        octets = ip_str.split(".")
        if len(octets) == 4:
            first = int(octets[0]) if octets[0].isdigit() else 0
            if 180 <= first <= 190:
                return {"country_iso": "CN", "asn": "AS4134", "is_threat_region": True}
            elif 90 <= first <= 100:
                return {"country_iso": "RU", "asn": "AS12389", "is_threat_region": True}
            elif 40 <= first <= 50:
                return {"country_iso": "US", "asn": "AS15169", "is_threat_region": False}

        return {"country_iso": "ZZ", "asn": "AS0000", "is_threat_region": False}
