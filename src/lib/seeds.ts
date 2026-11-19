// A gentle writing prompt for each day. Same prompt for everyone on the same date.
export const SEEDS = [
  "A smell that takes you straight back to childhood…",
  "Something you were told as a child that you still carry…",
  "A place that felt like home, even if only for a while…",
  "The last time you cried, and what finally let it out…",
  "A friend who drifted away, and what you'd say to them now…",
  "A small kindness from a stranger that stayed with you…",
  "Something you are proud of that nobody noticed…",
  "A night you couldn't sleep, and what kept you awake…",
  "A door you wish you had walked through…",
  "The version of you from five years ago, and what they needed to hear…",
  "A song that holds a whole season of your life…",
  "Something you forgave, and how long it took…",
  "A moment you felt completely small, and what the sky looked like…",
  "A habit you picked up from someone you love…",
  "What you wish people understood about your quiet days…",
  "A promise you made to yourself and are still keeping…",
  "The hardest goodbye, and what it taught you about holding on…",
  "A morning when everything felt a little lighter…",
  "Something you lost that you are slowly learning to live without…",
  "A time you were braver than you thought you could be…",
  "The people who showed up when it counted…",
  "A word someone said to you that changed how you saw yourself…",
  "Something you are afraid to want…",
  "A rainy day, and where your mind went…",
  "A room you can still see perfectly in your memory…",
  "Something you have outgrown, and how it felt to let it go…",
  "A thing you do when no one is watching…",
  "The first time you felt truly understood…",
  "What home means to you right now…",
  "A hope you are quietly protecting…",
  "A tiny joy from this week that you almost missed…",
  "Something you want to say to your future self…",
  "A mistake you've made peace with…",
  "The sound of someone you miss…",
  "A day you wish you could replay…",
];

/** Stable index for a calendar day in the visitor's own timezone. */
export function seedOfDay(d = new Date()): string {
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  return SEEDS[day % SEEDS.length];
}
