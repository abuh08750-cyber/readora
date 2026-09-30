'use client'

export default function ReaderPage() {
  const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZERO SE ARTIST - Book 1 | By Tiger Soul</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cinzel:wght@700;900&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #0B0F17;
      color: #E2E8F0;
    }
    .font-display { font-family: 'Cinzel', serif; }
    .font-heading { font-family: 'Outfit', sans-serif; }
    html { scroll-behavior: smooth; }
  </style>
</head>
<body class="selection:bg-amber-500 selection:text-black">
  <main class="max-w-3xl mx-auto px-5 sm:px-8 py-10">
    <section class="min-h-[80vh] flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-b from-[#131A2A] via-[#0F172A] to-[#0A0D14] border border-amber-500/30 shadow-2xl relative mb-12 text-center">
      <div class="my-auto py-8">
        <p class="text-xs uppercase tracking-[0.3em] text-cyan-400 mb-2">From Zero To Your Own Sound</p>
        <h1 class="font-display text-4xl sm:text-5xl font-black text-white mb-3">ZERO SE ARTIST</h1>
        <h2 class="font-heading text-lg font-bold text-slate-200 mb-4">ARTIST BANNE KI SHURUAAT</h2>
        <p class="text-xs text-amber-400 font-bold uppercase tracking-widest">Written by TIGER SOUL</p>
      </div>
    </section>

    <article class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
      <h3 class="font-heading text-lg font-bold text-white">Author's Note</h3>
      <p>Agar tum ye book padh rahe ho, toh shayad tumhare andar bhi ek artist hai. Shuruaat mein expensive studio ya team hona zaroori nahi hai.</p>
      <p class="text-amber-400 font-bold">"Start where you are, use what you have, learn as you go."</p>
    </article>

    <article class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
      <span class="text-xs text-amber-400 font-bold uppercase">Chapter 01</span>
      <h3 class="font-heading text-xl font-bold text-white">ARTIST BANNE KA DECISION</h3>
      <p>Artist banna sirf keh dena nahi hai, ye ek decision hai. Pehle listener se creator bano. Pehle create karo, phir seekho, phir improve karo.</p>
    </article>

    <article class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
      <span class="text-xs text-cyan-400 font-bold uppercase">Chapter 02</span>
      <h3 class="font-heading text-xl font-bold text-white">TUM ARTIST KYUN BANNA CHAHTE HO?</h3>
      <p>Apna "Kyun" samjho. Jab views kam aayenge tab tumhara maksad hi tumhe aage badhayega.</p>
    </article>

    <footer class="text-center text-xs text-slate-600 pt-8 border-t border-slate-800">
      ZERO SE ARTIST • Book 1 • By Tiger Soul
    </footer>
  </main>
</body>
</html>`

  return (
    <iframe
      srcDoc={htmlContent}
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="Zero Se Artist"
    />
  )
}
