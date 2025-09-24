import Image from "next/image";
import ConnectButton from "./connect-button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getNewestIdeas } from "@/lib/swipememe-api";
import { SwipeCard } from "./swipe-card";
import {arrayToShuffled} from 'array-shuffle';

export async function Swiper() {
	const initialIdeas = arrayToShuffled((await getNewestIdeas())?.ideas ?? []);
	
	return (
		<div className="flex flex-col items-center justify-center h-full px-2 pb-4">
			<div className={cn(
				"flex flex-row items-center justify-between w-full",
				"md:absolute md:top-0 md:left-0 md:right-0"
			)}>
				<Link href="/">
					<div className="flex flex-row items-center gap-x-1 text-gray-700 text-4xl font-extrabold p-4">
						<Image
							src="/pill.svg"
							alt="swipe.meme pill"
							width={40}
							height={40}
						/>
						<span>swipe</span>
					</div>
				</Link>
				<div className="text-gray-700 text-4xl font-extrabold p-4">
					<ConnectButton />
				</div>
			</div>
			<SwipeCard initialIdeas={initialIdeas} />
		</div>
	)
}
