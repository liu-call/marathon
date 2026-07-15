import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../services/api'
import { Race, ResultSummary, PBData } from '../../types'
import RaceCard from '../../components/RaceCard'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([])
  const [summary, setSummary] = useState<ResultSummary | null>(null)
  const [pb, setPb] = useState<PBData | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [races, summaryData, pbData] = await Promise.all([
        request<Race[]>('/races/upcoming'),
        request<ResultSummary>('/results/summary'),
        request<PBData>('/results/pb'),
      ])
      setUpcomingRaces(races || [])
      setSummary(summaryData)
      setPb(pbData)
    } catch (err) {
      console.error('[Home] loadData failed:', err)
    }
  }

  const handleRaceClick = (race: Race) => {
    Taro.navigateTo({ url: `/pages/race-detail/index?id=${race._id}` })
  }

  const handleQuickAction = (type: string) => {
    switch (type) {
      case 'addRace':
        Taro.navigateTo({ url: '/pages/race-edit/index' })
        break
      case 'addResult':
        Taro.navigateTo({ url: '/pages/result-edit/index' })
        break
      case 'report':
        Taro.navigateTo({ url: '/pages/report/index' })
        break
      case 'news':
        Taro.navigateTo({ url: '/pages/news/index' })
        break
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <NavBar />
        <View className={styles.heroContent}>
          <Text className={styles.heroTitle}>马拉松助手</Text>
          <Text className={styles.heroDate}>2026 赛季 · 继续向前</Text>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{summary?.totalRaces || 0}</Text>
          <Text className={styles.statLabel}>总参赛</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{summary?.totalDistance || 0}</Text>
          <Text className={styles.statLabel}>总里程(km)</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={`${styles.statValue} ${styles.statValueHighlight}`}>
            {pb?.fullMarathon?.finishTime || '-'}
          </Text>
          <Text className={styles.statLabel}>全马PB</Text>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.quickAction} onClick={() => handleQuickAction('addRace')}>
          <View className={`${styles.quickIcon} ${styles.quickIconGreen}`}>
            <Text>+</Text>
          </View>
          <Text className={styles.quickText}>添加赛事</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleQuickAction('addResult')}>
          <View className={`${styles.quickIcon} ${styles.quickIconBlue}`}>
            <Text>⏱</Text>
          </View>
          <Text className={styles.quickText}>录入成绩</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleQuickAction('report')}>
          <View className={`${styles.quickIcon} ${styles.quickIconPurple}`}>
            <Text>📊</Text>
          </View>
          <Text className={styles.quickText}>年度报告</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleQuickAction('news')}>
          <View className={`${styles.quickIcon} ${styles.quickIconOrange}`}>
            <Text>📰</Text>
          </View>
          <Text className={styles.quickText}>资讯</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>即将开跑</Text>
          <Text
            className={styles.sectionMore}
            onClick={() => Taro.switchTab({ url: '/pages/races/index' })}
          >
            查看全部
          </Text>
        </View>
        {upcomingRaces.length > 0 ? (
          upcomingRaces.map((race) => (
            <RaceCard key={race._id} race={race} onClick={handleRaceClick} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无即将开跑的赛事</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default HomePage
