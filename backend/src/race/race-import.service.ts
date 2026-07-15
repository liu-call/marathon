import { Injectable, BadRequestException } from '@nestjs/common'
import { AiService } from '../ai/ai.service'
import * as XLSX from 'xlsx'

@Injectable()
export class RaceImportService {
  constructor(private readonly aiService: AiService) {}

  /** 文本/语音转文字后解析赛事信息 */
  async parseText(text: string) {
    return this.aiService.parseVoiceRace(text)
  }

  /** 解析 Excel/CSV 表格 + AI 列映射 */
  async parseSpreadsheet(fileBuffer: Buffer, importType: string = 'race') {
    // 1. 解析表格
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    if (rows.length < 2) {
      throw new BadRequestException('表格数据不足，至少需要表头 + 1 行数据')
    }

    // 2. 提取表头和样例
    const headers = rows[0]
    const sampleRows = rows.slice(1, 4).map((row) =>
      headers.map((_, i) => row[i] || ''),
    )

    // 3. AI 列映射识别
    const columnMapping = await this.aiService.parseText(
      this.buildMappingPrompt(headers, sampleRows, importType),
    )

    // 4. 转换数据
    const mappedData = rows.slice(1)
      .map((row) => {
        const obj: any = {}
        Object.entries(columnMapping).forEach(([colIndex, fieldName]: [string, any]) => {
          if (fieldName && fieldName !== 'ignore') {
            obj[fieldName] = row[parseInt(colIndex)] || ''
          }
        })
        return obj
      })
      .filter((item) => item.raceName) // 过滤空行

    return {
      totalRows: rows.length - 1,
      headers,
      sampleRows,
      columnMapping,
      mappedData,
    }
  }

  private buildMappingPrompt(headers: any[], sampleRows: any[][], importType: string): string {
    const fieldDefs = {
      race: 'raceName, raceDate, raceType, raceLocation, raceDistance, registrationOpenDate, registrationCloseDate, lotteryDate, lotteryResultDate, bibNumber, notes',
      result: 'raceName, raceDate, raceDistance, raceType, finishTime, gunTime, netTime, overallRanking, pace, weather, notes',
    }
    const typeName = importType === 'race' ? '赛事' : '成绩'
    return `用户上传了一个${typeName}表格。
表头：${JSON.stringify(headers)}
样例数据：${JSON.stringify(sampleRows)}

请将每列表头映射到标准字段（不匹配映射为 "ignore"）：
可选字段：${fieldDefs[importType] || fieldDefs.race}

返回 JSON 格式：{ "列索引(数字字符串)": "标准字段名或ignore" }
只返回 JSON，不要其他内容。`
  }
}
