-- schema.sql: Database schema for Sales Tracking system (SQLite Dialect)

-- Table 1: qr_logs
CREATE TABLE IF NOT EXISTS qr_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    employee_id     TEXT NOT NULL,
    employee_name   TEXT NOT NULL,
    project_name    TEXT,
    customer_name   TEXT,
    generated_url   TEXT NOT NULL,
    ip_address      TEXT,
    user_agent      TEXT
);

CREATE INDEX IF NOT EXISTS idx_qr_logs_employee ON qr_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_qr_logs_created  ON qr_logs(created_at DESC);

-- Table 2: survey_results
CREATE TABLE IF NOT EXISTS survey_results (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_at        TEXT NOT NULL DEFAULT (datetime('now')),
    employee_id         TEXT NOT NULL,
    employee_name       TEXT NOT NULL,
    project_name        TEXT,
    customer_name       TEXT,
    satisfaction_score  INTEGER NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 5),
    suggestions         TEXT,
    qr_log_id           INTEGER REFERENCES qr_logs(id) ON DELETE SET NULL,
    customer_ip         TEXT
);

CREATE INDEX IF NOT EXISTS idx_survey_employee  ON survey_results(employee_id);
CREATE INDEX IF NOT EXISTS idx_survey_submitted ON survey_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_score     ON survey_results(satisfaction_score);
