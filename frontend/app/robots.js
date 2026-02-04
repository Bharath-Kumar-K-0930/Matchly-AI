export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: 'https://matchly-ai.vercel.app/sitemap.xml',
    }
}
