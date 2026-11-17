import Link from "next/link";
import { about, education, experience, identity } from "@/content/profile";
import { RevealImage } from "@/components/media/reveal-image";
import { MoreInfo } from "@/components/site/more-info";
import { MoreProjects } from "@/components/site/more-projects";
import { listProjects } from "@/lib/creative-technology/projects";
import { publicEntries, workHref } from "@/lib/portfolio";
import { findMedia, workDir } from "@/lib/media";

/**
 * The homepage: a name, one sentence, and a list of projects.
 *
 * Everything else is one step away and opens in place: "More info" under
 * the sentence, and the design work under "More creative projects". No
 * image is shown until a visitor asks for one.
 */
export default function HomePage() {
  const projects = listProjects();

  const work = publicEntries.map((entry) => ({
    slug: entry.slug,
    href: workHref(entry.slug),
    title: entry.title,
    label: entry.label,
    thumb: findMedia(workDir(entry.slug), "thumb") ?? findMedia(workDir(entry.slug), "hero"),
  }));

  return (
    <div className="col pt-10 sm:pt-20">
      <header>
        <h1 className="text-ink">{identity.name}</h1>
        <p className="text-ink-2">{identity.role}</p>
      </header>

      <section id="more-info" className="mt-8 scroll-mt-10" aria-label="About">
        <p>
          I&rsquo;m a designer with the{" "}
          <a href={identity.employer.href} target="_blank" rel="noreferrer" className="link">
            {identity.employer.name}
          </a>
          , working on fan-facing creative and the production systems behind it.
        </p>

        <MoreInfo>
          <p className="pt-4">{about}</p>

          <h2 className="label mt-8">Experience</h2>
          {experience.map((place) => (
            <div key={place.organization} className="mt-3">
              <p>
                {place.organization} <span className="text-ink-2">{place.dates}</span>
              </p>
              <ol className="progression mt-2.5">
                {place.roles.map((item) => (
                  <li key={item.role}>
                    <p>{item.role}</p>
                    <p className="text-ink-2">{item.dates}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <h2 className="label mt-8">Education</h2>
          <ul className="mt-3">
            {education.map((item) => (
              <li key={item.school} className="record">
                <p>{item.school}</p>
                <p className="text-ink-2">{item.degree}</p>
                {item.detail ? <p className="text-ink-2">{item.detail}</p> : null}
                {item.dates ? <p className="text-ink-2">{item.dates}</p> : null}
              </li>
            ))}
          </ul>
        </MoreInfo>
      </section>

      <section className="spaced" aria-labelledby="creative-technology">
        <h2 id="creative-technology" className="label">
          Creative technology
        </h2>
        <ul className="links links--ruled mt-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={project.href}>{project.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="design" className="spaced scroll-mt-10">
        <MoreProjects title="More creative projects">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-7 pt-5 sm:gap-x-5 sm:gap-y-8">
            {work.map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="group block rounded-s">
                  <span className="relative block aspect-video overflow-hidden rounded-s bg-surface">
                    {item.thumb ? (
                      <RevealImage
                        src={item.thumb.src}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 280px, 45vw"
                        className="object-cover transition-opacity duration-base ease-out group-hover:opacity-90"
                      />
                    ) : null}
                  </span>
                  <span className="mt-2.5 block text-small text-ink">{item.title}</span>
                  <span className="block text-small text-ink-2">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </MoreProjects>
      </section>
    </div>
  );
}
