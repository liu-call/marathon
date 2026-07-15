import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const SettingsPage: React.FC = () => {
  const handleItem = (type: string) => {
    switch (type) {
      case 'subscribe':
        Taro.requestSubscribeMessage({
          tmplIds: ['tpl_reg_close', 'tpl_lottery', 'tpl_race_day'],
          success: () => Taro.showToast({ title: '订阅成功', icon: 'success' }),
          fail: () => Taro.showToast({ title: '订阅取消', icon: 'none' }),
        })
        break
      case 'export':
        Taro.showToast({ title: '数据导出功能开发中', icon: 'none' })
        break
      case 'clearCache':
        Taro.showModal({
          title: '清除缓存',
          content: '确定要清除本地缓存数据吗？',
          success: (res) => {
            if (res.confirm) {
              Taro.clearStorageSync()
              Taro.showToast({ title: '缓存已清除', icon: 'success' })
            }
          },
        })
        break
      case 'about':
        Taro.showModal({
          title: '关于',
          content: '马拉松助手 v1.0.0\n您的专属马拉松赛事管理工具',
          showCancel: false,
        })
        break
      case 'logout':
        Taro.showModal({
          title: '退出登录',
          content: '确定要退出登录吗？',
          confirmColor: '#FF3B30',
          success: (res) => {
            if (res.confirm) {
              Taro.removeStorageSync('token')
              Taro.reLaunch({ url: '/pages/home/index' })
            }
          },
        })
        break
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  return (
    <View className={styles.page}>
      <NavBar title="设置" showBack />

      <Text className={styles.groupTitle}>消息通知</Text>
      <View className={styles.group}>
        <View className={styles.item} onClick={() => handleItem('subscribe')}>
          <Text className={styles.itemIcon}>🔔</Text>
          <Text className={styles.itemText}>订阅消息授权</Text>
          <Text className={styles.itemValue}>点击授权</Text>
          <Text className={styles.itemArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.groupTitle}>数据管理</Text>
      <View className={styles.group}>
        <View className={styles.item} onClick={() => handleItem('export')}>
          <Text className={styles.itemIcon}>📤</Text>
          <Text className={styles.itemText}>导出数据</Text>
          <Text className={styles.itemArrow}>›</Text>
        </View>
        <View className={styles.item} onClick={() => handleItem('clearCache')}>
          <Text className={styles.itemIcon}>🗑</Text>
          <Text className={styles.itemText}>清除缓存</Text>
          <Text className={styles.itemArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.groupTitle}>其他</Text>
      <View className={styles.group}>
        <View className={styles.item} onClick={() => handleItem('about')}>
          <Text className={styles.itemIcon}>ℹ️</Text>
          <Text className={styles.itemText}>关于</Text>
          <Text className={styles.itemValue}>v1.0.0</Text>
          <Text className={styles.itemArrow}>›</Text>
        </View>
      </View>

      <View className={styles.logoutBtn} onClick={() => handleItem('logout')}>
        <Text className={styles.logoutText}>退出登录</Text>
      </View>

      <Text className={styles.version}>马拉松助手 v1.0.0</Text>
    </View>
  )
}

export default SettingsPage
