# Mendix Multi Widget Deployer
![Mendix Multi Widget Deployer](https://via.placeholder.com/150x150?text=Widget+Deployer)

Mendix 멀티 위젯 배포 도구 - 여러 Mendix 위젯을 한 번에 빌드하고 배포할 수 있는 데스크톱 애플리케이션입니다.

Mendix 개발자들이 여러 위젯을 효율적으로 관리하고 배포할 수 있도록 설계된 Tauri 기반의 데스크톱 애플리케이션입니다.

## 다른 언어로 보기
[**한국어**](./README.md), [日本語](./README.jp.md), [English](./README.en.md)

# 주요 기능
- ✅ 여러 Mendix 위젯을 동시에 빌드
- ✅ 자동 .mpk 파일 배포
- ✅ 위젯 경로 및 설정 관리
- ✅ 직관적인 GUI 인터페이스
- ✅ 빌드 상태 실시간 모니터링
- ✅ 한국어 텍스트 인코딩 지원 (EUC-KR, CP949)
- ✅ PowerShell 기반 빌드 실행
- ✅ 위젯별 선택적 빌드 지원

# 릴리즈 실행하기 (일반 사용자)
[최신 릴리즈](https://github.com/your-username/mendix-multi-widget-deployer/releases/latest)에서 실행 파일을 다운로드하여 설치할 수 있습니다.

## 시스템 요구사항
- Windows 10 이상 (PowerShell 5.1 이상)
- Node.js 16 이상
- pnpm 패키지 매니저
- Mendix 위젯 개발 환경

## 설치 방법
1. [릴리즈 페이지](https://github.com/your-username/mendix-multi-widget-deployer/releases/latest)에서 최신 버전 다운로드
2. `.msi` 파일을 실행하여 설치
3. 프로그램 실행 후 위젯 경로 설정

# 소스코드를 빌드하여 실행하기 (개발자)

## 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/your-username/mendix-multi-widget-deployer.git
cd mendix-multi-widget-deployer

# 의존성 설치
pnpm install

# Tauri CLI 설치 (전역)
cargo install tauri-cli --version "^2.0"
```

## 개발 모드 실행
```bash
# 개발 서버 시작
pnpm tauri dev
```

## 프로덕션 빌드
```bash
# 프로덕션 빌드
pnpm tauri build
```

# 사용 방법

## 1. 기본 설정
- **Base Path**: Mendix 위젯들이 위치한 기본 경로 설정 (packages 폴더가 있는 상위 디렉토리)
- **Destination Path**: 빌드된 .mpk 파일이 복사될 대상 경로 설정

## 2. 위젯 관리
- **위젯 추가**: "Add Widget" 버튼으로 새 위젯 추가
- **위젯 편집**: 기존 위젯의 이름이나 경로 수정
- **위젯 삭제**: 불필요한 위젯 제거
- **위젯 선택**: 빌드할 위젯 선택/해제

## 3. 빌드 및 배포
- 선택된 위젯들에 대해 "Build Selected Widgets" 버튼 클릭
- 각 위젯별로 `pnpm run build` 명령어 실행
- 생성된 .mpk 파일을 자동으로 대상 경로에 복사

# 기술 스택
- **Frontend**: React 18, Vite
- **Backend**: Rust (Tauri 2.0)
- **UI Framework**: CSS3 (사용자 정의 스타일)
- **Build System**: pnpm, Cargo
- **Shell Integration**: PowerShell (Windows)

# 프로젝트 구조
```
mendix-multi-widget-deployer/
├── src/                    # React 프론트엔드
│   ├── App.jsx            # 메인 애플리케이션 컴포넌트
│   ├── App.css            # 스타일시트
│   └── main.jsx           # React 엔트리포인트
├── src-tauri/             # Tauri 백엔드
│   ├── src/
│   │   ├── lib.rs         # 메인 Rust 로직
│   │   └── main.rs        # Tauri 엔트리포인트
│   ├── Cargo.toml         # Rust 의존성
│   └── tauri.conf.json    # Tauri 설정
├── public/                # 정적 파일
├── dist/                  # 빌드 출력
└── package.json           # Node.js 의존성
```

# 주요 기능 구현 상태
- [x] 위젯 목록 관리 (추가, 수정, 삭제)
- [x] 선택적 위젯 빌드
- [x] 자동 .mpk 파일 배포
- [x] 설정 저장 및 로드
- [x] 빌드 상태 모니터링
- [x] 한국어 인코딩 지원
- [x] PowerShell 기반 빌드 실행
- [x] 오류 처리 및 사용자 피드백
- [ ] 빌드 로그 상세 보기
- [ ] 위젯 템플릿 지원
- [ ] 배치 작업 스케줄링
- [ ] 일본어 인코딩 지원

# 문제 해결

## 일반적인 문제
1. **빌드 실패**: Node.js와 pnpm이 올바르게 설치되었는지 확인
2. **경로 오류**: Base Path가 올바른 Mendix 프로젝트 구조를 가리키는지 확인
3. **권한 문제**: PowerShell 실행 정책 확인 (`Get-ExecutionPolicy`)
4. **인코딩 문제**: 한국어 Windows 환경에서 자동으로 처리됨

## 로그 확인
애플리케이션 로그는 다음 위치에 저장됩니다:
- Windows: `%APPDATA%\com.sbt-global.mendix-multi-widget-diployer\`

# 기여하기
1. 이슈 등록 또는 기존 이슈 확인
2. 개발 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

# License
이 프로그램은 [Mozilla Public License 2.0](/LICENSE)을 따릅니다.

Copyright © 2025 SBT Global. All rights reserved.

---

**Mendix Multi Widget Deployer**는 Mendix 개발자들의 생산성 향상을 위해 개발되었습니다.
문의사항이나 버그 리포트는 [Issues](https://github.com/your-username/mendix-multi-widget-deployer/issues)에 등록해 주세요.
