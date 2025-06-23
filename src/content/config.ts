import { defineCollection, z } from 'astro:content';
import wordpress from '../wordpress';

const posts = defineCollection({
    loader: async () => {
        //Wordpress allows a maximum of 100 posts per request
        //If there are more than 100 posts in total a new request is made for the next page of posts and so on
        let all_posts = [];
        let has_next_page = true;
        let page_handle = '';

        while(has_next_page){
            const{
                data: { posts , meta },
            } =  await wordpress.getPosts(100,page_handle);

            all_posts = all_posts.concat(posts);

            if(meta?.next_page) {
                page_handle = meta.next_page;
            }
            else {
                has_next_page = false;
            }
        }

        return all_posts.map((p) => ({
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