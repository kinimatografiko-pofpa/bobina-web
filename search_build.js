const axios = require('axios');
const { parse } = require('node-html-parser');

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
			image: getRecordImage(p),
			categories: p.categories,
			shortText: getExcerptFromPost(p),
			tags: Object.keys(p.tags),
			date: p.date,
			slug: p.slug,
		}));
	} catch (error) {
		console.log(error);
	}

	fs.writeFileSync('algolia_index.json', JSON.stringify(results));
}

main();
