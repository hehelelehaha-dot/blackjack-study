# Blackjack 单元蓝图（独立荷官考试 App）

本文件给主管做独立 GitHub Pages PWA 用。主线是 **学会发牌（动手）**；英语主线是 **听懂教学视频里讲师/荷官在说什么**。Nova 的决定：A 视频库、B 按考试/上手需要组织、C 每条视频后过关再解锁、D 句型练习，四条都要，但过关闸门是听懂题，跟读和 Pattern Drill 是辅线。

权威来源：Nova 交来的荷官学校讲义，转写见 `/workspace/dealer-exam-videos/handouts/HANDOUTS.md`。讲义上的程序、喊话、筹码色、分牌/加倍、3:2 赔付、保险顺序、Match the Dealer / Kings Bounty 赔率表，以讲义为准，不拿“通用美式 21 点”去改它。讲义没有写到的手法（洗牌、切牌、烧牌、pitch/shoe、偷看底牌、收输注、收牌、亮掌），用常见荷官学校做法补上，并标明 **“讲义未写，按常见做法；现场以主管/学校为准”**。

**不要编造 Turning Stone 考试细节。** 已知：她申请了 Turning Stone 的 Blackjack Dealer in Training 2027，讲义提到上课地点在 YBR 或 PPC。未知（一律标“没记录”）：考试日期、笔试还是上桌、考试是否包含边注、赌场实地的 soft 17 / 牌副数 / 是否 3:2，是否与讲义完全一致。

---

## 1. 产品怎么用（ABCD 怎么综合）

- **A. 视频库：** 本游戏只有 Blackjack。视频按下面“台面顺序”进模块，不按随机主题堆。文件进 `/workspace/dealer-exam-videos/blackjack/NN-short-title.mp4`，清单在 `/workspace/dealer-exam-videos/manifest.json`。
- **B. 按会发牌来组织：** 模块顺序 = 一局牌在桌上发生的顺序。规则、点数、客人英语不是独立主模块，只在对应步骤里出现。开头保留一个很短的规则速览。
- **C. 过关再解锁：** 每条视频先看，再做 **听懂题**（“讲师说对……要怎么做？”）。通过后解锁下一条。建议通过线 80%，与已有 Blackjack Dealer Academy 课测一致，主管可定。
- **D. 英语以听为主：** 每条视频必须有英文字幕/逐字稿、中文翻译、本段术语和原话词汇表、听写句、听懂题。会说的荷官原句和 Pattern Drill 放在同一步里，但是辅线；30 秒复述也是辅线，不挡解锁。

没有视频时，模块仍先建好：讲义练习题、家中手法练习、听懂题模板。视频来了再填入库字段。

---

## 2. 视频规格（入库时用）

路径：`/workspace/dealer-exam-videos/blackjack/NN-short-title.mp4`（例如 `01-shuffle.mp4`）。

- 容器/编码：MP4，H.264 视频 + AAC 音频，`+faststart`
- 画面：720p（特写台面 480p 也可以）
- 码率参考：视频约 1–1.2 Mbps，音频 96 kbps（约每分钟 8–9MB）
- 体积：尽量低于 50MB；硬上限 90MB；更长的拆成 part 1、part 2
- 参考命令：

```bash
ffmpeg -i in.mp4 -vf "scale=-2:720" -c:v libx264 -preset slow -crf 28 -maxrate 1.2M -bufsize 2.4M -c:a aac -b:a 96k -movflags +faststart out.mp4
```

原始文件目前在 `raw/`，不要把未压缩的 `.mov` 直接推进 App。

---

## 3. 每条视频的听力包和 manifest 字段

解锁下一条的依据是听懂题，不是复述。视频入库后必须填：

| 字段 | 含义 |
|---|---|
| `game` | `blackjack` |
| `order` | 模块内顺序，从 1 起 |
| `title` | 英文短标题 |
| `note` | 一行：这段教什么手法 |
| `path` | 相对 `dealer-exam-videos/` 的路径 |
| `transcript_en` | 英文字幕/逐字稿（讲师和示范荷官原话） |
| `transcript_zh` | 中文翻译 |
| `glossary` | 本段出现的术语和口头短语，`{term_en, term_zh, heard_as}`，`heard_as` 尽量保留视频里的说法 |
| `dictation_lines` | 抽出来听写的关键句，`{en, zh}` |
| `listening_questions` | 听懂题，`{q_en, q_zh, answer_en, answer_zh}`，题干形态：“What did the instructor say to do with … / 讲师说对……要怎么处理？”必须根据视频原话出题，不能用讲义题冒充听懂题 |

讲义上的赔付表、手牌点数练习、切筹码练习，是 **手法/心算练习**，可放在对应模块里，但不代替听懂关卡。

视频还没入库时，听懂题只提供模板，并标明“待按视频原话改写”。

---

## 4. 和已有 Blackjack Dealer Academy 的关系（不要重复造一个知识页）

主管 11/21 做过全英文学习页 **Blackjack Dealer Academy**（13 课 + Dealer Math Gym），材料在 `/workspace/bj/`（不要改）。它已经覆盖：

