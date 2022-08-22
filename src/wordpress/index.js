const siteUrl =
	'https://public-api.wordpress.com/rest/v1.1/sites/mpompina.wordpress.com';

const DEFAULT_CATEGORY = 48775454;

async function getPosts(max = 20, page_handle = '', category = '') {
	let resp = await fetch(
		siteUrl +
			`/posts?number=${max}&page_handle=${page_handle}&category=${category}`
	);

	let data = await resp.json();

	return { data, resp };
}

async function getStickyPosts(max = 20, page_handle = '') {
	let resp = await fetch(
		siteUrl +
			`/posts?number=${max}&page_handle=${page_handle}&sticky=require`
	);

	let data = await resp.json();

	return { data, resp };
}

async function getPost(id) {
	let resp = await fetch(siteUrl + `/posts/${id}`);

	let data = await resp.json();

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
	getCategoriesFromPost,
};
