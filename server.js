const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const { DB_PATH, initDB } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

initDB();

const db = () => new Database(DB_PATH);

/* ─── WATCHLIST ─────────────────────────────────────────────── */
app.get('/api/watchlist', (req, res) => {
  const d = db();
  res.json(d.prepare('SELECT * FROM watchlist ORDER BY CASE status WHEN \'عند الحد\' THEN 1 WHEN \'قريب\' THEN 2 WHEN \'مراقبة مشددة\' THEN 3 ELSE 4 END, symbol').all());
  d.close();
});

app.post('/api/watchlist', (req, res) => {
  const d = db();
  const { symbol, company, current_price, alert_price, status, halal_musaffa, halal_zoya, debt_ratio, revenue_growth, analyst_rating, notes } = req.body;
  const r = d.prepare('INSERT INTO watchlist (symbol,company,current_price,alert_price,status,halal_musaffa,halal_zoya,debt_ratio,revenue_growth,analyst_rating,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(symbol.toUpperCase(), company, current_price||null, alert_price||null, status||'انتظار', halal_musaffa?1:0, halal_zoya?1:0, debt_ratio||null, revenue_growth||null, analyst_rating||null, notes||null);
  d.close();
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/watchlist/:id', (req, res) => {
  const d = db();
  const { symbol, company, current_price, alert_price, status, halal_musaffa, halal_zoya, debt_ratio, revenue_growth, analyst_rating, notes } = req.body;
  d.prepare('UPDATE watchlist SET symbol=?,company=?,current_price=?,alert_price=?,status=?,halal_musaffa=?,halal_zoya=?,debt_ratio=?,revenue_growth=?,analyst_rating=?,notes=?,updated_at=datetime(\'now\') WHERE id=?')
    .run(symbol, company, current_price, alert_price, status, halal_musaffa?1:0, halal_zoya?1:0, debt_ratio, revenue_growth, analyst_rating, notes, req.params.id);
  d.close();
  res.json({ ok: true });
});

app.delete('/api/watchlist/:id', (req, res) => {
  const d = db();
  d.prepare('DELETE FROM watchlist WHERE id=?').run(req.params.id);
  d.close();
  res.json({ ok: true });
});

/* ─── SCORING ────────────────────────────────────────────────── */
app.post('/api/scoring/calculate', (req, res) => {
  const { symbol, a1=0, a2=0, a3=0, b1=0, b2=0, b3=0, c1=0, c2=0, c3=0, d1=0, d2=0 } = req.body;
  const total = +a1 + +a2 + +a3 + +b1 + +b2 + +b3 + +c1 + +c2 + +c3 + +d1 + +d2;
  const passed = total >= 70 && +d2 === 10;

  const d = db();
  const r = d.prepare('INSERT INTO scoring (symbol,a1_drop_score,a2_support_score,a3_candle_score,b1_rsi_score,b2_sma50_score,b3_volume_score,c1_debt_score,c2_revenue_score,c3_analyst_score,d1_vix_score,d2_shariah_score,total_score,passed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(symbol, a1, a2, a3, b1, b2, b3, c1, c2, c3, d1, d2, total, passed?1:0);
  d.close();

  const msg = +d2 === 0
    ? '⛔ مرفوض فوراً — لم يجتز الفلتر الشرعي'
    : passed ? `✅ مقبول — ${total} نقطة`
    : `❌ مرفوض — ${total} نقطة (أقل من 70)`;

  res.json({ id: r.lastInsertRowid, total_score: total, passed, message: msg });
});

app.get('/api/scoring/:symbol', (req, res) => {
  const d = db();
  res.json(d.prepare('SELECT * FROM scoring WHERE symbol=? ORDER BY eval_date DESC LIMIT 10').all(req.params.symbol));
  d.close();
});

/* ─── TRADES ─────────────────────────────────────────────────── */
app.get('/api/trades', (req, res) => {
  const d = db();
  const { status } = req.query;
  const rows = status
    ? d.prepare('SELECT * FROM trades WHERE status=? ORDER BY created_at DESC').all(status)
    : d.prepare('SELECT * FROM trades ORDER BY created_at DESC').all();
  d.close();
  res.json(rows);
});

app.post('/api/trades', (req, res) => {
  const d = db();
  const t = req.body;
  const ep = parseFloat(t.entry_price);
  const sh = parseInt(t.shares);
  const r = d.prepare(`INSERT INTO trades
    (symbol,company,entry_date,entry_price,shares,total_investment,target1_price,target2_price,stop_loss_price,
     status,score,rsi_entry,vix_entry,volume_ratio,above_sma50,reversal_candle,musaffa_pass,zoya_pass,notes)
    VALUES (?,?,?,?,?,?,?,?,?, 'مفتوحة',?,?,?,?,?,?,?,?,?)`)
    .run(
      t.symbol.toUpperCase(), t.company||'', t.entry_date||new Date().toISOString().split('T')[0],
      ep, sh, ep*sh,
      +(ep*1.05).toFixed(4), +(ep*1.08).toFixed(4), +(ep*0.93).toFixed(4),
      t.score||null, t.rsi_entry||null, t.vix_entry||null, t.volume_ratio||null,
      t.above_sma50?1:0, t.reversal_candle||null, t.musaffa_pass?1:0, t.zoya_pass?1:0, t.notes||null
    );
  d.close();
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/trades/:id', (req, res) => {
  const d = db();
  const t = req.body;
  d.prepare(`UPDATE trades SET status=?,exit_date=?,exit_price=?,exit_shares=?,
    target1_hit=?,target1_hit_date=?,stop_moved=?,profit_loss=?,profit_loss_pct=?,lesson=?,notes=?
    WHERE id=?`)
    .run(t.status, t.exit_date||null, t.exit_price||null, t.exit_shares||null,
      t.target1_hit?1:0, t.target1_hit_date||null, t.stop_moved?1:0,
      t.profit_loss||null, t.profit_loss_pct||null, t.lesson||null, t.notes||null,
      req.params.id);
  d.close();
  res.json({ ok: true });
});

app.delete('/api/trades/:id', (req, res) => {
  const d = db();
  d.prepare('DELETE FROM trades WHERE id=?').run(req.params.id);
  d.close();
  res.json({ ok: true });
});

/* ─── STATS / DASHBOARD ──────────────────────────────────────── */
app.get('/api/stats', (req, res) => {
  const d = db();
  const total     = d.prepare('SELECT COUNT(*) c FROM trades').get().c;
  const open      = d.prepare("SELECT COUNT(*) c FROM trades WHERE status='مفتوحة'").get().c;
  const closed    = d.prepare("SELECT COUNT(*) c FROM trades WHERE status!='مفتوحة'").get().c;
  const wins      = d.prepare("SELECT COUNT(*) c FROM trades WHERE profit_loss>0").get().c;
  const losses    = d.prepare("SELECT COUNT(*) c FROM trades WHERE profit_loss<0").get().c;
  const totalPL   = d.prepare("SELECT COALESCE(SUM(profit_loss),0) s FROM trades WHERE status!='مفتوحة'").get().s;
  const avgScore  = d.prepare("SELECT COALESCE(AVG(score),0) a FROM trades WHERE score IS NOT NULL").get().a;
  const capital   = d.prepare('SELECT capital FROM capital_history ORDER BY id DESC LIMIT 1').get();
  const recent    = d.prepare('SELECT * FROM trades ORDER BY created_at DESC LIMIT 6').all();
  const monthly   = d.prepare(`SELECT strftime('%Y-%m',entry_date) m, SUM(profit_loss) pl, COUNT(*) cnt
                                FROM trades WHERE status!='مفتوحة'
                                GROUP BY m ORDER BY m DESC LIMIT 6`).all();
  d.close();

  res.json({
    total, open, closed, wins, losses,
    totalPL: +totalPL.toFixed(2),
    winRate: closed > 0 ? +((wins/closed)*100).toFixed(1) : 0,
    avgScore: +avgScore.toFixed(0),
    currentCapital: capital ? capital.capital : 25000,
    recent, monthly
  });
});

/* ─── CAPITAL ────────────────────────────────────────────────── */
app.get('/api/capital', (req, res) => {
  const d = db();
  res.json(d.prepare('SELECT * FROM capital_history ORDER BY id DESC').all());
  d.close();
});

app.post('/api/capital', (req, res) => {
  const d = db();
  const { capital, cycle_number, description } = req.body;
  const r = d.prepare('INSERT INTO capital_history (capital,cycle_number,description) VALUES (?,?,?)').run(capital, cycle_number||null, description||null);
  d.close();
  res.json({ id: r.lastInsertRowid });
});

/* ─── CHECKLIST ──────────────────────────────────────────────── */
app.get('/api/checklist', (req, res) => {
  const d = db();
  res.json(d.prepare('SELECT * FROM daily_checklist ORDER BY created_at DESC LIMIT 30').all());
  d.close();
});

app.post('/api/checklist', (req, res) => {
  const d = db();
  const { vix_level, vix_ok, no_major_events, sp500_above_sma50, notes } = req.body;
  const r = d.prepare('INSERT INTO daily_checklist (vix_level,vix_ok,no_major_events,sp500_above_sma50,notes) VALUES (?,?,?,?,?)')
    .run(vix_level||null, vix_ok?1:0, no_major_events?1:0, sp500_above_sma50?1:0, notes||null);
  d.close();
  res.json({ id: r.lastInsertRowid });
});

/* ─── CATCH-ALL ──────────────────────────────────────────────── */
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  http://localhost:${PORT}`));
