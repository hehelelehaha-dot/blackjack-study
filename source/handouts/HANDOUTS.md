# Nova 荷官学校讲义转写

Source: photos Nova sent of her casino dealer-school handouts, copied to `/workspace/dealer-exam-videos/handouts/`. These handouts are the authoritative house procedure for this training (including side bets, cheque colors, verbal calls, splits and doubles). They mention class on property at **YBR or PPC**. They are **not** a Turning Stone exam packet; the exam date, format, and whether the casino floor matches every line here are still unknown.

English below follows the handout wording. Chinese notes are study aids, or Nova's own handwriting where marked. Do not treat generic US blackjack practice as overriding these pages.

## Image inventory

| File (sha256 prefix) | What it is | Role |
|---|---|---|
| `d64e69e5…jpg` | Card Values handout (soft / hard hands + value chart) | **Canonical** Card Values page |
| `d5aefea0…png` | Clean color graphic of the same value chart only (2–9, 10/J/Q/K = 10, Ace = 1 or 11) | **Duplicate** of the chart on the Card Values page |
| `3db62f0a…jpg` | Classroom whiteboard: same Card Values lesson, plus the exercise “What is the total for each hand?” | Card Values portion is a **duplicate**; the **hand-total exercise is unique** and is transcribed below |
| `452bcaea…jpg` | Splits and Doubling Down | Unique |
| `82c66396…jpg` | Blackjack Payouts (3 to 2) and Common Blackjacks | Unique |
| `ac4b4964…jpg` | Insurance (rules + full-insurance table) | Unique |
| `b0771019…jpg` | Cheque Rundown | Unique |
| `613cccc3…jpg` | Breaking Down Cheques | Unique |
| `362e6c75…jpg` | Guest Service and Blackjack Terminology | Unique |
| `9242132d…jpg` | Match The Dealer paytable, with Nova's Chinese notes | Unique |
| `654f18c2…jpg` | Kings Bounty paytable, with Nova's Chinese notes | Unique |
| `b392946f…jpg` | Class Guidelines and General Policies (photo was rotated 90°; transcribed after rotating clockwise) | Unique |
| `f74273d0…png` | Screenshot of a resume form on `careers.turningstoneenterprises.com` | **Not course material. Excluded.** No personal details are transcribed or stored here. |

---

## 1. Card Values

**Canonical image:** `d64e69e5…jpg`  
**Duplicates:** the chart in `d5aefea0…png`; the Card Values half of whiteboard `3db62f0a…jpg` (keep the whiteboard only for the exercise in §1.1).

### Value chart

- 2, 3, 4, 5, 6, 7, 8, 9 — count their pip value.
- 10, Jack, Queen, King — each counts **10**.
- Ace — counts **1 or 11**.

中文：2–9 按点数；10、J、Q、K 都是 10；A 是 1 或 11。

### Soft Hands

Handout text:

> When an ace in the dealers/players hand can be counted as 11 or 1.
>
> Example:
> - Ace and a 4
> - Ace, 4 and a 3
> - Ace and a 9
>
> Soft hands offer flexibility and a certainty that the next hit will not result in a bust.

中文：软牌 = 手里的 A 还能算 11（也可以改算 1）。例子：A+4（软 15）、A+4+3（软 18）、A+9（软 20）。软牌再补一张不会立刻爆，因为必要时可把 A 改成 1。

### Hard hands

Handout text:

> Hard hands have no varying Ace value. This occurs when a player either has an Ace that acts as a single point because it would cause the hand to bust, or no Ace at all in the hand.
>
> Example:
> - Ace, 5 and an 8
> - 10 and a 7
> - Ace, 3 and a Jack

中文：硬牌 = A 的点数不能再变。两种情况：没有 A；或者把 A 算 11 会爆，所以 A 只能算 1。例子：A+5+8 = 硬 14；10+7 = 硬 17；A+3+J = 硬 14。

