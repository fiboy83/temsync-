'use server';
/**
 * @fileOverview A Genkit flow for providing holographic backdrops for social media posts.
 *
 * - generatePostHolographicBackdrop - A function that returns a holographic backdrop URL.
 * - GeneratePostHolographicBackdropInput - The input type.
 * - GeneratePostHolographicBackdropOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePostHolographicBackdropInputSchema = z.object({
  description: z
    .string()
    .optional()
    .describe(
      'An optional textual description to guide the backdrop selection.'
    ),
});
export type GeneratePostHolographicBackdropInput = z.infer<
  typeof GeneratePostHolographicBackdropInputSchema
>;

const GeneratePostHolographicBackdropOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The holographic backdrop image URL.'),
});
export type GeneratePostHolographicBackdropOutput = z.infer<
  typeof GeneratePostHolographicBackdropOutputSchema
>;

export async function generatePostHolographicBackdrop(
  input: GeneratePostHolographicBackdropInput
): Promise<GeneratePostHolographicBackdropOutput> {
  return generatePostHolographicBackdropFlow(input);
}

const generatePostHolographicBackdropFlow = ai.defineFlow(
  {
    name: 'generatePostHolographicBackdropFlow',
    inputSchema: GeneratePostHolographicBackdropInputSchema,
    outputSchema: GeneratePostHolographicBackdropOutputSchema,
  },
  async (input) => {
    // Using a seeded placeholder to avoid Imagen API billing restrictions
    const seed = input.description ? encodeURIComponent(input.description) : 'default-holographic';
    const placeholderUrl = `https://picsum.photos/seed/${seed}/600/800`;

    return { imageDataUri: placeholderUrl };
  }
);
