"""Database-backed tool definitions and executors for the MedGuide agent."""
import json
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.submission import Submission
from app.models.hospital import Hospital
from app.models.procedure import Procedure
from app.models.region import Region

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_procedures",
            "description": (
                "Search for medical procedures available on the platform by name or keyword. "
                "Call this first when the user mentions a procedure you don't have a slug for."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search term e.g. 'knee', 'eye surgery', 'hair'",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_cost_stats",
            "description": (
                "Get real crowdsourced cost, wait time, and outcome statistics for a medical "
                "procedure. Optionally filter by region. Always call this before quoting prices."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "procedure_slug": {
                        "type": "string",
                        "description": (
                            "Procedure slug e.g. 'hip-replacement', 'lasik', "
                            "'ivf-treatment', 'dental-implants', 'hair-transplant'"
                        ),
                    },
                    "region_code": {
                        "type": "string",
                        "description": (
                            "ISO country code: TH=Thailand, IN=India, MX=Mexico, "
                            "DE=Germany, KR=South Korea, TR=Turkey, ES=Spain, SG=Singapore. "
                            "Omit for global aggregate."
                        ),
                    },
                },
                "required": ["procedure_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_regions",
            "description": (
                "Compare a procedure's costs, wait times, and outcome scores across all "
                "available regions side by side. Use when the user wants to choose a country."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "procedure_slug": {
                        "type": "string",
                        "description": "Procedure slug e.g. 'hip-replacement'",
                    }
                },
                "required": ["procedure_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_hospitals",
            "description": (
                "Find the best hospitals for a procedure, ranked by outcome score and "
                "cost-effectiveness. Can be filtered to a specific region."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "procedure_slug": {"type": "string"},
                    "region_code": {
                        "type": "string",
                        "description": "Optional country code to restrict results to one region",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "How many hospitals to return (default 5, max 10)",
                    },
                },
                "required": ["procedure_slug"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_testimonies",
            "description": (
                "Retrieve real verified patient testimonies for a procedure. "
                "Use when the user wants to understand what the experience is actually like."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "procedure_slug": {"type": "string"},
                    "region_code": {
                        "type": "string",
                        "description": "Optional country code filter",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of testimonies to return (default 3, max 5)",
                    },
                },
                "required": ["procedure_slug"],
            },
        },
    },
]


async def execute_tool(name: str, args: dict, db: AsyncSession) -> dict:
    try:
        if name == "search_procedures":
            return await _search_procedures(args.get("query", ""), db)
        if name == "get_cost_stats":
            return await _get_cost_stats(
                args.get("procedure_slug", ""), args.get("region_code"), db
            )
        if name == "compare_regions":
            return await _compare_regions(args.get("procedure_slug", ""), db)
        if name == "get_top_hospitals":
            return await _get_top_hospitals(
                args.get("procedure_slug", ""),
                args.get("region_code"),
                min(int(args.get("limit", 5)), 10),
                db,
            )
        if name == "get_patient_testimonies":
            return await _get_patient_testimonies(
                args.get("procedure_slug", ""),
                args.get("region_code"),
                min(int(args.get("limit", 3)), 5),
                db,
            )
        return {"error": f"Unknown tool: {name}"}
    except Exception as exc:
        return {"error": str(exc)}


async def _search_procedures(query: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Procedure.name, Procedure.slug, Procedure.category)
        .where(Procedure.name.ilike(f"%{query}%"))
        .limit(6)
    )
    rows = result.all()
    if not rows:
        return {"procedures": [], "message": f"No procedures found matching '{query}'."}
    return {
        "procedures": [
            {"name": r.name, "slug": r.slug, "category": r.category} for r in rows
        ]
    }


async def _get_cost_stats(
    procedure_slug: str, region_code: str | None, db: AsyncSession
) -> dict:
    q = (
        select(
            func.avg(Submission.cost_usd).label("avg_cost"),
            func.min(Submission.cost_usd).label("min_cost"),
            func.max(Submission.cost_usd).label("max_cost"),
            func.avg(Submission.wait_days).label("avg_wait"),
            func.avg(Submission.outcome_score).label("avg_outcome"),
            func.count(Submission.id).label("count"),
        )
        .join(Procedure, Submission.procedure_id == Procedure.id)
        .where(Procedure.slug == procedure_slug)
    )
    if region_code:
        q = (
            q.join(Hospital, Submission.hospital_id == Hospital.id)
            .join(Region, Hospital.region_id == Region.id)
            .where(Region.country_code == region_code)
        )
    row = (await db.execute(q)).one()
    if not row.count:
        msg = f"No data found for '{procedure_slug}'"
        return {"error": msg + (f" in {region_code}" if region_code else "")}
    return {
        "procedure_slug": procedure_slug,
        "region_code": region_code or "global",
        "avg_cost_usd": round(row.avg_cost, 0),
        "min_cost_usd": round(row.min_cost, 0),
        "max_cost_usd": round(row.max_cost, 0),
        "avg_wait_days": round(row.avg_wait, 1),
        "avg_outcome_score": round(row.avg_outcome, 2),
        "data_points": row.count,
    }


