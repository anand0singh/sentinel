##! Sentinel Zeek Local Site Policy
@load protocols/conn/known-hosts
@load protocols/conn/known-services
@load protocols/ssl
@load protocols/http
@load protocols/dns
@load protocols/ssh

# Output JSON logging for clean Vector ingestion
redef LogAscii::use_json = T;

# Extract MD5/SHA1 files transferred
@load frameworks/files/extract-all-files
@load frameworks/files/hash-all-files

# Community ID Flow Hashing for unified correlation with Suricata
@load policy/protocols/conn/community-id-logging

event zeek_init() {
    print "SENTINEL Zeek Network Sensor Active";
}
