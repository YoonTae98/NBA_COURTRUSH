# NBA_COURTRUSH

NBA 머신러닝 군집화(K-Means & KNN) 기반 대체 선수 스카우팅 및 2D 경기 전략 분석 플랫폼

```bash
# 개발 서버 실행
npm run dev
```

---

## ⚡ 두 팀 경기 전략 분석 (AI Agent 연동)

코트 전술판에서 K-Means 및 KNN 추천으로 **직접 구성/보강한 5인 라인업(짜여진 팀)**을 바탕으로, 리그 상대 구단과의 맞대결 상성 및 AI 전술 분석을 수행할 수 있습니다.

기록 기반 기본 룰 추천은 API 키 없이 동작하며, **Gemini AI 에이전트의 심층 전술 리포트(공격 2개, 수비 2개, 전술 헤드라인 및 주의점)**를 실시간으로 받아보려면 프로젝트 루트에 `.env` 또는 `.env.local` 파일을 만들고 아래 키를 입력하세요.

### 1. Google Gemini API 설정 (추천)
프로젝트 루트의 `.env` 또는 `.env.local` 파일:
```env
GEMINI_API_KEY=여기에_구글_제미나이_API_키
GEMINI_MODEL=gemini-1.5-flash
```

*(선택 사항: `GEMINI_MODEL`은 생략 시 `gemini-1.5-flash`가 기본 적용되며, `gemini-2.5-flash` 등으로 지정 가능합니다.)*

### 2. OpenAI API 설정 (선택 사항 - Gemini 키가 없을 경우 자동 사용)
```env
OPENAI_API_KEY=여기에_OpenAI_API_키
OPENAI_MODEL=gpt-5-mini
```

> **보안 및 실행 방식:**
> AI 호출은 사용자가 전략 분석 화면에서 `AI 전략 생성` 버튼을 클릭했을 때만 호출됩니다. API 키는 Vite 로컬 개발 서버 내부에서만 참조되며 브라우저 프론트엔드로 절대 노출되지 않습니다.
