const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }}).outputText;
const utils = { exports: {} };
vm.runInNewContext(compile('lib/utils.ts'), { exports: utils.exports, require });
const { analyzeSpeech } = utils.exports;
test('pace and fillers come from transcript and actual duration', () => {
  const r = analyzeSpeech(30, 'um one two three four five six seven eight nine', [1, 2], true);
  assert.equal(r.pace, 20); assert.equal(r.fillerWords, 1); assert.equal(r.fillerRate, '2.00'); assert.equal(r.avgPause, '1.5'); assert.equal(r.measured, true);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), JSON.parse(JSON.stringify(analyzeSpeech(30, 'um one two three four five six seven eight nine', [1, 2], true))));
});
test('missing speech does not produce a measured score', () => {
  const r = analyzeSpeech(10); assert.equal(r.measured, false); assert.equal(r.confidenceScore, 0); assert.equal(r.avgPause, '');
});
function setup({ denial = false, recognition = false, delayed = false } = {}) {
  let stopped = 0, now = 0, resolvePermission;
  const track = { stop() { stopped++; } };
  const stream = { getTracks: () => [track] };
  class Recorder {
    static isTypeSupported(type) { return type === 'audio/mp4'; }
    constructor(stream, options) { this.state = 'inactive'; this.mimeType = options.mimeType; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['recorded-audio'], { type: this.mimeType }) }); this.onstop?.(); }
  }
  class Recognition {
    start() { this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: 'um this is a real test' }], { isFinal: true })] }); }
    stop() { this.onend?.(); } abort() {}
  }
  const exports = {};
  vm.runInNewContext(compile('lib/audio-recorder.ts'), {
    exports, require: path => path === './utils' ? utils.exports : require(path),
    navigator: { mediaDevices: { getUserMedia: () => delayed ? new Promise(resolve => { resolvePermission = () => resolve(stream); }) : denial ? Promise.reject(Object.assign(new Error('denied'), { name: 'NotAllowedError' })) : Promise.resolve(stream) } },
    MediaRecorder: Recorder, Blob, performance: { now: () => now },
    window: recognition ? { SpeechRecognition: Recognition } : {}, setInterval, clearInterval, setTimeout,
  });
  return { recorder: new exports.AudioRecorder(), advance: ms => now = ms, stopped: () => stopped, grant: () => resolvePermission() };
}
test('recording returns genuine encoded media and releases microphone', async () => {
  const { recorder, advance, stopped } = setup(); await recorder.startRecording(); advance(4100);
  const result = await recorder.stopRecording(); assert.equal(result.blob.type, 'audio/mp4'); assert.equal(await result.blob.text(), 'recorded-audio'); assert.equal(result.duration, 4.1); assert.equal(result.analysis, undefined); assert.equal(stopped(), 1);
});
test('recognized speech creates transcript metrics', async () => {
  const { recorder, advance } = setup({ recognition: true }); await recorder.startRecording(true); advance(6000);
  const result = await recorder.stopRecording(); assert.equal(result.transcript, 'um this is a real test'); assert.equal(result.analysis.pace, 60); assert.equal(result.analysis.fillerWords, 1);
});
test('permission denial is surfaced without starting a pretend recording', async () => {
  const { recorder } = setup({ denial: true }); await assert.rejects(recorder.startRecording(), { name: 'NotAllowedError' }); await assert.rejects(recorder.stopRecording(), /No recording/);
});
test('navigation away during permission request releases a late microphone grant', async () => {
  const { recorder, grant, stopped } = setup({ delayed: true }); const start = recorder.startRecording(); recorder.cancel(); grant(); await assert.rejects(start, /cancelled/); assert.equal(stopped(), 1);
});
function authFixture(fail = false) {
  const sessions = new Map(), profiles = new Map([['user', { id: 'user', xp: 0, level: 1 }]]), weeks = new Map();
  const tables = { sessions, profiles, weekly_xp: weeks };
  const client = { from(table) {
    const store = tables[table]; let filters = [], changed;
    const result = () => ({ data: changed || [...store.values()].filter(row => filters.every(([key, value]) => row[key] === value)), error: fail ? new Error('offline') : null });
    const q = {
      select() { return q; }, eq(key, value) { filters.push([key, value]); return q; },
      upsert(row) { changed = row; if (!fail) store.set(row.id || `${row.user_id}:${row.week_start_date}`, row); return q; },
      update(patch) { changed = patch; return q; },
      single() {
        if (table === 'profiles' && changed) { const key = filters.find(([key]) => key === 'id')[1]; changed = { ...store.get(key), ...changed }; store.set(key, changed); }
        const r = result(); return Promise.resolve({ ...r, data: Array.isArray(r.data) ? r.data[0] : r.data });
      },
      then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
    }; return q;
  } };
  const exports = {};
  vm.runInNewContext(compile('lib/auth-context.ts'), { exports, require: () => ({ createClient: () => client }), Date, Set, console });
  return { ...exports, sessions, profiles, weeks };
}
test('retrying the same session does not duplicate XP or history', async () => {
  const api = authFixture();
  const session = { id: 'one', created_at: new Date().toISOString(), type: 'word-sprint', xp_gained: 50, analysis: { _session: { wordsTyped: 3 } } };
  assert.equal((await api.addSessionRecord('user', session)).error, null);
  assert.equal((await api.addSessionRecord('user', session)).error, null);
  assert.equal(api.sessions.size, 1); assert.equal(api.profiles.get('user').xp, 50); assert.equal([...api.weeks.values()][0].xp, 50);
  await api.addSessionRecord('user', { ...session, id: 'two' }); assert.equal(api.profiles.get('user').xp, 100);
});
test('database failure is returned so UI can retain and retry local session', async () => {
  const api = authFixture(true); const r = await api.addSessionRecord('user', { id: 'one', created_at: new Date().toISOString(), type: 'word-sprint', xp_gained: 50 });
  assert.ok(r.error); assert.equal(api.sessions.size, 0);
});
test('weekly rankings use a Monday calendar boundary', () => {
  const api = authFixture(); assert.equal(api.getWeekStart(new Date(2026, 10, 29, 12)), '2026-11-23'); assert.equal(api.getWeekStart(new Date(2026, 10, 30, 12)), '2026-11-30');
});
