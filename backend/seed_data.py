"""Seed the database with realistic data for development."""
import asyncio
import random
from app.core.database import AsyncSessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.models.region import Region
from app.models.procedure import Procedure
from app.models.hospital import Hospital
from app.models.submission import Submission
from app.models.alert import Alert  # noqa: must import to register with SQLAlchemy
from app.core.security import hash_password

REGIONS = [
    {"name": "Thailand", "country_code": "TH", "flag_emoji": "🇹🇭", "healthcare_summary": "Thailand is a world leader in medical tourism, with JCI-accredited hospitals offering procedures at 50–70% below Western prices. Bangkok and Phuket host internationally renowned facilities with English-speaking staff. Strengths include cosmetic surgery, orthopaedics, and cardiac care. Wait times are minimal — most elective procedures within days."},
    {"name": "India", "country_code": "IN", "flag_emoji": "🇮🇳", "healthcare_summary": "India offers some of the world's most cost-effective healthcare, with top-tier hospitals in Chennai, Mumbai, and Delhi rivalling Western standards. Cardiac surgery and organ transplants are particular strengths. Costs are 60–80% below the US. Apollo and Fortis hospital groups hold JCI accreditation."},
    {"name": "Mexico", "country_code": "MX", "flag_emoji": "🇲🇽", "healthcare_summary": "Mexico is the top medical tourism destination for Americans due to proximity and strong cost savings. Monterrey and Mexico City have internationally accredited hospitals. Dental work, bariatric surgery, and hip replacements are popular. Costs 40–60% below the US."},
    {"name": "Germany", "country_code": "DE", "flag_emoji": "🇩🇪", "healthcare_summary": "Germany offers world-class medical care under a well-regulated system. Renowned for oncology, cardiac surgery, and orthopaedics. Higher cost than Asian destinations but exceptional standards and no language barrier for English speakers. Wait times for private care are short."},
    {"name": "South Korea", "country_code": "KR", "flag_emoji": "🇰🇷", "healthcare_summary": "South Korea combines cutting-edge technology with competitive pricing. Seoul's hospitals lead in cancer treatment, cosmetic surgery, and fertility treatment. Government-certified medical tourism packages available. Costs 30–50% below the US."},
    {"name": "Turkey", "country_code": "TR", "flag_emoji": "🇹🇷", "healthcare_summary": "Turkey has rapidly grown as a medical tourism hub, particularly for hair transplants, dental work, and bariatric surgery. Istanbul hosts JCI-accredited hospitals. Costs are 60–75% below Western Europe. Strong in ophthalmology and cosmetic procedures."},
    {"name": "Spain", "country_code": "ES", "flag_emoji": "🇪🇸", "healthcare_summary": "Spain has excellent public and private healthcare. Popular with Europeans for dentistry, fertility treatment, and orthopaedics. Barcelona and Madrid have internationally accredited private hospitals. Costs lower than UK/Germany by 30–40%."},
    {"name": "Singapore", "country_code": "SG", "flag_emoji": "🇸🇬", "healthcare_summary": "Singapore is Asia's premier healthcare destination for complex procedures. World-class oncology, cardiac, and neurological care. Highly regulated, English-speaking, and impeccably clean. Costs are higher than other Asian destinations but still 30–40% below the US."},
]

