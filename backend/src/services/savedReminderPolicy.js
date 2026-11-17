function reminderDueBefore(now = Date.now(), minutes = 5) {
  return new Date(Number(now) - Math.max(1, Number(minutes) || 5) * 60 * 1000);
}

function isReminderEligible(savedRecord, now = Date.now(), minutes = 5) {
  if (!savedRecord || savedRecord.reminderShownAt || savedRecord.reminderDismissedAt) return false;
  const createdAt = new Date(savedRecord.createdAt).getTime();
  return Number.isFinite(createdAt) && createdAt <= reminderDueBefore(now, minutes).getTime();
}

function formatRelativeTime(dateValue, now = Date.now()) {
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return "a while";
  const seconds = Math.max(0, Math.floor((Number(now) - timestamp) / 1000));
  if (seconds < 60) return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

module.exports = { reminderDueBefore, isReminderEligible, formatRelativeTime };
