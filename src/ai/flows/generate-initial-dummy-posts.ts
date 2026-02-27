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

const FALLBACK_POSTS: Post[] = [
  {
    id: 'post-1',
    username: 'nebula_surfer',
    profilePicture: 'https://picsum.photos/seed/nebula/100/100',
    content: 'the resonance shift in the outer rim is reaching critical levels. holographic stabilizers engaged.',
    imageUrl: 'https://picsum.photos/seed/1/600/800',
    likes: 124,
    comments: 12,
    timestamp: new Date().toISOString(),
    themeHue: 180,
  },
  {
    id: 'post-2',
    username: 'digital_ghost',
    profilePicture: 'https://picsum.photos/seed/ghost/100/100',
    content: 'synced with the lower timelines today. the frequency is surprisingly calm.',
    imageUrl: 'https://picsum.photos/seed/2/600/800',
    likes: 89,
    comments: 5,
    timestamp: new Date().toISOString(),
    themeHue: 280,
  },
  {
    id: 'post-3',
    username: 'photon_dancer',
    profilePicture: 'https://picsum.photos/seed/photon/100/100',
    content: 'broadcasted a new aura frequency. can you feel the pulse?',
    imageUrl: 'https://picsum.photos/seed/3/600/800',
    likes: 245,
    comments: 34,
    timestamp: new Date().toISOString(),
    themeHue: 45,
  }
];

const generateInitialDummyPostsFlow = ai.defineFlow(
  {
    name: 'generateInitialDummyPostsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(PostSchema),
  },
  async () => {
    try {
      // Set a short timeout for the AI generation to prevent server hangs
      const generationPromise = ai.generate({
        prompt: 'Generate 5 unique social media post ideas for a futuristic holographic app called "temsync". Use ethereal, digital, and space-age themes.',
        output: {
          schema: z.object({ posts: z.array(PostDraftSchema) })
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI Generation Timeout')), 8000)
      );

      const { output } = await (Promise.race([generationPromise, timeoutPromise]) as any);

      if (!output?.posts) {
        return FALLBACK_POSTS;
      }

      const posts: Post[] = [];

      for (const draft of output.posts) {
        let hash = 0;
        for (let i = 0; i < draft.username.length; i++) {
          hash = draft.username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const themeHue = Math.abs(hash % 360);

        posts.push({
          ...draft,
          profilePicture: `https://picsum.photos/seed/${draft.username}/100/100`,
          content: draft.postContent,
          imageUrl: `https://picsum.photos/seed/${draft.id}/600/800`,
          themeHue: themeHue,
        });
      }

      return posts;
    } catch (error) {
      console.error('AI Flow failed, using fallbacks:', error);
      return FALLBACK_POSTS;
    }
  }
);

export async function generateInitialDummyPosts() {
  return generateInitialDummyPostsFlow();
}
