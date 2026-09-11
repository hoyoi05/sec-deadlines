# 보안·AI·디지털포렌식 학회 마감일 — 한국어 · 대한민국 시간

[Security and Privacy Conference Deadlines](https://sec-deadlines.github.io/)를 기반으로,
보안·프라이버시·암호·AI·디지털포렌식 분야 학회 마감일을 한국어와 대한민국 시간으로 제공하기 위한 프로젝트입니다.

- 저장소: [hoyoi05/sec-deadlines](https://github.com/hoyoi05/sec-deadlines)
- 원본 소스: [sec-deadlines/sec-deadlines.github.io](https://github.com/sec-deadlines/sec-deadlines.github.io)
- 표시 언어: 한국어 (`ko-KR`)
- 표시 시간대: 대한민국 표준시 (`Asia/Seoul`, KST, UTC+9)
- 배포 대상: GitHub Pages
- 사이트 주소: [hoyoi05.github.io/sec-deadlines](https://hoyoi05.github.io/sec-deadlines/)

원본의 3개 필터 그룹과 12개 태그를 유지하고, 연구 분야에 `AI`, `FORENSICS`를 추가했습니다(총 14개 태그).
Security(보안), Privacy(프라이버시), Crypto(암호), AI(인공지능), Digital Forensics(디지털포렌식)로 한국어 필터링할 수 있으며, 교차 분야 학회에는 여러 태그를 붙입니다.
같은 그룹 안에서는 OR, 그룹 간에는 AND로 결합합니다. 필터는 URL로 공유하고 브라우저에 저장할 수 있습니다.
원본의 영문 필터 URL과 한국어 이름·태그를 사용한 URL도 인식합니다.

학회 이름·설명 검색창은 입력 즉시 결과를 좁힙니다. 대소문자와 유니코드 표기를 정규화하고,
띄어 쓴 여러 단어가 이름 또는 설명에 모두 포함되는 항목을 표시합니다. 검색과 기존 필터는 AND로 결합하며 마감일 정렬을 유지합니다.
‘검색어 지우기’는 필터를 유지하고 검색어만 지우며, ‘전체 초기화’는 검색과 필터를 함께 해제합니다.
검색어는 URL의 `q`에 저장합니다. 예: [NeurIPS 검색](https://hoyoi05.github.io/sec-deadlines/?q=NeurIPS).
검색 URL로 접속하면 URL에 명시된 필터만 적용하여, 다른 브라우저에서도 같은 조건으로 열립니다.

원본 마감일과 시간대 정보를 보존하고 표시 시점에 `Asia/Seoul`로 변환합니다.
AoE 기본값(UTC−12), 연도 템플릿, 정각 1초 전·59분의 59초 보정 규칙은 원본과 같습니다.
공식 발표에 날짜만 있고 시각·시간대가 미공개인 항목은 `deadline_status: date_only`로 표시해 KST 환산과 카운트다운을 보류합니다.
학회 공식 명칭과 장소는 원문을 유지하며, 개최 날짜는 현지 기준입니다.

원본 소스 링크와 제작자·관리자·기여자 출처를 화면 상단·하단과
[출처·라이선스 안내](https://hoyoi05.github.io/sec-deadlines/attribution.html)에 명시했습니다.
기준 원본에는 별도 LICENSE 파일이 없으므로 원본에 임의로 MIT 등 새 라이선스를 부여하지 않습니다.
출처 표시가 원저작권자의 수정·재배포 허락을 대신하지는 않습니다.
함께 배포하는 Moment.js와 Moment Timezone의 MIT 라이선스는 `static/vendor/`에 보존합니다.

## AI 학회와 공식 CFP

2026년 9월 11일에 아래 공식 CFP를 직접 확인하여 `_data/ai_conferences.yml`에 추가했습니다.
공개된 최신 회차를 사용하며, 다음 회차의 미공개 일정은 추정하지 않습니다. 지난 마감일도 기록으로 표시합니다.

| 학회 | 공식 CFP | 추가한 제출 단계 |
| --- | --- | --- |
| ICLR 2027 | [CFP](https://iclr.cc/Conferences/2027/CallForPapers) | 초록 등록, 논문 제출 |
| AISTATS 2027 | [CFP](https://virtual.aistats.org/Conferences/2027/CallForPapers) | 초록 등록, 논문·보충자료 제출 |
| CVPR 2027 | [CFP](https://cvpr.thecvf.com/Conferences/2027/CallForPapers) | 논문 등록, 논문 제출 |
| AAAI 2027 | [메인 기술 트랙 CFP](https://aaai.org/conference/aaai/aaai-27/main-technical-track-call/) | 초록 등록, 논문 제출 |
| NeurIPS 2026 | [CFP](https://neurips.cc/Conferences/2026/CallForPapers) | 초록 등록, 논문·보충자료 제출 |
| ICML 2026 | [CFP](https://icml.cc/Conferences/2026/CallForPapers) | 초록 등록, 논문 제출 |
| IJCAI-ECAI 2026 | [메인 트랙 CFP](https://2026.ijcai.org/ijcai-ecai-2026-call-for-papers-main-track/) | 초록 등록, 논문 제출 |
| ACL 2026 | [CFP](https://2026.aclweb.org/calls/main_conference_papers/) | ARR 제출, 학회 확정(Commitment) |
| EMNLP 2026 | [CFP](https://2026.emnlp.org/calls/main_conference_papers/) | ARR 제출, 학회 확정(Commitment) |
| COLT 2026 | [CFP](https://learningtheory.org/colt2026/cfp.html) | 논문 제출 |
| UAI 2026 | [CFP](https://www.auai.org/uai2026/call_for_papers) | 논문 제출 |
| WACV 2027 | [CFP](https://wacv.thecvf.com/Conferences/2027/CallForPapers) | 1·2차 신규 논문 등록 및 제출 |

새 학회 12개에 제출·확정 마감 15개를 추가하고, 별도로 필요한 사전 등록 마감도 KST로 표시합니다.
일반 연구/메인 트랙 기준이며, 특별 트랙·워크숍 등 별도 모집의 마감과 혼동하지 않도록 합니다.
각 화면 항목에 `cfp`(공식 CFP)와 `checked_on`(확인일)을 표시합니다.
`deadline_labels`와 `registration_deadline`은 `deadline` 배열의 같은 인덱스에 대응합니다.
사전 등록일이 지난 경우 본문 마감이 남아 있어도 ‘등록 마감됨’을 표시합니다.

원본의 보안·AI 교차 분야 학회/워크숍 20개에도 AI 태그를 추가했습니다.
기존 항목 중 [SaTML 2027 CFP](https://satml.org/call-for-papers/)는 직접 확인하여 필수 초록 등록을 추가했습니다.
[SAIS 2027 공식 발표](https://www.usenix.org/conference/sais27)는 날짜만 공개되어 있어, 원본 데이터는 보존하되 시각·시간대 확인 전 환산을 보류합니다.
나머지 기존 항목의 마감일은 원본 데이터를 사용하며, 화면에서 ‘원본 데이터’ 출처로 구분합니다.
새 AI 학회의 CORE 등급은 검증 전이므로 임의로 부여하지 않았습니다. 등급 필터를 선택하면 해당 항목은 제외됩니다.
하단의 원본 iCal 구독에는 이 사이트에서 추가·정정한 AI·디지털포렌식 일정이 포함되지 않습니다.

## 디지털포렌식 학회와 공식 CFP

2026년 9월 11일 공식 CFP를 확인하여 학회·워크숍 5개를 새로 추가하고 기존 항목 5개를 재검증했습니다.
[디지털포렌식 필터](https://hoyoi05.github.io/sec-deadlines/?domain=Digital+Forensics)에서 10개 학회·워크숍의 12개 제출 단계를 확인할 수 있습니다.
다음 표의 날짜는 **공식 출처 기준**이며, 시간대가 명시된 항목만 사이트에서 KST로 환산합니다.

| 학회·회차 | 공식 CFP | 확인한 제출 마감 |
| --- | --- | --- |
| DFC Europe 2027 (기존) | [CFP](https://dfrws.org/call-for-papers-dfc-europe-2027/) | 초록 9/18, 본문 9/25, 2026 AoE |
| DFRWS USA 2026 (신규) | [CFP](https://dfrws.org/call-for-papers-is-open-for-dfrws-usa-2026/) | 초록·본문 모두 2/6, 2026 AoE |
| DFRWS APAC 2026 (신규) | [CFP](https://dfrws.org/conferences/dfrws-apac-2026/) | 초록 5/29, 본문 6/5, 2026 23:59 AoE |
| IFIP WG 11.9 2027 (신규) | [공식 PDF](https://www.ifip119.org/Conferences/WG11-9-CFP-2027.pdf) | 논문·패널 2026-10-10, 시각·시간대 미공개 |
| ICDF2C 2026 (신규) | [CFP](https://icdf2c.eai-conferences.org/2026/call-for-papers/) | 메인 2026-01-20, 최종 모집 2026-04-25, 시각·시간대 미공개 |
| DFDS 2027 (신규) | [CFP](https://dfrws.org/conferences/dfds-2027/) | 학생 주저자 논문 2026-11-12 AoE |
| ISDFS 2027 (기존) | [CFP](https://www.isdfs.org/2027/call-for-papers/) | 2027-01-31, 시각·시간대 미공개 |
| IMF 2026 (정정) | [CFP](https://www.imf-conference.org/cfp.html) | 연장된 마감 2026-05-04 23:59 UTC |
| WSDF 2026 (정정) | [CFP](https://www.ares-conference.eu/wsdf) | 2026-05-05, 시각·시간대 미공개 |
| WIFS 2026 (정정) | [CFP](https://wifs2026.utt.fr/call-for-papers) | 신규 제출 2026-07-22, 기제출 논문 수정 2026-07-29, 시각·시간대 미공개 |

공식 확인 결과는 `_data/forensics_conferences.yml`에 관리합니다. `_data/conferences.yml`의 원본 필드는 그대로 보존하고,
화면에 표시할 때 같은 `name`·`year`의 포렌식 검증 항목을 우선합니다. IMF의 잘못된 연도와 WSDF·WIFS의 변경 전 날짜가 자동 동기화로 되돌아가지 않습니다.
각 포렌식 레코드에는 공식 CFP, 확인일, 제출 단계와 한국어 안내를 붙였으며, 신규 항목에 CORE 등급을 임의로 부여하지 않았습니다.
날짜만 공개된 복수 단계는 `announced_deadlines`와 `deadline_labels`의 같은 인덱스로 대응시킵니다.

`scripts/catalogue.cjs`가 원본·AI·포렌식 데이터를 합치고 중복을 검사합니다. 미리보기와 배포 검증은 같은 함수를 사용합니다.
Jekyll을 직접 실행하려면 먼저 `npm run prepare:catalogue`로 `_data/catalogue.yml`을 생성하세요. 생성 파일은 Git에 커밋하지 않습니다.

## 개발 및 배포

```sh
npm ci --ignore-scripts
node scripts/ensure-upstream.cjs
npm test
npm run preview:build
node scripts/verify-site.cjs .preview/sec-deadlines
python -m http.server 4173 --bind 127.0.0.1 --directory .preview
```

로컬 미리보기: `http://127.0.0.1:4173/sec-deadlines/`.
미리보기는 LiquidJS를 사용하고, 실제 배포는 GitHub의 Jekyll 빌드로 검증합니다.
`master` 푸시 시 `.github/workflows/pages.yml`이 테스트 → 통합 학회 데이터 생성 → Jekyll 빌드 → 생성물 검증 → Pages 배포를 수행합니다.
사이트 설정의 `baseurl: /sec-deadlines`를 유지해야 CSS·스크립트·출처 안내 경로가 올바르게 연결됩니다.
CSS·JavaScript를 변경할 때 `_config.yml`의 `asset_version`도 갱신하여 이전 브라우저 캐시가 새 화면에 섞이지 않게 합니다.

## 지속 업데이트

[Update conference data daily](https://github.com/hoyoi05/sec-deadlines/actions/workflows/update-data.yml)가 매일 **오전 9시 17분 KST**에 실행됩니다.
GitHub Actions의 UTC 일정으로 설정했으며, Actions 화면에서 **Run workflow**로 즉시 실행할 수도 있습니다.
별도 API 키·개인 액세스 토큰 없이 저장소의 기본 `GITHUB_TOKEN`을 사용합니다.

1. 원본 저장소 `master`의 학회 데이터와 필터 정의를 가져옵니다. 원본 코드나 워크플로는 가져와 실행하지 않습니다.
2. 한국어 필터명과 AI·디지털포렌식 태그를 유지하면서 원본 마감일 변경과 새 학회·회차를 반영합니다. 마감 시각이 변경되면 이전 시각을 기준으로 확인한 CFP·사전 등록 메타데이터는 제거합니다. 별도 포렌식 검증 항목은 원본 동기화 후에도 우선 표시합니다.
3. 등록된 AI·디지털포렌식 공식 CFP·발표 페이지와 공식 홈페이지의 변경을 점검합니다. HTML은 본문을 비교하고 PDF는 파일 해시를 비교합니다. 홈페이지 점검은 다음 회차 공지를 발견하기 위한 보조 기능입니다.
4. 데이터·시간대·중복·회귀 테스트를 통과하면 봇이 변경과 점검 기록을 커밋합니다. 동일 실행에서 재사용 Pages 워크플로를 호출하여 그 커밋을 배포합니다.

**원본 데이터는 자동 갱신되며, AI·디지털포렌식 CFP의 의미 해석과 신규 회차 등록은 검토 후 반영합니다.**
CFP마다 초록·본문·수정본·특별 트랙·시간대의 표기 방식이 달라 본문 변경만으로 마감일을 덮어쓰지 않습니다.
자동 점검은 `checked_on`(사람이 CFP에서 마감일을 확인한 날짜)을 변경하지 않습니다.
현재 등록된 공식 URL만 점검하므로 모든 새 학회·회차를 자동 발견하는 기능은 아닙니다.

마지막 점검 시각과 각 출처 상태는 [자동 갱신 상태](https://hoyoi05.github.io/sec-deadlines/updates.html)에서 공개합니다.
첫 정상 응답으로 비교 기준을 만들고, 이후 변경은 검토가 끝날 때까지 ‘변경 검토 필요’로 남습니다.
CFP 접속 실패 시 비교 기준·기존 마감일을 보존하며, 원본 형식 오류·학회 수 20% 이상 감소 등은 자동 반영을 보류합니다.
출처 점검 실패는 상태 페이지와 Actions 경고·실행 요약에 표시합니다. 필수 테스트·빌드·푸시가 실패하면 배포하지 않습니다.

공식 CFP 변경을 검토한 후에는 일정과 해당 `checked_on`을 수정하고, 다음 명령으로 비교 기준을 갱신합니다.

```sh
npm run sources:accept -- https://iclr.cc/Conferences/2027/CallForPapers
npm run update:data
```

검토한 출처만 개별 갱신하세요. `sources/cfp-baselines.json`에는 본문 전체 대신 SHA-256과 기준 생성 시각만 저장합니다.
공식 홈페이지 추가·수정은 `scripts/official-homepages.json`에서 관리합니다.
원본 보안 학회의 추가 분류 목록은 `scripts/upstream-data.cjs`의 `AI_NAMES`, `FORENSICS_NAMES`에 있으며, 같은 이름의 새 회차에도 이어집니다.

GitHub의 예약 실행은 부하에 따라 지연되거나 누락될 수 있고, 공개 저장소에 60일간 활동이 없으면 비활성화될 수 있습니다.
오랫동안 점검 시각이 갱신되지 않으면 Actions 실행 상태를 확인하세요.
[GitHub 예약 실행 안내](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
봇 토큰으로 푸시한 커밋은 다른 `push` 워크플로를 시작하지 않으므로, 배포를 같은 실행에서 명시적으로 호출합니다.
[GitHub 워크플로 트리거 안내](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

학회 데이터 갱신 시 `_data/conferences.yml`과 `_config.yml`의 `upstream_revision`, `upstream_updated`를 함께 갱신하세요.
AI·디지털포렌식 일정은 각 공식 CFP에서 트랙·시각·시간대·사전 등록 요건을 확인한 뒤 `_data/ai_conferences.yml` 또는 `_data/forensics_conferences.yml`과 확인일을 갱신하세요.
기존 보안 학회의 추가 태그·검증 메타데이터를 제외한 원본 필드는 회귀 테스트로 원본 커밋과 비교합니다.
기존 태그의 `name`·`tag`는 원본 값을 유지하고 한국어 표시는 `name_ko`에서 관리합니다.

로컬 Git의 `origin`은 이 저장소, `upstream`은 원본 저장소를 가리킵니다.
아래에는 원본 프로젝트의 출처와 데이터 관리 문서를 보존합니다. 아래의 방문자 현지 시간 표시는 원본의 동작 설명이며, 이 한국어 버전은 KST로 고정합니다.

---

# Security and Privacy deadlines countdown

Based on [ai-deadlines](https://aideadlin.es) by @abshkdz

## Is my entry in scope?

This page is meant to host academic conference or workshop deadlines.

To check if an entry is a good fit for this page, in general, I would check for the following:

- Is there a "Call For Papers"? Is there a link for submissions? Are there formatting guidelines (page limits, style guide) etc?
- Is security, privacy, or cryptography mentioned in the list of topics?
- Is there a review process? Does the website name a general chair, program chair, or program committee?
- If accepted, will the paper be published in a proceedings?

If "Yes" to all of the above, then the conference or workshop is likely a good fit.
Examples where conferences were **not** a good fit are [FTC's PrivacyCon](https://www.ftc.gov/news-events/events/2024/03/privacycon-2024)
(see [sec-deadlines/#246](https://github.com/sec-deadlines/sec-deadlines.github.io/pull/246)) and
[Real World Crypto (RWC)](https://rwc.iacr.org/2026/) (see [sec-deadlines/#475](https://github.com/sec-deadlines/sec-deadlines.github.io/issues/475)).
Once PrivacyCon or RWC begin publishing proceedings, they'd become fit for inclusion.

## Adding/updating a conference

- Read the data format description below. **Note that the timezone format sign is inverted** (e.g., UTC+7 is written as `Etc/GMT-7`). It's [not a bug][0]. I hate this format too. I'd be happy to move to a different timezone JavaScript library that uses a friendlier format, but I don't have time for that.
- Update `_data/conferences.yml`. You can do that on GitHub or locally after forking the repo.
- Please check if an entry for a prior year's offering exists; if so, please update the prior entry, rather than adding a new one.
- Send a pull request

### Conference entry record

Example record:

```yaml
- name: Euro S&P
  description: IEEE European Symposium on Security and Privacy
  year: 2018
  link: http://www.ieee-security.org/TC/EuroSP2018/
  dblp: https://dblp.org/db/conf/eurosp/index.html
  deadline: ["2017-08-15 23:59"] # must be a list
  date: April 24-26
  place: London, UK
  tags: [SEC, PRIV, CONF, CORE-A]
```

Descriptions of the fields:

| Field name    | Description                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| `name`\*      | Short conference name, without year                                                     |
| `year`\*      | Year the conference is happening                                                        |
| `description` | Description, or long name                                                               |
| `comment`     | Additional comments, e.g., co-located conference, rolling deadline                      |
| `link`\*      | URL to the conference home page                                                         |
| `dblp`        | URL to the [DBLP](https://dblp.org) page of the conference                              |
| `deadline`\*  | A list of deadlines. [(Gory details below)][4]                                          |
| `timezone`    | [Timezone][5] in [tz][1] format. By default is UTC-12 ([AoE][2])                        |
| `date`        | When the conference is happening                                                        |
| `place`       | Where the conference is happening                                                       |
| `tags`        | One or multiple [tags][3]: `SEC`, `PRIV`, or `CRYPTO` (topic); `CONF`, `SHOP`, or `JRN` (venue);<br> `TOP4`, `ASTAR`, `CORE-A`, `CORE-B`, `CORE-C`, or `OTHERS` (rank). |

Fields marked with asterisk (\*) are required.

### Deadline format

The _deadline_ field can contain:

1. The simplest option: a date and time in ISO format. Example: `["2017-08-19 23:59"]` (Note that you need to wrap even a single deadline in a list).
2. If a deadline is rolling, you can use a template date, just substitute the
   year with `%y` and the year before the conference with `%Y`. Example:
   `["%y-01-15 23:59"]` means there is a deadline on the 15th January in the
   same year as the conference.
3. A list of (1) or (2). Example of two rolling deadlines, with one in the end
   of October in the year prior to the conference year, and the second in the
   end of February in the same year as the conference:

```
- "%Y-10-31 23:59"
- "%y-02-28 23:59"
```

On the page, all deadlines are displayed in viewer's local time (that's a feature).

_Note:_ If the deadline hour is `{h}:00`, it will be automatically translated into `{h-1}:59:59` to avoid pain and confusion when it happens to be midnight in local time.

### Timezones

The timezone is specified in [tz format][1]. Unlike abbreviations (e.g. EST), these are un-ambiguous. Here are tz codes for some common timezones:

| Common name                   | tz                                                               |
| ----------------------------- | ---------------------------------------------------------------- |
| UTC                           | `Etc/UTC`                                                        |
| America Pacific Time          | `America/Los_Angeles`                                            |
| Pacific Standard Time (UTC-8) | `Etc/GMT+8` (Yes, the sign is inverted for some weird reason)    |
| America Eastern Time          | `America/New_York`                                               |
| Eastern Standard Time (UTC-5) | `Etc/GMT+5`                                                      |
| American Samoa Time (UTC-11)  | `Pacific/Samoa` or `Etc/GMT+11`. This timezone does not use DST. |
| Aleutian Islands              | `America/Adak`                                                   |

[0]: https://momentjs.com/timezone/docs/#/zone-object/offset/
[1]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[2]: https://www.timeanddate.com/time/zones/aoe
[3]: _data/types.yml
[4]: #deadline-format
[5]: #timezones
