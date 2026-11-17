/**
 * Who I am, in the few facts the site states. The homepage reads everything
 * from here: the opening sentence, the "More info" section and the footer.
 *
 * Nothing in this file is rounded up or guessed. Add a date only when it is
 * known.
 */

export const identity = {
  name: "Nick Johnson",
  role: "Designer, creative technology",
  employer: { name: "Jacksonville Jaguars", href: "https://www.jaguars.com/" },
};

/** Shown when "More info" is opened, before the lists. */
export const about =
  "Most of what I build connects design, software and automation. Recurring work like weekly graphics, campaign suites and motion versions gets made with less repetition, and every file stays editable for the designer who finishes it.";

export type Role = { role: string; dates: string };

/** One organization, with the roles held there, most recent first. */
export type Position = { organization: string; dates: string; roles: Role[] };

export const experience: Position[] = [
  {
    organization: "Jacksonville Jaguars",
    dates: "2022 to present",
    roles: [
      { role: "Junior Graphic Designer", dates: "November 2023 to present" },
      { role: "Graphic Design Contractor", dates: "June 2023 to November 2023" },
      { role: "Graphic Design Intern", dates: "December 2022 to May 2023" },
    ],
  },
];

export type School = { school: string; degree: string; detail?: string; dates?: string };

export const education: School[] = [
  { school: "University of North Florida", degree: "B.B.A. Marketing", detail: "Minor in Digital Media and Analytics" },
];

export type ContactLink = { label: string; href: string };

/** The footer, left to right. */
export const contact: ContactLink[] = [
  { label: "Email", href: "mailto:nickjohnson1397@gmail.com" },
  { label: "Instagram", href: "https://www.instagram.com/n1ckmade/" },
  { label: "X", href: "https://x.com/n1ckmade" },
  { label: "LinkedIn", href: "https://linkedin.com/in/nickjohnson1397/" },
];

/** Where the footer clock is set. An IANA zone, so daylight saving is handled for us. */
export const home = { city: "Jacksonville, Florida", timeZone: "America/New_York" };