| Academy 课 | 内容 | 和新 App 的关系 |
|---|---|---|
| L1 Game Basics and Card Values | 点数、软/硬牌、爆牌、Blackjack、push | 规则速览可引用同一套概念；**点数定义和例子以讲义 Card Values 为准** |
| L2 Table Layout and Equipment | 台面、shoe、弃牌架、筹码槽、毡上文字 | 速览里短述；讲义几乎没写台面图 |
| L3 Chips: Colors, Buy-ins, Change and Color-ups | 通用美式色筹 | **改用讲义的色和拆法**（含粉 $2.50、橙 $1,000、灰 $5,000；按 5 或按 4 拆；$100 及以上要批准；原句 Change / Cheque change / Color Coming In / Color up） |
| L4 Opening and Closing a Table | 开台收台 | 讲义几乎没写；本单元不单列主模块，附录里点一下即可 |
| L5 Shuffle, Cut and Burn | 洗/切/烧 | 拆成三个动手模块；讲义无图，按常见做法并等视频 |
| L6 Dealing Order and Card Pitching | 发牌顺序、pitch | 对应 `deal` |
| L7 Peek, Insurance and Even Money | 偷看、保险、even money | 对应 `peek`；**保险顺序以讲义为准：先结算两个边注，再喊 Insurance Open** |
| L8 Player Options and Hand Signals | 手势、加倍、分牌、投降 | 对应 `signals`；**分牌/加倍以讲义为准**（最多 4 手、A 只分一次只给 1 张、分后可加倍但 A 不行、doubling down for less、irregular 加倍要喊）。讲义没有写 surrender，标“讲义未写” |
| L9 Dealer Rules | 荷官补牌停牌 | 对应 `dealer-hand`；soft 17 毡上规则讲义未写，保持“以毡/学校为准” |
| L10 Chip Handling | 切、sizing、摞 | 对应 `payouts`；**切法以 Cheque Rundown / Breaking Down Cheques 为准** |
| L11 Paying and Taking, and Payout Math | 赔付和收注 | 拆成 `payouts` 和 `take`；**Blackjack 赔付以讲义 3:2 表为准**。Academy Math Gym 里的 6:5 **不要当成这套讲义的赔付**（讲义只印了 3 to 2） |
| L12 Game Protection, Clearing Hands, Errors | 亮掌、防作弊、叫主管 | 对应 `clear-cards`、`palms`；**出错自己改是不允许的，必须 call a supervisor**（讲义 General Policies） |
| L13 Table English | 对客人和叫楼面的句子 | 不单列主模块，把讲义原句织进各步骤；听懂优先于会说 |
| Dealer Math Gym | 3:2 / 6:5 / 保险 / even money / 加倍分牌 / 数筹码 / 色筹 / 换筹 / 切筹码；Easy/Medium/Hard 和 60 秒速度题 | **3:2、保险、换筹、切筹码、边注表** 直接用讲义数字做题。建议主管把 Math Gym 迁过来或并入本 App，但默认赔付改成讲义 3:2；6:5 可作可选“其他赌场”练习，并标明“本套讲义未列出” |

Academy 是 YouTube 外链 + 阅读 + 课测，刷新会丢进度。新 App 是：**视频进 App、按发牌步骤走、先听懂再解锁、按讲义做赔付和筹码**。不要再做一遍 13 课知识页。Vegas Aces 课若 Nova 以后发来，按步骤塞进对应模块，不要另开一套课表。

---

## 5. 房规差异（讲义写了的 vs 仍会变的）

**以讲义为准、本课就这么做：**

- Blackjack 赔 3 to 2（有 1–10 表和 Common Blackjacks 表）
- 保险：荷官第一张是 A 才开；先结算 Match the Dealer 和 Kings Bounty，再喊 “Insurance Open”；保险额 = 原注一半或更少；有 Blackjack 的客人可 even money
- 分牌：对子可分；最多分 3 次共 4 手；A 只分一次、每手 1 张；分后可加倍，A 除外
- 加倍：任意两张，blackjack 除外；筹码放原注右侧；少于原注要喊 “doubling down for less.”；不常见加倍要喊，例如 “doubling down on a hard 12.”；对子要先问是 split 还是 double
- 筹码色和一摞 20 张的金额、按 5 或按 4 拆、Rundown 口诀、橙/灰的手法备注
- $100 及以上的换筹、色筹要等批准；相应喊话用讲义原句
- 边注：Match the Dealer、Kings Bounty 及印在讲义上的赔率（Kings Bounty 单注 $1–$100，累计最高赔 $25,000）

**讲义没写、现场可能不同，不要写成 Turning Stone 已定规则：**

- 荷官在 soft 17 是停还是补（S17 / H17）——看毡
- 是否出现 6:5 的 Blackjack 桌
- 几副牌、handheld 还是 shoe、有没有洗牌机
- 偷看用 peek device 还是掀角；有的地方没有底牌（European no-hole-card）
- 烧几张、切牌深度（penetration）
- 客人可否碰牌（通常 shoe 面朝上不碰，pitch 面朝下可单手拿）
- 荷官先发明牌还是先发底牌
- 是否允许投降（surrender）、分牌后续分到什么程度以外的细节
- 考试形式和日期

---

## 6. 模块总表（从不会发到能走完整一圈）

顺序按桌上实际发生的动作。`primer` 是短预备，不是发牌步骤。

| order | id | 中文 | English |
|---|---|---|---|
| 0 | `primer` | 规则速览与台面认识 | Rules primer and table layout |
| 1 | `shuffle` | 洗牌 | Shuffle |
| 2 | `cut` | 切牌 | Cut |
| 3 | `burn` | 烧牌 | Burn |
| 4 | `deal` | 发牌（Shoe 或 Pitch） | Dealing: shoe or pitch |
| 5 | `peek` | 底牌、偷看与保险 | Hole card, peek, and insurance |
| 6 | `signals` | 读手势与给牌 | Reading signals, hitting, doubles and splits |
| 7 | `dealer-hand` | 荷官补牌与停牌 | Dealer hits and stands |
| 8 | `payouts` | 赔付与切筹码 | Payouts and chip cutting |
| 9 | `take` | 收走输掉的注 | Taking losing bets |
| 10 | `clear-cards` | 收牌 | Clearing cards |
| 11 | `palms` | 亮掌 | Showing palms |
| 12 | `full-round` | 完整一圈 | Full-round run-through |
| 13 | `mock` | 综合模拟 | Final mock |

