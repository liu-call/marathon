import React, { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { request } from '../../services/api'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const RACE_TYPES = ['全程马拉松', '半程马拉松', '10km', '5km']
const STATUSES = ['待报名', '已报名', '未中签', '已中签', '已完成', '已弃赛']

const RaceEditPage: React.FC = () => {
  const router = useRouter()
  const isEdit = !!router.params.id

  const [form, setForm] = useState({
    raceName: '',
    raceDate: '',
    raceType: '全程马拉松',
    raceLocation: '',
    raceDistance: 42.195,
    registrationOpenDate: '',
    registrationCloseDate: '',
    lotteryDate: '',
    lotteryResultDate: '',
    bibNumber: '',
    status: '待报名',
    notes: '',
  })

  useEffect(() => {
    if (isEdit) {
      loadRace()
    }
  }, [])

  const loadRace = async () => {
    try {
      const data = await request<any>(`/races/${router.params.id}`)
      if (data) {
        setForm({
          raceName: data.raceName || '',
          raceDate: data.raceDate || '',
          raceType: data.raceType || '全程马拉松',
          raceLocation: data.raceLocation || '',
          raceDistance: data.raceDistance || 42.195,
          registrationOpenDate: data.registrationOpenDate || '',
          registrationCloseDate: data.registrationCloseDate || '',
          lotteryDate: data.lotteryDate || '',
          lotteryResultDate: data.lotteryResultDate || '',
          bibNumber: data.bibNumber || '',
          status: data.status || '待报名',
          notes: data.notes || '',
        })
      }
    } catch (err) {
      console.error('[RaceEdit] loadRace failed:', err)
    }
  }

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.raceName || !form.raceDate) {
      Taro.showToast({ title: '请填写赛事名称和日期', icon: 'none' })
      return
    }
    try {
      if (isEdit) {
        await request(`/races/${router.params.id}`, 'PUT', form)
      } else {
        await request('/races', 'POST', form)
      }
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (err) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  return (
    <View className={styles.page}>
      <NavBar title={isEdit ? '编辑赛事' : '添加赛事'} showBack />
      <View className={styles.card}>
        <Text className={styles.cardTitle}>基本信息</Text>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>赛事名称 *</Text>
          <Input
            className={styles.formInput}
            placeholder="如：北京马拉松"
            value={form.raceName}
            onInput={(e) => updateForm('raceName', e.detail.value)}
          />
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
          <Text className={styles.formLabel}>比赛地点</Text>
          <Input
            className={styles.formInput}
            placeholder="如：北京·天安门广场"
            value={form.raceLocation}
            onInput={(e) => updateForm('raceLocation', e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>距离(km)</Text>
          <Input
            className={styles.formInput}
            type="digit"
            value={String(form.raceDistance)}
            onInput={(e) => updateForm('raceDistance', Number(e.detail.value))}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>状态</Text>
          <Picker mode="selector" range={STATUSES} onChange={(e) => updateForm('status', STATUSES[e.detail.value])}>
            <View className={styles.formPicker}>{form.status}</View>
          </Picker>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>报名信息</Text>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>报名开始</Text>
          <Picker mode="date" onChange={(e) => updateForm('registrationOpenDate', e.detail.value)}>
            <View className={styles.formPicker}>{form.registrationOpenDate || '请选择日期'}</View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>报名截止</Text>
          <Picker mode="date" onChange={(e) => updateForm('registrationCloseDate', e.detail.value)}>
            <View className={styles.formPicker}>{form.registrationCloseDate || '请选择日期'}</View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>抽签日期</Text>
          <Picker mode="date" onChange={(e) => updateForm('lotteryDate', e.detail.value)}>
            <View className={styles.formPicker}>{form.lotteryDate || '请选择日期'}</View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>抽签结果公布</Text>
          <Picker mode="date" onChange={(e) => updateForm('lotteryResultDate', e.detail.value)}>
            <View className={styles.formPicker}>{form.lotteryResultDate || '请选择日期'}</View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>号码布</Text>
          <Input
            className={styles.formInput}
            placeholder="如：A1234"
            value={form.bibNumber}
            onInput={(e) => updateForm('bibNumber', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>备注</Text>
        <Textarea
          className={styles.formTextarea}
          placeholder="目标、补给策略、心得..."
          value={form.notes}
          onInput={(e) => updateForm('notes', e.detail.value)}
        />
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>保存</Text>
        </View>
      </View>
    </View>
  )
}

export default RaceEditPage
