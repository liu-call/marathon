import { Race } from '../types'

const mockRaces: Race[] = [
  {
    _id: '1',
    raceName: '北京马拉松',
    raceDate: '2026-09-17',
    raceType: '全程马拉松',
    raceLocation: '北京·天安门广场',
    raceDistance: 42.195,
    registrationOpenDate: '2026-07-01',
    registrationCloseDate: '2026-07-20',
    lotteryDate: '2026-07-25',
    lotteryResultDate: '2026-07-28',
    bibNumber: 'A1234',
    status: '已中签',
    notes: '金标赛事，目标 sub 330',
  },
  {
    _id: '2',
    raceName: '上海马拉松',
    raceDate: '2026-11-29',
    raceType: '全程马拉松',
    raceLocation: '上海·外滩',
    raceDistance: 42.195,
    registrationOpenDate: '2026-09-01',
    registrationCloseDate: '2026-09-20',
    status: '待报名',
  },
  {
    _id: '3',
    raceName: '杭州马拉松',
    raceDate: '2026-11-03',
    raceType: '半程马拉松',
    raceLocation: '杭州·西湖',
    raceDistance: 21.0975,
    status: '已报名',
  },
  {
    _id: '4',
    raceName: '广州马拉松',
    raceDate: '2026-12-13',
    raceType: '全程马拉松',
    raceLocation: '广州·天河体育中心',
    raceDistance: 42.195,
    status: '待报名',
  },
  {
    _id: '5',
    raceName: '成都马拉松',
    raceDate: '2026-10-25',
    raceType: '全程马拉松',
    raceLocation: '成都·天府广场',
    raceDistance: 42.195,
    status: '已报名',
  },
]

export function getMockRaces(): Race[] {
  return mockRaces
}

export default function () {
  return mockRaces
}