PROCEDURES = [
    {"name": "Hip Replacement", "category": "Orthopaedics", "icd_code": "Z96.641", "slug": "hip-replacement", "description": "Total hip arthroplasty replacing the damaged hip joint with an artificial implant. Typically required for severe arthritis or hip fracture."},
    {"name": "Knee Replacement", "category": "Orthopaedics", "icd_code": "Z96.651", "slug": "knee-replacement", "description": "Total knee arthroplasty replacing the worn knee joint surfaces. Most commonly needed for osteoarthritis."},
    {"name": "Coronary Artery Bypass", "category": "Cardiac", "icd_code": "Z95.1", "slug": "coronary-bypass", "description": "Open-heart surgery creating new routes around blocked arteries to improve blood flow to the heart muscle."},
    {"name": "LASIK Eye Surgery", "category": "Ophthalmology", "icd_code": "H52.7", "slug": "lasik", "description": "Laser vision correction surgery reshaping the cornea to reduce or eliminate the need for glasses or contact lenses."},
    {"name": "Dental Implants", "category": "Dentistry", "icd_code": "Z97.2", "slug": "dental-implants", "description": "Titanium post surgically placed into the jawbone to support an artificial tooth crown. Single or multiple implants."},
    {"name": "Bariatric Surgery", "category": "Gastroenterology", "icd_code": "Z98.84", "slug": "bariatric-surgery", "description": "Weight loss surgery including gastric bypass, sleeve gastrectomy, or gastric banding for severe obesity."},
    {"name": "IVF Treatment", "category": "Fertility", "icd_code": "Z31.83", "slug": "ivf-treatment", "description": "In vitro fertilisation — eggs are retrieved, fertilised in a lab, and embryos transferred to the uterus. Typically one full cycle."},
    {"name": "Spinal Fusion", "category": "Orthopaedics", "icd_code": "M43.2", "slug": "spinal-fusion", "description": "Surgical procedure joining two or more vertebrae permanently to eliminate painful motion and stabilise the spine."},
    {"name": "Rhinoplasty", "category": "Cosmetic Surgery", "icd_code": "Z41.1", "slug": "rhinoplasty", "description": "Surgical reshaping of the nose for cosmetic or functional (breathing improvement) purposes."},
    {"name": "Hair Transplant", "category": "Cosmetic Surgery", "icd_code": "L66.1", "slug": "hair-transplant", "description": "FUE or FUT hair transplant surgery moving hair follicles from donor to thinning areas."},
    {"name": "Appendectomy", "category": "General Surgery", "icd_code": "Z87.19", "slug": "appendectomy", "description": "Surgical removal of the appendix, typically performed as an emergency for appendicitis."},
    {"name": "Cataract Surgery", "category": "Ophthalmology", "icd_code": "H26.9", "slug": "cataract-surgery", "description": "Removal of the clouded natural lens replaced with an artificial intraocular lens to restore clear vision."},
]

HOSPITALS = [
    {"name": "Bumrungrad International Hospital", "city": "Bangkok", "region": "Thailand", "accreditation": "JCI", "lat": 13.7437, "lng": 100.5557, "website": "https://www.bumrungrad.com"},
    {"name": "Bangkok Hospital", "city": "Bangkok", "region": "Thailand", "accreditation": "JCI", "lat": 13.7232, "lng": 100.5599},
    {"name": "Samitivej Hospital", "city": "Bangkok", "region": "Thailand", "accreditation": "JCI", "lat": 13.7317, "lng": 100.5800},
    {"name": "Apollo Hospitals Chennai", "city": "Chennai", "region": "India", "accreditation": "JCI", "lat": 13.0827, "lng": 80.2707, "website": "https://www.apollohospitals.com"},
    {"name": "Fortis Memorial Research Institute", "city": "Gurugram", "region": "India", "accreditation": "JCI", "lat": 28.4595, "lng": 77.0266},
    {"name": "Medanta — The Medicity", "city": "Gurugram", "region": "India", "accreditation": "NABH", "lat": 28.4436, "lng": 77.0418},
    {"name": "Hospital San José Tecnológico de Monterrey", "city": "Monterrey", "region": "Mexico", "accreditation": "JCI", "lat": 25.6866, "lng": -100.3161},
    {"name": "ABC Medical Center", "city": "Mexico City", "region": "Mexico", "accreditation": "JCI", "lat": 19.3566, "lng": -99.1856, "website": "https://www.abchospital.com"},
    {"name": "Charité — Universitätsmedizin Berlin", "city": "Berlin", "region": "Germany", "accreditation": "ISO", "lat": 52.5251, "lng": 13.3763, "website": "https://www.charite.de"},
    {"name": "Asklepios Klinik Hamburg", "city": "Hamburg", "region": "Germany", "accreditation": "ISO", "lat": 53.5753, "lng": 10.0153},
    {"name": "Severance Hospital Seoul", "city": "Seoul", "region": "South Korea", "accreditation": "JCI", "lat": 37.5628, "lng": 126.9407},
    {"name": "Samsung Medical Center", "city": "Seoul", "region": "South Korea", "accreditation": "JCI", "lat": 37.4881, "lng": 127.0856},
    {"name": "Acibadem Maslak Hospital", "city": "Istanbul", "region": "Turkey", "accreditation": "JCI", "lat": 41.1075, "lng": 29.0178, "website": "https://www.acibadem.com"},
    {"name": "Memorial Şişli Hospital", "city": "Istanbul", "region": "Turkey", "accreditation": "JCI", "lat": 41.0644, "lng": 28.9990},
    {"name": "Clínica Universidad de Navarra", "city": "Madrid", "region": "Spain", "accreditation": "ISO", "lat": 40.4168, "lng": -3.7038},
    {"name": "Hospital Quirónsalud Barcelona", "city": "Barcelona", "region": "Spain", "accreditation": "ISO", "lat": 41.3851, "lng": 2.1734},
    {"name": "Mount Elizabeth Hospital", "city": "Singapore", "region": "Singapore", "accreditation": "JCI", "lat": 1.3049, "lng": 103.8349, "website": "https://www.parkwaypantai.com"},
    {"name": "Gleneagles Hospital Singapore", "city": "Singapore", "region": "Singapore", "accreditation": "JCI", "lat": 1.3030, "lng": 103.8280},
]

