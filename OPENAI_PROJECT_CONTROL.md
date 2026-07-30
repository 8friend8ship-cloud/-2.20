# OpenAI Project Control

- Repository: `8friend8ship-cloud/-2.20`
- Actual package: `인테리어-전문가-ai`
- Project role: **인테리어 전문가 AI 중복·버전 비교본**
- Management status: `DUPLICATE_REVIEW`
- Last reviewed: `2026-07-30 KST`

## 1. 활용 방향

이 저장소는 `interior`와 동일 계열 앱이므로 신규 기능을 독립적으로 계속 추가하는 운영본이 아니라, 두 저장소의 파일·기능·커밋을 비교해 **어느 쪽을 기준본으로 삼을지 결정하기 위한 비교본**으로 관리한다.

## 2. 상호 연계

- 기준 후보: `interior`
- Drive 원본: `HD_AGENT_DB`, `HD_PLATFORM_FOLDER`, `HD_ESTIMATE_REFERENCE`
- 글/콘텐츠: `DRYWRITE`
- 분석: `Analyzer-12.09`

## 3. Drive 연계 정책

고객명·주소·견적서·계약서·현장 사진의 실제 URL/ID를 공개 저장소에 넣지 않는다.

- `MASTER_REGISTRY`
- `HD_AGENT_DB`
- `HD_ESTIMATE_REFERENCE`
- `HD_CONTRACT_REFERENCE`

## 4. 파일 꼬리표

- `[DUPLICATE]`: `interior`와 중복
- `[NEWER]`: 비교 결과 더 최신인 파일
- `[PORT]`: `interior`로 옮길 기능
- `[LEGACY]`: 보관 후 신규 수정 금지
- `[ESTIMATE]`: 엑셀/견적
- `[PRIVACY]`: 고객/현장 개인정보
- `[AI]`: Gemini 분석
- `[SECRET]`: 키 점검
- `[REVIEW]`: 비교 미완료

## 5. 초기 파일 대장

| 파일/영역 | 태그 | 활용 방향 | 상태 | 다음 점검 |
|---|---|---|---|---|
| `package.json` | `[DUPLICATE] [REVIEW]` | `interior`와 거의 같은 의존성 | 확인됨 | 버전·lint 차이 비교 |
| `App.tsx` | `[DUPLICATE]` | 화면·기능 비교 대상 | 검토 예정 | 파일별 diff 작성 |
| 엑셀 처리 | `[ESTIMATE] [PORT]` | 최신 기능이면 운영본으로 이동 | 검토 예정 | 수식/내보내기 차이 확인 |
| 캡처 기능 | `[PORT]` | 상담 결과 이미지 저장 | 검토 예정 | `interior` 구현과 비교 |
| Gemini 호출 | `[AI] [SECRET]` | 전문 상담 | 우선 검토 | 키 노출·프롬프트 차이 확인 |

## 6. 수정 진행 규칙

1. 이 저장소에 신규 기능을 먼저 추가하지 않는다.
2. `interior`와 비교해 더 좋은 파일만 `[PORT]`로 표시한다.
3. 이관 완료 후 저장소 전체를 `[LEGACY]`로 전환하거나 명확한 별도 역할을 부여한다.
4. 고객 자료와 Secret은 커밋하지 않는다.
5. 비교·이관 작업은 작업 브랜치와 Draft PR로 진행한다.

## 7. 결정 기록

- `2026-07-30`: `interior`와 같은 패키지 계열임을 확인하고 중복 비교본으로 분류함.
