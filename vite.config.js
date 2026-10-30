import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const openAiPlacementSchema = {
  type: 'object',
  properties: {
    PG: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        role: { type: 'string' },
      },
      required: ['x', 'y', 'role'],
      additionalProperties: false,
    },
    SG: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        role: { type: 'string' },
      },
      required: ['x', 'y', 'role'],
      additionalProperties: false,
    },
    SF: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        role: { type: 'string' },
      },
      required: ['x', 'y', 'role'],
      additionalProperties: false,
    },
    PF: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        role: { type: 'string' },
      },
      required: ['x', 'y', 'role'],
      additionalProperties: false,
    },
    C: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        role: { type: 'string' },
      },
      required: ['x', 'y', 'role'],
      additionalProperties: false,
    },
  },
  required: ['PG', 'SG', 'SF', 'PF', 'C'],
  additionalProperties: false,
}

const openAiRouteSchema = {
  type: 'object',
  properties: {
    from: { type: 'string' },
    to: { type: 'string' },
    type: { type: 'string' },
    path: { type: 'string' },
    label: { type: 'string' },
  },
  required: ['from', 'to', 'type', 'path', 'label'],
  additionalProperties: false,
}

const openAiStrategySchema = {
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
    courtTactics: {
      type: 'object',
      properties: {
        offense: {
          type: 'object',
          properties: {
            playName: { type: 'string' },
            tacticalConcept: { type: 'string' },
            playerPlacements: openAiPlacementSchema,
            routes: {
              type: 'array',
              items: openAiRouteSchema,
            },
          },
          required: ['playName', 'tacticalConcept', 'playerPlacements', 'routes'],
          additionalProperties: false,
        },
        defense: {
          type: 'object',
          properties: {
            schemeName: { type: 'string' },
            tacticalConcept: { type: 'string' },
            playerPlacements: openAiPlacementSchema,
            routes: {
              type: 'array',
              items: openAiRouteSchema,
            },
          },
          required: ['schemeName', 'tacticalConcept', 'playerPlacements', 'routes'],
          additionalProperties: false,
        },
      },
      required: ['offense', 'defense'],
      additionalProperties: false,
    },
  },
  required: ['headline', 'offense', 'defense', 'caution', 'courtTactics'],
  additionalProperties: false,
}

const geminiPlacementSchema = {
  type: 'OBJECT',
  properties: {
    PG: {
      type: 'OBJECT',
      properties: {
        x: { type: 'NUMBER' },
        y: { type: 'NUMBER' },
        role: { type: 'STRING' },
      },
      required: ['x', 'y', 'role'],
    },
    SG: {
      type: 'OBJECT',
      properties: {
        x: { type: 'NUMBER' },
        y: { type: 'NUMBER' },
        role: { type: 'STRING' },
      },
      required: ['x', 'y', 'role'],
    },
    SF: {
      type: 'OBJECT',
      properties: {
        x: { type: 'NUMBER' },
        y: { type: 'NUMBER' },
        role: { type: 'STRING' },
      },
      required: ['x', 'y', 'role'],
    },
    PF: {
      type: 'OBJECT',
      properties: {
        x: { type: 'NUMBER' },
        y: { type: 'NUMBER' },
        role: { type: 'STRING' },
      },
      required: ['x', 'y', 'role'],
    },
    C: {
      type: 'OBJECT',
      properties: {
        x: { type: 'NUMBER' },
        y: { type: 'NUMBER' },
        role: { type: 'STRING' },
      },
      required: ['x', 'y', 'role'],
    },
  },
  required: ['PG', 'SG', 'SF', 'PF', 'C'],
}

const geminiRouteSchema = {
  type: 'OBJECT',
  properties: {
    from: { type: 'STRING' },
    to: { type: 'STRING' },
    type: { type: 'STRING' },
    path: { type: 'STRING' },
    label: { type: 'STRING' },
  },
  required: ['from', 'to', 'type', 'path', 'label'],
}

