export type TourStep = { sel: string; text: string };

// What the garden cat says, per page. Selectors point at data-tour attributes.
export const TOURS: Record<string, TourStep[]> = {
  "/": [
    { sel: '[data-tour="nav"]', text: "Mrrp! I'm the garden cat. This is Sylph, a quiet place to turn what you've lived through into poems, stories and quotes. Up here you can sign in, see your picture and open the feed." },
    { sel: '[data-tour="seed"]', text: "Every day there's a new seed, a gentle prompt. If you don't know where to begin, tap “Write from this”." },
    { sel: '[data-tour="paths"]', text: "Three ways to write: a poem, a story or a quote. Tell Sylph a little, pick the form and the length, and it writes with you. You can change every word afterwards." },
    { sel: '[data-tour="latest"]', text: "This is the garden, what others have shared. Tap ♡ to like, ✦ to share a feeling, or a name to visit their page. “Be a spirit” follows someone." },
    { sel: '[data-tour="footer"]', text: "If things ever feel too heavy, Tele-MANAS (India) is free at 14416, any time. You're not alone in here. Mew." },
  ],
  "/poem": [
    { sel: '[data-tour="wizard"]', text: "Start with your story, as much or as little as you like. Then choose a form and the voice. When the poem is ready you can restyle it, keep it in your private journal, or post it." },
  ],
  "/story": [
    { sel: '[data-tour="wizard"]', text: "Tell me what happened, pick how long the story should be, and the voice. Afterwards you can restyle it, keep it in your journal, or post it." },
  ],
  "/quote": [
    { sel: '[data-tour="wizard"]', text: "Draw a random line from the garden, or turn one hard moment into a line of your own. Short, deep, with a little nature in it." },
  ],
  "/feed": [
    { sel: '[data-tour="feed"]', text: "The whole garden. Use the chips to show only poems, stories or quotes, or “My spirits” for your own people. Long pieces fold up, tap “Read more ✦”." },
  ],
  "/me": [
    { sel: '[data-tour="plant"]', text: "This is your writing plant. It grows every day you write something, from a seed to a bloom." },
    { sel: '[data-tour="look"]', text: "Pick your picture and write a short bio here. It's how spirits see you." },
    { sel: '[data-tour="handle"]', text: "Add an Instagram or Facebook handle if you'd like spirits to find you. You choose who sees it: everyone, only your spirits, or only you." },
    { sel: '[data-tour="journal"]', text: "Your private journal. Pieces you kept for yourself live here, and only you can see them." },
  ],
};
