#!/usr/bin/env bash
# Compress a dealer-class video for the Blackjack 学习app (GitHub Pages).
#
# Usage:
#   scripts/compress_video.sh INPUT OUTPUT.mp4
#   scripts/compress_video.sh INPUT OUTPUT.mp4 --split-minutes 6
#
# Targets:
#   - 720p or the source resolution if that is already smaller (never upscale)
#   - H.264, crf 28 (retries 29 then 30 if the file is still large)
#   - maxrate 1.2M, then 1.0M, then 0.9M on retries
#   - AAC 96k
#   - +faststart
#   - hard cap 90 MB; preferred size 50 MB
#   - long clips should be split (about 6 minutes is a safe default at these rates)
set -euo pipefail

usage() {
  echo "Usage: $0 INPUT OUTPUT.mp4 [--split-minutes N]" >&2
  exit 2
}

if [[ $# -lt 2 ]]; then
  usage
fi

INPUT=$1
OUTPUT=$2
shift 2
SPLIT_MIN=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --split-minutes)
      SPLIT_MIN=${2:?}
      shift 2
      ;;
    *)
      usage
      ;;
  esac
done

if [[ ! -f "$INPUT" ]]; then
  echo "input not found: $INPUT" >&2
  exit 1
fi

HARD_CAP=$((90 * 1024 * 1024))
PREF_CAP=$((50 * 1024 * 1024))

scale_filter="scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2"

encode_one() {
  local in=$1 out=$2 crf=$3 maxrate=$4
  local bufsize
  # bufsize ≈ 2x maxrate
  bufsize=$(awk -v m="$maxrate" 'BEGIN{printf "%.1fM", 2.0 * m}')
  ffmpeg -y -hide_banner -loglevel error -i "$in" \
    -vf "$scale_filter" \
    -c:v libx264 -preset medium -crf "$crf" -maxrate "${maxrate}M" -bufsize "$bufsize" \
    -c:a aac -b:a 96k \
    -movflags +faststart \
    "$out"
}

size_of() {
  wc -c < "$1" | tr -d ' '
}

try_ladder() {
  local in=$1 out=$2
  local crf maxrate size
  # Prefer 50 MB; keep at or under 90 MB.
  for pair in "28 1.2" "29 1.0" "30 0.9"; do
    set -- $pair
    crf=$1
    maxrate=$2
    echo "encoding $(basename "$out")  crf=$crf  maxrate=${maxrate}M"
    encode_one "$in" "$out" "$crf" "$maxrate"
    size=$(size_of "$out")
    echo "  size: $size bytes"
    if (( size <= PREF_CAP )); then
      echo "  within preferred 50 MB"
      return 0
    fi
    if (( size <= HARD_CAP )); then
      echo "  under 90 MB hard cap, but over the 50 MB preference. Consider --split-minutes 6."
      return 0
    fi
    echo "  over 90 MB, retrying with a tighter ladder"
  done
  echo "ERROR: still over 90 MB after crf 30 / 0.9M. Split the clip and retry." >&2
  return 1
}

if [[ "$SPLIT_MIN" != "0" ]]; then
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT")
  # ceil(duration / (SPLIT_MIN * 60))
  parts=$(python3 -c "import math,sys; d=float(sys.argv[1]); m=float(sys.argv[2]); print(max(1, math.ceil(d/(m*60.0))))" "$dur" "$SPLIT_MIN")
  echo "duration ${dur}s, splitting into ${parts} part(s) of up to ${SPLIT_MIN} minutes"
  stem=${OUTPUT%.mp4}
  dir=$(dirname "$OUTPUT")
  mkdir -p "$dir"
  i=0
  while [[ $i -lt $parts ]]; do
    start=$(python3 -c "print($i * $SPLIT_MIN * 60)")
    part=$(printf "%s-part%02d.mp4" "$stem" $((i + 1)))
    echo "part $((i + 1))/$parts  start=${start}s  -> $part"
    # Cut first, then compress, so each part gets its own keyframe at the start.
    tmp=$(mktemp -t bj-cut.XXXXXX.mp4)
    ffmpeg -y -hide_banner -loglevel error -ss "$start" -t "$(python3 -c "print($SPLIT_MIN * 60)")" -i "$INPUT" -c copy "$tmp" || {
      # copy may fail at odd timestamps; re-encode the cut
      ffmpeg -y -hide_banner -loglevel error -ss "$start" -t "$(python3 -c "print($SPLIT_MIN * 60)")" -i "$INPUT" -c:v libx264 -c:a aac "$tmp"
    }
    try_ladder "$tmp" "$part"
    rm -f "$tmp"
    i=$((i + 1))
  done
  echo "wrote $parts parts next to $OUTPUT (the output path is used as a stem)"
  exit 0
fi

mkdir -p "$(dirname "$OUTPUT")"
try_ladder "$INPUT" "$OUTPUT"
