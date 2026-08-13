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
  couchUrl: 'https://obsidian.enfycius.com',   // CouchDB (파일 동기화). ⚠️ 이 repo 는 공개다 — 비밀값을 기본값으로 넣지 마라
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
  lastRunVersion: '',   // 마지막으로 정상 기동한 플러그인 버전 — 이것과 다르면 서버본으로 재기준(resetOnUpgrade)
};
// 업데이트는 BRAT 으로만(자동설치 안 함). 단 최신 버전인지 «확인」해 안 맞으면 편집을 잠근다.
const UPDATE_REPO = 'rablove/obsidian-collab-relay';   // 버전 확인 대상(공개 repo)
// 충돌 진단 레코드를 모아 두는 서버상의 자리. 경로가 `.md` 로 끝나지 않아 applyRemote 가 걸러내므로
// 어느 기기에도 파일로 내려가지 않는다(진단 전용). 읽기·집계는 하네스 `conflicts.py events`.
const DIAG_DIR = '60_System/_sync-diag';
// 캔버스 카드의 «진짜 버튼»(```lpms-ask / ```lpms-run)이 눌리면 요청을 여기에 남긴다.
// _sync-diag 와 같은 방식 — 경로가 `.md` 로 안 끝나 applyRemote 가 걸러내므로 어느 기기에도
// 파일로 내려가지 않는다. ⭐ 캔버스 파일을 안 건드리는 게 핵심이다: 판을 고쳐서 알리면
// 「열어 둔 캔버스」 문제(아래 canvasOpenPaths 주석)를 그대로 지나게 된다.
const ASK_DIR = '60_System/_canvas-ask';
const ASK_MAX_PER_HOUR = 6;   // 실수로 눌러대도 세션이 수십 개 뜨지 않게 (canvas_watch.py 와 같은 상한)
// ⛔ 아래 «그림·캔버스» 관련은 main-db(이 플러그인) 전용이다 — ai-study-sync 에는 «일부러» 넣지 않았다
//    (형 지시 2026-08-13: 「ai-study-db는 해당 없으니 main-db에 한해서」). 그래서 두 소스의 차이가
//    18줄에서 크게 벌어져 있다. 다음에 두 파일을 맞출 때 여기를 통째로 옮기면 그림·캔버스가
//    스터디 공용 볼트(멤버 24명)로 딸려 간다. 옮기기 전에 형에게 확인부터 받아라.
// 그림 파일도 노트와 같은 cvs: 문서로 동기화한다. 본문(content)에 base64 로 넣지 않고
// CouchDB 첨부(_attachments.bin)로 두는 이유: _changes·_all_docs 는 첨부를 «stub»(digest·length)
// 로만 실어 준다. base64 를 content 에 넣으면 그 덩어리가 변경마다 모든 기기로 흐르고,
// 전체 확인은 50개씩 묶어 받으므로 한 응답이 수십 MB 가 된다.
const BIN_EXT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' };
const BIN_MAX = 2 * 1024 * 1024;   // 파일 하나 상한. 넘으면 «조용히» 넘기지 않고 콘솔+알림에 남긴다.
const nfc = (s) => s.normalize('NFC');
// CouchDB 첨부의 digest 는 md5 다. 로컬 바이트와 그걸 견주려면 md5 가 필요한데
// crypto.subtle 은 SHA 만 준다. 이 비교가 서야 «같으면 아무것도 안 한다»가 성립하고,
// 그래야 받아 쓴 그림을 곧바로 되올리는 되풀이가 안 생긴다(받아 쓰면 로컬 mtime 이 늘 «지금»이라
// 수정시각만 보면 언제나 로컬이 새 것으로 보인다).
function md5b64(u8) {
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22, 5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23, 6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = new Int32Array(64);
  for (let i = 0; i < 64; i++) K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) | 0;
  const len = u8.length, nb = (((len + 8) >> 6) + 1) << 6;
  const M = new Uint8Array(nb); M.set(u8); M[len] = 0x80;
  const bl = len * 8;   // 상한(BIN_MAX)이 있어 비트길이가 2^32 를 넘지 않는다
  M[nb-8] = bl & 0xff; M[nb-7] = (bl >>> 8) & 0xff; M[nb-6] = (bl >>> 16) & 0xff; M[nb-5] = (bl >>> 24) & 0xff;
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const w = new Int32Array(16);
  for (let off = 0; off < nb; off += 64) {
    for (let i = 0; i < 16; i++) { const j = off + i*4; w[i] = M[j] | (M[j+1]<<8) | (M[j+2]<<16) | (M[j+3]<<24); }
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5*i + 1) & 15; }
      else if (i < 48) { F = B ^ C ^ D; g = (3*i + 5) & 15; }
      else { F = C ^ (B | ~D); g = (7*i) & 15; }
      F = (F + A + K[i] + w[g]) | 0;
      A = D; D = C; C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
    }
    a0 = (a0+A)|0; b0 = (b0+B)|0; c0 = (c0+C)|0; d0 = (d0+D)|0;
  }
  const o = new Uint8Array(16);
  [a0,b0,c0,d0].forEach((v,i) => { o[i*4]=v&0xff; o[i*4+1]=(v>>>8)&0xff; o[i*4+2]=(v>>>16)&0xff; o[i*4+3]=(v>>>24)&0xff; });
  let s = ''; for (const b of o) s += String.fromCharCode(b);
  return btoa(s);
}
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
/* 캔버스 카드의 «진짜 버튼». 테마 변수를 쓰므로 라이트/다크 둘 다 따라간다. */
.lpms-ask { display: flex; flex-direction: column; gap: 6px; margin: 2px 0; }
.lpms-ask-text { white-space: pre-wrap; line-height: 1.45; }
.lpms-ask-btn {
  align-self: flex-start; cursor: pointer; padding: 5px 14px; border-radius: 6px;
  font-weight: 600; border: 1px solid var(--interactive-accent);
  background: var(--interactive-accent); color: var(--text-on-accent);
}
.lpms-ask-btn:hover:not(:disabled) { background: var(--interactive-accent-hover); }
.lpms-ask-btn:disabled { opacity: .5; cursor: default; }
.lpms-ask-run .lpms-ask-btn { background: var(--color-red, #d64545); border-color: var(--color-red, #d64545); }
.lpms-ask-note { font-size: 12px; color: var(--text-muted); }
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
    // 관리(읽기모드·추방) — relay 가 정본. hiddenPeers 는 이 기기에서만 쓰는 «커서 안 보이기»(남에겐 영향 없음).
    this._modAdmin = false; this._modReadonly = false; this._modAll = null;
    this._kickUntil = 0; this._kickScope = null; this._kickPath = null; this.hiddenPeers = new Set();

    this.registerEditorExtension([this.compartment.of([]), this.editLock.of([])]);
    // 캔버스 카드·노트의 ```lpms-ask / ```lpms-run 을 진짜 버튼으로 그린다.
    // 안 그려지면(그 렌더 경로에 처리기가 안 걸리면) 그냥 코드블록으로 보인다 — 체크상자 버튼은 그대로 있다.
    this.registerMarkdownCodeBlockProcessor('lpms-ask', (src, el, ctx) => this.renderAskBlock(src, el, ctx, 'ask'));
    this.registerMarkdownCodeBlockProcessor('lpms-run', (src, el, ctx) => this.renderAskBlock(src, el, ctx, 'run'));
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
    this.addCommand({ id: 'update-info', name: '업데이트 안내 다시 보기(편집이 잠겼을 때)', callback: () => { this._verChk = 0; this.checkVersion(); } });
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
      // 열려 있어 미뤄 둔 캔버스가 닫히는 것을 본다 (탭을 닫으면 layout-change 가 온다). 미룬 게 없으면 즉시 빠진다.
      this.registerEvent(this.app.workspace.on('layout-change', () => this.canvasReconcile()));
      // 네트워크 끊김/복구를 즉시 감지 → 편집잠금 갱신 + 복구 시 바로 서버 변경분 당겨받기
      this.registerDomEvent(window, 'offline', () => this.setNet(false));
      this.registerDomEvent(window, 'online', () => this.setNet(true));
      // 이벤트를 놓쳐도(모바일 등) 3초마다 잠금 상태를 재확인하는 안전망
      this.registerInterval(window.setInterval(() => this.refreshLock(), 3000));
      // 모바일(navigator.onLine 안 믿김) 대비: 잠금 켜져 있으면 서버 핑으로 오프라인 감지
      this.registerInterval(window.setInterval(() => this.lockWatch(), 5000));
      // 관리 상태(읽기모드·추방)는 relay 가 presence 방 meta 로 즉시 밀어 준다. 이 주기 확인은 그걸 놓쳤을 때의 안전망.
      this.registerInterval(window.setInterval(() => this.fetchMod(), 60000));
      // ⭐ 버전 확인을 주기로도 한다. 전에는 «켤 때»와 «재접속할 때»뿐이라, 옵시디언을 켜 둔 채로 며칠 쓰면
      //  새 릴리스가 나도 못 보고 옛 버전으로 계속 고쳤다 — 그 기기가 충돌의 원인이 된다.
      //  (checkVersion 자체에 10분 쿨다운이 있어 실제 GitHub 요청은 10분에 한 번이다.)
      this.registerInterval(window.setInterval(() => this.checkVersion(), 5 * 60 * 1000));
      this.onActiveChange(); this.ensurePresence(); this.fetchMod();
    });
  }
  onunload() { this._rtRunning = false; try { this.applyViewLock(false); } catch (e) {} try { if (this._discModal) { this._discModal._auto = true; this._discModal.close(); } } catch (e) {} try { if (this._collabStyle) this._collabStyle.remove(); } catch (e) {} this.endSession(); this.stopPresence(); }

  setSync(s) { if (this.syncEl) this.syncEl.setText('⇄ ' + s); }
  setCollab(s) { if (this.collabEl) this.collabEl.setText('👥 ' + s); }
  configured() { return this.settings.enabled && this.settings.couchUrl && this.settings.dbName && this.settings.username; }
  isMd(f) { return f && f.extension === 'md'; }
  // ⛔ 아래 «그림·캔버스» 관련은 main-db(이 플러그인) 전용이다 — ai-study-sync 에는 «일부러» 넣지 않았다
  //    (형 지시 2026-08-13: 「ai-study-db는 해당 없으니 main-db에 한해서」). 그래서 두 소스의 차이가
  //    18줄에서 크게 벌어져 있다. 다음에 두 파일을 맞출 때 여기를 통째로 옮기면 그림·캔버스가
  //    스터디 공용 볼트(멤버 24명)로 딸려 간다. 옮기기 전에 형에게 확인부터 받아라.
  binExt(p) { const d = String(p || '').lastIndexOf('.'); return d < 0 ? '' : String(p).slice(d + 1).toLowerCase(); }
  isBinPath(p) { return Object.prototype.hasOwnProperty.call(BIN_EXT, this.binExt(p)); }
  isCanvasPath(p) { return String(p || '').endsWith('.canvas'); }
  isTextPath(p) { return String(p || '').endsWith('.md') || this.isCanvasPath(p); }   // 본문(content)을 인라인으로 두는 것들
  isSyncPath(p) { return this.isTextPath(p) || this.isBinPath(p); }
  // ⭐ 줄 단위 3-way 병합은 .md 에만 쓴다. 캔버스는 JSON 이라 «겹치지 않는 줄»을 합쳐도 구조가 깨질 수 있다.
  canMerge(p) { return String(p || '').endsWith('.md'); }
  // ⭐ 열어 둔 캔버스는 서버본으로 «덮지 않는다».
  //  .md 는 열면 relay 가 주인이 되어(collabPath) 파일동기화가 손을 떼는데, 그 자리는
  //  getActiveViewOfType(MarkdownView) 로 정해져 **캔버스는 collabPath 가 될 수 없다**.
  //  캔버스뷰는 판 상태를 메모리에 들고 있다가 저장하므로, 카드를 끌고 있는 중에 밑에서
  //  파일이 갈리면 그 판본이 되돌아와 **방금 받은 것을 덮는다**(= 서버가 쓴 것을 잃는다).
  //  → 열려 있는 동안은 미뤄 두고, 닫히면 canvasReconcile 이 그때 받아 맞춘다.
  //  활성 탭만 보면(getActiveFile) 뒤 탭에 열어 둔 판을 놓친다 — 열린 캔버스 뷰를 다 센다.
  canvasOpenPaths() {
    const out = new Set();
    const ws = this.app && this.app.workspace;
    if (!ws || typeof ws.getLeavesOfType !== 'function') return out;   // 캔버스가 없는 환경(옛 옵시디언·시험)에선 지킬 것도 없다
    try {
      for (const leaf of (ws.getLeavesOfType('canvas') || [])) {
        const f = leaf && leaf.view && leaf.view.file;
        if (f && f.path) out.add(nfc(f.path));
      }
    } catch (e) { console.error('[sync] canvasOpenPaths', e); }
    return out;
  }
  canvasOpen(p) { return this.canvasOpenPaths().has(nfc(p)); }
  /* ── 캔버스 카드의 «진짜 버튼» ───────────────────────────────────────────
     카드(또는 노트)에 이렇게 적으면 버튼으로 그려진다:

         ```lpms-ask
         unit: 2.4          ← 없어도 된다(없으면 판 전체)
         세 도메인 단위가 다 m/s² 인가?
         ```
         ```lpms-run
         ```

     누르면 **서버에만** 요청 문서를 남긴다(ASK_DIR). 캔버스 파일은 안 건드린다 —
     판을 고쳐서 알리면 위 «열어 둔 캔버스» 문제를 그대로 지나기 때문이다.
     마크다운 체크상자 버튼은 그대로 둔다(이게 안 그려지는 곳에서도 눌리게). */
  renderAskBlock(src, el, ctx, kind) {
    const lines = String(src || '').split('\n');
    let unit = null;
    if (lines.length && /^\s*unit\s*:/i.test(lines[0])) { unit = lines.shift().replace(/^\s*unit\s*:/i, '').trim() || null; }
    const text = lines.join('\n').trim();
    const box = el.createDiv({ cls: 'lpms-ask' + (kind === 'run' ? ' lpms-ask-run' : '') });
    if (kind === 'ask' && text) box.createDiv({ cls: 'lpms-ask-text', text });
    const btn = box.createEl('button', { cls: 'lpms-ask-btn', text: kind === 'run' ? '▶ 돌리기' : '⟹ 보내기' });
    const note = box.createDiv({ cls: 'lpms-ask-note', text: unit ? `${unit} 에 대한 것` : (kind === 'run' ? '이 판 그대로 돌립니다' : '판 전체에 대한 물음') });
    btn.onclick = async () => {
      if (btn.disabled) return;
      btn.disabled = true; note.setText('올리는 중…');
      const af = this.app.workspace.getActiveFile();
      const board = (ctx && ctx.sourcePath) || (af ? af.path : '');
      const r = await this.sendCanvasAsk({ board, kind, text, unit });
      note.setText(r.msg);
      if (!r.ok) { btn.disabled = false; return; }
      // 다시 누를 수는 있게 하되 바로는 아니다 — 손이 두 번 가서 세션이 둘 뜨는 것을 막는다.
      window.setTimeout(() => { try { btn.disabled = false; btn.setText('다시 보내기'); } catch (e) {} }, 10000);
    };
  }
  async sendCanvasAsk({ board, kind, text, unit }) {
    if (!this.configured()) return { ok: false, msg: '⛔ 로그인부터 하십시오' };
    if (kind === 'ask' && !text) return { ok: false, msg: '⛔ 물음을 적고 누르십시오' };
    const now = Date.now();
    this._askSent = (this._askSent || []).filter((t) => now - t < 3600000);
    if (this._askSent.length >= ASK_MAX_PER_HOUR) return { ok: false, msg: `⛔ 한 시간 상한(${ASK_MAX_PER_HOUR}건)에 걸렸습니다` };
    const at = new Date(now).toISOString();
    const dev = this.settings.deviceId || 'unknown';
    const p = `${ASK_DIR}/${at.replace(/[:.]/g, '-')}_${dev}`;
    const rec = { board: board || null, kind, text: text || '', unit: unit || null, at, device: dev };
    try {
      const id = this.idFor(p);
      // content 에 JSON 문자열을 둔다 — 하네스가 vaultio.read(경로) 로 그대로 읽는다.
      // rec 는 문서를 직접 볼 때를 위한 것(파싱 없이 보인다).
      const res = await this.req('PUT', this.docUrl(id), { _id: id, path: p, kind: 'canvas-ask',
        mtime: now, deleted: false, clientVersion: this.manifest.version, content: JSON.stringify(rec), rec });
      if (res.status === 200 || res.status === 201) {
        this._askSent.push(now);
        new Notice(kind === 'run' ? '▶ 돌리기 요청을 올렸습니다' : '⟹ 물음을 올렸습니다');
        const d = new Date(now), z = (n) => String(n).padStart(2, '0');
        return { ok: true, msg: `✅ 올렸습니다 ${z(d.getHours())}:${z(d.getMinutes())}` };
      }
      console.error('[sync] canvasAsk', res.status, p);
      return { ok: false, msg: `⛔ 못 올렸습니다 (${res.status})` };
    } catch (e) { console.error('[sync] canvasAsk', e); return { ok: false, msg: '⛔ 못 올렸습니다 (연결)' }; }
  }
  // 미룬 것을 기억해 둔다(닫힐 때 받으려고). 처음 미룰 때만 알린다 — 왜 판이 안 바뀌는지 보이게.
  deferCanvas(p) {
    const k = nfc(p);
    if (!this._canvasDefer) this._canvasDefer = new Set();
    if (!this._canvasDefer.has(k)) {
      this._canvasDefer.add(k);
      new Notice(`🗂 «${k.split('/').pop()}» 이 열려 있어 서버본을 안 덮었습니다 — 닫으면 반영됩니다`, 8000);
    }
    return false;
  }
  // 미뤄 둔 캔버스가 닫혔으면 그 문서를 받아 applyRemote 로 정상 경로를 태운다.
  // (닫힌 뒤엔 여느 파일과 같다 — 기준선이 그대로면 서버본이 조용히 들어오고, 그 사이 형이 판을
  //  고쳤으면 여느 때처럼 최신 승 + 사본이다. 잃는 것은 없다.)
  async canvasReconcile() {
    if (!this._canvasDefer || !this._canvasDefer.size || !this.configured()) return;
    const open = this.canvasOpenPaths();
    for (const p of Array.from(this._canvasDefer)) {
      if (open.has(p)) continue;
      this._canvasDefer.delete(p);
      try {
        const cur = await this.req('GET', this.docUrl(this.idFor(p)));
        if (cur.status === 200 && cur.json) { if (await this.applyRemote(cur.json)) this.setSync('↓ 1'); }
      } catch (e) { console.error('[sync] canvasReconcile', p, e); }
    }
  }
  // 그림의 «마지막으로 맞춘 내용»을 해시로 기억한다(.md 의 shadow 와 같은 자리, 값만 해시).
  //  shadow 와 나눠 둔 이유: shadow 는 3-way 병합의 기준선이라 본문 전체가 필요한데, 그림은 견주기만 하면 된다.
  _binShadow() { if (!this.__binShadow) this.__binShadow = new Map(); return this.__binShadow; }
  attDigest(doc) { const a = doc && doc._attachments && doc._attachments.bin; return a && a.digest ? String(a.digest).replace(/^md5-/, '') : null; }
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

  // 다른 «가운데 토막»만 Y.Text 에 반영한다. 통짜로 갈아끼우면 남의 커서·편집이 다 밀리므로 최소 차이만 넣는다.
  //  (relay 의 applyMinDiff 와 같은 방식 — 앞뒤 공통 부분을 뺀 나머지만 지우고 넣는다.)
  _minDiff(ytext, next) {
    const cur = ytext.toString();
    if (cur === next) return false;
    let p = 0; const mn = Math.min(cur.length, next.length);
    while (p < mn && cur[p] === next[p]) p++;
    let s = 0; while (s < mn - p && cur[cur.length - 1 - s] === next[next.length - 1 - s]) s++;
    const del = cur.length - p - s; const ins = next.slice(p, next.length - s);
    const run = () => { if (del > 0) ytext.delete(p, del); if (ins) ytext.insert(p, ins); };
    if (ytext.doc && ytext.doc.transact) ytext.doc.transact(run); else run();
    return true;
  }
  // ⭐ 붙기 «전에» 에디터 문서와 Y.Text 를 맞춘다 (2026-08-13 사고).
  //  왜: y-codemirror 는 붙을 때 둘을 맞추지 않는다(YSyncPluginValue 생성자는 observe 만 건다). 그래서
  //  다른 채로 붙으면 두 쪽의 «글자 위치»가 어긋난 채로 굳고, 그 뒤 친 글자가 엉뚱한 자리에 들어간다.
  //  (실제 사고: 새로 친 줄이 `---` 의 첫 `-` 와 둘째 `-` 사이에 박히고 `##` 이 `#` 이 됐다.)
  //  어느 쪽으로 맞추나: 한쪽이 다른 쪽을 온전히 품으면 그 상위집합으로 — 아무것도 안 잃는다.
  //  진짜 갈렸으면 서버(Y.Text)를 따르되(RULES §0.4 서버가 정본) 에디터 것을 사본으로 남긴다.
  async _reconcileAttach(cm, ytext, pNfc) {
    let cur = null; try { cur = cm.state.doc.toString(); } catch (e) { return false; }
    const yt = ytext.toString();
    if (cur === yt) return false;
    const rel = this._relate(cur, yt);
    if (rel === 'a') this._minDiff(ytext, cur);   // 에디터가 상위집합 → Y.Text 를 올린다
    else {
      if (rel === null) { try { await this.saveConflictCopy(pNfc, cur, Date.now(), this.settings.deviceId || 'local'); } catch (e) {} }
      try { cm.dispatch({ changes: { from: 0, to: cm.state.doc.length, insert: yt } }); } catch (e) {}
    }
    try { await this.logConflict(pNfc, 'attach-mismatch', yt, cur, yt, Date.now(), 0, null, null); } catch (e) {}
    return true;
  }
  // ⭐ 협업 중인 노트의 «파일»이 에디터를 안 거치고 바뀌면 Y.Doc 은 그것을 모른다 (2026-08-13 사고).
  //  읽기 모드에서 체크박스를 누르면 옵시디언이 파일을 직접 고친다 — 편집기를 안 거치니 y-codemirror 도 모르고,
  //  파일동기화도 collabPath 라 건너뛴다. 그 편집은 노트를 닫을 때까지 아무 데도 못 가고, 닫는 순간 서버본과
  //  갈려 충돌본이 된다(실제 사고: 체크박스 두 개). → 그 차이를 Y.Doc 에 넣어 준다.
  async collabAbsorb(pNfc) {
    const s = this.session;
    if (!s || !s.attached || nfc(s.path) !== pNfc) return false;
    let content; try { content = await this.app.vault.adapter.read(s.path); } catch (e) { return false; }
    if (content === s.lastWritten) return false;          // 우리가 방금 쓴 것이 되돌아온 것
    const yt = s.ytext.toString();
    if (content === yt) return false;                     // 이미 같다
    let cur = null; try { cur = s.cm.state.doc.toString(); } catch (e) {}
    if (cur !== null) {
      if (cur === content) return false;   // 에디터가 이미 그 내용 → y-codemirror 몫이다. 여기서 또 넣으면 같은 변경이 두 번 들어간다
      if (cur !== yt) return false;        // 에디터와 Y.Text 가 이미 어긋났다 → 여기서 밀어넣으면 더 어긋난다(_reconcileAttach 가 이 경우를 없앤다)
    }
    return this._minDiff(s.ytext, content);
  }

  /* ============ 파일 동기화 (CouchDB) ============ */
  //  binMime 이 있으면 «그림(첨부)» — 본문을 JSON 으로 감싸지 않고 날바이트 그대로 주고받는다.
  //  인증 헤더를 여기 한 자리에서만 만들려고 갈래를 나눴다(같은 줄을 두 벌 두지 않는다).
  async req(method, path, body, binMime) {
    const base = (this.settings.couchUrl || '').replace(/\/$/, '');
    const headers = { 'Authorization': 'Basic ' + b64(`${this.settings.username}:${this.settings.password}`) };
    if (binMime) {
      if (body !== undefined) headers['Content-Type'] = binMime;
      return requestUrl({ url: `${base}/${path}`, method, headers, body, throw: false });
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return requestUrl({ url: `${base}/${path}`, method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, throw: false });
  }
  dbPath(p) { return `${encodeURIComponent(this.settings.dbName)}/${p}`; }
  docUrl(id) { return this.dbPath(encodeURIComponent(id)); }
  idFor(pNfc) { return (this.settings.docPrefix || '') + pNfc; }
  _ab(u8) { return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength); }
  // req 의 바이트판 — 첨부는 JSON 이 아니라 날바이트로 오간다.
  async reqBin(method, path, u8, mime) {
    return this.req(method, path, u8 ? this._ab(u8) : undefined, mime || 'application/octet-stream');
  }
  async getBin(path) {
    try {
      const r = await this.reqBin('GET', path, null, null);
      if (r.status !== 200 || !r.arrayBuffer) { console.warn('[sync] 첨부 받기 실패', path, r && r.status); return null; }
      return new Uint8Array(r.arrayBuffer);
    } catch (e) { console.error('[sync] getBin', path, e); return null; }
  }

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
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured() || !file || this._ignored(file.path)) return;
    const p = nfc(file.path);
    if (this.isBinPath(p)) { await this.onLocalBin(p, (file.stat && file.stat.mtime) || Date.now()); return; }   // 그림 — 합치지 않고 통째로
    if (!this.isMd(file) && !this.isCanvasPath(p)) return;
    if (p === this.collabPath) { await this.collabAbsorb(p); return; }   // 협업 중인 노트는 relay 가 처리 (겹침 방지) — 단 «에디터를 안 거친» 파일 변경은 Y.Doc 에 넣어준다
    let content; try { content = await this.app.vault.adapter.read(file.path); } catch (e) { return; }
    if (this.shadow.get(p) === content) return;
    await this.upsert(p, content, (file.stat && file.stat.mtime) || Date.now());
  }
  async onLocalDelete(rawPath) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured() || !this.isSyncPath(rawPath) || this._ignored(rawPath)) return;
    const p = nfc(rawPath); if (p === this.collabPath) return;
    this.shadow.delete(p); this._binShadow().delete(p); await this.markDeleted(p);
  }
  async onLocalRename(file, oldPath) {
    if (this.applying || this._dupName || Date.now() < (this._suppressUntil || 0) || !this.configured()) return;
    if (this.isSyncPath(oldPath) && !this._ignored(oldPath)) { this._binShadow().delete(nfc(oldPath)); await this.markDeleted(nfc(oldPath)); }
    if (file && this.isSyncPath(file.path)) await this.onLocal(file);   // onLocal 이 .trash 경로는 알아서 무시
  }

  async putDoc(pNfc, content, mtime) {
    if (this._outdated) return false;   // 구버전이면 pull-only — 어긋난 내용을 서버(정본)에 밀어넣지 않는다(서버 업로드 게이트의 클라이언트쪽 짝)
    const id = this.idFor(pNfc);
    const cur = await this.req('GET', this.docUrl(id));
    const doc = { _id: id, path: pNfc, content, mtime, deleted: false, lastEditor: this.settings.username, clientVersion: this.manifest.version };
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
      if (server && !server.deleted && server.content !== undefined && server.content !== content && base === undefined) {
        // 기준선이 없다 — 재시작 직후이거나, 뒤에서 도는 전체 확인(backgroundPull)이 아직 이 노트에 안 닿았다.
        // 기준선 없이는 3-way 병합을 못 한다. 그런데 그냥 올리면 서버본이 사본도 없이 사라진다.
        // 그래서 겹치지 않는 포함관계면 그걸로 정하고, 진짜 갈렸으면 서버본을 사본으로 남긴 뒤 올린다.
        const rel = this._relate(content, server.content);
        if (rel === 'b') { await this.writeLocal(pNfc, server.content); this.shadow.set(pNfc, server.content); return; }   // 서버가 상위집합 → 서버본
        if (rel !== 'a') {   // 'a'(local 상위집합)면 아래 putDoc 로 올림. 그 외 진짜 분기만 사본.
          await this.logConflict(pNfc, 'upsert-nobase', base, content, server.content, mtime, server.mtime || 0, server.lastEditor, server.clientVersion);
          await this.saveConflictCopy(pNfc, server.content, server.mtime || Date.now(), 'server');
        }
      } else if (server && !server.deleted && server.content !== undefined && server.content !== content && base !== undefined && server.content !== base) {
        const merged = this.canMerge(pNfc) ? merge3(base, content, server.content) : null;   // 3-way 병합 — 겹치지 않으면 사본 없이 합침 (.md 만: 캔버스는 JSON 이라 못 합친다)
        if (merged !== null) { await this.writeLocal(pNfc, merged); this.shadow.set(pNfc, merged); await this.putDoc(pNfc, merged, Math.max(mtime, server.mtime || 0)); return; }
        const rel = this._relate(content, server.content);   // 병합 불가 → 사소한 포함관계면 상위집합
        if (rel === 'b') { await this.writeLocal(pNfc, server.content); this.shadow.set(pNfc, server.content); return; }   // 서버가 상위집합 → 서버본
        if (rel !== 'a') {   // 'a'(local 상위집합)면 아래 putDoc 로 올림. 그 외 진짜 분기만 사본.
          await this.logConflict(pNfc, 'upsert', base, content, server.content, mtime, server.mtime || 0, server.lastEditor, server.clientVersion);
          if (mtime >= (server.mtime || 0)) { await this.saveConflictCopy(pNfc, server.content, server.mtime || Date.now(), 'server'); }
          else { await this.saveConflictCopy(pNfc, content, mtime, this.settings.deviceId || 'local'); await this.writeLocal(pNfc, server.content); this.shadow.set(pNfc, server.content); return; }
        }
      }
      await this.putDoc(pNfc, content, mtime);
    } catch (e) { console.error('[sync] upsert', e); }
  }
  async markDeleted(pNfc) {
    try {
      if (this._outdated) return;   // 구버전이면 pull-only — 삭제 전파도 서버에 밀어넣지 않는다
      const id = this.idFor(pNfc);
      const cur = await this.req('GET', this.docUrl(id));
      if (cur.status !== 200 || !cur.json) return;
      const doc = cur.json; doc.deleted = true; doc.content = ''; doc.mtime = Date.now(); doc.clientVersion = this.manifest.version;
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
  // 동기화 게이트: 처음/재접속 시 «지금 연 노트 하나»만 맞출 때까지 편집을 잠근다(모달+readonly).
  //  나머지 노트는 같은 방식(pullAllFromServer)으로 뒤에서 돈다 — 편집을 막지 않는다.
  //  왜 열린 노트만 먼저인가: 지금 고칠 수 있는 노트가 그것뿐이고(딴 노트는 열어야 고친다),
  //  그 노트의 기준선(shadow)이 서면 upsert 의 3-way 병합이 선다. 나머지를 기다려 편집을 막을 이유가 없다.
  async gatedSync() {
    if (this._gating || !this.configured() || this.isOffline()) return;
    await this.resetOnUpgrade();   // 업데이트 직후면 먼저 서버본으로 재기준(로컬 버림) — 로컬을 지우므로 이건 끝까지 기다린다
    this._gating = true; this.refreshLock();
    let modal = null;
    const t = setTimeout(() => { try { modal = new SyncGateModal(this.app); modal.open(); modal.setProgress(0, 1); } catch (e) {} }, 500);   // 오래 걸릴 때만 모달(보통 GET 한 번이라 안 뜬다)
    try { await this.syncActiveNote(); } catch (e) {}
    clearTimeout(t); if (modal) { modal.allowClose = true; try { modal.close(); } catch (e) {} }   // 완료 시에만 자동 닫힘
    this._gating = false; this.refreshLock();
    this.backgroundPull();   // 나머지 노트 전체 — await 하지 않는다(편집이 이미 풀렸다)
  }
  // 지금 연 노트 하나만 서버와 맞춘다. Yjs 세션이 붙기 전에 해야 한다 — 붙은 뒤엔 relay 가 그 노트의 주인이다.
  //  (onload 는 gatedSync → onActiveChange 순서라 처음 기동 때는 아직 안 붙어 있다. 재접속 때는 붙어 있어 건너뛴다.)
  async syncActiveNote() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = view && view.file;
    if (!file || !this.isMd(file) || this._ignored(file.path)) return;
    const p = nfc(file.path);
    if (p === this.collabPath) return;   // 이미 협업 세션이 붙었다(재접속) → relay 가 맞춘다
    this.setSync('연 노트 확인…');
    const cur = await this.req('GET', this.docUrl(this.idFor(p)));
    if (cur.status === 200 && cur.json) await this.applyRemote(cur.json);
  }
  // 나머지 노트 전체 — 지금까지와 같은 방식(pullAllFromServer), 다만 편집을 막지 않고 뒤에서 돈다.
  async backgroundPull() {
    if (this._bgPull) return;                                 // 이미 도는 중이면 겹쳐 받지 않는다
    if (Date.now() - (this._bgPullAt || 0) < 60000) return;    // 방금 끝났으면 건너뛴다(모바일에서 끊겼다 붙었다 할 때 전체를 거듭 받는 것 방지)
    this._bgPull = true;
    let shown = -1;
    try { await this.pullAllFromServer((done, total) => { if (done - shown >= 25 || done >= total) { shown = done; this.setSync(`전체 확인 ${done}/${total}`); } }); }
    catch (e) { console.error('[sync] backgroundPull', e); }
    finally { this._bgPull = false; this._bgPullAt = Date.now(); }
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
    if (this._ignored(p)) return false;
    if (this.isBinPath(p)) return this.applyRemoteBin(doc, p);   // 그림 — 첨부(bin)를 따로 받아 통째로
    if (!this.isTextPath(p)) return false;
    if (nfc(p) === this.collabPath) return false;   // 협업 중인 노트 → relay(Yjs)가 소유, 건드리지 않음
    if (this.isCanvasPath(p) && this.canvasOpen(p)) return this.deferCanvas(p);   // 열어 둔 캔버스는 덮지 않는다 — 닫히면 canvasReconcile 이 받는다
    const R = doc.content || '';
    try {
      const exists = await this.app.vault.adapter.exists(p);
      if (nfc(p) === this.collabPath) return false;   // 확인하는 사이에 이 노트가 열렸다 → relay 가 주인, 손대지 않는다
      if (this.isCanvasPath(p) && this.canvasOpen(p)) return this.deferCanvas(p);   // 확인하는 사이에 이 캔버스가 열렸다
      if (doc.deleted || doc._deleted) {
        if (exists) { this.applying = true; try { const af = this.app.vault.getAbstractFileByPath(p); if (af) await this.app.vault.trash(af, false); else await this.app.vault.adapter.remove(p); } finally { this.applying = false; } await this.pruneEmptyParents(p); }
        this.shadow.delete(p); return exists;
      }
      if (!exists) { await this.writeLocal(p, R); this.shadow.set(p, R); return true; }
      const local = await this.app.vault.adapter.read(p);
      if (nfc(p) === this.collabPath) return false;   // 읽는 사이에 이 노트가 열렸다 → relay 가 주인(뒤에서 도는 전체 확인이 열린 노트를 덮는 것 방지)
      if (this.isCanvasPath(p) && this.canvasOpen(p)) return this.deferCanvas(p);   // 읽는 사이에 이 캔버스가 열렸다
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
      const merged = this.canMerge(p) ? merge3(base, local, R) : null;   // 3-way 병합 — 겹치지 않으면 사본 없이 합침(양쪽 보존·수렴). 캔버스는 JSON 이라 안 합친다 → 아래 최신 승 + 사본
      if (merged !== null) {
        await this.writeLocal(p, merged); this.shadow.set(p, merged);
        if (merged !== R) await this.putDoc(p, merged, Math.max(lm, doc.mtime || 0));   // 서버도 병합본으로
        return true;
      }
      const rel = this._relate(local, R);   // 병합 불가(진짜 겹침) → 사소한 포함관계면 상위집합
      if (rel === 'equal' || rel === 'b') { await this.writeLocal(p, R); this.shadow.set(p, R); return true; }   // R 이 상위집합 → 서버본
      if (rel === 'a') { await this.putDoc(p, local, lm); this.shadow.set(p, local); return true; }               // local 이 상위집합 → 올림
      await this.logConflict(p, 'applyRemote', base, local, R, lm, doc.mtime || 0, doc.lastEditor, doc.clientVersion);
      if ((doc.mtime || 0) >= lm) { await this.saveConflictCopy(p, local, lm, this.settings.deviceId || 'local'); await this.writeLocal(p, R); this.shadow.set(p, R); }
      else { await this.saveConflictCopy(p, R, doc.mtime || 0, 'server'); await this.putDoc(p, local, lm); }
      return true;
    } catch (e) { console.error('[sync] applyRemote', p, e); return false; }
  }
  /* ⛔ main-db 전용 — ai-study-sync 에는 일부러 안 넣었다(형 지시 2026-08-13). 위 머리말 참고.
     ── 그림(첨부) 동기화 ────────────────────────────────────────────────
     .md 와 다른 점 셋:
      ① 합칠 수 없다 → 3-way 병합·부분집합 판정을 안 쓴다. «같으면 그대로, 다르면 최신(mtime) 승».
      ② 견주기는 «해시»로 한다(수정시각 아님). 받아 쓴 파일은 로컬 mtime 이 «지금»이 되므로
         수정시각만 보면 늘 로컬이 새 것 → 받은 그림을 되올리고 그걸 받은 기기가 또 되올린다.
      ③ 마지막으로 맞춘 해시(_binShadow) 대비 양쪽 다 바뀌었을 때만 사본을 남긴다 — 첫 대면엔 안 남긴다
         (.md 의 «첫 대면은 충돌 아님» 규칙과 같다). */
  // 서버 첨부를 받아 로컬에 쓴다. 상한 초과·해시 불일치면 조용히 넘기지 않고 콘솔에 남긴다.
  async pullBinTo(p, doc) {
    const a = (doc._attachments || {}).bin;
    if (!a) return false;
    if ((a.length || 0) > BIN_MAX) { console.warn(`[sync] 서버 그림이 상한 초과 — 안 받음: ${p} (${a.length} > ${BIN_MAX} 바이트)`); return false; }
    const dig = this.attDigest(doc);
    const got = await this.getBin(this.docUrl(this.idFor(nfc(p))) + '/bin');
    if (!got) { console.warn('[sync] 그림 받기 실패 — 안 씀:', p); return false; }
    if (dig && md5b64(got) !== dig) { console.warn('[sync] 받은 그림 해시 불일치 — 안 씀:', p); return false; }
    await this.writeLocalBin(p, got);
    this._binShadow().set(nfc(p), dig || md5b64(got));
    return true;
  }
  async putBin(pNfc, u8, mtime) {
    if (this._outdated) return false;   // 구버전이면 pull-only (.md 와 같다)
    if (u8.length > BIN_MAX) {
      console.warn(`[sync] 그림이 상한 초과 — 안 올림: ${pNfc} (${u8.length} > ${BIN_MAX} 바이트)`);
      new Notice(`⚠️ 그림이 커서 동기화 안 함 (${(u8.length / 1048576).toFixed(1)}MB > 2MB): ${pNfc.split('/').pop()}`, 8000);
      return false;
    }
    const id = this.idFor(pNfc);
    const mime = BIN_EXT[this.binExt(pNfc)] || 'application/octet-stream';
    const cur = await this.req('GET', this.docUrl(id));
    const doc = { _id: id, path: pNfc, binary: true, size: u8.length, mime, mtime, deleted: false, lastEditor: this.settings.username, clientVersion: this.manifest.version };
    if (cur.status === 200 && cur.json && cur.json._rev) doc._rev = cur.json._rev;
    const put = await this.req('PUT', this.docUrl(id), doc);
    if (put.status !== 200 && put.status !== 201) { console.warn('[sync] 그림 문서 올리기 실패', pNfc, put.status); return false; }
    const rev = put.json && (put.json.rev || put.json._rev);
    const att = await this.reqBin('PUT', `${this.docUrl(id)}/bin?rev=${encodeURIComponent(rev)}`, u8, mime);
    if (att.status !== 200 && att.status !== 201) { console.error('[sync] 그림 첨부 올리기 실패', pNfc, att.status); return false; }
    this._binShadow().set(pNfc, md5b64(u8));
    return true;
  }
  async onLocalBin(pNfc, mtime) {
    try {
      let u8; try { u8 = await this.readBin(pNfc); } catch (e) { return; }
      const dig = md5b64(u8);
      if (this._binShadow().get(pNfc) === dig) return;   // 방금 받아 쓴 것의 메아리
      const cur = await this.req('GET', this.docUrl(this.idFor(pNfc)));
      const server = (cur.status === 200 && cur.json) ? cur.json : null;
      if (server && !server.deleted) {
        const sDig = this.attDigest(server);
        if (sDig === dig) { this._binShadow().set(pNfc, dig); return; }   // 서버도 같은 그림 → 올릴 것 없음
        const base = this._binShadow().get(pNfc);
        if (sDig && base !== undefined && base !== sDig) {   // 내가 마지막으로 맞춘 뒤 서버도 바뀌었다 → 서버본 보관
          const srv = await this.getBin(this.docUrl(this.idFor(pNfc)) + '/bin');
          if (srv) await this.saveBinConflictCopy(pNfc, srv, server.mtime || Date.now(), 'server');
        }
      }
      await this.putBin(pNfc, u8, mtime);
    } catch (e) { console.error('[sync] onLocalBin', pNfc, e); }
  }
  async applyRemoteBin(doc, p) {
    const pNfc = nfc(p);
    try {
      const exists = await this.app.vault.adapter.exists(p);
      if (doc.deleted || doc._deleted) {
        if (exists) {
          this.applying = true;
          try { const af = this.app.vault.getAbstractFileByPath(p); if (af) await this.app.vault.trash(af, false); else await this.app.vault.adapter.remove(p); }
          finally { this.applying = false; }
          await this.pruneEmptyParents(p);
        }
        this._binShadow().delete(pNfc); return exists;
      }
      const dig = this.attDigest(doc);
      if (!dig) return false;                      // 첨부가 아직 안 올라온 문서(만들다 만 것) — 손대지 않는다
      if (!exists) return await this.pullBinTo(p, doc);
      let local; try { local = await this.readBin(p); } catch (e) { return false; }
      const lDig = md5b64(local);
      if (lDig === dig) { this._binShadow().set(pNfc, dig); return false; }   // 이미 같다 → 아무 일도 안 한다
      const base = this._binShadow().get(pNfc);
      if (base === lDig) return await this.pullBinTo(p, doc);                  // 로컬은 그대로, 서버만 바뀜 → 서버본
      const st = await this.app.vault.adapter.stat(p); const lm = (st && st.mtime) || 0;
      if (base === dig) { await this.putBin(pNfc, local, lm); return true; }   // 서버는 그대로, 로컬만 바뀜 → 올린다
      if (base !== undefined) {   // 마지막으로 맞춘 것 대비 양쪽 다 바뀜 → 진 쪽을 사본으로 (아무것도 안 잃는다)
        if ((doc.mtime || 0) >= lm) await this.saveBinConflictCopy(pNfc, local, lm, this.settings.deviceId || 'local');
        else { const srv = await this.getBin(this.docUrl(this.idFor(pNfc)) + '/bin'); if (srv) await this.saveBinConflictCopy(pNfc, srv, doc.mtime || 0, 'server'); }
      }
      if ((doc.mtime || 0) >= lm) return await this.pullBinTo(p, doc);
      await this.putBin(pNfc, local, lm); return true;
    } catch (e) { console.error('[sync] applyRemoteBin', p, e); return false; }
  }
  async saveBinConflictCopy(pNfc, u8, mtime, tag) {
    const dot = pNfc.lastIndexOf('.'); const ext = dot > 0 ? pNfc.slice(dot) : ''; const bare = dot > 0 ? pNfc.slice(0, dot) : pNfc;
    const cp = `${bare} (충돌 ${tag} ${this.tstamp()})${ext}`;
    await this.writeLocalBin(cp, u8); this._binShadow().set(cp, md5b64(u8)); await this.putBin(cp, u8, mtime);
    new Notice(`⚠️ 그림 충돌 — 사본 보관: ${cp.split('/').pop()}`);
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
  async readBin(p) { return new Uint8Array(await this.app.vault.adapter.readBinary(p)); }
  // applying 을 «되돌려» 놓는다(false 로 못박지 않는다) — hardReset 처럼 이미 applying 인 채로 부르는 자리가 있다.
  async writeLocalBin(p, u8) { await this.ensureParent(p); const was = this.applying; this.applying = true; try { await this.app.vault.adapter.writeBinary(p, this._ab(u8)); } finally { this.applying = was; } }
  tstamp() { const d = new Date(), z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}${z(d.getMinutes())}`; }
  _diffAt(a, b) { a = a || ''; b = b || ''; let i = 0; const m = Math.min(a.length, b.length); while (i < m && a[i] === b[i]) i++; return { i, local: a.slice(Math.max(0, i - 14), i + 14), server: b.slice(Math.max(0, i - 14), i + 14) }; }
  async logConflict(p, where, base, local, server, localMtime, serverMtime, serverLastEditor, serverClientVersion) {
    try {
      const d = this._diffAt(local, server);
      const rec = { t: new Date().toISOString(), where, path: p,
        baseLen: (base || '').length, localLen: (local || '').length, serverLen: (server || '').length,
        localChanged: (base || '') !== (local || ''), serverChanged: (base || '') !== (server || ''),
        localMtime, serverMtime, serverLastEditor: serverLastEditor || null,
        firstDiff: d.i, aroundLocal: d.local, aroundServer: d.server,
        collabOpen: nfc(p) === this.collabPath, deviceId: this.settings.deviceId, device: this.settings.deviceLabel, user: this.settings.username,
        // 어느 버전끼리 갈렸나 — «옛 기기가 밀어넣었나」를 판별하는 핵심 신호.
        clientVersion: this.manifest.version, serverClientVersion: serverClientVersion || null };
      console.warn('[collab] 충돌 로그', rec);
      const f = `${this.app.vault.configDir}/plugins/${this.manifest.id}/conflict-log.jsonl`;
      const line = JSON.stringify(rec) + '\n';
      try { await this.app.vault.adapter.append(f, line); }
      catch (e) { let prev = ''; try { if (await this.app.vault.adapter.exists(f)) prev = await this.app.vault.adapter.read(f); } catch (e2) {} await this.app.vault.adapter.write(f, prev + line); }
      await this.reportConflict(rec);
    } catch (e) { console.error('[collab] logConflict', e); }
  }
  // 같은 레코드를 서버에도 남긴다 — 기기 로컬 jsonl 은 그 기기에서만 보여, 어느 기기·어떤 상황에서 충돌이
  // 나는지 «모아서» 볼 수가 없다. 레코드마다 _id 가 달라 리비전 경합이 없다.
  // 구버전 pull-only(_outdated)여도 보낸다 — 옛 기기의 충돌이야말로 봐야 할 것이다.
  async reportConflict(rec) {
    try {
      if (!this.configured()) return;
      const stamp = rec.t.replace(/[:.]/g, '-');
      const rnd = Math.random().toString(36).slice(2, 7);
      const p = `${DIAG_DIR}/${stamp}-${rec.deviceId || 'unknown'}-${rnd}.json`;
      const id = this.idFor(p);
      await this.req('PUT', this.docUrl(id), { _id: id, path: p, kind: 'conflict', mtime: Date.now(), deleted: false, clientVersion: this.manifest.version, rec });
    } catch (e) { console.error('[collab] reportConflict', e); }
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
    const all = this.app.vault.getFiles ? this.app.vault.getFiles() : [];
    const files = this.app.vault.getMarkdownFiles().concat(all.filter((f) => this.isCanvasPath(f.path) && !this._ignored(f.path)));
    const bins = all.filter((f) => this.isBinPath(f.path) && !this._ignored(f.path));
    new Notice(`업로드 시작 — 노트·캔버스 ${files.length}개 · 그림 ${bins.length}개…`); let ok = 0, bok = 0;
    for (const f of files) { try { const content = await this.app.vault.adapter.read(f.path); await this.upsert(nfc(f.path), content, f.stat.mtime); ok++; } catch (e) {} }
    for (const f of bins) { try { await this.onLocalBin(nfc(f.path), (f.stat && f.stat.mtime) || Date.now()); bok++; } catch (e) {} }   // 상한 넘는 것은 putBin 이 남기고 건너뛴다
    new Notice(`업로드 완료 — 노트 ${ok}/${files.length} · 그림 ${bok}/${bins.length}`);
  }
  // 처음부터 다시 받기(하드 리셋): 로컬 .md 를 전부 지우고 서버본으로 통째 갈아엎는다.
  // 안전 순서 — ①서버 전체를 먼저 받아온다(실패하면 로컬은 손대지 않음) → ②로컬 .md 삭제 → ③서버본 기록.
  // 업데이트 직후 «서버본으로 재기준» — 이 기기의 로컬 .md 를 전부 버리고 서버본만 남긴다.
  //  왜: 기준선(shadow)은 메모리에만 있어 재시작하면 빈다. 그러면 applyRemote 의 «첫 대면» 규칙이
  //  수정시각이 새 쪽을 택하는데, 옛 버전에서 업로드 게이트에 막힌 채 로컬에만 쌓인 편집분이 바로 그
  //  «새 쪽»이라 업데이트하는 순간 서버(정본)를 덮는다. 서버가 정본이라는 방침에 맞추려면 올라온 직후
  //  로컬을 버리고 서버본으로 다시 깔아야 한다.
  //  로컬에만 있고 서버엔 없는 노트도 같이 사라진다 — 오프라인 편집이 잠겨 있어 그런 노트는 정상 경로로
  //  안 생긴다는 판단(형 결정, 2026-08-06).
  //  갓 설치(_freshInstall)는 대상이 아니다 — 남의 볼트에 처음 깔면서 그 볼트를 지우면 안 된다.
  async resetOnUpgrade() {
    if (this._freshInstall) { this.settings.lastRunVersion = this.manifest.version; await this.saveSettings(); return; }
    if (this.settings.lastRunVersion === this.manifest.version) return;
    if (!this.configured() || this.isOffline()) return;   // 로그인 전·오프라인이면 다음 기동/재접속에 다시 시도
    this._resetting = true; this.refreshLock();
    this.endSession();                                    // 재기준 중엔 실시간 협업도 붙지 않는다
    let modal = null;
    try { modal = new UpgradeResetModal(this.app, this.settings.lastRunVersion, this.manifest.version); modal.open(); } catch (e) {}
    let ok = false;
    try { ok = await this.hardReset(); } catch (e) { console.error('[sync] resetOnUpgrade', e); }
    if (ok) { this.settings.lastRunVersion = this.manifest.version; await this.saveSettings(); }
    if (modal) { modal.allowClose = true; try { modal.close(); } catch (e) {} }
    this._resetting = false; this.refreshLock();
  }
  async hardReset() {
    if (!this.configured()) { new Notice('먼저 설정을 채우세요'); return false; }
    new Notice('서버에서 전체 받는 중…');
    const prefix = this.settings.docPrefix || '';
    const hi = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    const q = `${this.dbPath('_all_docs')}?include_docs=true&startkey=${encodeURIComponent(JSON.stringify(prefix))}&endkey=${encodeURIComponent(JSON.stringify(hi))}`;
    let res; try { res = await this.req('GET', q); } catch (e) { res = null; }
    if (!res || res.status !== 200 || !res.json || !Array.isArray(res.json.rows)) { new Notice('❌ 서버에서 받기 실패 — 로컬은 그대로 둡니다'); return false; }
    const docs = res.json.rows.map(r => r.doc).filter(d => d && (d.path || d._id));
    this.applying = true;   // 삭제·기록 중 로컬 이벤트가 서버로 전파되지 않게 막는다
    let del = 0, wr = 0;
    try {
      for (const f of this.app.vault.getMarkdownFiles()) { try { await this.app.vault.adapter.remove(f.path); del++; } catch (e) {} }
      this.shadow.clear(); this._binShadow().clear();
      const bins = [];
      for (const d of docs) {
        if (d.deleted || d._deleted) continue;
        const p = d.path || d._id.slice(prefix.length);
        if (this.isBinPath(p)) { bins.push([p, d]); continue; }   // 그림은 첨부를 따로 받아야 한다 — 아래에서
        if (!this.isTextPath(p)) continue;   // 캔버스도 서버본을 쓴다. 다만 «지우지는» 않았다(위 삭제는 .md 뿐)
        try { await this.ensureParent(p); await this.app.vault.adapter.write(p, d.content || ''); this.shadow.set(p, d.content || ''); wr++; } catch (e) {}
      }
      // 그림은 «로컬을 먼저 지우지 않는다». .md 를 지우는 이유는 옛 버전에서 업로드가 막힌 채 로컬에만
      // 쌓인 편집분이 서버(정본)를 덮는 것을 막기 위해서인데, 그림은 옵시디언에서 고치는 것이 아니라
      // 그 걱정이 없다. 반면 이 재기준은 버전을 올릴 때마다 도므로, 여기서 지웠다가 못 받아오면 그냥 잃는다.
      for (const [p, d] of bins) { try { if (await this.pullBinTo(p, d)) wr++; } catch (e) {} }
    } finally { this.applying = false; this._suppressUntil = Date.now() + 12000; }   // 리셋 후 12초간 로컬→서버 전파 차단(뒤늦게 뜨는 delete 이벤트가 서버 대량삭제로 번지는 것 방지)
    try { const info = await this.req('GET', encodeURIComponent(this.settings.dbName)); if (info.status === 200 && info.json && info.json.update_seq !== undefined) { this.settings.lastSeq = info.json.update_seq; await this.saveSettings(); } } catch (e) {}
    new Notice(`♻️ 다시 받기 완료 — 로컬 ${del}개 삭제 · 서버본 ${wr}개 기록`);
    return true;
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
  /* ── 관리(읽기모드·추방) ─────────────────────────────────────────────
     관리자 계정만 남을 읽기모드로 바꾸거나 추방할 수 있다(누가 관리자인지는 relay 가 정한다 — /app/.admins).
     읽기모드: 이 기기가 스스로 편집을 잠근다. 관리자가 풀 때까지 유지되고 재시작해도 유지된다(서버에 남는다).
     추방:    relay 가 ws 를 끊고 일정 시간 재접속을 거부한다. 'room' 이면 그 노트만, 'all' 이면 협업 전체.
     ⚠️ 둘 다 «실시간 협업 + 이 플러그인의 편집잠금」 범위다. 파일동기화(CouchDB 직접)까지 막지는 못한다. */
  modKey(login, deviceId) { return `${login || '?'}|${deviceId || '?'}`; }
  myModKey() { return this.modKey(this.settings.username, this.settings.deviceId); }
  async modPost(path, body) {
    const token = await this.getToken(); if (!token) return null;
    try {
      const res = await requestUrl({ url: this.httpBase() + path, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token }, body || {})), throw: false });
      return (res.status === 200 && res.json) ? res.json : null;
    } catch (e) { return null; }
  }
  async fetchMod() {   // 내가 관리자인가 + 내가 지금 잠겨/추방돼 있나 (누구나 부를 수 있다)
    if (!this.settings.enabled || !this.settings.wsUrl || this.isOffline()) return null;
    const r = await this.modPost('/admin/state', {});
    if (!r || !r.ok) return null;
    this._modAdmin = !!r.admin;
    this.applyMod({ readonly: r.readonly || [], bans: r.bans || {} });
    return r;
  }
  applyMod(m) {   // presence meta 로 즉시 오거나(관리자가 방금 눌렀다) fetchMod 로 온다(붙을 때·1분마다)
    if (!m) return;
    this._modAll = m;
    const ro = (m.readonly || []).indexOf(this.myModKey()) >= 0;
    if (ro !== !!this._modReadonly) {
      this._modReadonly = ro;
      this.refreshLock();
      if (ro) { new Notice('📖 관리자가 이 기기를 읽기모드로 바꿨습니다', 6000); try { new AlertModal(this.app, '📖 읽기모드', '관리자가 이 기기를 읽기모드로 바꿨습니다. 관리자가 풀기 전까지 편집할 수 없습니다. 읽기와 동기화는 그대로 됩니다.').open(); } catch (e) {} }
      else new Notice('✏️ 읽기모드가 풀렸습니다 — 편집할 수 있습니다', 5000);
    }
    if (!((m.bans || {})[this.myModKey()]) && this._kickUntil) this.clearKick();   // 관리자가 추방을 일찍 풀었다
  }
  // ── 관리자가 누르는 것 (relay 가 관리자인지 다시 확인한다 — 여기 통과해도 서버에서 막힌다)
  async adminReadonly(u, on) {
    const r = await this.modPost('/admin/readonly', { login: u.login, deviceId: u.deviceId, label: u.name, on: !!on });
    if (!r || !r.ok) { new Notice('❌ 읽기모드 설정 실패 (권한·연결 확인)', 5000); return false; }
    new Notice(on ? `📖 ${u.name} 읽기모드` : `✏️ ${u.name} 읽기모드 해제`, 4000);
    await this.fetchMod(); return true;
  }
  async adminKick(u, scope, path) {
    const r = await this.modPost('/admin/kick', { login: u.login, deviceId: u.deviceId, label: u.name, scope, path });
    if (!r || !r.ok) { new Notice('❌ 추방 실패 (권한·연결 확인)', 5000); return false; }
    new Notice(scope === 'room' ? `🚪 ${u.name} — 이 노트에서 내보냄` : `🚫 ${u.name} — 협업 연결 차단`, 5000);
    await this.fetchMod(); return true;
  }
  async adminUnkick(u) {
    const r = await this.modPost('/admin/unkick', { login: u.login, deviceId: u.deviceId, label: u.name });
    if (!r || !r.ok) { new Notice('❌ 추방 해제 실패', 5000); return false; }
    new Notice(`✅ ${u.name} 추방 해제`, 4000);
    await this.fetchMod(); return true;
  }
  onKicked(reason, path) {   // relay 가 4403 으로 끊었다 — reason = 'kicked <남은초> <scope>'
    const p = String(reason || '').split(' ');
    const left = Math.min(3600, Math.max(5, parseInt(p[1], 10) || 600));
    const scope = (p[2] === 'room') ? 'room' : 'all';
    this._kickUntil = Date.now() + left * 1000; this._kickScope = scope; this._kickPath = path ? nfc(path) : null;
    this.endSession();
    if (scope === 'all') this.stopPresence();
    try { clearTimeout(this._kickTimer); } catch (e) {}
    this._kickTimer = setTimeout(() => this.clearKick(), left * 1000 + 500);
    const mins = Math.ceil(left / 60);
    if (!this._kickShown) {
      this._kickShown = true;
      try { new AlertModal(this.app, '🚫 공동편집에서 내보내졌습니다', scope === 'room'
        ? `관리자가 이 노트의 공동편집에서 내보냈습니다. 약 ${mins}분 뒤 자동으로 다시 연결되고, 그동안 이 노트는 편집할 수 없습니다. 다른 노트는 그대로 씁니다.`
        : `관리자가 공동편집 연결을 끊었습니다. 약 ${mins}분 뒤 자동으로 다시 연결되고, 그동안 편집이 잠깁니다.`).open(); } catch (e) {}
    }
    this.refreshLock();
  }
  clearKick() {
    if (!this._kickUntil) return;
    this._kickUntil = 0; this._kickScope = null; this._kickPath = null; this._kickShown = false;
    try { clearTimeout(this._kickTimer); } catch (e) {}
    new Notice('✅ 공동편집에 다시 연결합니다', 4000);
    this.refreshLock(); this.ensurePresence(); this.onActiveChange();
  }
  kickActive() {   // 지금 이 화면이 추방으로 잠기나
    if (!this._kickUntil || Date.now() >= this._kickUntil) return false;
    if (this._kickScope === 'all') return true;
    const v = this.app.workspace.getActiveViewOfType(MarkdownView);
    return !!(v && v.file && nfc(v.file.path) === this._kickPath);
  }
  // ── 커서 안 보이기 — 이 기기 화면에서만 숨긴다(상대 편집은 그대로 되고, 다른 사람 화면에도 그대로 보인다).
  //    y-codemirror 는 awareness.getStates() 로 남의 커서를 그린다 → 그 목록에서만 빼면 된다.
  awarenessFilter(aw) {
    const plugin = this;
    try {
      return new Proxy(aw, { get(t, prop) {
        if (prop === 'getStates') return () => {
          const m = t.getStates();
          if (!plugin.hiddenPeers || !plugin.hiddenPeers.size) return m;
          const out = new Map();
          for (const [id, st] of m) { const n = st && st.user && st.user.name; if (n && plugin.hiddenPeers.has(n)) continue; out.set(id, st); }
          return out;
        };
        const v = Reflect.get(t, prop, t);
        return (typeof v === 'function') ? v.bind(t) : v;
      } });
    } catch (e) { return aw; }
  }
  toggleHidePeer(name) {
    if (!this.hiddenPeers) this.hiddenPeers = new Set();
    if (this.hiddenPeers.has(name)) this.hiddenPeers.delete(name); else this.hiddenPeers.add(name);
    this.redrawPeer(name);
    return this.hiddenPeers.has(name);
  }
  redrawPeer(name) {   // 커서는 awareness 가 바뀔 때만 다시 그려진다 → 그 사람 clientID 로 변경 알림을 한 번 낸다
    try {
      const aw = this.session && this.session.provider && this.session.provider.awareness; if (!aw) return;
      const ids = [];
      for (const [id, st] of aw.getStates()) if (st && st.user && st.user.name === name) ids.push(id);
      if (ids.length) aw.emit('change', [{ added: [], updated: ids, removed: [] }, 'local']);
    } catch (e) {}
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
      // ⭐ 모달을 «세션당 한 번»만 띄우던 것을 고쳤다 (2026-08-13, 형 신고: 「업데이트 하라는 모달은 안 뜨고 편집만 막힌다」).
      //  전에는 `_updShown` 이 한 번 서면 계속 true 라, 형이 «확인»으로 닫는 순간 다시 뜨지 않았다. 그 플래그는
      //  버전을 안 봐서 **새 릴리스가 나와도** 그대로였다. 그동안 편집은 계속 잠겨 있으니, 남는 안내는 상태바 한 줄뿐인데
      //  **모바일은 상태바를 안 띄운다** — 아이패드에선 «왜 막혔는지» 알 길이 아예 없었다.
      //  이제 구버전인 동안에는 모달이 닫혀 있으면 다시 띄운다(확인 주기가 10분이라 그보다 자주 뜨지 않는다).
      //  편집을 막아 놓았으면 왜 막았는지는 계속 보여야 한다 — 잠금과 안내가 같이 가야 한다.
      if (outdated) { if (!this._updModal) this.showUpdateModal(); }
      else if (this._updModal) { try { this._updModal.close(); } catch (e) {} this._updModal = null; }   // 업데이트되면 떠 있던 안내를 치운다
    } catch (e) {}
  }
  showUpdateModal() {
    try {
      const m = new UpdateModal(this.app, this.manifest.version, this._latestVer || '');
      m.onDismiss = () => { this._updModal = null; };
      this._updModal = m; m.open();
    } catch (e) { this._updModal = null; }
  }
  refreshLock() {
    const kicked = this.kickActive();
    const lock = this.settings.enabled && (this.isOffline() || this._resetting || this._gating || this._collabConnecting || this._outdated || this._dupName || this._harnessLock || this._modReadonly || kicked);   // 오프라인·재기준중·초기동기화·협업연결중·구버전·기기이름중복·하네스정리중·관리자읽기모드·추방중이면 편집 잠금
    // 모바일: CM readOnly 가 iOS 웹뷰에선 입력을 못 막는다. 그래서 노트를 «읽기 모드」로 강제 전환한다
    //  → 읽기 모드는 편집기가 아니라 렌더링 뷰라 어떤 플랫폼에서도 편집이 불가능하다. (cm 핸들 불필요)
    if (Platform.isMobile) this.applyViewLock(lock);
    // 데스크톱: 화면 안 바뀌게 CM readOnly 로 처리.
    const view = this.app.workspace.getActiveViewOfType(MarkdownView); const cm = view && view.editor && view.editor.cm;
    if (cm) {
      let cur; try { cur = !!cm.state.readOnly; } catch (e) { cur = undefined; }
      if (cur !== lock) { try { cm.dispatch({ effects: this.editLock.reconfigure(lock ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : []) }); } catch (e) {} }
    }
    if (lock) this.setCollab(this._resetting ? '♻️ 서버본으로 다시 받는 중… 편집 잠금' : this._modReadonly ? '📖 관리자가 읽기모드로 설정 — 편집 잠금' : kicked ? ('🚫 관리자가 내보냄 — ' + Math.max(1, Math.ceil((this._kickUntil - Date.now()) / 60000)) + '분 남음') : this._dupName ? ('🔴 기기 이름 «' + this.settings.deviceLabel + '» 중복 — 이름 바꿔야 편집·동기화') : this._outdated ? ('🔺 업데이트 필요 → ' + (this._latestVer || '') + ' · 편집잠금') : this._harnessLock ? '🤖 하네스가 정리하는 중… 잠시 편집 잠금' : (this._collabConnecting && !this.isOffline() && !this._gating) ? '🔄 노트 동기화 중… 편집 잠금' : '🔒 오프라인·편집잠금');
    else if (this._lastLock) this.setCollab((this.session && this.session.provider && this.session.provider.wsconnected) ? '연결됨·' + this.peerCount() : '연결 안됨');
    this._lastLock = lock;
    this.updateDisconnectModal();
  }
  // 연결 안됨(오프라인/서버 도달 불가)일 때 «닫을 수 있는» 모달로 시각 표시. 편집 잠금 자체는 refreshLock 이 함(이 모달은 표시용).
  //  _outdated 는 UpdateModal(«BRAT 업데이트»)이 따로 담당, _gating/_harnessLock/_dupName 도 각자 모달이 있어 여기선 제외.
  updateDisconnectModal() {
    const off = this.settings.enabled && this.isOffline() && !this._resetting && !this._gating && !this._harnessLock && !this._dupName && !this._outdated;
    if (off) {
      if (!this._discDismissed && !this._discModal) {
        const m = new DisconnectModal(this.app);
        m.onDismiss = () => { this._discModal = null; this._discDismissed = true; };   // 사용자가 닫음 → 재연결 전까지 다시 안 띄움
        this._discModal = m; m.open();
      }
    } else {
      this._discDismissed = false;
      if (this._discModal) { const m = this._discModal; this._discModal = null; m._auto = true; try { m.close(); } catch (e) {} }   // 복구 → 자동 닫힘(사용자닫음으로 표시 안 함)
    }
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
  // ⭐ 한 기기가 둘로 보이던 것 막기(2026-08-12): 토큰을 기다리는 사이에 또 불리면
  // provider 가 둘 생기고 앞의 것을 아무도 안 닫았다. 그 것은 15초마다 자기 상태를 갱신해 안 사라진다.
  // → 붙는 중이면 그게 끝나길 기다리고(둘 만들지 않는다), 기다리는 사이 stopPresence 가 오면 이번 것은 버린다.
  async ensurePresence() {
    if (!this.settings.enabled || !this.settings.wsUrl) return;
    while (this._presStarting) { try { await this._presStarting; } catch (e) {} }
    if (this.presence) return;
    const gen = this._presGen | 0;
    const p = (async () => {
      const token = await this.getToken(); if (!token) return;
      if (this.presence || gen !== (this._presGen | 0)) return;   // 그 사이 stopPresence/재로그인 → 이번 것은 버린다
      if (this._kickUntil && this._kickScope === 'all' && Date.now() < this._kickUntil) return;   // 추방 중엔 안 붙는다(붙어봐야 relay 가 끊는다)
      const doc = new Y.Doc();
      const prov = new WebsocketProvider(this.settings.wsUrl, '__presence__', doc, { params: { token, v: this.manifest.version, d: this.settings.deviceId } });   // v: relay 가 옛 플러그인 차단(강제 업데이트) · d: 관리(읽기모드·추방) 대상 식별
      this._presenceDoc = doc; this.presence = prov;
      prov.awareness.setLocalStateField('user', { name: `${this.settings.username}·${this.settings.deviceLabel}`, color: this.userColor, login: this.settings.username, device: this.settings.deviceLabel, deviceId: this.settings.deviceId });
      this.updatePresencePath();
      prov.awareness.on('change', () => this.onPresenceChange());
      // relay 가 관리 상태(읽기모드·추방)를 이 방의 meta 로 즉시 밀어 준다 → 관리자가 누르면 바로 걸린다.
      const pmeta = doc.getMap('meta');
      pmeta.observe(() => { try { this.applyMod(pmeta.get('mod')); } catch (e) {} });
      prov.on('connection-close', (e) => { if (e && e.code === 4403) this.onKicked(e.reason, null); });
    })();
    this._presStarting = p;
    try { await p; } finally { if (this._presStarting === p) this._presStarting = null; }
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
  stopPresence() { this._presGen = (this._presGen | 0) + 1; try { if (this.presence) this.presence.destroy(); } catch (e) {} try { if (this._presenceDoc) this._presenceDoc.destroy(); } catch (e) {} this.presence = null; this._presenceDoc = null; }
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
    if (this._resetting) { this.endSession(); this._startingPath = null; this.refreshLock(); return; }   // 서버본으로 재기준하는 동안은 실시간 협업도 안 붙음
    if (this._dupName) { this.endSession(); this._startingPath = null; this.refreshLock(); return; }   // 이름 충돌 중엔 협업 세션 안 붙음(잠금 유지)
    this.updatePresencePath();
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = view && view.file; const path = file ? file.path : null;
    // 추방 중이면 그 노트(또는 전체)에는 안 붙는다 — 붙어봐야 relay 가 끊고, 잠금은 refreshLock 이 건다.
    if (this._kickUntil && Date.now() < this._kickUntil && (this._kickScope === 'all' || (path && nfc(path) === this._kickPath))) {
      this.endSession(); this._startingPath = null; this.refreshLock(); return;
    }
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
    // ⭐ 같은 기기가 한 방에 두 번 붙던 것 막기(2026-08-12): 토큰을 기다리는 사이 다른 노트로 옮기면
    // (_startingPath 는 경로가 달라 안 막는다) provider 가 둘 남고 앞의 것을 아무도 안 닫았다.
    const gen = this._sessGen = (this._sessGen | 0) + 1;
    const token = await this.getToken(); if (!token) { this.setCollab('로그인 필요'); this._collabConnecting = false; try { clearTimeout(this._connectTimer); } catch (e) {} this.refreshLock(); return; }
    if (gen !== (this._sessGen | 0)) return;   // 그 사이 다른 노트로 옮겼다/세션을 닫았다 → 이번 것은 안 만든다
    const path = file.path; const ydoc = new Y.Doc();
    const room = 'note:' + b64url(path.normalize('NFC'));
    const provider = new WebsocketProvider(this.settings.wsUrl, room, ydoc, { params: { token, v: this.manifest.version, d: this.settings.deviceId } });   // v: relay 가 옛 플러그인 차단(강제 업데이트) · d: 관리(읽기모드·추방) 대상 식별
    const ytext = ydoc.getText('content');
    const meta = ydoc.getMap('meta');   // 하네스가 이 노트를 쓰는 동안 meta.lock 을 건다(플러그인은 lock 을 안 건다) → 관찰해서 편집잠금
    const label = `${this.settings.username}·${this.settings.deviceLabel}`;
    provider.awareness.setLocalStateField('user', { name: label, color: this.userColor, colorLight: this.userColor + '40', login: this.settings.username });
    const session = { path, ydoc, provider, ytext, cm, attached: false, saveTimer: null, onSync: null, persist: null };
    this.session = session; this.collabPath = nfc(path);   // ← 파일동기화가 이 노트를 안 건드리게
    provider.on('status', (e) => { if (this.session === session) { this.setCollab(e.status === 'connected' ? '연결됨' : '연결 중…'); this.refreshLock(); } });
    provider.awareness.on('change', () => { if (this.session === session) { this.setCollab('연결됨·' + this.peerCount()); this.followScroll(session); } });
    provider.on('connection-close', async (e) => {
      if (e && e.code === 4403) return this.onKicked(e.reason, path);   // 관리자가 이 노트(또는 전체)에서 내보냈다
      this._token = null; if (this.session === session) this.refreshLock();
    });
    const onSync = async (isSynced) => {
      if (!isSynced || session.attached || this.session !== session) return;
      if (ytext.length === 0) { try { const content = await this.app.vault.read(file); if (this.session !== session) return; if (content && ytext.length === 0) ydoc.transact(() => ytext.insert(0, content)); } catch (e) {} }
      if (this.session !== session) return;
      session.attached = true;
      this._collabConnecting = false; try { clearTimeout(this._connectTimer); } catch (e) {}   // 붙었으니 편집 잠금 해제
      // 열려 있는 노트를 파일로 다시 쓰면 옵시디언이 «에디터 문서를 그 내용으로」 갈아끼운다.
      // 그때 파일 내용이 지금 에디터 문서와 조금이라도 다르면, 그 줄단위 되돌림이 y-codemirror 를 거쳐
      // Y.Text 로 돌아와 본문이 어긋난다(2026-08-09 사고: 개행마다 7유닛씩 지워짐).
      // → 에디터 문서가 Y.Text 와 «완전히 같을 때만» 쓴다. 그러면 갈아끼워도 내용이 안 바뀐다.
      //   다르면 이번은 건너뛴다 — 치고 있는 중이라 Y.Text 가 곧 또 바뀌고 persist 가 다시 온다.
      const persist = () => { clearTimeout(session.saveTimer); session.saveTimer = setTimeout(async () => { try {
        if (this.session !== session) return;
        const text = ytext.toString();
        let cur = null; try { cur = session.cm.state.doc.toString(); } catch (e) {}
        if (cur !== null && cur !== text) return;
        if (text === session.lastWritten) return;   // 같은 내용을 또 쓰지 않는다(쓸 때마다 갈아끼움이 일어난다)
        const f = this.app.vault.getAbstractFileByPath(path);
        // ⭐ 기준선(shadow)도 같이 옮긴다. 안 옮기면 파일동기화가 «이 기기가 로컬에서 고쳤다»고 보고,
        //    나중에 relay 가 저장한 cvs 가 오면 기준선 대비 «양쪽 다 바뀜」이 되어 3-way 병합이 돈다.
        //    그 병합은 겹치지 않는 두 판본을 «둘 다» 남기므로 같은 줄이 두 번 들어간다(2026-08-12 사고).
        if (f) { this.applying = true; try { await this.app.vault.modify(f, text); session.lastWritten = text; this.shadow.set(nfc(path), text); } finally { this.applying = false; } }
      } catch (e) {} }, 700); };
      session.persist = persist; ytext.observe(persist);
      // awarenessFilter: «커서 안 보이기» 로 지정한 사람만 이 화면에서 빠진다(내용·상대 편집엔 영향 없음).
      await this._reconcileAttach(cm, ytext, nfc(path));   // ⭐ 붙기 전에 에디터와 Y.Text 를 맞춘다 — 어긋난 채로 붙으면 글자가 엉뚱한 자리에 들어간다
      if (this.session !== session) return;
      try { cm.dispatch({ effects: this.compartment.reconfigure(yCollab(ytext, this.awarenessFilter(provider.awareness))) }); } catch (e) { console.error('[collab] attach', e); }
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
    this._sessGen = (this._sessGen | 0) + 1;   // 붙는 중인 세션이 있으면 그건 버려진다(위 startSession 의 gen 확인)
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

  async loadSettings() { const raw = await this.loadData(); this._freshInstall = !raw; this.settings = Object.assign({}, DEFAULTS, raw); }
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
    const g = contentEl.createEl('p', { text: 'BRAT → «Check for updates to all beta plugins» 를 누르면 그 자리서 반영됩니다(Obsidian 재시작 안 해도 됩니다). 옵시디언을 껐다 켜도 BRAT 이 시작할 때 알아서 올려 줍니다.' }); g.style.color = 'var(--text-muted)';
    const row = contentEl.createDiv(); row.style.cssText = 'display:flex;justify-content:flex-end;margin-top:8px';
    const ok = row.createEl('button', { text: '확인' }); ok.classList.add('mod-cta'); ok.onclick = () => this.close();
  }
  onClose() { this.contentEl.empty(); try { if (this.onDismiss) this.onDismiss(); } catch (e) {} }
}
class UpgradeResetModal extends Modal {   // 업데이트 직후 서버본으로 재기준하는 동안 뜬다(닫기 불가). 끝나면 자동으로 닫힌다.
  constructor(app, from, to) { super(app); this.allowClose = false; this.from = from; this.to = to; }
  onOpen() {
    const { contentEl, containerEl } = this;
    document.body.classList.add('collab-syncgate-open');   // X 숨김 CSS 는 동기화 게이트와 같은 것을 쓴다
    try { containerEl.querySelectorAll('.modal-close-button').forEach((x) => x.remove()); } catch (e) {}
    contentEl.createEl('h3', { text: '♻️ 업데이트됨 — 서버본으로 다시 받는 중' });
    contentEl.createEl('p', { text: `플러그인이 ${this.from || '옛 버전'} → ${this.to} 로 올라갔습니다. 이 기기의 노트를 서버 최신본으로 다시 깝니다.` });
    const w = contentEl.createEl('p', { text: '서버에 없고 이 기기에만 있던 노트는 사라집니다. 끝나면 자동으로 닫히고 편집·실시간 참여가 열립니다.' });
    w.style.cssText = 'color:var(--text-muted);';
  }
  close() { if (this.allowClose) super.close(); }   // 완료 전엔 Esc·배경클릭·X 로 안 닫힘
  onClose() { try { document.body.classList.remove('collab-syncgate-open'); } catch (e) {} this.contentEl.empty(); }
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
class DisconnectModal extends Modal {   // 연결 안됨 시각 표시(닫기 가능). 편집 잠금은 refreshLock 이 유지.
  constructor(app) { super(app); this.onDismiss = null; this._auto = false; }
  onOpen() {
    const { contentEl } = this; contentEl.empty();
    contentEl.createEl('h3', { text: '🔌 연결 안됨' });
    contentEl.createEl('p', { text: '서버에 연결되어 있지 않습니다. 인터넷 연결을 확인하세요. 연결이 복구되면 편집이 자동으로 다시 열립니다.' });
    const hint = contentEl.createEl('p', { text: '· 편집은 잠깁니다(연결된 뒤 편집한 것이 덮이는 것을 막기 위해서).\n· 계속 안 되면 플러그인 업데이트가 필요할 수 있습니다 — BRAT 로 확인하세요.' });
    hint.style.cssText = 'color:var(--text-muted);font-size:.9em;white-space:pre-line;';
    const row = contentEl.createDiv(); row.style.cssText = 'display:flex;justify-content:flex-end;margin-top:10px';
    const ok = row.createEl('button', { text: '닫기' }); ok.classList.add('mod-cta'); ok.onclick = () => this.close();
  }
  onClose() { if (!this._auto && this.onDismiss) { try { this.onDismiss(); } catch (e) {} } this.contentEl.empty(); }
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
      const admin = !!this.plugin._modAdmin;                       // 관리 버튼은 관리자 계정에서만 보인다(서버도 다시 확인한다)
      const mod = this.plugin._modAll || { readonly: [], bans: {} };
      for (const st of states) {
        const u = st.user; const name = u.name; const mine = (name === myLabel);
        const li = ul.createEl('li'); li.style.display = 'flex'; li.style.flexWrap = 'wrap'; li.style.alignItems = 'center'; li.style.gap = '6px'; li.style.padding = '5px 0';
        const dot = li.createSpan({ text: '●' }); dot.style.color = u.color || 'var(--text-muted)';
        const info = li.createDiv(); info.style.flex = '1'; info.style.minWidth = '45%';
        const key = this.plugin.modKey(u.login, u.deviceId);
        const ro = (mod.readonly || []).indexOf(key) >= 0;
        const ban = (mod.bans || {})[key];
        const banLeft = (ban && ban.until > Date.now()) ? Math.max(1, Math.ceil((ban.until - Date.now()) / 60000)) : 0;
        const hidden = this.plugin.hiddenPeers && this.plugin.hiddenPeers.has(name);
        info.createDiv({ text: name + (mine ? ' (나)' : '') + (ro ? ' 📖' : '') + (banLeft ? ' 🚫' : '') + (hidden ? ' 🙈' : '') });
        const where = st.path ? st.path.split('/').pop() : '(노트 없음)';
        const sub = info.createDiv({ text: '📄 ' + where + (ro ? ' · 읽기모드' : '') + (banLeft ? ` · 추방 ${banLeft}분 남음` : '') });
        sub.style.fontSize = '0.8em'; sub.style.color = 'var(--text-muted)';
        if (mine) continue;
        const following = (this.plugin.following === name);
        const btn = li.createEl('button', { text: following ? '따라가기 해제' : '따라가기' });
        if (following) btn.classList.add('mod-cta');
        btn.onclick = async () => { if (this.plugin.following === name) this.plugin.unfollow(); else await this.plugin.followUser(name); render(); };
        if (!admin) continue;
        // 커서 숨기기는 «내 화면에서만» — 서버에 안 남고 상대·다른 사람에겐 영향이 없다.
        const eye = li.createEl('button', { text: hidden ? '커서 보이기' : '커서 숨기기' });
        eye.onclick = () => { this.plugin.toggleHidePeer(name); render(); };
        // 읽기모드는 관리자가 풀 때까지 유지된다(상대가 껐다 켜도, relay 를 재시작해도).
        const rob = li.createEl('button', { text: ro ? '읽기모드 해제' : '읽기모드' });
        if (ro) rob.classList.add('mod-cta');
        rob.onclick = async () => { rob.disabled = true; await this.plugin.adminReadonly(u, !ro); render(); };
        if (banLeft) {
          const un = li.createEl('button', { text: '추방 해제' }); un.classList.add('mod-cta');
          un.onclick = async () => { un.disabled = true; await this.plugin.adminUnkick(u); render(); };
        } else {
          const kr = li.createEl('button', { text: '이 노트에서 추방' });
          kr.disabled = !st.path;   // 보고 있는 노트가 없으면 «그 노트 방»이 없다
          kr.onclick = async () => { kr.disabled = true; await this.plugin.adminKick(u, 'room', st.path); render(); };
          const ka = li.createEl('button', { text: '연결 차단' }); ka.classList.add('mod-warning');
          ka.onclick = async () => { ka.disabled = true; await this.plugin.adminKick(u, 'all', null); render(); };
        }
      }
    };
    render(); this._h = () => render(); pres.awareness.on('change', this._h);
    this.plugin.fetchMod().then(() => render());   // 내가 관리자인지·누가 잠겨 있는지를 서버에서 받아 다시 그린다
  }
  onClose() { try { if (this._h && this.plugin.presence) this.plugin.presence.awareness.off('change', this._h); } catch (e) {} try { if (this._sh) window.clearInterval(this._sh); } catch (e) {} this.contentEl.empty(); }
}