局间事务（现金换筹、Cheque change、Color up）不是独立主模块，附在 §8 和附录 A，用讲义原句练。

---

## 7. 各模块

下列每步都包含：学习目标、手法、常见错误、家中练习（一副牌和筹码即可）、该步会听到/会说的英语、适用视频类型、听懂关卡、3–5 道检查题（含答案）、5–8 句关键英语（辅线）和 2–3 条 Pattern Drill（辅线）、30 秒复述（辅线）。检查题里若是听懂模板，会标明待按视频改写。

---

### 0. 规则速览与台面认识 `primer`

**学习目标：** 能在两秒内读出点数，分清软牌/硬牌/爆牌；认得台面上的位置和工具；知道本课 Blackjack 按讲义赔 3 to 2。

**讲义：** Card Values（`d64e69e5`，图 `d5aefea0` 为重复）；白板 19 手练习（`3db62f0a`）。台面部分讲义几乎没写，用常见布局：半圆桌、荷官左侧 first base 先发先打、右侧 third base 后打；shoe 多在荷官左边，弃牌架在右边，筹码槽在身前；看毡上的赔率和 soft 17 规定。

**手法：** 还不是发牌。先练“看见牌就报总数”。软牌 = A 还能算 11；硬牌 = 没有 A，或 A 算 11 会爆所以只能算 1。

**常见错误：** 把软 17 报成硬 17；A+5+8 仍把 A 算 11（应是硬 14）；blackjack 与“分牌后的 A+10”搞混（后者是 21，不是 blackjack，讲义在加倍/分牌里会用到）。

**家中练习：** 用一副牌做白板那 19 手，先不看答案，报“soft/hard + 总数”或 “bust”。全对再计时。题目和答案见 `HANDOUTS.md` §1.1。

**视频类型：** 讲点数、软硬牌、台面介绍的短片。白板课若拍了也放这里。

**听懂关卡（模板）：** “讲师说 Ace 可以算几？”“讲师举的 soft hand 例子是哪几手？”

**检查题：**

1. A,4,3 是多少？**软 18**（讲义例子）。
2. A,5,8 是多少？**硬 14**（A 只能算 1）。
3. 白板：7,6,A,4？**硬 18**。
4. 白板：8,5,A,8？**22，爆**。
5. 本课讲义里 Blackjack 赔几？**3 to 2**（不是 6 to 5）。

**关键句（辅线）：**

- “Ace is one or eleven.”  A 是 1 或 11。
- “This is a soft seventeen.”  这是软 17。
- “This is a hard fourteen.”  这是硬 14。
- “Twenty-one.” / “Blackjack.”  21 点 / 黑杰克。
- “Bust.”  爆了。

Pattern Drill：This is a soft/hard ____. → seventeen / eighteen / nineteen / twenty。

**30 秒复述：** 用中文加关键词英语，说出软牌和硬牌的定义，并各举讲义上的一个例子。

---

### 1. 洗牌 `shuffle`

**学习目标：** 按学校要求的步骤洗完（handheld 或 shoe），牌始终压低、不露底牌。

**讲义：** 无。常见做法：新牌或规定时段先 wash（牌面朝下在桌上打乱）；然后按 house shuffle 的固定次数 riffle / strip（box）/ 再 riffle。多副牌要先拆成小叠再洗。有洗牌机也要按机程序保护好牌。**现场以学校步骤为准。**

**手法：** 牌不离开台面太高；不翻明；拇指控制，牌边对齐；洗完保持一摞整齐。

**常见错误：** 洗牌抬得太高（摄像头和客人看到底牌）；跳步；洗完散落；把明牌暴露给客人。

**家中练习：** 两副牌（没有就一副）按同一套步骤连续洗 10 遍。目标：步骤顺序每次一样，没有牌翻面。

**视频类型：** 洗单副/双副、洗 shoe、wash the deck。Nova 的 `raw/v01.mov`、`raw/v02.mov` 若是洗牌，先放这里。

**听懂关卡（模板）：** “讲师说洗牌时牌要放多高？”“strip / box 是在第几步？”

**检查题：**

1. 为什么洗牌要压低？**避免露出底牌或其他牌面。**（常见做法）
2. 可不可以跳过其中一步自己发明顺序？**不可以。学校步骤要按顺序做完。**
3. 洗牌机是否就可以不管牌？**不行，仍要按程序保护牌。**（常见做法）
4. 听懂模板：讲师说 wash 时牌面朝上还是朝下？**待视频原话。**

**关键句：**

- “Wash the cards.”  打乱洗（洗牌）。
- “Riffle.”   dovetail 式洗牌。
- “I’m shuffling.” / “Shuffle.”  正在洗牌 / 洗牌。
- “Last hand.”  最后一局（切牌卡出来之后用，可在本步先认这个词）。

Pattern Drill：I’m going to ____ the cards. → wash / riffle / shuffle。

**30 秒复述：** 按顺序说出你的洗牌步骤，能夹英语关键词更好。

---

### 2. 切牌 `cut`

**学习目标：** 把切牌卡交给客人切，按切点把牌切好，再按学校深度把切牌卡插回 shoe（penetration）。

**讲义：** 无。常见做法：递切牌卡，说 “Would you like to cut?” 或 “Please cut.” 客人把卡插入牌叠；按插入处切开；再把切牌卡放到学校规定的深度（常约剩 1–1.5 副）。没人切则荷官自己切。**深度以学校为准。**

