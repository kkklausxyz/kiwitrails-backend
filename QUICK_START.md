# Quick Start - Security Features

## 🛡️ 已实施的安全措施

### 1. 请求频率限制 (Rate Limiting)

- **默认限制**: 每个 IP 每分钟最多 10 个请求
- **超限惩罚**: 自动封锁 IP 15 分钟
- **保护目标**: 防止恶意刷请求消耗 API 余额

### 2. 消息验证 (Message Validation)

- **单条消息**: 最多 5000 字符
- **历史记录**: 最多 20 条消息
- **内容检测**: 自动识别垃圾内容和重复字符

### 3. 使用量监控 (Usage Monitoring)

- **实时统计**: 每日请求数、Token 估算、独立 IP 数
- **日志记录**: 保存在 `logs/` 文件夹
- **异常警报**: 自动记录可疑活动

## 🚀 快速开始

### 1. 启动服务器

```bash
npm start
```

### 2. 测试安全功能

```bash
node test-security.js
```

### 3. 查看使用统计

```bash
curl http://localhost:3000/admin/stats
```

## 📊 管理接口

### 查看今日统计

```bash
GET http://localhost:3000/admin/stats
```

### 查看被封锁的 IP

```bash
GET http://localhost:3000/admin/blocked-ips
```

### 手动封锁 IP

```bash
POST http://localhost:3000/admin/block-ip
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "durationMs": 3600000
}
```

### 解封 IP

```bash
POST http://localhost:3000/admin/unblock-ip
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

### 调整限制配置

```bash
POST http://localhost:3000/admin/config
Content-Type: application/json

{
  "maxRequests": 20,
  "windowMs": 60000,
  "blockDuration": 900000
}
```

## ⚙️ 自定义配置

编辑 `config/security.config.js`:

```javascript
module.exports = {
  rateLimit: {
    windowMs: 60 * 1000, // 时间窗口（毫秒）
    maxRequests: 10, // 窗口内最大请求数
    blockDuration: 15 * 60 * 1000, // 封锁时长（毫秒）
  },
  message: {
    maxMessageLength: 5000, // 单条消息最大字符数
    maxMessagesInHistory: 20, // 历史消息最大条数
  },
};
```

## 📝 日志文件

### `logs/usage.log` - 使用记录

记录所有请求和每日统计摘要

### `logs/suspicious.log` - 可疑活动

记录被拦截的请求和异常行为

### `logs/error.*.log` - 错误日志

记录系统错误和异常

## 🔒 生产环境建议

### 1. 添加管理接口认证

```javascript
// 在 router.js 中添加认证中间件
router.get("/admin/stats", authMiddleware, admin.getStats);
```

### 2. 更严格的限制

```bash
NODE_ENV=production npm start
```

生产模式会自动应用更严格的限制：

- 每分钟最多 5 个请求
- 封锁时长 30 分钟
- 更短的消息长度限制

### 3. 配置 HTTPS

确保在生产环境使用 SSL/TLS 加密

### 4. 使用反向代理

推荐使用 Nginx 作为反向代理，提供额外的安全层

## 🧪 测试示例

### 正常请求

```bash
curl -X POST http://localhost:3000/chatMessage \
  -H "Content-Type: application/json" \
  -d '{"chatMessage":[{"role":"user","content":"Hello"}]}'
```

### 触发频率限制

```bash
for i in {1..15}; do
  curl -X POST http://localhost:3000/chatMessage \
    -H "Content-Type: application/json" \
    -d '{"chatMessage":[{"role":"user","content":"test"}]}'
  echo "Request $i"
done
```

## 📈 监控建议

1. **每天检查日志**

   ```bash
   tail -f logs/usage.log
   tail -f logs/suspicious.log
   ```

2. **监控每日统计**

   - 查看 Token 使用趋势
   - 识别异常流量模式

3. **根据实际情况调整**
   - 如果正常用户被误封，适当放宽限制
   - 如果发现滥用，收紧限制

## ❓ 常见问题

### Q: 为什么正常用户被封锁了？

A: 可能是限制太严格。使用管理接口调整 `maxRequests` 参数：

```bash
curl -X POST http://localhost:3000/admin/config \
  -H "Content-Type: application/json" \
  -d '{"maxRequests": 20}'
```

### Q: 如何查看是哪个 IP 在滥用？

A: 查看 `logs/suspicious.log` 文件，里面记录了所有被拦截的请求

### Q: 服务器重启后封锁记录会丢失吗？

A: 是的，当前封锁记录保存在内存中。重启后会清空。如需持久化，可以考虑使用数据库。

### Q: 如何完全禁用某些限制？

A: 编辑 `config/security.config.js`，设置非常高的限制值，或者在 `app.js` 中注释掉相应的中间件。

## 🎯 效果预期

实施这些安全措施后，你可以：

✅ 防止单个 IP 快速刷请求  
✅ 拒绝超长消息，节省 Token  
✅ 检测并阻止垃圾内容  
✅ 实时监控 API 使用量  
✅ 快速响应异常流量  
✅ 自动保护 DeepSeek 余额

## 📞 需要帮助？

查看详细文档: `SECURITY.md`

---

**最后更新**: 2025-10-07
