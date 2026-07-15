import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { request } from '../../services/api'
import { Race, Hotel, Result, ListResponse } from '../../types'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const RaceDetailPage: React.FC = () => {
  const router = useRouter()
  const [race, setRace] = useState<Race | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [results, setResults] = useState<Result[]>([])

  useEffect(() => {
    if (router.params.id) {
      loadRace()
      loadHotels()
      loadResults()
    }
  }, [])

  const loadRace = async () => {
    try {
      const data = await request<Race>(`/races/${router.params.id}`)
      setRace(data)
    } catch (err) {
      console.error('[RaceDetail] loadRace failed:', err)
    }
  }

  const loadHotels = async () => {
    try {
      const data = await request<Hotel[]>(`/hotels/race/${router.params.id}`)
      setHotels(data || [])
    } catch (err) {
      console.error('[RaceDetail] loadHotels failed:', err)
    }
  }

  const loadResults = async () => {
    try {
      const res = await request<ListResponse<Result>>('/results', 'GET', { raceId: router.params.id })
      setResults(res?.list || [])
    } catch (err) {
      console.error('[RaceDetail] loadResults failed:', err)
    }
  }

  const handleEdit = () => {
    Taro.navigateTo({ url: `/pages/race-edit/index?id=${race?._id}` })
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这场赛事吗？',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          await request(`/races/${race?._id}`, 'DELETE')
          Taro.navigateBack()
        }
      },
    })
  }

  const handleAddHotel = () => {
    Taro.navigateTo({
      url: `/pages/hotel/index?raceId=${race?._id}&raceName=${encodeURIComponent(race?.raceName || '')}`,
    })
  }

  const handleViewHotels = () => {
    Taro.navigateTo({
      url: `/pages/hotel/index?raceId=${race?._id}&raceName=${encodeURIComponent(race?.raceName || '')}`,
    })
  }

  const handleAddResult = () => {
    Taro.navigateTo({
      url: `/pages/result-edit/index?raceId=${race?._id}&raceName=${encodeURIComponent(race?.raceName || '')}&raceDate=${race?.raceDate || ''}&raceType=${encodeURIComponent(race?.raceType || '')}&raceDistance=${race?.raceDistance || ''}`,
    })
  }

  if (!race) {
    return (
      <View className={styles.page}>
        <NavBar title="赛事详情" showBack light />
        <View className={styles.hero}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const statusClass = race.status === '已中签' || race.status === '已完成' ? styles.statusSelected
    : race.status === '已报名' ? styles.statusRegistered
    : race.status === '未中签' || race.status === '已弃赛' ? styles.statusNotSelected
    : styles.statusPending

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <NavBar title="赛事详情" showBack light />
        <Text className={styles.heroName}>{race.raceName}</Text>
        <Text className={styles.heroMeta}>{race.raceType} · {race.raceDate} · {race.raceLocation}</Text>
        <View className={`${styles.statusTag} ${statusClass}`}>
          <Text>{race.status}</Text>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>赛事信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>比赛日期</Text>
          <Text className={styles.infoValue}>{race.raceDate}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>赛事类型</Text>
          <Text className={styles.infoValue}>{race.raceType}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>比赛距离</Text>
          <Text className={styles.infoValue}>{race.raceDistance}km</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>比赛地点</Text>
          <Text className={styles.infoValue}>{race.raceLocation || '-'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>号码布</Text>
          <Text className={styles.infoValue}>{race.bibNumber || '-'}</Text>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>报名信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>报名开始</Text>
          <Text className={styles.infoValue}>{race.registrationOpenDate || '-'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>报名截止</Text>
          <Text className={styles.infoValue}>{race.registrationCloseDate || '-'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>抽签日期</Text>
          <Text className={styles.infoValue}>{race.lotteryDate || '-'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>抽签结果</Text>
          <Text className={styles.infoValue}>{race.lotteryResultDate || '-'}</Text>
        </View>
      </View>

      {/* 关联酒店 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>住宿信息</Text>
          {hotels.length > 0 && (
            <Text className={styles.cardAction} onClick={handleViewHotels}>全部</Text>
          )}
        </View>
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <View key={hotel._id} className={styles.hotelItem}>
              <View className={styles.hotelHeader}>
                <Text className={styles.hotelName}>{hotel.hotelName}</Text>
                <View className={`${styles.hotelStatus} ${hotel.status === '已确认' || hotel.status === '已预订' ? styles.hotelStatusOk : styles.hotelStatusPending}`}>
                  <Text>{hotel.status}</Text>
                </View>
              </View>
              <View className={styles.hotelInfo}>
                <Text className={styles.hotelInfoText}>
                  {hotel.checkInDate} ~ {hotel.checkOutDate} · {hotel.nights}晚
                </Text>
                <Text className={styles.hotelPrice}>¥{hotel.totalPrice}</Text>
              </View>
              {hotel.distanceToStart && (
                <Text className={styles.hotelDist}>距起点 {hotel.distanceToStart}</Text>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptySection} onClick={handleAddHotel}>
            <Text className={styles.emptyText}>暂无住宿记录，点击添加</Text>
          </View>
        )}
        {hotels.length > 0 && (
          <View className={styles.addHotelBtn} onClick={handleAddHotel}>
            <Text>+ 添加酒店</Text>
          </View>
        )}
      </View>

      {/* 关联成绩 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>完赛成绩</Text>
        </View>
        {results.length > 0 ? (
          results.map((r) => (
            <View key={r._id} className={styles.hotelItem}>
              <View className={styles.hotelHeader}>
                <Text className={styles.hotelName}>完赛 {r.finishTime}</Text>
                {r.isPB && (
                  <View className={`${styles.hotelStatus} ${styles.hotelStatusOk}`}>
                    <Text>PB</Text>
                  </View>
                )}
              </View>
              <View className={styles.hotelInfo}>
                <Text className={styles.hotelInfoText}>
                  {r.raceType} · 配速 {r.pace}
                </Text>
                <Text className={styles.hotelInfoText}>名次 {r.overallRanking || '-'}</Text>
              </View>
              {r.notes && (
                <Text className={styles.hotelDist}>{r.notes}</Text>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptySection} onClick={handleAddResult}>
            <Text className={styles.emptyText}>暂无完赛成绩，点击录入</Text>
          </View>
        )}
        {results.length > 0 && (
          <View className={styles.addHotelBtn} onClick={handleAddResult}>
            <Text>+ 录入成绩</Text>
          </View>
        )}
      </View>

      {race.notes && (
        <View className={styles.card}>
          <Text className={styles.cardTitle}>备注</Text>
          <Text className={styles.notesText}>{race.notes}</Text>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnEdit}`} onClick={handleEdit}>
          <Text>编辑</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete}>
          <Text>删除</Text>
        </View>
      </View>
    </View>
  )
}

export default RaceDetailPage
