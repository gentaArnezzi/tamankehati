import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden min-h-screen w-full -mt-20 pt-20">
      <Image
        src="/home/hero.jpg"
        alt="Taman Kehati Indonesia - Keanekaragaman Hayati dengan papan jalan kayu melintasi hutan tropis yang subur dengan bunga-bunga berwarna-warni dan burung macaw"
        fill
        className="object-cover"
        priority
      />

      {/* Dark black overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Subtle bottom overlay with standard dark brown */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-transparent" />

      <div className="relative flex min-h-screen w-full items-center">
        <div className="container mx-auto max-w-7xl px-6 py-40 md:py-48">
          <div className="max-w-4xl space-y-8">
            <h1 className="text-balance text-5xl font-light leading-tight text-white md:text-7xl lg:text-8xl">
              Portal Keanekaragaman Hayati Indonesia
            </h1>
            <p className="text-xl leading-relaxed text-amber-50 md:text-2xl max-w-3xl">
              Jelajahi data flora, fauna, dan taman konservasi dari seluruh
              nusantara. Dukung riset, edukasi, dan aksi konservasi berdampak
              melalui satu sumber data terpadu.
            </p>

            <div className="flex flex-col gap-6 pt-8 sm:flex-row sm:items-center">
              <Link
                href="/flora"
                className="inline-flex items-center justify-center rounded-full bg-amber-800 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-900 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-lg"
              >
                Jelajahi Flora
              </Link>
              <Link
                href="/taman"
                className="inline-flex items-center justify-center rounded-full border-2 border-amber-200/30 bg-amber-950/20 px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-900/30 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white backdrop-blur-sm"
              >
                Lihat Peta Taman
              </Link>
              <Link
                href="/artikel"
                className="inline-flex items-center justify-center rounded-full border-2 border-amber-100/20 bg-transparent px-10 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-900/20 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Baca Artikel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Company Logos Section */}
      <div className="absolute bottom-20 left-0 right-0 z-10">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-8">
            <p className="text-green-100 text-sm font-medium tracking-wide uppercase">
              Didukung oleh
            </p>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-2 items-center justify-center gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 md:px-8 lg:grid-cols-8">
            <img
              title="Google"
              alt="Google"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale h-4 md:h-10"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/google.webp 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/google.webp 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/google.webp"
              style={{ color: "transparent" }}
            />
            <img
              title="Microsoft"
              alt="Microsoft"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale h-8 md:h-12"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/microsoft.png 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/microsoft.png 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/microsoft.png"
              style={{ color: "transparent" }}
            />
            <img
              title="Cisco"
              alt="Cisco"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale h-8 md:h-10"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/cisco.png 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/cisco.png 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/cisco.png"
              style={{ color: "transparent" }}
            />
            <img
              title="Zomato"
              alt="Zomato"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale h-4 md:h-10"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/zomato.png 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/zomato.png 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/zomato.png"
              style={{ color: "transparent" }}
            />
            <img
              title="Better Auth"
              alt="Better Auth"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale md:h-10 filter invert dark:invert-0 h-10 w-40"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/better-auth.png 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/better-auth.png 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/better-auth.png"
              style={{ color: "transparent" }}
            />
            <img
              title="Great Frontend"
              alt="Great Frontend"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale md:h-10 filter dark:invert w-40 h-10"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/greatfrontend.png 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/greatfrontend.png 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/greatfrontend.png"
              style={{ color: "transparent" }}
            />
            <img
              title="Strapi"
              alt="Strapi"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale filter invert dark:invert-0 h-4 md:h-10"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/strapi.svg 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/strapi.svg 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/strapi.svg"
              style={{ color: "transparent" }}
            />
            <img
              title="Neon Database"
              alt="Neon Database"
              loading="lazy"
              width="120"
              height="120"
              decoding="async"
              className="mx-auto aspect-square shrink-0 object-contain grayscale filter invert dark:invert-0 h-4 md:h-6"
              srcSet="https://aceternity.com/cdn-cgi/image/width=128/https://assets.aceternity.com/companies/neon.svg 1x, https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/neon.svg 2x"
              src="https://aceternity.com/cdn-cgi/image/width=256/https://assets.aceternity.com/companies/neon.svg"
              style={{ color: "transparent" }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent" />
    </section>
  );
}
