// Re-import a pinned upstream revision. Never run downloaded repository code.
const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
 const root = path.resolve(__dirname, '..', 'data', 'free-exercise-db');
 const previous = JSON.parse(await fs.readFile(path.join(root, 'source.json'), 'utf8'));
 const commit = process.argv[2] || previous.commit;
 if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Provide a full Git commit SHA.');
 const base = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${commit}/`;
 const fetchText = async name => { const response = await fetch(base + name); if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`); return response.text(); };
 const [json, license] = await Promise.all([fetchText('dist/exercises.json'), fetchText('LICENSE.md')]);
 const rows = JSON.parse(json); const ids = new Set();
 for (const e of rows) {
  if (!e.id || ids.has(e.id) || !e.name || !Array.isArray(e.instructions) || !Array.isArray(e.primaryMuscles) || !Array.isArray(e.images)) throw new Error(`Invalid exercise: ${e.id}`);
  if (e.images.some(p => p.includes('..') || !/^[\w/.-]+$/.test(p))) throw new Error(`Unsafe image path: ${e.id}`);
  ids.add(e.id);
 }
 await fs.writeFile(path.join(root, 'exercises.json'), json);
 await fs.writeFile(path.join(root, 'LICENSE.md'), license);
 await fs.writeFile(path.join(root, 'source.json'), JSON.stringify({ ...previous, commit, importedAt: new Date().toISOString().slice(0,10) }, null, 2));
 console.log(`Imported ${rows.length} exercises at ${commit}. Review content and revalidate bundled photos before shipping a new revision.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

