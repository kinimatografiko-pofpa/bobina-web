/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				black: '#131313',
				primary: '#B5465A',
			},
		},
	},
	plugins: [],
};
