"""Send chosen outreach emails through Cloudflare Email Sending.

Usage: python3 send.py ID [ID ...]
Every success is logged to sent.jsonl, and ids already there are skipped,
so no business ever gets the email twice. Waits 20 s between emails.
The Cloudflare token is injected by the session's proxy.
"""
import json, sys, time, pathlib, urllib.request, urllib.error

HERE = pathlib.Path(__file__).parent
URL = "https://api.cloudflare.com/client/v4/accounts/cc6df81af93716aacbaa05974bbf1277/email/sending/send"
FROM = {"address": "shay@birkat-hanasi.com", "name": "שי הירש | ברכת הנשיא"}
REPLY_TO = "shayh22@gmail.com"

log = HERE / "sent.jsonl"
done = {json.loads(l)["id"] for l in log.read_text().splitlines() if l.strip()} if log.exists() else set()
emails = {e["id"]: e for e in json.loads((HERE / "emails.json").read_text())}

for n, i in enumerate(sys.argv[1:]):
    e = emails[i]
    if i in done:
        print("skip, already sent:", i)
        continue
    if n:
        time.sleep(20)
    payload = {"to": e["email"], "from": FROM, "reply_to": REPLY_TO, "subject": e["subject"], "text": e["body"]}
    req = urllib.request.Request(URL, data=json.dumps(payload).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer proxy-injected"})
    try:
        r = json.loads(urllib.request.urlopen(req, timeout=30).read())
    except urllib.error.HTTPError as err:
        r = json.loads(err.read() or b"{}")
    res = r.get("result") or {}
    ok = bool(r.get("success")) and not res.get("permanent_bounces") and not res.get("suppressed_recipients")
    print("OK  " if ok else "FAIL", i, e["email"], json.dumps(res or r.get("errors"), ensure_ascii=False)[:200])
    if ok:
        with log.open("a") as f:
            f.write(json.dumps({"id": i, "name": e["name"], "email": e["email"],
                                "at": time.strftime("%Y-%m-%d %H:%M"), "message_id": res.get("message_id")},
                               ensure_ascii=False) + "\n")
