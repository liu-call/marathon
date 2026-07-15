import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'

interface Props {
  title?: string
  showBack?: boolean
  light?: boolean
}

const NavBar: React.FC<Props> = ({ title, showBack = false, light = false }) => {
  const [statusBarHeight] = useState(() => {
    try {
      const info = Taro.getSystemInfoSync()
      return info.statusBarHeight || 20
    } catch {
      return 20
    }
  })

  const handleBack = () => {
    Taro.navigateBack({ delta: 1 })
  }

  return (
    <View
      className={styles.navBar}
      style={{ paddingTop: `${statusBarHeight}px` }}
    >
      <View className={styles.content}>
        {showBack && (
          <View
            className={classnames(styles.backBtn, light && styles.backBtnLight)}
            onClick={handleBack}
          >
            <Text className={classnames(styles.backIcon, light && styles.textLight)}>‹</Text>
          </View>
        )}
        {!showBack && <View className={styles.placeholder} />}
        {title && (
          <Text className={classnames(styles.title, light && styles.textLight)}>{title}</Text>
        )}
        <View className={styles.placeholder} />
      </View>
    </View>
  )
}

export default NavBar
