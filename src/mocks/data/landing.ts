import type { LandingContent } from "@/store/api/landingApi";

export const landingContent: LandingContent = {
  hero: {
    title: "PORTAL MANAGEMENT",
    image:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1800&q=80",
    imageAlt:
      "High-fashion editorial portrait of a model rendered in dramatic black and white.",
    video: "/videos/portal-asset.mp4",
  },
  essence: {
    eyebrow: "OUR ESSENCE",
    body: "Portal Management exists to elevate the art of representation. We are a talent agency dedicated to cultivating high-caliber individuals who define the aesthetic vanguards of tomorrow. Our approach marries rigorous professionalism with an uncompromising eye for editorial excellence.",
    ctaLabel: "DISCOVER MORE",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    imageAlt:
      "Avant-garde editorial fashion photograph featuring a model in an architectural pose under sculptural lighting.",
  },
  capabilities: {
    eyebrow: "CAPABILITIES",
    items: [
      {
        title: "TALENT REPRESENTATION",
        description:
          "Strategic career management for elite models and creatives in the fashion industry.",
      },
      {
        title: "BRAND COLLABORATION",
        description:
          "Connecting visionary brands with the perfect faces to articulate their aesthetic narrative.",
      },
      {
        title: "MODELLING CLASSES",
        description:
          "Rigorous training in runway technique, posing, and industry protocol for emerging talent.",
      },
      {
        title: "EDITORIAL PRODUCTION",
        description:
          "Full-scale production services for high-end fashion shoots and campaign executions.",
      },
    ],
  },
  cta: {
    title: "BECOME A FACE OF THE FUTURE",
    body: "We are continually seeking unique individuals with exceptional potential to join our agency.",
    buttonLabel: "JOIN THE AGENCY",
  },
};
