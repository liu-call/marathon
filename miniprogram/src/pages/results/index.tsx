import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../services/api'
import { Result, PBData, ListResponse } from '../../types'
import ResultCard from '../../components/ResultCard'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([])
  const [pb, setPb] = useState<PBData | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [resultsRes, pbData] = await Promise.all([
        request<ListResponse<Result>>('/results'),
        request<PBData>('/results/pb'),
      ])
      setResults(resultsRes?.list || [])
      setPb(pbData)
    } catch (err) {
      console.error('[Results] loadData failed:', err)
    }
  }

  return (
    <View className={styles.page}>
      {/* PB 展示区 */}
      <View className={styles.pbSection}>
        <NavBar title="成绩" light />
        <Text className={styles.pbTitle}>个人最好成绩</Text>
        <View className={styles.pbCards}>
          <View className={styles.pbCard}>
            <Text className={styles.pbLabel}>全马PB</Text>
            <Text className={styles.pbValue}>{pb?.fullMarathon?.finishTime || '--:--:--'}</Text>
            <Text className={styles.pbRace}>{pb?.fullMarathon?.raceName || '暂无'}</Text>
          </View>
          <View className={styles.pbCard}>
            <Text className={styles.pbLabel}>半马PB</Text>
            <Text className={styles.pbValue}>{pb?.halfMarathon?.finishTime || '--:--:--'}</Text>
            <Text className={styles.pbRace}>{pb?.halfMarathon?.raceName || '暂无'}</Text>
          </View>
          <View className={styles.pbCard}>
            <Text className={styles.pbLabel}>10K PB</Text>
            <Text className={styles.pbValue}>{pb?.tenK?.finishTime || '--:--:--'}</Text>
            <Text className={styles.pbRace}>{pb?.tenK?.raceName || '暂无'}</Text>
          </View>
        </View>
      </View>

      {/* 成绩列表 */}
      <View className={styles.list}>
        {results.length > 0 ? (
          results.map((result) => <ResultCard key={result._id} result={result} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>⏱</Text>
            <Text className={styles.emptyText}>还没有成绩记录</Text>
          </View>
        )}
      </View>

      {/* 添加按钮 */}
      <View
        className={styles.fab}
        onClick={() => Taro.navigateTo({ url: '/pages/result-edit/index' })}
      >
        <Text className={styles.fabText}>+</Text>
      </View>
    </View>
  )
}

export default ResultsPage
