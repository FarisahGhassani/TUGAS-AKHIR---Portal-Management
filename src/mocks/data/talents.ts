import type { Talent } from "@/store/api/talentApi";

export const talents: Talent[] = [
  {
    id: "t-anya",
    slug: "anya-taylor",
    name: "ANYA TAYLOR",
    bio: "A main-board talent known for her sculptural presence and editorial range — equally at home on the runway and in beauty campaigns. Represented exclusively by Portal Management.",
    division: "main",
    gender: "female",
    categories: ["photoshoot", "runway", "muse-beauty"],
    heightCm: 178,
    heightLabel: "5'10\"",
    cover:
      "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Editorial portrait of model Anya Taylor in a minimalist black turtleneck.",
    thumbAspect: "3/4",
    measurements: {
      tinggiBadan: 178,
      beratBadan: 54,
      sizeBaju: "S",
      sizeSepatu: "40 EU",
    },
    portfolio: [
      {
        id: "anya-1",
        caption: "VOGUE ITALIA",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1600&q=80",
        alt: "Avant-garde editorial photograph of Anya Taylor in voluminous monochrome garments.",
      },
      {
        id: "anya-2",
        caption: "BEAUTY EDITORIAL",
        category: "editorial",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80",
        alt: "Beauty close-up of Anya Taylor with luminous, sculpted lighting.",
      },
      {
        id: "anya-3",
        caption: "MAISON ARNO",
        category: "campaign",
        image:
          "https://images.unsplash.com/photo-1485875437342-9b39470b3d95?auto=format&fit=crop&w=1200&q=80",
        alt: "Campaign image of Anya Taylor in tailored architectural silhouette.",
      },
    ],
  },
  {
    id: "t-julian",
    slug: "julian-vance",
    name: "JULIAN VANCE",
    bio: "A development-board face with a brooding, architectural look. Julian moves fluidly between menswear runway and commercial campaigns.",
    division: "development",
    gender: "male",
    categories: ["photoshoot", "runway", "commercial"],
    heightCm: 185,
    heightLabel: "6'1\"",
    cover:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Moody, dramatic portrait of Julian Vance in a charcoal tailored jacket.",
    thumbAspect: "4/5",
    measurements: {
      tinggiBadan: 185,
      beratBadan: 75,
      sizeBaju: "M",
      sizeSepatu: "44 EU",
    },
    portfolio: [
      {
        id: "julian-1",
        caption: "L'UOMO VOGUE",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1600&q=80",
        alt: "Black and white editorial of Julian Vance under sculptural studio lighting.",
      },
      {
        id: "julian-2",
        caption: "ATELIER NOIR",
        category: "campaign",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=900&q=80",
        alt: "Campaign portrait of Julian Vance in a brutalist concrete environment.",
      },
    ],
  },
  {
    id: "t-sofia",
    slug: "sofia-lorenz",
    name: "SOFIA LORENZ",
    bio: "Sofia brings a commanding runway walk and a versatile editorial range, anchoring campaigns with a quiet, magnetic intensity.",
    division: "main",
    gender: "female",
    categories: ["runway", "photoshoot", "tvc"],
    heightCm: 180,
    heightLabel: "5'11\"",
    cover:
      "https://images.unsplash.com/photo-1530785602389-07594beb8b73?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Editorial color photograph of Sofia Lorenz in an oversized statement coat.",
    thumbAspect: "4/5",
    measurements: {
      tinggiBadan: 180,
      beratBadan: 56,
      sizeBaju: "S",
      sizeSepatu: "40 EU",
    },
    portfolio: [
      {
        id: "sofia-1",
        caption: "DAZED",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1496360166961-10a51d5f367a?auto=format&fit=crop&w=1600&q=80",
        alt: "Editorial outdoor image of Sofia Lorenz against a brutalist concrete wall.",
      },
      {
        id: "sofia-2",
        caption: "MAISON ROUGE — SS25",
        category: "campaign",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1484608856193-968d2be4080e?auto=format&fit=crop&w=900&q=80",
        alt: "Campaign image of Sofia Lorenz in a sculptural red coat.",
      },
    ],
  },
  {
    id: "t-elena-rust",
    slug: "elena-rust",
    name: "ELENA RUST",
    bio: "A commercial favourite whose luminous beauty work and warm on-camera presence make her a natural fit for TVC and brand campaigns.",
    division: "commercial",
    gender: "female",
    categories: ["commercial", "tvc", "muse-beauty"],
    heightCm: 175,
    heightLabel: "5'9\"",
    cover:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Beauty close-up of Elena Rust with glossy makeup and slicked-back hair.",
    thumbAspect: "3/4",
    measurements: {
      tinggiBadan: 175,
      beratBadan: 53,
      sizeBaju: "S",
      sizeSepatu: "39 EU",
    },
    portfolio: [
      {
        id: "elena-rust-1",
        caption: "AURÉOLE BEAUTY",
        category: "campaign",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80",
        alt: "Soft beauty campaign photograph of Elena Rust.",
      },
      {
        id: "elena-rust-2",
        caption: "ALLURE",
        category: "editorial",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80",
        alt: "Beauty editorial portrait of Elena Rust with directional studio light.",
      },
    ],
  },
  {
    id: "t-marcus",
    slug: "marcus-dean",
    name: "MARCUS DEAN",
    bio: "Marcus pairs classic tailoring proportions with an easy commercial appeal, spanning editorial, campaign, and TVC work.",
    division: "main",
    gender: "male",
    categories: ["photoshoot", "commercial", "tvc"],
    heightCm: 188,
    heightLabel: "6'2\"",
    cover:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Black and white portrait of Marcus Dean in a minimalist white t-shirt.",
    thumbAspect: "3/4",
    measurements: {
      tinggiBadan: 188,
      beratBadan: 78,
      sizeBaju: "L",
      sizeSepatu: "45 EU",
    },
    portfolio: [
      {
        id: "marcus-1",
        caption: "GQ STYLE",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1600&q=80",
        alt: "Editorial photograph of Marcus Dean styled in classic tailoring.",
      },
      {
        id: "marcus-2",
        caption: "ARNO HOMME",
        category: "campaign",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80",
        alt: "Campaign image of Marcus Dean shot under hard studio light.",
      },
    ],
  },
  {
    id: "t-kiah",
    slug: "kiah-winters",
    name: "KIAH WINTERS",
    bio: "A development talent with a striking, gender-fluid aesthetic that thrives under dramatic light — runway and beauty alike.",
    division: "development",
    gender: "non-binary",
    categories: ["runway", "photoshoot", "muse-beauty"],
    heightCm: 178,
    heightLabel: "5'10\"",
    cover:
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Striking profile shot of Kiah Winters lit with hard chiaroscuro.",
    thumbAspect: "1/1",
    measurements: {
      tinggiBadan: 178,
      beratBadan: 55,
      sizeBaju: "S",
      sizeSepatu: "40 EU",
    },
    portfolio: [
      {
        id: "kiah-1",
        caption: "I-D",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?auto=format&fit=crop&w=1600&q=80",
        alt: "Editorial portrait of Kiah Winters in dramatic single-source light.",
      },
      {
        id: "kiah-2",
        caption: "MAISON NEÏ",
        category: "campaign",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1488508872907-592763824245?auto=format&fit=crop&w=900&q=80",
        alt: "Campaign portrait of Kiah Winters.",
      },
    ],
  },
  {
    id: "t-claire",
    slug: "claire-foy",
    name: "CLAIRE FOY",
    bio: "Claire's platinum, high-fashion look has fronted runway and campaign work across the European market.",
    division: "main",
    gender: "female",
    categories: ["runway", "photoshoot", "commercial"],
    heightCm: 181,
    heightLabel: "5'11.5\"",
    cover:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "Full body editorial of Claire Foy in a structured black dress against modern architecture.",
    thumbAspect: "4/5",
    measurements: {
      tinggiBadan: 181,
      beratBadan: 57,
      sizeBaju: "S",
      sizeSepatu: "40 EU",
    },
    portfolio: [
      {
        id: "claire-1",
        caption: "VOGUE PARIS",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80",
        alt: "Editorial portrait of Claire Foy in a sculpted silhouette.",
      },
      {
        id: "claire-2",
        caption: "ATELIER ARNO",
        category: "campaign",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=900&q=80",
        alt: "Campaign image of Claire Foy in glass-and-steel architecture.",
      },
    ],
  },
  {
    id: "t-elena-rostova",
    slug: "elena-rostova",
    name: "ELENA ROSTOVA",
    bio: "A main-board talent whose sharp features and intense gaze define a refined editorial and beauty portfolio.",
    division: "main",
    gender: "female",
    categories: ["photoshoot", "muse-beauty", "runway"],
    heightCm: 180,
    heightLabel: "5'11\"",
    cover:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    coverAlt:
      "High-key editorial portrait of Elena Rostova with sharp cheekbones and intense gaze.",
    thumbAspect: "4/5",
    measurements: {
      tinggiBadan: 180,
      beratBadan: 56,
      sizeBaju: "S",
      sizeSepatu: "40 EU",
    },
    portfolio: [
      {
        id: "elena-rostova-1",
        caption: "VOGUE ITALIA",
        category: "editorial",
        span: "wide",
        image:
          "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1600&q=80",
        alt: "Black and white editorial of Elena Rostova in voluminous garments.",
      },
      {
        id: "elena-rostova-2",
        caption: "BEAUTY EDITORIAL",
        category: "editorial",
        span: "tall",
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
        alt: "Close-up beauty shot of Elena Rostova with luminous lighting.",
      },
    ],
  },
];

export function listTalents(params?: {
  search?: string;
  division?: string;
  gender?: string;
  category?: string;
  minHeightCm?: number;
}) {
  return talents.filter((t) => {
    if (
      params?.search &&
      !t.name.toLowerCase().includes(params.search.toLowerCase())
    ) {
      return false;
    }
    if (
      params?.division &&
      params.division !== "all" &&
      t.division !== params.division
    ) {
      return false;
    }
    if (
      params?.gender &&
      params.gender !== "all" &&
      t.gender !== params.gender
    ) {
      return false;
    }
    if (
      params?.category &&
      params.category !== "all" &&
      !t.categories.includes(params.category as Talent["categories"][number])
    ) {
      return false;
    }
    if (params?.minHeightCm && t.heightCm < params.minHeightCm) {
      return false;
    }
    return true;
  });
}

export function findTalentBySlug(slug: string) {
  return talents.find((t) => t.slug === slug);
}
