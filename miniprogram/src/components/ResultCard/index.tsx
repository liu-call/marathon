import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { Result } from '../../types'
import styles from './index.module.scss'

interface Props {
  result: Result
  onClick?: (result: Result) => void
}

const ResultCard: React.FC<Props> = ({ result, onClick }) => {
  return (
    <View className={styles.card} onClick={() => onClick?.(result)}>
      <View className={styles.header}>
        <View className={styles.raceInfo}>
          <Text className={styles.raceName}>{result.raceName}</Text>
          <Text className={styles.raceDate}>{result.raceDate}</Text>
        </View>
        {result.isPB && (
          <View className={styles.pbBadge}>
            <Text className={styles.pbText}>PB</Text>
          </View>
        )}
      </View>
      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>成绩</Text>
          <Text className={classnames(styles.statValue, result.isPB && styles.statValuePB)}>
            {result.finishTime}
          </Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>配速</Text>
          <Text className={styles.statValue}>{result.pace}</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>排名</Text>
          <Text className={styles.statValue}>{result.overallRanking || '-'}</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statLabel}>距离</Text>
          <Text className={styles.statValue}>{result.raceDistance}km</Text>
        </View>
      </View>
    </View>
  )
}

export default ResultCard
