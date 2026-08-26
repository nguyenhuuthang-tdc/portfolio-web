import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectBySlug,
  getProjectMdxComponent,
  getProjects,
} from "@/lib/content/projects";
import { CmsMarkdown } from "@/components/article/CmsMarkdown";
import type { Metadata } from "next";
import { mediaUrl } from "@/lib/media";
import {
  absoluteUrl,
  OWNER_NAME,
  serializeJsonLd,
  SITE_NAME,
  SITE_URL,
  socialImageUrl,
} from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.filter((p) => p.hasDetail).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
    };
  }

  const url = absoluteUrl(`/projects/${project.slug}`);
  const description = project.description ?? `Explore ${project.title}, a project by ${OWNER_NAME}.`;
  const image = socialImageUrl(mediaUrl(project.thumbnail));

  return {
    title: project.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.hasDetail) notFound();
  const ProjectContent = await getProjectMdxComponent(slug);
  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${projectUrl}#project`,
    name: project.title,
    description: project.description ?? undefined,
    url: projectUrl,
    image: socialImageUrl(mediaUrl(project.thumbnail)),
    codeRepository: project.githubUrl ?? undefined,
    programmingLanguage: project.techStack ?? undefined,
    author: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(projectJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mb-8 transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {project.title}
            </h1>
            {project.demoUrl && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {project.description && (
            <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed mb-6">
              {project.description}
            </p>
          )}

          {/* Tech stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Live Demo →
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-medium transition-colors"
              >
                GitHub →
              </a>
            )}
          </div>
        </header>

        {project.detailContent ? (
          <CmsMarkdown>{project.detailContent}</CmsMarkdown>
        ) : ProjectContent ? (
          <article className="max-w-none">
            <ProjectContent />
          </article>
        ) : null}
      </div>
    </div>
  );
}
