/**
 * This script generates a _redirects file for static hosting platforms
 * It maps old WordPress URLs to new Astro URLs with 301 permanent redirects
 * Run this during the build process to create the redirects file
 */

import wordpress from './src/wordpress/index.js';
import fs from 'fs';
import path from 'path';

async function generateRedirects() {
	console.log('Generating redirects from WordPress URLs...');

	// Fetch all posts
	let all_posts = [];
	let has_next_page = true;
	let page_handle = '';

	while (has_next_page) {
		const {
			data: { posts, meta },
		} = await wordpress.getPosts(100, page_handle);

		all_posts = all_posts.concat(posts);

		if (meta?.next_page) {
			page_handle = meta.next_page;
		} else {
			has_next_page = false;
		}
	}

	// Generate redirect rules
	let redirects = '# Redirects from old WordPress URLs to new Astro URLs\n';
	redirects += '# Format: old_path new_path status_code\n\n';

	for (const post of all_posts) {
		if (!post.URL) continue;

		try {
			const url = new URL(post.URL);
			const oldPath = url.pathname;
			const newPath = `/posts/${post.slug}`;

			// Netlify/Vercel format: old new status
			redirects += `${oldPath} ${newPath} 301\n`;
		} catch (error) {
			console.error(`Error processing URL for post ${post.slug}:`, error);
		}
	}

	// Write to public directory (will be copied to dist during build)
	const publicDir = path.join(process.cwd(), 'public');
	const redirectsPath = path.join(publicDir, '_redirects');

	fs.writeFileSync(redirectsPath, redirects, 'utf8');

	console.log(
		`✓ Generated ${all_posts.length} redirects in public/_redirects`
	);

	// Also generate for Vercel (vercel.json format)
	const vercelRedirects = {
		redirects: all_posts
			.filter((post) => post.URL)
			.map((post) => {
				try {
					const url = new URL(post.URL);
					return {
						source: url.pathname,
						destination: `/posts/${post.slug}`,
						permanent: true,
					};
				} catch (error) {
					return null;
				}
			})
			.filter(Boolean),
	};

	const vercelPath = path.join(process.cwd(), 'vercel.json');
	let vercelConfig = {};

	// Read existing vercel.json if it exists
	if (fs.existsSync(vercelPath)) {
		vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
	}

	// Merge redirects
	vercelConfig.redirects = vercelRedirects.redirects;

	fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2), 'utf8');

	console.log(
		`✓ Generated vercel.json with ${vercelRedirects.redirects.length} redirects`
	);
}

generateRedirects().catch((error) => {
	console.error('Error generating redirects:', error);
	process.exit(1);
});
