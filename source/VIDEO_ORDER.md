# Blackjack VIDEO_ORDER

Learning order across **kept** videos, grouped by module in BLUEPRINT table order.  
Times in parentheses are duration. Chinese line is the one-liner for the manifest `note`.

**Status (2026-11-26 18:21 America/New_York):** only 3 unique clips are on disk (v01, v02, and resend `49049bb6`). The 20-file batch that should have become v03–v22 never materialized, so this list is incomplete.

## Kept, in module order

### 1. shuffle 洗牌

| id | duration | title | 中文一行 |
|---|---|---|---|
| v01 | 1:26.5 | Announce "Shuffle!" | 洗牌前必须大声向楼面喊 “Shuffle!”，不是在请示许可。先于完整洗牌。 |
| v02 | 3:58.9 | 8-deck shuffle procedure | 八副牌洗牌：喊 Shuffle → 对半、内沿各抓 1–1.5 副，Riffle-Riffle-Strip-Riffle，循环；考核目标 3.5 分钟内。 |

v01 and v02 overlap on the announcement section. **Keep both.** v01 is the announcement drill and comes first; v02 is the full procedure.

### 8. payouts 赔付与切筹码

| id | duration | title | 中文一行 |
|---|---|---|---|
| resend-49049bb6 (not yet a vNN) | 10:26.9 | Scan the layout, prove bets, pay color for color | 开局扫台面、大筹码在底；向镜头分色证明分牌/加倍注；按颜色整笔赔付，禁止分次赔。 |

This clip also teaches `deal` (“no more bets” + scan) and `signals` (split/double prove-the-bet). Parked in `payouts` because that is the main skill in the second half. Re-slot after the missing 20 are classified if a cleaner split of topics appears.

## Dedup

| pair | type | decision |
|---|---|---|
| v01 ↔ v02 | partial overlap (both open with the loud "Shuffle!" lecture; v02 then continues into the 8-deck procedure) | **Keep both.** Order: v01 then v02. |
| 49049bb6 ↔ v01 / v02 | none (different hash, length, topic, recorded ~30 min later) | **Keep** 49049bb6. |
| 49049bb6 ↔ missing `bd24eb49…` (90.2 MB) | suspected exact or near duplicate (size match only; hash pending) | **Keep 49049bb6 as working copy** until the original arrives. If sha256 matches, drop the resend from the official v03–v22 numbering and keep one file. |
| 8 other later-send prefixes (`c1f0fc81`, `64a28e69`, `3681d9c5`, `3d3dcc11`, `4d21b0a6`, `9b3bb19b`, `445a0d7b`, `0687ba9f`) | presumed resends of B[1]–B[3] and B[5]–B[9] by advertised size | **Not on disk.** When they arrive: hash-compare, do not transcribe confirmed duplicates, list as dropped in this section, do not use them for v03–v22 numbering. |

No exact hash-duplicates were found among the three files actually present.

## Modules with no video yet

| module | 中文 |
|---|---|
| primer | 规则速览与台面认识 |
| cut | 切牌 |
| burn | 烧牌 |
| deal | 发牌（Shoe 或 Pitch） — partial coverage only, inside 49049bb6 |
| peek | 底牌、偷看与保险 |
| signals | 读手势与给牌 — partial coverage only, inside 49049bb6 |
| dealer-hand | 荷官补牌与停牌 |
| take | 收走输掉的注 |
| clear-cards | 收牌 |
| palms | 亮掌 |
| full-round | 完整一圈 |
| mock | 综合模拟 |

`deal` and `signals` are not empty of *content* (the 10:27 lesson covers layout scan / no more bets, and split+double), but they still have no dedicated clip. Leave those module `videos` arrays empty until the missing batch is classified, so a later dedicated clip can take order 1.

## Missing intake (blocks v03–v22)

20 original `.mov` files listed on the t57 attach message, plus 8 of 9 later sends, were never written to the attachments folder. See `raw/SOURCE_MAP.md`. Do not invent `v03`–`v22` paths.
