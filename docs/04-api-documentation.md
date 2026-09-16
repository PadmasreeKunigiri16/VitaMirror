# VitaMirror API Documentation

## Base URL
```
http://localhost:8000/api
```

Interactive Swagger UI: `http://localhost:8000/docs`

---

## GET /health

Returns API health status.

### Response 200
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "VitaMirror API"
}
```

---

## POST /wellness/analyze

Analyze a single webcam frame and return wellness indicators.

### Request Body
```json
{
  "frame_data": "<base64-encoded JPEG or PNG, max 5 MB>",
  "timestamp": "2024-01-15T10:30:00Z"  // optional
}
```

Note: `frame_data` may include or omit the `data:image/jpeg;base64,` prefix.

### Response 200
```json
{
  "success": true,
  "face_detected": true,
  "multiple_faces": false,
  "lighting_quality": "good",
  "fatigue_level": "low",
  "stress_level": "moderate",
  "overall_wellness": "fair",
  "ear_value": 0.2954,
  "blink_rate": null,
  "brow_tension": 0.2234,
  "skin_observations": {
    "brightness": "normal",
    "texture_variation": "moderate",
    "color_uniformity": "high",
    "redness": "low",
    "note": "Skin observations are experimental..."
  },
  "status_message": "Analysis complete",
  "disclaimer": "VitaMirror provides experimental, non-diagnostic...",
  "error": null
}
```

### Response 422 – Validation Error
```json
{
  "detail": [{ "loc": ["body", "frame_data"], "msg": "Frame data exceeds 5 MB limit", "type": "value_error" }]
}
```

---

## POST /wellness/checks

Save a completed wellness check.

### Request Body
```json
{
  "fatigue_level": "low",
  "stress_level": "moderate",
  "overall_wellness": "fair",
  "skin_observations": { "brightness": "normal", "redness": "low" },
  "ear_value": 0.295,
  "blink_rate": null,
  "brow_tension": 0.223,
  "skin_brightness": 145.2,
  "skin_texture_variance": 62.4,
  "skin_redness": 1.14,
  "lighting_quality": "good",
  "face_detected": true,
  "notes": null
}
```

### Response 201
```json
{
  "id": 42,
  "created_at": "2024-01-15T10:30:05.123456Z",
  "fatigue_level": "low",
  ...
}
```

---

## GET /wellness/checks

List wellness checks, newest first.

### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| skip | int | 0 | Pagination offset |
| limit | int | 50 | Max results (capped at 100) |

### Response 200
```json
{
  "checks": [...],
  "total": 15
}
```

---

## GET /wellness/checks/{id}

Retrieve a single wellness check.

### Response 200 / 404

---

## DELETE /wellness/checks/{id}

Delete a wellness check by ID.

### Response 204 (No Content) / 404

---

## Error Response Format
```json
{
  "detail": "Human-readable error message"
}
```

## Indicator Level Values

| Field | Possible Values |
|-------|----------------|
| fatigue_level | `low` \| `moderate` \| `elevated` \| `unknown` |
| stress_level | `low` \| `moderate` \| `elevated` \| `unknown` |
| overall_wellness | `good` \| `fair` \| `poor` \| `unknown` |
| lighting_quality | `good` \| `fair` \| `poor` \| `unknown` |
