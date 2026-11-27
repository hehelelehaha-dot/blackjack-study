# SOURCE_MAP — Dealer Academy blackjack videos

As of 2026-11-26 18:56 America/New_York.

Primary source is Nova's Google Drive folder (`user-Google-drive`), searched with `mimeType contains 'video/' and trashed = false and modifiedTime > '2026-11-26T22:00:00'`. Final re-list after she said the upload was finished (18:38 ET) still showed **22 files**, same IDs and sizes since `2026-11-26T23:29:51Z` (18:29:51 America/New_York). No `616.mp4`. No next page.

The original plan to number 20 new attachment `.mov` files as v03–v22 was abandoned: that batch never materialized on the box. The only new attachment that landed, `49049bb6…mov`, is a remux of Drive `640.mp4` and is now v16.

## Numbering rule

Unique *content* (not unique filename or container hash) is numbered **v03, v04, … in ascending Drive filename number** (iPhone recording order: 611 before 612). `609` and `610` are remuxes of the already-numbered `v01.mov` and `v02.mov`, so they are not given new vNN ids. `640` is unique vs v01/v02, so it is v16.

Local Drive copies live at `raw/drive/{stem}__{fileId}.mp4` so same-named uploads stay distinct. Keepers are symlinked to `raw/vNN.mp4` (v01/v02 remain `raw/v01.mov` / `raw/v02.mov`).

**Never drop on name or size alone.** A file is dropped only when content is confirmed the same by (1) file sha256, and/or (2) duration + 16 kHz mono PCM audio sha256 + 4 raw-frame shas at 10/35/65/90% duration. Remuxes (MOV vs MP4) can have different file hashes but identical audio, frames, and duration. No files were deleted.

## Keepers (19 unique videos)

| vNN | Drive / source | fileId | duration | module | path |
|---|---|---|---|---|---|
| v01 | attachment `486d60ca…mov` (Drive 609 remux dropped) | — | 1:26.5 | shuffle | `raw/v01.mov` |
| v02 | attachment `6653dd14…mov` (Drive 610 remux dropped) | — | 3:58.9 | shuffle | `raw/v02.mov` |
| v03 | 611.mp4 | `1ZYAzOBWSC722ioRm4AyY3qJLOKSPF2Ua` | 4:31.4 | payouts (close / inventory) | `raw/v03.mp4` |
| v04 | 612.mp4 | `1Ggp2JW2Gjy4ZfP5TOg58pmvx-lJRN1xk` | 6:42.4 | payouts (close / inventory) | `raw/v04.mp4` |
| v05 | 613.mp4 | `1YpZ6W4kFwZlittNzgompWUegIviKzzQ1` | 2:59.3 | payouts (close / inventory) | `raw/v05.mp4` |
| v06 | 614.mp4 | `1c3n2FiS-8yQ4jqV3B7hWxgq6Qh_9I9si` | 4:27.4 | payouts (close / inventory) | `raw/v06.mp4` |
| v07 | 615.mp4 | `1J4QmCrrlGLrRfa6DGa4D-ichGKBxLXgJ` | 1:11.9 | payouts (close / inventory) | `raw/v07.mp4` |
| v08 | 617.mp4 | `1M609Qcd7QhK9w8xEpnqSKeUrkTP4XNt4` | 1:52.2 | payouts (close / inventory) | `raw/v08.mp4` |
| v09 | 618.mp4 | `1NJcveZABarsI9w1wsZvmXoWxqezbX3FF` | 5:32.7 | payouts (close / inventory) | `raw/v09.mp4` |
| v10 | 619.mp4 | `1mTiywNcqZhepSLLSTTSdsyFKYBezYTkf` | 4:27.7 | payouts (close / inventory) | `raw/v10.mp4` |
| v11 | 620.mp4 | `1MmwwcKscZla0fGk-MwGny0RnP6ntLZaf` | 8:01.5 | payouts (open / inventory) | `raw/v11.mp4` |
| v12 | 631.mp4 | `1tYXEaLQUZn2DWEw66qMFeJX6V7LGbtwX` | 9:06.4 | signals | `raw/v12.mp4` |
| v13 | 632.mp4 | `1r9Qf79v9TI3J6tk7Dn47V9SJofWhniPQ` | 4:16.9 | signals | `raw/v13.mp4` |
| v14 | 633.mp4 | `14pB7biTG5u794TT18aaVAedSDtz4bXtb` | 6:28.6 | signals | `raw/v14.mp4` |
| v15 | 634.mp4 | `1uawjOP7DBAzVX2OsBX9qFZCNsoGZJ5NA` | 6:33.0 | signals | `raw/v15.mp4` |
| v16 | 640.mp4 (remux of `resends/49049bb6.mov`) | `1X7en1vLuSzTUXxDVKKMcMY0cJj-zkKrd` | 10:26.9 | payouts | `raw/v16.mp4` |
| v17 | 641.mp4 | `1df1iq4VnYLli48M86d-apy6fPFIrGSer` | 2:54.1 | payouts | `raw/v17.mp4` |
| v18 | 642.mp4 | `1nwsgPkiiHU1OO-xt8NoDcycC58Wt1GeM` | 5:56.0 | payouts | `raw/v18.mp4` |
| v19 | 643.mp4 | `1goFV7wXp5ARzzPDzzqFiqiGk1_qOlVam` | 2:48.2 | payouts | `raw/v19.mp4` |

