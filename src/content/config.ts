import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    math: z.boolean().default(false),
    references: z
      .array(z.object({ id: z.string(), text: z.string() }))
      .default([]),
  }),
});

export const collections = { blog };
