import esbuild from 'esbuild';

// Obsidian 이 런타임에 제공하는 모듈들은 external 로 둔다 (특히 @codemirror/* — 안 그러면
// 별도 CM 인스턴스가 번들돼 에디터에 안 붙는다). Yjs·y-websocket·y-codemirror.next 는 번들.
const external = [
  'obsidian', 'electron',
  '@codemirror/autocomplete', '@codemirror/collab', '@codemirror/commands',
  '@codemirror/language', '@codemirror/lint', '@codemirror/search',
  '@codemirror/state', '@codemirror/view',
  '@lezer/common', '@lezer/highlight', '@lezer/lr',
];

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'cjs',
  target: 'es2018',
  platform: 'browser',
  external,
  outfile: 'main.js',
  sourcemap: false,
  logLevel: 'info',
});
console.log('✅ built main.js');
