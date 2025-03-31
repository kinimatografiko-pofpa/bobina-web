import { defineCollection, z } from 'astro:content';
import wordpress from '../wordpress';

const posts = defineCollection({
    loader: async () => {
        const{
            data: { posts },
        } =  await wordpress.getPosts(100);

        return posts.map((p) => ({
            id: p.slug,
            ...p,
            featured_image: wordpress.getFeaturedImage(p),
            // ID: p.ID,
            // title: p.title,
            // slug: p.slug,
            // date: p.date,
            // content: p.content,
            // tags: p.tags,
            // attachments: p.attachments,
            // attachment_count: p.attachment_count,
        }));
    },
    // schema: z.object({
    //     id: z.string(),
    //     ID: z.number(),
    //     title: z.string(),
    //     slug: z.string(),
    //     date: z.string(),
    //     content: z.string(),
    //     tags: z.record(z.string(),z.object({
    //         name:z.string(),
    //         slug:z.string(),
    //     })),
    //     attachments: z.record(z.string() ,z.object({
    //         URL: z.string(),
    //         mime_type: z.string(),
    //     })),
    // }),
});

const categories = defineCollection({
    loader: async () => {
        const{
            data:  categories,
        } =  await wordpress.getCategories();

        const categories_filtered = categories.filter((category) => category.ID != wordpress.NO_CATEGORY);/* Remove 'uncategorized' category since it's not in use 
        Maybe we can remove it from wordpress itself*/

        return categories_filtered.map((c) => {
            if (c.ID == wordpress.DEFAULT_CATEGORY) {
                return {
                    id: c.slug,
                    name: 'Όλα τα άρθρα',
                    href: '/posts',
                };
            }
            return {
                id: c.slug,
                name: c.name,
                href: '/categories/' + c.slug,
            };
        });
    },
});

export const collections = { posts , categories };