**手法：** 切牌卡递给客人时手势清楚、牌叠不倒；切完牌边对齐再进 shoe。

**常见错误：** 没请客人切就自己切（除非无人要切）；切完把切牌卡随便一插；露牌。

**家中练习：** 洗完后，用一张不同颜色的牌当切牌卡，自己扮演客人插入，完成切牌并把“切牌卡”放到固定深度，重复 10 次。

**视频类型：** 如何递切牌卡、如何把牌装进 shoe。

**听懂关卡（模板）：** “讲师说切牌卡要递给谁？”“讲师说切牌卡最后插在什么位置？”

**检查题：**

1. 通常谁来决定切在哪里？**客人；没人切才由荷官切。**
2. 切牌卡出来之后怎么办？**先打完当前这局，再洗牌。**（常见做法，可在烧牌/发牌里再练）
3. Penetration 指什么？**切牌卡放的深度，也就是这靴牌会发到多深再洗。**

**关键句：**

- “Would you like to cut?”  您要切牌吗？
- “Please cut.”  请切。
- “Thank you.”  谢谢（客人切完）。

Pattern Drill：Would you like to ____? → cut / play。

**30 秒复述：** 从递卡到卡插回 shoe，按顺序讲一遍。

---

### 3. 烧牌 `burn`

**学习目标：** 洗切完成、开始发牌前，把规定的烧牌（常见是第一张）进弃牌架，通常不给客人看。

**讲义：** 无。常见做法：从 shoe 或手持牌里取出第一张，不亮明（有的房规会闪一下，**以学校为准**），放进弃牌架。有人会说 “Burning.” 烧几张也以学校为准。

**手法：** 只烧规定张数；动作在工作区内、摄像头看得到；不要把烧牌发出去或亮给客人。

**常见错误：** 把烧牌面朝上亮出来（若学校要求不亮）；烧完忘记进弃牌架；烧了两张或漏烧。

**家中练习：** 切完后烧 1 张（或学校张数）进一个固定“弃牌”位置，然后才开始发，重复 10 圈。

**视频类型：** Burning a card。

**听懂关卡（模板）：** “讲师说烧牌要不要给客人看？”“烧几张？”

**检查题：**

1. 烧牌一般在什么时候？**洗切完成、第一圈发牌之前。**
2. 烧牌通常放哪？**弃牌架（discard rack）。**
3. 听懂模板：讲师说 burn card 亮不亮？**待视频原话。**

**关键句：**

- “Burning.”  烧牌。
- “Burn card.”  烧掉的那张牌。

Pattern Drill：（辅线较少）The first card is the ____ card. → burn。

**30 秒复述：** 什么时候烧、烧完放哪、为什么不能随便亮牌。

---

### 4. 发牌（Shoe 或 Pitch）`deal`

**学习目标：** 从 first base 顺时针发到 third base，只给有下注的位置发；荷官一明一暗；节奏稳定，不跳位。同时能边发边读点数（用讲义 Card Values）。下注 $100 及以上先按讲义喊 **“Cheques Play”**；黑/紫/橙筹码下注喊 **“Black Action” / “Purple Action” / “Orange Action”**，再发牌。

**讲义：** 点数用 Card Values；喊话用 Terminology。发牌手法本身未写。常见做法：

- 发牌前检查注都在下注格、不超过桌限。一旦开始发，客人不应再碰注。
- Shoe 局：客人牌面朝上，通常不能碰牌。
- Handheld / pitch：牌弹到客人面前，多面朝下，客人可用一只手拿牌；握牌的手要盖住牌面，手腕走直线，牌朝下注点飞，不要朝人脸。
- 荷官：一张明牌、一张底牌（hole card）。先发明还是先发暗，**以学校为准**。

**手法：** 不跳空位；两圈发完每人两张（有下注的位置）；底牌要 tuck 好，不能亮。

**常见错误：** 发给没下注的位置；跳过 first base；底牌闪了一下；pitch 甩到客人身上；开始发了还让客人改注。

**家中练习：** 摆 5 个“下注点”（用硬币当注），从左到右发两圈，给自己一明一暗。再加一个 $100 筹码的位置，发牌前先喊 “Cheques Play.” 每天 10 圈。穿插报点数：发完就报客人的两张是多少。

**视频类型：** From shoe to table、how to pitch、holding a single/double deck、tucking the hole card、发牌顺序。

**听懂关卡（模板）：** “讲师说第一张发给哪个位置？”“讲师说 hole card 要怎么 tuck？”

**检查题：**

1. 哪个位置先发？**First base（荷官左手边）。**
2. 客人下注 $100，发牌前喊什么？**“Cheques Play.”**（讲义）
3. 客人用黑筹下注喊什么？**“Black Action.”**（讲义）
4. Shoe 局客人的牌通常朝哪？**朝上，且通常不能碰。**（常见做法）
5. 听懂模板：讲师说 pitch 时手腕怎么放？**待视频原话。**

**关键句：**

- “Cheques Play.”  大额筹码下注（$100 或以上）。
- “Black Action.” / “Purple Action.” / “Orange Action.”
- “No more bets.”  停止下注（若学校有这句）。
- “First base.” / “Third base.”

Pattern Drill：____ Action. → Black / Purple / Orange。  Cheques play 只在 $100+ 时用。

**30 秒复述：** 从检查下注到发完两圈（含该喊 Cheques Play 的时机）。

---

### 5. 底牌、偷看与保险 `peek`

