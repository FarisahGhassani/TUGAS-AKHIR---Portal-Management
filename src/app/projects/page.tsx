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
      <main className="flex-grow pt-4 md:pt-5 pb-12">
        {/* Header editorial masthead, aligned with the Talents page. Judul &
            kategori disejajarkan pada satu baris supaya bagian atas ringkas dan
            deretan foto bisa naik lebih tinggi. */}
        <header className="px-margin-mobile md:px-margin-desktop max-w-editorial mx-auto w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary uppercase leading-[0.95]">
                OUR PROJECTS
              </h1>

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

            {/* Subtitle sebaris dengan penanda scroll — panah menyodok ke kanan
                sebagai isyarat halus bahwa galeri bisa digeser (tanpa teks
                jumlah project, biar bersih). */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-body-md text-secondary max-w-md">
                Portal Management projects portofolio
              </p>
              <span
                aria-label="Scroll sideways to see more projects"
                className="scroll-hint-arrow hidden md:inline-flex shrink-0 text-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="square" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </header>

        {/* Gallery — horizontal editorial strip */}
        <section className="mt-4 md:mt-6">
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
