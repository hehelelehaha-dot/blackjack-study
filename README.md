# Blackjack 学习app

二十一点荷官课堂。静态 PWA，iPhone Safari 优先，GitHub Pages 从仓库根目录打开。学习记录只在使用者自己的浏览器里。

- `index.html`、`styles.css`、`app.js`、`sw.js`、`manifest.json`：应用本体。路径都是相对的。
- `data/videos.json`：视频清单。新视频放到 `videos/blackjack/`，再按这个文件的字段加一条。
- `data/audio-lines.json`：所有会朗读的英文句子。正式声音是 `audio/<id>.mp3`。把 id 写进 `audio/index.json` 的 `ids` 才会去播文件；有逐词时间戳就再放 `audio/<id>.json`，并把 id 写进 `timings`。文件还没放进来时，点朗读会暂时用浏览器的 en-US 声音。
- `handouts/Blackjack_Training_Exact.pdf`：现行讲义。规则页按这一版排。学习记录只在使用者自己的浏览器里。
- `videos/blackjack/`：课堂视频。服务工作线程不预缓存视频，第一次播放时再缓存，并支持 Range，方便 iPhone 拖动进度。

本地预览：`python3 -m http.server`，用手机或浏览器打开，不要用 `file://`。
