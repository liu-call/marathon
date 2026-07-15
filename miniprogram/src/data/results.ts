import { Result, PBData, ResultSummary } from '../types'

const mockResults: Result[] = [
  {
    _id: '1',
    raceId: '1',
    raceName: '北京马拉松',
    raceDate: '2026-09-17',
    raceDistance: 42.195,
    raceType: '全程马拉松',
    finishTime: '03:32:15',
    gunTime: '03:33:02',
    netTime: '03:32:15',
    overallRanking: 3200,
    pace: '05:01',
    weather: '晴 18℃',
    bibNumber: 'A1234',
    notes: '后程掉速，补给策略需改进',
    isPB: true,
    splits: [
      { km: 5, time: '00:25:10' },
      { km: 10, time: '00:50:30' },
      { km: 21, time: '01:46:00' },
    ],
  },
  {
    _id: '2',
    raceId: '2',
    raceName: '上海马拉松',
    raceDate: '2025-11-27',
    raceDistance: 42.195,
    raceType: '全程马拉松',
    finishTime: '03:45:22',
    overallRanking: 5500,
    pace: '05:20',
    weather: '多云 16℃',
    isPB: false,
  },
  {
    _id: '3',
    raceId: '3',
    raceName: '杭州半程马拉松',
    raceDate: '2026-11-03',
    raceDistance: 21.0975,
    raceType: '半程马拉松',
    finishTime: '01:38:20',
    overallRanking: 1200,
    pace: '04:39',
    weather: '晴 20℃',
    isPB: true,
  },
  {
    _id: '4',
    raceId: '4',
    raceName: '广州马拉松',
    raceDate: '2025-12-08',
    raceDistance: 42.195,
    raceType: '全程马拉松',
    finishTime: '03:52:10',
    pace: '05:30',
    isPB: false,
  },
  {
    _id: '5',
    raceName: '南京10公里精英赛',
    raceDate: '2026-03-15',
    raceDistance: 10,
    raceType: '10km',
    finishTime: '00:45:30',
    pace: '04:33',
    isPB: true,
  },
]

export function getMockResults(): Result[] {
  return mockResults
}

export function getMockPB(): PBData {
  return {
    fullMarathon: { finishTime: '03:32:15', raceName: '北京马拉松', raceDate: '2026-09-17' },
    halfMarathon: { finishTime: '01:38:20', raceName: '杭州半程马拉松', raceDate: '2026-11-03' },
    tenK: { finishTime: '00:45:30', raceName: '南京10公里精英赛', raceDate: '2026-03-15' },
  }
}

export function getMockSummary(): ResultSummary {
  return {
    totalRaces: 5,
    totalDistance: 157.66,
    averagePace: '05:01',
    pbCount: 3,
  }
}

export default function () {
  return { list: mockResults, total: mockResults.length, page: 1, limit: 20 }
}
