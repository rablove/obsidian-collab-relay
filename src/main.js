import { Plugin, MarkdownView, Notice, PluginSettingTab, Setting, Modal, requestUrl, Platform } from 'obsidian';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

/*
 * Vault Sync + Collab — 통합 플러그인
 *  ① 파일 동기화(CouchDB): 모든 .md 를 cvs: 문서와 양방향, 빈 vault 를 다 채운다.
 *  ② 실시간 협업(relay): 열어놓은 노트만 Yjs 로 글자단위 공동편집 + 원격 커서.
 *  조율: «열려있는 노트」는 collab(relay)이 소유, 나머지는 파일동기화가 처리 (겹침 방지).
 */

const DEFAULTS = {
  couchUrl: 'https://obsidian.enfycius.com',   // CouchDB (파일 동기화) — private repo 라 기본값
  wsUrl: 'wss://collab.smallws.com',           // relay (실시간 협업)
  dbName: 'main-db',
  docPrefix: 'cvs:',
  username: '',
  password: '',
  deviceLabel: '',   // 커서 꼬리표 (Mac/iPad)
  lockOffline: true,   // 기본 ON — 오프라인이면 편집 잠금(모바일=읽기모드 강제)
  enabled: true,
  lastSeq: '0',
  deviceId: '',
};
// 업데이트는 BRAT 으로만(자동설치 안 함). 단 최신 버전인지 «확인」해 안 맞으면 편집을 잠근다.
const UPDATE_REPO = 'rablove/obsidian-collab-relay';   // 버전 확인 대상(공개 repo)
const nfc = (s) => s.normalize('NFC');
// 3-way 병합: base(공통기준)·A(로컬)·B(서버). 겹치지 않는 편집은 합치고, 같은 지점 삽입은 결정적 순서로 둘 다 보존.
//  같은 줄을 서로 다르게 고친 «진짜 충돌」이거나 안전검증 실패면 null → 호출부가 기존(사본) 처리로 폴백.
function merge3(baseS, aS, bS) {
  const L = (s) => s.split('\n');
  const lcs = (x, y) => { const n = x.length, m = y.length; const c = Array.from({ length: n + 1 }, () => new Int32Array(m + 1)); for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) c[i][j] = x[i] === y[j] ? c[i + 1][j + 1] + 1 : Math.max(c[i + 1][j], c[i][j + 1]); const o = []; let i = 0, j = 0; while (i < n && j < m) { if (x[i] === y[j]) { o.push([i, j]); i++; j++; } else if (c[i + 1][j] >= c[i][j + 1]) i++; else j++; } return o; };
  const hunks = (O, X) => { const m = lcs(O, X).concat([[O.length, X.length]]); const h = []; let oi = 0, xi = 0; for (const [oc, xc] of m) { if (oi < oc || xi < xc) h.push([oi, oc, X.slice(xi, xc)]); oi = oc + 1; xi = xc + 1; } return h; };
  const O = L(baseS), A = L(aS), B = L(bS); const ha = hunks(O, A), hb = hunks(O, B); const res = []; let oi = 0, ia = 0, ib = 0;
  while (true) {
    const na = ia < ha.length ? ha[ia] : null, nb = ib < hb.length ? hb[ib] : null;
    const as = na ? na[0] : Infinity, bs = nb ? nb[0] : Infinity;
    if (as === Infinity && bs === Infinity) { for (let k = oi; k < O.length; k++) res.push(O[k]); break; }
    const nx = Math.min(as, bs); for (let k = oi; k < nx; k++) res.push(O[k]); oi = nx;
    const aH = na && na[0] === oi ? na : null, bH = nb && nb[0] === oi ? nb : null;
    if (aH && bH) {
      if (aH[1] === bH[1] && JSON.stringify(aH[2]) === JSON.stringify(bH[2])) { res.push(...aH[2]); oi = aH[1]; ia++; ib++; }
      else if (aH[0] === aH[1] && bH[0] === bH[1]) { const x = aH[2], y = bH[2]; if (x.join('\n') <= y.join('\n')) res.push(...x, ...y); else res.push(...y, ...x); ia++; ib++; }
      else return null;
    } else if (aH) { if (nb === null || nb[0] >= aH[1]) { res.push(...aH[2]); oi = aH[1]; ia++; } else return null; }
    else if (bH) { if (na === null || na[0] >= bH[1]) { res.push(...bH[2]); oi = bH[1]; ib++; } else return null; }
    else break;
  }
  const merged = res.join('\n'); const sO = new Set(O), sM = new Set(L(merged));
  for (const l of A) if (!sO.has(l) && !sM.has(l)) return null;
  for (const l of B) if (!sO.has(l) && !sM.has(l)) return null;
  const al = new Set([...O, ...A, ...B]); for (const l of L(merged)) if (!al.has(l)) return null;
  return merged;
}
const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
const b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#0891b2', '#65a30d'];
// 노션식 원격 커서: 색 막대 + 점 + 상시 이름 깃발 + 선택 하이라이트. (기본 라이브러리는 이름이 hover 때만 떠서 오버라이드)
const COLLAB_CSS = `
.cm-ySelectionCaret { border-left-width: 2px !important; border-right-width: 0 !important; margin-right: 0 !important; }
.cm-ySelectionCaretDot { width: .5em !important; height: .5em !important; top: -.28em !important; left: -.25em !important; box-shadow: 0 0 0 1.5px var(--background-primary) !important; }
.cm-ySelectionInfo {
  opacity: 1 !important; top: -1.5em !important; left: -2px !important;
  padding: 1px 6px !important; border-radius: 5px 5px 5px 1px !important;
  font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif) !important;
  font-size: 11px !important; font-style: normal !important; font-weight: 600 !important; line-height: 1.5 !important;
  letter-spacing: .2px !important; color: #fff !important; white-space: nowrap !important;
  box-shadow: 0 1px 4px rgba(0,0,0,.28) !important; transition: opacity .15s ease !important; pointer-events: none !important;
}
.cm-ySelection { border-radius: 2px; }
body.collab-syncgate-open .modal-close-button, body.collab-harnesslock-open .modal-close-button { display: none !important; }
`;