**学习目标：** 按讲义跑完 A 明牌程序：先结算边注，再开保险，再偷看；10 点明牌则通常直接偷看（讲义保险页只写了 A 的情况）。偷看时不让任何人看到底牌。

**讲义程序（必须按这个顺序）：**

1. 荷官第一张是 Ace。
2. **先结算** 所有 Match the Dealer 和 Kings Bounty。
3. 清楚喊 **“Insurance Open”**，并沿保险线做手势。
4. 客人可在保险线上放 **不超过原注一半** 的保险。
5. 自己有 Blackjack 的客人可选 **even money**。
6. 然后才偷看是否是荷官 Blackjack（peek 手法讲义未写：可能是 peek device 或掀角，**以学校为准**，绝不能把底牌亮给客人）。
7. 保险赢条件：荷官是 blackjack；否则保险输。满额保险的下注额见讲义表。

10 点明牌：讲义没写保险（保险只在 A 时开）。常见做法是立刻偷看。若是 blackjack，这局在客人行动前就结算。若没有，继续让客人打。

**手法：** 手势沿保险线走一圈；保险筹码放在保险线上；偷看时身体和手挡住，只有自己（和摄像头按学校规定）能看。

**常见错误：** 还没结算边注就喊 Insurance Open；保险超过一半还收了；偷看时亮牌；10 点明牌也开保险；把 even money 按 3 to 2 赔。

**家中练习：** 摆 3 个位置：一个买了 Match the Dealer，一个要满额保险，一个有 Blackjack 要 even money。按顺序：先假装赔边注 → 喊 “Insurance Open” 并做手势 → 收保险注或 even money → 再“偷看”。重复 10 次。满额保险数字用讲义表（$25 → $12.50，$37.50 → $18.75）。

**视频类型：** How the dealer checks for a blackjack、peeker、Insurance and even money。边注结算示范若有，也放这里或与 `payouts` 交叉链接。

**听懂关卡（模板）：** “讲师说喊 Insurance Open 之前要先做什么？”“讲师说保险最多能下多少？”

**检查题：**

1. 什么时候开保险？**荷官第一张是 A。**（讲义）
2. “Insurance Open” 之前先做什么？**先结算 Match the Dealer 和 Kings Bounty。**（讲义）
3. $25 的满额保险是多少？**$12.50**
4. $20 的客人有 Blackjack，要 even money，赔多少？**$20（1 to 1，不是 3 to 2）**
5. 保险可以少于一半吗？**可以。** 多于一半吗？**不可以。**

**关键句：**

- “Insurance Open.”  保险开始。
- “Insurance?”  要保险吗？（如学校还用短问句）
- “Even money?”  要 even money 吗？
- “Insurance Closed.”  保险结束（讲义未写这句，常见会有，待视频/学校确认）。
- “Blackjack.”  荷官或客人是黑杰克。

Pattern Drill：Insurance is ____. → open / closed。  Even money on ____. → twenty / twenty-five / fifty。

**30 秒复述：** 从“明牌是 A”到偷看结束，按讲义顺序讲，必须包含边注先结算和 “Insurance Open”。

---

### 6. 读手势与给牌 `signals`

**学习目标：** 看懂手势再给牌；按讲义处理加倍和分牌；每手打完再走下一个位置（从 first base 到 third base）。

**讲义规则（权威）：** 见 `HANDOUTS.md` §2。要点再记一次：对子可分，再下一份同额注；最多分 3 次共 4 手；A 只分一次、每手 1 张、分开的 A 不能加倍；其他分牌后可以加倍；加倍可用于任意两张（blackjack 除外）；加倍筹码放原注**右侧**；少于原注喊 **“doubling down for less.”**；不常见加倍要喊，例如 **“doubling down on a hard 12.”**；对子既可分又可加倍时，先问是 split 还是 double。

**手法（讲义未写手势，用常见做法，待视频确认）：** 摄像头要看到手势，只靠口头不够。常见：要牌 = 敲或刮桌；停牌 = 手掌在牌上方平挥；加倍 = 再放筹码（常再加口令/手势）；分牌 = 再放一份同额筹码。给牌：shoe 局补牌通常放在该手旁边；加倍常只给一张，许多场地这张牌横放。客人爆了：先收注再收牌（与 `take` 衔接）。

**常见错误：** 没看到手势就给牌；分 A 后又给第二张或允许再加倍；分了超过 4 手；加倍筹码放错边；对子没问就按加倍处理；把“分牌后的 A+10”当成 blackjack 按 3 to 2 赔。

**家中练习：** 写五张小纸：hit / stand / double / split / double for less。随机抽，做出对应手势和筹码动作，再补对的牌数。加一道：一对 8，先问 “Split or double down?” 再操作。分 A：只给每手 1 张就停。

**视频类型：** 手势、hitting the player、doubling down、splitting。Surrender 若视频出现，标“讲义未写，跟视频/学校”。

**听懂关卡（模板）：** “讲师说加倍的筹码放在哪一侧？”“讲师说分 A 之后每手给几张？”

**检查题：**

1. 最多可以分成几手？**4 手（分 3 次）。**（讲义）
2. 分开的 A 怎么打？**每手只给 1 张，不能再加倍。**
3. 客人加倍但筹码少于原注，你喊什么？**“doubling down for less.”**
4. 客人硬 12 加倍，你喊什么？**“doubling down on a hard 12.”**
5. 只有口头说 hit、没有手势，怎么办？常见做法：要手势，例如 “Can I get a signal, please?” **（讲义未写这句，待视频/学校）**

**关键句：**

