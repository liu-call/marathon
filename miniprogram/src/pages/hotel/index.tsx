import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { request } from '../../services/api'
import { Hotel } from '../../types'
import NavBar from '../../components/NavBar'
import styles from './index.module.scss'

const HotelPage: React.FC = () => {
  const router = useRouter()
  const { raceId, raceName } = router.params
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    hotelName: '',
    checkInDate: '',
    checkOutDate: '',
    price: 0,
    distanceToStart: '',
    address: '',
    status: '已预订',
  })

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      const url = raceId ? `/hotels/race/${raceId}` : '/hotels'
      const data = await request<Hotel[]>(url)
      setHotels(data || [])
    } catch (err) {
      console.error('[Hotel] loadHotels failed:', err)
    }
  }

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAdd = () => {
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.hotelName) {
      Taro.showToast({ title: '请填写酒店名称', icon: 'none' })
      return
    }
    const nights = form.checkInDate && form.checkOutDate
      ? Math.max(1, Math.ceil((new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime()) / (24 * 60 * 60 * 1000)))
      : 1
    const hotelData = {
      ...form,
      raceId: raceId || '',
      raceName: raceName ? decodeURIComponent(raceName) : '',
      nights,
      totalPrice: form.price * nights,
    }
    try {
      await request('/hotels', 'POST', hotelData)
      Taro.showToast({ title: '添加成功', icon: 'success' })
      setShowForm(false)
      setForm({ hotelName: '', checkInDate: '', checkOutDate: '', price: 0, distanceToStart: '', address: '', status: '已预订' })
      loadHotels()
    } catch (err) {
      Taro.showToast({ title: '添加失败', icon: 'none' })
    }
  }

  const pageTitle = raceName ? `${decodeURIComponent(raceName)} · 酒店` : '酒店管理'

  return (
    <View className={styles.page}>
      <NavBar title={pageTitle} showBack />
      <View className={styles.list}>
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <View key={hotel._id} className={styles.card}>
              <View className={styles.cardHeader}>
                <Text className={styles.hotelName}>{hotel.hotelName}</Text>
                <View className={`${styles.hotelStatus} ${hotel.status === '已确认' || hotel.status === '已预订' ? styles.statusOk : styles.statusPending}`}>
                  <Text>{hotel.status || '待确认'}</Text>
                </View>
              </View>
              {hotel.raceName && !raceId && (
                <Text className={styles.raceTag}>{hotel.raceName}</Text>
              )}
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>入住日期</Text>
                <Text className={styles.infoValue}>{hotel.checkInDate || '-'}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>离店日期</Text>
                <Text className={styles.infoValue}>{hotel.checkOutDate || '-'}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>住宿晚数</Text>
                <Text className={styles.infoValue}>{hotel.nights}晚</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>到起点距离</Text>
                <Text className={styles.infoValue}>{hotel.distanceToStart || '-'}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>总价</Text>
                <Text className={`${styles.infoValue} ${styles.priceTag}`}>¥{hotel.totalPrice}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏨</Text>
            <Text className={styles.emptyText}>
              {raceName ? `暂无${decodeURIComponent(raceName)}的住宿记录` : '还没有酒店记录'}
            </Text>
            <View className={styles.addBtn} onClick={handleAdd}>
              <Text>添加酒店</Text>
            </View>
          </View>
        )}
      </View>

      {hotels.length > 0 && (
        <View className={styles.fab} onClick={handleAdd}>
          <Text className={styles.fabText}>+</Text>
        </View>
      )}

      {/* 添加酒店表单 */}
      {showForm && (
        <View className={styles.modal}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加酒店</Text>
              <Text className={styles.modalClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>酒店名称 *</Text>
              <Input className={styles.formInput} placeholder="如：北京王府井希尔顿" value={form.hotelName} onInput={(e) => updateForm('hotelName', e.detail.value)} />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>入住日期</Text>
              <Picker mode="date" onChange={(e) => updateForm('checkInDate', e.detail.value)}>
                <View className={styles.formPicker}>{form.checkInDate || '请选择日期'}</View>
              </Picker>
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>离店日期</Text>
              <Picker mode="date" onChange={(e) => updateForm('checkOutDate', e.detail.value)}>
                <View className={styles.formPicker}>{form.checkOutDate || '请选择日期'}</View>
              </Picker>
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>每晚价格(元)</Text>
              <Input className={styles.formInput} type="digit" placeholder="如：880" value={form.price ? String(form.price) : ''} onInput={(e) => updateForm('price', Number(e.detail.value))} />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>到起点距离</Text>
              <Input className={styles.formInput} placeholder="如：1.2km" value={form.distanceToStart} onInput={(e) => updateForm('distanceToStart', e.detail.value)} />
            </View>
            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>地址</Text>
              <Input className={styles.formInput} placeholder="如：北京市东城区..." value={form.address} onInput={(e) => updateForm('address', e.detail.value)} />
            </View>
            <View className={styles.modalBtns}>
              <View className={styles.modalCancel} onClick={() => setShowForm(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalConfirm} onClick={handleSubmit}>
                <Text>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default HotelPage
