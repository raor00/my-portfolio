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

export default function ProjectSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