- “doubling down for less.”
- “doubling down on a hard 12.”
- “Split or double down?”  是分牌还是加倍？
- “Can I get a signal, please?”  请给一个手势。（常见，讲义无）
- “Hitting.” / “One card.”  补牌 / 只给一张（加倍时）。

Pattern Drill：doubling down on a hard ____. → twelve / thirteen / fourteen。  Split or ____? → double down。

**30 秒复述：** 讲清分牌上限、分 A 的限制、加倍放哪、哪两句必须喊出来。

---

### 7. 荷官补牌与停牌 `dealer-hand`

**学习目标：** 客人全部打完后，翻开底牌，按规则补或停，大声报总数。荷官自己没有“选择”，只执行规则。

**讲义：** 用 Card Values 读软/硬。讲义没有印 “hit soft 17” 或 “stand on 17”。常见规则：**16 及以下必须补，硬 17 及以上停；软 17 看毡（S17 停，H17 补）；软 18 及以上通常停。** 全桌客人都爆了或投降了，还要不要翻底牌、还要不要补，**以学校为准**。

**手法：** 翻底牌动作在工作区；补牌加在荷官这手（位置按学校）；每补一次先在心里/口头报新总数；爆了清楚说 “Dealer busts.”

**常见错误：** 软 17 没看毡就停或就补；把 A+6+10 仍当软 17（这是硬 17，应停）；总数报错；客人还没打完就翻底牌。

**家中练习：** 用白板思路给自己发一明一暗，再补到停。先做 20 手，必须口头报：“Dealer has sixteen” → 补 → “Dealer has twenty” / “Dealer busts.” 另做 10 手软牌（A+6、A+5+A 等），先设定“本桌 H17”或“本桌 S17”再执行。

**视频类型：** Hitting the dealer’s hand、soft hands、读总数。

**听懂关卡（模板）：** “讲师说荷官 16 怎么办？”“讲师说软 17 看什么来决定？”

**检查题：**

1. 荷官硬 16？**必须补。**
2. 荷官硬 17？**停。**
3. 荷官 A+6，毡上写 Dealer must hit soft 17？**补。** 若写 stand on 17？**停。**（讲义未指定本课毡规则）
4. A+5 再补一张 10？**硬 16，必须再补。**
5. 白板：K,3,A,6 翻开后是多少？**硬 20，停。**

**关键句：**

- “Dealer has sixteen.” / “Dealer has seventeen.”
- “Dealer has a soft seventeen.”
- “Dealer busts.”  荷官爆了。
- “Dealer has blackjack.”

Pattern Drill：Dealer has ____. → sixteen / seventeen / eighteen / nineteen / twenty / twenty-one / a soft seventeen。  Dealer ____. → busts / stands。

**30 秒复述：** 从翻底牌到停或爆，说明 16 和软 17 怎么处理。

---

### 8. 赔付与切筹码 `payouts`

**学习目标：** 用讲义的 Rundown 和 Breaking Down 切出干净、摄像头能读的筹码；按 3 to 2 表赔 Blackjack；按边注表赔 Match the Dealer 和 Kings Bounty；1 赔 1 的赢注用 sizing 或等额切出，放在原注旁边（具体位置以学校为准），赔付和原注要分得清。

**讲义权威数字和切法：** 见 `HANDOUTS.md` §3、§5、§6、§8、§9。记住：

- “Knowing how to pay 1 - 10 will help you pay any bet.”
- 白/红/黑/橙按 5 切；粉/绿/紫按 4 切（5 张绿是 4-1，不是一摞 5）
- 一摞 20 张的金额：白 $20，粉 $50，红 $100，绿 $500，黑 $2,000，紫 $10,000，橙 $20,000，灰 $100,000
- 橙：*(1 and 1, stack, size in, drop 1, stack)*；灰：*(1 and 1, stack and size in)*
- 边注若在保险前已结算，这里是补练习；若某局没有 A、边注仍要在相应时点赔付
- 赢的加倍：按加倍后的总注 1 赔 1（讲义未写这句算法，是通用结算；与讲义“加倍筹码在原注右侧”一起练）

**手法：** 切筹码在工作区；sizing = 用一摞去对齐原注高度再拿掉多余，常用于 1 赔 1；多色注通常大面额在下、小面额在上（常见做法）。赔完再收该手的牌，或按学校的收付顺序（与 `take` 一起扫桌，见下模块）。

**常见错误：** 5 张绿切成一摞 5；3 to 2 算成 1 to 1 或 6 to 5；even money 按 3 to 2 赔；Kings Bounty 1000-1 大注忘记 $25,000 封顶；赔付和原注叠成一堆摄像头分不清。

**家中练习：**

1. 按 Rundown 切：7 红（3-3-1）、5 绿（4-1）、10 紫（4-4-2）、9 橙（4-4-1），各 10 遍。
2. 讲义赔付题：`HANDOUTS.md` §3、§4、§8、§9 的练习题，先口算再切出对应筹码。
3. 把 $25 Blackjack 切出 $37.50（需要粉筹 $2.50 或等价做法）。

可将原 Academy Dealer Math Gym 迁入，但默认用本讲义 3:2 和讲义边注表。

**视频类型：** stacking、cutting、taking and paying、how to pay 3 to 2、cheque change、coloring up。换筹/色筹视频也可放在本模块或附录 A。

**听懂关卡（模板）：** “讲师说 3 to 2 怎么切？”“讲师说绿筹码按几拆？”

**检查题：**

1. $25 Blackjack（3 to 2）赔多少？**$37.50**
2. $35 Blackjack？**$52.50**
3. 5 张绿怎么亮？**4-1**
4. 20 张红等于？**$100**
5. $25 的 Match the Dealer，1 Suited Match，赔多少？**$350**
6. $50 Kings Bounty、一对黑桃 K 且荷官 blackjack？**$25,000（封顶），不是 $50,000**