Notes: `raw/vNN_notes.md`. Official Whisper transcripts (faster-whisper `medium`, no VAD): `raw/vNN.transcript.en.txt` for v03–v19. v01/v02 still use earlier notes; no official Whisper pass this round.

Opening/closing a table is parked under `payouts` per BLUEPRINT (not a separate main module). v16 also covers a short deal / signals stretch (scan layout, “no more bets,” split/double prove).

## Confirmed duplicates (status drop; files retained)

### Two Drive `609.mp4` files, both remuxes of v01

- `1NprdWAQ-TeJbtCHriUZCPAf6pY2tMLd6` and `1cy9jzDtMAs3h7R5A28zMMMmCfC_5Vy1i`
- Identical to each other: file sha256 `62b71185042940c59b5f87b64cb3e3024dd739a4ce096e7b665c6039b30e2264`, duration 86.500s, same audio sha256, 4/4 raw frames identical.
- Vs `v01.mov` (file sha256 `54b7ba5f05ccf713b09dd4ec9d096bed6950e05a4abc1449365964c86e19e8e3`, 32,930,070 bytes vs 32,970,448): different container hash (MP4 vs MOV remux) but same duration, same audio sha256 `31270306405f311b83ae9ab89f08cc20d452aaafab8f471993ee37265e22c846`, 4/4 raw frames identical.
- Decision: drop both 609s from v03+; keep v01.

### Drive `610.mp4` is a remux of v02

- `1jGiLOD3fq9s9qMQgpypKRLr-Way56Dxl`, file sha256 `6f8a84fd066d97404ffeb072ca8f0ec539a75017549ce51462874044b0a0fdd6`, 54,446,743 bytes.
- Vs `v02.mov` (file sha256 `d7225423c6faceb6d687060fdf2207a2511f90deb8f9bb780d46736b61b539cb`, 54,334,909 bytes): different container hash but duration 238.916s, audio sha256 `afd6ad64b158fed43c2a1a099fdab496d041f3944c7e27a5406c2c4afa1392f4`, 4/4 raw frames identical.
- Decision: drop 610 from v03+; keep v02.

### Two Drive `611.mp4` files (exact copies)

- Canonical keeper `1ZYAzOBWSC722ioRm4AyY3qJLOKSPF2Ua` = v03.
- Dropped copy `1k5tX7gCsk1jiFGnukhfrDr_A3JMOdw9l`.
- Identical file sha256 `bd71bfb1daedb3adaaa2c9411b8bcf594992ebaeab6c22dd93fba54e6552ec9f`, duration 271.353s, same audio sha256 `bb60c16565524f6b5a21388063dab2da1fdab8f124d888c8f2361c5044f706fc`, 4/4 raw frames identical.

### Two Drive `612.mp4` files (exact copies)

- Canonical keeper `1Ggp2JW2Gjy4ZfP5TOg58pmvx-lJRN1xk` = v04.
- Dropped copy `1xrnhXT12uPJkE08lebHt5DN64nfVSLzq`.
- Identical file sha256 `86128123108d2976dd79b7eb127b58a14c55c3bb039fc72ffeaca492a038da4f`, duration 402.406s, same audio sha256 `97d24da9c77cc7edf791f8aeabb6c6485bec2b78b1d28bae30471d2367125c59`, 4/4 raw frames identical.

### Drive `640.mp4` is a remux of attachment `49049bb6.mov`

- Drive `1X7en1vLuSzTUXxDVKKMcMY0cJj-zkKrd`, file sha256 `a3e4aeb10161d3c37fe942335b68a6a0f283403d13b373c91abb0c4b72b9d718`, 94,842,871 bytes.
- Attachment `raw/resends/49049bb6.mov`, file sha256 `49049bb6c8b3304e39b9b57cde5e4c97d19e30bd72fedef732109979901aeb54`, 94,548,713 bytes.
- Different container hash but duration 626.897s, audio sha256 `2868018617a103240d729796b7610a9006f8b1f6b260fd96c06ac096e16fb9c6`, 4/4 raw frames identical.
- Decision: number the content as **v16**; reuse the existing no-VAD transcript. Status-drop the MOV *as a duplicate container*, not the lesson. File retained.

## Near-duplicates / lesson families (keep all)

These are consecutive segments of the same class, not copies. High topical overlap, different content.

- **Close inventory chain:** v03 → v04 → v05 → v06 → v07 → v08 → v09 → v10.
- **Open inventory:** v11. Same example rack totals as the close chain, but the opening procedure (lid off, full stacks first, prove-by-touch / swap, read totals without touching). Keep.
- **Splits family:** v12 (intro / procedure), v13 (four-hand cap, no touching after no more bets, V vs one finger), v14 (aces only). Keep all three.
- **Doubles:** v15 is the dedicated lesson; a shorter double/prove beat also appears in v16. Keep both.
- **Payouts at the table:** v16 (scan, prove, color-for-color, no partials), v17 (size-in vs total look back), v18 (live 3:2), v19 (3:2 by breaking into known amounts). Keep all four.

## Drive inventory (all 22 files, none deleted)

See `raw/drive/_probe.json` for full sha256 / audio sha / duration / resolution. Snapshots: `raw/drive/_inventory_snapshots.jsonl`. vNN map: `raw/drive/_vnn_map.json`.

## Not on Drive / not on disk

- `616.mp4` never appeared in any listing.
- The advertised 20-file attachment batch, and 8 of the 9 later-send prefixes, never landed on the box. Superseded by this Drive set.
