# VitaMirror – Testing Documentation

## Backend Tests (Pytest)

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `test_health.py` | 3 | Health endpoint, service name, root |
| `test_wellness_api.py` | 8 | CRUD for checks, validation |
| `test_vision_pipeline.py` | 5 | Frame analysis endpoint |

### Running

```bash
cd backend
python -m pytest tests/ -v
```

### Test Scenarios

#### Health Endpoint
| Scenario | Expected | Status |
|----------|----------|--------|
| GET /api/health returns 200 | `{"status": "ok"}` | ✅ |
| Service name contains "VitaMirror" | String match | ✅ |
| GET / returns version info | JSON with docs URL | ✅ |

#### Wellness CRUD
| Scenario | Expected | Status |
|----------|----------|--------|
| POST /checks returns 201 | Check with ID | ✅ |
| GET /checks returns list | `{checks: [], total: N}` | ✅ |
| GET /checks/{id} returns check | Correct check data | ✅ |
| GET /checks/999999 returns 404 | 404 Not Found | ✅ |
| DELETE /checks/{id} returns 204 | No content | ✅ |
| DELETE /checks/999999 returns 404 | 404 Not Found | ✅ |
| POST with invalid enum returns 422 | Validation error | ✅ |
| GET /checks?limit=200 caps at 100 | Max 100 items | ✅ |

#### Vision Pipeline
| Scenario | Expected | Status |
|----------|----------|--------|
| Valid JPEG frame → 200 | All indicator fields present | ✅ |
| Frame with data URI prefix → 200 | Same as above | ✅ |
| Invalid base64 → 422 or error body | Error response | ✅ |
| Frame > 5 MB → 422 | Size validation error | ✅ |
| Response includes disclaimer | Non-empty disclaimer text | ✅ |

---

## Frontend E2E Tests (Playwright)

### Running

```bash
cd frontend
npx playwright install chromium  # First time
npx playwright test
npx playwright show-report
```

### Test Scenarios

| Scenario | Expected | Status |
|----------|----------|--------|
| Landing page loads | Title = VitaMirror, hero heading visible | ✅ |
| Disclaimer shown on landing | "Educational" text visible | ✅ |
| Get Started → /check | Navigation works | ✅ |
| Dashboard button → /dashboard | Navigation works | ✅ |
| Dashboard page loads | "Wellness Overview" visible | ✅ |
| Start check button visible on dashboard | Button present | ✅ |
| Dashboard shows disclaimer | Non-diagnostic text visible | ✅ |
| Wellness check page loads | "Camera Analysis" visible | ✅ |
| Camera tips visible | Tips section present | ✅ |
| Wellness check disclaimer visible | Non-diagnostic text | ✅ |
| History page loads | "Wellness History" visible | ✅ |
| History shows empty or list state | One of both expected | ✅ |
| Privacy page loads | "Privacy Notice" visible | ✅ |
| Delete all button visible | Button present | ✅ |
| What data is collected section | Section visible | ✅ |
| Unknown route → /dashboard | Redirect works | ✅ |

---

## Test Infrastructure

### Backend Test DB
Tests use a separate in-memory SQLite DB (`test_vitamirror.db`) via `conftest.py` fixtures. The test database is created before the session and dropped after.

### Frontend Mock
Playwright tests use Chromium with camera permissions granted. Camera-specific flows are tested at the UI/state level (camera permission, start button), not at the pixel/stream level since headless browsers don't have a real camera.
