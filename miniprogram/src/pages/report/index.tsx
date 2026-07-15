import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../services/api'
import { AnnualReport } from '../../types'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const ReportPage: React.FC = () => {
  const [report, setReport] = useState<AnnualReport | null>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      const data = await request<AnnualReport>('/reports/annual/2026')
      setReport(data)
    } catch (err) {
      console.error('[Report] loadReport failed:', err)
    }
  }

  const handleShare = () => {
    Taro.showToast({ title: '分享图生成中...', icon: 'loading' })
    setTimeout(() => Taro.showToast({ title: '功能开发中', icon: 'none' }), 1500)
  }

  if (!report) {
    return <View className={styles.page}><Text>加载中...</Text></View>
  }

  const { summary, highlights } = report

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <NavBar title="年度报告" showBack light />
        <Text className={styles.heroYear}>{report.year}</Text>
        <Text className={styles.heroTitle}>年度跑步报告</Text>
      </View>

      {/* 统计网格 */}
      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <View className={styles.statInner}>
            <Text className={styles.statValue}>{summary.totalRaces}</Text>
            <Text className={styles.statLabel}>参赛场次</Text>
          </View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statInner}>
            <Text className={styles.statValue}>{summary.totalDistance}</Text>
            <Text className={styles.statLabel}>总里程(km)</Text>
          </View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statInner}>
            <Text className={styles.statValue}>{summary.pbBreakthroughs}</Text>
            <Text className={styles.statLabel}>PB次数</Text>
          </View>
        </View>
        <View className={styles.statCard}>
          <View className={styles.statInner}>
            <Text className={styles.statValue}>{summary.finishRate}%</Text>
            <Text className={styles.statLabel}>完赛率</Text>
          </View>
        </View>
      </View>

      {/* 成绩亮点 */}
      <View className={styles.card}>
        <Text className={styles.cardTitle}>成绩亮点</Text>
        <View className={styles.highlightRow}>
          <Text className={styles.highlightLabel}>全马PB</Text>
          <Text className={styles.highlightValue}>{highlights.fullPB || '-'}</Text>
        </View>
        <View className={styles.highlightRow}>
          <Text className={styles.highlightLabel}>半马PB</Text>
          <Text className={styles.highlightValue}>{highlights.halfPB || '-'}</Text>
        </View>
        <View className={styles.highlightRow}>
          <Text className={styles.highlightLabel}>最快配速赛事</Text>
          <Text className={styles.highlightValue}>{highlights.fastestRace || '-'}</Text>
        </View>
        <View className={styles.highlightRow}>
          <Text className={styles.highlightLabel}>进步情况</Text>
          <Text className={styles.highlightValue}>{highlights.improvement || '-'}</Text>
        </View>
      </View>

      {/* 花费统计 */}
      <View className={styles.card}>
        <Text className={styles.cardTitle}>花费统计</Text>
        <View className={styles.highlightRow}>
          <Text className={styles.highlightLabel}>总花费</Text>
          <Text className={styles.highlightValue}>¥{report.totalExpense}</Text>
        </View>
        {Object.entries(report.expenseBreakdown).map(([key, val]) => (
          <View key={key} className={styles.highlightRow}>
            <Text className={styles.highlightLabel}>{key}</Text>
            <Text className={styles.highlightValue}>¥{val}</Text>
          </View>
        ))}
      </View>

      {/* AI 感言 */}
      <View className={styles.aiSummary}>
        <Text className={styles.aiTitle}>AI 年度感言</Text>
        <Text className={styles.aiText}>{report.aiSummary}</Text>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.shareBtn} onClick={handleShare}>
          <Text>生成分享长图</Text>
        </View>
      </View>
    </View>
  )
}

export default ReportPage