TESTIMONIES = [
    "Excellent experience. The staff were professional and communicated in clear English throughout. Recovery room was private and clean.",
    "Very smooth process. They arranged airport pickup and hotel at a discounted rate nearby. Would highly recommend.",
    "Good outcome but wait for post-op consultation was longer than expected. Factor in extra days.",
    "Saved me over $30,000 compared to quotes I received at home. Quality was comparable if not better.",
    "The pre-operative assessment was thorough and the surgeon had trained in the US. Felt completely confident.",
    "Facilities were modern and well-equipped. The only downside was navigating insurance paperwork from abroad.",
    "Fantastic care. My physiotherapy was included in the package price which surprised me.",
    "I had concerns at first but the JCI accreditation reassured me. Everything went smoothly.",
    "Slightly longer recovery than quoted but the medical team were available 24/7 on WhatsApp which helped.",
    "Best decision I made. The cost saving let me recover in a nice hotel rather than rushing home.",
    "Not all staff spoke English but a dedicated patient liaison was assigned to me throughout.",
    "Outcome was excellent. The 3-month follow-up was done via video consultation at no extra charge.",
]

COST_DATA = {
    "hip-replacement": {"TH": (7000, 10000), "IN": (5500, 8000), "MX": (9000, 14000), "DE": (20000, 30000), "KR": (12000, 18000), "TR": (8000, 13000), "ES": (14000, 22000), "SG": (18000, 26000)},
    "knee-replacement": {"TH": (7500, 11000), "IN": (6000, 9000), "MX": (9500, 14500), "DE": (22000, 32000), "KR": (13000, 19000), "TR": (9000, 14000), "ES": (15000, 23000), "SG": (19000, 27000)},
    "coronary-bypass": {"TH": (12000, 18000), "IN": (8000, 14000), "MX": (18000, 25000), "DE": (35000, 50000), "KR": (22000, 32000), "TR": (16000, 24000), "ES": (28000, 40000), "SG": (30000, 45000)},
    "lasik": {"TH": (1200, 2000), "IN": (800, 1500), "MX": (1500, 2500), "DE": (2500, 3500), "KR": (1800, 2800), "TR": (1000, 1800), "ES": (2000, 3000), "SG": (2200, 3200)},
    "dental-implants": {"TH": (900, 1500), "IN": (700, 1200), "MX": (800, 1400), "DE": (2500, 4000), "KR": (1200, 2000), "TR": (600, 1100), "ES": (1500, 2500), "SG": (2000, 3500)},
    "bariatric-surgery": {"TH": (8000, 12000), "IN": (6000, 10000), "MX": (7000, 11000), "DE": (18000, 28000), "KR": (12000, 18000), "TR": (7500, 12000), "ES": (10000, 16000), "SG": (15000, 22000)},
    "ivf-treatment": {"TH": (4000, 7000), "IN": (2500, 5000), "MX": (5000, 8000), "DE": (4000, 7000), "KR": (5000, 8000), "TR": (3500, 6000), "ES": (4000, 7500), "SG": (8000, 14000)},
    "spinal-fusion": {"TH": (10000, 16000), "IN": (7000, 12000), "MX": (14000, 20000), "DE": (30000, 45000), "KR": (18000, 28000), "TR": (12000, 18000), "ES": (20000, 32000), "SG": (25000, 38000)},
    "rhinoplasty": {"TH": (3000, 6000), "IN": (2000, 4000), "MX": (3500, 6000), "DE": (6000, 10000), "KR": (4000, 8000), "TR": (2500, 5000), "ES": (4000, 8000), "SG": (7000, 12000)},
    "hair-transplant": {"TH": (2000, 4000), "IN": (1500, 3000), "MX": (3000, 5000), "DE": (5000, 10000), "KR": (3000, 6000), "TR": (1500, 3500), "ES": (3000, 7000), "SG": (8000, 15000)},
    "appendectomy": {"TH": (2000, 4000), "IN": (1500, 3000), "MX": (3000, 5000), "DE": (5000, 8000), "KR": (3500, 6000), "TR": (2000, 4000), "ES": (3000, 5000), "SG": (5000, 8000)},
    "cataract-surgery": {"TH": (1500, 2800), "IN": (1000, 2000), "MX": (2000, 3500), "DE": (2500, 4000), "KR": (2000, 3500), "TR": (1200, 2200), "ES": (1800, 3000), "SG": (3000, 5000)},
}

