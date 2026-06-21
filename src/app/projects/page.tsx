"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  useGetProjectsQuery,
  type ProjectType,
} from "@/store/api/projectsApi";

const filters: { label: string; value: ProjectType | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "EVENTS", value: "event" },
  { label: "PHOTOSHOOTS", value: "photoshoot" },
  { label: "OTHERS", value: "other" },
];

export default function ProjectsPage() {
  const [type, setType] = useState<ProjectType | "all">("all");

  const { data, isFetching, isError } = useGetProjectsQuery({ type });
  const projects = data ?? [];

  return (
    <>
      <NavBar />
      <main className="flex-grow pt-6 md:pt-8 pb-12">
        {/* Header — editorial masthead, aligned with the Talents page */}
        <header className="px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto w-full">

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
                <span className="block">OUR</span>
                <span className="block">PROJECTS</span>
              </h1>
              <p className="text-body-md text-secondary mt-6 max-w-md">
                Portal Management projects portofolio
              </p>
            </div>

            <nav
              aria-label="Filter projects by type"
              className="flex flex-wrap gap-3 text-label-uppercase"
            >
              {filters.map((f) => {
                const active = type === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setType(f.value)}
                    className={`uppercase px-5 py-3 border transition-colors ${active
                        ? "bg-accent text-on-accent border-accent"
                        : "text-secondary border-outline-variant hover:border-accent hover:text-accent"
                      }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-4 text-label-uppercase uppercase text-on-surface-variant">
            <span>{String(projects.length).padStart(2, "0")} Projects</span>
            <span className="hidden md:inline">Scroll →</span>
          </div>
        </header>

        {/* Gallery — horizontal editorial strip */}
        <section className="mt-6 md:mt-8">
          {isError ? (
            <p className="px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto text-label-uppercase text-error uppercase">
              Failed to load projects.
            </p>
          ) : isFetching && !data ? (
            <p className="px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto text-label-uppercase text-on-surface-variant uppercase">
              Loading projects…
            </p>
          ) : projects.length === 0 ? (
            <p className="px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto text-label-uppercase text-on-surface-variant uppercase">
              No projects match this filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <ul className="flex items-start gap-gutter md:gap-12 px-margin-mobile md:px-margin-desktop pb-4 w-max">
                {projects.map((project, i) => (
                  <li key={project.id} className="shrink-0">
                    <ProjectCard project={project} index={i} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
