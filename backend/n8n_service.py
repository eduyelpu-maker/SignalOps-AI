"""
n8n Dashboard Data Service
Fetches enterprise escalation data from n8n webhook and normalizes it for dashboard consumption.
Falls back to mock data if the API is unavailable.
"""
import os
import asyncio
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from collections import Counter
from mock_data import generate_mock_incidents, get_mock_metrics, get_analytics_data, get_activity_feed

logger = logging.getLogger(__name__)

N8N_WEBHOOK_URL = os.environ.get(
    'N8N_WEBHOOK_URL',
    'https://edu-yelpu.app.n8n.cloud/webhook/Get-Dashboard-data'
)

# Cache configuration (60-second TTL matches frontend refresh interval)
_cache: Dict[str, Any] = {
    "data": None,
    "fetched_at": None,
    "source": "demo"
}
_CACHE_TTL_SECONDS = 60
_lock = asyncio.Lock()

# Convert string risk levels to numeric percentages
RISK_LEVEL_MAP = {
    "critical": 95,
    "very high": 90,
    "high": 80,
    "medium": 50,
    "moderate": 50,
    "low": 25,
    "very low": 10,
    "minimal": 5,
    "none": 0,
}

# Revenue numeric mapping for string-based revenue_risk
REVENUE_RISK_MAP = {
    "critical": 5000000,
    "very high": 3500000,
    "high": 2500000,
    "medium": 1200000,
    "moderate": 1200000,
    "low": 500000,
    "very low": 200000,
    "minimal": 100000,
}

INDUSTRY_KEYWORDS = {
    "Healthcare": ["hospital", "health", "medical", "clinic", "medcore", "patient", "pharma"],
    "Fintech": ["bank", "pay", "finance", "fintech", "capital", "invest", "credit", "trading"],
    "Telecom": ["telecom", "telco", "mobile", "wireless", "communications", "network"],
    "Retail": ["retail", "shop", "store", "mart", "commerce", "checkout"],
    "SaaS": ["saas", "cloud", "soft", "tech", "platform", "data", "systems"],
}


def _infer_industry(customer_name: str, summary: str = "") -> str:
    text = (customer_name + " " + summary).lower()
    for industry, keywords in INDUSTRY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return industry
    return "SaaS"


def _safe_int(value, default=0) -> int:
    try:
        if isinstance(value, str):
            v = value.strip().rstrip('%').lower()
            # Check if it's a risk level word
            if v in RISK_LEVEL_MAP:
                return RISK_LEVEL_MAP[v]
            return int(float(v))
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _normalize_severity(value) -> str:
    if not value:
        return "Medium"
    v = str(value).strip().lower()
    if v in ("critical", "p0", "sev0", "sev-0"):
        return "Critical"
    if v in ("high", "p1", "sev1", "sev-1"):
        return "High"
    if v in ("medium", "med", "p2", "sev2", "sev-2", "moderate"):
        return "Medium"
    if v in ("low", "p3", "p4", "sev3", "sev-3"):
        return "Low"
    return str(value).capitalize()


def _normalize_sentiment(value) -> str:
    if not value:
        return "Neutral"
    v = str(value).strip()
    # Pass through n8n sentiments like "Executive Escalation", "Frustrated", etc.
    return v


def _resolve_revenue(record: Dict[str, Any], severity: str) -> int:
    """Resolve revenue_at_risk from various field shapes."""
    # Try numeric fields first
    for key in ("revenue_at_risk", "revenue"):
        if key in record and record[key] is not None:
            try:
                val = record[key]
                if isinstance(val, (int, float)):
                    return int(val)
                if isinstance(val, str) and val.replace(",", "").replace(".", "").replace("$", "").isdigit():
                    return int(float(val.replace(",", "").replace("$", "")))
            except (ValueError, TypeError):
                pass

    # Try string-based revenue_risk
    revenue_risk = record.get("revenue_risk")
    if revenue_risk and isinstance(revenue_risk, str):
        v = revenue_risk.strip().lower()
        if v in REVENUE_RISK_MAP:
            return REVENUE_RISK_MAP[v]

    # Default by severity
    severity_revenue = {
        "Critical": 3500000,
        "High": 1800000,
        "Medium": 800000,
        "Low": 200000,
    }
    return severity_revenue.get(severity, 1000000)


def _resolve_tier(revenue: int, record: Dict[str, Any]) -> str:
    if record.get("customer_tier"):
        return record["customer_tier"]
    if revenue >= 2500000:
        return "Platinum"
    if revenue >= 1000000:
        return "Gold"
    return "Silver"


