// 赛事
export interface Race {
  _id?: string
  raceName: string
  raceDate: string
  raceType: string
  raceLocation?: string
  raceDistance: number
  registrationOpenDate?: string
  registrationCloseDate?: string
  lotteryDate?: string
  lotteryResultDate?: string
  bibNumber?: string
  status: string
  notes?: string
  sourceType?: string
}

// 成绩
export interface Result {
  _id?: string
  raceId?: string
  raceName: string
  raceDate: string
  raceDistance: number
  raceType: string
  finishTime: string
  finishTimeSeconds?: number
  gunTime?: string
  netTime?: string
  overallRanking?: number
  pace: string
  weather?: string
  bibNumber?: string
  notes?: string
  isPB?: boolean
  splits?: { km: number; time: string }[]
}

// 花费
export interface Expense {
  _id?: string
  raceId?: string
  raceName: string
  raceDate: string
  expenses: {
    registrationFee: number
    accommodation: number
    transportation: number
    food: number
    gear: number
    other: number
  }
  totalAmount: number
  year: number
}

// 酒店
export interface Hotel {
  _id?: string
  raceId?: string
  raceName?: string
  hotelName: string
  checkInDate?: string
  checkOutDate?: string
  nights: number
  price: number
  totalPrice: number
  distanceToStart?: string
  address?: string
  status?: string
}

// 年度报告
export interface AnnualReport {
  _id?: string
  year: number
  summary: {
    totalRaces: number
    finishedRaces: number
    finishRate: number
    totalDistance: number
    pbBreakthroughs: number
    fullMarathonCount: number
    halfMarathonCount: number
  }
  highlights: {
    fullPB: string | null
    halfPB: string | null
    fastestRace: string | null
    improvement: string
  }
  totalExpense: number
  expenseBreakdown: Record<string, number>
  monthlyDistribution: Record<string, number>
  aiSummary: string
  shareImage?: string
}

// 资讯
export interface News {
  _id?: string
  title: string
  source?: string
  content?: string
  raceName?: string
  imageUrl?: string
  publishDate: string
  tags?: string[]
  isOfficial?: boolean
}

// 用户
export interface User {
  userId: string
  openid: string
  nickName: string
  avatarUrl?: string
  role: string
  token: string
}

// PB 数据
export interface PBData {
  fullMarathon?: { finishTime: string; raceName: string; raceDate: string }
  halfMarathon?: { finishTime: string; raceName: string; raceDate: string }
  tenK?: { finishTime: string; raceName: string; raceDate: string }
}

// 成绩汇总
export interface ResultSummary {
  totalRaces: number
  totalDistance: number
  averagePace: string
  pbCount: number
}

// 列表响应
export interface ListResponse<T> {
  list: T[]
  total: number
  page: number
  limit: number
}
