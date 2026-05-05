export type ProjectMedia = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Project = {
  slug: string;
  type: string;
  title: string;
  summary: string;
  role: string;
  collaborators: string;
  channels: string;
  opening: string;
  decisions: string[];
  flow: string;
  outcome: string[];
  optionalExtension?: string;
  heroMedia?: ProjectMedia;
  breakMedia?: ProjectMedia;
  supportMedia?: ProjectMedia[];
  // Legacy fields — kept for backward compatibility
  heroImage: string;
  heroWidth?: number;
  heroHeight?: number;
  breakImage?: string;
  breakWidth?: number;
  breakHeight?: number;
  supportingImages: string[];
  optionalPhoneImages?: string[];
  optionalSystemDiagram?: string;
  symbol: string;
};

export const projects: Project[] = [
  {
    slug: "social-content-systems",
    type: "CONTENT SYSTEM",
    title: "Social Content Systems",
    summary:
      "Social graphic execution across game days, weekly campaigns, and real-time moments, supporting fan communication, sponsor deliverables, and brand consistency.",
    role: "Social Content Design, Execution",
    collaborators: "Social, Partnerships",
    channels: "Instagram, X, Facebook",
    opening:
      "Social content requires a constant stream of accurate, on-brand output across live events, recurring campaigns, and reactive moments.\nThe challenge was to maintain speed and consistency while handling sponsor requirements, real-time updates, and high-visibility publishing without error.",
    decisions: [
      "Built repeatable systems for high-volume output across game days, weekly campaigns, and reactive moments",
      "Introduced bracket usage as a recurring brand device for names, subtext, and supporting information",
      "Developed condensed type variations through manual vertical scaling of our main font",
      "Introduced the radial Jaguars logo outline as a subtle graphic system element",
      "Used a consistent gradient map system built from black, teal, gold, and white",
      "Integrated sponsor requirements into the system without breaking visual consistency"
    ],
    flow: "Planned Content + Live Moments → Social Execution → Fan Engagement",
    outcome: [
      "Delivered consistent, high-quality social content across ongoing campaigns and live events, supporting real-time fan communication and platform engagement.",
      "The system allowed for speed without sacrificing quality, while increasing trust and ownership within the workflow.",
      "Helped establish a reliable framework for executing high-volume, real-time content at scale."
    ],
    heroImage: "/images/jaguars-visual-systems.svg",
    supportingImages: [],
    symbol: "/symbols/jaguars-visual-systems.svg"
  },
  {
    slug: "london-series-2026",
    type: "VISUAL SYSTEM",
    title: "London Games",
    summary:
      "Developed the visual direction and campaign system for Jaguars UK, establishing a consistent London Games identity across social, digital, and international activations.",
    role: "Visual Design",
    collaborators: "Marketing, Jaguars UK Team, Digital",
    channels: "Email, Social, Jaguars.com",
    opening:
      "The look is built around our game uniform palette, black and teal, with a custom DUUUVAL mark using a Blackletter D as the primary Jaguars UK identifier.\nIn 2026, we will host two home games in London instead of one. The existing system carried that announcement, keeping the look consistent across U.S. and U.K. touchpoints while driving ticket interest registration.",
    decisions: [
      "Built the London look around our game uniform palette, black and teal, as the visual foundation for Jaguars UK",
      "Created a DUUUVAL mark using a Blackletter D for Jaguars UK and London Games usage",
      "Established the mark as a reusable identity element across UK-specific activations",
      "Aligned the 2026 London Games announcement rollout across U.S. and U.K. audiences simultaneously",
      "Designed the 2026 campaign around a single clear action: register your interest"
    ],
    flow: "Email / Social / Jaguars.com → Ticket Interest Registration",
    outcome: [
      "The London Games visual system is an ongoing part of how we show up for Jaguars UK, not a one-time campaign.",
      "The Blackletter DUUUVAL mark is now a consistent identifier across international activations.",
      "The 2026 two-game announcement used the existing system to deliver a clear, coordinated rollout across social, digital, and in-person touchpoints."
    ],
    heroMedia: {
      src: "/work/london-series-2026/hero.jpg",
      width: 2400,
      height: 996,
      alt: "London Series campaign hero visual"
    },
    heroImage: "/work/london-series-2026/hero.jpg",
    heroWidth: 2400,
    heroHeight: 996,
    supportingImages: [],
    symbol: "/symbols/nutrition-intelligence-system.svg"
  },
  {
    slug: "prowler-throwback",
    type: "VISUAL SYSTEM",
    title: "Throwback Creative",
    summary:
      "Developed a multi-season visual system inspired by early 2000s web culture, supporting throwback uniforms across digital experiences, merchandise, and fan engagement.",
    role: "Design Contribution, Experience Design (Jaguars.com)",
    collaborators: "Design, Digital, Photography, Production",
    channels: "Jaguars.com, Social, Merchandise",
    opening:
      "The introduction of Prowler throwback uniforms required more than a one-time campaign.\nThe goal was to create a visual system that felt authentic to the late '90s and early 2000s era, while still functioning across modern digital platforms, merchandise, and evolving fan experiences.",
    decisions: [
      "Translated nostalgia into a usable system",
      "Designed for multi-platform flexibility",
      "Contributed to Jaguars.com experience design",
      "Balanced authenticity with modern usability",
      "Evolved the system across multiple seasons"
    ],
    flow: "Historical Reference → Visual System → Multi-Platform Execution → Fan Engagement + Merchandise",
    outcome: [
      "Created a cohesive throwback system that extended beyond a single campaign, supporting digital experiences, merchandise, and ongoing fan engagement.",
      "The visual language continued to evolve across seasons, reinforcing consistency while allowing for new expressions.",
      "Helped establish a scalable approach to translating brand history into modern, multi-platform design systems."
    ],
    heroImage: "/images/atlas-interface-system.svg",
    supportingImages: [],
    symbol: "/symbols/atlas-interface-system.svg"
  },
  {
    slug: "orlando-2027",
    type: "CAMPAIGN SYSTEM",
    title: "Orlando 2027",
    summary:
      "Designed a multi-channel announcement campaign to communicate the Jaguars' temporary relocation to Orlando for the 2027 season, balancing clarity, excitement, and fan engagement.",
    role: "Campaign Visual Direction",
    collaborators: "Digital, Marketing, Florida Citrus Sports",
    channels: "Email, Social, Jaguars.com, App, SMS, Physical Event",
    opening:
      "In 2027, the Jaguars will temporarily relocate to Orlando for the season due to stadium construction in Jacksonville.\nFans needed a clear, direct explanation of the change, not buried in detail, but communicated with energy and transparency across every channel at once.",
    decisions: [
      "Framed the announcement with a 'Greetings from Orlando' concept",
      "Balanced clarity with excitement across all touchpoints",
      "Maintained consistent messaging across digital and physical channels",
      "Supported a landing page for centralized information",
      "Extended into in-person event assets"
    ],
    flow: "Announcement → Landing Page → Interest Signup",
    outcome: [
      "Delivered a cohesive multi-channel rollout communicating the relocation clearly and with energy.",
      "Supported fan understanding of the temporary change while maintaining engagement.",
      "Maintained consistency across platforms from initial announcement through ongoing touchpoints."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "pro-bowl-campaign",
    type: "CAMPAIGN SYSTEM",
    title: "Pro Bowl Games",
    summary:
      "Led creative direction for a multi-phase campaign to promote Pro Bowl voting across digital, social, and in-stadium touchpoints, supporting player visibility and fan participation.",
    role: "Creative Direction and Campaign Execution",
    collaborators: "Digital, Social, Production",
    channels: "Email, Social, Jaguars.com, SMS, In-Stadium",
    opening:
      "Pro Bowl voting runs across multiple phases, requiring sustained fan engagement over a long window.\nWorking within NFL asset constraints, the challenge was to maintain Jaguars brand identity while adapting league-provided materials into a cohesive, high-energy campaign system.",
    decisions: [
      "Adapted NFL assets into the Jaguars visual system",
      "Structured the campaign across multiple phases to sustain engagement",
      "Extended the system across digital and in-stadium channels",
      "Introduced real-time game day content to amplify voting moments",
      "Maintained brand consistency without sacrificing speed"
    ],
    flow: "Voting Opens → Campaign Rollout → Player Promotion → Game Day Amplification",
    outcome: [
      "Supported Pro Bowl voting across two seasons with a sustained, multi-phase campaign system.",
      "Contributed to player selections through consistent fan-facing promotion.",
      "Established a repeatable campaign framework for annual voting windows."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "season-tickets-2025",
    type: "CAMPAIGN SYSTEM",
    title: "2025 Season Tickets Campaign",
    summary:
      "Led creative direction for a season tickets campaign, introducing a new visual identity centered around football leadership and custom photography to support sales efforts.",
    role: "Visual Design",
    collaborators: "Design, Ticketing, Marketing, Digital, Photography",
    channels: "Email, Social, Jaguars.com, App",
    opening:
      "The campaign needed to support season ticket sales while introducing new football leadership, requiring a strong visual identity that communicated a clear shift into a new era.",
    decisions: [
      "Built the campaign around a new era narrative centered on football leadership",
      "Helped direct a custom photo shoot to capture intentional, reusable imagery",
      "Combined individual portraits into a unified trio composition",
      "Introduced a radial jag head element to anchor the visual identity",
      "Designed a scalable system across ticketing touchpoints"
    ],
    flow: "Campaign Identity → Multi-Channel Rollout → Season Ticket Engagement",
    outcome: [
      "Delivered a cohesive multi-channel campaign supporting season ticket sales.",
      "Established a strong visual identity used prominently across platforms.",
      "Introduced a design element that carried forward into broader brand usage."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "stadium-of-the-future-deposit-campaign",
    type: "CAMPAIGN SYSTEM",
    title: "Stadium of the Future Deposit Campaign",
    summary:
      "Led creative direction for a multi-channel campaign promoting deposits for Stadium of the Future, using a unified visual system to connect current team identity with future stadium development.",
    role: "Creative Direction",
    collaborators: "Design, Marketing, Digital, Ticketing",
    channels: "Email, Social, Jaguars.com, App, In-Stadium",
    opening:
      "The campaign needed to generate early commitment for Stadium of the Future while clearly communicating a forward-looking vision for the franchise across multiple touchpoints.",
    decisions: [
      "Introduced gradient mapping as a core visual system to unify campaign assets",
      "Applied the radial jag element to reinforce brand identity within a future-focused context",
      "Combined player imagery with Stadium of the Future renderings to connect present and future",
      "Designed a consistent visual language that scaled across all campaign touchpoints",
      "Balanced bold visual direction with clear deposit-driven messaging"
    ],
    flow: "Campaign Vision → Multi-Channel Rollout → Deposit Action",
    outcome: [
      "Delivered a cohesive, high-visibility campaign across digital, physical, and environmental touchpoints.",
      "Established an early use case for gradient mapping within the broader brand system.",
      "Reinforced franchise positioning around future development and long-term growth."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "small-market-team",
    type: "CAMPAIGN SYSTEM",
    title: "2025 Playoffs",
    summary:
      "Contributed to a multi-channel playoff campaign spanning digital, social, in-stadium, and physical activations, supporting fan engagement during a high-stakes postseason run.",
    role: "Visual Design",
    collaborators: "Design, Social, Digital, Marketing, Production, Photography",
    channels: "Social, Email, Jaguars.com, In-Stadium, Merchandise",
    opening:
      "The playoffs required a clear shift in visual identity and energy, moving from regular season content into a more intense, unified campaign while supporting fan engagement, ticket demand, and in-game atmosphere.",
    decisions: [
      "Helped transition the brand from regular season visuals into a darker, playoff-specific identity",
      "Contributed to a unified campaign across digital, social, and in-stadium environments",
      "Supported rapid content creation for high-visibility playoff moments",
      "Designed assets that aligned with both fan engagement and promotional efforts",
      "Extended the campaign into physical merchandise to support grassroots activation"
    ],
    flow: "Playoff Announcement → Campaign Rollout → Game Week Promotion → Game Day Experience",
    outcome: [
      "Delivered consistent visual support across a high-visibility playoff campaign.",
      "Contributed to fan engagement leading into and during a home playoff game.",
      "Helped unify the brand experience across digital and physical touchpoints."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "nfl-draft-creative",
    type: "CAMPAIGN SYSTEM",
    title: "NFL Draft Creative",
    summary:
      "Helped shape the Jaguars Draft identity across multiple seasons, adapting NFL-provided assets into a cohesive team-specific experience across digital, social, and product touchpoints.",
    role: "Visual Design",
    collaborators: "Design, Social, Digital, Marketing, Production, New Era",
    channels: "Social, Email, Jaguars.com, App",
    opening:
      "Each NFL Draft season required translating league creative into a Jaguars-specific identity while keeping the experience aligned across NFL, team, digital, social, and product touchpoints.",
    decisions: [
      "Translated NFL-provided Draft assets and guidelines into a Jaguars-specific brand expression",
      "Maintained alignment with league-wide creative while reinforcing team identity",
      "Extended the Draft identity across social, digital experiences, and site takeovers",
      "Executed real-time Draft content with speed and accuracy",
      "Contributed to New Era Draft cap refinement through brand feedback",
      "Led promotional creative for Draft caps across web and app experiences"
    ],
    flow: "NFL Assets → Jaguars Adaptation → Multi-Channel Execution → Fan Engagement",
    outcome: [
      "Delivered a cohesive Draft experience across multiple seasons.",
      "Maintained consistency between NFL creative and Jaguars platforms.",
      "Supported fan engagement through real-time content and product promotion.",
      "Improved brand alignment across digital and product touchpoints."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "sms-subscriber-growth",
    type: "CAMPAIGN SYSTEM",
    title: "Driving SMS Subscriber Growth",
    summary:
      "Designed a multi-channel campaign to grow SMS subscribers by making the value of the channel clear, immediate, and easy to act on.",
    role: "Visual Design",
    collaborators: "Marketing, Marketing Operations",
    channels: "Email, Social, Jaguars.com",
    opening:
      "SMS is one of the most direct ways to reach fans, but it requires a clear opt-in.\nMany fans were unaware of what they would receive or why it was worth subscribing. The goal was to communicate the value of the channel quickly and reduce friction in the signup process.",
    decisions: [
      "Made the value of SMS immediately tangible by using real message examples",
      "Introduced motion in email with marketing to help the message stand out",
      "Simplified the system around one clear action: subscribe",
      "Used familiar iOS-inspired UI patterns to reduce friction",
      "Built a consistent multi-channel path to conversion"
    ],
    flow: "Email / Social → Landing Page → SMS Signup",
    outcome: [
      "Supported SMS subscriber growth by clarifying the value of the channel and creating a more direct path to opt-in.",
      "The campaign system extended across multiple touchpoints, with reusable motion assets increasing reach and consistency over time.",
      "Helped establish a scalable framework for communicating and growing a direct-to-fan channel."
    ],
    heroMedia: {
      src: "/work/sms-subscriber-growth/hero.png",
      width: 2400,
      height: 800,
      alt: "SMS subscriber growth campaign hero"
    },
    heroImage: "/images/signal-archive.svg",
    supportingImages: [],
    symbol: "/symbols/signal-archive.svg"
  },
  {
    slug: "youve-been-spotted",
    type: "CAMPAIGN SYSTEM",
    title: "You've Been Spotted",
    summary:
      "Designed the campaign identity and physical touchpoints for a Jacksonville-based lead generation activation, converting in-person fan interactions into ticketing leads.",
    role: "Campaign Identity and Touchpoint Design",
    collaborators: "Marketing, Sales",
    channels: "Physical Cards, QR Signup Flow, Merchandise",
    opening:
      "The organization needed a low-friction way to identify local fans, collect ticketing leads, and create a memorable in-person interaction tied to the Jaguars brand.\nThe activation centered around a simple printed card that was easy for staff to hand out and easy for fans to act on.",
    decisions: [
      "Created a cohesive campaign identity across cards and merchandise",
      "Designed the card as a simple entry point into the signup flow",
      "Used QR-based interaction to connect real-world fan moments to digital lead capture",
      "Kept the experience easy for staff to explain and fans to act on",
      "Extended the campaign identity into the merchandise to reinforce the overall experience"
    ],
    flow: "Fan Spotted → QR Scan → Signup → Merchandise → Ticketing Lead",
    outcome: [
      "Supported a local lead-generation campaign through merchandise-based fan engagement.",
      "Helped convert in-person interactions into ticketing leads.",
      "Contributed to a cohesive, recognizable campaign experience across touchpoints."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  },
  {
    slug: "fan-of-the-year",
    type: "CAMPAIGN SYSTEM",
    title: "Fan of the Year Campaign",
    summary:
      "Led creative direction for a multi-channel campaign to promote Fan of the Year voting, adapting NFL-provided assets into a Jaguars-branded experience across digital, social, and in-stadium touchpoints.",
    role: "Visual Design",
    collaborators: "Design, Social, Digital, Marketing, Production",
    channels: "Email, Social, Jaguars.com, In-Stadium",
    opening:
      "Fan of the Year voting required clear, engaging promotion to drive participation while working within NFL-provided creative and maintaining a strong Jaguars brand presence.",
    decisions: [
      "Translated NFL-provided Fan of the Year assets into a Jaguars-specific visual identity",
      "Designed a consistent experience across digital, in-stadium, and paid channels",
      "Used QR-based interactions to reduce friction and encourage voting",
      "Extended the campaign across domestic and international Fan of the Year initiatives",
      "Maintained clarity and simplicity to support quick fan participation"
    ],
    flow: "Promotion → QR / Link → Voting Page → Submission",
    outcome: [
      "Delivered a cohesive multi-channel voting campaign across multiple seasons.",
      "Supported fan participation through accessible and consistent promotion.",
      "Established a repeatable system for future Fan of the Year activations."
    ],
    heroImage: "",
    supportingImages: [],
    symbol: ""
  }
];

// Archived — not included in v1 rendered set
// {
//   slug: "field-notes-platform",
//   type: "CAMPAIGN SYSTEM",
//   title: "It's About Us",
//   summary: "Built a unified campaign to capitalize on mid-season momentum and drive attendance, engagement, and national attention around a pivotal home game.",
//   role: "Creative Direction",
//   collaborators: "Marketing, Photography, Production",
//   channels: "Email, Social, Jaguars.com, In-Stadium",
//   opening: "",
//   decisions: [],
//   flow: "EMAIL · SOCIAL · WEB → DRIVE ATTENDANCE → BUILD GAME DAY ENERGY",
//   outcome: [],
//   heroImage: "/images/tempo-dashboard.svg",
//   supportingImages: [],
//   symbol: "/symbols/field-notes-platform.svg"
// }
