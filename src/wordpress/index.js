import { parse } from 'node-html-parser';
import axios from 'axios';

const siteUrl =
	'https://public-api.wordpress.com/rest/v1.1/sites/mpompina.wordpress.com';

const DEFAULT_CATEGORY = 48775454; //this is the ID of the "default" category on wordpress

/**
 * Returns an array of posts from the API
 * @param {Number} [max] the maximum number of posts to return
 * @param {String} [page_handle] used for pagination, the URL of the previous page //TODO: verfy that
 * @param {String} [category] the string of the category of the posts to filter by
 * @param {String} [tag] the string of the tag of the posts to filter by
 * @returns {Object} {data: Object[], resp: Object} data is an array of posts, resp is the response object for whatever purposes
 */
async function getPosts(max = 20, page_handle = '', category = '', tag = '') {
	let resp = await axios({
		url: siteUrl + '/posts',
		method: 'GET',
		params: {
			number: max,
			page_handle: page_handle,
			category,
			tag,
		},
	});

	let data = resp.data;

	return { data, resp };
}

/**
 * Returns an array of posts from the API that have the sticky flag set
 * @param {Number} [max] the maximum number of posts to return
 * @param {String} page_handle used for pagination, the URL of the previous page //TODO: verfy that
 * @returns {Object} {data: Object[], resp: Object} data is an array of posts, resp is the response object for whatever purposes}
 */
async function getStickyPosts(max = 20, page_handle = '') {
	let resp = await axios({
		url: siteUrl + '/posts',
		method: 'GET',
		params: {
			number: max,
			page_handle: page_handle,
			sticky: 'require',
		},
	});

	let data = resp.data;

	return { data, resp };
}

/**
 * Returns the post with the given ID
 * @param {Number} id the ID of the post to get
 * @returns {Object} {data: Object, resp: Object} data is the post, resp is the response object for whatever purposes
 */
async function getPost(id) {
	let resp = await axios(siteUrl + `/posts/${id}`);

	let data = resp.data;

	return { data, resp };
}

/**
 * Get an array with the wordpress categories
 * @returns
 */
async function getCategories() {
	let resp = await axios(siteUrl + '/categories');
	let { categories: data } = resp.data;

	return { data, resp };
}

/**
 * Get an array with the wordpress tags
 * @returns
 */
async function getTags() {
	let resp = await axios(siteUrl + '/tags');
	let { tags: data } = resp.data;

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

export default {
	getPosts,
	getStickyPosts,
	getPost,
	getTags,
	getCategories,
	getCategoriesFromPost,
	getExcerptFromPost,
	DEFAULT_CATEGORY,
};
