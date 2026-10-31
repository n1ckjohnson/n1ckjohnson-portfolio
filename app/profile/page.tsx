import type { Metadata } from "next";
import { contact, education, experience } from "@/content/profile";
import { findMedia } from "@/lib/media";
import { Media } from "@/components/media/media";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  const portrait = findMedia("profile", "profile");

  return (
    <div className="page pt-10 sm:pt-20 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-24">
      <div className="lg:col-span-6 lg:col-start-6 lg:row-start-1">
        <p className="text-small text-ink-2">About</p>
        <h1 className="mt-3 text-title font-medium text-ink sm:text-display">Nick Johnson</h1>
        <p className="mt-5 max-w-measure text-body text-ink-2 sm:text-lead">
          I design creative work and build the systems behind it. I&rsquo;ve been with the Jacksonville Jaguars since
          December 2022.
        </p>
      </div>

      {portrait ? (
        <div className="mt-10 max-w-sm lg:col-span-4 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-w-none">
          <div className="overflow-hidden rounded-[4px] bg-surface">
            <Media item={portrait} alt="Nick Johnson" sizes="(min-width: 1024px) 380px, 384px" priority />
          </div>
        </div>
      ) : null}

      <div className="lg:col-span-6 lg:col-start-6 lg:row-start-2">
        <ProfileSection title="Experience">
          {experience.map((item) => (
            <li key={`${item.role}-${item.dates}`} className="border-b border-line py-4">
              <div className="flex flex-col justify-between gap-x-6 sm:flex-row sm:items-baseline">
                <p className="text-body font-medium text-ink">{item.role}</p>
                <p className="text-small tabular-nums text-ink-3">{item.dates}</p>
              </div>
              <p className="text-small text-ink-2">{item.company}</p>
              {item.summary ? <p className="mt-2 max-w-[36rem] text-small text-ink-2">{item.summary}</p> : null}
            </li>
          ))}
        </ProfileSection>

        <ProfileSection title="Education">
          {education.map((item) => (
            <li key={item.degree} className="border-b border-line py-4">
              <p className="text-body font-medium text-ink">{item.degree}</p>
              <p className="text-small text-ink-2">{item.institution}</p>
              <p className="text-small text-ink-2">{item.detail}</p>
            </li>
          ))}
        </ProfileSection>

        <ProfileSection title="Contact">
          {contact.map((item) => (
            <li key={item.label} className="border-b border-line">
              <a
                href={item.href}
                {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group flex items-baseline justify-between gap-6 py-4 outline-offset-[-2px]"
              >
                <span className="text-small text-ink-2">{item.label}</span>
                <span className="text-body text-ink underline decoration-line-strong decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] duration-quick ease-out group-hover:decoration-ink">
                  {item.value}
                </span>
              </a>
            </li>
          ))}
        </ProfileSection>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 sm:mt-16">
      <h2 className="border-b border-line pb-3 text-small font-medium text-ink">{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}
