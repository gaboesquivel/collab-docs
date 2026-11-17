/**
 * Hand-written one-line summaries for each turn in session-data.json, keyed by
 * session id and turn index. `steer` marks the turns where the human changed
 * the direction the AI proposed.
 */
export interface TurnNote {
  summary: string;
  steer?: string;
}

export const TURN_NOTES: Record<number, TurnNote[]> = {
  1: [
    {
      summary:
        "Product discovery: researched existing tools and free editor libraries, then challenged assumptions on sharing, file formats, saving and editing.",
    },
    {
      summary:
        "Settled upload as “import into a new editable document”, like opening a Word file in Google Docs.",
    },
    {
      steer: "Chose the platform",
      summary:
        "Asked for a Vercel-first stack. The AI checked WebSocket limits and Neon, and recommended shared access over live co-editing.",
    },
    { summary: "Asked for the big picture: scope, non-goals and next step." },
    {
      summary:
        "Approved the direction. The AI wrote PRODUCT.md and ARCHITECTURE.md.",
    },
    {
      steer: "Set constraints",
      summary:
        "Settled the open questions: free tiers, ship to main, manual testing, no read-only role.",
    },
    {
      steer: "Overrode a recommendation",
      summary:
        "Chose demo accounts only, instead of the AI's sign-up-plus-demo proposal.",
    },
    {
      steer: "Rejected the plan twice",
      summary:
        "Phased plan with import as the first slice. Rejected it until setup ran through the Vercel and GitHub CLIs and linting used Ultracite; then built phase 1 and deployed it.",
    },
    {
      steer: "Stopped browser automation",
      summary:
        "Built phases 2–4 (autosave and conflicts, sharing, polish), verified with lint, types and builds only, and shipped each phase.",
    },
    { summary: "Asked where the demo password was; the AI kept it secret." },
    {
      steer: "Simplified",
      summary: "Made the demo password static and public.",
    },
    {
      steer: "Changed sign-in",
      summary: "Any @demo.test email now creates its account on first sign-in.",
    },
    { summary: "Confirmed everything was on main and deployed." },
  ],
  2: [
    {
      steer: "Closed a gap",
      summary:
        "Came back to add the missed requirement: one meaningful automated test, on document import, plus an updated testing policy.",
    },
    { summary: "Pushed the test to main." },
  ],
};