def _normalize_record(record: Dict[str, Any], idx: int) -> Dict[str, Any]:
    """Normalize a raw n8n record into the incident shape used by the dashboard."""
    customer_name = record.get("customer_name") or f"Customer {idx + 1}"
    summary = record.get("summary") or "Customer escalation requiring attention."
    severity = _normalize_severity(record.get("severity"))

    industry = record.get("industry") or _infer_industry(customer_name, summary)

    # Numeric fields (handle both numeric and string values)
    sla_risk = _safe_int(record.get("sla_risk"), 50)
    # Support both priority_score and customer_priority_score
    priority_score = _safe_int(
        record.get("customer_priority_score") or record.get("priority_score"),
        50
    )
    escalation_pred = _safe_int(
        record.get("escalation_prediction") or record.get("escalation_probability"),
        # Derive from priority score if missing
        min(100, priority_score + 5) if severity in ("Critical", "High") else max(20, priority_score - 20)
    )

    revenue = _resolve_revenue(record, severity)
    tier = _resolve_tier(revenue, record)

    status = record.get("status")
    if not status:
        if severity == "Critical":
            status = "Escalated"
        elif severity == "High":
            status = "In Progress"
        else:
            status = "Open"

    sentiment = _normalize_sentiment(record.get("sentiment"))

    timestamp = record.get("timestamp")
    if not timestamp:
        timestamp = datetime.now(timezone.utc).isoformat()

    incident_id = record.get("incident_id")
    if not incident_id:
        row_num = record.get("row_number") or (idx + 1)
        incident_id = f"INC-{1000 + int(row_num)}"

    return {
        "incident_id": incident_id,
        "customer_name": customer_name,
        "industry": industry,
        "customer_tier": tier,
        "revenue_at_risk": revenue,
        "severity": severity,
        "sentiment": sentiment,
        "sla_risk": sla_risk,
        "customer_priority_score": priority_score,
        "escalation_prediction": escalation_pred,
        "summary": summary,
        "recommended_action": record.get("recommended_action") or "Review with support team and assign owner.",
        "timestamp": timestamp,
        "status": status,
        "assigned_to": record.get("assigned_to") or "Support Lead",
        "open_incidents": _safe_int(record.get("open_incidents"), 1),
        "escalation_history": _safe_int(record.get("escalation_history"), 0),
    }


def _extract_records(payload: Any) -> List[Dict[str, Any]]:
    """Extract records from various possible n8n response shapes."""
    if payload is None:
        return []
    if isinstance(payload, list):
        # Unwrap n8n Aggregate wrapper: [{"data": [...records...]}]
        if len(payload) == 1 and isinstance(payload[0], dict):
            inner = payload[0]
            for key in ("data", "records", "items", "incidents", "results", "rows"):
                if key in inner and isinstance(inner[key], list):
                    return [r for r in inner[key] if isinstance(r, dict)]
        return [r for r in payload if isinstance(r, dict)]
    if isinstance(payload, dict):
        # n8n acknowledgment responses - not real data
        if set(payload.keys()) <= {"message", "code"}:
            return []
        # Common n8n wrapper keys
        for key in ("data", "records", "items", "incidents", "results", "rows"):
            if key in payload and isinstance(payload[key], list):
                return [r for r in payload[key] if isinstance(r, dict)]
        # Single record - wrap in list
        if any(k in payload for k in ("customer_name", "severity", "summary", "row_number")):
            return [payload]
    return []