WAIT_DAYS = {"TH": (1, 7), "IN": (2, 10), "MX": (3, 14), "DE": (14, 60), "KR": (3, 14), "TR": (2, 10), "ES": (7, 30), "SG": (5, 21)}


async def _populate(db) -> None:
    """Insert all seed rows into an already-open session."""
    region_map = {}
    for r in REGIONS:
        region = Region(name=r["name"], country_code=r["country_code"], flag_emoji=r["flag_emoji"], healthcare_summary=r["healthcare_summary"])
        db.add(region)
        await db.flush()
        region_map[r["country_code"]] = region

    proc_map = {}
    for p in PROCEDURES:
        proc = Procedure(name=p["name"], category=p["category"], icd_code=p.get("icd_code"), slug=p["slug"], description=p["description"])
        db.add(proc)
        await db.flush()
        proc_map[p["slug"]] = proc

    country_to_code = {r["name"]: r["country_code"] for r in REGIONS}
    hosp_list = []
    for h in HOSPITALS:
        code = country_to_code.get(h["region"])
        if not code or code not in region_map:
            continue
        hosp = Hospital(
            name=h["name"],
            region_id=region_map[code].id,
            city=h["city"],
            accreditation=h.get("accreditation"),
            latitude=h.get("lat"),
            longitude=h.get("lng"),
            website=h.get("website"),
        )
        db.add(hosp)
        await db.flush()
        hosp_list.append((hosp, code))

    demo_user = User(email="demo@medtransparency.app", hashed_password=hash_password("Demo1234!"), display_name="Demo User", is_verified=True)
    db.add(demo_user)
    await db.flush()

    for hosp, country_code in hosp_list:
        for slug, cost_map in COST_DATA.items():
            if country_code not in cost_map:
                continue
            procedure = proc_map.get(slug)
            if not procedure:
                continue
            n = random.randint(3, 8)
            lo, hi = cost_map[country_code]
            wlo, whi = WAIT_DAYS.get(country_code, (5, 30))
            for _ in range(n):
                cost = round(random.uniform(lo, hi), 2)
                sub = Submission(
                    user_id=demo_user.id if random.random() > 0.5 else None,
                    procedure_id=procedure.id,
                    hospital_id=hosp.id,
                    cost_usd=cost,
                    original_cost=cost,
                    currency="USD",
                    wait_days=random.randint(wlo, whi),
                    outcome_score=random.randint(6, 10),
                    testimony=random.choice(TESTIMONIES) if random.random() > 0.3 else None,
                    is_verified=random.random() > 0.4,
                )
                db.add(sub)

    await db.commit()
    print("Seed complete: regions, hospitals, procedures, and submissions loaded.")


async def seed_if_empty() -> None:
    """Seed the database only when it contains no regions (i.e. first run)."""
    from sqlalchemy import select, func
    async with AsyncSessionLocal() as db:
        count = (await db.execute(select(func.count()).select_from(Region))).scalar_one()
        if count > 0:
            return
    async with AsyncSessionLocal() as db:
        await _populate(db)


async def seed():
    """Drop and recreate all tables, then populate. Use for a clean reset."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await _populate(db)


if __name__ == "__main__":
    asyncio.run(seed())
