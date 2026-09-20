# State slugs, display labels and spoken aliases in the 7 supported languages.
# Aliases feed the keyword fallback parser and the LLM prompt normalization.

_STATES = [
    ("andhra_pradesh", "Andhra Pradesh", ["andhra", "ఆంధ్రప్రదేశ్", "ఆంధ్ర ప్రదేశ్"]),
    ("arunachal_pradesh", "Arunachal Pradesh", ["अरुणाचल"]),
    ("assam", "Assam", ["অসম"]),
    ("bihar", "Bihar", ["बिहार", "বিহার"]),
    ("chhattisgarh", "Chhattisgarh", ["छत्तीसगढ़"]),
    ("goa", "Goa", []),
    ("gujarat", "Gujarat", ["ગુજરાત"]),
    ("haryana", "Haryana", ["हरियाणा"]),
    ("himachal_pradesh", "Himachal Pradesh", ["हिमाचल"]),
    ("jharkhand", "Jharkhand", ["झारखंड", "ঝাড়খণ্ড"]),
    ("karnataka", "Karnataka", ["கர்நாடகா", "కర్ణాటక"]),
    ("kerala", "Kerala", ["கேரளா"]),
    ("madhya_pradesh", "Madhya Pradesh", ["मध्य प्रदेश"]),
    ("maharashtra", "Maharashtra", ["महाराष्ट्र", "महारास्ट्र"]),
    ("manipur", "Manipur", []),
    ("meghalaya", "Meghalaya", []),
    ("mizoram", "Mizoram", []),
    ("nagaland", "Nagaland", []),
    ("odisha", "Odisha", ["ओडिशा", "उड़ीसा", "ଓଡ଼ିଶା"]),
    ("punjab", "Punjab", ["पंजाब"]),
    ("rajasthan", "Rajasthan", ["राजस्थान"]),
    ("sikkim", "Sikkim", ["सिक्किम"]),
    ("tamil_nadu", "Tamil Nadu", ["तमिलनाडु", "தமிழ்நாடு"]),
    ("telangana", "Telangana", ["तेलंगाना", "తెలంగాణ"]),
    ("tripura", "Tripura", ["त्रिपुरा"]),
    ("uttar_pradesh", "Uttar Pradesh", ["उत्तर प्रदेश"]),
    ("uttarakhand", "Uttarakhand", ["उत्तराखंड"]),
    ("west_bengal", "West Bengal", ["पश्चिम बंगाल", "পশ্চিমবঙ্গ"]),
    ("delhi", "Delhi", ["दिल्ली", "new delhi", "தில்லி", "ఢిల్లీ", "দিল্লি", "દિલ્હી"]),
    ("jammu_and_kashmir", "Jammu and Kashmir", ["जम्मू कश्मीर", "जम्मू और कश्मीर"]),
    ("ladakh", "Ladakh", ["लद्दाख"]),
    ("puducherry", "Puducherry", ["पुदुचेरी", "पांडिचेरी"]),
    ("chandigarh", "Chandigarh", ["चंडीगढ़"]),
    ("andaman_and_nicobar", "Andaman and Nicobar", ["अंडमान"]),
    ("dadra_and_nagar_haveli", "Dadra and Nagar Haveli and Daman and Diu", ["दमन"]),
    ("lakshadweep", "Lakshadweep", ["लक्षद्वीप"]),
]

STATE_LABELS = {slug: label for slug, label, _ in _STATES}

STATE_SLUGS = {}
for _slug, _label, _aliases in _STATES:
    STATE_SLUGS[_label.lower()] = _slug
    for _a in _aliases:
        STATE_SLUGS[_a.lower()] = _slug


def state_slug(value):
    """Return the canonical slug for a state name or alias, else None."""
    if not value:
        return None
    v = str(value).strip().lower().replace(" ", "_")
    if v in STATE_SLUGS:
        return STATE_SLUGS[v]
    if v in STATE_LABELS:
        return v
    spaced = v.replace("_", " ")
    if spaced in STATE_SLUGS:
        return STATE_SLUGS[spaced]
    return None
