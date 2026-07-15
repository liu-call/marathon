import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../services/api'
import { AnnualReport } from '../../types'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const [report, setReport] = useState<AnnualReport | null>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      const data = await request<AnnualReport>('/reports/annual/2026')
      setReport(data)
    } catch (err) {
      console.error('[Mine] loadReport failed:', err)
    }
  }

  const menus = [
    { icon: '📊', text: '年度报告', url: '/pages/report/index' },
    { icon: '💰', text: '花费统计', url: '/pages/expense/index' },
    { icon: '🏨', text: '酒店管理', url: '/pages/hotel/index' },
    { icon: '📰', text: '赛事资讯', url: '/pages/news/index' },
    { icon: '⚙️', text: '设置', url: '/pages/settings/index' },
  ]

  const handleMenuClick = (url: string) => {
    if (url) {
      Taro.navigateTo({ url })
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  return (
    <View className={styles.page}>
      {/* 用户信息 */}
      <View className={styles.header}>
        <NavBar light />
        <View className={styles.avatar}>
          <Text>🏃</Text>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.nickName}>跑者小明</Text>
          <Text className={styles.userDesc}>2026 赛季 · 继续向前</Text>
        </View>
      </View>

      {/* 年度数据 */}
      <View className={styles.annualStats}>
        <Text className={styles.annualTitle}>2026 年度数据</Text>
        <View className={styles.annualGrid}>
          <View className={styles.annualItem}>
            <Text className={styles.annualValue}>{report?.summary?.totalRaces || 0}</Text>
            <Text className={styles.annualLabel}>参赛场次</Text>
          </View>
          <View className={styles.annualItem}>
            <Text className={styles.annualValue}>{report?.summary?.totalDistance || 0}</Text>
            <Text className={styles.annualLabel}>总里程(km)</Text>
          </View>
          <View className={styles.annualItem}>
            <Text className={styles.annualValue}>{report?.summary?.pbBreakthroughs || 0}</Text>
            <Text className={styles.annualLabel}>PB次数</Text>
          </View>
          <View className={styles.annualItem}>
            <Text className={styles.annualValue}>{report?.summary?.fullMarathonCount || 0}</Text>
            <Text className={styles.annualLabel}>全马</Text>
          </View>
          <View className={styles.annualItem}>
            <Text className={styles.annualValue}>{report?.summary?.halfMarathonCount || 0}</Text>
            <Text className={styles.annualLabel}>半马</Text>
          </View>
          <View className={styles.annualItem}>
            <Text className={styles.annualValue}>¥{report?.totalExpense || 0}</Text>
            <Text className={styles.annualLabel}>总花费</Text>
          </View>
        </View>
      </View>

      {/* 菜单 */}
      <View className={styles.menu}>
        {menus.map((item) => (
          <View key={item.text} className={styles.menuItem} onClick={() => handleMenuClick(item.url)}>
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuText}>{item.text}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default MinePage
