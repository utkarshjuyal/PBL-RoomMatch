const buckets = new Map();

// key: optional (req) => string. Defaults to ip + route. Use it to limit per email.
module.exports = function rateLimit({ windowMs = 15 * 60 * 1000, max = 10, key } = {}) {
  return (req, res, next) => {
    const bucketKey = key ? `${req.baseUrl}${req.path}:${key(req)}` : `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    let entry = buckets.get(bucketKey);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(bucketKey, entry);
    }
    entry.count += 1;
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      return res.status(429).json({ message: "Too many attempts. Please wait a little before trying again." });
    }
    next();
  };
};

// Stop the map growing forever.
setInterval(() => {
  const now = Date.now();
  for (const [k, entry] of buckets) if (entry.resetAt <= now) buckets.delete(k);
}, 60 * 1000).unref();
