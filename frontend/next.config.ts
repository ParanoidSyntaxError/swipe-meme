import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: '**',
				pathname: '/**',
			},
		],
	},
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@swipememe-api/types': path.resolve(__dirname, '../backend/src/types.ts'),
			'@swipememe-api/constants': path.resolve(__dirname, '../backend/src/constants.ts'),
		};
		return config;
	},
};

export default nextConfig;
