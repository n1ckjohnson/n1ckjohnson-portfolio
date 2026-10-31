import { contact } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="page mt-28 sm:mt-40">
      <div className="flex flex-col gap-4 border-t border-line pb-10 pt-6 text-small sm:flex-row sm:items-center sm:justify-between sm:pb-12">
        <p className="text-ink-2">Nick Johnson</p>
        <ul className="-ml-2 flex flex-wrap items-center sm:-mr-2 sm:ml-0">
          {contact.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="pressable inline-flex rounded-md px-2 py-1.5 text-ink-2 hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
