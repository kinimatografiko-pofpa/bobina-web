const siteUrl =
	'https://public-api.wordpress.com/rest/v1.1/sites/mpompina.wordpress.com';

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
};