export default class VaultSyncCollab extends Plugin {
  async onload() {
    await this.loadSettings();
    if (!this.settings.deviceId) { this.settings.deviceId = 'dev-' + Math.random().toString(36).slice(2, 7); await this.saveSettings(); }
    if (!this.settings.deviceLabel) { this.settings.deviceLabel = 'dev-' + Math.random().toString(36).slice(2, 5); await this.saveSettings(); }
    this.userColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    this._collabStyle = document.head.createEl('style', { text: COLLAB_CSS });   // 노션식 커서 스타일 주입

    // 파일동기화 상태
    this.shadow = new Map(); this.applying = false; this.syncing = false; this._rtRunning = false; this.netOk = true;
    // 협업 상태
    this.compartment = new Compartment(); this.editLock = new Compartment();
    this.session = null; this._token = null; this._tokenExp = 0; this.collabPath = null; this.following = null;

    this.registerEditorExtension([this.compartment.of([]), this.editLock.of([])]);
    this.addSettingTab(new SettingTab(this.app, this));
    this.syncEl = this.addStatusBarItem(); this.setSync('시작…');
    this.collabEl = this.addStatusBarItem(); this.setCollab('연결 안됨');
    this.collabEl.style.cursor = 'pointer';
    this.collabEl.addEventListener('click', () => new ParticipantModal(this.app, this).open());
    // 모바일은 하단 상태바를 안 띄우므로 리본 아이콘으로도 접근 가능하게 한다.
    this.addRibbonIcon('users', '공동편집 참여자·연결 상태', () => new ParticipantModal(this.app, this).open());

    this.addCommand({ id: 'sync-now', name: '지금 동기화', callback: () => this.syncCycle(true) });
    this.addCommand({ id: 'resync-deletions', name: '삭제까지 다시 동기화(밀린 삭제 반영, 비파괴)', callback: async () => { new Notice('삭제 포함 전체 변경 다시 훑는 중…'); this.settings.lastSeq = '0'; await this.saveSettings(); await this.syncCycle(true); } });
    this.addCommand({ id: 'hard-reset', name: '처음부터 다시 받기(로컬 삭제 후 서버본으로)', callback: () => new ConfirmModal(this.app, '처음부터 다시 받기', '이 기기의 로컬 .md 노트를 전부 삭제하고 서버 최신본으로 덮어씁니다. 되돌릴 수 없습니다. 계속할까요?', () => this.hardReset()).open() });
    this.addCommand({ id: 'collab-status', name: '공동편집 참여자', callback: () => new ParticipantModal(this.app, this).open() });
    this.addCommand({ id: 'net-check', name: '연결 상태 확인(온라인/오프라인)', callback: async () => { const ok = await this.probeNet(); this.setNet(ok); new Notice(ok ? '🌐 서버 연결됨 (온라인)' : '🔒 서버 연결 안됨 (오프라인 — 편집잠금 대상)', 5000); } });
    this.addCommand({ id: 'conflict-log', name: '충돌 로그 보기', callback: async () => new ConflictLogModal(this.app, await this.readConflictLog()).open() });

    this.app.workspace.onLayoutReady(async () => {
      // 파일동기화 이벤트
      this.registerEvent(this.app.vault.on('modify', (f) => this.onLocal(f)));
      this.registerEvent(this.app.vault.on('create', (f) => this.onLocal(f)));
      this.registerEvent(this.app.vault.on('delete', (f) => this.onLocalDelete(f.path)));
      this.registerEvent(this.app.vault.on('rename', (f, oldPath) => this.onLocalRename(f, oldPath)));
      await this.gatedSync();   // 처음 들어올 때: 전체 동기화 끝날 때까지 편집 잠금
      this.checkVersion();      // 최신 버전인지 확인 → 안 맞으면 편집잠금 + 업데이트 모달
      this._rtRunning = true; this.longPollLoop();
      this.registerInterval(window.setInterval(() => this.syncCycle(), 60000));
      // 협업 이벤트
      this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.onActiveChange()));
      this.registerEvent(this.app.workspace.on('file-open', () => this.onActiveChange()));
      // 네트워크 끊김/복구를 즉시 감지 → 편집잠금 갱신 + 복구 시 바로 서버 변경분 당겨받기
      this.registerDomEvent(window, 'offline', () => this.setNet(false));
      this.registerDomEvent(window, 'online', () => this.setNet(true));
      // 이벤트를 놓쳐도(모바일 등) 3초마다 잠금 상태를 재확인하는 안전망
      this.registerInterval(window.setInterval(() => this.refreshLock(), 3000));
      // 모바일(navigator.onLine 안 믿김) 대비: 잠금 켜져 있으면 서버 핑으로 오프라인 감지
      this.registerInterval(window.setInterval(() => this.lockWatch(), 5000));
      this.onActiveChange(); this.ensurePresence();
    });
  }
  onunload() { this._rtRunning = false; try { this.applyViewLock(false); } catch (e) {} try { if (this._collabStyle) this._collabStyle.remove(); } catch (e) {} this.endSession(); this.stopPresence(); }

  setSync(s) { if (this.syncEl) this.syncEl.setText('⇄ ' + s); }
  setCollab(s) { if (this.collabEl) this.collabEl.setText('👥 ' + s); }
  configured() { return this.settings.enabled && this.settings.couchUrl && this.settings.dbName && this.settings.username; }
  isMd(f) { return f && f.extension === 'md'; }
  _ignored(p) { return /(^|\/)\./.test(String(p || '')); }   // .trash/·.obsidian/ 등 숨김폴더 경로는 동기화 제외 — 삭제본이 되살아나거나 cvs:.trash/… 엉뚱한 문서 생기는 것 방지
  // 두 내용 중 하나가 다른 하나를 «온전히 포함»(가운데 삽입만 차이)하면 그 상위집합을 알려준다. 진짜 분기면 null → 사본 유지.
  _relate(a, b) {
    if (a === b) return 'equal';
    let p = 0; const mn = Math.min(a.length, b.length);
    while (p < mn && a[p] === b[p]) p++;
    let s = 0; while (s < mn - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
    if (a.slice(p, a.length - s) === '') return 'b';   // a ⊂ b (b 가 상위집합)
    if (b.slice(p, b.length - s) === '') return 'a';   // b ⊂ a (a 가 상위집합)
    return null;
  }

  /* ============ 파일 동기화 (CouchDB) ============ */
  async req(method, path, body) {
    const base = (this.settings.couchUrl || '').replace(/\/$/, '');
    const headers = { 'Authorization': 'Basic ' + b64(`${this.settings.username}:${this.settings.password}`) };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return requestUrl({ url: `${base}/${path}`, method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, throw: false });
  }
  dbPath(p) { return `${encodeURIComponent(this.settings.dbName)}/${p}`; }
  docUrl(id) { return this.dbPath(encodeURIComponent(id)); }
  idFor(pNfc) { return (this.settings.docPrefix || '') + pNfc; }

  async testConnection() {
    if (!this.settings.couchUrl) return { ok: false, msg: 'CouchDB URL 을 입력하세요' };
    if (!this.settings.username) return { ok: false, msg: '사용자를 입력하세요' };
    try {
      const res = await this.req('GET', encodeURIComponent(this.settings.dbName));
      if (res.status === 200 && res.json) return { ok: true, msg: `연결 성공 · DB "${this.settings.dbName}" 도달` };
      if (res.status === 401) return { ok: false, msg: '인증 실패 — 아이디/비밀번호 확인' };
      if (res.status === 404) return { ok: false, msg: `DB "${this.settings.dbName}" 없음` };
      return { ok: false, msg: `서버 오류 (${res.status})` };
    } catch (e) { return { ok: false, msg: '접속 불가 — URL/네트워크 확인' }; }
  }

  async onLocal(file) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured() || !this.isMd(file) || this._ignored(file.path)) return;
    const p = nfc(file.path);
    if (p === this.collabPath) return;   // 협업 중인 노트는 relay 가 처리 (겹침 방지)
    let content; try { content = await this.app.vault.adapter.read(file.path); } catch (e) { return; }
    if (this.shadow.get(p) === content) return;
    await this.upsert(p, content, (file.stat && file.stat.mtime) || Date.now());
  }
  async onLocalDelete(rawPath) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured() || !rawPath.endsWith('.md') || this._ignored(rawPath)) return;
    const p = nfc(rawPath); if (p === this.collabPath) return;
    this.shadow.delete(p); await this.markDeleted(p);
  }
  async onLocalRename(file, oldPath) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured()) return;
    if (oldPath.endsWith('.md') && !this._ignored(oldPath)) await this.markDeleted(nfc(oldPath));
    if (this.isMd(file)) await this.onLocal(file);   // onLocal 이 .trash 경로는 알아서 무시
  }

  async putDoc(pNfc, content, mtime) {
    const id = this.idFor(pNfc);
    const cur = await this.req('GET', this.docUrl(id));
    const doc = { _id: id, path: pNfc, content, mtime, deleted: false, lastEditor: this.settings.username };
    if (cur.status === 200 && cur.json && cur.json._rev) doc._rev = cur.json._rev;
    const put = await this.req('PUT', this.docUrl(id), doc);
    if (put.status === 200 || put.status === 201) { this.shadow.set(pNfc, content); return true; }
    return false;
  }
  async upsert(pNfc, content, mtime) {
    try {
      const cur = await this.req('GET', this.docUrl(this.idFor(pNfc)));
      const server = (cur.status === 200 && cur.json) ? cur.json : null;
      const base = this.shadow.get(pNfc);
      if (server && !server.deleted && server.content !== undefined && server.content !== content && base !== undefined && server.content !== base) {
        const merged = merge3(base, content, server.content);   // 3-way 병합 — 겹치지 않으면 사본 없이 합침
        if (merged !== null) { await this.writeLocal(pNfc, merged); this.shadow.set(pNfc, merged); await this.putDoc(pNfc, merged, Math.max(mtime, server.mtime || 0)); return; }
        const rel = this._relate(content, server.content);   // 병합 불가 → 사소한 포함관계면 상위집합
        if (rel === 'b') { await this.writeLocal(pNfc, server.content); this.shadow.set(pNfc, server.content); return; }   // 서버가 상위집합 → 서버본
        if (rel !== 'a') {   // 'a'(local 상위집합)면 아래 putDoc 로 올림. 그 외 진짜 분기만 사본.
          await this.logConflict(pNfc, 'upsert', base, content, server.content, mtime, server.mtime || 0, server.lastEditor);
          if (mtime >= (server.mtime || 0)) { await this.saveConflictCopy(pNfc, server.content, server.mtime || Date.now(), 'server'); }
          else { await this.saveConflictCopy(pNfc, content, mtime, this.settings.deviceId || 'local'); await this.writeLocal(pNfc, server.content); this.shadow.set(pNfc, server.content); return; }
        }
      }
      await this.putDoc(pNfc, content, mtime);
    } catch (e) { console.error('[sync] upsert', e); }
  }
  async markDeleted(pNfc) {
    try {
      const id = this.idFor(pNfc);
      const cur = await this.req('GET', this.docUrl(id));
      if (cur.status !== 200 || !cur.json) return;
      const doc = cur.json; doc.deleted = true; doc.content = ''; doc.mtime = Date.now();
      await this.req('PUT', this.docUrl(id), doc);
    } catch (e) { console.error('[sync] markDeleted', e); }
  }

  changesUrl(feed) {
    const prefix = this.settings.docPrefix || '';
    let url = `${this.dbPath('_changes')}?include_docs=true&since=${encodeURIComponent(this.settings.lastSeq)}`;
    if (feed) url += '&feed=longpoll&timeout=25000';
    return { url, prefix };
  }
  selectorBody() {
    const prefix = this.settings.docPrefix || '';
    const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    return { selector: { _id: { '$gte': prefix, '$lt': hi } } };
  }
  async fetchChanges(feed) {
    const { url, prefix } = this.changesUrl(feed);
    if (prefix) return this.req('POST', url + '&filter=_selector', this.selectorBody());
    return this.req('GET', url);
  }
  async syncCycle(manual) {
    if (this.syncing || !this.configured()) return;
    this.syncing = true; this.setSync('동기화…');
    try {
      const res = await this.fetchChanges(false);
      if (res.status !== 200) { this.setSync('오류 ' + res.status); if (manual) new Notice('동기화 오류 ' + res.status); return; }
      let n = 0;
      for (const row of (res.json.results || [])) { const doc = row.doc; if (!doc || (doc._id && doc._id.startsWith('_'))) continue; if (await this.applyRemote(doc)) n++; }
      this.settings.lastSeq = res.json.last_seq; await this.saveSettings();
      this.setSync(n ? `받음 ${n}` : 'ok'); if (manual) new Notice(n ? `${n}개 반영` : '변경 없음');
    } catch (e) { this.setSync('오류'); console.error('[sync] cycle', e); if (manual) new Notice('동기화 실패'); }
    finally { this.syncing = false; }
  }
  // 연결 시 전체 당겨받기: 서버의 모든 cvs: 문서를 받아 로컬에 없거나 다른 것만 기록(비파괴).
  // lastSeq 상태·longpoll 진행 여부와 무관하게 "누르면 파일이 온다"를 보장한다.
  async pullAllFromServer(onProgress) {
    if (!this.configured()) return 0;
    while (this.syncing) await sleep(50);
    this.syncing = true; this.setSync('파일 받는 중…');
    try {
      const prefix = this.settings.docPrefix || '';
      const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
      // 1) id 목록만 먼저(가벼움) → 총 개수 = 진행률 분모
      const idsRes = await this.req('GET', `${this.dbPath('_all_docs')}?startkey=${encodeURIComponent(JSON.stringify(prefix))}&endkey=${encodeURIComponent(JSON.stringify(hi))}`);
      if (idsRes.status !== 200 || !idsRes.json || !Array.isArray(idsRes.json.rows)) { this.setSync('오류 ' + idsRes.status); return 0; }
      const ids = idsRes.json.rows.map((r) => r.id);
      const total = ids.length;
      if (onProgress) onProgress(0, total);
      // 2) 배치로 본문 받아 적용 — 배치마다 진행률 보고(다운로드+적용 모두 반영)
      let n = 0, done = 0; const B = 50;
      for (let i = 0; i < ids.length; i += B) {
        const batch = ids.slice(i, i + B);
        const res = await this.req('POST', this.dbPath('_all_docs?include_docs=true'), { keys: batch });
        if (res.status === 200 && res.json && Array.isArray(res.json.rows)) {
          for (const row of res.json.rows) { const d = row.doc; if (d && await this.applyRemote(d)) n++; done++; if (onProgress) onProgress(done, total); }
        } else { done += batch.length; if (onProgress) onProgress(done, total); }
      }
      try { const info = await this.req('GET', encodeURIComponent(this.settings.dbName)); if (info.status === 200 && info.json && info.json.update_seq !== undefined) { this.settings.lastSeq = info.json.update_seq; await this.saveSettings(); } } catch (e) {}
      this.setSync(n ? `받음 ${n}` : 'ok');
      return n;
    } catch (e) { this.setSync('오류'); console.error('[sync] pullAll', e); return 0; }
    finally { this.syncing = false; }
  }
  // 동기화 게이트: 처음/재접속 시 전체 동기화가 끝날 때까지 편집을 잠근다(모달+readonly).
  //  밀린 변경이 대량으로 들어오는 도중 사용자가 편집해 노트가 깨지는 걸 막는다.
  async gatedSync() {
    if (this._gating || !this.configured() || this.isOffline()) return;
    this._gating = true; this.refreshLock();
    let modal = null, last = { done: 0, total: 0 };
    const t = setTimeout(() => { try { modal = new SyncGateModal(this.app); modal.open(); modal.setProgress(last.done, last.total); } catch (e) {} }, 500);   // 오래 걸릴 때만 모달
    const onProg = (done, total) => { last = { done, total }; if (modal) modal.setProgress(done, total); };
    try { await this.pullAllFromServer(onProg); } catch (e) {}
    clearTimeout(t); if (modal) { modal.allowClose = true; try { modal.close(); } catch (e) {} }   // 완료 시에만 자동 닫힘
    this._gating = false; this.refreshLock();
  }
  async longPollLoop() {
    while (this._rtRunning) {
      if (!this.configured()) { await sleep(3000); continue; }
      let res;
      try { res = await this.fetchChanges(true); } catch (e) { this.setSync('재연결…'); this.setNet(false); await sleep(4000); continue; }
      if (!res || res.status !== 200) { this.setSync('오류 ' + (res && res.status)); this.setNet(false); await sleep(4000); continue; }
      this.setNet(true);   // 서버 응답 왔다 = 복구됨
      while (this.syncing) await sleep(50);
      this.syncing = true;
      try {
        let n = 0;
        for (const row of ((res.json && res.json.results) || [])) { const doc = row.doc; if (!doc || (doc._id && doc._id.startsWith('_'))) continue; if (await this.applyRemote(doc)) n++; }
        if (res.json && res.json.last_seq !== undefined) { this.settings.lastSeq = res.json.last_seq; await this.saveSettings(); }
        this.setSync(n ? `↓ ${n}` : '실시간 ✓');
      } catch (e) { console.error('[sync] longpoll', e); }
      finally { this.syncing = false; }
    }
  }
  async applyRemote(doc) {
    // 삭제 tombstone 은 path 가 없다 → _id 에서 접두어(cvs:)를 벗겨 실제 로컬 경로를 얻는다.
    const _pfx = this.settings.docPrefix || '';
    const p = doc.path || ((doc._id && doc._id.indexOf(_pfx) === 0) ? doc._id.slice(_pfx.length) : doc._id);
    if (!p.endsWith('.md') || this._ignored(p)) return false;
    if (nfc(p) === this.collabPath) return false;   // 협업 중인 노트 → relay(Yjs)가 소유, 건드리지 않음
    const R = doc.content || '';
    try {
      const exists = await this.app.vault.adapter.exists(p);
      if (doc.deleted || doc._deleted) {
        if (exists) { this.applying = true; try { const af = this.app.vault.getAbstractFileByPath(p); if (af) await this.app.vault.trash(af, false); else await this.app.vault.adapter.remove(p); } finally { this.applying = false; } await this.pruneEmptyParents(p); }
        this.shadow.delete(p); return exists;
      }
      if (!exists) { await this.writeLocal(p, R); this.shadow.set(p, R); return true; }
      const local = await this.app.vault.adapter.read(p);
      if (local === R) { this.shadow.set(p, R); return false; }
      const base = this.shadow.get(p);
      if (base === undefined) {
        // 첫 대면(기준선 없음) — 진짜 충돌 아님. 이미 파일이 있는 기기가 처음 연결한 상황.
        // 사본 만들지 말고 그냥 최신(mtime)으로 반영: 서버가 최신이면 서버로 덮고, 로컬이 최신이면 올린다.
        const st = await this.app.vault.adapter.stat(p); const lm = st ? st.mtime : 0;
        if ((doc.mtime || 0) >= lm) { await this.writeLocal(p, R); this.shadow.set(p, R); }
        else { await this.putDoc(p, local, lm); this.shadow.set(p, local); }
        return true;
      }
      if (local === base) { await this.writeLocal(p, R); this.shadow.set(p, R); return true; }  // 서버만 바뀜 → 서버로
      // 기준선 대비 양쪽 다 바뀜 → 진짜 동시편집 충돌 → 사본 보관
      const st = await this.app.vault.adapter.stat(p); const lm = st ? st.mtime : 0;
      const merged = merge3(base, local, R);   // 3-way 병합 — 겹치지 않으면 사본 없이 합침(양쪽 보존·수렴)
      if (merged !== null) {
        await this.writeLocal(p, merged); this.shadow.set(p, merged);
        if (merged !== R) await this.putDoc(p, merged, Math.max(lm, doc.mtime || 0));   // 서버도 병합본으로
        return true;
      }
      const rel = this._relate(local, R);   // 병합 불가(진짜 겹침) → 사소한 포함관계면 상위집합
      if (rel === 'equal' || rel === 'b') { await this.writeLocal(p, R); this.shadow.set(p, R); return true; }   // R 이 상위집합 → 서버본
      if (rel === 'a') { await this.putDoc(p, local, lm); this.shadow.set(p, local); return true; }               // local 이 상위집합 → 올림
      await this.logConflict(p, 'applyRemote', base, local, R, lm, doc.mtime || 0, doc.lastEditor);
      if ((doc.mtime || 0) >= lm) { await this.saveConflictCopy(p, local, lm, this.settings.deviceId || 'local'); await this.writeLocal(p, R); this.shadow.set(p, R); }
      else { await this.saveConflictCopy(p, R, doc.mtime || 0, 'server'); await this.putDoc(p, local, lm); }
      return true;
    } catch (e) { console.error('[sync] applyRemote', p, e); return false; }
  }
  async pruneEmptyParents(filePath) {
    // 파일 삭제 후 빈 상위 폴더를 위로 올라가며 정리(휴지통). 다른 파일(.obsidian·첨부 등)이 있으면 안 지움.
    let dir = filePath.split('/').slice(0, -1).join('/');
    while (dir) {
      try {
        const l = await this.app.vault.adapter.list(dir);
        if (((l.files || []).length + (l.folders || []).length) > 0) break;   // 안 비었으면 중단
        this.applying = true;
        try { const af = this.app.vault.getAbstractFileByPath(dir); if (af) await this.app.vault.trash(af, false); else await this.app.vault.adapter.rmdir(dir, false); }
        finally { this.applying = false; }
      } catch (e) { break; }
      dir = dir.split('/').slice(0, -1).join('/');
    }
  }
  async ensureParent(path) {
    const parts = path.split('/'); parts.pop(); let cur = '';
    for (const seg of parts) { cur = cur ? `${cur}/${seg}` : seg; if (!(await this.app.vault.adapter.exists(cur))) { try { await this.app.vault.adapter.mkdir(cur); } catch (e) {} } }
  }
  async writeLocal(p, content) { await this.ensureParent(p); this.applying = true; try { await this.app.vault.adapter.write(p, content); } finally { this.applying = false; } }
  tstamp() { const d = new Date(), z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}${z(d.getMinutes())}`; }
  _diffAt(a, b) { a = a || ''; b = b || ''; let i = 0; const m = Math.min(a.length, b.length); while (i < m && a[i] === b[i]) i++; return { i, local: a.slice(Math.max(0, i - 14), i + 14), server: b.slice(Math.max(0, i - 14), i + 14) }; }
  async logConflict(p, where, base, local, server, localMtime, serverMtime, serverLastEditor) {
    try {
      const d = this._diffAt(local, server);
      const rec = { t: new Date().toISOString(), where, path: p,
        baseLen: (base || '').length, localLen: (local || '').length, serverLen: (server || '').length,
        localChanged: (base || '') !== (local || ''), serverChanged: (base || '') !== (server || ''),
        localMtime, serverMtime, serverLastEditor: serverLastEditor || null,
        firstDiff: d.i, aroundLocal: d.local, aroundServer: d.server,
        collabOpen: nfc(p) === this.collabPath, deviceId: this.settings.deviceId, device: this.settings.deviceLabel, user: this.settings.username };
      console.warn('[collab] 충돌 로그', rec);
      const f = `${this.app.vault.configDir}/plugins/${this.manifest.id}/conflict-log.jsonl`;
      const line = JSON.stringify(rec) + '\n';
      try { await this.app.vault.adapter.append(f, line); }
      catch (e) { let prev = ''; try { if (await this.app.vault.adapter.exists(f)) prev = await this.app.vault.adapter.read(f); } catch (e2) {} await this.app.vault.adapter.write(f, prev + line); }
    } catch (e) { console.error('[collab] logConflict', e); }
  }
  async readConflictLog() {
    try { const f = `${this.app.vault.configDir}/plugins/${this.manifest.id}/conflict-log.jsonl`; if (await this.app.vault.adapter.exists(f)) return await this.app.vault.adapter.read(f); } catch (e) {}
    return '';
  }
  async saveConflictCopy(pNfc, content, mtime, tag) {
    const dot = pNfc.lastIndexOf('.'); const ext = dot > 0 ? pNfc.slice(dot) : '.md'; const bare = dot > 0 ? pNfc.slice(0, dot) : pNfc;
    const cp = `${bare} (충돌 ${tag} ${this.tstamp()})${ext}`;
    await this.writeLocal(cp, content); this.shadow.set(cp, content); await this.putDoc(cp, content, mtime);
    new Notice(`⚠️ 동시편집 충돌 — 사본 보관: ${cp.split('/').pop()}`);
  }
  async pushAll() {
    if (!this.configured()) { new Notice('먼저 설정을 채우세요'); return; }
    const files = this.app.vault.getMarkdownFiles(); new Notice(`업로드 시작 ${files.length}개…`); let ok = 0;
    for (const f of files) { try { const content = await this.app.vault.adapter.read(f.path); await this.upsert(nfc(f.path), content, f.stat.mtime); ok++; } catch (e) {} }
    new Notice(`업로드 완료 ${ok}/${files.length}`);
  }
  // 처음부터 다시 받기(하드 리셋): 로컬 .md 를 전부 지우고 서버본으로 통째 갈아엎는다.
  // 안전 순서 — ①서버 전체를 먼저 받아온다(실패하면 로컬은 손대지 않음) → ②로컬 .md 삭제 → ③서버본 기록.
  async hardReset() {
    if (!this.configured()) { new Notice('먼저 설정을 채우세요'); return; }
    new Notice('서버에서 전체 받는 중…');
    const prefix = this.settings.docPrefix || '';
    const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    const q = `${this.dbPath('_all_docs')}?include_docs=true&startkey=${encodeURIComponent(JSON.stringify(prefix))}&endkey=${encodeURIComponent(JSON.stringify(hi))}`;
    let res; try { res = await this.req('GET', q); } catch (e) { res = null; }
    if (!res || res.status !== 200 || !res.json || !Array.isArray(res.json.rows)) { new Notice('❌ 서버에서 받기 실패 — 로컬은 그대로 둡니다'); return; }
    const docs = res.json.rows.map(r => r.doc).filter(d => d && (d.path || d._id));
    this.applying = true;   // 삭제·기록 중 로컬 이벤트가 서버로 전파되지 않게 막는다
    let del = 0, wr = 0;
    try {
      for (const f of this.app.vault.getMarkdownFiles()) { try { await this.app.vault.adapter.remove(f.path); del++; } catch (e) {} }
      this.shadow.clear();
      for (const d of docs) {
        if (d.deleted || d._deleted) continue;
        const p = d.path || d._id.slice(prefix.length);
        if (!p.endsWith('.md')) continue;
        try { await this.ensureParent(p); await this.app.vault.adapter.write(p, d.content || ''); this.shadow.set(p, d.content || ''); wr++; } catch (e) {}
      }
    } finally { this.applying = false; this._suppressUntil = Date.now() + 12000; }   // 리셋 후 12초간 로컬→서버 전파 차단(뒤늦게 뜨는 delete 이벤트가 서버 대량삭제로 번지는 것 방지)
    try { const info = await this.req('GET', encodeURIComponent(this.settings.dbName)); if (info.status === 200 && info.json && info.json.update_seq !== undefined) { this.settings.lastSeq = info.json.update_seq; await this.saveSettings(); } } catch (e) {}
    new Notice(`♻️ 다시 받기 완료 — 로컬 ${del}개 삭제 · 서버본 ${wr}개 기록`);
  }

  /* ============ 실시간 협업 (relay) ============ */
  httpBase() { return (this.settings.wsUrl || '').replace(/^ws/, 'http').replace(/\/$/, ''); }
  async getToken() {
    if (this._token && this._tokenExp > Date.now() + 60000) return this._token;
    if (!this.settings.wsUrl || !this.settings.username || !this.settings.password) return null;
    try {
      const res = await requestUrl({ url: this.httpBase() + '/auth', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: this.settings.username, password: this.settings.password }), throw: false });
      if (res.status === 200 && res.json && res.json.ok && res.json.token) { this._token = res.json.token; this._tokenExp = Date.now() + 6 * 24 * 3600 * 1000; return this._token; }
      if (res.status === 401) new Notice('공동편집 로그인 실패 — 아이디/비밀번호 확인');
    } catch (e) { console.error('[collab] auth', e); }
    return null;
  }
  // 연결 인원 = presence(전체 접속자, 모달 목록과 같은 소스). 노트방 awareness 는 유령/재접속 중복이 껴서 부풀려짐.
  peerCount() { try { return [...this.presence.awareness.getStates().values()].filter(s => s && s.user && s.user.name).length; } catch (e) { return 0; } }
  peerNames() { try { return [...this.presence.awareness.getStates().values()].map(s => (s.user && s.user.name) || '?'); } catch (e) { return []; } }
  isOffline() {
    // navigator.onLine 이 확실히 false 면 즉시 오프라인. 그 외엔 실제 서버 핑 결과(netOk)로 판정한다.
    // (iOS Obsidian 웹뷰는 navigator.onLine/offline 이벤트가 안 뜨는 경우가 많아 핑에 의존.)
    const nav = (typeof navigator !== 'undefined' && 'onLine' in navigator) ? navigator.onLine : true;
    if (nav === false) return true;
    return this.netOk === false;
  }
  async probeNet() {
    // 서버(CouchDB)에 짧게 핑. 응답이 오면(200/401/403 등 <500) 네트워크는 살아있음 = 온라인.
    // 연결 실패/타임아웃만 오프라인으로 본다. requestUrl 은 자체 타임아웃이 없어 sleep 과 race.
    try {
      const p = this.req('GET', encodeURIComponent(this.settings.dbName));
      const r = await Promise.race([p, sleep(5000).then(() => ({ status: 0 }))]);
      return !!(r && r.status >= 200 && r.status < 500);
    } catch (e) { return false; }
  }
  async lockWatch() {
    // 오프라인 편집잠금이 켜졌을 때만 주기적으로 서버 도달성을 확인해 잠금 갱신.
    if (this._lockBusy || !this.settings.enabled) return;
    this._lockBusy = true;
    try { this.setNet(await this.probeNet()); } finally { this._lockBusy = false; }
  }
  // 온라인/오프라인 상태 전환을 한 곳에서 처리한다(cm 유무와 무관하게 알림·잠금 갱신).
  setNet(ok) {
    ok = !!ok;
    const changed = (this.netOk !== ok);
    this.netOk = ok;
    if (changed && this.settings.enabled) {
      new Notice(ok ? '🌐 온라인 — 편집 가능' : '🔒 오프라인 — 편집이 잠겼습니다', 4000);
    }
    this.refreshLock();
    if (changed && ok) { this.gatedSync(); this.checkVersion(); }   // 재접속 시 catch-up + 버전확인
  }
  _isNewer(a, b) {
    const pa = String(a).replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
    const pb = String(b).replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const x = pa[i] || 0, y = pb[i] || 0; if (x !== y) return x > y; }
    return false;
  }
  async checkVersion() {   // 온라인일 때 최신 릴리스와 설치버전 비교 — 낮으면 _outdated=true → 편집잠금 + 모달(설치는 BRAT)
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      const now = Date.now();
      if (this._verChk && now - this._verChk < 10 * 60 * 1000) return;   // 10분 쿨다운
      this._verChk = now;
      const rel = await requestUrl({ url: `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`, headers: { 'Accept': 'application/vnd.github+json' }, throw: false });
      if (rel.status !== 200 || !rel.json) return;
      const latest = String(rel.json.tag_name || '').replace(/^v/, '');
      const outdated = !!latest && this._isNewer(latest, this.manifest.version);
      this._latestVer = latest;
      if (outdated !== this._outdated) { this._outdated = outdated; this.refreshLock(); }
      if (outdated && !this._updShown) { this._updShown = true; try { new UpdateModal(this.app, this.manifest.version, latest).open(); } catch (e) {} }
      if (!outdated) this._updShown = false;
    } catch (e) {}
  }
  refreshLock() {
    const lock = this.settings.enabled && (this.isOffline() || this._gating || this._collabConnecting || this._outdated || this._dupName || this._harnessLock);   // 오프라인·초기동기화·협업연결중·구버전·기기이름중복·하네스정리중이면 편집 잠금
    // 모바일: CM readOnly 가 iOS 웹뷰에선 입력을 못 막는다. 그래서 노트를 «읽기 모드」로 강제 전환한다
    //  → 읽기 모드는 편집기가 아니라 렌더링 뷰라 어떤 플랫폼에서도 편집이 불가능하다. (cm 핸들 불필요)
    if (Platform.isMobile) this.applyViewLock(lock);
    // 데스크톱: 화면 안 바뀌게 CM readOnly 로 처리.
    const view = this.app.workspace.getActiveViewOfType(MarkdownView); const cm = view && view.editor && view.editor.cm;
    if (cm) {
      let cur; try { cur = !!cm.state.readOnly; } catch (e) { cur = undefined; }
      if (cur !== lock) { try { cm.dispatch({ effects: this.editLock.reconfigure(lock ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : []) }); } catch (e) {} }
    }
    if (lock) this.setCollab(this._dupName ? ('🔴 기기 이름 «' + this.settings.deviceLabel + '» 중복 — 이름 바꿔야 편집·동기화') : this._outdated ? ('🔺 업데이트 필요 → ' + (this._latestVer || '') + ' · 편집잠금') : this._harnessLock ? '🤖 하네스가 정리하는 중… 잠시 편집 잠금' : (this._collabConnecting && !this.isOffline() && !this._gating) ? '🔄 노트 동기화 중… 편집 잠금' : '🔒 오프라인·편집잠금');
    else if (this._lastLock) this.setCollab((this.session && this.session.provider && this.session.provider.wsconnected) ? '연결됨·' + this.peerCount() : '연결 안됨');
    this._lastLock = lock;
  }
  // 열린 마크다운 노트를 읽기 모드(preview)로 강제/복구. 원래 모드는 기억해뒀다가 온라인 되면 되돌린다.
  applyViewLock(lock) {
    try {
      if (!this._savedModes) this._savedModes = new Map();
      for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
        const vs = leaf.getViewState(); if (!vs || vs.type !== 'markdown') continue;
        const st = vs.state || {}; const mode = st.mode;
        if (lock) {
          if (mode !== 'preview') { this._savedModes.set(leaf, mode || 'source'); leaf.setViewState({ ...vs, state: { ...st, mode: 'preview' } }); }
        } else {
          const saved = this._savedModes.get(leaf);
          if (saved !== undefined && mode === 'preview') { leaf.setViewState({ ...vs, state: { ...st, mode: saved } }); this._savedModes.delete(leaf); }
        }
      }
    } catch (e) { console.error('[lock] applyViewLock', e); }
  }
  async ensurePresence() {
    if (this.presence || !this.settings.enabled || !this.settings.wsUrl) return;
    const token = await this.getToken(); if (!token) return;
    this._presenceDoc = new Y.Doc();
    this.presence = new WebsocketProvider(this.settings.wsUrl, '__presence__', this._presenceDoc, { params: { token, v: this.manifest.version } });   // v: relay 가 옛 플러그인 차단(강제 업데이트)
    this.presence.awareness.setLocalStateField('user', { name: `${this.settings.username}·${this.settings.deviceLabel}`, color: this.userColor, login: this.settings.username, device: this.settings.deviceLabel, deviceId: this.settings.deviceId });
    this.updatePresencePath();
    this.presence.awareness.on('change', () => this.onPresenceChange());
  }
  myLabel() { return `${this.settings.username}·${this.settings.deviceLabel}`; }
  updatePresencePath() {
    // 내가 지금 보고 있는 노트 경로를 presence 로 알린다(다른 사람이 나를 follow 할 수 있게).
    try {
      if (!this.presence) return;
      const v = this.app.workspace.getActiveViewOfType(MarkdownView);
      this.presence.awareness.setLocalStateField('path', (v && v.file) ? v.file.path : null);
    } catch (e) {}
  }
  peerPath(name) {
    // presence 에서 특정 참여자가 지금 보고 있는 노트 경로.
    try { for (const st of this.presence.awareness.getStates().values()) { if (st && st.user && st.user.name === name) return st.path || null; } } catch (e) {}
    return null;
  }
  async followUser(name) {
    this.following = name;
    new Notice(`👣 따라가는 중: ${name}`);
    await this.jumpToFollowed();
  }
  unfollow() { this.following = null; new Notice('🚶 따라가기 해제'); }
  async jumpToFollowed() {
    if (!this.following) return;
    const p = this.peerPath(this.following); if (!p) return;
    const cur = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (cur && cur.file && cur.file.path === p) return;   // 이미 같은 노트
    const f = this.app.vault.getAbstractFileByPath(p);
    if (f) { try { await this.app.workspace.getLeaf(false).openFile(f); } catch (e) {} }
  }
  onPresenceChange() {
    // 따라가는 사람이 노트를 바꾸면 나도 따라간다.
    if (this.following) this.jumpToFollowed();
    this.checkDupName();   // 기기 이름 충돌 감지 → 충돌이면 편집·동기화·협업 잠금
    // presence 가 바뀌면 «연결됨·N» 을 즉시 갱신 (목록과 실시간 일치)
    if (!this._lastLock && !this._dupName) this.setCollab((this.presence && this.presence.wsconnected) ? '연결됨·' + this.peerCount() : '연결 안됨');
  }
  checkDupName() {   // 같은 계정·같은 기기이름·다른 deviceId 가 접속해 있으면 «이름 중복» → deviceId 큰 쪽이 잠근다(결정적으로 한 대만)
    try {
      if (!this.presence) return;
      let dup = false;
      for (const st of this.presence.awareness.getStates().values()) {
        const u = st && st.user; if (!u || !u.deviceId) continue;
        if ((u.login || '') === this.settings.username && (u.device || '') === this.settings.deviceLabel
            && u.deviceId !== this.settings.deviceId && String(this.settings.deviceId || '') > String(u.deviceId)) dup = true;
      }
      if (dup !== this._dupName) {
        this._dupName = dup;
        if (dup) { try { this.endSession(); } catch (e) {} if (!this._dupShown) { this._dupShown = true; try { new DupNameModal(this.app, this.settings.deviceLabel).open(); } catch (e) {} } }
        else this._dupShown = false;
        this.refreshLock();
      }
    } catch (e) {}
  }
  followScroll(session) {
    // 같은 노트 안에서 따라가는 사람의 커서 위치로 화면을 스크롤한다.
    try {
      if (!this.following || !session || this.session !== session || !session.cm) return;
      let cur = null;
      for (const st of session.provider.awareness.getStates().values()) {
        if (st && st.user && st.user.name === this.following && st.cursor) { cur = st.cursor; break; }
      }
      if (!cur || !cur.head) return;
      const abs = Y.createAbsolutePositionFromRelativePosition(Y.createRelativePositionFromJSON(cur.head), session.ydoc);
      if (!abs) return;
      const pos = Math.max(0, Math.min(abs.index, session.cm.state.doc.length));
      session.cm.dispatch({ effects: EditorView.scrollIntoView(pos, { y: 'center' }) });
    } catch (e) {}
  }
  stopPresence() { try { if (this.presence) this.presence.destroy(); } catch (e) {} try { if (this._presenceDoc) this._presenceDoc.destroy(); } catch (e) {} this.presence = null; this._presenceDoc = null; }
  dupDeviceName() { if (!this.presence) return false; const my = `${this.settings.username}·${this.settings.deviceLabel}`; return [...this.presence.awareness.getStates().values()].map(s => s && s.user && s.user.name).filter(n => n === my).length > 1; }
  // 기기 이름 중복 확인: 내 계정(login)은 전부 제외하고, "다른 사용자"가 같은 기기 이름을 쓰는지만 본다.
  // 없으면 사용 가능 → 그 이름으로 재연결(적용).
  deviceOf(u) { if (!u) return ''; if (u.device !== undefined) return u.device; const i = (u.name || '').indexOf('·'); return i >= 0 ? u.name.slice(i + 1) : ''; }
  async checkAndApplyDevice() {
    if (!this.settings.username || !this.settings.wsUrl) return { ok: false, msg: '아이디·Relay 주소를 먼저 입력하세요' };
    if (!this.settings.deviceLabel) return { ok: false, msg: '기기 이름을 입력하세요' };
    await this.ensurePresence();                     // 없으면 연결(있으면 그대로)
    if (!this.presence) return { ok: false, msg: '연결 실패 — 계정/주소 확인' };
    await sleep(1000);                               // 다른 기기 상태 수신 대기
    const myDevice = this.settings.deviceLabel, myId = this.settings.deviceId;
    let who = '';
    for (const st of this.presence.awareness.getStates().values()) {
      const u = st && st.user; if (!u) continue;
      if ((u.deviceId || '') === myId) continue;      // 바로 이 기기(나 자신)만 제외 — 다른 기기는 같은 계정이라도 검사
      if (this.deviceOf(u) === myDevice) { who = u.name || u.login || '다른 기기'; break; }
    }
    if (who) return { ok: false, msg: `❌ 기기 이름 '${myDevice}' 는 다른 기기(${who})가 사용 중입니다 — 다른 이름을 쓰세요` };
    this.stopPresence(); await this.ensurePresence(); // 새 이름으로 재등록
    this.endSession(); await this.onActiveChange();   // 커서 라벨도 새 이름으로
    return { ok: true, msg: `✅ 기기 이름 '${myDevice}' 사용 가능 · 적용됨` };
  }
  // 계정(아이디/비번) 바꾼 뒤 재인증 + 재연결.
  async relogin() {
    if (!this.settings.username || !this.settings.password) return { ok: false, msg: '아이디·비밀번호를 입력하세요' };
    this._token = null; this._tokenExp = 0;         // 캐시 토큰 폐기
    const conn = await this.testConnection();        // 파일동기화(CouchDB) 인증
    const tok = await this.getToken();               // 협업(relay) 재로그인
    this.stopPresence(); await this.ensurePresence();
    this.endSession(); await this.onActiveChange();
    if (!conn.ok) return { ok: false, msg: '❌ 인증 실패 — 아이디/비밀번호 확인' };
    this.syncCycle(true);
    return { ok: !!tok, msg: tok ? `✅ '${this.settings.username}' 로 로그인·재연결됨` : '파일동기화 OK · 협업 실패(relay/계정 확인)' };
  }

  async onActiveChange() {
    if (!this.settings.enabled) return;
    if (this._dupName) { this.endSession(); this._startingPath = null; this.refreshLock(); return; }   // 이름 충돌 중엔 협업 세션 안 붙음(잠금 유지)
    this.updatePresencePath();
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = view && view.file; const path = file ? file.path : null;
    if (this.session && this.session.path === path) return;
    if (this._startingPath === path) return;             // 같은 노트 세션을 이미 시작하는 중 → 중복 provider 방지(active-leaf-change+file-open 이중발화 경합)
    this._startingPath = path;
    this.endSession();
    if (!view || !file || !this.settings.wsUrl) { this._startingPath = null; this.refreshLock(); return; }
    const cm = view.editor && view.editor.cm; if (!cm) { this._startingPath = null; return; }
    this.collabPath = nfc(path);                         // 즉시 보호: 파일동기화가 이 노트를 덮지 않게
    this._collabConnecting = true; this.refreshLock();   // 협업이 붙기 전까지 편집 잠금(내가 친 게 나중에 덮이는 것 방지)
    clearTimeout(this._connectTimer);
    this._connectTimer = setTimeout(() => { this._collabConnecting = false; this.refreshLock(); }, 6000);   // 협업이 못 붙어도 6초 후 편집 허용(collabPath 로 보호된 파일동기화 모드)
    try { await this.startSession(file, cm); } finally { this._startingPath = null; }
    this.refreshLock();
  }
  async startSession(file, cm) {
    const token = await this.getToken(); if (!token) { this.setCollab('로그인 필요'); this._collabConnecting = false; try { clearTimeout(this._connectTimer); } catch (e) {} this.refreshLock(); return; }
    const path = file.path; const ydoc = new Y.Doc();
    const room = 'note:' + b64url(path.normalize('NFC'));
    const provider = new WebsocketProvider(this.settings.wsUrl, room, ydoc, { params: { token, v: this.manifest.version } });   // v: relay 가 옛 플러그인 차단(강제 업데이트)
    const ytext = ydoc.getText('content');
    const meta = ydoc.getMap('meta');   // 하네스가 이 노트를 쓰는 동안 meta.lock 을 건다(플러그인은 lock 을 안 건다) → 관찰해서 편집잠금
    const label = `${this.settings.username}·${this.settings.deviceLabel}`;
    provider.awareness.setLocalStateField('user', { name: label, color: this.userColor, colorLight: this.userColor + '40', login: this.settings.username });
    const session = { path, ydoc, provider, ytext, cm, attached: false, saveTimer: null, onSync: null, persist: null };
    this.session = session; this.collabPath = nfc(path);   // ← 파일동기화가 이 노트를 안 건드리게
    provider.on('status', (e) => { if (this.session === session) { this.setCollab(e.status === 'connected' ? '연결됨' : '연결 중…'); this.refreshLock(); } });
    provider.awareness.on('change', () => { if (this.session === session) { this.setCollab('연결됨·' + this.peerCount()); this.followScroll(session); } });
    provider.on('connection-close', async () => { this._token = null; if (this.session === session) this.refreshLock(); });
    const onSync = async (isSynced) => {
      if (!isSynced || session.attached || this.session !== session) return;
      if (ytext.length === 0) { try { const content = await this.app.vault.read(file); if (this.session !== session) return; if (content && ytext.length === 0) ydoc.transact(() => ytext.insert(0, content)); } catch (e) {} }
      if (this.session !== session) return;
      session.attached = true;
      this._collabConnecting = false; try { clearTimeout(this._connectTimer); } catch (e) {}   // 붙었으니 편집 잠금 해제
      const persist = () => { clearTimeout(session.saveTimer); session.saveTimer = setTimeout(async () => { try { const f = this.app.vault.getAbstractFileByPath(path); if (f) { this.applying = true; try { await this.app.vault.modify(f, ytext.toString()); } finally { this.applying = false; } } } catch (e) {} }, 700); };
      session.persist = persist; ytext.observe(persist);
      try { cm.dispatch({ effects: this.compartment.reconfigure(yCollab(ytext, provider.awareness)) }); } catch (e) { console.error('[collab] attach', e); }
      this.setCollab('연결됨·' + this.peerCount()); this.refreshLock();
      setTimeout(() => this.followScroll(session), 400);   // 따라가는 중이면 그 사람 커서로 스크롤
    };
    session.onSync = onSync; provider.on('sync', onSync);
    const onMeta = () => {   // 하네스가 이 노트를 잠갔나 → 모달+편집잠금 (플러그인은 lock 을 안 걸므로 lock 존재 = 하네스가 씀)
      if (this.session !== session) return;
      const locked = !!meta.get('lock');
      if (locked === !!this._harnessLock) return;
      this._harnessLock = locked; this.refreshLock();
      if (locked) { if (!this._hlModal) { try { this._hlModal = new HarnessLockModal(this.app); this._hlModal.open(); } catch (e) {} } }
      else if (this._hlModal) { try { this._hlModal.allowClose = true; this._hlModal.close(); } catch (e) {} this._hlModal = null; }
    };
    session.meta = meta; session.onMeta = onMeta; meta.observe(onMeta); onMeta();
  }
  endSession() {
    const s = this.session; if (!s) return; this.session = null; this.collabPath = null;
    this._collabConnecting = false; try { clearTimeout(this._connectTimer); } catch (e) {}
    try { s.cm.dispatch({ effects: this.compartment.reconfigure([]) }); } catch (e) {}
    try { clearTimeout(s.saveTimer); } catch (e) {}
    try { if (s.persist) s.ytext.unobserve(s.persist); } catch (e) {}
    try { if (s.onSync) s.provider.off('sync', s.onSync); } catch (e) {}
    try { if (s.onMeta && s.meta) s.meta.unobserve(s.onMeta); } catch (e) {}
    if (this._harnessLock) this._harnessLock = false;   // 노트를 떠나면 하네스잠금 상태도 내린다(잠긴 건 그 노트일 뿐)
    if (this._hlModal) { try { this._hlModal.allowClose = true; this._hlModal.close(); } catch (e) {} this._hlModal = null; }
    try { s.provider.destroy(); } catch (e) {}
    try { s.ydoc.destroy(); } catch (e) {}
    this.setCollab('연결 안됨'); this.refreshLock();
  }

  async loadSettings() { this.settings = Object.assign({}, DEFAULTS, await this.loadData()); }
  async saveSettings() { await this.saveData(this.settings); }
}

class SettingTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this; containerEl.empty(); const s = this.plugin.settings;
    containerEl.createEl('h3', { text: 'Vault Sync + Collab' });
    new Setting(containerEl).setName('켬').addToggle(t => t.setValue(!!s.enabled).onChange(async v => { s.enabled = v; await this.plugin.saveSettings(); }));
    const text = (name, desc, key, pw) => new Setting(containerEl).setName(name).setDesc(desc || '').addText(t => { if (pw) t.inputEl.type = 'password'; t.setValue(String(s[key] ?? '')).onChange(async v => { s[key] = v.trim(); await this.plugin.saveSettings(); }); });
    containerEl.createEl('h4', { text: '① 파일 동기화 (CouchDB)' });
    text('CouchDB URL', '예: https://obsidian.enfycius.com', 'couchUrl');
    text('DB 이름', '', 'dbName');
    text('문서 접두어', '', 'docPrefix');
    containerEl.createEl('h4', { text: '② 실시간 협업 (relay)' });
    text('Relay 주소', '예: wss://collab.smallws.com', 'wsUrl');
    new Setting(containerEl).setName('오프라인 편집 잠금').setDesc('항상 켜짐 — 서버 연결이 끊기면 편집이 자동으로 잠깁니다(모바일=읽기 모드). 연결되면 자동 해제.');
    containerEl.createEl('h4', { text: '계정 (둘 다 공용)' });
    const loggedIn = !!(this.plugin.session || (this.plugin._token && this.plugin._tokenExp > Date.now()));
    this._cred = { username: s.username || '', password: s.password || '' };   // 필드는 초안 — 「로그인」 버튼을 눌러야 실제 반영·연결
    new Setting(containerEl).setName('아이디').setDesc('CouchDB 계정 — 입력 후 아래 「로그인」을 눌러야 로그인됩니다')
      .addText(t => t.setValue(this._cred.username).onChange(v => { this._cred.username = v.trim(); }));
    new Setting(containerEl).setName('비밀번호').addText(t => { t.inputEl.type = 'password'; t.setValue(this._cred.password).onChange(v => { this._cred.password = v.trim(); }); });
    new Setting(containerEl).setName('로그인').setDesc('아이디·비밀번호를 넣은 뒤 이 버튼을 눌러야 로그인됩니다.')
      .addButton(b => b.setButtonText('로그인').setCta().onClick(async () => {
        if (!this._cred.username || !this._cred.password) { new AlertModal(this.app, '로그인 정보 필요', '아이디와 비밀번호를 모두 입력한 뒤 「로그인」을 누르세요.').open(); return; }
        s.username = this._cred.username; s.password = this._cred.password; await this.plugin.saveSettings();
        set('로그인 중…'); new Notice('로그인 중…');
        try { const r = await this.plugin.relogin(); set(r.msg, r.ok); new Notice(r.msg); if (r.ok) this.display(); } catch (e) { set('오류: ' + (e && e.message), false); new Notice('로그인 오류: ' + (e && e.message)); }
      }));
    const devSet = new Setting(containerEl).setName('기기 이름').setDesc(loggedIn ? '커서 꼬리표 (Mac/iPad) — 바꾼 뒤 「중복확인」' : '🔒 로그인 후 변경할 수 있습니다');
    devSet.addText(t => { t.setValue(s.deviceLabel || ''); t.setDisabled(!loggedIn); if (loggedIn) t.onChange(async v => { s.deviceLabel = v.trim(); await this.plugin.saveSettings(); }); });
    devSet.addButton(b => { b.setButtonText('중복확인').setDisabled(!loggedIn).onClick(async () => { set('기기 이름 확인 중…'); new Notice('기기 이름 확인 중…'); try { const r = await this.plugin.checkAndApplyDevice(); set(r.msg, r.ok); new Notice(r.msg); } catch (e) { set('오류: ' + (e && e.message), false); new Notice('중복확인 오류: ' + (e && e.message)); } }); });

    new Setting(containerEl).setName('업데이트').setDesc('업데이트는 BRAT 으로 합니다 — BRAT → «Check for updates to all beta plugins».');

    const line = containerEl.createEl('div', { text: '상태: 미확인' }); line.style.margin = '8px 2px 12px'; line.style.fontWeight = '600'; line.style.color = 'var(--text-muted)';
    const set = (m, ok) => { line.setText(m); line.style.color = ok === true ? 'var(--text-success)' : ok === false ? 'var(--text-error)' : 'var(--text-muted)'; };
    new Setting(containerEl).setName('연결 확인 & 동기화').addButton(b => b.setButtonText('연결 확인').setCta().onClick(async () => {
      set('확인 중…');
      const r = await this.plugin.testConnection();
      if (!r.ok) return set('❌ 파일동기화: ' + r.msg, false);
      const tok = await this.plugin.getToken();
      set('파일 받는 중…');
      this.plugin.stopPresence(); this.plugin.ensurePresence();
      const n = await this.plugin.pullAllFromServer();
      set(`✅ 파일 ${n}개 반영 · 협업 ${tok ? 'OK' : '(relay 주소/계정 확인)'}`, !!tok);
    }));
    new Setting(containerEl).setName('처음부터 다시 받기')
      .setDesc('⚠️ 이 기기의 로컬 노트(.md)를 전부 지우고 서버 최신본으로 통째로 갈아엎습니다.')
      .addButton(b => b.setButtonText('리셋').setWarning().onClick(() => {
        new ConfirmModal(this.app,
          '처음부터 다시 받기',
          '이 기기의 로컬 .md 노트를 전부 삭제하고 서버 최신본으로 덮어씁니다. 되돌릴 수 없습니다. 계속할까요?',
          () => this.plugin.hardReset()
        ).open();
      }));
  }
}

class DupNameModal extends Modal {
  constructor(app, name) { super(app); this.name = name; }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: '🔴 기기 이름 중복' });
    contentEl.createEl('p', { text: `다른 기기가 이미 «${this.name}» 라는 이름을 쓰고 있습니다. 같은 이름이면 서로 덮어써 사고가 나므로, 이 기기의 편집·동기화를 잠갔습니다.` });
    const g = contentEl.createEl('p', { text: '설정 → (로그인 후) 기기 이름을 «다른 이름»으로 바꾸고 「중복확인」을 누르면 풀립니다. (예: Mac / iPad / LG그램)' }); g.style.color = 'var(--text-muted)';
    const row = contentEl.createDiv(); row.style.cssText = 'display:flex;justify-content:flex-end;margin-top:8px';
    const ok = row.createEl('button', { text: '설정 열기' }); ok.classList.add('mod-cta');
    ok.onclick = () => { this.close(); try { this.app.setting.open(); } catch (e) {} };
  }
  onClose() { this.contentEl.empty(); }
}
class UpdateModal extends Modal {
  constructor(app, cur, latest) { super(app); this.cur = cur; this.latest = latest; }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: '🔺 플러그인 업데이트 필요' });
    contentEl.createEl('p', { text: `설치됨 ${this.cur} → 최신 ${this.latest}. 버전이 다르면 동기화 사고가 날 수 있어 편집을 잠갔습니다.` });
    const g = contentEl.createEl('p', { text: 'BRAT → «Check for updates to all beta plugins» 로 업데이트한 뒤 Obsidian 을 재시작하세요.' }); g.style.color = 'var(--text-muted)';
    const row = contentEl.createDiv(); row.style.cssText = 'display:flex;justify-content:flex-end;margin-top:8px';
    const ok = row.createEl('button', { text: '확인' }); ok.classList.add('mod-cta'); ok.onclick = () => this.close();
  }
  onClose() { this.contentEl.empty(); }
}
class SyncGateModal extends Modal {
  constructor(app) { super(app); this.allowClose = false; this.done = 0; this.total = 0; }
  onOpen() {
    const { contentEl, containerEl } = this;
    document.body.classList.add('collab-syncgate-open');   // body 에 클래스 → DOM 구조와 무관하게 X(.modal-close-button)를 CSS 로 확실히 숨김
    try { containerEl.querySelectorAll('.modal-close-button').forEach((x) => x.remove()); } catch (e) {}   // JS 로도 best-effort 제거
    contentEl.createEl('h3', { text: '🔄 동기화 중' });
    contentEl.createEl('p', { text: '다른 기기의 변경사항을 받아오는 중입니다. 완료되면 자동으로 닫히고 편집할 수 있습니다.' });
    const wrap = contentEl.createDiv();
    wrap.style.cssText = 'height:10px;border-radius:5px;background:var(--background-modifier-border);overflow:hidden;margin:12px 0 6px;';
    this.bar = wrap.createDiv();
    this.bar.style.cssText = 'height:100%;width:0%;background:var(--interactive-accent);transition:width .2s ease;';
    this.pct = contentEl.createEl('p', { text: '준비 중…' });
    this.pct.style.cssText = 'color:var(--text-muted);text-align:right;margin:0;';
    this.render();
  }
  setProgress(done, total) { this.done = done; this.total = total; this.render(); }
  render() {
    if (!this.bar) return;
    const p = this.total > 0 ? Math.round(this.done / this.total * 100) : 0;
    this.bar.style.width = p + '%';
    if (this.pct) this.pct.setText(this.total > 0 ? `${p}% (${this.done}/${this.total})` : '준비 중…');
  }
  close() { if (this.allowClose) super.close(); }   // 완료 전엔 Esc·배경클릭·X 로 안 닫힘
  onClose() { try { document.body.classList.remove('collab-syncgate-open'); } catch (e) {} this.contentEl.empty(); }
}
class HarnessLockModal extends Modal {   // 하네스가 이 노트를 갱신하는 동안 뜬다(닫기 불가). 하네스가 끝내면 자동으로 닫힌다.
  constructor(app) { super(app); this.allowClose = false; }
  onOpen() {
    const { contentEl, containerEl } = this;
    document.body.classList.add('collab-harnesslock-open');
    try { containerEl.querySelectorAll('.modal-close-button').forEach((x) => x.remove()); } catch (e) {}
    contentEl.createEl('h3', { text: '🤖 하네스가 정리하는 중' });
    contentEl.createEl('p', { text: '이 노트를 하네스가 갱신하는 동안 잠시 편집이 잠깁니다. 곧 자동으로 열립니다. (다른 노트는 그대로 편집할 수 있습니다.)' });
  }
  close() { if (this.allowClose) super.close(); }   // 하네스가 잠금을 풀 때만 닫힘
  onClose() { try { document.body.classList.remove('collab-harnesslock-open'); } catch (e) {} this.contentEl.empty(); }
}
class AlertModal extends Modal {
  constructor(app, title, body) { super(app); this.t = title; this.b = body; }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: this.t });
    contentEl.createEl('p', { text: this.b });
    const row = contentEl.createDiv({ cls: 'modal-button-container' });
    row.style.display = 'flex'; row.style.justifyContent = 'flex-end';
    const ok = row.createEl('button', { text: '확인' }); ok.classList.add('mod-cta');
    ok.onclick = () => this.close();
  }
  onClose() { this.contentEl.empty(); }
}
class ConflictLogModal extends Modal {
  constructor(app, text) { super(app); this.text = text || ''; }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: '📛 충돌 로그' });
    const lines = this.text.split('\n').filter(Boolean);
    if (!lines.length) { contentEl.createEl('p', { text: '기록된 충돌이 없습니다. 🎉' }); return; }
    const info = contentEl.createEl('p', { text: `최근 ${Math.min(lines.length, 50)}건 표시 (총 ${lines.length}건 기록)` }); info.style.color = 'var(--text-muted)';
    const box = contentEl.createDiv(); box.style.cssText = 'max-height:60vh;overflow:auto;';
    for (const ln of lines.slice(-50).reverse()) {
      let r; try { r = JSON.parse(ln); } catch (e) { continue; }
      const d = box.createDiv(); d.style.cssText = 'border-top:1px solid var(--background-modifier-border);padding:8px 2px;';
      const h = d.createEl('div', { text: `${r.t}  ·  ${(r.path || '').split('/').pop()}` }); h.style.fontWeight = '600';
      const meta = `경로: ${r.path}\n지점: ${r.where} · collab열림: ${r.collabOpen} · 서버작성자: ${r.serverLastEditor || '(없음)'} · 기기: ${r.device}\n길이 base/local/server: ${r.baseLen}/${r.localLen}/${r.serverLen} · 로컬변경:${r.localChanged} 서버변경:${r.serverChanged}\n첫 불일치 #${r.firstDiff}\n  로컬: …${r.aroundLocal}…\n  서버: …${r.aroundServer}…`;
      const pre = d.createEl('pre', { text: meta }); pre.style.cssText = 'white-space:pre-wrap;margin:4px 0 0;font-size:12px;color:var(--text-muted);';
    }
  }
  onClose() { this.contentEl.empty(); }
}
class ConfirmModal extends Modal {
  constructor(app, title, body, onYes) { super(app); this.t = title; this.b = body; this.onYes = onYes; }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: this.t });
    contentEl.createEl('p', { text: this.b });
    const row = contentEl.createDiv({ cls: 'modal-button-container' });
    row.style.display = 'flex'; row.style.gap = '8px'; row.style.justifyContent = 'flex-end';
    const cancel = row.createEl('button', { text: '취소' });
    cancel.onclick = () => this.close();
    const yes = row.createEl('button', { text: '삭제하고 다시 받기' });
    yes.classList.add('mod-warning');
    yes.onclick = () => { this.close(); this.onYes(); };
  }
  onClose() { this.contentEl.empty(); }
}

