'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating initial dummy social media posts with holographic themes and unique color profiles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PostSchema = z.object({
  id: z.string().describe('Unique identifier for the post.'),
  username: z.string().describe('The username of the post creator.'),
  profilePicture: z.string().describe('Data URI or URL of the user profile picture.'),
  content: z.string().describe('The textual content of the social media post.'),
  imageUrl: z.string().optional().describe('The URL of the holographic backdrop or image.'),
  videoUrl: z.string().optional().describe('The URL of the uploaded video.'),
  likes: z.number().describe('Number of likes.'),
  comments: z.number().describe('Number of comments.'),
  timestamp: z.string().describe('Timestamp in ISO format.'),
  themeHue: z.number().describe('The base hue for this user profile (0-360).'),
});

export type Post = z.infer<typeof PostSchema>;

const PostDraftSchema = z.object({
  id: z.string(),
  username: z.string(),
  postContent: z.string(),
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
    const { output } = await ai.generate({
      prompt: 'Generate 5 unique social media post ideas for a futuristic holographic app called "temsync". Use ethereal, digital, and space-age themes.',
      output: {
        schema: z.object({ posts: z.array(PostDraftSchema) })
      }
    });

    if (!output?.posts) {
      throw new Error('Failed to generate post drafts.');
    }

    const posts: Post[] = [];

    for (const draft of output.posts) {
      // Assign a consistent hue based on username string to simulate profile color
      let hash = 0;
      for (let i = 0; i < draft.username.length; i++) {
        hash = draft.username.charCodeAt(i) + ((hash << 5) - hash);
      }
      const themeHue = Math.abs(hash % 360);

      const mainImageUrl = `https://picsum.photos/seed/${draft.id}/600/800`;
      const profileImageUrl = `https://picsum.photos/seed/${draft.username}/100/100`;

      posts.push({
        ...draft,
        profilePicture: profileImageUrl,
        content: draft.postContent,
        imageUrl: mainImageUrl,
        themeHue: themeHue,
      });
    }

    return posts;
  }
);

export async function generateInitialDummyPosts() {
  return generateInitialDummyPostsFlow();
}
