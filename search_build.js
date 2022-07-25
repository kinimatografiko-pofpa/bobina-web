const axios = require('axios');
const { parse } = require('node-html-parser');

const siteUrl =
	'https://public-api.wordpress.com/rest/v1.1/sites/mpompina.wordpress.com';

async function getPosts(max = 20, page_handle = '', category = '') {
	let resp = await axios(
		siteUrl +
			`/posts?number=${max}&page_handle=${page_handle}&category=${category}`
	);

	let data = resp.data;

	return { data, resp };
}

const fs = require('fs');

function getRecordImage(post) {
	let img = Object.values(post.attachments)?.[0]?.URL;
	if (img != null) return img;
	else return null;
}

async function main() {
	let results = null;
	try {
		const {
			data: { posts },
		} = await getPosts((max = 100));
		results = posts.map((p) => ({
			objectID: p.ID,
			title: p.title,
			content: parse(p.content).text,
			imageUrl: getRecordImage(p),
			categories: Object.keys(p.categories),
			tags: Object.keys(p.tags),
		}));
	} catch (error) {
		console.log(error);
	}

	fs.writeFileSync('algolia_index.json', JSON.stringify(results));
}

main();
