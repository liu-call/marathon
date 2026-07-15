import { News } from '../types'

const mockNews: News[] = [
  {
    _id: '1',
    title: '2026北京马拉松报名正式启动',
    source: '官方公众号',
    content: '2026北京马拉松将于9月17日鸣枪开跑，报名通道于7月1日正式开启...',
    raceName: '北京马拉松',
    imageUrl: 'https://picsum.photos/id/1039/750/400',
    publishDate: '2026-06-28',
    tags: ['全马', '金标赛事', '北京'],
    isOfficial: true,
  },
  {
    _id: '2',
    title: '上海马拉松获评世界田联白金标赛事',
    source: '世界田联',
    content: '世界田联正式公布最新评级，上海马拉松成功晋升白金标赛事...',
    raceName: '上海马拉松',
    imageUrl: 'https://picsum.photos/id/1018/750/400',
    publishDate: '2026-06-25',
    tags: ['全马', '白金标', '上海'],
    isOfficial: true,
  },
  {
    _id: '3',
    title: '2026广州马拉松12月13日开跑，路线图公布',
    source: '广马官网',
    content: '广州马拉松组委会公布了2026年比赛路线，途经天河体育中心、花城广场...',
    raceName: '广州马拉松',
    imageUrl: 'https://picsum.photos/id/1044/750/400',
    publishDate: '2026-06-20',
    tags: ['全马', '广州'],
    isOfficial: true,
  },
  {
    _id: '4',
    title: '跑步装备指南：2026年最佳碳板跑鞋推荐',
    source: '跑者世界',
    content: '碳板跑鞋已经成为马拉松选手的标配，本文为你盘点2026年最值得入手的碳板跑鞋...',
    imageUrl: 'https://picsum.photos/id/1/750/400',
    publishDate: '2026-06-15',
    tags: ['装备', '跑鞋'],
    isOfficial: false,
  },
]

export function getMockNews(): News[] {
  return mockNews
}

export default function () {
  return { list: mockNews, total: mockNews.length, page: 1, limit: 20 }
}
