'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating initial dummy social media posts with holographic themes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PostSchema = z.object({
  id: z.string().describe('Unique identifier for the post.'),
  username: z.string().describe('The username of the post creator.'),
  profilePicture: z.string().describe('Data URI of the user profile picture.'),
  content: z.string().describe('The textual content of the social media post.'),
  imageUrl: z.string().describe('The data URI of the AI-generated holographic backdrop.'),
  likes: z.number().describe('Number of likes.'),
  comments: z.number().describe('Number of comments.'),
  timestamp: z.string().describe('Timestamp in ISO format.'),
});

export type Post = z.infer<typeof PostSchema>;

const PostDraftSchema = z.object({
  id: z.string(),
  username: z.string(),
  profilePictureDescription: z.string(),
  postContent: z.string(),
  imageDescription: z.string(),
  likes: z.number(),
  comments: z.number(),
  timestamp: z.string(),
});

const generateInitialDummyPostsFlow = ai.defineFlow(
  {
    name: 'generateInitialDummyPostsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(PostSchema),
  },
  async () => {
    // 1. Generate post contents and descriptions
    const { output } = await ai.generate({
      prompt: 'Generate 5 unique social media post ideas for a futuristic holographic app called "temsync". Ensure diverse usernames and modern, ethereal themes.',
      output: {
        schema: z.object({ posts: z.array(PostDraftSchema) })
      }
    });

    if (!output?.posts) {
      throw new Error('Failed to generate post drafts.');
    }

    const posts: Post[] = [];

    // 2. Generate images for each post
    for (const draft of output.posts) {
      const { media: mainMedia } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `An abstract, blurred, soft focus holographic backdrop with ethereal light: ${draft.imageDescription}. Minimalist and futuristic.`,
      });

      const { media: profileMedia } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A minimalist abstract profile icon with subtle holographic elements: ${draft.profilePictureDescription}.`,
        config: { aspectRatio: '1:1' }
      });

      const fallbackAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzY2MDA4OCIvPjwvc3ZnPg==';

      posts.push({
        id: draft.id,
        username: draft.username,
        profilePicture: profileMedia?.url || fallbackAvatar,
        content: draft.postContent,
        imageUrl: mainMedia?.url || 'https://picsum.photos/seed/temsync/600/800',
        likes: draft.likes,
        comments: draft.comments,
        timestamp: draft.timestamp,
      });
    }

    return posts;
  }
);

export async function generateInitialDummyPosts() {
  return generateInitialDummyPostsFlow();
}