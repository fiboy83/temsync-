'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating initial dummy social media posts with holographic themes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PostSchema = z.object({
  id: z.string().describe('Unique identifier for the post.'),
  username: z.string().describe('The username of the post creator.'),
  profilePicture: z.string().describe('Data URI or URL of the user profile picture.'),
  content: z.string().describe('The textual content of the social media post.'),
  imageUrl: z.string().describe('The URL of the holographic backdrop.'),
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
    // 1. Generate post contents and descriptions using text model (which is usually available on free tier)
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

    // 2. Use high-quality placeholders instead of Imagen to avoid billing errors
    for (const draft of output.posts) {
      // Use seeded placeholders for consistency
      const mainImageUrl = `https://picsum.photos/seed/${draft.id}/600/800`;
      const profileImageUrl = `https://picsum.photos/seed/${draft.username}/100/100`;

      posts.push({
        id: draft.id,
        username: draft.username,
        profilePicture: profileImageUrl,
        content: draft.postContent,
        imageUrl: mainImageUrl,
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
