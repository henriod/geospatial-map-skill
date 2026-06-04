#!/usr/bin/env python3
"""
Build kenya_counties_audit.geojson by joining the Auditor-General's
County Governments 2023/2024 summary data onto GADM 4.1 level-1
boundaries (EPSG:4326, lng/lat).

Source of attributes: Office of the Auditor-General (Kenya),
"Auditor-General's Summary Report on County Governments 2023-2024",
Appendices 1(a), 1(b), 2, 3, 4 and 5. All amounts in Kenyan Shillings (Kshs.).

Source of geometry: GADM 4.1 (gadm41_KEN_1) — https://gadm.org
Boundaries are unmodified administrative geometry, not derived/guessed.

Data-integrity notes (faithfully reflecting the source PDF):
  * Every County Executive received a "Qualified" opinion (no Unqualified,
    Adverse or Disclaimer were issued) — Appendix 1(a).
  * Appendix 1(b) lists Mombasa and Elgeyo/Marakwet under BOTH the Qualified
    and the Adverse tables. The report's explicit "Adverse Opinion" table is
    treated as authoritative, so both are recorded as Adverse.
  * Appendix 1(b) does not list Homa Bay or Migori under any opinion category,
    so their assembly opinion is recorded as null ("Not listed") rather than
    fabricated.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).parent

# GADM NAME_1 -> human-readable display name used in the report
DISPLAY = {
    "HomaBay": "Homa Bay", "Elgeyo-Marakwet": "Elgeyo/Marakwet",
    "TaitaTaveta": "Taita/Taveta", "TanaRiver": "Tana River",
    "TransNzoia": "Trans Nzoia", "UasinGishu": "Uasin Gishu",
    "WestPokot": "West Pokot", "Nairobi": "Nairobi City",
}

# County Assembly audit opinion (Appendix 1(b))
UNMODIFIED = {"Turkana", "Bomet", "TransNzoia", "Kitui", "WestPokot",
              "Kericho", "Kwale", "Bungoma"}
ADVERSE = {"Mombasa", "Elgeyo-Marakwet"}
NO_ASSEMBLY_OPINION = {"HomaBay", "Migori"}  # absent from Appendix 1(b)

# Appendix 2 — Total Budget (Kshs.)
TOTAL_BUDGET = {
    "Nairobi": 44966936833, "Nakuru": 24544014263, "Kiambu": 23214856470,
    "Kilifi": 20003782741, "Turkana": 17225014127, "Mombasa": 17035944906,
    "Machakos": 16896450047, "Kakamega": 16786428004, "Kitui": 15667011553,
    "Narok": 14985206088, "UasinGishu": 14359673386, "Kwale": 14259168763,
    "Bungoma": 14232623280, "Kisumu": 13697865202, "Kisii": 13251121884,
    "Mandera": 13000831007, "Migori": 12576546230, "Wajir": 12140530041,
    "Meru": 11835953871, "Kajiado": 11591864106, "TransNzoia": 11270577202,
    "Makueni": 11182335100, "HomaBay": 11167226300, "Garissa": 10532421124,
    "Murang'a": 10346366046, "Busia": 10203033153, "Nandi": 9850666465,
    "Siaya": 9761123388, "Bomet": 9591003564, "Marsabit": 9424650449,
    "Nyeri": 8982402108, "Baringo": 8893005726, "TanaRiver": 8869497866,
    "Nyandarua": 8748151545, "Kericho": 8484768032, "Nyamira": 8197155052,
    "Embu": 7932599418, "Laikipia": 7726465272, "WestPokot": 7715474283,
    "Samburu": 7665941867, "Kirinyaga": 7240547406, "Vihiga": 6701592386,
    "Elgeyo-Marakwet": 6527819912, "Tharaka-Nithi": 6518796358,
    "Isiolo": 5718810379, "TaitaTaveta": 5232408363, "Lamu": 4541837952,
}

# Appendix 3 — Pending Bills as at 30 June 2024 (Kshs., total)
PENDING_BILLS = {
    "Nairobi": 119376305811, "Embu": 18281269008, "Kiambu": 6849188744,
    "Kilifi": 6294840125, "Machakos": 5666066964, "Mombasa": 4491099789,
    "TanaRiver": 4332844923, "Bungoma": 3466228481, "Kisumu": 3390288037,
    "Nyandarua": 3123823026, "Narok": 2702393542, "Kajiado": 2466315285,
    "Kwale": 2460746021, "Migori": 2388633413, "Laikipia": 2362412598,
    "TaitaTaveta": 2274267902, "Mandera": 2227277664, "Busia": 2016985644,
    "Kakamega": 1965178326, "Garissa": 1942518338, "Kisii": 1820281699,
    "Wajir": 1819432313, "Vihiga": 1681258515, "Nakuru": 1567730072,
    "TransNzoia": 1535177692, "Siaya": 1481257283, "Murang'a": 1414947094,
    "HomaBay": 1347212715, "Meru": 1331797665, "Isiolo": 1330056933,
    "Marsabit": 1269041763, "Kirinyaga": 1256423464, "Kericho": 1183691805,
    "Bomet": 1108743088, "Tharaka-Nithi": 967706144, "Nyamira": 896965752,
    "Kitui": 879061828, "Turkana": 856282307, "Baringo": 840089158,
    "Nandi": 777792043, "Makueni": 768917855, "UasinGishu": 745095519,
    "Samburu": 600004263, "WestPokot": 598031996, "Nyeri": 305238517,
    "Elgeyo-Marakwet": 103636606, "Lamu": 49122593,
}

# Appendix 4 — Actual Total Revenue for the year ended 30 June 2024 (Kshs.)
TOTAL_REVENUE = {
    "Nairobi": 33876491457, "Kiambu": 19128934837, "Nakuru": 17528670478,
    "Turkana": 15208634922, "Kilifi": 14472472987, "Machakos": 14345069051,
    "Kitui": 14098299731, "Kakamega": 13882272170, "Narok": 13530846309,
    "Mombasa": 12898279288, "Bungoma": 11998703565, "Mandera": 11704707847,
    "Wajir": 11165666067, "UasinGishu": 10665405070, "Meru": 10269090658,
    "Kwale": 10239524220, "TransNzoia": 9671227716, "Migori": 9661565317,
    "Kisii": 9542188839, "Kisumu": 9420309600, "Makueni": 9241834803,
    "HomaBay": 8979946132, "Busia": 8939543477, "Garissa": 8852694225,
    "Kajiado": 8802811054, "Siaya": 8094168458, "Nyeri": 8046733173,
    "Nandi": 8037010974, "Marsabit": 7803134054, "Murang'a": 7570629466,
    "Baringo": 7542555437, "Bomet": 7482274563, "TanaRiver": 7417211884,
    "Kericho": 7173160222, "WestPokot": 6797469488, "Nyamira": 6651983396,
    "Nyandarua": 6636092777, "Embu": 6601933098, "Samburu": 6406286200,
    "Kirinyaga": 6091561104, "Laikipia": 5981949414, "Vihiga": 5640950198,
    "Elgeyo-Marakwet": 5229418651, "Isiolo": 5216586280,
    "Tharaka-Nithi": 5205329028, "TaitaTaveta": 4811646240, "Lamu": 3896941696,
}

# Appendix 5 — Own Source Revenue (Kshs. budgeted, Kshs. actual, % achievement)
OSR = {
    "Turkana": (220000000, 440381531, 200), "Lamu": (180000000, 213328064, 119),
    "Kirinyaga": (550000000, 651009992, 118), "Vihiga": (300549454, 335439785, 112),
    "Samburu": (256027400, 280319244, 109), "Elgeyo-Marakwet": (270326633, 278482755, 103),
    "Embu": (750000000, 746970100, 100), "Wajir": (150000000, 147984496, 99),
    "Narok": (5023073664, 4781452940, 95), "TanaRiver": (96630600, 90174516, 93),
    "Tharaka-Nithi": (450670000, 417346034, 93), "Isiolo": (271208180, 243298518, 90),
    "UasinGishu": (1578147614, 1404777903, 89), "Kitui": (585000000, 517049814, 88),
    "Marsabit": (190000000, 167579472, 88), "HomaBay": (1392206352, 1200495830, 86),
    "Makueni": (1240000000, 1045086845, 84), "Baringo": (450097396, 378472185, 84),
    "Nyeri": (800000000, 667120607, 83), "Nakuru": (2400000000, 1934878518, 81),
    "WestPokot": (230000000, 185294701, 81), "Siaya": (760998234, 610364012, 80),
    "Kericho": (1066426600, 834758771, 78), "Kisii": (650000000, 497491034, 77),
    "Mombasa": (5856356997, 4457758296, 76), "TaitaTaveta": (628667445, 466449100, 74),
    "Laikipia": (1475000000, 1085142996, 74), "TransNzoia": (643700000, 470522927, 73),
    "Murang'a": (1115000000, 802633560, 72), "Bomet": (332041830, 238980420, 72),
    "Kwale": (600000000, 427377928, 71), "Migori": (480000000, 337154048, 70),
    "Kajiado": (1515702515, 1048356435, 69), "Kilifi": (1788634224, 1206703667, 67),
    "Meru": (562000000, 376008436, 67), "Kisumu": (2282844694, 1511728382, 66),
    "Kiambu": (6995366310, 4585751300, 66), "Nairobi": (19999322415, 12881287392, 64),
    "Garissa": (139000000, 89055596, 64), "Kakamega": (2200000000, 1349689046, 61),
    "Nandi": (558329869, 307822318, 55), "Busia": (649015634, 357765802, 55),
    "Nyamira": (687000000, 373047917, 54), "Mandera": (330533846, 169040486, 51),
    "Machakos": (3432286060, 1578877300, 46), "Bungoma": (868201471, 368069810, 42),
    "Nyandarua": (1225000000, 515740772, 42),
}


def assembly_opinion(name):
    if name in NO_ASSEMBLY_OPINION:
        return None
    if name in ADVERSE:
        return "Adverse"
    if name in UNMODIFIED:
        return "Unmodified"
    return "Qualified"


def main():
    gj = json.load(open(HERE / "gadm_tmp" / "gadm41_KEN_1.json"))
    missing = []
    for feat in gj["features"]:
        name = feat["properties"]["NAME_1"]
        osr = OSR.get(name)
        # Replace GADM's verbose property bag with a clean, purpose-built one.
        feat["properties"] = {
            "county": DISPLAY.get(name, name),
            "gadm_name": name,
            "executive_opinion": "Qualified",  # Appendix 1(a): uniform
            "assembly_opinion": assembly_opinion(name),
            "total_budget": TOTAL_BUDGET.get(name),
            "total_revenue": TOTAL_REVENUE.get(name),
            "pending_bills": PENDING_BILLS.get(name),
            "osr_budgeted": osr[0] if osr else None,
            "osr_actual": osr[1] if osr else None,
            "osr_pct": osr[2] if osr else None,
        }
        for k in ("total_budget", "total_revenue", "pending_bills", "osr_pct"):
            if feat["properties"][k] is None:
                missing.append((name, k))

    out = HERE / "kenya_counties_audit.geojson"
    json.dump(gj, open(out, "w"))
    print(f"Wrote {out} with {len(gj['features'])} counties")
    if missing:
        print("WARNING missing values:", missing)
    else:
        print("All counties have budget, revenue, pending-bills and OSR% values.")


if __name__ == "__main__":
    main()
