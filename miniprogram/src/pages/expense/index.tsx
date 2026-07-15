import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { request } from '../../services/api'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const COLORS: Record<string, string> = {
  报名: '#0071E3',
  住宿: '#5856D6',
  交通: '#34C759',
  餐饮: '#FF9500',
  装备: '#AF52DE',
  其他: '#8E8E93',
}

const ExpensePage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await request('/expenses/summary?year=2026')
      setSummary(data)
    } catch (err) {
      console.error('[Expense] loadData failed:', err)
    }
  }

  if (!summary) {
    return <View className={styles.page}><Text>加载中...</Text></View>
  }

  const maxAmount = Math.max(...Object.values(summary.breakdown).map(Number))

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <NavBar title="花费统计" showBack light />
        <Text className={styles.heroAmount}>¥{summary.totalAmount}</Text>
        <Text className={styles.heroLabel}>2026年总花费 · {summary.raceCount}场赛事</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>花费明细</Text>
        {Object.entries(summary.breakdown).map(([key, val]: [string, any]) => (
          <View key={key}>
            <View className={styles.breakdownRow}>
              <Text className={styles.breakdownLabel}>{key}</Text>
              <Text className={styles.breakdownValue}>¥{val}</Text>
            </View>
            <View className={styles.barContainer}>
              <View
                className={styles.barFill}
                style={{ width: `${(val / maxAmount) * 100}%`, background: COLORS[key] || '#999' }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default ExpensePage
