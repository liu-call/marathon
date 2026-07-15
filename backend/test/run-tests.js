/**
 * 综合测试脚本
 * 1. 启动 mongodb-memory-server
 * 2. 启动 NestJS 应用
 * 3. 直接在 DB 创建测试用户 + 生成 JWT
 * 4. 通过 HTTP 请求测试所有端点
 * 5. 输出测试报告
 */
const { MongoMemoryServer } = require('mongodb-memory-server')
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { spawn } = require('child_process')
const http = require('http')

const JWT_SECRET = 'test-secret-for-marathon'
const BASE_URL = 'http://localhost:3001'

// 测试结果收集
const results = { passed: [], failed: [], warnings: [] }
let passedCount = 0, failedCount = 0

function log(msg) { console.log(`  ${msg}`) }
function pass(name) { passedCount++; results.passed.push(name); console.log(`  \x1b[32m✓\x1b[0m ${name}`) }
function fail(name, err) { failedCount++; results.failed.push({ name, err }); console.log(`  \x1b[31m✗\x1b[0m ${name}: ${err}`) }
function warn(name, msg) { results.warnings.push({ name, msg }); console.log(`  \x1b[33m!\x1b[0m ${name}: ${msg}`) }

/** HTTP 请求封装 */
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const headers = { 'Content-Type': 'application/json' }
    if (data) headers['Content-Length'] = Buffer.byteLength(data)
    if (token) headers['Authorization'] = `Bearer ${token}`

    const req = http.request(`${BASE_URL}/api${path}`, { method, headers }, (res) => {
      let chunks = ''
      res.on('data', (c) => (chunks += c))
      res.on('end', () => {
        let parsed
        try { parsed = chunks ? JSON.parse(chunks) : {} } catch { parsed = chunks }
        resolve({ status: res.statusCode, body: parsed, raw: chunks })
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

/** 等待服务启动 */
function waitForServer(maxRetries = 30) {
  return new Promise((resolve, reject) => {
    let retries = 0
    const check = () => {
      http.get(`${BASE_URL}/api/health`, (res) => {
        if (res.statusCode === 200) { resolve(); return }
        if (++retries >= maxRetries) reject(new Error('Server did not start'))
        else setTimeout(check, 500)
      }).on('error', () => {
        if (++retries >= maxRetries) reject(new Error('Server did not start'))
        else setTimeout(check, 500)
      })
    }
    check()
  })
}

async function main() {
  console.log('\n━━━ 启动测试环境 ━━━')

  // 1. 启动内存 MongoDB
  console.log('▶ 启动 mongodb-memory-server...')
  const mongod = await MongoMemoryServer.create()
  const mongoUri = mongod.getUri()
  console.log(`  MongoDB URI: ${mongoUri}`)

  // 2. 创建测试用户
  const client = await MongoClient.connect(mongoUri)
  const db = client.db('marathon')
  const userId = new mongoose.Types.ObjectId()
  await db.collection('users').insertOne({
    _id: userId,
    openid: 'test-openid-001',
    nickName: '测试跑者',
    avatarUrl: '',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  // 也创建一个 admin 用户
  const adminId = new mongoose.Types.ObjectId()
  await db.collection('users').insertOne({
    _id: adminId,
    openid: 'test-admin-001',
    nickName: '管理员',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  await client.close()

  // 3. 生成 JWT token
  const userToken = jwt.sign(
    { userId: userId.toString(), openid: 'test-openid-001', role: 'user' },
    JWT_SECRET,
  )
  const adminToken = jwt.sign(
    { userId: adminId.toString(), openid: 'test-admin-001', role: 'admin' },
    JWT_SECRET,
  )

  // 4. 启动 NestJS 应用
  console.log('▶ 启动 NestJS 应用...')
  const app = spawn('node', ['dist/main.js'], {
    env: {
      ...process.env,
      MONGO_URI: mongoUri,
      JWT_SECRET,
      JWT_EXPIRES_IN: '7d',
      PORT: '3001',
      LLM_API_KEY: 'fake-key-for-test',
      LLM_API_URL: 'https://open.bigmodel.cn/api/paas/v4',
      LLM_MODEL: 'glm-4',
      LLM_VISION_MODEL: 'glm-4v',
      WX_APPID: 'fake-appid',
      WX_SECRET: 'fake-secret',
      COS_BUCKET: 'test-bucket',
      COS_REGION: 'ap-guangzhou',
      COS_SECRET_ID: 'fake-id',
      COS_SECRET_KEY: 'fake-key',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  app.stdout.on('data', (d) => {
    const s = d.toString().trim()
    if (s) process.stdout.write(`  [app] ${s}\n`)
  })
  app.stderr.on('data', (d) => {
    const s = d.toString().trim()
    if (s) process.stderr.write(`  \x1b[31m[app:err]\x1b[0m ${s}\n`)
  })

  try {
    await waitForServer()
    console.log('  服务已启动\n')

    // ============================
    // 测试开始
    // ============================
    console.log('━━━ 1. 健康检查 ━━━')
    {
      const r = await request('GET', '/health')
      if (r.status === 200 && r.body.status === 'ok') pass('GET /health 返回 ok')
      else fail('GET /health', `status=${r.status}, body=${JSON.stringify(r.body)}`)
    }

    console.log('\n━━━ 2. 认证：无 token 应被拒绝 ━━━')
    {
      const r = await request('GET', '/races')
      if (r.status === 401) pass('无 token 访问 /races 返回 401')
      else fail('无 token 访问 /races', `期望 401，实际 ${r.status}`)
    }

    console.log('\n━━━ 3. 赛事模块 ━━━')
    let raceId
    {
      // 创建赛事
      const r1 = await request('POST', '/races', {
        raceName: '北京马拉松',
        raceDate: '2026-09-17',
        raceType: '全程马拉松',
        raceLocation: '北京',
        raceDistance: 42.195,
        registrationOpenDate: '2026-07-01',
        registrationCloseDate: '2026-07-20',
        lotteryDate: '2026-07-25',
        lotteryResultDate: '2026-07-28',
        bibNumber: 'A1234',
        status: '已报名',
        notes: '金标赛事',
      }, userToken)
      if (r1.status === 201 && r1.body._id) { raceId = r1.body._id; pass('POST /races 创建赛事') }
      else fail('POST /races 创建赛事', `status=${r1.status}, body=${JSON.stringify(r1.body)}`)

      // 创建第二场赛事
      await request('POST', '/races', {
        raceName: '上海马拉松',
        raceDate: '2026-11-29',
        raceType: '全程马拉松',
        raceLocation: '上海',
        raceDistance: 42.195,
        status: '待报名',
      }, userToken)

      // 列表
      const r2 = await request('GET', '/races', null, userToken)
      if (r2.status === 200 && r2.body.total === 2) pass('GET /races 列表返回 2 条')
      else fail('GET /races 列表', `total=${r2.body.total}, status=${r2.status}`)

      // 详情
      const r3 = await request('GET', `/races/${raceId}`, null, userToken)
      if (r3.status === 200 && r3.body.raceName === '北京马拉松') pass('GET /races/:id 详情')
      else fail('GET /races/:id 详情', `status=${r3.status}`)

      // 更新
      const r4 = await request('PUT', `/races/${raceId}`, { status: '已中签' }, userToken)
      if (r4.status === 200 && r4.body.status === '已中签') pass('PUT /races/:id 更新状态')
      else fail('PUT /races/:id 更新', `status=${r4.status}, body=${JSON.stringify(r4.body)}`)

      // 即将开跑
      const r5 = await request('GET', '/races/upcoming', null, userToken)
      if (r5.status === 200 && Array.isArray(r5.body)) pass('GET /races/upcoming 即将开跑')
      else fail('GET /races/upcoming', `status=${r5.status}`)

      // 筛选
      const r6 = await request('GET', '/races?status=已中签', null, userToken)
      if (r6.status === 200 && r6.body.total === 1) pass('GET /races?status=已中签 筛选')
      else fail('GET /races 筛选', `total=${r6.body.total}`)

      // 删除
      const r7 = await request('DELETE', `/races/${raceId}`, null, userToken)
      if (r7.status === 200) pass('DELETE /races/:id 删除')
      else fail('DELETE /races/:id', `status=${r7.status}`)

      // 验证删除后只剩 1 条
      const r8 = await request('GET', '/races', null, userToken)
      if (r8.body.total === 1) pass('删除后赛事列表剩 1 条')
      else fail('删除后验证', `total=${r8.body.total}`)
    }

    console.log('\n━━━ 4. 成绩模块（含 PB 计算）━━━')
    let resultId
    {
      // 创建第一场成绩（应为 PB）
      const r1 = await request('POST', '/results', {
        raceName: '北京马拉松',
        raceDate: '2026-09-17',
        raceDistance: 42.195,
        raceType: '全程马拉松',
        finishTime: '03:45:22',
        gunTime: '03:46:01',
        netTime: '03:45:22',
        overallRanking: 5000,
        pace: '05:20',
        weather: '晴 18℃',
        bibNumber: 'A1234',
        notes: '后半程掉速',
        splits: [{ km: 5, time: '00:26:30' }, { km: 10, time: '00:53:10' }],
      }, userToken)
      if (r1.status === 201 && r1.body._id) {
        resultId = r1.body._id
        if (r1.body.isPB === true) pass('POST /results 创建成绩，自动标记为 PB')
        else fail('POST /results PB 标记', `isPB=${r1.body.isPB}`)
      } else fail('POST /results 创建成绩', `status=${r1.status}, body=${JSON.stringify(r1.body)}`)

      // 创建第二场更快的成绩（应成为新 PB，旧的取消）
      const r2 = await request('POST', '/results', {
        raceName: '上海马拉松',
        raceDate: '2026-11-29',
        raceDistance: 42.195,
        raceType: '全程马拉松',
        finishTime: '03:32:15',
        pace: '05:01',
      }, userToken)
      if (r2.status === 201 && r2.body.isPB === true) pass('POST /results 创建更快成绩，新 PB')
      else fail('POST /results 新 PB', `isPB=${r2.body.isPB}`)

      // 验证旧的 PB 已取消
      const r3 = await request('GET', `/results/${resultId}`, null, userToken)
      if (r3.body.isPB === false) pass('旧成绩 PB 标记已被取消')
      else fail('旧 PB 取消', `isPB=${r3.body.isPB}`)

      // 创建半马成绩
      await request('POST', '/results', {
        raceName: '杭州半马',
        raceDate: '2026-11-03',
        raceDistance: 21.0975,
        raceType: '半程马拉松',
        finishTime: '01:38:20',
        pace: '04:39',
      }, userToken)

      // 获取 PB
      const r4 = await request('GET', '/results/pb', null, userToken)
      if (r4.status === 200 && r4.body.fullMarathon?.finishTime === '03:32:15') pass('GET /results/pb 全马 PB 正确')
      else fail('GET /results/pb', `body=${JSON.stringify(r4.body)}`)

      // 成绩列表
      const r5 = await request('GET', '/results', null, userToken)
      if (r5.body.total === 3) pass('GET /results 列表返回 3 条')
      else fail('GET /results 列表', `total=${r5.body.total}`)

      // 汇总
      const r6 = await request('GET', '/results/summary', null, userToken)
      if (r6.status === 200 && r6.body.totalRaces === 3) pass('GET /results/summary 汇总')
      else fail('GET /results/summary', `body=${JSON.stringify(r6.body)}`)
    }

    console.log('\n━━━ 5. 花费模块 ━━━')
    {
      const r1 = await request('POST', '/expenses', {
        raceName: '北京马拉松',
        raceDate: '2026-09-17',
        expenses: {
          registrationFee: 200,
          accommodation: 1360,
          transportation: 1800,
          food: 500,
          gear: 300,
          other: 200,
        },
      }, userToken)
      if (r1.status === 201 && r1.body.totalAmount === 4360) pass('POST /expenses 创建花费，totalAmount=4360')
      else fail('POST /expenses', `status=${r1.status}, total=${r1.body.totalAmount}`)

      // 更新（upsert）
      const r2 = await request('POST', '/expenses', {
        raceId: r1.body.raceId,
        raceName: '北京马拉松',
        raceDate: '2026-09-17',
        expenses: {
          registrationFee: 200,
          accommodation: 1500,
          transportation: 1800,
          food: 600,
          gear: 300,
          other: 200,
        },
      }, userToken)
      if (r2.body.totalAmount === 4600) pass('POST /expenses upsert 更新花费')
      else fail('POST /expenses upsert', `total=${r2.body.totalAmount}`)

      // 年度汇总
      const r3 = await request('GET', '/expenses/summary?year=2026', null, userToken)
      if (r3.status === 200 && r3.body.totalAmount === 4600) pass('GET /expenses/summary 年度汇总')
      else fail('GET /expenses/summary', `body=${JSON.stringify(r3.body)}`)

      // 列表
      const r4 = await request('GET', '/expenses', null, userToken)
      if (r4.body.total === 1) pass('GET /expenses 列表返回 1 条')
      else fail('GET /expenses', `total=${r4.body.total}`)
    }

    console.log('\n━━━ 6. 酒店模块 ━━━')
    {
      const r1 = await request('POST', '/hotels', {
        raceName: '北京马拉松',
        raceId: '507f1f77bcf86cd799439011',
        hotelName: '如家酒店',
        checkInDate: '2026-09-16',
        checkOutDate: '2026-09-18',
        price: 680,
        distanceToStart: '1.5km',
        address: '北京朝阳区',
      }, userToken)
      if (r1.status === 201 && r1.body.nights === 2 && r1.body.totalPrice === 1360) pass('POST /hotels 创建酒店，自动计算 nights=2, totalPrice=1360')
      else fail('POST /hotels', `status=${r1.status}, nights=${r1.body.nights}, total=${r1.body.totalPrice}`)

      const r2 = await request('GET', '/hotels', null, userToken)
      if (r2.body.total === 1) pass('GET /hotels 列表')
      else fail('GET /hotels', `total=${r2.body.total}`)
    }

    console.log('\n━━━ 7. 年度报告模块 ━━━')
    {
      const r1 = await request('POST', '/reports/annual', { year: 2026 }, userToken)
      if (r1.status === 201 && r1.body.summary?.totalRaces === 3) pass('POST /reports/annual 生成报告，totalRaces=3')
      else if (r1.status === 201) warn('POST /reports/annual', `totalRaces=${r1.body.summary?.totalRaces}`)
      else fail('POST /reports/annual', `status=${r1.status}, body=${JSON.stringify(r1.body).slice(0, 200)}`)

      const r2 = await request('GET', '/reports/annual/2026', null, userToken)
      if (r2.status === 200) pass('GET /reports/annual/2026 获取报告')
      else fail('GET /reports/annual/2026', `status=${r2.status}`)

      const r3 = await request('GET', '/reports', null, userToken)
      if (r3.status === 200 && Array.isArray(r3.body)) pass('GET /reports 历史报告列表')
      else fail('GET /reports', `status=${r3.status}`)
    }

    console.log('\n━━━ 8. 资讯模块 ━━━')
    {
      // 普通用户创建应被拒（应返回 403）
      const r1 = await request('POST', '/news', { title: '测试资讯', publishDate: '2026-07-15' }, userToken)
      if (r1.status === 403) pass('POST /news 普通用户被拒返回 403')
      else fail('POST /news 权限校验', `期望 403，实际 ${r1.status}`)

      // 普通用户访问待审核列表应返回 403
      const r1b = await request('GET', '/news/admin/pending', null, userToken)
      if (r1b.status === 403) pass('GET /news/admin/pending 普通用户返回 403')
      else fail('GET /news/admin/pending 权限', `期望 403，实际 ${r1b.status}`)

      // 管理员创建
      const r2 = await request('POST', '/news', {
        title: '2026 北京马拉松报名开启',
        source: '官方公众号',
        content: '正文内容',
        raceName: '北京马拉松',
        publishDate: '2026-07-01',
        tags: ['全马', '北京'],
        isOfficial: true,
      }, adminToken)
      if (r2.status === 201) pass('POST /news 管理员创建资讯')
      else fail('POST /news', `status=${r2.status}, body=${JSON.stringify(r2.body)}`)

      // 管理员访问待审核列表
      const r2b = await request('GET', '/news/admin/pending', null, adminToken)
      if (r2b.status === 200) pass('GET /news/admin/pending 管理员可访问')
      else fail('GET /news/admin/pending', `status=${r2b.status}`)

      const r3 = await request('GET', '/news', null, userToken)
      if (r3.status === 200 && r3.body.total === 1) pass('GET /news 资讯列表')
      else fail('GET /news', `total=${r3.body.total}`)
    }

    console.log('\n━━━ 9. 订阅消息模块 ━━━')
    {
      const r1 = await request('POST', '/notify/subscribe', {
        templateId: 'fake-template-id',
      }, userToken)
      if (r1.status === 201) pass('POST /notify/subscribe 记录订阅')
      else fail('POST /notify/subscribe', `status=${r1.status}, body=${JSON.stringify(r1.body)}`)
    }

    console.log('\n━━━ 10. 输入校验 ━━━')
    {
      // 缺少必填字段
      const r1 = await request('POST', '/races', { raceName: '无日期赛事' }, userToken)
      if (r1.status === 400) pass('POST /races 缺少 raceDate 返回 400')
      else fail('POST /races 校验', `status=${r1.status}（应返回 400）`)

      // 无效字段
      const r2 = await request('POST', '/races', {
        raceName: '测试',
        raceDate: '2026-09-17',
        raceDistance: '不是数字',
      }, userToken)
      if (r2.status === 400) pass('POST /races raceDistance 非数字返回 400')
      else fail('POST /races 类型校验', `status=${r2.status}`)
    }

    console.log('\n━━━ 11. 数据隔离 ━━━')
    {
      // 创建另一个用户的 token
      const otherUserId = new mongoose.Types.ObjectId()
      const otherToken = jwt.sign(
        { userId: otherUserId.toString(), openid: 'other-user', role: 'user' },
        JWT_SECRET,
      )
      // 另一用户不应能看到原用户的赛事
      const r1 = await request('GET', '/races', null, otherToken)
      if (r1.status === 200 && r1.body.total === 0) pass('数据隔离：其他用户赛事列表为空')
      else fail('数据隔离', `其他用户看到 ${r1.body.total} 条`)
    }

    console.log('\n━━━ 12. AI 解析端点（无 API key，应优雅失败）━━━')
    {
      const r1 = await request('POST', '/races/parse-text', { text: '我报名了北京马拉松，9月17日比赛' }, userToken)
      if (r1.status === 502 && r1.body.message) pass('POST /races/parse-text 返回 502 + 友好消息')
      else fail('POST /races/parse-text 错误处理', `status=${r1.status}, body=${JSON.stringify(r1.body).slice(0, 100)}`)
    }

    // ============================
    // 测试报告
    // ============================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('         测试报告')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  \x1b[32m通过: ${passedCount}\x1b[0m`)
    console.log(`  \x1b[31m失败: ${failedCount}\x1b[0m`)
    console.log(`  \x1b[33m警告: ${results.warnings.length}\x1b[0m`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (results.failed.length > 0) {
      console.log('失败详情:')
      results.failed.forEach((f) => console.log(`  - ${f.name}: ${f.err}`))
      console.log('')
    }
    if (results.warnings.length > 0) {
      console.log('警告详情:')
      results.warnings.forEach((w) => console.log(`  - ${w.name}: ${w.msg}`))
      console.log('')
    }

  } finally {
    // 清理
    console.log('▶ 清理测试环境...')
    app.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
    if (!app.killed) app.kill('SIGKILL')
    await mongod.stop()
    console.log('  已清理\n')
  }

  process.exit(failedCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('\n测试脚本异常:', err)
  process.exit(2)
})