const geminiStrategySchema = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING' },
    offense: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          detail: { type: 'STRING' },
          evidence: { type: 'STRING' },
        },
        required: ['title', 'detail', 'evidence'],
      },
    },
    defense: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          detail: { type: 'STRING' },
          evidence: { type: 'STRING' },
        },
        required: ['title', 'detail', 'evidence'],
      },
    },
    caution: { type: 'STRING' },
    courtTactics: {
      type: 'OBJECT',
      properties: {
        offense: {
          type: 'OBJECT',
          properties: {
            playName: { type: 'STRING' },
            tacticalConcept: { type: 'STRING' },
            playerPlacements: geminiPlacementSchema,
            routes: {
              type: 'ARRAY',
              items: geminiRouteSchema,
            },
          },
          required: ['playName', 'tacticalConcept', 'playerPlacements', 'routes'],
        },
        defense: {
          type: 'OBJECT',
          properties: {
            schemeName: { type: 'STRING' },
            tacticalConcept: { type: 'STRING' },
            playerPlacements: geminiPlacementSchema,
            routes: {
              type: 'ARRAY',
              items: geminiRouteSchema,
            },
          },
          required: ['schemeName', 'tacticalConcept', 'playerPlacements', 'routes'],
        },
      },
      required: ['offense', 'defense'],
    },
  },
  required: ['headline', 'offense', 'defense', 'caution', 'courtTactics'],
}

function buildPromptInstructions(payload) {
  const isCustom = Boolean(payload.team?.isCustomLineup)
  const baseInstructions = [
    '당신은 NBA 전문 경기 전략 및 2D 코트 전술(공격 & 수비) 설계 수석 코치 AI 에이전트입니다.',
    '입력 데이터는 2025-26 시즌 선수 박스스코어, 팀 지표, 라인업 정보입니다.',
    '입력에 있는 수치와 선수명, 전술 유형만을 기반으로 실현 가능한 전술적 가설을 세우고, 단정적이거나 과장된 승리 예측은 삼가세요.',
    '한국어로 간결하고 실제 코트 경기에서 실행 가능한 공격 2개와 수비 2개를 작성하세요.',
    'headline에는 이 맞대결의 핵심 전술 테마를 한 줄(25자 이내)로 요약하세요.',
    'evidence에는 근거로 쓴 핵심 지표(예: 3점 시도, 어시스트, 상대 득점원 프로필 등)를 적으세요.',
    'caution에는 박스스코어 기반 시뮬레이션의 한계와 실전 주의점을 짧게 적으세요.',
    '',
    '[2D 농구 코트 전술 시각화(courtTactics) 지침]:',
    '코트 도화지 규격은 가로 600, 세로 425이며, 림(Basket)은 (300, 365)에 있습니다.',
    '1. offense (공격 전술):',
    '   - playName: 공격 세트피스 명칭 (예: "5-Out 스페이싱 & 킥아웃", "혼스 픽앤팝", "스페인 픽앤롤")',
    '   - tacticalConcept: 상대 수비 약점을 노리는 공격 목적 (35자 내외)',
    '   - playerPlacements: 5명(PG, SG, SF, PF, C)의 코트 위 공격 좌표 (x, y)와 공격 역할(role)',
    '   - routes: 공격 동선 2~4개 (type: "dribble" | "pass" | "screen" | "cut")',
    '2. defense (수비 전술):',
    '   - schemeName: 수비 전술 명칭 (예: "드롭 커버리지 & 윙 디나이", "스위치 올 수비", "더블팀 트랩 & 로테이션", "2-3 존 디펜스")',
    '   - tacticalConcept: 상대 1옵션 득점원 및 공격 핵심을 봉쇄하기 위한 수비 의도 (35자 내외)',
    '   - playerPlacements: 5명(PG, SG, SF, PF, C)의 코트 위 수비 위치 (x, y)와 수비 역할(role: 예: "온볼 압박", "윙 디나이", "헬프 디펜스", "림 프로텍터", "박스아웃")',
    '   - routes: 수비 대응 동선 2~4개 (type: "closeout" | "rotation" | "trap" | "drop")',
    '   - path: 유효한 SVG 패스 문자열 (예: "M 300 160 Q 260 210 220 280", "M 230 290 L 300 340")'
  ]

  if (isCustom) {
    baseInstructions.push(
      '',
      '★ 주의: 분석 팀은 사용자가 머신러닝(K-Means & KNN) 대체 선수 추천을 통해 직접 5인 라인업을 리빌딩한 [맞춤 라인업]입니다.',
      '새로 영입/교체 투입된 선수(isReplaced: true)의 포지션과 군집 역할을 살릴 수 있는 최적의 공격 위치와 수비 역할을 코트 전술(offense & defense)에 모두 명확히 반영하세요.'
    )
  }

  return baseInstructions.join('\n')
}

