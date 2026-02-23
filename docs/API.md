# Kansas Data Science Education Atlas API Documentation

## Overview
This API provides access to county-level data, DS/AI programs, and educational impact visualizations for Kansas. All endpoints return JSON.

---

## Health Check

### `GET /health`
**Description:** Returns API health status.

**Response:**
```json
{
	"status": "healthy"
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET http://localhost:8000/health
```

---

## Counties Endpoints

### `GET /api/v1/counties`
**Description:** List counties with optional filters.

**Query Parameters:**
- `skip` (int, default=0): Offset for pagination
- `limit` (int, default=100): Max results
- `has_programs` (int, optional): Filter by presence of programs (1 or 0)

**Response:**
```json
{
	"total": 105,
	"counties": [
		{
			"id": 1,
			"county_name": "Allen",
			"county_population": 12345,
			"total_program_impact_score": 42.5,
			"has_programs": 1
		}
	]
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/counties?limit=10&has_programs=1"
```

---

### `GET /api/v1/counties/{county_id}`
**Description:** Get details for a specific county by ID.

**Path Parameter:**
- `county_id` (int): County ID

**Response:**
```json
{
	"id": 1,
	"county_name": "Allen",
	"county_population": 12345,
	"total_program_impact_score": 42.5,
	"has_programs": 1
}
```
**Status Codes:**
- 200 OK
- 404 Not Found

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/counties/1
```

---

### `GET /api/v1/counties/by-name/{county_name}`
**Description:** Get county details by name.

**Path Parameter:**
- `county_name` (string): County name

**Response:**
```json
{
	"id": 1,
	"county_name": "Allen",
	"county_population": 12345,
	"total_program_impact_score": 42.5,
	"has_programs": 1
}
```
**Status Codes:**
- 200 OK
- 404 Not Found

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/counties/by-name/Allen
```

---

### `GET /api/v1/counties/compare`
**Description:** Compare multiple counties by IDs.

**Query Parameter:**
- `ids` (string): Comma-separated county IDs (e.g., "1,2,3")

**Response:**
```json
[
	{
		"id": 1,
		"county_name": "Allen",
		"total_program_impact_score": 42.5
	},
	{
		"id": 2,
		"county_name": "Anderson",
		"total_program_impact_score": 38.1
	}
]
```
**Status Codes:**
- 200 OK
- 400 Bad Request

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/counties/compare?ids=1,2"
```

---

### `GET /api/v1/counties/statistics`
**Description:** Get county statistics and impact scores.

**Response:**
```json
{
	"total_counties": 105,
	"counties_with_programs": 80,
	"counties_without_programs": 25,
	"avg_impact_score": 37.2,
	"highest_impact_county": {
		"id": 1,
		"county_name": "Allen",
		"total_program_impact_score": 42.5
	}
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/counties/statistics
```

---

### `GET /api/v1/counties/top-programs`
**Description:** Get top counties by program impact score.

**Query Parameter:**
- `limit` (int, default=10): Number of counties to return

**Response:**
```json
[
	{
		"id": 1,
		"county_name": "Allen",
		"total_program_impact_score": 42.5
	}
]
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/counties/top-programs?limit=5"
```

---

## Programs Endpoints

### `GET /api/v1/programs`
**Description:** List programs with optional filters.

**Query Parameters:**
- `skip` (int, default=0): Offset for pagination
- `limit` (int, default=100): Max results
- `level` (string, optional): Filter by course level
- `modality` (string, optional): Filter by modality
- `school_name` (string, optional): Filter by school
- `search_query` (string, optional): Search term

**Response:**
```json
{
	"total": 50,
	"programs": [
		{
			"id": 101,
			"school_name": "KSU",
			"degree_name": "BS Data Science",
			"course_name": "Intro to DS",
			"level": "Undergraduate",
			"modality": "Online"
		}
	]
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/programs?level=Undergraduate&modality=Online"
```

---

### `GET /api/v1/programs/{program_id}`
**Description:** Get details for a specific program by ID.

**Path Parameter:**
- `program_id` (int): Program ID

**Response:**
```json
{
	"id": 101,
	"school_name": "KSU",
	"degree_name": "BS Data Science",
	"course_name": "Intro to DS",
	"level": "Undergraduate",
	"modality": "Online"
}
```
**Status Codes:**
- 200 OK
- 404 Not Found

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/programs/101
```

---

### `GET /api/v1/programs/by-school/{school_name}`
**Description:** List programs for a specific school.

**Path Parameter:**
- `school_name` (string): School name

**Response:**
```json
[
	{
		"id": 101,
		"school_name": "KSU",
		"degree_name": "BS Data Science",
		"course_name": "Intro to DS"
	}
]
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/programs/by-school/KSU
```

---

### `GET /api/v1/programs/schools`
**Description:** List all schools with programs.

**Response:**
```json
{
	"schools": ["KSU", "KU", "WSU"],
	"count": 3
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/programs/schools
```

---

## Visualization Endpoints

### `GET /api/v1/visualizations/heat-map`
**Description:** Get heat map data for counties based on a metric.

**Query Parameter:**
- `metric` (string, default="total_program_impact_score"): Metric to visualize (options: total_program_impact_score, online_impact_score, broadband_access_index, median_income, county_population)

**Response:**
```json
{
	"counties": [
		{
			"id": 1,
			"county_name": "Allen",
			"lat": 37.9,
			"lng": -95.2,
			"value": 42.5
		}
	]
}
```
**Status Codes:**
- 200 OK
- 400 Bad Request

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/visualizations/heat-map?metric=median_income"
```

---

### `GET /api/v1/visualizations/distributions`
**Description:** Get distributions for impact score, income, population, and broadband access.

**Response:**
```json
{
	"impact_distribution": {"0-20": 10, "20-40": 30, "40-60": 40, "60-80": 20, "80+": 5},
	"income_distribution": {"<40k": 15, "40-60k": 40, "60-80k": 30, "80-100k": 15, "100k+": 5},
	"population_distribution": {"<10k": 20, "10-25k": 30, "25-50k": 25, "50-100k": 20, "100k+": 10},
	"broadband_stats": {
		"min": 0.5,
		"max": 1.0,
		"avg": 0.75,
		"median": 0.8,
		"std_dev": 0.1
	}
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/visualizations/distributions
```

---

### `GET /api/v1/visualizations/gap-analysis`
**Description:** Get gap analysis for counties (false positives, no programs, educational deserts).

**Response:**
```json
{
	"false_positives": ["Allen", "Anderson"],
	"no_programs": ["Barber", "Chase"],
	"educational_deserts": []
}
```
**Status Codes:**
- 200 OK

**Example:**
```bash
curl -X GET http://localhost:8000/api/v1/visualizations/gap-analysis
```

---

## Error Responses
Most endpoints return errors in the following format:
```json
{
	"detail": "Error message"
}
```

---

## Notes
- All endpoints return JSON.
- Default base URL is `http://localhost:8000` unless deployed otherwise.
- For POST endpoints, include request body as JSON.
- For authentication or admin endpoints, see future docs.
