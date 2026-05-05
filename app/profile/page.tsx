import { existsSync } from "fs";
import { join } from "path";
import { experience, education, contact } from "@/content/profile";

function detectProfileSrc(): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const filePath = join(process.cwd(), "public", "profile", `profile.${ext}`);
    if (existsSync(filePath)) return `/profile/profile.${ext}`;
  }
  return null;
}

export default function ProfilePage() {
  const profileSrc = detectProfileSrc();

  return (
    <div className="flex min-h-screen w-full overflow-y-auto bg-white px-4 sm:px-5 lg:min-h-0 lg:h-[calc(100svh-3rem)] lg:overflow-hidden lg:px-6">
      <section className="flex flex-1 items-center justify-center py-16 sm:py-20">
        <div className="grid w-full max-w-[84rem] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(14rem,0.65fr)] lg:items-start lg:gap-12">

          {/* Left: name label + image slot */}
          <div className="font-brand">
            {/* Name label — matches homepage hover behavior */}
            <div className="group/name inline-flex items-center text-[10px] uppercase tracking-[0.14em] text-[#141414] sm:text-[11px]">
              <span>[</span>
              <span className="relative mx-[0.5em]">
                <span className="invisible whitespace-nowrap">NICK JOHNSON</span>
                <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap transition-opacity duration-150 ease-linear group-hover/name:opacity-0">
                  NICK JOHNSON
                </span>
                <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap opacity-0 transition-opacity duration-150 ease-linear group-hover/name:opacity-100">
                  N1CKJOHNSON
                </span>
              </span>
              <span>]</span>
            </div>

            {/* Profile image */}
            <div className="mt-5 w-full bg-[#EEECE8]">
              {profileSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileSrc}
                  alt="Nick Johnson"
                  className="w-full h-auto block"
                />
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center">
                  <p className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#B0ADA8]">
                    [ Image ]
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center: Experience + Education */}
          <div className="font-brand">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
              [ Experience ]
            </p>
            <div className="mt-4 space-y-5">
              {experience.map((item) => (
                <article key={`${item.role}-${item.period}`} className="space-y-0.5">
                  <h2 className="font-headline text-[1.02rem] font-semibold leading-[1.08] tracking-[0.01em] text-[#141414] sm:text-[1.08rem]">
                    {item.role}
                  </h2>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B]">
                    {item.company}
                  </p>
                  {item.dates ? (
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#A0A09A] sm:text-[11px]">
                      {item.dates}
                    </p>
                  ) : null}
                  {item.summary ? (
                    <p className="pt-1 text-[13px] leading-[1.6] text-[#3A3836] sm:text-[14px]">
                      {item.summary}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="mt-8 border-t border-[#E8E6E2] pt-8">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
                [ Education ]
              </p>
              <div className="mt-4 space-y-1">
                {education.map((item) => (
                  <div key={item.degree}>
                    <h2 className="font-headline text-[1.02rem] font-semibold leading-[1.08] tracking-[0.01em] text-[#141414]">
                      {item.degree}
                    </h2>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B6B6B]">
                      {item.institution}
                    </p>
                    <p className="pt-1 text-[13px] leading-[1.6] text-[#3A3836]">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact */}
          <div className="font-brand">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] sm:text-[11px]">
              [ Contact ]
            </p>
            <div className="mt-4 space-y-4">
              {contact.map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#A0A09A] sm:text-[11px]">
                    {item.label}
                  </p>
                  <a
                    href={item.href}
                    className="block font-headline text-[1rem] font-semibold tracking-[0.01em] text-[#141414] transition-opacity duration-150 hover:opacity-50"
                  >
                    {item.value}
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
