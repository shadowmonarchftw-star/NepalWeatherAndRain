#!/usr/bin/env node
/**
 * Verifies that every value served by this app's APIs matches the official sources
 * (DHM / NDRRMA BIPAD / DoE / DHM MFD). Fails (exit 1) on any invented, altered or
 * stale value, or if a feed stops returning data.
 *
 * Usage: BASE_URL=http://localhost:3000 node scripts/verify-data.mjs
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const BIPAD = "https://bipadportal.gov.np/api/v1";
const UA = { "User-Agent": "Mozilla/5.0 (NepalWeatherTracker data check)", Accept: "application/json" };
const HOUR = 3600 * 1000;
const SLACK = 20 * 60 * 1000; // our 5-min cache + source update interval

const failures = [];
const notes = [];
const fail = (feed, msg) => failures.push(`[${feed}] ${msg}`);
const now = Date.now();
const ageOk = (iso, maxMs) => {
  const t = Date.parse(iso);
  return Number.isFinite(t) && t <= now + 5 * 60 * 1000 && now - t <= maxMs + SLACK;
};

async function getJson(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...UA, ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function check(feed, fn) {
  try {
    await fn();
  } catch (err) {
    fail(feed, `check crashed: ${err.message}`);
  }
}

const dhmStatus = (raw) => {
  const s = (raw || "").toUpperCase();
  if (s.includes("ABOVE DANGER")) return "Danger";
  if (s.includes("ABOVE WARNING")) return "Warning";
  return "Normal";
};
const r2 = (v) => (v === null || v === undefined ? null : Number(Number(v).toFixed(2)));

await check("dhm rivers", async () => {
  const [app, raw] = await Promise.all([getJson(`${BASE_URL}/api/dhm`), getJson(`${BIPAD}/river-stations/?limit=1000`)]);
  const byId = new Map(raw.results.map((r) => [r.id, r]));
  if (!app.success || !app.rivers?.length) return fail("dhm rivers", "no stations returned");
  let exact = 0;
  for (const s of app.rivers) {
    const r = byId.get(s.id);
    if (!r) { fail("dhm rivers", `${s.name}: id ${s.id} not in BIPAD`); continue; }
    if (!ageOk(s.waterLevelOn, 24 * HOUR)) fail("dhm rivers", `${s.name}: stale reading ${s.waterLevelOn}`);
    if (r2(r.warningLevel) !== s.warningLevelM) fail("dhm rivers", `${s.name}: warning level ${s.warningLevelM} ≠ DHM ${r.warningLevel}`);
    if (r2(r.dangerLevel) !== s.dangerLevelM) fail("dhm rivers", `${s.name}: danger level ${s.dangerLevelM} ≠ DHM ${r.dangerLevel}`);
    if (r.waterLevelOn === s.waterLevelOn) {
      exact++;
      if (r2(r.waterLevel) !== s.waterLevelM) fail("dhm rivers", `${s.name}: WL ${s.waterLevelM} ≠ DHM ${r.waterLevel}`);
      if (dhmStatus(r.status) !== s.status) fail("dhm rivers", `${s.name}: status ${s.status} ≠ DHM ${r.status}`);
    }
  }
  notes.push(`dhm rivers: ${app.rivers.length} checked, ${exact} exact-matched on same timestamp`);
});

await check("rain", async () => {
  const [app, raw] = await Promise.all([getJson(`${BASE_URL}/api/rain`), getJson(`${BIPAD}/rain-stations/?limit=1000`)]);
  const byId = new Map(raw.results.map((r) => [r.id, r]));
  if (!app.success || !app.stations?.length) return fail("rain", "no stations returned");
  let exact = 0;
  for (const s of app.stations) {
    const r = byId.get(s.id);
    if (!r) { fail("rain", `${s.name}: id ${s.id} not in BIPAD`); continue; }
    if (!ageOk(s.measuredOn, 3 * HOUR)) fail("rain", `${s.name}: stale reading ${s.measuredOn}`);
    if (r.measuredOn === s.measuredOn) {
      exact++;
      const av = new Map((r.averages || []).map((a) => [a.interval, a.value]));
      const pairs = [[1, s.rain1h], [3, s.rain3h], [6, s.rain6h], [12, s.rain12h], [24, s.rain24h]];
      for (const [h, v] of pairs) {
        if ((av.get(h) ?? null) !== v) fail("rain", `${s.name}: ${h}h ${v} ≠ DHM ${av.get(h)}`);
      }
    }
  }
  notes.push(`rain: ${app.stations.length} checked, ${exact} exact-matched on same timestamp`);
});

await check("aqi", async () => {
  const [app, raw] = await Promise.all([getJson(`${BASE_URL}/api/aqi`), getJson(`${BIPAD}/pollution-stations/?limit=200`)]);
  const byId = new Map(raw.results.map((r) => [r.id, r]));
  if (!app.success || !app.stations?.length) return fail("aqi", "no stations returned");
  let exact = 0;
  for (const s of app.stations) {
    const r = byId.get(s.id);
    if (!r) { fail("aqi", `${s.name}: id ${s.id} not in BIPAD`); continue; }
    if (!ageOk(s.measuredOn, 3 * HOUR)) fail("aqi", `${s.name}: stale reading ${s.measuredOn}`);
    if (r.dateTime === s.measuredOn) {
      exact++;
      if (Math.round(r.aqi) !== s.aqi) fail("aqi", `${s.name}: AQI ${s.aqi} ≠ source ${r.aqi}`);
    }
  }
  notes.push(`aqi: ${app.stations.length} checked, ${exact} exact-matched on same timestamp`);
});

await check("ndrrma alerts", async () => {
  const [app, raw] = await Promise.all([
    getJson(`${BASE_URL}/api/ndrrma`),
    getJson(`${BIPAD}/alert/?limit=300&ordering=-started_on`),
  ]);
  if (!app.success) return fail("ndrrma alerts", "feed returned success=false");
  const byId = new Map(raw.results.map((r) => [r.id, r]));
  for (const a of app.alerts) {
    const r = byId.get(a.id);
    if (!r) { fail("ndrrma alerts", `alert ${a.id} not in BIPAD`); continue; }
    if (r.title !== a.title) fail("ndrrma alerts", `alert ${a.id}: title differs`);
    if ((r.startedOn || r.createdOn) !== a.startedOn) fail("ndrrma alerts", `alert ${a.id}: start time differs`);
    const expired = r.expireOn ? Date.parse(r.expireOn) < now - SLACK : !ageOk(a.startedOn, 72 * HOUR);
    if (expired) fail("ndrrma alerts", `alert ${a.id} is no longer active`);
  }
  notes.push(`ndrrma alerts: ${app.alerts.length} checked`);
});

await check("incidents", async () => {
  const [app, raw] = await Promise.all([
    getJson(`${BASE_URL}/api/incidents`),
    getJson(`${BIPAD}/incident/?limit=500&ordering=-incident_on&expand=loss`),
  ]);
  if (!app.success) return fail("incidents", "feed returned success=false");
  const byId = new Map(raw.results.map((r) => [r.id, r]));
  for (const i of app.incidents) {
    const r = byId.get(i.id);
    if (!r) { fail("incidents", `incident ${i.id} not in BIPAD`); continue; }
    if (!r.verified || !r.approved) fail("incidents", `incident ${i.id} not verified/approved`);
    if (r.incidentOn !== i.incidentOn) fail("incidents", `incident ${i.id}: date differs`);
    if (Date.parse(i.incidentOn) > now + 5 * 60 * 1000) fail("incidents", `incident ${i.id}: future date`);
    if ((r.loss?.peopleDeathCount || 0) !== i.deaths) fail("incidents", `incident ${i.id}: deaths ${i.deaths} ≠ ${r.loss?.peopleDeathCount}`);
  }
  notes.push(`incidents: ${app.incidents.length} checked`);
});

await check("dhm forecast", async () => {
  const [app, raw] = await Promise.all([
    getJson(`${BASE_URL}/api/dhm-forecast`),
    getJson("https://dhm.gov.np/mfd/api/country-forecast"),
  ]);
  if (!app.success) return fail("dhm forecast", "feed returned success=false");
  // Our copy may be up to 30 min behind; only compare when it is the same bulletin
  if (app.issuedAt === raw.issue_date) {
    const clean = (v) => (v || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (app.periods[0].en !== clean(raw.en_text_1)) fail("dhm forecast", "period 1 text differs from DHM");
    if (app.periods[1].en !== clean(raw.en_text_2)) fail("dhm forecast", "period 2 text differs from DHM");
  } else if (!ageOk(app.issuedAt, 24 * HOUR)) {
    fail("dhm forecast", `bulletin is older than 24h (${app.issuedAt})`);
  }
  notes.push(`dhm forecast: issued ${app.issuedAt}`);
});

console.log(`Data check against ${BASE_URL}`);
notes.forEach((n) => console.log("  ✓ " + n));
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  failures.slice(0, 100).forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
console.log("\nAll served data matches the official sources.");
