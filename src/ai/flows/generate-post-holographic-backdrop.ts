'use server';
/**
 * @fileOverview A Genkit flow for generating unique, blurred holographic backdrops for social media posts.
 *
 * - generatePostHolographicBackdrop - A function that handles the holographic backdrop generation process.
 * - GeneratePostHolographicBackdropInput - The input type for the generatePostHolographicBackdrop function.
 * - GeneratePostHolographicBackdropOutput - The return type for the generatePostHolographicBackdrop function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePostHolographicBackdropInputSchema = z.object({
  description: z
    .string()
    .optional()
    .describe(
      'An optional textual description to guide the holographic backdrop generation.'
    ),
});
export type GeneratePostHolographicBackdropInput = z.infer<
  typeof GeneratePostHolographicBackdropInputSchema
>;

const GeneratePostHolographicBackdropOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated holographic backdrop image as a data URI.'),
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
    const basePrompt = `A blurred, soft, ethereal holographic gradient with dynamic, shifting colors, minimal, modern, abstract. Focus on soft light and subtle transitions, vibrant yet subtle color shifts.`;
    const fullPrompt = input.description
      ? `${basePrompt} ${input.description}`
      : basePrompt;

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: fullPrompt,
    });

    if (!media) {
      throw new Error('Failed to generate holographic backdrop image.');
    }

    return { imageDataUri: media.url };
  }
);
