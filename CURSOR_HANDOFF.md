# 클린마일 (CleanMile) — Cursor AI 인계 가이드

본 문서는 **클린마일(CleanMile)** 프로젝트를 **Cursor AI** 환경으로 안전하게 이전하고 이어 작업하기 위한 종합 인계 가이드입니다. 프로젝트는 **Expo SDK 54, React Native, TypeScript, NativeWind(Tailwind CSS), Leaflet 및 react-native-maps**를 기반으로 구축되었습니다.

## 1. 프로젝트 개요 및 기술 스택

클린마일은 사용자가 쓰레기를 신고하고 플로깅(조깅하며 쓰레기 줍기)을 수행하여 포인트를 획득하고, 동 단위 월간 랭킹 경쟁에 참여할 수 있는 친환경 리워드 모바일 애플리케이션입니다.

| 구분 | 주요 기술 / 라이브러리 |
| --- | --- |
| 프레임워크 | React Native 0.81, Expo SDK 54 (Expo Router 6) |
| 언어 | TypeScript 5.9 |
| 스타일링 | NativeWind v4 (Tailwind CSS) |
| 지도 시스템 | Leaflet (웹 환경), react-native-maps (모바일 환경) |
| 상태 관리 및 저장소 | React Context, AsyncStorage |
| AI 및 카메라 | Google Vision API 연동, Expo Camera / Web Camera |
| 테스트 | Vitest (80개 이상 테스트 통과) |

---

## 2. 프로젝트 디렉토리 구조

프로젝트 루트 디렉토리(`/home/ubuntu/clean-mile`)의 주요 구조는 다음과 같습니다.

```text
clean-mile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # 탭 네비게이션 설정 (홈, 지도, 카메라, 랭킹, 상점, 플로깅, 마이페이지)
│   │   ├── index.tsx           # 홈 화면 (포인트, 통계, 빠른 실행)
│   │   ├── map.tsx             # 지도 화면 (Leaflet / react-native-maps 통합)
│   │   ├── camera-vision.tsx   # AI 쓰레기 인식 및 포인트 적립 카메라
│   │   ├── ranking.tsx         # 동 단위 월간 랭킹 및 포디움
│   │   ├── store.tsx           # 포인트 상점 (실제 상품 이미지 및 교환)
│   │   └── jogging.tsx         # 플로깅 화면 (실시간 거리, 시간, 칼로리, 쓰레기 촬영)
│   └── _layout.tsx             # 루트 레이아웃 및 프로바이더 설정
├── components/
│   ├── screen-container.tsx    # SafeArea 및 배경 처리 컨테이너
│   ├── leaflet-map.tsx         # 웹용 Leaflet 지도 컴포넌트
│   └── web-camera.tsx          # 웹 표준 카메라 컴포넌트
├── lib/
│   ├── map-system.ts           # 40개 동 핫스팟 및 신고 시스템
│   ├── dong-ranking-system.ts  # 동 단위 월간 랭킹 및 포인트 정산
│   ├── jogging-camera-system.ts# 플로깅 세션 및 거리 계산 (Haversine formula)
│   └── store.ts                # AsyncStorage 기반 포인트 및 활동 관리
├── tests/                      # Vitest 유닛 테스트 (80+ 테스트)
└── app.config.ts               # Expo 설정 (번들 ID, 권한, 플러그인)
```

---

## 3. Cursor AI에서 프로젝트 실행 방법

Cursor AI로 프로젝트 폴더를 연 후, 터미널에서 다음 명령어를 순서대로 실행하여 개발 환경을 구축하고 실행할 수 있습니다.

```bash
# 1. 의존성 설치
pnpm install

# 2. 로컬 개발 서버 실행 (웹 및 메트로 번들러 동시 실행)
pnpm dev

# 3. 유닛 테스트 실행 (Vitest)
pnpm test
```

---

## 4. 현재 구현 완료된 핵심 기능 요약

1. **지도 및 위치 시스템**: 5개 지역(강서구, 동작구, 강남구, 강동구, 서초구) 총 40개 핫스팟 데이터 구축. 웹 환경에서는 Leaflet과 OpenStreetMap 타일을 사용하여 줌 및 상세 정보를 제공하며, 모바일에서는 react-native-maps를 지원합니다. 실시간 GPS 위치 추적 및 파란색 마커 표시 기능이 포함되어 있습니다.
2. **플로깅(조깅 + 쓰레기 줍기) 모드**: 실시간 이동 거리(Haversine 공식 적용), 운동 시간, 소모 칼로리, 평균 속도 측정 및 쓰레기 카운팅 기능을 제공합니다. 플로깅 중 카테고리별 쓰레기 촬영 및 즉시 포인트 적립이 가능합니다.
3. **AI 쓰레기 인식 및 검증**: 카메라 촬영 후 Google Vision API를 연동하여 쓰레기 신뢰도를 분석하고, 40% 이상의 신뢰도를 가진 경우 포인트와 핫스팟 신고가 자동으로 반영됩니다.
4. **동 단위 월간 랭킹**: 사용자의 현재 위치를 기반으로 동을 자동 분류하고, 월간 누적 포인트를 집계하여 상위 10명의 랭킹과 포디움(🏆🥈🥉)을 표시합니다.
5. **포인트 상점 및 로컬 스토리지**: 적립한 포인트로 커피, 쿠폰, 도시락 등을 교환할 수 있으며, 모든 데이터는 `AsyncStorage`를 통해 안정적으로 영구 저장됩니다.

---

## 5. Cursor AI 작업 지시 팁 (Prompting Tips)

Cursor AI와 함께 작업할 때 아래 지침을 참고하면 효율적입니다.

- **컴포넌트 수정 시**: React Native 및 Expo SDK 54 환경이므로 웹 전용 라이브러리(`leaflet` 등) 사용 시 `Platform.OS === 'web'` 분기 처리를 유지하세요.
- **스타일링**: Tailwind CSS 클래스를 지원하는 NativeWind v4를 사용 중이므로 `className` 속성을 적극 활용하세요. 단, `Pressable` 컴포넌트에서는 `className` 대신 `style` prop을 사용하는 컨벤션을 지켜주세요.
- **테스트 주도**: 새로운 기능 추가 후 `pnpm test`를 실행하여 기존 80개 이상의 유닛 테스트가 모두 통과하는지 확인하세요.
