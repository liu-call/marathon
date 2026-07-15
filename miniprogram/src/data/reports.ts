import { AnnualReport } from '../types'

const mockReport: AnnualReport = {
  _id: '1',
  year: 2026,
  summary: {
    totalRaces: 5,
    finishedRaces: 5,
    finishRate: 100,
    totalDistance: 157.66,
    pbBreakthroughs: 3,
    fullMarathonCount: 3,
    halfMarathonCount: 1,
  },
  highlights: {
    fullPB: '03:32:15',
    halfPB: '01:38:20',
    fastestRace: '南京10公里精英赛',
    improvement: '较去年PB提升13分7秒',
  },
  totalExpense: 8960,
  expenseBreakdown: {
    报名: 600,
    住宿: 2800,
    交通: 3600,
    餐饮: 1100,
    装备: 600,
    其他: 260,
  },
  monthlyDistribution: {
    '1': 0, '2': 0, '3': 1, '4': 0, '5': 0, '6': 0,
    '7': 0, '8': 0, '9': 1, '10': 1, '11': 2, '12': 0,
  },
  aiSummary:
    '2026年是你突破自我的一年！全年5场比赛，3次刷新PB，全马PB提升至3:32:15。北马、上马、广马三场金标赛事的历练让你愈发沉稳。累计跑量157.66km，花费8960元。每一滴汗水都不会白流，2027年，继续向前奔跑吧！',
}

export function getMockReport(): AnnualReport {
  return mockReport
}

export default function () {
  return mockReport
}
