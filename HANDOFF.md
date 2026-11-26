# HANDOFF：Blackjack 学习app

给接手维护的 bot（水球泡）和下一位写代码的人。这是 Nova 的二十一点荷官课堂，静态 PWA，iPhone Safari 优先，仓库：[hehelelehaha-dot/blackjack-study](https://github.com/hehelelehaha-dot/blackjack-study)。线上地址是 GitHub Pages：https://hehelelehaha-dot.github.io/blackjack-study/ 。不要改 Nova 现有的 `/workspace/bj` 或英语 app。

## 仓库结构

```
index.html, styles.css, app.js, sw.js, manifest.json   应用本体（路径都是相对的）
icons/                                                 PWA 图标
assets/handouts/                                       讲义图，给规则页用
data/
  videos.json          视频清单、模块表、过关线
  curriculum.json      五个模块页用的课堂提纲
  rules.json           规则条目（以讲义为准）
  english.json         Dealer English 句子和句型
  drills.json          Practice & Review
  audio-lines.json     所有会朗读的英文句子 {id, text, role}
audio/
  index.json           已生成的 id 和有时间戳的 id
  <id>.mp3             Fish Audio 预生成朗读
  <id>.json            逐词时间戳 {words:[{w,start,end}]}
videos/blackjack/      压缩后的课堂视频
source/                蓝图、讲义、视频笔记和原始资料索引
scripts/
  compress_video.sh    压缩（或按分钟切开）一条视频
  gen_audio.py         按 audio-lines.json 生成 mp3 和时间戳
```

五个模块对应 Classroom、Dealer English、Game Rules、Study Notes、Practice & Review。主题是学会发牌；英语重点是听懂视频里的人在说什么。

## `data/videos.json` 字段

顶层：

- `game`：目前是 `"blackjack"`
- `pass_line` / `watch_line`：默认 `0.8`（80%）
- `gate_zh`：过关说明文案
- `modules`：14 个模块的 `{id, order, title_zh, title_en}`，顺序就是牌桌流程
- `videos`：视频条目数组

一条视频的例子（长逐字稿已缩短）：

```json
{
  "id": "shuffle-01",
  "game": "blackjack",
  "module_id": "shuffle",
  "order": 1,
  "title": "Announce Shuffle",
  "note": "洗牌前必须大声向楼面喊 Shuffle，不是在请示许可。",
  "path": "blackjack/01-announce-shuffle.mp4",
  "duration": "1:26",
  "duration_sec": 86.5,
  "transcript_status": "whisper",
  "transcript_note": "逐字稿来自录音，不是讲义。冲突时先对一下讲义和录音，并写清以谁为准。",
  "transcript_en": "…",
  "transcript_zh": "…",
  "cues": [
    {"t": 6, "en": "Shuffle!", "zh": "洗牌！", "audio_id": "d-shuffle"},
    {"t": 17, "en": "You have to announce it loud enough that your floor can hear you.", "zh": "要宣布得够大声，让楼面主管听得见。", "audio_id": "d-announce-loud"}
  ],
  "glossary": [
    {"term_en": "Shuffle!", "term_zh": "洗牌，要大声喊", "heard_as": "Shuffle! / a quiet shuffle", "audio_id": "d-shuffle"}
  ],
  "dictation_lines": [
    {"en": "You have to announce it loud enough that your floor can hear you.", "zh": "要宣布得够大声，让楼面主管听得见。", "audio_id": "d-announce-loud"}
  ],
  "listening_questions": [
    {
      "q_en": "What did the instructor say to do before you shuffle?",
      "q_zh": "讲师说洗牌之前要怎么做？",
      "answer_en": "Announce it loud enough that the floor can hear you.",
      "answer_zh": "要大声宣布，让楼面主管听得见。",
      "choices": [
        {"en": "Announce it loud enough that the floor can hear you.", "zh": "大声宣布，让楼面听得见。"},
        {"en": "Ask the floor for permission.", "zh": "先向楼面请示许可。"}
      ]
    }
  ],
  "overview": {
    "summary_zh": "这条先练嘴。轮到洗牌时要先喊 Shuffle，这不是请示许可。",
    "points": [{"t": 10, "zh": "洗之前必须先宣布。"}],
    "mistakes_zh": ["轻轻说一声 shuffle，楼面听不见。"]
  },
  "rules": [
    {"source_zh": "讲义 General Policies", "text_zh": "喊话要让主管听见。这条把同一条用到了 Shuffle。"}
  ],
  "rule_ids": ["policies"]
}
```

要点：`path` 是相对于 `videos/` 的相对路径；`module_id` + `order` 决定它在哪个模块、第几条；`audio_id` 必须能在 `data/audio-lines.json` 里找到；`listening_questions` 是过关用的听懂题；`rule_ids` 链到 `data/rules.json`。

## 如何加一条视频

1. 用脚本压缩，不要把原始大文件推进仓库：

   ```bash
   scripts/compress_video.sh raw.mov videos/blackjack/04-your-slug.mp4
   ```

   编码目标：

   - 分辨率：720p；如果片源更小，保持原分辨率，不要拉升
   - 视频：H.264，crf 28–30，maxrate 0.9–1.2M（脚本会按 28/1.2M → 29/1.0M → 30/0.9M 重试）
   - 音频：AAC 96k
   - `+faststart`，方便 iPhone 边下边播
   - 硬上限 **90 MB**（GitHub 单文件接近 100 MB 就会拒绝）；尽量压到 **50 MB** 以内
   - 长视频请切开。按现在的码率，大约 6 分钟比较容易落在 50 MB 附近，10 分钟会靠近 90 MB：

     ```bash
     scripts/compress_video.sh raw.mov videos/blackjack/04-your-slug.mp4 --split-minutes 6
     ```

     切开后会得到 `04-your-slug-part01.mp4` 等，每一段在 `videos.json` 里单独占一条，`order` 按课堂顺序排。

2. 把文件放到 `videos/blackjack/`，文件名与 `path` 一致。
3. 在 `data/videos.json` 里加一条，填好转写、cues、听懂题、overview。`duration` / `duration_sec` 用 `ffprobe` 核对。
4. 笔记和逐字稿放到 `source/`（见下方）。规则以讲义为准，和视频冲突时在 `transcript_note` 和 `rules[].source_zh` 里写清楚。
5. 如果有新的要朗读的句子，先加进 `data/audio-lines.json`，再跑 `scripts/gen_audio.py`。
6. 需要的话同步改 `data/curriculum.json`、`data/english.json`、`data/rules.json`、`data/drills.json`。
7. 把 `sw.js` 里的 `VERSION` 往上加一档（现在是 `bj-v3`），否则手机还会用旧缓存。
8. 按下面的发布步骤提交。

## 过关（gating）怎么工作

过关是**按模块**的，不是整门课一条线。

- `watch_line`（默认 80%）：这条视频要先看到 80%，才能做听懂题。
- `pass_line`（默认 80%）：听懂题正确率达到 80%（向上取整）才算过关，`state.videos[id].passed = true`。
- 同一模块里，`order` 为 1 的第一条一开始就能看。下一条要等**同一模块**上一条听懂题过关后才解锁。
- 已经过关的不会因为后来重做没过而被取消。
- 中间还没有视频的模块不会挡别的模块。比如赔付模块的第一条一开始就能看，不必先把洗牌全部过完。
- 进度存在这台手机的 `localStorage`（键名 `bj-study-progress-v1`），不上传。清网站数据会丢，设置页可以导出 JSON 备份。

## 朗读音频（Fish Audio）

不要在 App 里在线调用 TTS。所有句子预先生成，随 GitHub Pages 一起发布。

- 句子清单：`data/audio-lines.json`，每条是 `{id, text, role}`。
- `role` 对应声音：
  - `dealer` → Ethan（`reference_id` `536d3a5e000945adb7038665781a4aca`）
  - `player` → Paula（`c2623f0c075b4492ac367989aee1576f`）
  - `narrator` → Narrator（`0327fdb5da9e4fd782899a8058c8ae2b`）
- 生成脚本：`scripts/gen_audio.py`。它只补缺失的 id，然后用 faster-whisper `base.en` 对齐单词，并重写 `audio/index.json`。
- App 只给写进 `audio/index.json` 的 `ids` 播 `audio/<id>.mp3`；写进 `timings` 的才会去读 `audio/<id>.json` 做点读高亮。缺文件时会暂时落到 iPhone / 浏览器的 en-US 声音。
- Fish key **只写路径，永远不要把 key 的值写进仓库、日志或聊天**。默认路径是 `/workspace/nova/podcast/.fish_key`。也可以设环境变量 `FISH_KEY_PATH` 指向同一个或另一份 key 文件。脚本会读这个文件，但不会打印它。
- API：`POST https://api.fish.audio/v1/tts`，模型 `s2.1-pro-free`，输出再压成单声道 24 kHz 64 kbps mp3，省空间。

```bash
# 在仓库根目录
python3 scripts/gen_audio.py
# 若 key 不在默认路径：
FISH_KEY_PATH=/path/to/.fish_key python3 scripts/gen_audio.py
```

## 发布步骤

GitHub Pages 从 **main 的仓库根目录** 打开。不要直接在 main 上改，走分支和 PR：

1. 从最新的 `main`（或当前开发分支）拉一条分支。
2. 提交改动：新视频、数据文件、音频、`sw.js` 的 `VERSION`。
3. 打开 Pull Request，检查预览或本地 `python3 -m http.server`（不要用 `file://`）。
4. 合并到 `main`。Pages 大约 1–2 分钟后更新。
5. 务必提高 `sw.js` 的 `VERSION`（例如 `bj-v3` → `bj-v4`）。手机端的 shell 缓存靠这个换掉。让 Nova 完全关掉再打开 App，或到设置里刷新，才能拿到新版本。

音频和视频都不要用 Git LFS：Pages 不会按普通文件去提供 LFS 指针。

## 空间预算

- GitHub Pages 整个站点大约 **1 GB**，单个文件不要靠近 100 MB。
- 视频按上面的规格压缩后，大约 8–9 MB/分钟。
- 计划：这个主仓库接近 **800 MB** 时，把多出来的视频拆到额外的 repo，再在 App 里按路径或绝对 URL 去播。拆之前先在 PR 里说清楚，不要等撑满了再拆。
- 音频是短句 mp3，体积远小于视频，但仍要算进 1 GB。不要把未压缩的 raw 文件或 TTS 缓存提交进来。

## 源材料 `source/`

- `source/BLUEPRINT.md`：14 个模块、按牌桌顺序排的课堂蓝图。
- `source/handouts/HANDOUTS.md` 和同目录的讲义图：**讲义是规则权威**。视频或口述和讲义不一致时，规则页、overview 和 checks 以讲义为准，并在笔记里标明。例如只赔 3:2；边注在保险之前结算；S17（桌布上写 stand on all 17s）来自训练桌，也要按讲义/桌布来源标好。
- `source/VIDEO_ORDER.md`、`source/manifest.json`：视频顺序和清单。
- `source/v01_notes.md`、`source/v02_notes.md`、`source/video-notes/`：各条视频的笔记和转写。

加新视频时，把笔记和转写一并放进 `source/`，不要只改 `videos.json`。

## 不要做的事

- **不要**把 Nova 的简历截图、真实姓名以外的个人资料、电话、地址或其他隐私放进 App 或仓库。这个 App 保持课堂内容，不要变成档案夹。
- **永远不要**把 Fish key 的值提交、打印、写进聊天或放进任何仓库文件。只使用 `/workspace/nova/podcast/.fish_key`（或 `FISH_KEY_PATH`）。提交前用 `git grep` / 检查 diff，确认 key 没有被带上。
- **不要**修改 `/workspace/nova/` 里的文件。
- **不要**在 App 运行时在线调用 Fish TTS。
- **不要**把未压缩的原始视频推进这个 repo。
- GitHub Pages 站点是公开的。知道链接的人就能打开视频和讲义。不要把这个仓库当成私密保险柜，也不要主动传播链接。
