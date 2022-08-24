import { parse } from 'node-html-parser';
import axios from 'axios';

const siteUrl =
	'https://public-api.wordpress.com/rest/v1.1/sites/mpompina.wordpress.com';

const DEFAULT_CATEGORY = 48775454;

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
	console.log('works');

	let data = resp.data;

	return { data, resp };
}

async function getPost(id) {
	let resp = await axios(siteUrl + `/posts/${id}`);

	let data = resp.data;

	return { data, resp };
}

async function getCategories() {
	let resp = await axios(siteUrl + '/categories');
	let { categories: data } = resp.data;

	return { data, resp };
}

async function getTags() {
	let resp = await axios(siteUrl + '/tags');
	let { tags: data } = resp.data;

	return { data, resp };
}

/**
 * Removes the default category from the posts' categories
 * @param {Object} post
 * @returns {String[]} array with the names of the categories of a given post
 */
function getCategoriesFromPost(post) {
	let ret = [];
	for (let cat in post.categories) {
		if (post.categories[cat].ID != DEFAULT_CATEGORY) ret.push(cat);
	}
	return ret;
}

/**
 * returns the post excerpt with the author removed
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
// async function getAllPosts() {
// 	let allPosts = [];

// 	let { data } = await getPosts(100);
// 	allPosts.push(data);
// 	if (data.found > 100) {
// 		while (data)
// 	}
// }

export default {
	getPosts,
	getStickyPosts,
	getPost,
	getTags,
	getCategories,
	getCategoriesFromPost,
	getExcerptFromPost,
};