**Maps to modules:** `primer` (rules), `deal` (read totals while dealing), `dealer-hand` (soft/hard 17 when the dealer plays the hand).

### 1.1 Whiteboard exercise: “What is the total for each hand?”

**Image:** `3db62f0a…jpg` (right side of the board). The left side repeats Card Values and is a duplicate of §1.

Hands are listed in board order. Answers give the total a dealer should read, plus soft / hard / bust. Soft = an Ace is still counting as 11. If counting any Ace as 11 would bust, the Ace counts 1 and the hand is hard (or bust if it is still over 21).

| # | Hand (as written) | Answer | Soft / hard / bust | Working |
|---|---|---|---|---|
| 1 | A,6 | 17 | soft 17 | 11+6 |
| 2 | A,4,3 | 18 | soft 18 | 11+4+3 |
| 3 | A,9 | 20 | soft 20 | 11+9 |
| 4 | A,5,2 | 18 | soft 18 | 11+5+2 |
| 5 | 5,A,3 | 19 | soft 19 | 5+11+3 |
| 6 | 3,3,A,2 | 19 | soft 19 | 3+3+11+2 |
| 7 | 7,6,A,4 | 18 | hard 18 | 7+6+11+4 would bust, so A=1 → 18 |
| 8 | 8,5,A,8 | 22 | bust | even A=1 is 8+5+1+8=22 |
| 9 | K,3,A,6 | 20 | hard 20 | K=10; 10+3+11+6 would bust, so A=1 → 20 |
| 10 | 7,4,A,4,5 | 21 | hard 21 | A must be 1 |
| 11 | A,3,3 | 17 | soft 17 | 11+3+3 |
| 12 | A,2,3,5 | 21 | soft 21 | 11+2+3+5 |
| 13 | 4,4,4,5 | 17 | hard 17 | no Ace |
| 14 | A,A,9 | 21 | soft 21 | 11+1+9 (one Ace stays 11) |
| 15 | A,4,A,6,8 | 20 | hard 20 | both Aces must be 1 |
| 16 | 4,4,2,A | 21 | soft 21 | 4+4+2+11 |
| 17 | 6,8,7 | 21 | hard 21 | no Ace |
| 18 | 5,7,9 | 21 | hard 21 | no Ace |
| 19 | 8,3,10 | 21 | hard 21 | no Ace |

**Practice use:** these 19 lines are the practice-question set for reading totals. Put them in module `primer` and reuse as speed drills in `deal` and `dealer-hand`.

---

## 2. Splits and Doubling Down

**Image:** `452bcaea…jpg`

### Splits

> A player can split their first two cards that are of equal value.  
> The player must put up an equal amount to their original bet.  
> All double down bets must be moved to the right side of the original bet.  
> A player can split three times for a total of 4 hands.  
> Aces can only be split once and will receive 1 card.  
> A player can also double down after a split, with the exception of Aces.

中文（本堂规则，按此执行）：

- 只有前两张点数相等才能分牌。
- 分牌必须再下一份与原注相同的注。
- 加倍的筹码要放到原注的右侧。
- 最多分 3 次，一共 4 手。
- A 只能分一次，且每手只给 1 张牌。
- 分牌后可以加倍，但分开的 A 不能再加倍。

### Doubling Down

> - Players can double down on any two cards, except blackjack.
> - The double down bet must be moved to the right side of the original bet.
> - Players may bet any amount up to the original bet, if the bet is for less, verify the wager by announcing to the player “doubling down for less.”
> - Announce any double down that is irregular i.e. “doubling down on a hard 12.”
> - If the player's cards are a pair that potentially may be split, ask if it is a split or double down.

中文：

- 任意两张都可以加倍，21 点（blackjack）除外。
- 加倍筹码放到原注右侧。
- 加倍金额可以小于原注，但不能超过原注；少于原注时必须口头确认：**“doubling down for less.”**
- 不常见的加倍要喊出来，讲义例子：**“doubling down on a hard 12.”**
- 两张是对子、既可能分也可能加倍时，要问客人：是 split 还是 double down。

