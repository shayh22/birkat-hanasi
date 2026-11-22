"""Builds the cold-outreach emails for ברכת הנשיא from leads.json.

Outputs emails.json, emails.csv, and outreach.html (a review page).
Fill SENDER below once, then rerun: python3 build.py
"""
import csv, json, html, pathlib

HERE = pathlib.Path(__file__).parent
SENDER = {
    "name": "שי הירש",
    "business": "ברכת הנשיא · בית תוכנה לעסקים",
    "phone": "053-331-9072",
    "site": "birkat-hanasi.co.il",
    "address": "אהבת אדם 88, כפר יונה",
}

PROOF = {
    "קליניקות": "לדוגמה, בניתי את קליניק-פל: יומן פגישות ותיקי מטופלים לקליניקות טיפול, עם סיכום פגישה שנכתב מעצמו.",
    "default": "לדוגמה, בניתי את ליד פל, מערכת לרשת של סוחרים וחנויות סלולר: כל הלידים, העסקאות וההתחשבנות במקום אחד, בלי אקסלים ובלי לרדוף אחרי הודעות.",
}

def pre(letter, word):
    """Hebrew prefix letter; add a hyphen before a Latin-script name (ב-MY ROOM)."""
    return letter + ("-" if word[:1].isascii() else "") + word

def subject(l):
    return f"פרסומת | שאלה קצרה על {l['topic']} {pre('ב', l['fit'])}" if l["fit"] not in ("העסק", "המרפאה", "הקליניקה", "החנות", "המרכז", "המועדון", "הדוג'ו", "בית הספר") \
        else f"פרסומת | שאלה קצרה על {l['topic']}"

def body(l):
    s = SENDER
    return f"""{l['greet']}

שמי שי הירש, ואני גר בכפר יונה. אני בונה תוכנות מותאמות לעסקים קטנים ובינוניים כאן בשרון, כדי לחסוך את העבודה הידנית שחוזרת כל יום.

{l['obs']}

{PROOF.get(l['cat'], PROOF['default'])} עוד מערכות שבניתי אפשר לראות ב-{s['site']}.

אני לא שולח הצעה בלי רשות. אם זה רלוונטי, השיבו "כן" ואשלח הסבר קצר עם דוגמה שמתאימה {pre('ל', l['fit'])}. אפשר גם שיחה של 10 דקות.

תודה,
{s['name']}
{s['business']}
{s['phone']} | {s['site']}
{s['address']}

---
קיבלתם מייל זה כי הכתובת מפורסמת באתר העסק. זו פנייה חד-פעמית: אם לא תשיבו, לא אפנה שוב. להסרה, השיבו "הסר".
"""

leads = json.loads((HERE / "leads.json").read_text())
emails = [{**l, "subject": subject(l), "body": body(l)} for l in leads]
(HERE / "emails.json").write_text(json.dumps(emails, ensure_ascii=False, indent=1))
with open(HERE / "emails.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["קטגוריה", "עסק", "עיר", "מייל", "מקור", "נושא", "גוף"])
    for e in emails:
        w.writerow([e["cat"], e["name"], e["city"], e["email"], e["source"], e["subject"], e["body"]])

page = (HERE / "page_template.html").read_text()
data = json.dumps([{k: e[k] for k in ("id", "cat", "name", "city", "email", "source", "subject", "body")} for e in emails], ensure_ascii=False)
(HERE / "outreach.html").write_text(page.replace("/*DATA*/[]", data.replace("</", "<\\/")))
print(len(emails), "emails built")
