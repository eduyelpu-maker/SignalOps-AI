import random
from datetime import datetime, timezone, timedelta

# Mock enterprise data for demo mode
CUSTOMERS = [
    {"name": "PaymentCo", "industry": "Fintech", "tier": "Platinum", "revenue": 2400000},
    {"name": "HealthSystem Inc", "industry": "Healthcare", "tier": "Platinum", "revenue": 1800000},
    {"name": "CloudSaaS Ltd", "industry": "SaaS", "tier": "Gold", "revenue": 950000},
    {"name": "TelecomGiant", "industry": "Telecom", "tier": "Platinum", "revenue": 3200000},
    {"name": "RetailChain Corp", "industry": "Retail", "tier": "Gold", "revenue": 1200000},
    {"name": "FinanceHub", "industry": "Fintech", "tier": "Gold", "revenue": 850000},
    {"name": "MediCare Plus", "industry": "Healthcare", "tier": "Silver", "revenue": 450000},
    {"name": "DataVault Systems", "industry": "SaaS", "tier": "Platinum", "revenue": 2100000},
]

INCIDENT_TEMPLATES = [
    {
        "summary": "Payment gateway experiencing 45% failure rate affecting customer transactions",
        "recommended_action": "Escalate to VP Engineering. Deploy rollback to v2.3.1. Enable manual payment processing.",
        "industries": ["Fintech", "Retail"],
        "severity_range": ["Critical", "High"]
    },
    {
        "summary": "Database replication lag causing data inconsistency in patient records",
        "recommended_action": "Immediate escalation to CTO. Engage database team. Notify compliance officer.",
        "industries": ["Healthcare"],
        "severity_range": ["Critical"]
    },
    {
        "summary": "API rate limiting causing service degradation for 30% of users",
        "recommended_action": "Scale infrastructure. Implement temporary rate limit increase. Monitor capacity.",
        "industries": ["SaaS", "Telecom"],
        "severity_range": ["High", "Medium"]
    },
    {
        "summary": "SSO authentication failures preventing user login across enterprise accounts",
        "recommended_action": "Engage identity team immediately. Provide alternative auth method. Update status page.",
        "industries": ["SaaS", "Fintech", "Healthcare"],
        "severity_range": ["Critical", "High"]
    },
    {
        "summary": "Checkout process timing out during peak hours",
        "recommended_action": "Scale checkout service. Enable CDN caching. Notify business stakeholders of revenue impact.",
        "industries": ["Retail", "SaaS"],
        "severity_range": ["High", "Medium"]
    },
    {
        "summary": "Network latency spikes causing dropped calls and customer complaints",
        "recommended_action": "Escalate to network operations. Reroute traffic. Engage carrier support team.",
        "industries": ["Telecom"],
        "severity_range": ["Critical", "High"]
    },
    {
        "summary": "Mobile app crashing on iOS devices after latest release",
        "recommended_action": "Immediate rollback to previous version. Engage QA team. Issue customer communication.",
        "industries": ["SaaS", "Fintech", "Retail"],
        "severity_range": ["High", "Medium"]
    },
    {
        "summary": "Email notification system delays affecting critical alerts",
        "recommended_action": "Switch to backup notification provider. Investigate queue backlog. Monitor delivery rates.",
        "industries": ["Healthcare", "Fintech", "SaaS"],
        "severity_range": ["Medium", "Low"]
    },
]

