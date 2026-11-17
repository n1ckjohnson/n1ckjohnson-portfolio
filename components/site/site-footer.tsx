import { contact, home } from "@/content/profile";
import { LocalClock } from "@/components/site/local-clock";

/**
 * One row at the bottom of every page: the time in Jacksonville on the
 * left, and how to reach me on the right. On a phone the two wrap onto
 * separate lines.
 */
export function SiteFooter() {
  return (
    <footer className="col mt-24 sm:mt-32">
      <div className="footer">
        <LocalClock timeZone={home.timeZone} place={home.city} />
        <ul className="footer__links">
          {contact.map((item) => (
            <li key={item.label}>
              <a href={item.href} {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
