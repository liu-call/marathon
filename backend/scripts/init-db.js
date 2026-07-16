/**
 * 数据库初始化脚本
 * 1. 连接 MongoDB Atlas
 * 2. 同步所有集合的索引（syncIndexes）
 * 3. 列出所有集合和索引状态
 * 4. 清理旧的测试数据（可选）
 *
 * 用法: node scripts/init-db.js [--clean]
 */
require('dotenv').config()
const mongoose = require('mongoose')

// 导入编译后的 schema
const { RaceSchema } = require('../dist/race/race.schema')
const { ResultSchema } = require('../dist/result/result.schema')
const { RaceExpenseSchema } = require('../dist/expense/expense.schema')
const { HotelSchema } = require('../dist/expense/hotel.schema')
const { NewsSchema } = require('../dist/news/news.schema')
const { SubscribeRecordSchema } = require('../dist/notify/notify.schema')
const { AnnualReportSchema } = require('../dist/report/report.schema')
const { UserSchema } = require('../dist/auth/user.schema')

const URI = process.env.MONGO_URI

async function main() {
  const cleanMode = process.argv.includes('--clean')
  console.log('=== MongoDB 数据库初始化 ===')
  console.log(`连接: ${URI.replace(/:[^:@]+@/, ':****@')}`)
  if (cleanMode) console.log('⚠️  清理模式：将删除所有现有数据')

  await mongoose.connect(URI, { serverSelectionTimeoutMS: 15000 })
  console.log('✅ 数据库连接成功\n')

  // 定义所有模型
  const models = [
    { name: 'User', schema: UserSchema, collection: 'users' },
    { name: 'Race', schema: RaceSchema, collection: 'races' },
    { name: 'Result', schema: ResultSchema, collection: 'results' },
    { name: 'RaceExpense', schema: RaceExpenseSchema, collection: 'raceexpenses' },
    { name: 'Hotel', schema: HotelSchema, collection: 'hotels' },
    { name: 'News', schema: NewsSchema, collection: 'news' },
    { name: 'SubscribeRecord', schema: SubscribeRecordSchema, collection: 'subscriberecords' },
    { name: 'AnnualReport', schema: AnnualReportSchema, collection: 'annualreports' },
  ]

  console.log('=== 1. 同步索引 ===')
  for (const m of models) {
    const model = mongoose.model(m.name, m.schema, m.collection)
    try {
      const result = await model.syncIndexes()
      const dropped = await model.cleanIndexes()
      console.log(`  ${m.name.padEnd(16)} -> 同步: ${result.length} 项, 清理多余索引: ${dropped.length} 项`)
    } catch (err) {
      console.log(`  ${m.name.padEnd(16)} -> 失败: ${err.message}`)
    }
  }

  console.log('\n=== 2. 集合与索引详情 ===')
  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()
  for (const col of collections) {
    const indexes = await db.collection(col.name).indexes()
    const count = await db.collection(col.name).countDocuments()
    console.log(`\n  [${col.name}] 文档数: ${count}`)
    indexes.forEach(idx => {
      const keys = JSON.stringify(idx.key)
      const unique = idx.unique ? ' (unique)' : ''
      console.log(`    - ${idx.name}: ${keys}${unique}`)
    })
  }

  console.log('\n=== 3. 清理旧数据 ===')
  if (cleanMode) {
    for (const m of models) {
      const model = mongoose.model(m.name)
      const result = await model.deleteMany({})
      console.log(`  ${m.name.padEnd(16)} -> 删除 ${result.deletedCount} 条`)
    }
    console.log('✅ 所有数据已清理')
  } else {
    console.log('  跳过（如需清理请加 --clean 参数）')
  }

  console.log('\n=== 4. 完成 ===')
  await mongoose.connection.close()
  console.log('✅ 数据库初始化完成，连接已关闭')
}

main().catch((err) => {
  console.error('❌ 初始化失败:', err)
  process.exit(1)
})
