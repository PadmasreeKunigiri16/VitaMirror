# VitaMirror – Database Design

## Technology
- **Database**: SQLite (zero-configuration, local file)
- **ORM**: SQLAlchemy 2.x
- **File**: `backend/vitamirror.db`

## Tables

### wellness_checks

Stores the result of each completed wellness analysis session.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `created_at` | DATETIME | UTC timestamp of the check |
| `fatigue_level` | VARCHAR(20) | `low` / `moderate` / `elevated` / `unknown` |
| `stress_level` | VARCHAR(20) | `low` / `moderate` / `elevated` / `unknown` |
| `overall_wellness` | VARCHAR(20) | `good` / `fair` / `poor` / `unknown` |
| `skin_observations` | JSON | Skin label dictionary |
| `ear_value` | FLOAT | Eye Aspect Ratio value (nullable) |
| `blink_rate` | FLOAT | Estimated blinks/min (nullable) |
| `brow_tension` | FLOAT | Normalized brow tension proxy (nullable) |
| `skin_brightness` | FLOAT | Raw brightness value (nullable) |
| `skin_texture_variance` | FLOAT | Laplacian variance (nullable) |
| `skin_redness` | FLOAT | R/G ratio value (nullable) |
| `lighting_quality` | VARCHAR(20) | Lighting assessment |
| `face_detected` | INTEGER | 1 = face detected, 0 = no face |
| `notes` | TEXT | Optional user notes (nullable) |

## Schema SQL Equivalent

```sql
CREATE TABLE wellness_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fatigue_level VARCHAR(20) NOT NULL DEFAULT 'unknown',
    stress_level VARCHAR(20) NOT NULL DEFAULT 'unknown',
    overall_wellness VARCHAR(20) NOT NULL DEFAULT 'unknown',
    skin_observations JSON,
    ear_value REAL,
    blink_rate REAL,
    brow_tension REAL,
    skin_brightness REAL,
    skin_texture_variance REAL,
    skin_redness REAL,
    lighting_quality VARCHAR(20),
    face_detected INTEGER DEFAULT 1,
    notes TEXT
);
```

## Design Decisions

1. **Single table**: For a demo application, a single table with nullable fields is simpler and sufficient.
2. **JSON skin_observations**: Allows flexible skin metrics without requiring schema migration.
3. **No raw image storage**: Images are analyzed and discarded; only computed metrics are stored.
4. **No user authentication**: Single-user local application; no user table required in v1.

## Future Extensions

- Add `users` table for multi-user support
- Add `sessions` table to group multiple frames per check
- Migrate to PostgreSQL for cloud deployment
- Add indexes on `created_at` for faster history pagination
