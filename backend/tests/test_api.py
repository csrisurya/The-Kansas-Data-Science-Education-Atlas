import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# --- Root and Health ---
def test_read_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Kansas DS Education Atlas API"

def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

# --- Counties ---
def test_get_counties():
    resp = client.get("/api/v1/counties?limit=200")
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data and data["total"] == 105
    assert isinstance(data["counties"], list)
    assert len(data["counties"]) == 105

def test_get_counties_with_filter():
    resp = client.get("/api/v1/counties?has_programs=1&limit=200")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 17
    assert all(c["has_programs"] == 1 for c in data["counties"])

def test_get_county_by_id():
    resp = client.get("/api/v1/counties/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 1
    assert "county_name" in data

def test_get_county_not_found():
    resp = client.get("/api/v1/counties/999")
    assert resp.status_code == 404

def test_compare_counties():
    resp = client.get("/api/v1/counties/compare?ids=1,2,3")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 3
    ids = [c["id"] for c in data]
    assert set(ids) == {1, 2, 3}

# --- Programs ---
def test_get_programs():
    resp = client.get("/api/v1/programs")
    assert resp.status_code == 200
    data = resp.json()
    assert "programs" in data
    assert isinstance(data["programs"], list)

def test_search_programs():
    resp = client.get("/api/v1/programs?search_query=data")
    assert resp.status_code == 200
    data = resp.json()
    assert "programs" in data
    assert isinstance(data["programs"], list)
    # Check for course_name attribute in results
    if data["programs"]:
        assert "course_name" in data["programs"][0]

# --- Visualizations ---
def test_heat_map_data():
    resp = client.get("/api/v1/visualizations/heat-map?metric=total_program_impact_score")
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        data = resp.json()
        assert "counties" in data
        assert isinstance(data["counties"], list)
