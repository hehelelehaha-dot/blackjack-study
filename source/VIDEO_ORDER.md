# VIDEO_ORDER — Blackjack learning order

As of 2026-11-26 18:56 America/New_York.

Kept videos in BLUEPRINT module-table order, then teaching / filename order inside each module. Chinese one-liners only. Official transcripts exist for v03–v19; v01/v02 still use earlier notes.

Opening and closing a table is parked under `payouts` per BLUEPRINT.

## Learning order (19 unique, all keep)

| # | vNN | source | duration | module | Chinese one-liner |
|---|---|---|---|---|---|
| 1 | v01 | v01.mov (609 remux dropped) | 1:26.5 | shuffle | 洗牌前必须大声向楼面喊 “Shuffle!”，不是在请示许可。 |
| 2 | v02 | v02.mov (610 remux dropped) | 3:58.9 | shuffle | 八副牌洗牌：喊 Shuffle → 对半、内沿各抓 1–1.5 副，Riffle-Riffle-Strip-Riffle；考核目标 3.5 分钟内。 |
| 3 | v12 | 631.mp4 | 9:06.4 | signals | 分牌入门：必须同点、补同等注、先看 V 手势、新注放右侧并证明；最多共 4 手；牌不能重叠，前两张 pips 要可见。 |
| 4 | v13 | 632.mp4 | 4:16.9 | signals | 分牌续：最多 4 手；喊过 no more bets 且第一张出来后不能再碰注或牌；手势必须是 V。 |
| 5 | v14 | 633.mp4 | 6:28.6 | signals | 分 A：只分一次、每手只给 1 张且横放；A+10 是 21 不是 Blackjack，不能按 3:2 赔。 |
| 6 | v15 | 634.mp4 | 6:33.0 | signals | 任意前两张可加倍（21 除外），只给 1 张；可少于原注不可多于；新注放右侧并证明；非常规加倍（如 hard 12）要大声告知楼面。 |
| 7 | v03 | 611.mp4 | 4:31.4 | payouts | 收台前把筹码槽摆齐：直线看齐、用已证明的满摞核对，零头放右侧，然后开始收台。 |
| 8 | v04 | 612.mp4 | 6:42.4 | payouts | 先盖盖（不锁）；楼面收走牌靴和牌后再按颜色从大到小盘点。禁止手接手传筹（patty-cake）。紫色按 4 拆开证明。 |
| 9 | v05 | 613.mp4 | 2:59.3 | payouts | 和楼面一起盘箱：签字前核对、双方同意金额再写并喊 put it away；收好后自动拿出下一种颜色。 |
| 10 | v06 | 614.mp4 | 4:27.4 | payouts | 盘绿筹：一排最多 5 摞，按 4 拆最近一摞；课堂总额 $3,775。下一种是红。 |
| 11 | v07 | 615.mp4 | 1:11.9 | payouts | 拆红筹：靠近自己做、按 5 张一组，要让镜头看清。 |
| 12 | v08 | 617.mp4 | 1:52.2 | payouts | 双方看清并同意（本段红筹 $1,150），写下来再 put it away。下一种是粉筹。 |
| 13 | v09 | 618.mp4 | 5:32.7 | payouts | 7 张粉要切成 3-3-1（考核切法错仍算错）；白筹按 5 拆；25 分币按整美元、纸卷交给楼面。 |
| 14 | v10 | 619.mp4 | 4:27.7 | payouts | 收台文书双方签字；任何人不能把手伸进你的筹码槽；拍掌亮手后锁台。 |
| 15 | v11 | 620.mp4 | 8:01.5 | payouts | 开台盘点：先只拿满垛、大面额靠近自己、拆一垛证明其余；报总数时不许再碰筹。 |
| 16 | v16 | 640.mp4 | 10:26.9 | payouts | 开局扫台面、大面额在底；向镜头证明分牌/加倍注；按颜色整笔赔付，禁止分次赔。 |
| 17 | v17 | 641.mp4 | 2:54.1 | payouts | 同色赔付只需 size in；换色赔付必须先拆原注，再用 total look back 让镜头分清注和赔。 |
| 18 | v18 | 642.mp4 | 5:56.0 | payouts | 现场按 3:2 赔付：单色 size in 再 drop half，多色或换色则 total；槽里两手不要交叉。 |
| 19 | v19 | 643.mp4 | 2:48.2 | payouts | 按 3:2 把不会的金额拆成会的（如 $55=$50+$5）；切的是赔额，不要把本金算进去。 |

Inside `payouts`, the close-inventory chain (v03–v10) is left in the order it was taught, then the opening counterpart (v11), then mid-game payouts (v16–v19).

## Dedup

Drop only when content is confirmed the same (file sha256, and/or duration + audio sha256 + 4 raw frames). Never on name or size alone. Files were not deleted.

| Drop | Confirmation | Keep |
|---|---|---|
| Both Drive `609.mp4` (`1NprdWAQ…`, `1cy9jzDt…`) | Identical file sha256 to each other; remux of v01 (same duration 86.500s, same audio sha256, 4/4 frames; different file hash) | v01 |
| Drive `610.mp4` | Remux of v02 (238.916s, same audio sha256, 4/4 frames; different file hash) | v02 |
| Second Drive `611.mp4` (`1k5tX7gC…`) | Exact byte-identical copy (same file sha256, duration, audio, 4/4 frames) | v03 (`1ZYAzOBW…`) |
| Second Drive `612.mp4` (`1xrnhXT12…`) | Exact byte-identical copy (same file sha256, duration, audio, 4/4 frames) | v04 (`1Ggp2JW2…`) |
| `raw/resends/49049bb6.mov` | Remux of Drive 640.mp4 (626.897s, same audio sha256, 4/4 frames; different file hash) | v16 |

Near-dups that were **kept** (consecutive lesson segments, not copies): close chain v03–v10; open inventory v11 (same example totals, different procedure); splits v12–v14; doubles v15 plus a shorter beat in v16; table payouts v16–v19.

## Modules with no dedicated video yet

- `primer`
- `cut`
- `burn`
- `deal` — only a short stretch inside v16 (scan the layout, “no more bets,” $10 minimum)
- `peek`
- `dealer-hand` — no lesson clip; the training felt is **H17** (“DRAW TO 16 AND SOFT 17 AND STAND ON [HARD 17s]”), which fills a handout gap (讲义未写，以毡/学校为准). Earlier notes had misread this as S17.
- `take` — only a brief “take the money first, top of the rack, lock up the hand” in v12
- `clear-cards`
- `palms` — only a brief clap / show-hands at the end of v10
- `full-round`
- `mock`

`616.mp4` was never uploaded (gap in the 615–617 filename sequence). It is not assumed to fill any of the modules above.
