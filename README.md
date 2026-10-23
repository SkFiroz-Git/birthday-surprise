# 🎂 Birthday Surprise

A one-page interactive birthday website: 8 little screens with balloons to pop, candles to blow out, flowers to tap, a self-typing letter and a final card.

No frameworks, no build step, no server needed.

## ▶ Run it

Double-click **`index.html`**. That's it — it works offline, straight from the folder.

---

## 📁 What each file is

| File | What it does |
|---|---|
| `index.html` | The page skeleton (browser tab title, share description, music button, corner menu) |
| `style.css` | All the colours, animations and fonts (fonts are embedded, so it looks right offline) |
| **`config.js`** | **The only file you normally edit** — name, music, pictures, every message |
| `app.js` | The logic that drives the screens. Leave it alone. |
| `assets/images/` | The pictures shown on the screens |
| `assets/music.mp3` | The background song |

---

## ✏️ What you can change (all in `config.js`)

### 1. The name

```js
var NAME = "Nargis";
```

This automatically updates the headline, every screen title and the browser tab.
If you also want the *share description* to change, edit `index.html`:

```html
<title>Happy Birthday, Nargis! ❤️</title>
<meta name="description" content="A special birthday surprise made with all my best wishes, just for Nargis." />
```

### 2. A picture

Drop your picture into `assets/images/` and either **keep the same file name** (nothing else to do) or point to your own file in `config.js`:

```js
var IMG = {
  intro: "assets/images/intro.jpg",      // screen 1 — the round portrait
  cake: "assets/images/cake.png",        // screen 3 — the birthday cake
  bouquet: "assets/images/bouquet.png",  // screen 4 — the flowers
  letterSticker: "assets/images/letter-sticker.png", // screen 6 — sticker on the letter
  gift: "assets/images/gift.png",        // screen 7 — the gift box
  final: "assets/images/final.jpg",      // screen 8 — the final card picture
};
```

Any normal image works (`.jpg`, `.png`, `.webp`).

### 3. The greetings

Every sentence on the screen lives in `TEXT` (right below `IMG`).
`{name}` is replaced with `NAME` automatically.

| Key | Where it shows |
|---|---|
| `introTitle`, `introCopy` | Opening screen |
| `introYes`, `introNo`, `introNoConfirm` | The two buttons on the first screen |
| `balloonTitle`, `balloonNote`, `balloonSub`, `balloonContinue` | Balloons screen |
| `cakeTitle`, `cakeSub`, `cakeHint`, `cakeWishMade` | Cake screen |
| `bouquetTitle`, `bouquetSub`, `bouquetPrompt`, `bouquetContinue` | Flowers screen |
| `envelopeTitle`, `envelopeHint`, `envelopeOpening`, `envelopeForYou` | Envelope screen |
| `letterTitle`, `letterContinue` | Letter screen (the letter text itself is `LETTER_TEXT` below) |
| `giftTitle`, `giftSub`, `giftHint`, `giftOpening` | Gift screen |
| `finalTitle`, `finalLine`, `finalLine2`, `replayBtn` | Final card |
| `pageTitle` | The browser tab |

Further down in the same file:

```js
var BALLOON_WORDS = [NAME, "makes", "life", "beautiful"];  // 4 words hidden in the balloons
var REASONS = [ ... ];                                      // the 4 reasons behind the flowers
var LETTER_TEXT = "...";                                    // the long letter (use \n for a new line)
```

### 4. The music

* **Use your own song:** save it as `assets/music.mp3` (overwrite the old one) — done.
* **Use another file:** put it in `assets/` and change `var AUDIO_SRC = "assets/my-song.mp3";`
* **No music file:** set `var AUDIO_SRC = "";` — the built-in music-box tune plays instead.

> Note: browsers only allow sound after the first click/tap, which is why there is a "Play" hint on load. That is normal.
> The bundled track is just a sample — feel free to replace it with a song of your own.

---

## 🚀 Put it on GitHub

```bash
git init
git add .
git commit -m "Birthday surprise site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Then on your repo page: **Settings → Pages → Source: `main` / root → Save**.
Your site will be live at `https://USERNAME.github.io/REPO/` in a minute or two.

---

## ❓ Good to know

* Everything is plain HTML/CSS/JS — any text editor works (Notepad, VS Code…).
* After editing, just save the file and refresh the browser (press **F5**).
* If something looks broken, press **F12** → *Console* to see the error message.