**Maps to module:** `signals` (reading signals, hitting, doubles and splits). Payouts for won doubles belong with `payouts`.

---

## 3. Blackjack Payouts (3 to 2)

**Image:** `82c66396…jpg`

> Blackjack pays 3 to 2  
> Knowing how to pay 1 - 10 will help you pay any bet.

This school's blackjack payout, as printed, is **3 to 2 only**. A 6 to 5 table is not in these handouts.

### Pay 1–10 (and the place-value columns)

| Bet | Pay | Bet | Pay | Bet | Pay | Bet | Pay |
|---|---|---|---|---|---|---|---|
| $1 | $1.50 | $10 | $15 | $100 | $150 | $1000 | $1500 |
| $2 | $3 | $20 | $30 | $200 | $300 | $2000 | $3000 |
| $3 | $4.50 | $30 | $45 | $300 | $450 | $3000 | $4500 |
| $4 | $6 | $40 | $60 | $400 | $600 | $4000 | $6000 |
| $5 | $7.50 | $50 | $75 | $500 | $750 | $5000 | $7500 |
| $6 | $9 | $60 | $90 | $600 | $900 | $6000 | $9000 |
| $7 | $10.50 | $70 | $105 | $700 | $1050 | $7000 | $10,500 |
| $8 | $12 | $80 | $120 | $800 | $1200 | $8000 | $12,000 |
| $9 | $13.50 | $90 | $135 | $900 | $1350 | $9000 | $13,500 |
| $10 | $15 | $100 | $150 | $1000 | $1500 | $10,000 | $15,000 |

Method taught on the page: memorize pays for $1–$10, then scale. Example: $25 = $20 + $5 → $30 + $7.50 = **$37.50**. $35 = $30 + $5 → $45 + $7.50 = **$52.50**.

### Common Blackjacks

As printed (the $5 row is written `$5 = 7.50`, without a dollar sign on the pay).

| Bet | Pay | Bet | Pay | Bet | Pay | Bet | Pay |
|---|---|---|---|---|---|---|---|
| $5 | $7.50 | $55 | $82.50 | $150 | $225 | $425 | $637.50 |
| $7.50 | $11.25 | $60 | $90 | $175 | $262.50 | $450 | $675 |
| $10 | $15 | $65 | $97.50 | $200 | $300 | $475 | $712.50 |
| $15 | $22.50 | $70 | $105 | $225 | $337.50 | $500 | $750 |
| $20 | $30 | $75 | $112.50 | $250 | $375 | $600 | $900 |
| $25 | $37.50 | $80 | $120 | $275 | $412.50 | $650 | $975 |
| $30 | $45 | $85 | $127.50 | $300 | $450 | $700 | $1050 |
| $35 | $52.50 | $90 | $135 | $325 | $487.50 | $750 | $1125 |
| $40 | $60 | $95 | $142.50 | $350 | $525 | $800 | $1200 |
| $45 | $67.50 | $100 | $150 | $375 | $562.50 | $900 | $1350 |
| $50 | $75 | $125 | $187.50 | $400 | $600 | $1000 | $1500 |

**Maps to module:** `payouts`. Also in the final mock.

### Practice questions (payouts)

Answers are the amount the dealer **pays** (the original bet stays out). All 3 to 2.

1. Player blackjack, bet $5. Pay? **$7.50**
2. Bet $25. Pay? **$37.50**  (think $20+$5 → $30+$7.50)
3. Bet $35. Pay? **$52.50**  ($30+$5 → $45+$7.50)
4. Bet $7.50. Pay? **$11.25**
5. Bet $75. Pay? **$112.50**  ($50+$25 → $75+$37.50)
6. Bet $55. Pay? **$82.50**
7. Bet $80. Pay? **$120**
8. Bet $150. Pay? **$225**
9. Bet $425. Pay? **$637.50**
10. Using only the 1–10 row: how do you build a $60 blackjack pay? **$6 pays $9, times 10 → $90.** Or $50+$10 → $75+$15 = $90.

