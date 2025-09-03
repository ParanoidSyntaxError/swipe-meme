import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

export const nunito = Nunito({
	subsets: ["latin"],
	weight: ["400", "600", "700", "800"],
	display: "swap",
	variable: "--font-ui",
});

export const metadata: Metadata = {
	title: "swipe.meme",
	description: "swipe.meme",
	icons: {
		icon: '/pill.svg',
		shortcut: '/pill.svg',
		apple: '/pill.svg',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={nunito.variable}>
			<body
				className="antialiased"
				style={{ fontFamily: "var(--font-ui), system-ui, sans-serif" }}
			>
				{children}
			</body>
		</html>
	);
}
