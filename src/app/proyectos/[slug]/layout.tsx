import type { Metadata } from "next";
import { getProjectBySlug, projects } from "@/config/data";
import { SITE, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Proyecto no encontrado" };
  }

  const url = `${SITE_URL}/proyectos/${project.slug}`;

  return {
    title: `${project.title} — ${project.headline}`,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.title} — Rafael Oviedo`,
      description: project.headline,
      url,
      siteName: SITE.brand,
      type: "article",
    },
  };
}

export default async function ProjectSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  // Per-project structured data so assistants and search engines can quote it.
  const jsonLd = project
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        headline: project.headline,
        description: project.description,
        url: `${SITE_URL}/proyectos/${project.slug}`,
        creator: { "@type": "Person", name: SITE.name, url: SITE_URL },
        author: { "@type": "Person", name: SITE.name, url: SITE_URL },
        about: project.tags,
        keywords: project.tags.join(", "),
        ...(project.liveUrl ? { sameAs: [project.liveUrl] } : {}),
        ...(project.image ? { image: `${SITE_URL}${project.image}` } : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {children}
    </>
  );
}
