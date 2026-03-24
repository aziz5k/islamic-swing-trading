const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'trading.db');

function initDB() {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL UNIQUE,
      company TEXT NOT NULL,
      current_price REAL,
      alert_price REAL,
      status TEXT DEFAULT 'انتظار',
      halal_musaffa INTEGER DEFAULT 0,
      halal_zoya INTEGER DEFAULT 0,
      debt_ratio REAL,
      revenue_growth REAL,
      analyst_rating TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      company TEXT,
      entry_date TEXT,
      entry_price REAL NOT NULL,
      shares INTEGER NOT NULL,
      total_investment REAL,
      target1_price REAL,
      target2_price REAL,
      stop_loss_price REAL,
      exit_date TEXT,
      exit_price REAL,
      exit_shares INTEGER,
      status TEXT DEFAULT 'مفتوحة',
      score INTEGER,
      rsi_entry REAL,
      vix_entry REAL,
      volume_ratio REAL,
      above_sma50 INTEGER DEFAULT 1,
      reversal_candle TEXT,
      musaffa_pass INTEGER DEFAULT 0,
      zoya_pass INTEGER DEFAULT 0,
      target1_hit INTEGER DEFAULT 0,
      target1_hit_date TEXT,
      stop_moved INTEGER DEFAULT 0,
      profit_loss REAL,
      profit_loss_pct REAL,
      lesson TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scoring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trade_id INTEGER,
      symbol TEXT NOT NULL,
      eval_date TEXT DEFAULT (datetime('now')),
      a1_drop_score INTEGER DEFAULT 0,
      a2_support_score INTEGER DEFAULT 0,
      a3_candle_score INTEGER DEFAULT 0,
      b1_rsi_score INTEGER DEFAULT 0,
      b2_sma50_score INTEGER DEFAULT 0,
      b3_volume_score INTEGER DEFAULT 0,
      c1_debt_score INTEGER DEFAULT 0,
      c2_revenue_score INTEGER DEFAULT 0,
      c3_analyst_score INTEGER DEFAULT 0,
      d1_vix_score INTEGER DEFAULT 0,
      d2_shariah_score INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      passed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      check_date TEXT DEFAULT (date('now')),
      vix_level REAL,
      vix_ok INTEGER DEFAULT 0,
      no_major_events INTEGER DEFAULT 0,
      sp500_above_sma50 INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS capital_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_date TEXT DEFAULT (date('now')),
      capital REAL NOT NULL,
      cycle_number INTEGER,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO watchlist (symbol, company, current_price, alert_price, status, halal_musaffa, halal_zoya) VALUES
      ('CSCO',  'Cisco Systems',       78.90,  76.50,  'قريب',            1, 1),
      ('MRK',   'Merck & Co',          119.83, 112.00, 'انتظار',          1, 1),
      ('ABT',   'Abbott Labs',         113.50, 108.00, 'انتظار',          1, 1),
      ('COP',   'ConocoPhillips',      117.64, 107.00, 'انتظار',          1, 1),
      ('QCOM',  'Qualcomm',            152.36, 128.00, 'انتظار',          1, 1),
      ('EOG',   'EOG Resources',       128.00, 115.00, 'انتظار',          1, 1),
      ('JNJ',   'Johnson & Johnson',   148.00, 132.00, 'انتظار',          1, 1),
      ('HON',   'Honeywell',           245.39, 225.00, 'انتظار',          1, 1),
      ('PG',    'Procter & Gamble',    160.04, 150.00, 'قريب',            1, 1),
      ('NVO',   'Novo Nordisk',        36.66,  36.00,  'عند الحد',        1, 0),
      ('NVDA',  'Nvidia',              179.86, 170.00, 'قريب',            1, 1),
      ('RBRK',  'Rubrik Inc',          53.67,  50.00,  'مراقبة مشددة',    0, 0),
      ('ZETA',  'Zeta Global',         15.60,  15.00,  'تأكد Zoya',       1, 0);

    INSERT OR IGNORE INTO capital_history (id, record_date, capital, cycle_number, description)
      VALUES (1, date('now'), 25000, 0, 'رأس المال الابتدائي');
  `);

  db.close();
  console.log('✅ Database ready');
}

module.exports = { DB_PATH, initDB };
