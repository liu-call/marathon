import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { request } from '../../services/api'
import { Race } from '../../types'
import RaceCard from '../../components/RaceCard'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const STATUS_FILTERS = ['全部', '待报名', '已报名', '已中签', '已完成']

const RacesPage: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([])
  const [activeFilter, setActiveFilter] = useState('全部')

  useEffect(() => {
    loadRaces()
  }, [])

  const loadRaces = async () => {
    try {
      const data = await request<Race[]>('/races')
      setRaces(data || [])
    } catch (err) {
      console.error('[Races] loadRaces failed:', err)
    }
  }

  const filteredRaces = activeFilter === '全部'
    ? races
    : races.filter((r) => r.status === activeFilter)

  const handleRaceClick = (race: Race) => {
    Taro.navigateTo({ url: `/pages/race-detail/index?id=${race._id}` })
  }

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/race-edit/index' })
  }

  return (
    <View className={styles.page}>
      <NavBar title="赛事" />
      {/* 筛选栏 */}
      <ScrollView scrollX className={styles.filterBar}>
        {STATUS_FILTERS.map((filter) => (
          <View
            key={filter}
            className={classnames(
              styles.filterItem,
              activeFilter === filter && styles.filterItemActive,
            )}
            onClick={() => setActiveFilter(filter)}
          >
            <Text>{filter}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 赛事列表 */}
      <View className={styles.list}>
        {filteredRaces.length > 0 ? (
          filteredRaces.map((race) => (
            <RaceCard key={race._id} race={race} onClick={handleRaceClick} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏃</Text>
            <Text className={styles.emptyText}>
              {activeFilter === '全部' ? '还没有赛事记录' : `没有"${activeFilter}"的赛事`}
            </Text>
            <View className={styles.emptyBtn} onClick={handleAdd}>
              <Text>添加赛事</Text>
            </View>
          </View>
        )}
      </View>

      {/* 浮动添加按钮 */}
      <View className={styles.fab} onClick={handleAdd}>
        <Text className={styles.fabText}>+</Text>
      </View>
    </View>
  )
}

export default RacesPage
