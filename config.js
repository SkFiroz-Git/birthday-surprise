/* =========================================================
   CONFIG — the only file you need to edit.

   Change the name, the music, the pictures and every greeting.
   Save, then refresh index.html in your browser to see it.
   ========================================================= */

/* --- 1. WHO IS IT FOR ---------------------------------- */
var NAME = "Nargis";

/* --- 2. MUSIC ------------------------------------------ */
// Song that plays in the background (a file inside assets/).
// Set it to "" to use the built-in music-box tune instead.
var AUDIO_SRC = "assets/music.mp3";
var MUSIC_GAIN = 0.5;

/* --- 3. PICTURES --------------------------------------- */
// Point these at your own files (keep them inside assets/).
var IMG = {
  cake: "assets/images/cake.png",
  bouquet: "assets/images/bouquet.png",
  gift: "assets/images/gift.png",
  intro: "assets/images/intro.jpg",
  final: "assets/images/final.jpg",
  letterSticker: "assets/images/letter-sticker.png",
};

/* --- 4. GREETINGS (one line per screen) ---------------- */
// {name} is automatically replaced with the name above.
var TEXT = {
  introTitle: "Happy Birthday, {name} ❤️",
  introCopy: "I made something little, just for you — a whole evening of surprises, letters, cakes and secrets. Ready to open it?",
  introYes: "Yes, surprise me!",
  introNo: "Hmm… not sure",
  introNoConfirm: "Are you sure? 😅",
  balloonTitle: "Four balloons for you 🎈",
  balloonNote: "Pop them one by one…",
  balloonSub: "Each one hides a tiny word. Find them all.",
  balloonContinue: "All popped → next surprise",
  cakeTitle: "Make a wish, {name}... 💕",
  cakeSub: "Close your eyes… and blow out the three little candles",
  cakeHint: "Tap a candle to blow it out",
  cakeWishMade: "Wish made! 🎂  Your wish is safe with me",
  bouquetTitle: "For {name}, who brings beauty to my world 🌷",
  bouquetSub: "Four little reasons, hiding in the flowers. Tap each one.",
  bouquetPrompt: "Tap a flower to read its reason 🌸",
  bouquetContinue: "Keep going →",
  envelopeTitle: "A letter carrying all my best wishes for {name}...",
  envelopeForYou: "For you…",
  envelopeHint: "Tap the envelope to open it",
  envelopeOpening: "Opening…",
  letterTitle: "A letter for {name}",
  letterContinue: "I'm keeping this forever →",
  giftTitle: "One Last Thing... 🎁",
  giftSub: "I saved the best for last. Tap to open it.",
  giftHint: "Tap the gift 🎁",
  giftOpening: "Opening your gift… 🎁",
  finalTitle: "Warm wishes for {name} ❤",
  finalLine: "Once again, Happy Birthday, {name}!",
  finalLine2: "💕 You are a wonderful friend, today and always.",
  replayBtn: "↺ Replay the whole surprise",
  pageTitle: "Happy Birthday, {name}! ❤️",
};

/* --- 5. WORDS IN THE GAME ------------------------------ */
// The four words hidden in the balloons (the first one is the name).
var BALLOON_WORDS = [NAME, "you", "are", "beautiful"];

// The four reasons behind the flowers.
var REASONS = [
  { title: "Your Smile", text: "That smile of yours can light up the darkest day of mine.", icon: "heart", color: "var(--crimson)", bg: "rgba(217,72,120,0.45)" },
  { title: "Your Kindness", text: "You care in a way that makes everyone around you feel safe.", icon: "sparkles", color: "hsl(343,85%,68%)", bg: "rgba(255,150,180,0.45)" },
  { title: "Your Laugh", text: "One laugh from you and suddenly everything feels right again.", icon: "smile", color: "hsl(42,90%,58%)", bg: "rgba(255,200,80,0.45)" },
  { title: "Your Heart", text: "Being your friend is the easiest and best thing I have ever done.", icon: "star", color: "hsl(280,75%,60%)", bg: "rgba(170,110,240,0.45)" }
];

// The long letter that types itself out.
var LETTER_TEXT =
  "To my favorite person,\n\n" +
  "Happy Birthday, dear friend! Today is all about you — every little and big thing that makes you, you.\n\n" +
  "Thank you for every laugh, every long conversation, every quiet moment in between. Being in your life (and having you in mine) is my favorite part of every day.\n\n" +
  "I hope this year brings you softer mornings, loud laughter, brave dreams, and all the warmth you so freely give to everyone else.\n\n" +
  "Whatever comes next, I am cheering for you — loudly.\n\n" +
  "Happy Birthday, my dear friend.\n" +
  "— Your friend ❤️";
