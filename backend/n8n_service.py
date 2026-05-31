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
    'https://edu-yelpu.app.n8n.cloud/webhook-test/Get-Dashboard-data'
)

# Cache configuration (60-second TTL matches frontend refresh interval)
_cache: Dict[str, Any] = {
    "data": None,
    "fetched_at": None,
    "source": "demo"  # "live" or "demo"
}
_CACHE_TTL_SECONDS = 60
_lock = asyncio.Lock()

# Customer tier inference based on revenue
TIER_THRESHOLDS = [
    (2000000, "Platinum"),
    (1000000, "Gold"),
    (0, "Silver")
]

# Revenue inference by industry (fallback if not provided)
INDUSTRY_REVENUE_DEFAULTS = {
    "Fintech": 2400000,
    "Healthcare": 1800000,
    "SaaS": 1200000,
    "Telecom": 3200000,
    "Retail": 950000,
}


def _infer_tier(revenue: float) -> str:
    for threshold, tier in TIER_THRESHOLDS:
        if revenue >= threshold:
            return tier
    return "Silver"


def _safe_int(value, default=0) -> int:
    try:
        if isinstance(value, str):
            value = value.strip().rstrip('%')
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
    if v in ("medium", "med", "p2", "sev2", "sev-2"):
        return "Medium"
    if v in ("low", "p3", "p4", "sev3", "sev-3"):
        return "Low"
    return str(value).capitalize()


def _normalize_record(record: Dict[str, Any], idx: int) -> Dict[str, Any]:
    """Normalize a raw record into the incident shape used by the dashboard."""
    industry = record.get("industry") or "SaaS"
    customer_name = record.get("customer_name") or f"Customer {idx + 1}"
    severity = _normalize_severity(record.get("severity"))

    sla_risk = _safe_int(record.get("sla_risk"), 50)
    priority_score = _safe_int(record.get("customer_priority_score"), 50)
    escalation_pred = _safe_int(record.get("escalation_prediction"), 50)

    # Infer revenue and tier
    revenue = record.get("revenue_at_risk")
    if revenue is None:
        revenue = INDUSTRY_REVENUE_DEFAULTS.get(industry, 1000000)
    revenue = _safe_int(revenue, 1000000)

    tier = record.get("customer_tier") or _infer_tier(revenue)

    # Status inference
    status = record.get("status")
    if not status:
        if severity == "Critical":
            status = "Escalated"
        elif severity == "High":
            status = "In Progress"
        else:
            status = "Open"

    # Sentiment normalization
    sentiment = record.get("sentiment") or "Neutral"
    if severity == "Critical" and sentiment == "Neutral":
        sentiment = "Frustrated"

    timestamp = record.get("timestamp")
    if not timestamp:
        timestamp = datetime.now(timezone.utc).isoformat()

    return {
        "incident_id": record.get("incident_id") or f"INC-{1000 + idx}",
        "customer_name": customer_name,
        "industry": industry,
        "customer_tier": tier,
        "revenue_at_risk": revenue,
        "severity": severity,
        "sentiment": sentiment,
        "sla_risk": sla_risk,
        "customer_priority_score": priority_score,
        "escalation_prediction": escalation_pred,
        "summary": record.get("summary") or "Customer escalation requiring attention.",
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
        return [r for r in payload if isinstance(r, dict)]
    if isinstance(payload, dict):
        for key in ("data", "records", "items", "incidents", "results", "rows"):
            if key in payload and isinstance(payload[key], list):
                return [r for r in payload[key] if isinstance(r, dict)]
        # Single record
        if any(k in payload for k in ("customer_name", "severity", "summary")):
            return [payload]
    return []


async def _fetch_from_n8n() -> Optional[List[Dict[str, Any]]]:
    """Fetch raw data from n8n webhook. Returns None on failure."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(N8N_WEBHOOK_URL)
            if response.status_code != 200:
                logger.warning(
                    f"n8n webhook returned {response.status_code}: {response.text[:200]}"
                )
                return None
            payload = response.json()
            records = _extract_records(payload)
            if not records:
                logger.warning(f"n8n webhook returned no usable records: {str(payload)[:200]}")
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
        # Use cache if still valid
        if (
            _cache["data"] is not None
            and _cache["fetched_at"] is not None
            and (now - _cache["fetched_at"]).total_seconds() < _CACHE_TTL_SECONDS
        ):
            return {"incidents": _cache["data"], "source": _cache["source"]}

        # Try live fetch
        raw_records = await _fetch_from_n8n()

        if raw_records:
            incidents = [_normalize_record(r, i) for i, r in enumerate(raw_records)]
            incidents.sort(key=lambda x: x["customer_priority_score"], reverse=True)
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
        # Use existing mock metrics shape for consistency
        metrics = get_mock_metrics()
        metrics["source"] = "demo"
        return metrics

    # Derive metrics from live incidents
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

    # Severity distribution
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

    # Industry breakdown
    industry_counter = Counter(i["industry"] for i in incidents)
    industry_breakdown = [
        {"industry": name, "count": count} for name, count in industry_counter.most_common()
    ]

    # Incident trends (group by day of week from timestamps)
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

    # Build activity feed from most recent incidents
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
    }
