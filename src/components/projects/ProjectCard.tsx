import Image from "next/image";
import type { Project } from "@/store/api/projectsApi";

// Tinggi kartu seragam (lewat --proj-card-h); lebar = tinggi × rasio asli
// gambar. Jadi portrait/landscape tampil apa adanya — saat di-slide ke kanan
// hanya lebarnya yang berbeda, tinggi tetap sama.
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const ratio = project.coverWidth / project.coverHeight;

  return (
    <figure
      className="group flex flex-col [--proj-card-h:340px] md:[--proj-card-h:60vh]"
      style={{ width: `calc(var(--proj-card-h) * ${ratio})` }}
    >
      <div className="relative h-[var(--proj-card-h)] w-full overflow-hidden bg-surface-container">
        <Image
          src={project.cover}
          alt={project.coverAlt}
          fill
          sizes="(min-width: 768px) 60vw, 85vw"
          className="object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 font-display text-caption tracking-widest text-on-primary mix-blend-difference">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <figcaption className="mt-5 flex flex-col">
        <div className="flex items-baseline justify-between gap-6">
          <span className="text-label-uppercase uppercase text-accent">
            {project.event}
          </span>
          <time
            dateTime={project.date}
            className="shrink-0 text-label-uppercase uppercase text-secondary"
          >
            {project.dateLabel}
          </time>
        </div>

        <h3 className="mt-3 font-display text-headline-md uppercase leading-[0.95] text-primary">
          {project.title}
        </h3>

        {project.collaborators.length > 0 && (
          <dl className="mt-4 border-t border-outline-variant pt-3 text-caption">
            <dt className="mb-1.5 text-label-uppercase uppercase text-on-surface-variant">
              With
            </dt>
            <dd className="flex flex-col gap-1 text-secondary">
              {project.collaborators.map((c) => (
                <span key={`${c.name}-${c.role}`} className="flex justify-between gap-4">
                  <span className="text-primary">{c.name}</span>
                  <span className="text-on-surface-variant">{c.role}</span>
                </span>
              ))}
            </dd>
          </dl>
        )}
      </figcaption>
    </figure>
  );
}
