import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { Race } from '../../types'
import styles from './index.module.scss'

interface Props {
  race: Race
  onClick?: (race: Race) => void
}

const statusColor: Record<string, string> = {
  待报名: styles.statusPending,
  已报名: styles.statusRegistered,
  已中签: styles.statusSelected,
  未中签: styles.statusNotSelected,
  已完成: styles.statusFinished,
  已弃赛: styles.statusAbandoned,
}

const RaceCard: React.FC<Props> = ({ race, onClick }) => {
  const daysLeft = Math.ceil(
    (new Date(race.raceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )

  return (
    <View className={styles.card} onClick={() => onClick?.(race)}>
      <View className={styles.header}>
        <View className={styles.raceInfo}>
          <Text className={styles.raceName}>{race.raceName}</Text>
          <Text className={styles.raceType}>{race.raceType}</Text>
        </View>
        <View className={classnames(styles.statusTag, statusColor[race.status] || styles.statusPending)}>
          <Text className={styles.statusText}>{race.status}</Text>
        </View>
      </View>
      <View className={styles.body}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>日期</Text>
          <Text className={styles.infoValue}>{race.raceDate}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>地点</Text>
          <Text className={styles.infoValue}>{race.raceLocation || '待定'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>距离</Text>
          <Text className={styles.infoValue}>{race.raceDistance}km</Text>
        </View>
      </View>
      {daysLeft > 0 && daysLeft <= 30 && (
        <View className={styles.countdown}>
          <Text className={styles.countdownText}>还有 {daysLeft} 天开跑</Text>
        </View>
      )}
    </View>
  )
}

export default RaceCard
