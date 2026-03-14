export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#BD9F67',
                secondary: '#243137',
                accent: '#1a2529',
                'text-solid': '#FFFFFF',
                'text-muted': 'rgba(255,255,255,0.6)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}