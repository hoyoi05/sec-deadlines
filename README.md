# 보안 학회 마감일 — 한국어 · 대한민국 시간

[Security and Privacy Conference Deadlines](https://sec-deadlines.github.io/)를 기반으로,
보안·프라이버시·암호 분야 학회 마감일을 한국어와 대한민국 시간으로 제공하기 위한 프로젝트입니다.

- 저장소: [hoyoi05/sec-deadlines](https://github.com/hoyoi05/sec-deadlines)
- 원본 소스: [sec-deadlines/sec-deadlines.github.io](https://github.com/sec-deadlines/sec-deadlines.github.io)
- 표시 언어: 한국어 (`ko-KR`)
- 표시 시간대: 대한민국 표준시 (`Asia/Seoul`, KST, UTC+9)
- 배포 대상: GitHub Pages
- 사이트 주소: [hoyoi05.github.io/sec-deadlines](https://hoyoi05.github.io/sec-deadlines/)

원본의 3개 필터 그룹과 12개 태그를 유지하며, 한국어로 필터링할 수 있습니다.
같은 그룹 안에서는 OR, 그룹 간에는 AND로 결합합니다. 필터는 URL로 공유하고 브라우저에 저장할 수 있습니다.
원본의 영문 필터 URL과 한국어 이름·태그를 사용한 URL도 인식합니다.

원본 마감일과 시간대 정보를 유지하고 표시 시점에 `Asia/Seoul`로 변환합니다.
AoE 기본값(UTC−12), 연도 템플릿, 정각 1초 전·59분의 59초 보정 규칙은 원본과 같습니다.
학회 공식 명칭과 장소는 원문을 유지하며, 개최 날짜는 현지 기준입니다.

원본 소스 링크와 제작자·관리자·기여자 출처를 화면 상단·하단과
[출처·라이선스 안내](https://hoyoi05.github.io/sec-deadlines/attribution.html)에 명시했습니다.
기준 원본에는 별도 LICENSE 파일이 없으므로 원본에 임의로 MIT 등 새 라이선스를 부여하지 않습니다.
출처 표시가 원저작권자의 수정·재배포 허락을 대신하지는 않습니다.
함께 배포하는 Moment.js와 Moment Timezone의 MIT 라이선스는 `static/vendor/`에 보존합니다.

## 개발 및 배포

```sh
npm ci --ignore-scripts
npm test
npm run preview:build
node scripts/verify-site.cjs .preview/sec-deadlines
python -m http.server 4173 --bind 127.0.0.1 --directory .preview
```

로컬 미리보기: `http://127.0.0.1:4173/sec-deadlines/`.
미리보기는 LiquidJS를 사용하고, 실제 배포는 GitHub의 Jekyll 빌드로 검증합니다.
`master` 푸시 시 `.github/workflows/pages.yml`이 테스트 → Jekyll 빌드 → 생성물 검증 → Pages 배포를 수행합니다.
사이트 설정의 `baseurl: /sec-deadlines`를 유지해야 CSS·스크립트·출처 안내 경로가 올바르게 연결됩니다.

학회 데이터 갱신 시 `_data/conferences.yml`과 `_config.yml`의 `upstream_revision`, `upstream_updated`를 함께 갱신하세요.
태그의 `name`·`tag`는 원본 값을 유지하고 한국어 표시만 `name_ko`에서 관리합니다.

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
