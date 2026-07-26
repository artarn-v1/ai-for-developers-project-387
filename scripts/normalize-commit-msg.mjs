#!/usr/bin/env node
/**
 * Normalizes a commit message header into Conventional Commits format.
 *
 * Why this exists: the opencode GitHub Action generates the commit message
 * itself by asking the model to "Summarize the following in less than 40
 * characters" and feeding the raw reply straight into `git commit -m`.
 * That reply has no type/scope, so commitlint rejects it and the whole job
 * fails. This script rewrites such a header deterministically so the commit
 * always lands, while leaving already-valid headers untouched.
 *
 * Usage: node scripts/normalize-commit-msg.mjs <path-to-COMMIT_EDITMSG>
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const TYPES = [
  'feat',
  'fix',
  'chore',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'ci',
  'build',
  'revert',
];

// Mirrors scope-enum in commitlint.config.js.
const SCOPES = [
  'backend',
  'frontend',
  'api',
  'tests',
  'infra',
  'deps',
  'release',
  'main',
];

// Mirrors header-max-length in commitlint.config.js.
const HEADER_MAX_LENGTH = 72;

const FALLBACK_TYPE = 'chore';
const FALLBACK_SCOPE = 'main';
const FALLBACK_SUBJECT = 'apply automated changes';

const CONVENTIONAL_HEADER = new RegExp(
  `^(${TYPES.join('|')})(\\((${SCOPES.join('|')})\\))?!?: .+`,
);

// git's own generated messages. commitlint skips these via defaultIgnores,
// so we must not touch them either.
const GIT_GENERATED_HEADER = /^(Merge\b|Revert\b|fixup!|squash!|amend!)/;

const API_PATHS = [
  'apis/',
  'models/',
  'main.tsp',
  'tspconfig.yaml',
  'frontend/src/types/api.ts',
];

const INFRA_PATHS = [
  '.github/',
  '.husky/',
  'scripts/',
  'Dockerfile',
  'docker-compose.yml',
  'nginx.conf.template',
  'entrypoint.sh',
  'Makefile',
];

const DEPS_PATHS = [
  'package-lock.json',
  'frontend/package-lock.json',
  'tests/package-lock.json',
  'backend/go.sum',
  'backend/go.mod',
];

/** @param {string} file */
function scopeForFile(file) {
  // Checked before the frontend/backend prefixes: generated API types live
  // under frontend/, and go.mod/go.sum live under backend/.
  if (API_PATHS.some((p) => file === p || file.startsWith(p))) return 'api';
  if (DEPS_PATHS.includes(file)) return 'deps';
  if (INFRA_PATHS.some((p) => file === p || file.startsWith(p))) return 'infra';
  if (file.startsWith('frontend/')) return 'frontend';
  if (file.startsWith('backend/')) return 'backend';
  if (file.startsWith('tests/')) return 'tests';
  return null;
}

function stagedFiles() {
  try {
    return execFileSync(
      'git',
      ['diff', '--cached', '--name-only', '--diff-filter=ACMRD'],
      { encoding: 'utf8' },
    )
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function inferScope() {
  const scopes = new Set();
  for (const file of stagedFiles()) {
    const scope = scopeForFile(file);
    if (scope) scopes.add(scope);
    else return FALLBACK_SCOPE; // unrecognised path -> don't guess
  }
  // Zero scopes (nothing staged) or several at once -> no single owner.
  return scopes.size === 1 ? [...scopes][0] : FALLBACK_SCOPE;
}

/** @param {string} raw */
function normalizeSubject(raw) {
  let subject = raw.trim().replace(/^["'`]+|["'`]+$/g, '');
  subject = subject.replace(/[.\s]+$/, '');
  if (!subject) return FALLBACK_SUBJECT;
  // Lowercase a plain leading word, but keep acronyms and identifiers intact
  // (e.g. "API returns 500" must not become "aPI returns 500").
  const firstWord = subject.split(/\s/, 1)[0];
  if (!/[A-Z]/.test(firstWord.slice(1))) {
    subject = subject[0].toLowerCase() + subject.slice(1);
  }
  return subject;
}

/** @param {string} header @param {number} max */
function truncate(header, max) {
  if (header.length <= max) return header;
  const cut = header.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  // Only break on a word boundary if it leaves a usable subject.
  return lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
}

function main() {
  const messagePath = process.argv[2];
  if (!messagePath) {
    console.error('normalize-commit-msg: missing path to commit message file');
    process.exit(1);
  }

  const original = readFileSync(messagePath, 'utf8');
  const lines = original.split('\n');
  const headerIndex = lines.findIndex(
    (line) => line.trim() !== '' && !line.startsWith('#'),
  );
  if (headerIndex === -1) return; // empty message: let git/commitlint complain

  const header = lines[headerIndex].trim();
  if (CONVENTIONAL_HEADER.test(header)) return; // already valid, stay idempotent
  if (GIT_GENERATED_HEADER.test(header)) return; // merge/revert/fixup

  const prefix = `${FALLBACK_TYPE}(${inferScope()}): `;
  const subject = normalizeSubject(header);
  const rewritten = truncate(prefix + subject, HEADER_MAX_LENGTH);

  lines[headerIndex] = rewritten;
  writeFileSync(messagePath, lines.join('\n'));
  console.log(`normalize-commit-msg: rewrote header to "${rewritten}"`);
}

main();
