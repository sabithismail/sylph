// A small synthesized meow: no audio files, nothing to download or license.
let ctx: AudioContext | null = null;

/** Call from a tap or click so the browser allows sound. */
export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* sound is optional */
  }
}

export function meow(kind: "meow" | "mew" = "meow") {
  const c = ctx;
  if (!c || c.state !== "running") return;
  const t0 = c.currentTime + 0.01;
  const dur = kind === "mew" ? 0.34 : 0.8;
  const base = (kind === "mew" ? 660 : 500) * (0.92 + Math.random() * 0.18);

  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(base * 0.8, t0);
  osc.frequency.exponentialRampToValueAtTime(base * 1.6, t0 + dur * 0.38);
  osc.frequency.exponentialRampToValueAtTime(base * 0.78, t0 + dur);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 6.5;
  lfoGain.gain.value = base * 0.018;
  lfo.connect(lfoGain).connect(osc.frequency);

  // Two sweeping vowel resonances give the "mee-ow" shape.
  const f1 = c.createBiquadFilter();
  f1.type = "bandpass";
  f1.Q.value = 5;
  f1.frequency.setValueAtTime(650, t0);
  f1.frequency.linearRampToValueAtTime(1050, t0 + dur * 0.4);
  f1.frequency.linearRampToValueAtTime(620, t0 + dur);
  const f2 = c.createBiquadFilter();
  f2.type = "bandpass";
  f2.Q.value = 7;
  f2.frequency.setValueAtTime(1700, t0);
  f2.frequency.linearRampToValueAtTime(2700, t0 + dur * 0.4);
  f2.frequency.linearRampToValueAtTime(1400, t0 + dur);

  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.2, t0 + 0.07);
  amp.gain.setValueAtTime(0.2, t0 + dur * 0.55);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(f1).connect(amp);
  osc.connect(f2).connect(amp);
  amp.connect(c.destination);
  osc.start(t0);
  lfo.start(t0);
  osc.stop(t0 + dur + 0.05);
  lfo.stop(t0 + dur + 0.05);
}
