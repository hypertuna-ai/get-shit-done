/**
 * Quick task branching tests
 *
 * Validates that /gsd-quick exposes branch_name from init and that the
 * workflow checks out a dedicated quick-task branch when configured.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('quick workflow: branching support', () => {
  const workflowPath = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'quick.md');
  let content;

  test('workflow file exists', () => {
    assert.ok(fs.existsSync(workflowPath), 'workflows/quick.md should exist');
  });

  test('init parse list includes branch_name', () => {
    content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('branch_name'), 'quick workflow should parse branch_name from init JSON');
  });

  test('workflow includes quick-task branching step', () => {
    content = fs.readFileSync(workflowPath, 'utf-8');
    assert.ok(content.includes('Step 2.5: Handle quick-task branching'));
    // Branching block must (a) honour the existing branch if present and
    // (b) create new branches off origin/HEAD, not current HEAD (#2916).
    assert.ok(
      content.includes('git switch "$branch_name"'),
      'should reuse existing branch via git switch'
    );
    assert.ok(
      content.includes('refs/remotes/origin/HEAD'),
      'should detect default branch from origin/HEAD instead of branching off current HEAD'
    );
    assert.ok(
      content.includes('git checkout -b "$branch_name"'),
      'should create new branch via git checkout -b after switching to default'
    );
  });

  test('branching step runs before task directory creation', () => {
    content = fs.readFileSync(workflowPath, 'utf-8');
    const branchingIndex = content.indexOf('Step 2.5: Handle quick-task branching');
    const createDirIndex = content.indexOf('Step 3: Create task directory');
    assert.ok(branchingIndex !== -1 && createDirIndex !== -1, 'workflow should contain both branching and directory steps');
    assert.ok(branchingIndex < createDirIndex, 'branching should happen before quick task directories and commits');
  });
});