**关键句：**

- “Change $100.”  现金换筹（$100 及以上等批准）。
- “Cheque change $100.”  大筹换小筹。
- “Color Coming In.”  先喊再把客人筹码拿进来。
- “Color up X Amount.”  色筹金额，再等批准。
- “Blackjack pays three to two.”

Pattern Drill：Change ____. → fifty / one hundred / two hundred。  Color up ____. → one hundred / two hundred / five hundred。  Cheque change ____.

**30 秒复述：** 讲 3 to 2 的 1–10 算法，并演示 $25 怎么得到 $37.50；再说绿筹码为什么 5 张要切成 4-1。

---

### 9. 收走输掉的注 `take`

**学习目标：** 结算时从 third base（荷官右侧）收到 first base（左侧）是常见顺序（**以学校为准**）。遇到输的位置：先把筹码收到槽里，再收牌。不要漏收，也不要先收牌后忘记收注。

**讲义：** 无单独一页。和 `payouts` 在真实桌上是同一轮扫过去的：输的收，赢的赔，push 留注并拍一下桌（常见做法，让摄像头看到你没有漏过）。客人 blackjack 常常在偷看之后、该位置行动时就已经赔过 3 to 2。

**手法：** 手只在工作区和该下注点之间移动；筹码进槽要整齐；输注不要跟赔付的筹码混在手上。

**常见错误：** 先收牌忘了收注；从 first base 收到 third base（若学校规定相反就会错）；push 也收走了；赢的当成输的收走。

**家中练习：** 摆 5 个位置，预先写 win / lose / push / blackjack（已赔过）。从自己的右边扫到左边：输的收筹码，赢的放下赔付，push 拍桌。重复 10 圈，要求一口气流畅。

**视频类型：** Taking and paying wagers。

**听懂关卡（模板）：** “讲师说收输注时先拿筹码还是先拿牌？”“讲师说从桌子哪一边开始结算？”

**检查题：**

1. 常见结算方向？**从 third base 到 first base（荷官右到左）。以学校为准。**
2. 输的位置通常先收什么？**先收筹码，再收牌。**（常见做法）
3. Push 怎么办？**注留在桌上，拍桌示意。**（常见做法）
4. 已经赔过的客人 blackjack，还要再赔一次吗？**不要。**

**关键句：**

- “Push.”  平了。
- “Sorry.”  客人输了时若学校允许的简短礼貌用语（不要幸灾乐祸；讲义要求对结果保持中立）。

Pattern Drill：（辅线）That’s a ____. → push / bust / blackjack。

**30 秒复述：** 从桌子哪边开始、遇到输/赢/平各做什么。

---

### 10. 收牌 `clear-cards`

**学习目标：** 该结算的位置都处理完后，把牌按学校顺序收进弃牌架，不要把未结算的牌和注搅乱。

**讲义：** 无。常见做法：用弃牌架（discard rack，多在荷官右侧）；收牌顺序按学校（有的按位置依次收）；shoe 局牌已朝上，直接收；pitch 局注意客人手里的牌也要按程序收回。不要把用过的牌再混回 shoe。

**手法：** 一次收干净；牌边对齐进弃牌架；手不要挡住摄像头对下注的视线（若还有未处理的注，不要先收）。

**常见错误：** 还没赔完就收牌；牌收进 shoe；收牌顺序乱导致争议时无法还原。

**家中练习：** 和上一模块连做：结算完立刻按固定顺序把 5 个位置的牌收到右手边的“弃牌架”（一个盒子即可），每圈结束架里的牌应等于这圈发出去的张数（含烧牌和荷官的牌）。

**视频类型：** Picking up cards at the end of a hand、handheld pickup、using the discard rack。

**听懂关卡（模板）：** “讲师说牌收进哪里？”“讲师说收牌从哪个位置开始？”

**检查题：**

1. 用过的牌放哪？**弃牌架，不是 shoe。**
2. 还没赔的位置能不能先收牌？**不能。**
3. 切牌卡从 shoe 里出来后？**打完这一圈，再洗。**（常见做法）

**关键句：**

- “Last hand.” / “Shuffle coming.”  最后一局 / 要洗牌了（若切牌卡已出）。

Pattern Drill：Last ____. → hand。

**30 秒复述：** 什么时候开始收牌、收到哪、切牌卡出来后这圈怎么收尾。

---

### 11. 亮掌 `palms`

**学习目标：** 在学校规定的时点向摄像头亮出双手掌心和掌背（clearing hands）；离台、换人、处理现金后尤其要做。出错不自己改，叫主管。

**讲义（General Policies，必须执行）：**

- Never argue with a guest.
- You are never to correct your own mistakes. Call a supervisor for all corrections and problems.
- Exhibit an impartial position concerning the outcome of a hand.
- 不要教客人怎么下注或怎么打。
- Cross firing 禁止。
- 喊 change、color up 等，声音要让主管听到。

亮掌手法本身讲义未写。常见做法：双手打开，掌心掌背对着摄像头；离开桌子、交班（tap out）、收完现金进 drop box、以及学校要求的其他时点。不要在台边把手伸进口袋或转身背对筹码槽。

**手法：** 亮掌时手是空的；动作慢到摄像头能看清。

**常见错误：** 离台不亮掌；出错后偷偷改注或改赔；和客人争；和邻台闲聊。

**家中练习：** 每圈结束做一次“双手亮掌再离开椅子”；再模拟一次“赔错了”：停下、什么都不要改、口头 “Floor, please.” 或 “Supervisor, please.”

