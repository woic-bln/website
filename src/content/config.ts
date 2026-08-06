import { defineCollection, z } from 'astro:content';

// Global site configuration schema
const globalCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // Site metadata
    site: z.object({
      name: z.string(),
      description: z.string(),
      email: z.string().email(),
      phone: z.string(),
    }),

    // Organization info (for structured data)
    organization: z.object({
      name: z.string(),
      url: z.string().url(),
      logo: z.string(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        postalCode: z.string(),
        country: z.string(),
      }),
      telephone: z.string(),
      email: z.string().email(),
    }),

    // Navigation items
    navigation: z.array(z.object({
      href: z.string(),
      label: z.string(),
    })),

    // Footer content
    footer: z.object({
      about: z.string(),
      contact: z.object({
        address: z.array(z.string()),
        email: z.string().email(),
        phone: z.string(),
      }),
      legal: z.object({
        privacy: z.string(),
        imprint: z.string(),
        contact: z.string(),
      }),
      copyright: z.string(),
    }),

    // Social media links
    social: z.object({
      youtube: z.string().url().optional(),
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
    }).optional(),
  }),
});

// Page content schema
const pagesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // SEO metadata
    meta: z.object({
      title: z.string(),
      description: z.string(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      seoImage: z.string().optional(),
    }),

    // Hero section
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
      image: z.string().optional(),
      buttons: z.array(z.object({
        label: z.string(),
        href: z.string(),
        variant: z.enum(['primary', 'secondary']),
        className: z.string().optional(),
      })).optional(),
    }).optional(),

    // Page sections
    sections: z.array(z.object({
      type: z.enum(['text', 'cards', 'grid', 'info', 'cta', 'html', 'events', 'media', 'contact', 'donations', 'announcement', 'instagram']),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      background: z.enum(['white', 'gray']).optional(),

      // For text sections
      content: z.string().optional(),
      html: z.string().optional(),
      placeholder: z.string().optional(),
      youtubeEmbed: z.string().optional(), // YouTube channel handle e.g. "w.o.i.cberlin171"
      button: z.object({
        text: z.string(),
        href: z.string(),
      }).optional(),

      // For card sections (services)
      cards: z.array(z.object({
        title: z.string(),
        description: z.string(),
        time: z.string().optional(),
        badge: z.string().optional(),
        icon: z.string().optional(),
        button: z.object({
          label: z.string(),
          href: z.string(),
        }).optional(),
      })).optional(),

      // For events sections
      events: z.array(z.object({
        id: z.string().optional(),
        badge: z.string(),
        badgeColor: z.enum(['primary', 'accent']),
        title: z.string(),
        time: z.string(),
        description: z.string(),
        location: z.string().optional(),
        locationUrl: z.string().url().optional(),
      })).optional(),

      // For media sections
      youtubeChannel: z.string().url().optional(),
      videos: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })).optional(),

      // For contact sections
      contactInfo: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        content: z.string(),
      })).optional(),
      directions: z.object({
        title: z.string(),
        mapPlaceholder: z.string(),
        mapButtonText: z.string(),
        publicTransport: z.object({
          title: z.string(),
          content: z.string(),
        }),
        parking: z.object({
          title: z.string(),
          content: z.string(),
        }),
      }).optional(),

      // For donations sections
      bankTransfer: z.object({
        title: z.string(),
        accountHolder: z.string(),
        iban: z.string(),
        bic: z.string(),
        bank: z.string(),
        note: z.string(),
      }).optional(),
      onlineDonation: z.object({
        title: z.string(),
        description: z.string(),
        buttonText: z.string(),
        secureNote: z.string(),
      }).optional(),

      // For announcement sections
      announcement: z.object({
        badge: z.string(),
        heading: z.string(),
        text: z.string(),
        description: z.string(),
      }).optional(),

      // For CTA sections
      cta: z.object({
        text: z.string(),
        button: z.object({
          label: z.string(),
          href: z.string(),
        }),
      }).optional(),

      // For Instagram embed sections
      instagram: z.object({
        posts: z.array(z.object({
          url: z.string().url(),
          caption: z.string().optional(),
        })).min(1),
        consent: z.object({
          message: z.string(),
          buttonLabel: z.string(),
          privacyLink: z.string().optional(),
          privacyLinkText: z.string().optional(),
        }),
      }).optional(),

      // For custom content
      items: z.array(z.any()).optional(),
    })),
  }),
});

// Events collection schema
const eventsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    frequency: z.enum(['weekly', 'monthly', 'special', 'yearly']),
    time: z.string(),
    badge: z.string().optional(),
    category: z.enum(['service', 'study', 'youth', 'family', 'community']).optional(),
    date: z.string().optional(), // For special events
  }),
});

export const collections = {
  global: globalCollection,
  pages: pagesCollection,
  events: eventsCollection,
};
