import React, { useState, useEffect } from 'react'
import { View, Text, Image, RichText } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { request } from '../../services/api'
import { News } from '../../types'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const NewsDetailPage: React.FC = () => {
  const router = useRouter()
  const [news, setNews] = useState<News | null>(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const data = await request<News>(`/news/${router.params.id}`)
      setNews(data)
    } catch (err) {
      console.error('[NewsDetail] loadNews failed:', err)
    }
  }

  if (!news) {
    return (
      <View className={styles.page}>
        <NavBar title="资讯详情" showBack />
        <View className={styles.content}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <NavBar title="资讯详情" showBack />
      {news.imageUrl && (
        <Image className={styles.heroImage} src={news.imageUrl} mode="aspectFill" />
      )}
      <View className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.title}>{news.title}</Text>
          <View className={styles.meta}>
            <Text className={styles.source}>{news.source || '马拉松助手'}</Text>
            <Text className={styles.date}>{news.publishDate}</Text>
          </View>
          {news.tags && news.tags.length > 0 && (
            <View className={styles.tags}>
              {news.tags.map((tag) => (
                <View key={tag} className={styles.tag}>
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <RichText className={styles.bodyText} nodes={news.content || ''} />
        </View>
      </View>
    </View>
  )
}

export default NewsDetailPage
