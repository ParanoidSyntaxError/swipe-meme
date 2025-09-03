"use client";

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Heart,
	X,
	RotateCcw,
} from "lucide-react"
import Image from "next/image"
import ConnectButton from "./connect-button"
import Link from "next/link"
import { getTokenIdeas, TokenIdea } from "@/lib/ai";
import { cn } from "@/lib/utils";
import Spinner from "./ui/spinner";

export function Swiper() {
	const [dragOffset, setDragOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [touchStartX, setTouchStartX] = useState(0);
	const [mouseStartX, setMouseStartX] = useState(0);
	const cardRef = useRef<HTMLDivElement>(null);

	const [ideas, setIdeas] = useState<TokenIdea[]>([]);
	const [ideaIndex, setIdeaIndex] = useState(0);

	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		getTokenIdeas().then((ideas) => {
			setIdeas(ideas);
		});
	}, []);

	const handleSwipe = (direction: "left" | "right") => {
		if (isAnimating) return

		setIsAnimating(true)
		const finalOffset = direction === "right" ? 1200 : -1200
		setDragOffset(finalOffset)

		setTimeout(() => {
			setDragOffset(0);
			setIsAnimating(false);
			setIdeaIndex(ideaIndex + 1 >= ideas.length ? 0 : ideaIndex + 1);
			setImageLoaded(false);
		}, 400)
	}

	const handleMouseDown = (e: React.MouseEvent) => {
		if (isAnimating) return
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
		setMouseStartX(e.clientX)
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging || isAnimating) return
		e.preventDefault()
		const currentX = e.clientX
		const deltaX = currentX - mouseStartX
		const newDragOffset = Math.max(-400, Math.min(400, deltaX))
		setDragOffset(newDragOffset)
	}

	const handleMouseUp = () => {
		if (!isDragging) return
		setIsDragging(false)

		const finalDragOffset = dragOffset

		if (Math.abs(finalDragOffset) > 60) {
			handleSwipe(finalDragOffset > 0 ? "right" : "left")
		} else {
			setDragOffset(0)
		}
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		if (isAnimating) return
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
		setTouchStartX(e.touches[0].clientX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging || isAnimating) return
		e.preventDefault()
		const currentX = e.touches[0].clientX
		const deltaX = currentX - touchStartX
		const newDragOffset = Math.max(-400, Math.min(400, deltaX))
		setDragOffset(newDragOffset)
	}

	const handleTouchEnd = () => {
		if (!isDragging) return
		setIsDragging(false)

		const finalDragOffset = dragOffset

		if (Math.abs(finalDragOffset) > 60) {
			handleSwipe(finalDragOffset > 0 ? "right" : "left")
		} else {
			setDragOffset(0)
		}
	}

	const rotation = dragOffset * 0.06
	const scale = isDragging ? 0.98 : 1

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
			{/* Card Stack */}
			<div className="relative w-full max-h-[500px] max-w-sm flex-1 mb-6 pt-4">
				{/* Main card (current post) */}
				<Card
					ref={cardRef}
					className={cn(
						"h-full p-0 m-0 bg-gray-100 border-0 shadow-xl rounded-2xl cursor-grab active:cursor-grabbing overflow-hidden select-none",
						(ideas.length === 0 || !imageLoaded) && "pointer-events-none"
					)}
					style={{
						transform: `translateX(${dragOffset}px) rotate(${rotation}deg) scale(${scale})`,
						transition: isDragging
							? "none"
							: isAnimating
								? "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
								: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
						userSelect: "none",
						WebkitUserSelect: "none",
						MozUserSelect: "none",
						msUserSelect: "none",
						touchAction: "none",
						WebkitTouchCallout: "none",
						WebkitTapHighlightColor: "transparent",
					}}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					{ideas.length > 0 ?
						<>
							<div className="relative h-full">
								<Image
									src={ideas[ideaIndex].imageUrl || `https://picsum.photos/400?random=${Math.random()}`}
									alt={ideas[ideaIndex].name}
									fill
									className={cn(
										"object-cover h-full",
										!imageLoaded && "opacity-0"
									)}
									onLoad={() => setImageLoaded(true)}
								/>
								{!imageLoaded && <Spinner className="scale-20" />}
							</div>
							<div
								className="absolute h-36 bottom-0 left-0 right-0 p-6 text-white"
								style={{
									background: `linear-gradient(to top,
										rgba(0, 0, 0, 0.85) 0%,
										rgba(0, 0, 0, 0.7) 40%,
										rgba(0, 0, 0, 0.5) 60%,
										rgba(0, 0, 0, 0.1) 90%,
										transparent 100%)`,
								}}
							>
								<div className="h-full flex flex-col justify-end">
									<div className="flex flex-row gap-x-3 items-baseline mb-2">
										<span className="text-4xl font-bold">
											{ideas[ideaIndex].name}
										</span>
										<span className="text-lg text-gray-200">
											{ideas[ideaIndex].symbol}
										</span>
									</div>
									<div className="text-base text-gray-200">
										{ideas[ideaIndex].description}
									</div>
								</div>
							</div>
						</>
						:
						<Spinner className="scale-20" />
					}

					{dragOffset > 40 && (
						<div
							className="absolute inset-0 transition-all duration-200 ease-out transform z-10"
							style={{ backgroundColor: 'rgba(0, 255, 0, 0.55)' }}
						/>
					)}
					{dragOffset < -40 && (
						<div
							className="absolute inset-0 transition-all duration-200 ease-out transform z-10"
							style={{ backgroundColor: 'rgba(255, 0, 0, 0.55)' }}
						/>
					)}
				</Card>
			</div>

			<div className="flex items-center justify-center space-x-4">
				<Button
					size="lg"
					className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
					onClick={() => handleSwipe("left")}
					disabled={isAnimating}
				>
					<X className="w-7 h-7" />
				</Button>

				<Button
					size="lg"
					className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 text-blue-500 hover:bg-blue-50 hover:border-blue-200 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
					onClick={() => {
						if (!isAnimating) {
							setDragOffset(0)
						}
					}}
					disabled={isAnimating}
				>
					<RotateCcw className="w-5 h-5" />
				</Button>

				<Button
					size="lg"
					className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 text-green-500 hover:bg-green-50 hover:border-green-200 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
					onClick={() => handleSwipe("right")}
					disabled={isAnimating}
				>
					<Heart className="w-7 h-7" />
				</Button>
			</div>
		</div>
	)
}
