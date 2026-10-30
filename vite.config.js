import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const strategySchema = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    offense: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['title', 'detail', 'evidence'],
        additionalProperties: false,
      },
    },
    defense: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['title', 'detail', 'evidence'],
        additionalProperties: false,
      },
    },
    caution: { type: 'string' },
  },
  required: ['headline', 'offense', 'defense', 'caution'],
  additionalProperties: false,
}

function createMatchupStrategyMiddleware(apiKey, model) {
  return async (req, res, next) => {
    if (req.method !== 'POST') return next()
    if (!apiKey) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'AI_NOT_CONFIGURED' }))
      return
    }

    let rawBody = ''
    for await (const chunk of req) {
      rawBody += chunk
      if (rawBody.length > 24_000) {
        res.statusCode = 413
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'REQUEST_TOO_LARGE' }))
        return
      }
    }

    try {
      const payload = JSON.parse(rawBody || '{}')
      if (!payload.team?.name || !payload.opponent?.name || !payload.team?.stats || !payload.opponent?.stats) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'INVALID_MATCHUP_DATA' }))
        return
      }

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          instructions: [
            '당신은 NBA 경기 전략 분석가입니다. 입력은 2025-26 시즌 선수 박스스코어 기반 팀 요약입니다.',
            '입력에 있는 수치와 선수 이름만 사실처럼 언급하세요. 슛 위치, 플레이 유형, 수비 매치업처럼 제공되지 않은 데이터는 있다고 가정하거나 수치화하지 마세요.',
            '수치가 전술을 입증한다고 단정하지 말고, 각 제안을 기록에 기반한 가설로 설명하세요. 과장된 승리 예측이나 확정적인 결과를 말하지 마세요.',
            '한국어로 간결하고 실제 경기에서 실행 가능한 공격 2개와 수비 2개를 작성하세요. evidence에는 근거로 쓴 입력 지표 이름을 적으세요.',
            'caution에는 실제 플레이 단위 데이터가 없는 박스스코어 기반 제안이라는 한계를 짧게 적으세요.',
          ].join(' '),
          input: JSON.stringify(payload),
          text: {
            format: {
              type: 'json_schema',
              name: 'nba_matchup_strategy',
              strict: true,
              schema: strategySchema,
            },
          },
          max_output_tokens: 900,
        }),
      })

      if (!response.ok) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'AI_PROVIDER_ERROR' }))
        return
      }

      const responseBody = await response.json()
      const outputText = (responseBody.output || [])
        .filter((item) => item.type === 'message')
        .flatMap((item) => item.content || [])
        .find((item) => item.type === 'output_text')?.text
      if (!outputText) throw new Error('Missing structured output')

      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ strategy: JSON.parse(outputText) }))
    } catch {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'AI_RESPONSE_INVALID' }))
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'OPENAI_')

  return {
    plugins: [
      react(),
      {
        name: 'matchup-strategy-api',
        configureServer(server) {
          server.middlewares.use('/api/matchup-strategy', createMatchupStrategyMiddleware(
            process.env.OPENAI_API_KEY || env.OPENAI_API_KEY,
            process.env.OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-5-mini',
          ))
        },
      },
    ],
  }
})
