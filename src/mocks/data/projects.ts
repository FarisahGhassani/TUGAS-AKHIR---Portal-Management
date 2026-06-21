import type { Project } from "@/store/api/projectsApi";

export const projects: Project[] = [
  {
    id: "p-aurora-ss25",
    slug: "aurora-ss25-campaign",
    title: "AURORA · SS25 CAMPAIGN",
    event: "PARIS FASHION WEEK",
    type: "other",
    date: "2025-03-04",
    dateLabel: "March 2025",
    cover:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&h=800&q=80",
    coverAlt:
      "Beauty close-up from the Aurora SS25 campaign under luminous studio light.",
    coverWidth: 1200,
    coverHeight: 800,
    collaborators: [
      { name: "Lena Vossberg", role: "Photographer" },
      { name: "Anya Taylor", role: "Model" },
      { name: "Studio Noir", role: "Styling" },
    ],
  },
  {
    id: "p-concrete-bloom",
    slug: "concrete-bloom-editorial",
    title: "CONCRETE BLOOM",
    event: "DAZED DIGITAL FEATURE",
    type: "photoshoot",
    date: "2025-02-12",
    dateLabel: "February 2025",
    cover:
      "https://images.unsplash.com/photo-1496360166961-10a51d5f367a?auto=format&fit=crop&w=1000&h=1250&q=80",
    coverAlt:
      "Editorial portrait against a brutalist concrete wall for the Concrete Bloom story.",
    coverWidth: 1000,
    coverHeight: 1250,
    collaborators: [
      { name: "Sofia Lorenz", role: "Model" },
      { name: "Mateo Ruiz", role: "Photographer" },
      { name: "Iris Halim", role: "Makeup" },
    ],
  },
  {
    id: "p-nocturne-runway",
    slug: "nocturne-runway-show",
    title: "NOCTURNE",
    event: "JAKARTA FASHION WEEK",
    type: "event",
    date: "2025-01-28",
    dateLabel: "January 2025",
    cover:
      "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=1280&h=720&q=80",
    coverAlt:
      "Runway moment from the Nocturne show shot in dramatic low light.",
    coverWidth: 1280,
    coverHeight: 720,
    collaborators: [
      { name: "Atelier Noir", role: "Designer" },
      { name: "Julian Vance", role: "Model" },
      { name: "Portal Cast", role: "Casting" },
    ],
  },
  {
    id: "p-luminous-beauty",
    slug: "luminous-beauty-campaign",
    title: "LUMINOUS",
    event: "AURÉOLE BEAUTY LAUNCH",
    type: "other",
    date: "2024-12-09",
    dateLabel: "December 2024",
    cover:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1200&q=80",
    coverAlt:
      "Soft beauty campaign portrait for the Auréole Beauty launch.",
    coverWidth: 900,
    coverHeight: 1200,
    collaborators: [
      { name: "Elena Rust", role: "Model" },
      { name: "Camille Bduo", role: "Photographer" },
      { name: "House of Auréole", role: "Brand" },
    ],
  },
  {
    id: "p-chiaroscuro",
    slug: "chiaroscuro-editorial",
    title: "CHIAROSCURO",
    event: "i-D MAGAZINE",
    type: "photoshoot",
    date: "2024-11-21",
    dateLabel: "November 2024",
    cover:
      "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?auto=format&fit=crop&w=800&h=1200&q=80",
    coverAlt:
      "Editorial portrait in dramatic single-source light for the Chiaroscuro story.",
    coverWidth: 800,
    coverHeight: 1200,
    collaborators: [
      { name: "Kiah Winters", role: "Model" },
      { name: "Noor Aziz", role: "Photographer" },
      { name: "Studio Grain", role: "Set Design" },
    ],
  },
  {
    id: "p-monochrome-muse",
    slug: "monochrome-muse-editorial",
    title: "MONOCHROME MUSE",
    event: "VOGUE ITALIA",
    type: "photoshoot",
    date: "2024-10-15",
    dateLabel: "October 2024",
    cover:
      "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1000&h=1250&q=80",
    coverAlt:
      "Black and white editorial in voluminous monochrome garments.",
    coverWidth: 1000,
    coverHeight: 1250,
    collaborators: [
      { name: "Elena Rostova", role: "Model" },
      { name: "Gio Ferraro", role: "Photographer" },
      { name: "Maison Arno", role: "Wardrobe" },
    ],
  },
  {
    id: "p-glasshouse",
    slug: "glasshouse-campaign",
    title: "GLASSHOUSE",
    event: "MAISON ROUGE · SS25",
    type: "other",
    date: "2024-09-30",
    dateLabel: "September 2024",
    cover:
      "https://images.unsplash.com/photo-1484608856193-968d2be4080e?auto=format&fit=crop&w=1200&h=800&q=80",
    coverAlt:
      "Campaign image in a sculptural red coat for the Glasshouse project.",
    coverWidth: 1200,
    coverHeight: 800,
    collaborators: [
      { name: "Claire Foy", role: "Model" },
      { name: "Lena Vossberg", role: "Photographer" },
      { name: "Maison Rouge", role: "Brand" },
    ],
  },
  {
    id: "p-tailored-light",
    slug: "tailored-light-editorial",
    title: "TAILORED LIGHT",
    event: "GQ STYLE",
    type: "photoshoot",
    date: "2024-08-18",
    dateLabel: "August 2024",
    cover:
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&h=1200&q=80",
    coverAlt:
      "Editorial photograph styled in classic tailoring for the Tailored Light story.",
    coverWidth: 900,
    coverHeight: 1200,
    collaborators: [
      { name: "Marcus Dean", role: "Model" },
      { name: "Theo Marsh", role: "Photographer" },
      { name: "Arno Homme", role: "Styling" },
    ],
  },
];

export function listProjects(params?: { search?: string; type?: string }) {
  return projects
    .filter((p) => {
      if (
        params?.search &&
        !`${p.title} ${p.event}`
          .toLowerCase()
          .includes(params.search.toLowerCase())
      ) {
        return false;
      }
      if (params?.type && params.type !== "all" && p.type !== params.type) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
