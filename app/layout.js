export const metadata = {
    title: 'Bridge-AI',
    description: '対話実験プラットフォーム',
};

export default function RootLayout({ children }) {
    return (
        <html lang="ja">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