---

## 4. Insurance

**Image:** `ac4b4964…jpg`

> Insurance is an additional bet the player can make when the first card the dealer is dealt is an Ace. The insurance bet will win if the dealer has a blackjack and lose if the dealer does not. After the dealer settles any Match the Dealer or Kings Bounty side bets, the dealer will announce **“Insurance Open”** in a clear voice and with a hand motion along the insurance line. The player can decide to take insurance by placing a wager on the insurance line that is equal to **half of their original bet or less**. A player that has a Blackjack has the option of taking **even money** when insurance is offered.

中文要点（按讲义顺序，这是本堂程序）：

1. 荷官第一张（明牌）是 A，才提供保险。
2. **先结算** Match the Dealer 和 Kings Bounty 这两个边注，**再**宣布 Insurance Open。
3. 喊 **“Insurance Open”**，声音清楚，并沿保险线做手势。
4. 保险金额 = 原注的一半，或更少。
5. 客人自己有 Blackjack 时，可以选择 **even money**（1 赔 1，马上结算该手）。
6. 保险赢的条件：荷官是 blackjack；否则保险输。

### Full Insurance table (half the bet)

| Bet | Full Insurance | Bet | Full Insurance |
|---|---|---|---|
| $5 | $2.50 | $55 | $27.50 |
| $10 | $5 | $60 | $30 |
| $15 | $7.50 | $65 | $32.50 |
| $20 | $10 | $70 | $35 |
| $25 | $12.50 | $75 | $37.50 |
| $30 | $15 | $80 | $40 |
| $35 | $17.50 | $85 | $42.50 |
| $37.50 | $18.75 | $90 | $45 |
| $40 | $20 | $95 | $47.50 |
| $45 | $22.50 | $100 | $50 |
| $50 | $25 |  |  |

保险若赢，按讲义外常见规则是 2 to 1（本页表格只列出 Full Insurance 的下注额，没有另印赔付列）。2 to 1 的意思：满额保险赢了，赔付额等于原注（$25 的满额保险 $12.50，赔 $25）。even money 是 1 to 1，不是 3 to 2。这些赔付算法放进 `payouts` 练习；程序本身放在 `peek`。

**Maps to module:** `peek` (procedure and the call “Insurance Open”); side-bet settlement that must happen first also uses the Match the Dealer and Kings Bounty pages; math drills in `payouts`.

### Practice questions (insurance amounts)

1. Bet $25, full insurance. Insurance bet? **$12.50**
2. Bet $37.50, full insurance. **$18.75**
3. Bet $80, full insurance. **$40**
4. Bet $100, player takes $30 insurance (less than maximum). Allowed? **Yes** (half or less). If the dealer has blackjack, insurance pays 2 to 1 = **$60**. The main bet is settled separately.
5. When do you announce “Insurance Open”? **After settling any Match the Dealer or Kings Bounty side bets**, when the dealer's first card is an Ace.
6. Player has blackjack, dealer shows an Ace, player takes even money on a $20 bet. Pay? **$20** (1 to 1, not 3 to 2).

---

## 5. Cheque Rundown

**Image:** `b0771019…jpg`

How to cut / display a number of cheques so the camera can read them.

### White, Red, Black and Orange