**视频类型：** Breaks and clearing your hands、game protection、calling the floorman。

**听懂关卡（模板）：** “讲师说什么时候必须亮掌？”“讲师说赔错了能不能自己改？”

**检查题：**

1. 赔错了怎么办？**不能自己改。Call a supervisor。**（讲义）
2. 可以和客人争谁赢了吗？**不可以。**
3. 客人问“这手该不该加倍”，你能直接教他怎么打吗？**不能教他怎么下注或怎么打；可以解释规则。**（讲义）
4. 什么是 cross firing？**直播台期间经销商之间闲聊（与本局无关）。禁止。**

**关键句：**

- “Floor, please.” / “Supervisor, please.”  请主管过来。
- “Good question. Let me ask my supervisor.”  好问题，我请主管来。
- “Change one hundred!”  要让主管听得到。

Pattern Drill：Let me ask my ____. → supervisor / floor。  Never argue with a ____. → guest。

**30 秒复述：** 什么时候亮掌、出错为什么不能自己改、要喊哪句把主管叫来。

---

### 12. 完整一圈 `full-round`

**学习目标：** 把 1–11 步串成连续动作，中间插入讲义规定的边注结算、保险喊话和大额筹码喊话，不中断。

**手法：** 洗 → 切 → 烧 → 检查下注并喊 Cheques Play / Color Action（如需要）→ 发两圈 → 若有边注先结算 → 若明牌是 A，Insurance Open → 偷看 → 按手势给牌/加倍/分牌 → 荷官翻牌补或停 → 从右到左赔和收 → 收牌 → 该亮掌时亮掌。

**家中练习：** 每天完整走 5 圈。可用计时，但不牺牲喊话和切筹码的准确性。一圈里至少安排：一次 $100 换筹或 Cheques Play、一次保险、一次加倍 for less、一次分牌、一次 3 to 2 赔付。

**视频类型：** 完整示范一圈的长视频；或把已过关短视频按顺序连看一遍。

**听懂关卡：** 若本模块有整圈视频，按原话出 5 道顺序题，例如“讲师说保险在边注之前还是之后？”

**检查题：** 抽问整圈顺序（边注在 Insurance Open 之前；先结算再收牌；出错叫主管）。

**关键句：** 本圈实际用到的讲义原句，全部再过一遍。

**30 秒复述：** 不看稿说出一圈的步骤顺序，必须提到边注和 Insurance Open 的先后。

---

### 13. 综合模拟 `mock`

这不是 Turning Stone 真考（形式未知），是本课结束后的自测，用来判断“能不能发一圈 + 听不听得懂”。建议三块，可分开计分：

**A. 听懂模拟。** 抽若干已入库视频片段（无字幕先听），题型固定为 “What did the instructor say to do with …？” 通过线建议 80%。v01/v02 入库后优先抽它们。

**B. 动手模拟。** 在家完整发 3 圈，包含：洗切烧、Cheques Play、保险（先边注后 Insurance Open）、一次 split、一次 doubling down for less、荷官软/硬 17、一次 3 to 2、一次收输注、收牌、亮掌。能录像更好（以后可发给英语 bot 或自己对稿）。

**C. 心算与讲义题。** 从 `HANDOUTS.md` 抽出：19 手点数、3 to 2 赔付、满额保险、Rundown、Breaking Down、Match the Dealer、Kings Bounty（含 $25,000 封顶）。可接 Math Gym，默认 3 to 2。

不要把本模拟写成“Turning Stone 考试原题”。

---

## 8. 附录 A. 局间事务（换筹与色筹）

穿插在发牌之间，用讲义 Terminology 原句。工作区：**进来的筹码在左，切出去的在右。** $100 及以上等批准。

1. 现金换筹：把钞票摊在桌上（常见做法：让摄像头看见，不要从客人手上直接拿——讲义例子写 guest hands the dealer a bill，现场以学校为准），切出筹码，喊 **“Change $100”**，批准后给客人，现金进 drop box。买筹成功按 Guest Service 说 **“good luck.”**
2. Cheque change：大面额进左侧，右侧切出小面额，喊 **“Cheque change $100”**，等批准。
3. Color coming in：先喊 **“Color Coming In”**，批准后才能把客人筹码拿进来；左侧拆，右侧切大面额，喊 **“Color up X Amount”**，再等批准。
4. 客人离开：thank them（讲义 Guest Service）。

这些练习附在 `payouts` 之后即可，不另开主模块。

---

## 9. 附录 B. 待入库视频

| 路径 | 状态 |
|---|---|
| `raw/v01.mov` | 占位。正在另行观看。不要在本蓝图里假装已经分类。压缩并写听力包后，再写入 `manifest.json` 对应模块。 |
| `raw/v02.mov` | 同上。 |

之后 Nova 续发的视频：先压缩到 `blackjack/NN-short-title.mp4`，再补听力包和听懂题，更新 manifest，通知主管更新 App。

---

## 10. 附录 C. 给主管的实现要点

- 独立 App，不要塞进英语 App。
- 模块树按上面 order；每个模块内视频列表按 `order` 锁关，听懂题通过才解锁下一条。
- 讲义练习题（点数、3 to 2、保险、Rundown、拆筹、两个边注）做成可重练的练习，不挡视频解锁。
- 文案里的荷官喊话保持英文原句，中文只作释义。
- 不要把 6:5 写成这套讲义的默认赔付。
- 不要把被排除的简历截图或任何个人信息放进 App。
- 讲义照片可作模块参考图（Card Values 只放 canonical 一页，白板练习可放，重复图不放三遍）。政策和术语页可进“参考讲义”。