def generate_mock_incidents(count=50):
    incidents = []
    
    for i in range(count):
        customer = random.choice(CUSTOMERS)
        template = None
        
        # Match template to customer industry if possible
        matching_templates = [t for t in INCIDENT_TEMPLATES if customer["industry"] in t["industries"]]
        if matching_templates:
            template = random.choice(matching_templates)
        else:
            template = random.choice(INCIDENT_TEMPLATES)
        
        severity = random.choice(template["severity_range"])
        
        # Calculate metrics based on severity
        if severity == "Critical":
            sentiment = random.choice(["Angry", "Very Negative", "Frustrated"])
            sla_risk = random.randint(85, 99)
            priority_score = random.randint(90, 100)
            escalation_pred = random.randint(90, 100)
        elif severity == "High":
            sentiment = random.choice(["Negative", "Concerned", "Frustrated"])
            sla_risk = random.randint(60, 85)
            priority_score = random.randint(70, 90)
            escalation_pred = random.randint(65, 90)
        elif severity == "Medium":
            sentiment = random.choice(["Neutral", "Concerned", "Negative"])
            sla_risk = random.randint(30, 60)
            priority_score = random.randint(40, 70)
            escalation_pred = random.randint(30, 65)
        else:
            sentiment = random.choice(["Neutral", "Calm"])
            sla_risk = random.randint(5, 30)
            priority_score = random.randint(10, 40)
            escalation_pred = random.randint(10, 30)
        
        hours_ago = random.randint(0, 72)
        timestamp = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        
        incident = {
            "incident_id": f"INC-{1000 + i}",
            "customer_name": customer["name"],
            "industry": customer["industry"],
            "customer_tier": customer["tier"],
            "revenue_at_risk": customer["revenue"],
            "severity": severity,
            "sentiment": sentiment,
            "sla_risk": sla_risk,
            "customer_priority_score": priority_score,
            "escalation_prediction": escalation_pred,
            "summary": template["summary"],
            "recommended_action": template["recommended_action"],
            "timestamp": timestamp.isoformat(),
            "status": random.choice(["Open", "In Progress", "Escalated"]) if severity in ["Critical", "High"] else "Open",
            "assigned_to": random.choice(["Engineering Team", "Support Lead", "DevOps", "Product Team"]),
            "open_incidents": random.randint(1, 5),
            "escalation_history": random.randint(0, 8)
        }
        
        incidents.append(incident)
    
    # Sort by priority score descending
    incidents.sort(key=lambda x: x["customer_priority_score"], reverse=True)
    return incidents

def get_mock_metrics():
    incidents = generate_mock_incidents(50)
    
    critical = len([i for i in incidents if i["severity"] == "Critical"])
    active = len([i for i in incidents if i["status"] in ["Open", "In Progress"]])
    revenue_risk = sum([i["revenue_at_risk"] for i in incidents if i["severity"] in ["Critical", "High"]])
    sla_breach = len([i for i in incidents if i["sla_risk"] > 70])
    exec_escalations = len([i for i in incidents if i["escalation_prediction"] > 80])
    
    return {
        "critical_incidents": critical,
        "critical_trend": random.choice(["+12%", "-8%", "+5%"]),
        "active_incidents": active,
        "active_trend": "+15%",
        "revenue_at_risk": revenue_risk,
        "revenue_trend": "+23%",
        "sla_breach_risk": sla_breach,
        "sla_trend": "+8%",
        "executive_escalations": exec_escalations,
        "exec_trend": "-5%"
    }

def get_analytics_data():
    return {
        "severity_distribution": [
            {"name": "Critical", "value": 8, "fill": "#ef4444"},
            {"name": "High", "value": 15, "fill": "#f59e0b"},
            {"name": "Medium", "value": 18, "fill": "#3b82f6"},
            {"name": "Low", "value": 9, "fill": "#10b981"}
        ],
        "incident_trends": [
            {"date": "Mon", "incidents": 12, "resolved": 8},
            {"date": "Tue", "incidents": 15, "resolved": 10},
            {"date": "Wed", "incidents": 10, "resolved": 12},
            {"date": "Thu", "incidents": 18, "resolved": 14},
            {"date": "Fri", "incidents": 22, "resolved": 16},
            {"date": "Sat", "incidents": 8, "resolved": 10},
            {"date": "Sun", "incidents": 6, "resolved": 7}
        ],
        "industry_breakdown": [
            {"industry": "Fintech", "count": 14},
            {"industry": "Healthcare", "count": 10},
            {"industry": "SaaS", "count": 12},
            {"industry": "Telecom", "count": 8},
            {"industry": "Retail", "count": 6}
        ]
    }

def get_activity_feed():
    activities = [
        {"id": 1, "type": "email", "message": "Escalation email received from PaymentCo", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()},
        {"id": 2, "type": "ai", "message": "AI analyzed incident severity: Critical", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=4)).isoformat()},
        {"id": 3, "type": "ticket", "message": "Jira ticket INC-1045 created automatically", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=3)).isoformat()},
        {"id": 4, "type": "alert", "message": "Slack alert sent to #critical-incidents", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat()},
        {"id": 5, "type": "dashboard", "message": "Dashboard updated with new incident data", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()},
        {"id": 6, "type": "email", "message": "Escalation email received from HealthSystem Inc", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()},
        {"id": 7, "type": "ai", "message": "AI predicted 95% escalation probability", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=14)).isoformat()},
    ]
    return activities
