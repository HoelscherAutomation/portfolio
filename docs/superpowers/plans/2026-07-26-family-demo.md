# Family Demo (Personalized Fantasy Video) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Exception:** Tasks 1 through 6 are creative production tasks that require Higgsfield/ElevenLabs access and Jordan's approval gates; run those inline in the main session, not in subagents. Tasks 7 and 8 are normal code tasks.

**Goal:** Produce an IP-safe personalized fantasy demo (six "parent photos" of an AI-generated boy plus a ~45-60s dragon adventure video starring him) and add a "For families" sub-block to the site's video section.

**Architecture:** Asset production happens in `business-ops/marketing/family-demo-video/` using Higgsfield MCP (image gen + Kling 3.0 video) with ElevenLabs as the VO/music fallback, gated by Jordan's approval at character lock and final cut. Web integration is additive markup inside the existing `VideoSection.astro`: a labeled sub-block with a photo strip and an independent `<video>` player, plus a small label on the existing bilingual block so the two offerings read separately.

**Tech Stack:** Higgsfield MCP (generate_image, generate_video/Kling 3.0, media tools), ElevenLabs REST API (key at `~/.elevenlabs_api_key`, script pattern in `business-ops/clients/imagination-library-video/scripts/generate_es_intro_outro.py`), ffmpeg, Astro 5 + Tailwind tokens, vitest, Playwright MCP, Lighthouse.

**Spec:** `docs/superpowers/specs/2026-07-26-family-demo-design.md`

## Global Constraints

- Copy rules: **no em dashes or en dashes** in any user-visible site copy; plain human tone, no AI-tell phrasing.
- The kid is **fully AI-generated**; no real child's likeness may be used as reference or input anywhere.
- **No third-party IP** in prompts, visuals, or audio: no franchise names, characters, locations, heraldry, or music cues. Original high-fantasy world only.
- Demo video: 16:9, 720p H.264 + AAC for web, `-movflags +faststart`, **≤7MB**.
- Video element: `preload="none"`, `poster`, `controls`, `playsinline`.
- Photo strip images: ≤80KB each as served; `loading="lazy"`; meaningful `alt` text (accessibility score must stay ≥0.99).
- Section keeps `data-scene="grid"`; do NOT add particle formations.
- Follow existing component patterns: `SectionLabel`, `reveal`, Tailwind token classes (`text-text-primary`, `brand-orange-bright`, `border-border-subtle`, `duration-default`).
- Repo root: `/home/t1/hoelscher-automation/portfolio`. Production working dir: `/home/t1/hoelscher-automation/business-ops/marketing/family-demo-video/`.
- Approval gates: Jordan approves the character (Task 1), the photo set (Task 2), and the final cut (Task 6) before dependent work proceeds.
- Kling 3.0 generations cost Higgsfield credits: check `balance` before Task 4 and surface the projected spend to Jordan if credits look tight.

---

### Task 1: Character lock

**Files:**
- Create: `business-ops/marketing/family-demo-video/character/candidate-{a,b,c}.png`
- Create: `business-ops/marketing/family-demo-video/character/APPROVED.md` (records which candidate won and its media id)

**Interfaces:**
- Consumes: Higgsfield MCP `models_explore(action:'recommend')`, `generate_image`, `job_status`, media download.
- Produces: one approved character image (file + Higgsfield media id recorded in `APPROVED.md`) used as the identity reference by Tasks 2 and 3.

- [ ] **Step 1: Create the working tree**

```bash
mkdir -p /home/t1/hoelscher-automation/business-ops/marketing/family-demo-video/{character,photos,keyframes,clips,audio,final}
```

- [ ] **Step 2: Pick the image model**

Call `models_explore(action:'recommend')` with the goal "photorealistic consistent child character across many images, will later drive image-to-video". Use the recommended model for all Task 1-3 image generations.

- [ ] **Step 3: Generate three character candidates**

Three `generate_image` calls, one per candidate. Base prompt, varying only the look block:

> Photorealistic candid smartphone photo of an 8 year old boy, {LOOK}, wearing a plain green t shirt, standing in a suburban backyard, soft evening light, shot on a phone camera, ordinary family photo, natural skin texture, no filters

- LOOK A: "messy light brown hair, freckles across his nose, warm brown eyes"
- LOOK B: "short curly dark hair, bright smile, dark brown eyes"
- LOOK C: "straight blond hair, blue eyes, a small gap in his front teeth"

Download each result to `character/candidate-{a,b,c}.png`.

- [ ] **Step 4: STOP — Jordan approval gate**

Send the three candidates to Jordan (SendUserFile) and ask which boy is the demo kid. Do not proceed to Task 2 until he picks. Record the winner and its Higgsfield media id in `character/APPROVED.md`.

---

### Task 2: Reference photo set (the "before" photos)

**Files:**
- Create: `business-ops/marketing/family-demo-video/photos/photo-{1..6}.png` (masters)
- Create: `portfolio/public/videos/family-photo-{1..6}.jpg` (web thumbs)

**Interfaces:**
- Consumes: approved character image/media id from Task 1 as identity reference in every generation.
- Produces: six master photos; six web thumbs at the exact paths Task 7's component references (`/videos/family-photo-1.jpg` ... `-6.jpg`), each with the alt text listed below.

- [ ] **Step 1: Generate the six photos**