async function requestGeminiStrategy(apiKey, model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const instructions = buildPromptInstructions(payload)

  const body = {
    contents: [
      {
        parts: [
          {
            text: `${instructions}\n\n[경기 매치업 및 팀 데이터]:\n${JSON.stringify(payload, null, 2)}\n\n위 데이터를 분석하여 지정된 JSON 스키마 형식으로 응답하세요.`
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: geminiStrategySchema,
      temperature: 0.2
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Gemini API Error (${response.status}):`, errorText)
    throw new Error(`GEMINI_API_ERROR_${response.status}`)
  }

  const result = await response.json()
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) throw new Error('EMPTY_GEMINI_OUTPUT')

  const cleanText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleanText)
}

async function requestOpenAiStrategy(apiKey, model, payload) {
  const instructions = buildPromptInstructions(payload)
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions,
      input: JSON.stringify(payload),
      text: {
        format: {
          type: 'json_schema',
          name: 'nba_matchup_strategy',
          strict: true,
          schema: openAiStrategySchema,
        },
      },
      max_output_tokens: 1600,
    }),
  })

  if (!response.ok) {
    throw new Error(`OPENAI_API_ERROR_${response.status}`)
  }

  const responseBody = await response.json()
  const outputText = (responseBody.output || [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .find((item) => item.type === 'output_text')?.text
  if (!outputText) throw new Error('Missing structured output')

  return JSON.parse(outputText)
}

function createMatchupStrategyMiddleware(apiConfig) {
  const { geminiApiKey, geminiModel, openaiApiKey, openaiModel } = apiConfig

  return async (req, res, next) => {
    if (req.method !== 'POST') return next()
    if (!geminiApiKey && !openaiApiKey) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'AI_NOT_CONFIGURED' }))
      return
    }

    let rawBody = ''
    for await (const chunk of req) {
      rawBody += chunk
      if (rawBody.length > 50_000) {
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

      // 1) Gemini API 우선 사용
      if (geminiApiKey) {
        try {
          const strategy = await requestGeminiStrategy(geminiApiKey, geminiModel, payload)
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ strategy, provider: 'gemini' }))
          return
        } catch (geminiError) {
          console.warn('Gemini primary model failed, attempting fallback if applicable:', geminiError.message)
          if (geminiError.message.includes('404') && geminiModel !== 'gemini-1.5-flash') {
            try {
              const strategy = await requestGeminiStrategy(geminiApiKey, 'gemini-1.5-flash', payload)
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ strategy, provider: 'gemini' }))
              return
            } catch (fallbackError) {
              console.error('Gemini fallback failed:', fallbackError)
            }
          }
          if (!openaiApiKey) throw geminiError
        }
      }

      // 2) OpenAI API 사용
      if (openaiApiKey) {
        const strategy = await requestOpenAiStrategy(openaiApiKey, openaiModel, payload)
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ strategy, provider: 'openai' }))
        return
      }

      throw new Error('ALL_AI_PROVIDERS_FAILED')
    } catch (err) {
      console.error('Matchup strategy generation failed:', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'AI_RESPONSE_INVALID', message: err.message }))
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY || env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-1.5-flash',
    openaiApiKey: process.env.OPENAI_API_KEY || env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-5-mini',
  }

  return {
    plugins: [
      react(),
      {
        name: 'matchup-strategy-api',
        configureServer(server) {
          server.middlewares.use('/api/matchup-strategy', createMatchupStrategyMiddleware(apiConfig))
        },
      },
    ],
  }
})