(broken down by 5's)

- 5 = 5
- 6 = 3-3
- 7 = 3-3-1
- 8 = 4-4
- 9 = 4-4-1
- 10 = 5-5

### Pink, Green and Purple

(broken down by 4's)

- 5 = 4-1
- 6 = 3-3
- 7 = 3-3-1
- 8 = 4-4
- 9 = 4-4-1
- 10 = 4-4-2

中文：切/亮筹码时按颜色分组。白、红、黑、橙按 5 的节奏切；粉、绿、紫按 4 的节奏切。例如 7 张红是 3-3-1；5 张绿是 4-1，不是一摞 5；10 张紫是 4-4-2。

**Maps to module:** `payouts` (chip cutting). Also used in buy-in / cheque change / color-up (between-hand procedures).

### Practice questions (rundown)

1. Cut out 7 red. Pattern? **3-3-1**
2. Cut out 5 white. **5**
3. Cut out 5 green. **4-1** (not a stack of 5)
4. Cut out 10 black. **5-5**
5. Cut out 10 purple. **4-4-2**
6. Cut out 9 orange. **4-4-1**
7. Cut out 6 pink. **3-3**
8. Why is 5 green not shown as “5”? **Green is in the 4's group (pink/green/purple), so 5 = 4-1.**

---

## 6. Breaking Down Cheques

**Image:** `613cccc3…jpg`

A full stack is **20** cheques. Values and the breakdown grouping:

| Color | Value | 20-stack total | Broken down by | Extra method on the page |
|---|---|---|---|---|
| White | $1 | $20 | 5's | — |
| Pink | $2.50 | $50 | 4's | — |
| Red | $5 | $100 | 5's | — |
| Green | $25 | $500 | 4's | — |
| Black | $100 | $2,000 | 5's | — |
| Purple | $500 | $10,000 | 4's | — |
| Orange | $1,000 | $20,000 | 5's | (1 and 1, stack, size in, drop 1, stack) |
| Grey | $5,000 | $100,000 | 4's | (1 and 1, stack and size in) |

Orange and Grey are starred on the handout (`*`).

中文：一摞标准是 20 张。粉 $2.50、绿 $25、紫 $500、灰 $5,000 按 4 张一组拆；白 $1、红 $5、黑 $100、橙 $1,000 按 5 张一组拆。橙、灰另有讲义上的手法备注，练习时按字面做，不要改成别的赌场的切法。

**Maps to module:** `payouts`; also buy-in / color-up.

### Practice questions (breaking down)

1. What is one stack of 20 red worth? **$100**
2. What is one stack of 20 green worth? **$500**
3. Pink chips are $____ and break down by ____. **$2.50; 4's**
4. How do you break a full tube of black? **By 5's** (four stacks of 5 = 20 = $2,000).
5. 20 orange are worth? **$20,000**. The printed method is: **1 and 1, stack, size in, drop 1, stack.**
6. 20 grey are worth? **$100,000**. Method: **1 and 1, stack and size in.** Broken down by **4's**.
7. A player colors up 20 red into green. How many greens? **4** ($100 ÷ $25).
8. Count: 3 green + 4 red. Total? **$75 + $20 = $95.**

---

## 7. Guest Service and Blackjack Terminology

**Image:** `362e6c75…jpg`

### Guest Service

1. Acknowledge all players verbally, with eye contact and a smile when they approach the game as well as when they leave the game. When a player buys in, wish them “good luck.” When they leave the game, thank them. **Conversation with players is encouraged and is part of your duties.** Conversation should not interfere with proper game pace and/or dealing accuracy.
2. Guest service is monitored on a regular basis by both table games management and outside agencies.
3. Team members will be aware of voice tone, verbiage, facial expressions and body language.
4. Be accessible to the players and be knowledgeable about the facility and events taking place.

中文：客人上来、离开都要口头招呼，眼神和微笑。买筹码时说 **“good luck.”** 离开时说谢谢。鼓励聊天，但这是工作的一部分，不能影响节奏和发牌准确性。语气、用词、表情、身体语言都在被观察。

### Blackjack Terminology

**Change and Amount:** When you are doing a cash transaction.

> Ex: A guest comes to the table and hands the dealer a $100 bill for cheques to play blackjack. The dealer will cut out $100 in cheques and say **“Change $100”** and wait for approval on transactions of **$100 or more**.

**Cheque Change and Amount:** When a guest would like change from a higher value cheque.

> Ex. A guest hands the dealer $100 in **GREEN** cheques and would like $100 in **RED** cheques. The dealer will bring the green cheques in to the **left** side of the working area, cut out $100 in red on the **right** side of the working area and say **“Cheque change $100”** and wait for approval on transactions of $100 or more.

**Cheques Play:** When a guest makes a bet of $100 or more. The dealer will announce **“Cheques Play”** and proceed with the hand.

**Black Action / Purple Action / Orange Action:** When a guest makes a bet with either a black, purple or orange cheques. The dealer will announce **“Black/Purple/Orange Action”** and proceed.

**Color Coming In:** When a guest is ready to leave and would like to exchange their cheques for a higher denomination of cheques. Before the dealer can bring the players cheques in, they have to say **“Color Coming In”** and wait for approval. Upon approval from the floor supervisor the dealer will bring the players cheques in to the **left** side of the working area and break down the players cheques. In the **right** side of the working area, the dealer will cut out the amount that is being colored up. The dealer will say **“Color up X Amount”** and wait for the Floor Supervisor to approve the transaction.

中文（喊话必须用英文原句）：

- 现金换筹码：切出筹码，喊 **“Change $100”**。**$100 及以上要等批准。**
- 大筹码换小筹码：大筹码放工作区**左侧**，小筹码在**右侧**切出，喊 **“Cheque change $100”**。$100 及以上等批准。
- 下注 $100 或以上：喊 **“Cheques Play”**，然后继续发牌。
- 黑/紫/橙色筹码下注：喊 **“Black Action”** / **“Purple Action”** / **“Orange Action”**，然后继续。
- 色筹离开：先喊 **“Color Coming In”**，等批准后才能把客人的筹码拿进来；左侧拆，右侧切出大面额，再喊 **“Color up X Amount”**，再等主管批准。

**Maps to modules:** verbal calls during the round go in `deal` (Cheques Play / color Action) and `payouts` / between-hand procedures (Change, Cheque change, Color Coming In, Color up). Guest-service lines are woven into those same steps, not a separate main module. Also `palms` / policies for working with the floor.

---

## 8. Match The Dealer

**Image:** `9242132d…jpg`  
Nova's handwritten Chinese is on the pay lines (kept verbatim).

| Result | Pays | Nova's note |
|---|---|---|
| 1 Unsuited Match | 3 to 1 | 1对不同花配对 |
| 2 Unsuited Matches | 6 to 1 | 2对不同花 |
| 1 Suited Match | 14 to 1 | 1对同花 |
| 1 Suited Match and 1 Unsuited Match | 17 to 1 | 1对同花、1对不同花 |
| 2 Suited Matches | 28 to 1 | 2对同花 |

Paytable:

| Wager | 1 Unsuited (3 to 1) | 2 Unsuited (6 to 1) | 1 Suited (14 to 1) | 1 Suited & 1 Unsuited (17 to 1) | 2 Suited (28 to 1) |
|---|---|---|---|---|---|
| $5 | $15 | $30 | $70 | $85 | $140 |
| $10 | $30 | $60 | $140 | $170 | $280 |
| $15 | $45 | $90 | $210 | $255 | $420 |
| $20 | $60 | $120 | $280 | $340 | $560 |
| $25 | $75 | $150 | $350 | $425 | $700 |
| $50 | $150 | $300 | $700 | $850 | $1,400 |
| $75 | $225 | $450 | $1,050 | $1,275 | $2,100 |
| $100 | $300 | $600 | $1,400 | $1,700 | $2,800 |

Per the Insurance page, **settle this side bet (and Kings Bounty) before announcing “Insurance Open.”**

**Maps to modules:** settlement order in `peek`; paytable practice in `payouts`.

### Practice questions (Match the Dealer)

Pays below are the **payout** amounts printed on the sheet (what you pay, not including the original side bet).

1. $25 wager, 1 Suited Match. Pay? **$350**
2. $5 wager, 2 Suited Matches. Pay? **$140**
3. $20 wager, 1 Suited & 1 Unsuited. Pay? **$340**
4. $10 wager, 2 Unsuited Matches. Pay? **$60**
5. $75 wager, 1 Unsuited Match. Pay? **$225**
6. When is this bet paid relative to insurance? **Before “Insurance Open.”**

---

## 9. Kings Bounty

**Image:** `654f18c2…jpg`  
Nova's handwritten Chinese is kept verbatim.

| Result | Pays | Nova's note |
|---|---|---|
| UNSUITED 20 | 4-1 | 非同花色 |
| TWO OFF-SUIT KINGS | 6-1 | 2张不同花色K |
| SUITED 20 | 9-1 | 同花色 20 |
| TWO SUITED QUEENS, JACKS OR 10's | 20-1 | *(no note on this line)* |
| TWO SUITED KINGS | 30-1 | 2张同花色 |
| PAIR OF KINGS (SPADES) | 100-1 | 一对K 黑桃 |
| PAIR OF KINGS (SPADES AND DEALER BLACKJACK) | 1000-1 | 一对黑桃K和dealer 21点 |

Limits printed on the page:

- MINIMUM BET $1
- MAXIMUM BET $100
- MAXIMUM AGGREGATE PAYOUT $25,000

Paytable (* = Maximum Aggregate Payout cap of $25,000):

| BET | 4-1 | 6-1 | 9-1 | 20-1 | 30-1 | 100-1 | 1000-1 |
|---|---|---|---|---|---|---|---|
| $1 | $4 | $6 | $9 | $20 | $30 | $100 | $1,000 |
| $2.50 | $10 | $15 | $22.50 | $50 | $75 | $250 | $2,500 |
| $5 | $20 | $30 | $45 | $100 | $150 | $500 | $5,000 |
| $10 | $40 | $60 | $90 | $200 | $300 | $1,000 | $10,000 |
| $15 | $60 | $90 | $135 | $300 | $450 | $1,500 | $15,000 |
| $20 | $80 | $120 | $180 | $400 | $600 | $2,000 | $20,000 |
| $25 | $100 | $150 | $225 | $500 | $750 | $2,500 | $25,000* |
| $50 | $200 | $300 | $450 | $1,000 | $1,500 | $5,000 | $25,000* |
| $75 | $300 | $450 | $675 | $1,500 | $2,250 | $7,500 | $25,000* |
| $100 | $400 | $600 | $900 | $2,000 | $3,000 | $10,000 | $25,000* |

**Maps to modules:** settlement order in `peek`; paytable practice in `payouts`.

### Practice questions (Kings Bounty)

1. $10, two suited kings (30-1). Pay? **$300**
2. $5, unsuited 20 (4-1). Pay? **$20**
3. $25, pair of kings in spades (100-1). Pay? **$2,500**
4. $50, pair of kings in spades and the dealer has blackjack (1000-1). Printed pay? **$25,000\*** (the uncapped 1000-1 would be $50,000, but the aggregate cap is $25,000).
5. $2.50, suited 20 (9-1). Pay? **$22.50**
6. Minimum and maximum bet? **$1 and $100.** Settle this bet **before** “Insurance Open.”

---

## 10. Class Guidelines and General Policies

**Image:** `b392946f…jpg` (rotated in the photo; read after a clockwise rotation).

### Class Guidelines

1. Be respectful of others.
2. Arrive on time for class.
3. Dress for success. Please adhere to our Image guidelines.
4. Set goals.
5. Participate in class activities
6. If you have a question, don't hesitate to ask.
7. The use of cell phones is reserved for break times. If you need to use the phone, excuse yourself and answer the phone in a timely manner.
8. The use of Drugs or Alcohol is not allowed on property.
9. **When on property for class at YBR or PPC, dealer school students may not play slot machines while on the clock.**
10. Smoking/Vaping must be done in designated team member areas (not in guest view)

### General Policies

1. Always provide prompt, courteous and accurate dealing.
2. **Never argue with a guest.**
3. **You are never to correct your own mistakes. Call a supervisor for all corrections and problems.**
4. **Exhibit an impartial position concerning the outcome of a hand.**
5. Know, understand, and practice the policies and procedures as defined for your assigned job.
6. Maintain an alert and courteous attitude at all times. If players request instruction as to how the game is played, be as helpful as possible, but **do not instruct players on how to bet their money or play their hand.**
7. Floor supervisors have the authority to instruct dealers to deviate from general policies under unusual circumstances.
8. Notify your supervisor immediately of anything occurring on or near you game that is in any way unusual. *(transcribed as printed: “you game”)*
9. **Cross firing is not permitted.** Conversation between dealers during a live game is not permitted unless it concerns the transfer of information pertinent to the game.
10. When calling out for change, color up etc. speak in a clear voice and at a volume that your supervisor will be able to hear and respond to. Dealers and Supervisors are a team and need to work as one.

中文（台面上要记住的几条）：

- 永远不要跟客人争。出错了**自己改是不允许的**，叫主管（Call a supervisor）。
- 对输赢保持中立，不要帮客人决定怎么下注或怎么打。
- 禁止 cross firing：直播台之间经销商不能闲聊，除非是跟这局有关的交接信息。
- 喊 Change、Color up 等，声音要让主管听得到。
- 课堂上在 YBR 或 PPC 物业、在钟点内，学员不能打老虎机。

**Maps to modules:** woven into `palms` (errors, calling the floor, leaving the table) and into every verbal-call step (`payouts`, buy-ins). Class guidelines stay as supporting school rules, not a dealing step.

---

## 11. Excluded image

`f74273d0…png` is a photo of a laptop on a Turning Stone careers resume page. It is not dealer-school course material. It is omitted from this transcription and must not be used in the app.

---

## 12. Incoming videos (placeholders)

Two videos are in `/workspace/dealer-exam-videos/raw/`:

- `raw/v01.mov`
- `raw/v02.mov`

They are being watched separately. This file does not transcribe them. After review, each one should be compressed, given a listening pack (`transcript_en`, `transcript_zh`, `glossary`, `dictation_lines`, `listening_questions`), and slotted into a dealing-step module in `manifest.json`.

---

## 13. Handout → module map (summary)

| Handout | Module id(s) |
|---|---|
| Card Values (`d64e69e5`, chart duplicate `d5aefea0`) | `primer`, `deal`, `dealer-hand` |
| Whiteboard totals exercise (`3db62f0a`) | `primer` (drill); reuse in `deal`, `dealer-hand` |
| Splits and Doubling Down | `signals` |
| Blackjack Payouts 3:2 | `payouts`, `mock` |
| Insurance | `peek`, `payouts` (math) |
| Cheque Rundown | `payouts` |
| Breaking Down Cheques | `payouts` (and buy-in / color-up) |
| Guest Service and Terminology | woven into `deal`, `payouts`, between-hand change/color-up; guest lines at those same steps |
| Match The Dealer | `peek` (settle before insurance), `payouts` |
| Kings Bounty | `peek` (settle before insurance), `payouts` |
| Class Guidelines and General Policies | `palms` and every “call the floor / verbal call” step |
| Resume screenshot | none (excluded) |
| `raw/v01.mov`, `raw/v02.mov` | unassigned placeholders |

No handout in this batch covers shuffle, cut, burn, pitch/shoe technique, peek technique, taking losing bets, clearing cards, or showing palms as a photo lesson. Those dealing steps still need videos (including v01/v02 once classified) and standard school procedure in the blueprint, without inventing Turning Stone-only exam rules.
