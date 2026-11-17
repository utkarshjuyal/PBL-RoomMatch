const test = require("node:test");
const assert = require("node:assert/strict");
const { reminderDueBefore, isReminderEligible, formatRelativeTime } = require("../src/services/savedReminderPolicy");

const now = new Date("2026-11-17T12:00:00.000Z").getTime();
const savedAt = new Date(now - 4 * 60 * 1000).toISOString();

test("save timestamp remains the source of reminder age", () => {
  const record = { createdAt: savedAt };
  assert.equal(new Date(record.createdAt).toISOString(), savedAt);
  assert.equal(isReminderEligible(record, now, 5), false);
});

test("a reminder is not eligible before the configured threshold", () => {
  assert.equal(isReminderEligible({ createdAt: savedAt }, now, 5), false);
});

test("a reminder becomes eligible after five minutes", () => {
  const record = { createdAt: new Date(now - 5 * 60 * 1000).toISOString() };
  assert.equal(isReminderEligible(record, now, 5), true);
});

test("relative time is computed from the actual timestamp", () => {
  assert.equal(formatRelativeTime(new Date(now - 5 * 60 * 1000), now), "5 minutes");
  assert.equal(formatRelativeTime(new Date(now - 2 * 60 * 60 * 1000), now), "2 hours");
});

test("a dismissed reminder cannot appear again", () => {
  assert.equal(isReminderEligible({ createdAt: new Date(now - 10 * 60 * 1000), reminderDismissedAt: new Date(now) }, now, 5), false);
});

test("a reminder already marked as shown cannot repeat", () => {
  assert.equal(isReminderEligible({ createdAt: new Date(now - 10 * 60 * 1000), reminderShownAt: new Date(now) }, now, 5), false);
});

test("removed properties have no saved record and are not eligible", () => {
  assert.equal(isReminderEligible(null, now, 5), false);
});

test("resaving creates a fresh eligibility timestamp", () => {
  const firstSave = { createdAt: new Date(now - 10 * 60 * 1000) };
  const secondSave = { createdAt: new Date(now) };
  assert.equal(isReminderEligible(firstSave, now, 5), true);
  assert.equal(isReminderEligible(secondSave, now, 5), false);
});

test("configured interval is applied to the atomic database cutoff", () => {
  assert.equal(reminderDueBefore(now, 5).getTime(), now - 5 * 60 * 1000);
  assert.equal(reminderDueBefore(now, 10).getTime(), now - 10 * 60 * 1000);
});
