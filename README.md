# NBA_COURTRUSH

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


npm run dev

## 두 팀 경기 전략 AI (로컬 개발용)

기록 기반 기본 추천은 API 키 없이 사용할 수 있습니다. `AI 전략 생성`을 눌러 실제 모델 분석을 받으려면 프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 입력한 뒤 개발 서버를 다시 시작하세요.

```env
OPENAI_API_KEY=여기에_API_키
OPENAI_MODEL=gpt-5-mini
```

AI 호출은 버튼을 눌렀을 때만 이루어집니다. API 키는 Vite 개발 서버에서만 읽고 브라우저 코드로 보내지 않습니다. 이 연결은 로컬 Vite 개발 서버용이며, 배포 환경에서는 별도의 서버 API 경로를 구성해야 합니다.
