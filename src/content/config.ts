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
        }));
    },
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
                    ...c,
                    name: 'Όλα τα άρθρα',
                    href: '/posts',
                };
            }
            return {
                id: c.slug,
                ...c,
                href: '/categories/' + c.slug,
            };
        });
    },
});

export const collections = { posts , categories };