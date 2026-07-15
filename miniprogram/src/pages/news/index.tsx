import React, { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../services/api'
import { News, ListResponse } from '../../types'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await request<ListResponse<News>>('/news')
      setNews(res?.list || [])
    } catch (err) {
      console.error('[News] loadData failed:', err)
    }
  }

  return (
    <View className={styles.page}>
      <NavBar title="赛事资讯" showBack />
      <View className={styles.list}>
        {news.map((item) => (
          <View
            key={item._id}
            className={styles.card}
            onClick={() => Taro.navigateTo({ url: `/pages/news-detail/index?id=${item._id}` })}
          >
            {item.imageUrl && (
              <Image className={styles.cardImage} src={item.imageUrl} mode="aspectFill" />
            )}
            <View className={styles.cardBody}>
              <Text className={styles.cardTitle}>{item.title}</Text>
              <View className={styles.cardMeta}>
                <View>
                  {item.tags?.map((tag) => (
                    <View
                      key={tag}
                      className={`${styles.tag} ${item.isOfficial ? styles.tagOfficial : styles.tagNormal}`}
                      style={{ display: 'inline-block' }}
                    >
                      <Text>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text className={styles.cardDate}>{item.publishDate}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default NewsPage
