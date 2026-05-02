import { parse } from 'node-html-parser';
import axios from 'axios';

const siteUrl =
	'https://public-api.wordpress.com/wp/v2/sites/mpompina.wordpress.com';

const DEFAULT_CATEGORY = 48775454; //this is the ID of the "default" category on wordpress
const NO_CATEGORY = 1; //this is the ID of the "uncategorized" category on wordpress

/**
 * Resolves a category slug to its ID via the API.
 * @param {String} slug
 * @returns {Number|null}
 */
async function getCategoryIdBySlug(slug) {
	let resp = await axios({
		url: siteUrl + '/categories',
		method: 'GET',
		params: { slug },
	});
	if (resp.data.length > 0) return resp.data[0].id;
	return null;
}

/**
 * Resolves a tag slug to its ID via the API.
 * @param {String} slug
 * @returns {Number|null}
 */
async function getTagIdBySlug(slug) {
	let resp = await axios({
		url: siteUrl + '/tags',
		method: 'GET',
		params: { slug },
	});
	if (resp.data.length > 0) return resp.data[0].id;
	return null;
}

/**
 * Normalizes a v2 post object (fetched with _embed) to match the v1.1 shape
 * used throughout the codebase.
 * @param {Object} post raw v2 post object
 * @returns {Object} normalized post
 */
function normalizePost(post) {
	// Build categories object keyed by name (v1.1 shape)
	const categories = {};
	const embeddedTerms = post._embedded?.['wp:term'] || [];
	const embeddedCategories = embeddedTerms[0] || [];
	const embeddedTags = embeddedTerms[1] || [];

	for (const cat of embeddedCategories) {
		categories[cat.name] = { ID: cat.id, name: cat.name, slug: cat.slug };
	}

	// Build tags object keyed by name (v1.1 shape)
	const tags = {};
	for (const tag of embeddedTags) {
		tags[tag.name] = { ID: tag.id, name: tag.name, slug: tag.slug };
	}

	// Resolve featured image URL from embedded media
	const featuredMedia = post._embedded?.['wp:featuredmedia'] || [];
	const featured_image =
		featuredMedia.length > 0 ? featuredMedia[0].source_url || '' : '';

	return {
		ID: post.id,
		title: post.title?.rendered || '',
		slug: post.slug,
		date: post.date,
		content: post.content?.rendered || '',
		excerpt: post.excerpt?.rendered || '',
		featured_image,
		featured_media: post.featured_media,
		URL: post.link,
		categories,
		tags,
		sticky: post.sticky,
		// Keep the raw _embedded for any advanced use
		_embedded: post._embedded,
	};
}

/**
 * Returns an array of posts from the API
 * @param {Number} [max] the maximum number of posts to return
 * @param {Number|String} [page] page number for pagination (pass next_page from meta)
 * @param {String} [category] the slug of the category to filter by
 * @param {String} [tag] the slug of the tag to filter by
 * @param {Number} [offset] offset for first post to be retrieved
 * @returns {Object} {data: {posts, found, meta}, resp} maintains v1.1 shape for callers
 */
async function getPosts(
	max = 20,
	page = '',
	category = '',
	tag = '',
	offset = 0
) {
	const params = {
		per_page: max,
		page: page || 1,
		offset,
		_embed: true,
	};

	if (category) {
		const catId = await getCategoryIdBySlug(category);
		if (catId) params.categories = catId;
	}

	if (tag) {
		const tagId = await getTagIdBySlug(tag);
		if (tagId) params.tags = tagId;
	}

	let resp = await axios({
		url: siteUrl + '/posts',
		method: 'GET',
		params,
	});

	const totalPosts = parseInt(resp.headers['x-wp-total'] || '0', 10);
	const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '0', 10);
	const currentPage = params.page;

	const posts = resp.data.map(normalizePost);

	const data = {
		posts,
		found: totalPosts,
		meta: {
			next_page: currentPage < totalPages ? currentPage + 1 : '',
		},
	};

	return { data, resp };
}

/**
 * Returns an array of posts from the API that have the sticky flag set
 * @param {Number} [max] the maximum number of posts to return
 * @param {Number|String} [page] page number for pagination
 * @returns {Object} {data: {posts, found, meta}, resp} maintains v1.1 shape for callers
 */
