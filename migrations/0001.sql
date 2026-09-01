CREATE TABLE accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, opening INTEGER NOT NULL CHECK(opening >= 0), reserve INTEGER NOT NULL DEFAULT 0 CHECK(reserve >= 0 AND reserve <= opening));
CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK(id=1), start_date TEXT NOT NULL);
CREATE TABLE movements (id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('income','expense','transfer')), account TEXT NOT NULL REFERENCES accounts(id), destination TEXT REFERENCES accounts(id), amount INTEGER NOT NULL CHECK(amount > 0), note TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX idx_movements_date ON movements(date, created_at);
CREATE TABLE login_attempts (ip TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL);
