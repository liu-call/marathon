import Taro from '@tarojs/taro'

// 后端 API 地址（部署时修改为实际地址）
const BASE_URL = 'https://api.example.com/api'

// 本地开发 mock 开关
const USE_MOCK = true

/**
 * 封装 HTTP 请求
 */
export async function request<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, any>,
): Promise<T> {
  // Mock 模式
  if (USE_MOCK) {
    return mockRequest<T>(url, method, data)
  }

  const token = Taro.getStorageSync('token')
  const res = await Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (res.statusCode >= 400) {
    console.error(`[API] ${method} ${url} failed:`, res.statusCode, res.data)
    throw new Error(res.data?.message || '请求失败')
  }

  return res.data as T
}

/**
 * 上传文件
 */
export async function uploadFile(
  filePath: string,
  folder = 'images',
): Promise<{ url: string }> {
  if (USE_MOCK) {
    return { url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/400/300` }
  }

  const token = Taro.getStorageSync('token')
  const res = await Taro.uploadFile({
    url: `${BASE_URL}/upload`,
    filePath,
    name: 'file',
    formData: { folder },
    header: { Authorization: token ? `Bearer ${token}` : '' },
  })

  if (res.statusCode >= 400) {
    throw new Error('上传失败')
  }

  return JSON.parse(res.data)
}

// ============================================
// Mock 请求处理（开发预览用）
// ============================================
async function mockRequest<T>(url: string, method: string, data?: any): Promise<T> {
  await new Promise((r) => setTimeout(r, 300)) // 模拟网络延迟

  // 赛事列表
  if (url === '/races' && method === 'GET') {
    const { getMockRaces } = await import('../data/races')
    return getMockRaces() as any
  }
  // 创建赛事
  if (url === '/races' && method === 'POST') {
    return { _id: 'mock-' + Date.now(), ...data } as any
  }
  // 即将开跑
  if (url === '/races/upcoming' && method === 'GET') {
    const { getMockRaces } = await import('../data/races')
    const races = getMockRaces()
    return races.filter((r) => new Date(r.raceDate) > new Date()).slice(0, 3) as any
  }
  // 成绩列表（支持 raceId / raceType / year 过滤）
  if (url === '/results' && method === 'GET') {
    const { getMockResults } = await import('../data/results')
    let list = getMockResults()
    if (data?.raceId) list = list.filter((r) => r.raceId === data.raceId)
    if (data?.raceType) list = list.filter((r) => r.raceType === data.raceType)
    if (data?.year) list = list.filter((r) => r.raceDate.startsWith(String(data.year)))
    return { list, total: list.length, page: 1, limit: 20 } as any
  }
  // PB
  if (url === '/results/pb' && method === 'GET') {
    const { getMockPB } = await import('../data/results')
    return getMockPB() as any
  }
  // 成绩汇总
  if (url === '/results/summary' && method === 'GET') {
    const { getMockSummary } = await import('../data/results')
    return getMockSummary() as any
  }
  // 花费汇总
  if (url.startsWith('/expenses/summary') && method === 'GET') {
    const { getMockExpenseSummary } = await import('../data/expenses')
    return getMockExpenseSummary() as any
  }
  // 年度报告
  if (url === '/reports/annual/2026' && method === 'GET') {
    const { getMockReport } = await import('../data/reports')
    return getMockReport() as any
  }
  // 资讯列表
  if (url === '/news' && method === 'GET') {
    const { getMockNews } = await import('../data/news')
    return { list: getMockNews(), total: getMockNews().length, page: 1, limit: 20 } as any
  }
  // 资讯详情
  if (url.startsWith('/news/') && method === 'GET') {
    const { getMockNews } = await import('../data/news')
    const id = url.split('/').pop()
    const item = getMockNews().find((n) => n._id === id)
    if (item) {
      return { ...item, content: item.content || `<p>${item.title}</p><p>详情内容加载中...</p>` } as any
    }
    return { title: '资讯不存在', content: '<p>资讯不存在</p>' } as any
  }
  // 酒店列表
  if (url === '/hotels' && method === 'GET') {
    return [
      {
        _id: '1',
        raceId: '1',
        raceName: '北京马拉松',
        hotelName: '北京王府井希尔顿酒店',
        checkInDate: '2026-09-16',
        checkOutDate: '2026-09-18',
        nights: 2,
        price: 880,
        totalPrice: 1760,
        distanceToStart: '1.2km',
        address: '北京市东城区王府井大街8号',
        status: '已确认',
      },
      {
        _id: '2',
        raceId: '3',
        raceName: '杭州马拉松',
        hotelName: '杭州西湖国贸酒店',
        checkInDate: '2026-11-02',
        checkOutDate: '2026-11-04',
        nights: 2,
        price: 520,
        totalPrice: 1040,
        distanceToStart: '0.8km',
        address: '杭州市西湖区体育场路1号',
        status: '待确认',
      },
    ] as any
  }
  // 按赛事ID获取酒店
  if (url.startsWith('/hotels/race/') && method === 'GET') {
    const raceId = url.split('/').pop()
    const allHotels = [
      { _id: '1', raceId: '1', raceName: '北京马拉松', hotelName: '北京王府井希尔顿酒店', checkInDate: '2026-09-16', checkOutDate: '2026-09-18', nights: 2, price: 880, totalPrice: 1760, distanceToStart: '1.2km', address: '北京市东城区王府井大街8号', status: '已确认' },
      { _id: '2', raceId: '3', raceName: '杭州马拉松', hotelName: '杭州西湖国贸酒店', checkInDate: '2026-11-02', checkOutDate: '2026-11-04', nights: 2, price: 520, totalPrice: 1040, distanceToStart: '0.8km', address: '杭州市西湖区体育场路1号', status: '待确认' },
    ]
    return allHotels.filter(h => h.raceId === raceId) as any
  }
  // 赛事详情
  if (url.startsWith('/races/') && method === 'GET') {
    const { getMockRaces } = await import('../data/races')
    const id = url.split('/').pop()
    return getMockRaces().find(r => r._id === id) as any
  }

  console.warn(`[Mock] 未匹配: ${method} ${url}`)
  return {} as T
}
