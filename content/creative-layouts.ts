/**
 * Media arrangement for each creative case study.
 *
 * The case-study template has three media slots: `mid` (after the opening),
 * `bottom` (after the outcome) and `closing` (a labeled full-width image at
 * the very end). Files are matched by name inside /public/work/<slug>/.
 * Projects without an entry use DEFAULT_LAYOUT.
 */

export type GalleryGroup = {
  label?: string;
  match: RegExp;
};

export type MediaBlock =
  | { type: "image"; file: "break" | "break-2"; label?: string; alt?: string }
  | { type: "gallery"; groups: GalleryGroup[]; columns: 3 | 4 };

export type CreativeLayout = {
  mid?: MediaBlock;
  bottom?: MediaBlock;
  closing?: MediaBlock;
};

const support = /^support-\d+\.[a-z0-9]+$/;

export const DEFAULT_LAYOUT: CreativeLayout = {
  mid: { type: "image", file: "break", alt: "campaign visual" },
  bottom: { type: "gallery", columns: 3, groups: [{ match: support }] },
};

export const CREATIVE_LAYOUTS: Record<string, CreativeLayout> = {
  "social-content-systems": {
    mid: {
      type: "gallery",
      columns: 4,
      groups: [
        { label: "Uniform Combos", match: /^support-uniform-\d+\./ },
        { label: "Game Week Content", match: /^support-game-week-.*\d+\./ },
        { label: "Achievements", match: /^support-achievements-\d+\./ },
        { label: "Salute to Service", match: /^support-salute-service-\d+\./ },
        { label: "Birthday", match: /^support-bday-\d+\./ },
        { label: "Sounds of the Game Posters", match: /^support-sounds-game-\d+\./ },
      ],
    },
    closing: { type: "image", file: "break", label: "2025 Social / Digital / Creative Team", alt: "creative team" },
  },

  "london-series-2026": {
    mid: { type: "gallery", columns: 3, groups: [{ label: "2025 London Game Social Creative", match: support }] },
    bottom: { type: "gallery", columns: 3, groups: [{ label: "2026 London Games Communication", match: /^communication-\d+\./ }] },
  },

  "prowler-throwback": {
    mid: { type: "gallery", columns: 3, groups: [{ label: "2025 Throwback Social Creative", match: support }] },
    bottom: {
      type: "gallery",
      columns: 3,
      groups: [
        { label: "It's About Us Campaign", match: /^about-us-\d+\./ },
        { label: "2024 Prowler Throwback Website Takeover", match: /^launch-\d+\./ },
      ],
    },
    closing: { type: "image", file: "break", label: "Prowler Throwback Pro Shop Event", alt: "Pro Shop Event" },
  },

  "pro-bowl-campaign": {
    mid: DEFAULT_LAYOUT.mid,
    bottom: {
      type: "gallery",
      columns: 3,
      groups: [
        { label: "2026 Creative", match: support },
        { label: "2025 Creative", match: /^2025-support-\d+\./ },
      ],
    },
  },

  "season-tickets-2025": {
    mid: { type: "gallery", columns: 3, groups: [{ match: support }] },
  },

  "small-market-team": {
    mid: {
      type: "gallery",
      columns: 3,
      groups: [
        { label: "Playoff Social Creative", match: support },
        { label: "Grassroots Activation", match: /^merch-\d+\./ },
      ],
    },
    bottom: { type: "gallery", columns: 3, groups: [{ label: "Small Market Team", match: /^small-market-\d+\./ }] },
  },

  "nfl-draft-creative": {
    mid: { type: "image", file: "break", label: "Draft Education Slider", alt: "draft education slider" },
    bottom: { type: "gallery", columns: 3, groups: [{ label: "Draft Creative", match: support }] },
    closing: { type: "image", file: "break-2", label: "2026 Draft Creative Team", alt: "2026 creative team" },
  },

  // Archived — kept so the historical arrangement isn't lost
  "fan-of-the-year": {
    mid: { type: "gallery", columns: 3, groups: [{ label: "FOTY Social Creative", match: support }] },
    bottom: { type: "gallery", columns: 3, groups: [{ label: "FOTY Email Creative", match: /^email-support-\d+\./ }] },
  },
};
