const buckets = new Map();
module.exports = function rateLimit({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) { entry = { count: 0, resetAt: now + windowMs }; buckets.set(key, entry); }
    entry.count += 1;
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    if (entry.count > max) return res.status(429).json({ message: "Too many attempts. Please wait a little before trying again." });
    next();
  };
};
