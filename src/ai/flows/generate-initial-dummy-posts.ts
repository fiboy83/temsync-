'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating initial dummy social media posts with holographic themes and AI-generated blurred backdrops.
 *
 * - generateInitialDummyPosts - A function that generates seven diverse dummy social media posts.
 * - GenerateInitialDummyPostsInput - The input type for the generateInitialDummyPosts function.
 * - GenerateInitialDummyPostsOutput - The return type for the generateInitialDummyPosts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the flow (no specific input needed for generating fixed 7 posts)
const GenerateInitialDummyPostsInputSchema = z.void();
export type GenerateInitialDummyPostsInput = z.infer<typeof GenerateInitialDummyPostsInputSchema>;

// Schema for a single post
const PostSchema = z.object({
  id: z.string().describe('Unique identifier for the post.'),
  username: z.string().describe('The username of the post creator.'),
  profilePicture: z.string().describe('Data URI of the user profile picture.'),
  content: z.string().describe('The textual content of the social media post.'),
  imageUrl: z.string().describe('The data URI of the AI-generated holographic backdrop for the post.'),
  likes: z.number().describe('Number of likes for the post.'),
  comments: z.number().describe('Number of comments for the post.'),
  timestamp: z.string().describe('Timestamp of the post in ISO format.'),
});
export type Post = z.infer<typeof PostSchema>;

// Output schema for the flow
const GenerateInitialDummyPostsOutputSchema = z.array(PostSchema);
export type GenerateInitialDummyPostsOutput = z.infer<typeof GenerateInitialDummyPostsOutputSchema>;

// Schema for the intermediate prompt that generates content and image descriptions
const PostContentAndImageDescriptionSchema = z.object({
  id: z.string().describe('Unique identifier for the post.'),
  username: z.string().describe('The username of the post creator.'),
  profilePictureDescription: z.string().describe('A brief description for generating a profile picture.'),
  postContent: z.string().describe('The textual content of the social media post.'),
  imageDescription: z.string().describe('A detailed description for generating a unique holographic blurred background image.'),
  likes: z.number().describe('Number of likes for the post.'),
  comments: z.number().describe('Number of comments for the post.'),
  timestamp: z.string().describe('Timestamp of the post in ISO format.'),
});

const GenerateMultiplePostContentsAndImageDescriptionsSchema = z.object({
  posts: z.array(PostContentAndImageDescriptionSchema).length(7).describe('An array of seven unique social media post contents and their image descriptions.'),
});

const generatePostContentsAndImageDescriptionsPrompt = ai.definePrompt({
  name: 'generatePostContentsAndImageDescriptionsPrompt',
  input: { schema: GenerateInitialDummyPostsInputSchema },
  output: { schema: GenerateMultiplePostContentsAndImageDescriptionsSchema },
  prompt: `Generate exactly seven distinct dummy social media posts in English. Each post needs:
  1.  Unique holographic-themed content, keeping a modern minimalist aesthetic.
  2.  A detailed and unique description for an AI-generated blurred holographic backdrop image.
  3.  A unique username and a brief description for a profile picture for each post.
  4.  Realistic-looking, but dummy, like and comment counts.
  5.  A recent, but varied, timestamp in ISO 8601 format (e.g., 2023-10-27T10:30:00Z).
  
  Ensure all generated content is suitable for a platform named "temsync" focusing on futuristic, holographic, and minimalist themes.`,
});

const generateInitialDummyPostsFlow = ai.defineFlow(
  {
    name: 'generateInitialDummyPostsFlow',
    inputSchema: GenerateInitialDummyPostsInputSchema,
    outputSchema: GenerateInitialDummyPostsOutputSchema,
  },
  async () => {
    // 1. Generate all post contents and image descriptions in a single LLM call
    const { output: contentDescriptions } = await generatePostContentsAndImageDescriptionsPrompt();

    if (!contentDescriptions || !contentDescriptions.posts) {
      throw new Error('Failed to generate post contents and image descriptions.');
    }

    const posts: Post[] = [];

    // 2. Iterate through each generated content and generate its specific image
    for (const postData of contentDescriptions.posts) {
      // Generate the holographic backdrop image
      const { media: imageMedia } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A blurred, soft focus, abstract holographic backdrop: ${postData.imageDescription}. Ensure it has a futuristic, minimalist, and ethereal quality.`,
      });

      if (!imageMedia || !imageMedia.url) {
        console.warn(`Failed to generate main image for post: ${postData.id}. Skipping.`);
        continue;
      }

      // Generate a simple profile picture based on the description
      const { media: profilePicMedia } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A minimalist abstract profile icon with subtle holographic elements, dark background, based on the theme "${postData.profilePictureDescription}".`,
        config: {
          aspectRatio: '1:1'
        }
      });

      // Simple fallback SVG if generation fails
      const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzZGMDAiLz48L3N2Zz4=';
      
      const profilePictureUrl = profilePicMedia?.url || fallbackSvg;

      posts.push({
        id: postData.id,
        username: postData.username,
        profilePicture: profilePictureUrl,
        content: postData.postContent,
        imageUrl: imageMedia.url,
        likes: postData.likes,
        comments: postData.comments,
        timestamp: postData.timestamp,
      });
    }

    return posts;
  }
);

export async function generateInitialDummyPosts(
  input: GenerateInitialDummyPostsInput = undefined
): Promise<GenerateInitialDummyPostsOutput> {
  return generateInitialDummyPostsFlow(input);
}