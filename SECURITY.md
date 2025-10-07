# Security Features

This document describes the security measures implemented to prevent API abuse and protect your DeepSeek API balance.

## Features Overview

### 1. Rate Limiting

Prevents excessive requests from the same IP address.

**Default Settings:**

- **Window**: 1 minute
- **Max Requests**: 10 requests per minute per IP
- **Block Duration**: 15 minutes if limit exceeded

**How it works:**

- Tracks requests per IP address within a time window
- Automatically blocks IPs that exceed the limit
- Blocked IPs are temporarily prevented from making requests

### 2. Message Validation

Validates incoming chat messages to prevent abuse.

**Protections:**

- **Max Message Length**: 5,000 characters per message
- **Max History Length**: 20 messages in conversation history
- **Content Validation**: Detects suspicious patterns (repeated characters, spam)
- **Structure Validation**: Ensures proper message format

**Suspicious Pattern Detection:**

- Excessive repeated characters (e.g., "aaaaaaa..." > 50 chars)
- Excessive repeated words (same word > 50 times)

### 3. Usage Monitoring

Tracks and logs all API usage for monitoring and analysis.

**Logged Information:**

- Total daily requests
- Estimated token usage
- Unique IP addresses
- Blocked/suspicious requests
- Request duration

**Log Files:**

- `logs/usage.log` - All API requests
- `logs/suspicious.log` - Suspicious activities and blocked requests

## Configuration

### Adjusting Settings

Edit `config/security.config.js` to customize security settings:

```javascript
module.exports = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per window
    blockDuration: 15 * 60 * 1000, // 15 minutes block
  },
  message: {
    maxMessageLength: 5000, // Max chars per message
    maxMessagesInHistory: 20, // Max messages in history
  },
};
```

### Environment-Specific Settings

The config automatically adjusts based on `NODE_ENV`:

**Development Mode** (more lenient):

```bash
NODE_ENV=development npm start
```

**Production Mode** (stricter):

```bash
NODE_ENV=production npm start
```

## Admin API Endpoints

### Get Usage Statistics

```bash
GET /admin/stats
```

Returns daily usage statistics including total requests, estimated tokens, and unique IP count.

**Example Response:**

```json
{
  "date": "2025-10-07",
  "totalRequests": 142,
  "totalTokensEstimated": 25430,
  "uniqueIPCount": 8,
  "blockedRequests": 3
}
```

### Get Current Configuration

```bash
GET /admin/config
```

Returns current rate limiter configuration.

### Update Configuration

```bash
POST /admin/config
Content-Type: application/json

{
  "maxRequests": 5,
  "windowMs": 60000,
  "blockDuration": 1800000
}
```

### Block an IP Address

```bash
POST /admin/block-ip
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "durationMs": 3600000  // Optional, defaults to configured blockDuration
}
```

### Unblock an IP Address

```bash
POST /admin/unblock-ip
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

### Get Blocked IPs

```bash
GET /admin/blocked-ips
```

Returns list of currently blocked IP addresses.

**Example Response:**

```json
{
  "count": 2,
  "blockedIPs": [
    {
      "ip": "192.168.x.x",
      "blockedUntil": "2025-10-07T15:30:00.000Z",
      "remainingMinutes": 12
    }
  ]
}
```

## Error Responses

### Rate Limit Exceeded (429)

```json
{
  "data": null,
  "msg": "Too many requests. Please try again in 14 minutes.",
  "error": null,
  "serviceCode": 200
}
```

### Message Too Long (400)

```json
{
  "data": null,
  "msg": "Message at index 2 is too long. Maximum 5000 characters allowed.",
  "error": null,
  "serviceCode": 200
}
```

### Suspicious Content (400)

```json
{
  "data": null,
  "msg": "Suspicious content detected at index 1.",
  "error": null,
  "serviceCode": 200
}
```

## Monitoring Best Practices

1. **Check Daily Summaries**

   - Review `logs/usage.log` daily for usage patterns
   - Look for unusual spikes in requests or token usage

2. **Monitor Suspicious Activities**

   - Review `logs/suspicious.log` regularly
   - Investigate IPs that are frequently blocked

3. **Adjust Settings as Needed**

   - If legitimate users are getting blocked, increase rate limits
   - If you see abuse, decrease limits or block specific IPs

4. **Set Up Alerts** (Future Enhancement)
   - Configure alerts for high token usage
   - Get notified when many IPs are blocked

## Security Recommendations

### Production Environment

1. **Add Authentication to Admin Endpoints**

   ```javascript
   // Add authentication middleware
   router.get("/admin/stats", authMiddleware, admin.getStats);
   ```

2. **Use HTTPS**

   - Always use HTTPS in production
   - Configure SSL certificates

3. **Environment Variables**

   - Keep API keys in `.env` file
   - Never commit `.env` to version control

4. **Firewall Configuration**

   - Use reverse proxy (nginx) for additional security
   - Configure IP whitelisting if possible

5. **Regular Updates**
   - Keep dependencies updated
   - Monitor security vulnerabilities

### Additional Protection Layers

1. **API Key Authentication**

   - Require API keys from clients
   - Track usage per API key

2. **CORS Configuration**

   - Restrict allowed origins in production
   - Only allow your frontend domain

3. **Request Size Limits**
   - Already implemented via `koa-bodyparser`
   - Default limit should be sufficient

## Testing the Security Features

### Test Rate Limiting

```bash
# Send 11 requests quickly (11th should be blocked)
for i in {1..11}; do
  curl -X POST http://localhost:3000/chatMessage \
    -H "Content-Type: application/json" \
    -d '{"chatMessage":[{"role":"user","content":"test"}]}'
  echo "Request $i"
done
```

### Test Message Validation

```bash
# Too long message
curl -X POST http://localhost:3000/chatMessage \
  -H "Content-Type: application/json" \
  -d '{"chatMessage":[{"role":"user","content":"'$(python -c 'print("a"*6000)')'"}]}'

# Too many messages
curl -X POST http://localhost:3000/chatMessage \
  -H "Content-Type: application/json" \
  -d '{"chatMessage":['$(python -c 'print(",".join(["{\"role\":\"user\",\"content\":\"test\"}"]*25))')']}'
```

## Privacy Considerations

- IP addresses are **masked** in logs (e.g., `192.168.x.x`)
- Full IPs are kept in memory for rate limiting but not persisted
- Logs rotate to prevent unlimited growth

## Troubleshooting

### "Rate limit exceeded" for legitimate users

**Solution**: Increase `maxRequests` or `windowMs` in configuration:

```bash
curl -X POST http://localhost:3000/admin/config \
  -H "Content-Type: application/json" \
  -d '{"maxRequests": 20, "windowMs": 60000}'
```

### Admin endpoints not working

**Check**: Make sure you restarted the server after adding admin routes.

### Logs not being created

**Check**: Ensure the `logs/` directory exists and has write permissions:

```bash
mkdir -p logs
chmod 755 logs
```

## Future Enhancements

Consider implementing:

- [ ] Database-backed rate limiting for multi-server deployments
- [ ] JWT authentication for admin endpoints
- [ ] Real-time dashboard for monitoring
- [ ] Email alerts for suspicious activities
- [ ] API key management system
- [ ] Geographic IP blocking
- [ ] Machine learning-based anomaly detection

## Support

For issues or questions, check:

1. Application logs: `logs/error.*.log`
2. Usage logs: `logs/usage.log`
3. Suspicious activity logs: `logs/suspicious.log`

---

**Last Updated**: 2025-10-07
