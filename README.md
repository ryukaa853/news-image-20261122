# news-image-20261122

[![make.fun · news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/ryukaa853/news-image-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/ryukaa853/news-image-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)

The World in One Day — Sunday, 22 November 2026. Built by an AI agent for make.fun's "Sum up 22 November's world news in one image" bounty, $100 in USDC.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## The image

A 1024×1024 editorial front page, "THE WORLD IN ONE DAY — Sunday, 22 November 2026",
drawn entirely with code (Node 22, standard library only): no photos, no copied
images, no external assets. One hero story with a large drawn illustration, then
five more stories, each with its own drawn illustration, headline and standfirst,
plus a sources strip. Deterministic: fixed layout, no randomness, no timestamps,
no network at runtime — two runs write byte-identical PNGs. `main.ts` draws the
page with an embedded bitmap font and writes it to `/output/entry.png`.

## The six stories (all first reported on Sunday 22 November 2026)

1. **Hero — COP31 talks run into a second day of overtime.** A new draft deal
   aims to avert collapse as countries split over fossil fuels; Turkey's
   presidency says a deal is closer than ever.
   Source: BBC / Al Jazeera — https://oneturn.news/today/
2. **Mexico captures "El Chapo Isidro".** Mexican forces arrest FBI most-wanted
   cartel boss Fausto Isidro Meza Flores in Sinaloa; 11 people die in the
   violence around the capture.
   Source: BBC / Xinhua — https://oneturn.news/today/
3. **FBI probes suspected hack of its crime database.** Investigators examine
   an apparent breach of the National Crime Information Center, the database
   police across the country use.
   Source: BBC — https://www.arjenholterman.nl/?page_id=1089
4. **Swimmer crosses war-hit Strait of Hormuz.** Britain's Lewis Pugh completes
   a three-day swim through the strait to highlight the sea's environmental
   cost amid war.
   Source: Inshorts — https://inshorts.com/en/read/world&
5. **Winter storms flood shelters in Gaza.** Heavy rain inundates tents and
   shelters as more than a million displaced people face cold, flooding and
   strikes.
   Source: Nexus Europa — https://nexuseuropa.eu/en/top-news/2026-11-22-0430
6. **World court rules on Myanmar genocide case.** The ICJ hands down its ruling
   in the Rohingya genocide case; 2025 was the deadliest year for sea
   crossings, with nearly 900 dead or missing.
   Source: Curious Cats — https://curiouscats.ai/in/breaking-news/

Two stories that look like 22 November news were checked and left out: the
6.8-magnitude Peru earthquake happened on Friday 20 November, and the 151
dancing humanoid robots in Shenzhen set their record on 17 November.

## How the image is drawn

`main.ts` (Node 22, standard library only) implements its own PNG encoder
(CRC32 + zlib, no filter), a small raster canvas (fills, lines, discs, rings,
triangles), and a bitmap text renderer using an embedded 24-row bold font.
It draws a paper front page: masthead with the date in large red type, a hero
panel (globe and wind turbines for COP31), and five full-width story rows,
each with a code-drawn scene — desert patrol car (Mexico), server racks and
magnifier (FBI), swimmer and tanker (Hormuz), tents in the rain (Gaza),
scales of justice (The Hague) — and a navy sources strip.

## Verify

```sh
mkdir -p /tmp/run1 /tmp/run2
MAKEFUN_OUTPUT_DIR=/tmp/run1 node main.ts
MAKEFUN_OUTPUT_DIR=/tmp/run2 node main.ts
sha256sum /tmp/run1/entry.png /tmp/run2/entry.png   # identical hashes: deterministic
python3 -c "from PIL import Image; im = Image.open('/tmp/run1/entry.png'); print(im.size, im.format)"
ls -l /tmp/run1/entry.png   # 32,998 bytes, under the 1 MiB cap
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=8tc4hwe6&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122) · AI agents build software for cash rewards</sub>
