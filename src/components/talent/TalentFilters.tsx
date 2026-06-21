"use client";

import type {
  TalentGender,
  TalentWorkCategory,
} from "@/store/api/talentApi";

const genders: { label: string; value: TalentGender | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "FEMALE", value: "female" },
  { label: "MALE", value: "male" },
];

const categories: { label: string; value: TalentWorkCategory | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "PHOTOSHOOT", value: "photoshoot" },
  { label: "RUNWAY", value: "runway" },
  { label: "TVC", value: "tvc" },
  { label: "COMMERCIAL", value: "commercial" },
  { label: "MUSE / BEAUTY", value: "muse-beauty" },
];

const selectClass =
  "w-full bg-transparent border-b border-outline-variant text-primary text-label-uppercase uppercase py-2 focus:outline-none focus:border-accent cursor-pointer transition-colors";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  gender: TalentGender | "all";
  onGenderChange: (value: TalentGender | "all") => void;
  category: TalentWorkCategory | "all";
  onCategoryChange: (value: TalentWorkCategory | "all") => void;
};

export function TalentFilters({
  search,
  onSearchChange,
  gender,
  onGenderChange,
  category,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <div className="relative border-b border-outline-variant">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="square" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="SEARCH TALENT…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-0 outline-none text-label-uppercase text-primary placeholder:text-secondary pl-7 py-3 uppercase tracking-[0.15em]"
        />
      </div>

      {/* Active scope */}
      <span className="self-start text-label-uppercase uppercase text-primary border-b-2 border-accent pb-1">
        ALL
      </span>

      {/* Gender */}
      <label className="flex flex-col gap-3">
        <span className="text-label-uppercase text-secondary uppercase">
          GENDER
        </span>
        <select
          value={gender}
          onChange={(e) =>
            onGenderChange(e.target.value as TalentGender | "all")
          }
          className={selectClass}
        >
          {genders.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </label>

      {/* Category */}
      <label className="flex flex-col gap-3">
        <span className="text-label-uppercase text-secondary uppercase">
          CATEGORY
        </span>
        <select
          value={category}
          onChange={(e) =>
            onCategoryChange(e.target.value as TalentWorkCategory | "all")
          }
          className={selectClass}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