async function getStickyPosts(max = 20, page = '') {
	let resp = await axios({
		url: siteUrl + '/posts',
		method: 'GET',
		params: {
			per_page: max,
			page: page || 1,
			sticky: true,
			_embed: true,
		},
	});

	const totalPosts = parseInt(resp.headers['x-wp-total'] || '0', 10);
	const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '0', 10);
	const currentPage = page || 1;

	const posts = resp.data.map(normalizePost);

	const data = {
		posts,
		found: totalPosts,
		meta: {
			next_page: currentPage < totalPages ? currentPage + 1 : '',
		},
	};

	return { data, resp };
}

/**
 * Returns the post with the given ID
 * @param {Number} id the ID of the post to get
 * @returns {Object} {data: Object, resp: Object} data is the normalized post
 */
async function getPost(id) {
	let resp = await axios({
		url: siteUrl + `/posts/${id}`,
		method: 'GET',
		params: { _embed: true },
	});

	let data = normalizePost(resp.data);

	return { data, resp };
}

/**
 * Get an array with the wordpress categories
 * @returns {Object} {data: Object[], resp: Object}
 */
async function getCategories() {
	let resp = await axios({
		url: siteUrl + '/categories',
		method: 'GET',
		params: { per_page: 100 },
	});

	// Normalize to v1.1 shape (ID, name, slug fields)
	let data = resp.data.map((cat) => ({
		ID: cat.id,
		name: cat.name,
		slug: cat.slug,
		description: cat.description,
		parent: cat.parent,
		post_count: cat.count,
	}));

	return { data, resp };
}

/**
 * Get an array with the wordpress tags
 * @returns {Object} {data: Object[], resp: Object}
 */
async function getTags() {
	let resp = await axios({
		url: siteUrl + '/tags',
		method: 'GET',
		params: { per_page: 100 },
	});

	// Normalize to v1.1 shape (ID, name, slug fields)
	let data = resp.data.map((tag) => ({
		ID: tag.id,
		name: tag.name,
		slug: tag.slug,
		description: tag.description,
		post_count: tag.count,
	}));

	return { data, resp };
}

/**
 * Removes the default category from the posts' categories and returns the rest
 * @param {Object} post
 * @returns {Object[]} array with the categories of a given post
 */
function getCategoriesFromPost(post) {
	let ret = [];
	for (let c in post.categories) {
		const cat = post.categories[c];
		if (cat.ID != DEFAULT_CATEGORY) ret.push(cat);
	}
	return ret;
}

/**
 * Some posts have the author text in the first paragraph, this function
 * generates the post excerpt with the author removed.
 * If max_chars is given, the excerpt will be cut to the nearest word.
 * @param {Object} post
 * @param {Number} [max_chars] max char count excl ending of excerpt. Will be cut to the nearest word.
 * @returns {String} excerpt
 */
function getExcerptFromPost(post, max_chars) {
	const EXCERPT_END = '[…]';
	let parsedPost = parse(post.content);
	let paragraphElems = parsedPost.querySelectorAll('p');
	let authorText;

	//iterate over paragraph elements to find the first with text, usually the first contains the author text
	for (const el of paragraphElems) {
		if (el.text.length > 0) {
			authorText = el.text;
			break;
		}
	}

	let exc = parse(post.excerpt).text;
	exc = exc.replace(authorText, '');

	if (max_chars != null && !isNaN(max_chars) && max_chars >= 0) {
		let words = exc.split(' ');
		let total = 0;
		exc = ''; //empty for reconstruction
		for (const word of words) {
			//add +1 because of space
			if (total + word.length + 1 <= max_chars) {
				total += word.length + 1;
				exc += word + ' ';
			}
		}
		exc += EXCERPT_END;
	}

	return exc;
}

/**
 * Gets a preview image from the post. Uses the featured_image field
 * which is resolved from _embedded media in normalizePost.
 * @param {Object} post
 * @returns {string} string with the url of the image
 */
function getFeaturedImage(post) {
	if (post.featured_image) {
		return post.featured_image;
	}
	return '';
}

export default {
	getPosts,
	getStickyPosts,
	getPost,
	getTags,
	getCategories,
	getCategoriesFromPost,
	getExcerptFromPost,
	getFeaturedImage,
	DEFAULT_CATEGORY,
	NO_CATEGORY,
};
