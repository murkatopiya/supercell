#!/usr/bin/env node
// Developer verification only; never establishes human authority or activation.
// Exit 0: accepted verification PASS; 2: valid preparation, NO_ACCEPTED_SNAPSHOT;
// exit 1: verification/schema/error failure. C2 changes only the snapshot registry.
// C3 bookkeeping is outside the anchor chain. No writes, fetch or repair.
import { readFileSync, readdirSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const INDEX = 'docs/governance/frozen-identities.json';
const REGISTRY = 'docs/governance/accepted-snapshots.json';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = (reason, layer = 'schema') => { throw Object.assign(new Error(reason), { layer }); };
const requireThat = (test, reason, layer) => { if (!test) fail(reason, layer); };
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function fields(v, required, optional = []) {
  requireThat(object(v) && required.every(k => Object.hasOwn(v, k)) &&
    Object.keys(v).every(k => [...required, ...optional].includes(k)), 'INVALID_FIELDS');
}
const id = v => typeof v === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(v);
function canonicalPath(v) {
  return typeof v === 'string' && v.length > 0 && !/[\\:\x00-\x1f\x7f?#]/.test(v) &&
    !isAbsolute(v) && v.split('/').every(part => part !== '' && part !== '.' && part !== '..' &&
      !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}
function provenance(v) {
  return typeof v === 'string' && v.split('#').length <= 2 && canonicalPath(v.split('#')[0]) &&
    (!v.includes('#') || /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(v.split('#')[1]));
}
function parse(bytes, layer) {
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { fail('INVALID_JSON', layer); }
}
function validateIndex(v) {
  fields(v, ['schemaVersion', 'entries']);
  requireThat(v.schemaVersion === 1 && Array.isArray(v.entries), 'UNSUPPORTED_OR_INVALID_INDEX');
  const byId = new Map(), successors = new Map();
  for (const entry of v.entries) {
    fields(entry, ['id', 'path', 'sha256', 'provenance'], ['predecessor']);
    requireThat(id(entry.id) && !byId.has(entry.id), 'INVALID_OR_DUPLICATE_ID');
    requireThat(canonicalPath(entry.path), 'INVALID_PATH');
    requireThat(typeof entry.sha256 === 'string' && /^[0-9a-f]{64}$/.test(entry.sha256), 'INVALID_SHA256');
    requireThat(provenance(entry.provenance), 'INVALID_PROVENANCE');
    if (entry.predecessor !== undefined) {
      fields(entry.predecessor, ['id', 'relation']);
      requireThat(id(entry.predecessor.id) && ['RELOCATION', 'SUPERSESSION'].includes(entry.predecessor.relation), 'INVALID_PREDECESSOR');
      requireThat(!successors.has(entry.predecessor.id), 'AMBIGUOUS_SUCCESSOR');
      successors.set(entry.predecessor.id, entry.id);
    }
    byId.set(entry.id, entry);
  }
  for (const entry of v.entries) {
    const visited = new Set();
    let cursor = entry;
    while (cursor.predecessor) {
      requireThat(!visited.has(cursor.id), 'PREDECESSOR_CYCLE');
      visited.add(cursor.id);
      const parent = byId.get(cursor.predecessor.id);
      requireThat(parent, 'MISSING_PREDECESSOR');
      if (cursor.predecessor.relation === 'RELOCATION')
        requireThat(cursor.sha256 === parent.sha256 && cursor.path !== parent.path, 'INVALID_RELOCATION');
      cursor = parent;
    }
  }
  const locations = new Set();
  for (const entry of v.entries.filter(e => !successors.has(e.id))) {
    requireThat(!locations.has(entry.path.toLowerCase()), 'AMBIGUOUS_CURRENT_PATH');
    locations.add(entry.path.toLowerCase());
  }
  return { entries: v.entries, byId, successors };
}
function validateRegistry(v, width) {
  fields(v, ['schemaVersion', 'snapshots']);
  requireThat(v.schemaVersion === 1 && Array.isArray(v.snapshots), 'UNSUPPORTED_OR_INVALID_REGISTRY');
  const ids = new Set(), commits = new Set();
  for (const s of v.snapshots) {
    fields(s, ['id', 'commit', 'provenance']);
    requireThat(id(s.id) && !ids.has(s.id), 'INVALID_OR_DUPLICATE_SNAPSHOT_ID');
    requireThat(typeof s.commit === 'string' && new RegExp(`^[0-9a-f]{${width}}$`).test(s.commit), 'INVALID_COMMIT_ID');
    requireThat(!commits.has(s.commit) && provenance(s.provenance), 'INVALID_SNAPSHOT_ENTRY');
    ids.add(s.id); commits.add(s.commit);
  }
  return v.snapshots;
}
const stable = v => JSON.stringify(v, Object.keys(v).sort());
function sameEntry(a, b) {
  return a.id === b.id && a.path === b.path && a.sha256 === b.sha256 && a.provenance === b.provenance &&
    (a.predecessor?.id === b.predecessor?.id) && (a.predecessor?.relation === b.predecessor?.relation);
}
function safeBytes(root, path) {
  requireThat(canonicalPath(path), 'INVALID_PATH', 'path');
  let current = root;
  for (const part of path.split('/')) {
    const names = readdirSync(current);
    if (!names.includes(part)) {
      if (names.some(name => name.toLowerCase() === part.toLowerCase())) fail('CASE_MISMATCH', 'path');
      const error = new Error('MISSING'); error.code = 'ENOENT'; throw error;
    }
    current = resolve(current, part);
    requireThat(!lstatSync(current).isSymbolicLink(), 'SYMLINK_ALIAS', 'path');
    const resolved = realpathSync(current), rel = relative(root, resolved);
    requireThat(rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel), 'PATH_ESCAPE', 'path');
  }
  requireThat(lstatSync(current).isFile(), 'NOT_REGULAR_FILE', 'path');
  return readFileSync(current);
}

export function check(root = process.cwd()) {
  const results = [], diagnostics = [];
  let layer = 'repository';
  const git = args => execFileSync('git', ['--no-optional-locks', '-C', root, ...args],
    { encoding: null, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' } });
  const text = args => git(args).toString('utf8').trim();
  const blob = (commit, path) => git(['cat-file', 'blob', `${commit}:${path}`]);
  try {
    root = realpathSync(text(['rev-parse', '--show-toplevel']));
    const width = text(['rev-parse', '--show-object-format']) === 'sha256' ? 64 : 40;
    layer = 'current-registry';
    const currentRegistry = safeBytes(root, REGISTRY);
    const snapshots = validateRegistry(parse(currentRegistry, layer), width);
    layer = 'current-index';
    const currentIndex = safeBytes(root, INDEX);
    validateIndex(parse(currentIndex, layer));
    if (!snapshots.length) return { state: 'NO_ACCEPTED_SNAPSHOT', exitCode: 2,
      schemaValid: true, verification: 'NOT_PERFORMED', results, diagnostics };

    layer = 'designation';
    let publishedRegistry;
    try { publishedRegistry = blob('HEAD', REGISTRY); }
    catch { fail('DESIGNATION_NOT_COMMITTED', layer); }
    requireThat(currentRegistry.equals(publishedRegistry), 'WORKTREE_DESIGNATION_DIFFERS', layer);
    // HEAD supplies the published-history assertion, NEVER the accepted index.
    // Publication/human authorization cannot be proved by this mechanical check.
    const history = text(['rev-list', '--first-parent', '--reverse', 'HEAD']).split('\n');
    const registryHistory = new Map();
    let registrySeen = false;
    for (const commit of history) {
      let bytes;
      try { bytes = blob(commit, REGISTRY); }
      catch {
        requireThat(!registrySeen, 'HISTORICAL_REGISTRY_REMOVED', layer);
        continue;
      }
      registrySeen = true;
      const entries = validateRegistry(parse(bytes, 'designation-history'), width);
      requireThat(entries.length <= snapshots.length && entries.every((s, i) =>
        stable(s) === stable(snapshots[i])), 'REGISTRY_NOT_APPEND_ONLY', layer);
      registryHistory.set(commit, entries);
    }
    const previousEntries = new Map();
    let latestIndex;
    for (const snapshot of snapshots) {
      try {
        requireThat(text(['cat-file', '-t', snapshot.commit]) === 'commit', 'ANCHOR_NOT_COMMIT', 'anchor');
      } catch (error) {
        return { state: 'ANCHOR_UNAVAILABLE', exitCode: 1, reason: error.message, results, diagnostics };
      }
      let introduction;
      for (const commit of history) {
        const registry = registryHistory.get(commit);
        if (!registry) continue;
        const match = registry.find(s => s.id === snapshot.id);
        if (match) {
          requireThat(stable(match) === stable(snapshot), 'HISTORICAL_DESIGNATION_CHANGED', layer);
          introduction ??= commit;
        } else if (introduction) fail('HISTORICAL_DESIGNATION_REMOVED', layer);
      }
      requireThat(introduction && introduction !== snapshot.commit, 'NO_LATER_DESIGNATION', layer);
      const parents = text(['rev-list', '--parents', '-n', '1', introduction]).split(' ').slice(1);
      requireThat(parents.length === 1 && parents[0] === snapshot.commit, 'C2_NOT_CHILD_OF_C1', layer);
      const changes = text(['diff-tree', '--no-commit-id', '--name-only', '-r', snapshot.commit, introduction]);
      requireThat(changes === REGISTRY, 'C2_NOT_PURE_DESIGNATION', layer);
      let accepted;
      try { blob(snapshot.commit, snapshot.provenance.split('#')[0]); }
      catch { fail('DESIGNATION_PROVENANCE_NOT_IN_C1', layer); }
      try { accepted = validateIndex(parse(blob(snapshot.commit, INDEX), 'accepted-index')); }
      catch (error) { fail(error.message, 'accepted-index'); }
      for (const [identity, old] of previousEntries)
        requireThat(accepted.byId.has(identity) && sameEntry(old, accepted.byId.get(identity)), 'HISTORICAL_IDENTITY_CHANGED', 'accepted-index');
      for (const entry of accepted.entries) {
        if (!previousEntries.has(entry.id)) {
          const source = entry.provenance.split('#')[0];
          try { blob(snapshot.commit, source); }
          catch { fail('PROVENANCE_NOT_IN_SNAPSHOT', 'accepted-index'); }
          try { requireThat(digest(blob(snapshot.commit, entry.path)) === entry.sha256, 'SNAPSHOT_ARTIFACT_HASH_MISMATCH', 'accepted-index'); }
          catch (error) { fail(error.message, 'accepted-index'); }
        }
        previousEntries.set(entry.id, entry);
      }
      latestIndex = accepted;
    }
    requireThat(latestIndex.entries.length > 0, 'ACCEPTED_INDEX_EMPTY', 'accepted-index');
    const latest = snapshots.at(-1);
    if (!currentIndex.equals(blob(latest.commit, INDEX)))
      diagnostics.push({ result: 'INDEX_INVALID', layer: 'current-index', reason: 'DIFFERS_FROM_ACCEPTED_INDEX' });
    for (const entry of latestIndex.entries) {
      // Historical versions remain verified against their first accepted snapshot.
      // Relocated old paths or overwritten superseded versions are not forgotten.
      const successorId = latestIndex.successors.get(entry.id);
      const successor = latestIndex.byId.get(successorId);
      const currentLocationReused = latestIndex.entries.some(e => !latestIndex.successors.has(e.id) && e.path === entry.path);
      if (successor && (successor.predecessor.relation === 'RELOCATION' ||
        successor.path === entry.path || currentLocationReused)) {
        results.push({ id: entry.id, path: entry.path, result: 'PASS', scope: 'HISTORICAL_SNAPSHOT' });
        continue;
      }
      try {
        const actual = digest(safeBytes(root, entry.path));
        results.push({ id: entry.id, path: entry.path, result: actual === entry.sha256 ? 'PASS' : 'HASH_MISMATCH',
          scope: 'CURRENT_BYTES', expected: entry.sha256, actual });
      } catch (error) {
        results.push({ id: entry.id, path: entry.path,
          result: error.code === 'ENOENT' ? 'MISSING' : 'PATH_MISMATCH', reason: error.message });
      }
    }
    const passed = results.every(r => r.result === 'PASS') && diagnostics.length === 0;
    return { state: passed ? 'PASS' : diagnostics.length ? 'INDEX_INVALID' : results.find(r => r.result !== 'PASS').result,
      exitCode: passed ? 0 : 1,
      acceptedSnapshot: latest.commit, authority: 'NOT_ESTABLISHED_BY_CHECKER', results, diagnostics };
  } catch (error) {
    return { state: 'INDEX_INVALID', exitCode: 1, layer: error.layer ?? layer, reason: error.message, results, diagnostics };
  }
}
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url))) {
  if (process.argv.includes('--help')) {
    console.log('node scripts/check-frozen-identities.mjs [--root <repository>]\nExit 0 PASS; 2 NO_ACCEPTED_SNAPSHOT (valid preparation, NOT PASS); 1 failure. Read-only; no repair.');
  } else {
    const args = process.argv.slice(2);
    const valid = args.length === 0 || (args.length === 2 && args[0] === '--root');
    const report = valid ? check(args[1]) : { state: 'INDEX_INVALID', exitCode: 1, reason: 'INVALID_ARGUMENTS' };
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.exitCode;
  }
}
