import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private readonly apiKey = process.env.LLM_API_KEY
  private readonly apiUrl = process.env.LLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4'
  private readonly model = process.env.LLM_MODEL || 'glm-4'
  private readonly visionModel = process.env.LLM_VISION_MODEL || 'glm-4v'

  /** 文本解析（赛事信息/表格映射/年度感言） */
  async parseText(prompt: string, temperature = 0): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      )
      const content = response.data.choices[0].message.content
      // 尝试提取 JSON
      return this.extractJson(content)
    } catch (err) {
      this.logger.error('AI parseText failed', err.response?.data || err.message)
      throw new Error('AI 解析失败')
    }
  }

  /** 多模态 OCR（成绩证书识别） */
  async parseImage(imageUrl: string, prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.visionModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: prompt },
              ],
            },
          ],
          temperature: 0,
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      )
      const content = response.data.choices[0].message.content
      return this.extractJson(content)
    } catch (err) {
      this.logger.error('AI parseImage failed', err.response?.data || err.message)
      throw new Error('AI 图片识别失败')
    }
  }

  /** 生成文本（年度报告感言等） */
  async generateText(prompt: string, temperature = 0.7): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      )
      return response.data.choices[0].message.content
    } catch (err) {
      this.logger.error('AI generateText failed', err.response?.data || err.message)
      throw new Error('AI 生成失败')
    }
  }

  /** 语音解析赛事信息 */
  async parseVoiceRace(transcript: string): Promise<any> {
    const prompt = `请从以下语音转文字内容中提取马拉松赛事信息，返回 JSON 格式：
{
  "raceName": "赛事名称",
  "raceDate": "比赛日期 YYYY-MM-DD",
  "registrationOpenDate": "报名开始日期 YYYY-MM-DD",
  "registrationCloseDate": "报名截止日期 YYYY-MM-DD",
  "lotteryDate": "抽签日期 YYYY-MM-DD",
  "lotteryResultDate": "抽签结果公布日期 YYYY-MM-DD",
  "raceLocation": "比赛地点",
  "raceType": "全程马拉松/半程马拉松",
  "raceDistance": 42.195
}
无法识别的字段返回 null。只返回 JSON，不要其他内容。

用户输入：${transcript}`
    return this.parseText(prompt)
  }

  /** 成绩证书 OCR 识别 */
  async parseResultCertificate(imageUrl: string): Promise<any> {
    const prompt = `这是一张马拉松成绩证书，请识别以下信息并返回 JSON：
{
  "raceName": "赛事名称",
  "raceDate": "比赛日期 YYYY-MM-DD",
  "raceDistance": 距离(km),
  "raceType": "全程马拉松/半程马拉松",
  "finishTime": "完赛时间 HH:MM:SS",
  "gunTime": "枪声时间 HH:MM:SS",
  "netTime": "净时间 HH:MM:SS",
  "overallRanking": 总排名(数字),
  "categoryRanking": 分组排名(数字),
  "pace": "平均配速 MM:SS",
  "bibNumber": "号码布"
}
无法识别的字段返回 null。只返回 JSON，不要其他内容。`
    return this.parseImage(imageUrl, prompt)
  }

  /** 年度报告 AI 感言 */
  async genAnnualSummary(yearData: any): Promise<string> {
    const prompt = `根据以下用户全年马拉松数据，生成一段个性化年度总结感言（100-200字）。
要求：鼓励性语气，提及关键数据和突破，有温度，像朋友在和你说话。

全年数据：${JSON.stringify(yearData)}`
    return this.generateText(prompt, 0.7)
  }

  /** 从 AI 返回内容中提取 JSON */
  private extractJson(content: string): any {
    // 尝试直接解析
    try {
      return JSON.parse(content)
    } catch {
      // 尝试提取 ```json ... ``` 中的内容
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        return JSON.parse(match[1].trim())
      }
      // 尝试提取 { ... } 中的内容
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('无法从 AI 返回中提取 JSON')
    }
  }
}