Six `generate_image` calls, each using the approved character image as the reference/identity input (per the chosen model's reference mechanism). The variety IS the submission spec, so keep these prompts distinct:

1. "Close up candid phone photo of the same boy smiling, indoors by a window, soft daylight on his face, plain wall behind"
2. "Waist up phone photo of the same boy making a goofy grin in a kitchen, warm indoor lighting, slightly cluttered counter behind him"
3. "Full body phone photo of the same boy in a backyard holding a soccer ball, bright overcast daylight, sneakers and shorts"
4. "Candid side profile phone photo of the same boy reading a book on a couch, dim warm lamp light, cozy living room, evening"
5. "Phone photo of the same boy from a few steps away at a park in a light jacket, cloudy day, path and trees behind him"
6. "Slightly imperfect candid phone photo of the same boy mid run playing outside, natural motion, suburban street, afternoon sun"

Each prompt ends with: "ordinary family snapshot, realistic, no filters". Download to `photos/photo-N.png`.

- [ ] **Step 2: Consistency check and Jordan approval gate**

Eyeball all six against the approved character (Read tool renders images): same face, hair, eye color throughout. Regenerate any drifter. Then send the set to Jordan for a quick yes before scene work starts.

- [ ] **Step 3: Produce web thumbs**

```bash
cd /home/t1/hoelscher-automation/business-ops/marketing/family-demo-video/photos
for i in 1 2 3 4 5 6; do
  ffmpeg -y -i photo-$i.png -vf "scale=480:-2" -q:v 6 \
    /home/t1/hoelscher-automation/portfolio/public/videos/family-photo-$i.jpg
done
du -h /home/t1/hoelscher-automation/portfolio/public/videos/family-photo-*.jpg
```

Expected: each jpg ≤80KB. If any exceeds, re-run that file with `-q:v 8`.

Alt text (used verbatim in Task 7):
1. "Example photo: close up of a boy indoors by a window"
2. "Example photo: boy grinning in a kitchen"
3. "Example photo: full length shot of a boy in a backyard with a soccer ball"
4. "Example photo: boy reading on a couch in lamp light"
5. "Example photo: boy at a park on a cloudy day"
6. "Example photo: boy running outside, slightly blurry"

- [ ] **Step 4: Commit the web thumbs**

```bash
cd /home/t1/hoelscher-automation/portfolio
git add public/videos/family-photo-*.jpg
git commit -m "feat: add family demo example photo strip assets

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Scene keyframes

**Files:**
- Create: `business-ops/marketing/family-demo-video/keyframes/scene-{1..6}.png`

**Interfaces:**
- Consumes: approved character reference from Task 1.
- Produces: six 16:9 cinematic stills, one per scene, used as the image input for Kling image-to-video in Task 4.

- [ ] **Step 1: Generate the six keyframes**

Six `generate_image` calls at 16:9, each with the character reference. The boy wears the same simple outfit in all scenes (jeans, green t shirt, small brown cloak) so scene-to-scene identity holds. Prompts:

1. "Cinematic wide shot, an 8 year old boy kneeling in tall backyard grass at dusk, reaching toward a large glowing turquoise dragon egg, warm rim light, fireflies, photoreal high fantasy"
2. "Cinematic close up, the same boy cupping a hatching turquoise dragon egg in his hands, cracks of light, a tiny teal dragon snout emerging, awe on his face, warm light"
3. "Cinematic shot in a medieval castle courtyard at midday, the same boy laughing as a small teal dragon chases him past stone arches, plain colored banners, photoreal high fantasy"
4. "Cinematic golden hour shot on a castle wall, the same boy seated on the back of a young teal dragon with wings spread wide, wind in his hair, about to leap into the sky"
5. "Sweeping aerial shot, the same boy riding the teal dragon past white stone castle spires and through sunlit clouds, epic scale, photoreal high fantasy"
6. "Cinematic sunset shot on a cliff edge, the teal dragon landing, the same boy sliding off and grinning straight at the camera, warm orange light, castle far in the background"

Download to `keyframes/scene-N.png`. Eyeball all six for character and dragon consistency (same teal dragon design throughout); regenerate drifters before moving on.

---

### Task 4: Scene videos (Kling 3.0)

**Files:**
- Create: `business-ops/marketing/family-demo-video/clips/scene-{1..6}.mp4`

**Interfaces:**
- Consumes: keyframes from Task 3; Higgsfield `generate_video` with a Kling 3.0 model (confirm exact model id via `models_explore`), native audio enabled.
- Produces: six clips of roughly 8-10s each, 16:9, with Kling's ambient audio; Task 5 decides which native audio survives.

- [ ] **Step 1: Check credits**

Call `balance`. A rough budget is 6 scenes plus 2-3 retries at Kling 3.0 rates; if the projected spend exceeds available credits, stop and tell Jordan before generating anything.

- [ ] **Step 2: Generate the six clips**

One `generate_video` call per scene, image-to-video from `keyframes/scene-N.png`, ~8-10s, audio on. Motion prompts:

1. "The boy leans in slowly and touches the glowing egg, it pulses brighter, fireflies drift, soft evening ambience"
2. "The egg cracks open in his hands, a tiny dragon pushes out and chirps, the boy gasps and laughs. The boy says: Whoa... hey little guy."
3. "The small dragon chases the boy in a playful circle, he dodges behind a stone arch laughing, banners sway, courtyard ambience"
4. "The dragon crouches then leaps off the wall, wings snap open, camera follows the takeoff, wind roars. The boy shouts: Hold on tight!"
5. "Fast graceful flight past spires and through cloud wisps, camera swoops alongside, wind and distant wingbeats"
6. "The dragon lands on the cliff, the boy slides down, pats its neck and grins at the camera, gentle sunset wind"

Kling 3.0 sometimes produces usable spoken lines (scenes 2 and 4 request them); treat whatever it returns as a bonus, not a requirement.

- [ ] **Step 3: Review each clip**

Download all six to `clips/`. Check per clip: character still recognizable, dragon design consistent, no text artifacts, no accidental franchise resemblance, audio usable or at least strippable. Regenerate failures (this is where the retry budget goes). Note per clip whether its native line/ambience is a keeper; Task 5 consumes those notes.

---

### Task 5: Voiceover and music

**Files:**
- Create: `business-ops/marketing/family-demo-video/audio/vo-open.mp3`
- Create: `business-ops/marketing/family-demo-video/audio/vo-close.mp3`
- Create: `business-ops/marketing/family-demo-video/audio/{vo-line-2.mp3, vo-line-4.mp3}` (only if Kling's lines failed)
- Create: `business-ops/marketing/family-demo-video/audio/music.mp3`

**Interfaces:**
- Consumes: per-clip audio notes from Task 4; ElevenLabs REST API (key at `~/.elevenlabs_api_key`; follow the request pattern in `business-ops/clients/imagination-library-video/scripts/generate_es_intro_outro.py`).
- Produces: VO stems and a music bed at the paths above; Task 6 mixes them at fixed timeline positions.

- [ ] **Step 1: Generate narrator VO (ElevenLabs)**

Two lines, warm adult storyteller voice (pick from `list_voices` on the account; prefer an existing narrator voice already used in past builds):

- `vo-open.mp3`: "It started like any other Saturday."
- `vo-close.mp3`: "Every adventure starts with a photo."

- [ ] **Step 2: Cover missing kid lines**

If Task 4's notes say Kling's spoken lines in scenes 2 or 4 are unusable, generate them with an ElevenLabs child-appropriate voice: line 2 "Whoa... hey little guy.", line 4 "Hold on tight!". Otherwise skip this step.

- [ ] **Step 3: Music bed**

Generate ~60s of original instrumental adventure score (warm, orchestral, builds to a soaring middle, gentle resolve) with ElevenLabs music. If the result is weak after two attempts, fall back to Higgsfield `generate_audio` with the same brief. Save as `audio/music.mp3`. Original score only; no melodic references to any franchise theme.

---

### Task 6: Assembly, master, and web encode

**Files:**
- Create: `business-ops/marketing/family-demo-video/final/family-demo-master.mp4` (1080p master)
- Create: `portfolio/public/videos/demo-family.mp4` (web, ≤7MB)
- Create: `portfolio/public/videos/poster-family.jpg`

**Interfaces:**
- Consumes: `clips/scene-{1..6}.mp4`, `audio/*` from Task 5.
- Produces: `/videos/demo-family.mp4` and `/videos/poster-family.jpg`, referenced verbatim by Task 7.

- [ ] **Step 1: Normalize and concat clips**

```bash
cd /home/t1/hoelscher-automation/business-ops/marketing/family-demo-video
for i in 1 2 3 4 5 6; do
  ffmpeg -y -i clips/scene-$i.mp4 -r 24 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -ar 48000 final/norm-$i.mp4
done
printf "file 'norm-%d.mp4'\n" 1 2 3 4 5 6 > final/concat.txt
ffmpeg -y -f concat -safe 0 -i final/concat.txt -c copy final/picture.mp4
ffprobe -v error -show_entries format=duration -of csv final/picture.mp4
```

Expected: total duration in the 45-60s range. If over 60s, trim the weakest clip's tail with `-t` during its normalize pass.

- [ ] **Step 2: Mix audio and master**

Compute VO offsets from the actual clip durations (open over scene 1 start; close over the final ~4s). Example with placeholder offsets replaced by measured values:

```bash
ffmpeg -y -i final/picture.mp4 -i audio/music.mp3 -i audio/vo-open.mp3 -i audio/vo-close.mp3 \
  -filter_complex "[1:a]volume=0.35,apad[a_mus];[0:a]volume=0.9[a_amb];\
[2:a]adelay=1500|1500[a_open];[3:a]adelay=OFFSET_CLOSE|OFFSET_CLOSE[a_close];\
[a_amb][a_mus][a_open][a_close]amix=inputs=4:duration=first:normalize=0[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k final/family-demo-master.mp4
```

(`OFFSET_CLOSE` in ms = total duration minus ~4500.) Listen to the whole master (send to Jordan or play a waveform check): music under ambience, VO clearly on top, no clipping. Adjust the three `volume=` levels as needed; this mix step is expected to take a couple of iterations.

- [ ] **Step 3: STOP — Jordan final cut approval**

Send `family-demo-master.mp4` to Jordan (SendUserFile). Do not encode or publish until he approves the cut.

- [ ] **Step 4: Web encode and poster**

```bash
cd /home/t1/hoelscher-automation/business-ops/marketing/family-demo-video
ffmpeg -y -i final/family-demo-master.mp4 -vf "scale=1280:720" \
  -c:v libx264 -crf 26 -preset medium -c:a aac -b:a 96k \
  -movflags +faststart /home/t1/hoelscher-automation/portfolio/public/videos/demo-family.mp4
du -h /home/t1/hoelscher-automation/portfolio/public/videos/demo-family.mp4
```

Expected: ≤7MB (a 60s video at these settings lands well under; if over, re-run with `-crf 28`). This is a short single-pass encode, fine on the Pi; no gaming-PC offload needed.

Poster from the takeoff or landing beat (pick a frame where boy and dragon are both clear):

```bash
ffmpeg -y -ss 38 -i /home/t1/hoelscher-automation/portfolio/public/videos/demo-family.mp4 \
  -frames:v 1 -q:v 3 /home/t1/hoelscher-automation/portfolio/public/videos/poster-family.jpg
```

Eyeball the JPEG; try other timestamps until the frame is a clear hero shot, and keep it <200KB.

- [ ] **Step 5: Commit web assets**

```bash
cd /home/t1/hoelscher-automation/portfolio
git add public/videos/demo-family.mp4 public/videos/poster-family.jpg
git commit -m "feat: add family demo video and poster

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: "For families" sub-block in VideoSection

**Files:**
- Modify: `src/components/VideoSection.astro`

**Interfaces:**
- Consumes: `/videos/demo-family.mp4`, `/videos/poster-family.jpg`, `/videos/family-photo-{1..6}.jpg` (Tasks 2 and 6); `SectionLabel.astro`; global `.reveal`.
- Produces: `<video id="family-player">` and `.family-photo` imgs inside `section#video`; Task 8's verification targets these verbatim. Existing `#demo-player` and `.demo-lang` behavior unchanged.

- [ ] **Step 1: Label the existing bilingual block**

In `src/components/VideoSection.astro`, inside `<div class="reveal mt-12 max-w-3xl">` (currently starting at line 34), insert before the tab `role="group"` div:

```astro
      <SectionLabel>For organizations</SectionLabel>
      <p class="mt-3 mb-4 text-sm text-text-secondary">
        Bilingual story videos for libraries, schools, and nonprofits.
      </p>
```

Leave the tab row itself untouched: it stays `<div class="flex gap-2 mb-4" role="group" aria-label="Demo language">` exactly as it is.

- [ ] **Step 2: Add the family sub-block**

Insert between the bilingual block's closing `</div>` (after the Aesop caption `<p>`) and the `<div class="reveal mt-20">` "Where it fits" block. In the component frontmatter, add below the `useCases` array:

```astro
const familyPhotos = [
  { src: '/videos/family-photo-1.jpg', alt: 'Example photo: close up of a boy indoors by a window' },
  { src: '/videos/family-photo-2.jpg', alt: 'Example photo: boy grinning in a kitchen' },
  { src: '/videos/family-photo-3.jpg', alt: 'Example photo: full length shot of a boy in a backyard with a soccer ball' },
  { src: '/videos/family-photo-4.jpg', alt: 'Example photo: boy reading on a couch in lamp light' },
  { src: '/videos/family-photo-5.jpg', alt: 'Example photo: boy at a park on a cloudy day' },
  { src: '/videos/family-photo-6.jpg', alt: 'Example photo: boy running outside, slightly blurry' },
];
```

Markup:

```astro
    <div class="reveal mt-20 max-w-3xl">
      <SectionLabel>For families</SectionLabel>
      <h3 class="mt-4 font-display text-2xl md:text-3xl font-semibold text-text-primary">
        Six phone photos in. One adventure out.
      </h3>
      <p class="mt-4 text-text-secondary leading-relaxed">
        Send us a handful of everyday photos and we make a short film where your kid is the hero. Photos like these are all it takes: different angles, different light, nothing fancy.
      </p>

      <div class="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {familyPhotos.map((p) => (
          <img
            src={p.src}
            alt={p.alt}
            loading="lazy"
            width="480"
            height="640"
            class="rounded border border-border-subtle aspect-[3/4] object-cover w-full"
          />
        ))}
      </div>
      <p class="mt-2 text-xs text-text-muted">
        The boy in this demo is AI generated, so no real child appears here. Your family's photos are used only for your video.
      </p>

      <video
        id="family-player"
        class="mt-6 w-full rounded-lg border border-border-subtle"
        controls
        playsinline
        preload="none"
        poster="/videos/poster-family.jpg"
        src="/videos/demo-family.mp4"
        aria-label="Demo video: a boy's dragon adventure, generated from the six example photos above"
      ></video>
      <p class="mt-3 text-sm text-text-muted">
        Every scene came from the six photos above. Original story, original world, produced end to end with our pipeline.
      </p>
    </div>
```

Notes for the implementer:
- This copy is final approved copy. Do not "improve" it. It intentionally contains no em or en dashes.
- No script changes: the family player has native controls only and must NOT be wired into the `.demo-lang` tab logic.
- The photos use explicit `width`/`height` to avoid layout shift.

- [ ] **Step 3: Build and verify output**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm run build
grep -c 'id="family-player"' dist/index.html
grep -c 'family-photo-6.jpg' dist/index.html
grep -c 'For organizations' dist/index.html
grep -c 'preload="none"' dist/index.html
grep -c $'—' dist/index.html; grep -c $'–' dist/index.html
```

Expected: first four greps ≥1 (`preload="none"` now appears 2x); the em/en dash greps print `0` (grep exits 1, that is fine).

- [ ] **Step 4: Run unit tests**

```bash
npm test
```

Expected: all existing vitest tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoSection.astro
git commit -m "feat: add For families personalized demo sub-block to video section

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Browser and Lighthouse verification, ship

**Files:**
- None modified (verification only; Lighthouse artifact to `docs/superpowers/plans/artifacts/lighthouse-family-desktop.json`)

**Interfaces:**
- Consumes: `#family-player`, `.demo-lang`, `#demo-player` from Task 7's build.
- Produces: verified build; push to `main` after Jordan's go.

- [ ] **Step 1: Serve the built site**

```bash
cd /home/t1/hoelscher-automation/portfolio
npm run build
npx astro preview --port 4321 &
```

- [ ] **Step 2: Playwright checks**

Against http://localhost:4321:

1. Navigate to `/#video`; snapshot shows both sub-blocks: "For organizations" above the tabbed player, "For families" with the six-photo strip and its own player.
2. Evaluate `document.getElementById('family-player').getAttribute('preload')` → `"none"`; `src` ends with `demo-family.mp4`.
3. Click the Oʻzbekcha tab; confirm `#demo-player` src swaps to `demo-uz.mp4` and `#family-player` src is unchanged (regression check on the tab logic).
4. Click play on `#family-player`; `paused` → `false`; pause it.
5. Confirm all six `img[src*="family-photo"]` elements are present with non-empty `alt`.

- [ ] **Step 3: Lighthouse gates**

```bash
npx lighthouse http://localhost:4321 --preset=desktop \
  --output=json --output-path=docs/superpowers/plans/artifacts/lighthouse-family-desktop.json \
  --chrome-flags="--headless" --quiet
node -e "const r=require('./docs/superpowers/plans/artifacts/lighthouse-family-desktop.json'); console.log(Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score])))"
```

Expected: performance ~1.00, accessibility ≥0.99, SEO 1.0 (matching the video-section launch baseline). The family video must contribute nothing to network traces beyond its poster; the photo strip is lazy and below the fold. If accessibility drops, check the img alt texts and heading order (`h3` under the section `h2` is correct).

- [ ] **Step 4: Kill preview, commit artifacts**

```bash
kill %1
git add docs/superpowers/plans/artifacts/lighthouse-family-desktop.json
git commit -m "test: verify Lighthouse gates hold with family demo block

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Ship**

Confirm with Jordan before pushing (push to `main` triggers the GitHub Pages deploy):

```bash
git push origin main
```

Then spot-check https://hoelscherautomation.com/#video once the deploy workflow finishes.