async def _compare_regions(procedure_slug: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(
            Region.name,
            Region.country_code,
            Region.flag_emoji,
            func.avg(Submission.cost_usd).label("avg_cost"),
            func.min(Submission.cost_usd).label("min_cost"),
            func.max(Submission.cost_usd).label("max_cost"),
            func.avg(Submission.wait_days).label("avg_wait"),
            func.avg(Submission.outcome_score).label("avg_outcome"),
            func.count(Submission.id).label("count"),
        )
        .join(Hospital, Submission.hospital_id == Hospital.id)
        .join(Region, Hospital.region_id == Region.id)
        .join(Procedure, Submission.procedure_id == Procedure.id)
        .where(Procedure.slug == procedure_slug)
        .group_by(Region.id, Region.name, Region.country_code, Region.flag_emoji)
        .order_by(func.avg(Submission.cost_usd))
    )
    rows = result.all()
    if not rows:
        return {"error": f"No regional data found for '{procedure_slug}'"}
    return {
        "procedure_slug": procedure_slug,
        "regions": [
            {
                "name": r.name,
                "country_code": r.country_code,
                "flag": r.flag_emoji,
                "avg_cost_usd": round(r.avg_cost, 0),
                "min_cost_usd": round(r.min_cost, 0),
                "max_cost_usd": round(r.max_cost, 0),
                "avg_wait_days": round(r.avg_wait, 1),
                "avg_outcome_score": round(r.avg_outcome, 2),
                "data_points": r.count,
            }
            for r in rows
        ],
    }


async def _get_top_hospitals(
    procedure_slug: str, region_code: str | None, limit: int, db: AsyncSession
) -> dict:
    q = (
        select(
            Hospital.name,
            Hospital.city,
            Hospital.accreditation,
            Hospital.website,
            Region.name.label("region_name"),
            Region.country_code,
            Region.flag_emoji,
            func.avg(Submission.cost_usd).label("avg_cost"),
            func.avg(Submission.outcome_score).label("avg_outcome"),
            func.avg(Submission.wait_days).label("avg_wait"),
            func.count(Submission.id).label("count"),
        )
        .select_from(Hospital)
        .join(Region, Hospital.region_id == Region.id)
        .join(Submission, Submission.hospital_id == Hospital.id)
        .join(Procedure, Submission.procedure_id == Procedure.id)
        .where(Procedure.slug == procedure_slug)
    )
    if region_code:
        q = q.where(Region.country_code == region_code)
    q = (
        q.group_by(
            Hospital.name,
            Hospital.city,
            Hospital.accreditation,
            Hospital.website,
            Region.name,
            Region.country_code,
            Region.flag_emoji,
        )
        .having(func.count(Submission.id) >= 2)
        .order_by(func.avg(Submission.outcome_score).desc(), func.avg(Submission.cost_usd))
        .limit(limit)
    )
    result = await db.execute(q)
    rows = result.all()
    if not rows:
        msg = f"No hospital data found for '{procedure_slug}'"
        return {"error": msg + (f" in {region_code}" if region_code else "")}
    return {
        "procedure_slug": procedure_slug,
        "hospitals": [
            {
                "name": r.name,
                "city": r.city,
                "region": r.region_name,
                "country_code": r.country_code,
                "flag": r.flag_emoji,
                "accreditation": r.accreditation,
                "website": r.website,
                "avg_cost_usd": round(r.avg_cost, 0),
                "avg_outcome_score": round(r.avg_outcome, 2),
                "avg_wait_days": round(r.avg_wait, 1),
                "data_points": r.count,
            }
            for r in rows
        ],
    }


async def _get_patient_testimonies(
    procedure_slug: str, region_code: str | None, limit: int, db: AsyncSession
) -> dict:
    q = (
        select(
            Submission.testimony,
            Submission.outcome_score,
            Submission.cost_usd,
            Submission.is_verified,
            Hospital.name.label("hospital_name"),
            Region.name.label("region_name"),
            Region.flag_emoji,
        )
        .join(Procedure, Submission.procedure_id == Procedure.id)
        .join(Hospital, Submission.hospital_id == Hospital.id)
        .join(Region, Hospital.region_id == Region.id)
        .where(Procedure.slug == procedure_slug, Submission.testimony.isnot(None))
    )
    if region_code:
        q = q.where(Region.country_code == region_code)
    q = q.order_by(Submission.outcome_score.desc()).limit(limit)
    result = await db.execute(q)
    rows = result.all()
    if not rows:
        return {"testimonies": [], "message": "No testimonies found."}
    return {
        "procedure_slug": procedure_slug,
        "testimonies": [
            {
                "text": r.testimony,
                "outcome_score": r.outcome_score,
                "cost_usd": round(r.cost_usd, 0),
                "verified": r.is_verified,
                "hospital": r.hospital_name,
                "region": r.region_name,
                "flag": r.flag_emoji,
            }
            for r in rows
        ],
    }