class ParticipantModal extends Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; }
  onOpen() {
    const { contentEl } = this; contentEl.createEl('h3', { text: '👥 공동편집 참여자' });
    const pres = this.plugin.presence;
    // 맨 위에 연결 상태(모바일은 상태바가 없으니 여기서 확인)
    const statusEl = contentEl.createEl('div'); statusEl.style.margin = '4px 0 10px'; statusEl.style.fontSize = '0.9em';
    const renderStatus = () => {
      const relay = !!(pres && pres.wsconnected);
      const online = this.plugin.netOk !== false;
      statusEl.setText(`${relay ? '🟢 협업 연결됨' : '🔴 협업 끊김'}  ·  ${online ? '🌐 서버 온라인' : '🔒 오프라인(편집잠금)'}`);
    };
    renderStatus(); this._sh = window.setInterval(renderStatus, 2000);
    if (!pres) { contentEl.createEl('p', { text: '아직 연결되지 않았습니다. (설정에서 계정/주소 확인 후 «연결 확인»)' }); return; }
    const myLabel = this.plugin.myLabel();
    const ul = contentEl.createEl('ul'); ul.style.listStyle = 'none'; ul.style.paddingLeft = '0';
    const render = () => {
      ul.empty();
      const states = [...pres.awareness.getStates().values()].filter((st) => st && st.user && st.user.name);
      if (!states.length) { ul.createEl('li', { text: '(없음)' }); return; }
      for (const st of states) {
        const u = st.user; const name = u.name; const mine = (name === myLabel);
        const li = ul.createEl('li'); li.style.display = 'flex'; li.style.alignItems = 'center'; li.style.gap = '8px'; li.style.padding = '5px 0';
        const dot = li.createSpan({ text: '●' }); dot.style.color = u.color || 'var(--text-muted)';
        const info = li.createDiv(); info.style.flex = '1';
        info.createDiv({ text: name + (mine ? ' (나)' : '') });
        const where = st.path ? st.path.split('/').pop() : '(노트 없음)';
        const sub = info.createDiv({ text: '📄 ' + where }); sub.style.fontSize = '0.8em'; sub.style.color = 'var(--text-muted)';
        if (!mine) {
          const following = (this.plugin.following === name);
          const btn = li.createEl('button', { text: following ? '따라가기 해제' : '따라가기' });
          if (following) btn.classList.add('mod-cta');
          btn.onclick = async () => { if (this.plugin.following === name) this.plugin.unfollow(); else await this.plugin.followUser(name); render(); };
        }
      }
    };
    render(); this._h = () => render(); pres.awareness.on('change', this._h);
  }
  onClose() { try { if (this._h && this.plugin.presence) this.plugin.presence.awareness.off('change', this._h); } catch (e) {} try { if (this._sh) window.clearInterval(this._sh); } catch (e) {} this.contentEl.empty(); }
}
