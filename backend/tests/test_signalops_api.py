"""Backend API tests for SignalOps AI"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://risk-intelligence-17.preview.emergentagent.com").rstrip("/")
SESSION_TOKEN = "test_session_12345"
AUTH_HEADERS = {"Authorization": f"Bearer {SESSION_TOKEN}"}


# Root / health
def test_root_api():
    r = requests.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert "message" in r.json()


# --- Auth ---
def test_auth_me_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_auth_me_with_invalid_token():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer bogus_token"})
    assert r.status_code == 401


def test_auth_me_with_valid_token():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=AUTH_HEADERS)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user_id"] == "test-user-12345"
    assert data["email"] == "test.user.dashboard@example.com"
    assert data["name"] == "Demo Executive"


def test_auth_session_endpoint_exists():
    # Missing session_id -> 400
    r = requests.post(f"{BASE_URL}/api/auth/session", json={})
    assert r.status_code == 400
    # Invalid session_id -> 401 from upstream
    r2 = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid_dummy"})
    assert r2.status_code in (401, 400, 500)  # endpoint exists


# --- Incidents ---
def test_incidents_requires_auth():
    r = requests.get(f"{BASE_URL}/api/incidents")
    assert r.status_code == 401


def test_incidents_returns_50():
    r = requests.get(f"{BASE_URL}/api/incidents", headers=AUTH_HEADERS)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 50
    inc = data[0]
    expected = {
        "incident_id", "customer_name", "industry", "customer_tier",
        "revenue_at_risk", "severity", "sentiment", "sla_risk",
        "customer_priority_score", "escalation_prediction", "summary",
        "recommended_action", "timestamp", "status", "assigned_to"
    }
    assert expected.issubset(inc.keys()), f"Missing: {expected - set(inc.keys())}"
    assert inc["severity"] in ["Critical", "High", "Medium", "Low"]


# --- Metrics ---
def test_metrics_requires_auth():
    r = requests.get(f"{BASE_URL}/api/metrics")
    assert r.status_code == 401


def test_metrics_structure():
    r = requests.get(f"{BASE_URL}/api/metrics", headers=AUTH_HEADERS)
    assert r.status_code == 200
    data = r.json()
    for k in ["critical_incidents", "active_incidents", "revenue_at_risk",
              "sla_breach_risk", "executive_escalations"]:
        assert k in data
        assert isinstance(data[k], (int, float))
    for k in ["critical_trend", "active_trend", "revenue_trend", "sla_trend", "exec_trend"]:
        assert k in data


# --- Analytics ---
def test_analytics_structure():
    r = requests.get(f"{BASE_URL}/api/analytics", headers=AUTH_HEADERS)
    assert r.status_code == 200
    data = r.json()
    assert "severity_distribution" in data
    assert "incident_trends" in data
    assert "industry_breakdown" in data
    assert len(data["severity_distribution"]) > 0
    assert len(data["incident_trends"]) > 0
    assert len(data["industry_breakdown"]) > 0
    assert "name" in data["severity_distribution"][0]
    assert "value" in data["severity_distribution"][0]
    assert "date" in data["incident_trends"][0]
    assert "incidents" in data["incident_trends"][0]


# --- Activity ---
def test_activity_requires_auth():
    r = requests.get(f"{BASE_URL}/api/activity")
    assert r.status_code == 401


def test_activity_feed():
    r = requests.get(f"{BASE_URL}/api/activity", headers=AUTH_HEADERS)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0
    a = data[0]
    for k in ["id", "type", "message", "timestamp"]:
        assert k in a


# --- Logout (don't actually invalidate test session - use cookie path) ---
def test_logout_no_cookie_succeeds():
    r = requests.post(f"{BASE_URL}/api/auth/logout")
    assert r.status_code == 200
