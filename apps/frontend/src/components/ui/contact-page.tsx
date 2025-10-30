"use client";

import React from "react";
import Image from "next/image";
import { cn } from "./utils";
import {
  Check,
  Copy,
  LucideIcon,
  Mail,
  MapPin,
  InstagramIcon,
  Globe,
  Video,
  Twitter,
  Youtube,
  Facebook,
} from "lucide-react";
import { Button, ButtonProps } from "./button";

const APP_EMAIL = "info@tamankehati.id";
const KEMEN_WEB = "https://kementh.go.id";

export function ContactPage() {
  const socialLinks = [
    {
      icon: InstagramIcon,
      href: "https://instagram.com/kementh_bplh",
      label: "Instagram",
    },
    {
      icon: Video,
      href: "https://tiktok.com/@kementh_bpth",
      label: "TikTok",
    },
    {
      icon: Twitter,
      href: "https://x.com/kementh_bplh",
      label: "X (Twitter)",
    },
    {
      icon: Youtube,
      href: "https://youtube.com/@IKLH-BPLH",
      label: "YouTube",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/Kementerian-LH",
      label: "Facebook",
    },
  ];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/tamankehati_images/task_01k8angzzmfe5ac3a35w4vqnft_1761294822_img_1.webp"
            alt="Kontak Taman Kehati"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-light leading-tight text-white mb-6 md:text-6xl">
                Hubungi Kami
              </h1>
              <p className="text-xl leading-relaxed text-white/90 mb-8 max-w-2xl">
                Taman Kehati Indonesia adalah pusat konservasi dan penelitian
                keanekaragaman hayati terbesar di Indonesia. Kunjungi lokasi
                kami di Jakarta untuk melihat koleksi flora dan fauna endemik,
                atau hubungi kami untuk informasi lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto h-full max-w-6xl lg:border-x">
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-80 contain-strict"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
        </div>
        <div className="flex grow flex-col justify-center px-4 md:px-6 pt-40 pb-24">
          <h1 className="text-4xl font-light md:text-5xl">Informasi Kontak</h1>
          <p className="text-muted-foreground mb-5 text-base">
            Mari bergabung dalam misi konservasi keanekaragaman hayati
            Indonesia. Tim ahli kami siap membantu Anda dengan penelitian,
            edukasi, dan program konservasi terbaik.
          </p>
        </div>
        <BorderSeparator />
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <Box
            icon={Mail}
            title="Email"
            description="Kami merespons semua email dalam 24 jam."
          >
            <a
              href={`mailto:${APP_EMAIL}`}
              className="font-mono text-base font-medium tracking-wide hover:underline"
            >
              {APP_EMAIL}
            </a>
            <CopyButton className="size-6" test={APP_EMAIL} />
          </Box>
          <Box
            icon={MapPin}
            title="Lokasi"
            description="Kunjungi kantor kami untuk bertemu langsung."
          >
            <span className="font-mono text-base font-medium tracking-wide">
              Jl. Keanekaragaman Hayati No. 123, Jakarta Pusat, DKI Jakarta
              10110, Indonesia
            </span>
          </Box>
          <Box
            icon={Globe}
            title="Website Resmi"
            description="Akses informasi lengkap di website Kementerian LH."
          >
            <a
              href={KEMEN_WEB}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-base font-medium tracking-wide hover:underline text-blue-600"
            >
              kementh.go.id
            </a>
          </Box>
        </div>
        <BorderSeparator />
        <div className="relative flex h-full min-h-[400px] items-center justify-center py-20">
          <div
            className={cn(
              "z--10 absolute inset-0 size-full",
              "bg-[radial-gradient(color-mix(in_oklab,var(--foreground)30%,transparent)_1px,transparent_1px)]",
              "bg-[size:32px_32px]",
              "[mask-image:radial-gradient(ellipse_at_center,var(--background)_30%,transparent)]",
            )}
          />

          <div className="relative z-1 space-y-6">
            <h2 className="text-center text-3xl font-light md:text-4xl">
              Ikuti Kami
            </h2>
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-muted/50 hover:bg-accent flex items-center gap-x-2 rounded-full border px-4 py-2"
                >
                  <link.icon className="size-4" />
                  <span className="font-mono text-sm font-medium tracking-wide">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BorderSeparator() {
  return <div className="absolute inset-x-0 h-px w-full border-b" />;
}

type ContactBox = React.ComponentProps<"div"> & {
  icon: LucideIcon;
  title: string;
  description: string;
};

function Box({
  title,
  description,
  className,
  children,
  ...props
}: ContactBox) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between border-b md:border-r md:border-b-0",
        className,
      )}
    >
      <div className="bg-muted/40 flex items-center gap-x-3 border-b p-4">
        <props.icon className="text-muted-foreground size-5" strokeWidth={1} />
        <h2 className="font-heading text-lg font-light tracking-wider">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-x-2 p-6 py-16">{children}</div>
      <div className="border-t p-4">
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

type CopyButtonProps = ButtonProps & {
  test: string;
};

function CopyButton({
  className,
  variant = "ghost",
  size = "icon",
  test,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(test);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("disabled:opacity-100", className)}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      disabled={copied || props.disabled}
      {...props}
    >
      <div
        className={cn(
          "transition-all",
          copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
        )}
      >
        <Check className="size-3.5 stroke-emerald-500" aria-hidden="true" />
      </div>
      <div
        className={cn(
          "absolute transition-all",
          copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
        )}
      >
        <Copy aria-hidden="true" className="size-3.5" />
      </div>
    </Button>
  );
}