async def _fetch_from_n8n() -> Optional[List[Dict[str, Any]]]:
    """Fetch raw data from n8n webhook. Returns None on failure."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(N8N_WEBHOOK_URL)
            if response.status_code != 200:
                logger.warning(f"n8n webhook returned {response.status_code}: {response.text[:200]}")
                return None
            payload = response.json()
            records = _extract_records(payload)
            if not records:
                logger.warning(f"n8n webhook returned no usable records: {str(payload)[:300]}")
                return None
            logger.info(f"Fetched {len(records)} records from n8n")
            return records
    except Exception as e:
        logger.warning(f"n8n fetch failed: {e}")
        return None


async def get_incidents_data() -> Dict[str, Any]:
    """Get incidents data with caching and fallback. Returns {incidents, source}."""
    async with _lock:
        now = datetime.now(timezone.utc)
        if (
            _cache["data"] is not None
            and _cache["fetched_at"] is not None
            and (now - _cache["fetched_at"]).total_seconds() < _CACHE_TTL_SECONDS
        ):
            return {"incidents": _cache["data"], "source": _cache["source"]}

        raw_records = await _fetch_from_n8n()

        if raw_records:
            incidents = [_normalize_record(r, i) for i, r in enumerate(raw_records)]
            # Sort by timestamp descending (latest first) - matches Google Sheet row order
            incidents.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            _cache["data"] = incidents
            _cache["fetched_at"] = now
            _cache["source"] = "live"
            return {"incidents": incidents, "source": "live"}

        # Fallback to mock data
        incidents = generate_mock_incidents(50)
        _cache["data"] = incidents
        _cache["fetched_at"] = now
        _cache["source"] = "demo"
        return {"incidents": incidents, "source": "demo"}


async def get_metrics_data() -> Dict[str, Any]:
    """Compute KPI metrics from cached/live incidents data."""
    result = await get_incidents_data()
    incidents = result["incidents"]
    source = result["source"]

    if source == "demo":
        metrics = get_mock_metrics()
        metrics["source"] = "demo"
        return metrics

    critical = sum(1 for i in incidents if i["severity"] == "Critical")
    active = sum(1 for i in incidents if i["status"] in ("Open", "In Progress", "Escalated"))
    revenue_risk = sum(
        i["revenue_at_risk"] for i in incidents if i["severity"] in ("Critical", "High")
    )
    sla_breach = sum(1 for i in incidents if i["sla_risk"] > 70)
    exec_escalations = sum(1 for i in incidents if i["escalation_prediction"] > 80)

    return {
        "critical_incidents": critical,
        "critical_trend": "+12%",
        "active_incidents": active,
        "active_trend": "+15%",
        "revenue_at_risk": revenue_risk,
        "revenue_trend": "+23%",
        "sla_breach_risk": sla_breach,
        "sla_trend": "+8%",
        "executive_escalations": exec_escalations,
        "exec_trend": "-5%",
        "source": "live",
    }


async def get_analytics_payload() -> Dict[str, Any]:
    """Compute analytics charts data from live or demo incidents."""
    result = await get_incidents_data()
    incidents = result["incidents"]
    source = result["source"]

    if source == "demo":
        data = get_analytics_data()
        data["source"] = "demo"
        return data

    severity_colors = {
        "Critical": "#ef4444",
        "High": "#f59e0b",
        "Medium": "#3b82f6",
        "Low": "#10b981",
    }
    sev_counter = Counter(i["severity"] for i in incidents)
    severity_distribution = [
        {"name": name, "value": count, "fill": severity_colors.get(name, "#64748b")}
        for name, count in sev_counter.most_common()
    ]

    industry_counter = Counter(i["industry"] for i in incidents)
    industry_breakdown = [
        {"industry": name, "count": count} for name, count in industry_counter.most_common()
    ]

    day_buckets: Dict[str, Dict[str, int]] = {}
    day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for d in day_order:
        day_buckets[d] = {"incidents": 0, "resolved": 0}

    for i in incidents:
        try:
            ts = i["timestamp"]
            if isinstance(ts, str):
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            else:
                dt = ts
            day_name = day_order[dt.weekday()]
            day_buckets[day_name]["incidents"] += 1
            if i.get("status") not in ("Open", "In Progress", "Escalated"):
                day_buckets[day_name]["resolved"] += 1
        except Exception:
            continue

    incident_trends = [
        {"date": d, "incidents": day_buckets[d]["incidents"], "resolved": day_buckets[d]["resolved"]}
        for d in day_order
    ]

    return {
        "severity_distribution": severity_distribution,
        "incident_trends": incident_trends,
        "industry_breakdown": industry_breakdown,
        "source": "live",
    }


async def get_activity_payload() -> List[Dict[str, Any]]:
    """Generate activity feed from live incidents (most recent) or fallback to demo."""
    result = await get_incidents_data()
    incidents = result["incidents"]
    source = result["source"]

    if source == "demo":
        return get_activity_feed()

    sorted_incidents = sorted(
        incidents,
        key=lambda x: x.get("timestamp", ""),
        reverse=True,
    )[:10]

    activities = []
    for idx, inc in enumerate(sorted_incidents):
        base_time = datetime.now(timezone.utc) - timedelta(minutes=idx * 2)
        activities.extend([
            {
                "id": idx * 5 + 1,
                "type": "email",
                "message": f"Escalation email received from {inc['customer_name']}",
                "timestamp": base_time.isoformat(),
            },
            {
                "id": idx * 5 + 2,
                "type": "ai",
                "message": f"AI analyzed incident severity: {inc['severity']} ({inc['escalation_prediction']}% escalation probability)",
                "timestamp": (base_time + timedelta(seconds=30)).isoformat(),
            },
        ])
        if inc["severity"] in ("Critical", "High"):
            activities.append({
                "id": idx * 5 + 3,
                "type": "ticket",
                "message": f"Jira ticket {inc['incident_id']} created for {inc['customer_name']}",
                "timestamp": (base_time + timedelta(seconds=45)).isoformat(),
            })
            activities.append({
                "id": idx * 5 + 4,
                "type": "alert",
                "message": f"Slack alert sent to #critical-incidents for {inc['customer_name']}",
                "timestamp": (base_time + timedelta(seconds=60)).isoformat(),
            })

    return activities[:20]


def get_source_info() -> Dict[str, Any]:
    """Return current data source info for UI badges."""
    return {
        "source": _cache.get("source", "demo"),
        "fetched_at": _cache["fetched_at"].isoformat() if _cache.get("fetched_at") else None,
        "endpoint": N8N_WEBHOOK_URL,
        "record_count": len(_cache["data"]) if _cache.get("data") else 0,
    }
