import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityDetailView } from "@/components/public/activities/ActivityDetailView";
import { JsonLd } from "@/components/public/seo/JsonLd";

type ActivityDetailPageProps = {
  params: Promise<{ id: string }>;
};

type ActivityDetail = {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  location: string;
  park_name: string;
  images?: string[];
  created_at: string;
  updated_at: string;
};

async function getActivityById(id: string): Promise<ActivityDetail> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://103.125.91.16";
  const response = await fetch(`${API_BASE_URL}/api/public/activities/${id}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activity: ${response.status}`);
  }

  return response.json();
}

export async function generateMetadata({
  params,
}: ActivityDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const activity = await getActivityById(id);
    return {
      title: `${activity.title} | Kegiatan Taman Kehati`,
      description:
        activity.description?.slice(0, 150) ??
        "Detail kegiatan dari portal Taman Kehati.",
      openGraph: {
        title: activity.title,
        description: activity.description?.slice(0, 150),
        images:
          activity.images && activity.images.length > 0
            ? [{ url: activity.images[0] }]
            : undefined,
      },
    };
  } catch {
    return {
      title: "Kegiatan Taman Kehati",
      description: "Detail kegiatan dari portal Taman Kehati.",
    };
  }
}

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  try {
    const { id } = await params;
    console.log("Fetching activity with ID:", id);
    const activity = await getActivityById(id);
    console.log("Activity fetched:", activity);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tamankehati.id";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: activity.title,
      description: activity.description,
      startDate: activity.activity_date,
      location: {
        "@type": "Place",
        name: activity.location,
      },
      organizer: {
        "@type": "Organization",
        name: activity.park_name,
      },
      image:
        activity.images && activity.images.length > 0
          ? activity.images[0]
          : undefined,
      url: `${siteUrl}/kegiatan/${activity.id}`,
    };

    return (
      <section className="bg-[var(--bg,#f8f7f5)] py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <JsonLd data={jsonLd} />
          <ActivityDetailView activity={activity} />
        </div>
      </section>
    );
  } catch (error) {
    console.error("Activity detail not found", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    notFound();
  }
}
