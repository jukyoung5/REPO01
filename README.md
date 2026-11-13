# PTEST01

GitHub 테스트용 간단한 Todo 웹앱입니다. 외부 의존성 없이 Node.js 내장 모듈만 사용합니다.

## 실행

```bash
npm start
```

브라우저에서 http://localhost:3000 을 엽니다. 포트는 `PORT` 환경 변수로 바꿀 수 있습니다.

## 테스트

```bash
npm test
```

`node:test` 기반 단위/API 테스트가 실행됩니다. GitHub에 push 하거나 PR을 열면 GitHub Actions(`.github/workflows/ci.yml`)가 Node 20/22/24에서 테스트를 실행합니다.

## API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/todos` | 목록 조회 |
| POST | `/api/todos` | 추가 (`{ "title": "..." }`) |
| PATCH | `/api/todos/:id` | 완료 여부 토글 |
| DELETE | `/api/todos/:id` | 삭제 |

데이터는 메모리에 저장되므로 서버를 재시작하면 초기화됩니다.

## 구조

```
public/   정적 프론트엔드 (HTML/CSS/JS)
src/      서버(server.js)와 Todo 저장소(todos.js)
test/     node:test 테스트
```
