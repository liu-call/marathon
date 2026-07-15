import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { request } from '../../services/api'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const RACE_TYPES = ['全程马拉松', '半程马拉松', '10km', '5km']

const ResultEditPage: React.FC = () => {
  const router = useRouter()
  const { raceId, raceName, raceDate, raceType, raceDistance } = router.params

  const [form, setForm] = useState({
    raceName: '',
    raceDate: '',
    raceType: '全程马拉松',
    raceDistance: 42.195,
    finishTime: '',
    gunTime: '',
    netTime: '',
    overallRanking: 0,
    pace: '',
    weather: '',
    bibNumber: '',
    notes: '',
  })

  // 从赛事详情跳转过来时回填赛事信息
  useEffect(() => {
    if (raceId) {
      setForm((prev) => ({
        ...prev,
        raceName: raceName ? decodeURIComponent(raceName) : prev.raceName,
        raceDate: raceDate || prev.raceDate,
        raceType: raceType ? decodeURIComponent(raceType) : prev.raceType,
        raceDistance: raceDistance ? Number(raceDistance) : prev.raceDistance,
      }))
    }
  }, [raceId])

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleOCR = () => {
    Taro.chooseImage({
      count: 1,
      success: async (res) => {
        Taro.showLoading({ title: '识别中...' })
        try {
          // 实际环境调用上传+OCR
          Taro.showToast({ title: 'OCR 功能待连接后端', icon: 'none' })
        } catch (err) {
          Taro.showToast({ title: '识别失败', icon: 'none' })
        } finally {
          Taro.hideLoading()
        }
      },
    })
  }

  const handleSubmit = async () => {
    if (!form.raceName || !form.raceDate || !form.finishTime) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }
    try {
      // 带 raceId 关联赛事
      const payload: any = { ...form }
      if (raceId) payload.raceId = raceId
      await request('/results', 'POST', payload)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (err) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  return (
    <View className={styles.page}>
      <NavBar title="录入成绩" showBack />
      {raceId && (
        <View className={styles.card}>
          <View className={styles.linkBanner}>
            <Text className={styles.linkBannerText}>
              🏅 此成绩将关联到赛事：{form.raceName || '未命名赛事'}
            </Text>
          </View>
        </View>
      )}
      <View className={styles.card}>
        <View className={styles.ocrBtn} onClick={handleOCR}>
          <Text>📸 拍照识别成绩证书</Text>
        </View>
        <Text className={styles.cardTitle}>成绩信息</Text>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>赛事名称 *</Text>
          <Input className={styles.formInput} placeholder="如：北京马拉松" value={form.raceName} onInput={(e) => updateForm('raceName', e.detail.value)} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>比赛日期 *</Text>
          <Picker mode="date" onChange={(e) => updateForm('raceDate', e.detail.value)}>
            <View className={styles.formPicker}>{form.raceDate || '请选择日期'}</View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>赛事类型</Text>
          <Picker mode="selector" range={RACE_TYPES} onChange={(e) => updateForm('raceType', RACE_TYPES[e.detail.value])}>
            <View className={styles.formPicker}>{form.raceType}</View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>完赛成绩 *</Text>
          <Input className={styles.formInput} placeholder="如：03:32:15" value={form.finishTime} onInput={(e) => updateForm('finishTime', e.detail.value)} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>枪声成绩</Text>
          <Input className={styles.formInput} placeholder="如：03:33:02" value={form.gunTime} onInput={(e) => updateForm('gunTime', e.detail.value)} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>净成绩</Text>
          <Input className={styles.formInput} placeholder="如：03:32:15" value={form.netTime} onInput={(e) => updateForm('netTime', e.detail.value)} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>配速</Text>
          <Input className={styles.formInput} placeholder="如：05:01" value={form.pace} onInput={(e) => updateForm('pace', e.detail.value)} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>名次</Text>
          <Input className={styles.formInput} type="number" placeholder="如：3200" value={form.overallRanking ? String(form.overallRanking) : ''} onInput={(e) => updateForm('overallRanking', Number(e.detail.value))} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>号码布</Text>
          <Input className={styles.formInput} placeholder="如：A1234" value={form.bibNumber} onInput={(e) => updateForm('bibNumber', e.detail.value)} />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>天气</Text>
          <Input className={styles.formInput} placeholder="如：晴 18℃" value={form.weather} onInput={(e) => updateForm('weather', e.detail.value)} />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>保存成绩</Text>
        </View>
      </View>
    </View>
  )
}

export default ResultEditPage
