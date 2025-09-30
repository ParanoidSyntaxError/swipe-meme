"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { IdeaDocument } from "@swipememe-api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Pencil, Heart, PencilOff } from "lucide-react";
import { getNewestIdeas } from "@/lib/swipememe-api";
import { arrayToShuffled } from 'array-shuffle';
import { address, appendTransactionMessageInstruction, blockhash, compileTransaction, createTransactionMessage, generateKeyPairSigner, getBase58Decoder, getTransactionEncoder, partiallySignTransaction, pipe, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash } from "@solana/kit";
import { uploadPumpfunTokenMetadata } from "@/lib/pinata";
import { getCreateInstructionAsync, PUMP_PROGRAM_ADDRESS } from "../programs/pump";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, type ConnectedStandardSolanaWallet, useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { getLatestBlockhash } from "@/lib/solana";

export interface SwipeCardProps {
	initialIdeas: IdeaDocument[];
}

export function SwipeCard({ initialIdeas }: SwipeCardProps) {
	const [dragOffset, setDragOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [touchStartX, setTouchStartX] = useState(0);
	const [mouseStartX, setMouseStartX] = useState(0);
	const [isMobile, setIsMobile] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	const [ideas, setIdeas] = useState<IdeaDocument[]>(initialIdeas);
	const [ideaIndex, setIdeaIndex] = useState(0);
	const [excludedIdeaPages, setExcludedIdeaPages] = useState<number[]>(
		initialIdeas?.[0]?.page ? [initialIdeas[0].page] : []
	);
	const [isFetchingIdeas, setIsFetchingIdeas] = useState(false);
	const [ideasOverflowed, setIdeasOverflowed] = useState(false);
	const [newIdeasIndex, setNewIdeasIndex] = useState<number | undefined>(undefined);

	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	// Edit mode state
	const [isEditing, setIsEditing] = useState(false);
	const [editFormData, setEditFormData] = useState({
		name: '',
		symbol: '',
		description: '',
		imageUrl: ''
	});

	const { ready: privyReady } = usePrivy();
	const { ready: walletsReady, wallets } = useWallets();
	const [wallet, setWallet] = useState<ConnectedStandardSolanaWallet | null>(null);
	const { signAndSendTransaction } = useSignAndSendTransaction();

	useEffect(() => {
		if (privyReady && walletsReady) {
			if (wallets.length > 0) {
				setWallet(wallets[0]);
			}
		}
	}, [privyReady, walletsReady, wallets]);

	// Reset image states when idea changes
	useEffect(() => {
		setImageLoaded(false);
		setImageError(false);
	}, [ideaIndex]);

	const fetchNewIdeas = async () => {
		if (isFetchingIdeas) {
			return;
		}
		setIsFetchingIdeas(true);

		const newIdeas = await getNewestIdeas(excludedIdeaPages);
		if (newIdeas !== null && newIdeas.ideas.length > 0) {
			if (ideasOverflowed) {
				setNewIdeasIndex(ideas.length);
			}
			setIdeas([
				...arrayToShuffled(newIdeas.ideas),
				...newIdeas.ideas
			]);
			setExcludedIdeaPages([
				...excludedIdeaPages,
				newIdeas.page
			]);
		}

		setIsFetchingIdeas(false);
	}

	// Initialize edit form data when entering edit mode
	const initializeEditForm = () => {
		const currentIdea = ideas[ideaIndex];
		setEditFormData({
			name: currentIdea.name,
			symbol: currentIdea.symbol,
			description: currentIdea.description,
			imageUrl: currentIdea.imageUrl || ''
		});
	};

	// Toggle edit mode
	const toggleEditMode = () => {
		cancelChanges();
		if (!isEditing) {
			initializeEditForm();
		}
		setIsEditing(!isEditing);
	};

	// Cancel changes
	const cancelChanges = () => {
		setIsEditing(false);
		setEditFormData({
			name: '',
			symbol: '',
			description: '',
			imageUrl: ''
		});
	};

	// Handle form input changes
	const handleFormChange = (field: keyof typeof editFormData, value: string) => {
		setEditFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleCreateToken = async () => {
		try {
			if (!wallet) {
				console.error("No wallet connected");
				return;
			}

			const metadata = isEditing ? {
				name: editFormData.name,
				symbol: editFormData.symbol,
				description: editFormData.description,
				image: editFormData.imageUrl,
			} : {
				name: ideas[ideaIndex].name,
				symbol: ideas[ideaIndex].symbol,
				description: ideas[ideaIndex].description,
				image: ideas[ideaIndex].imageUrl || 'https://swipe.meme/pill.svg',
			};

			const [tokenKeypair, metadataCid] = await Promise.all([
				generateKeyPairSigner(),
				uploadPumpfunTokenMetadata({
					...metadata,
					showName: true,
					createdOn: "https://pump.fun",
				})
			]);
			if (metadataCid === null) {
				return;
			}

			const tokenUri = `https://ipfs.io/ipfs/${metadataCid}`;

			const [createPumpTokenInstruction, latestBlockhash] = await Promise.all([
				getCreateInstructionAsync({
					name: metadata.name,
					symbol: metadata.symbol,
					uri: tokenUri,
					creator: address("DxJnGG6iXZyMnQu7XawWKZPwoRVgR7CbRp3UykhCALua"),
					user: {
						address: address(wallet.address),
						signAndSendTransactions: async () => ([])
					},
					mint: tokenKeypair,
					program: PUMP_PROGRAM_ADDRESS,
				}),
				getLatestBlockhash()
			]);
			if(latestBlockhash === null) {
				return;
			}

			const transactionMessage = pipe(
				createTransactionMessage({
					version: 0,
				}),
				(m) => setTransactionMessageFeePayer(address(wallet.address), m),
				(m) => setTransactionMessageLifetimeUsingBlockhash({
					blockhash: blockhash(latestBlockhash.blockhash),
					lastValidBlockHeight: BigInt(latestBlockhash.lastValidBlockHeight)
				}, m),
				(m) => appendTransactionMessageInstruction(createPumpTokenInstruction, m),
				(m) => compileTransaction(m)
			);
			const partiallySignedTransaction = await partiallySignTransaction([tokenKeypair.keyPair], transactionMessage);
			const encodedTransaction = getTransactionEncoder().encode(partiallySignedTransaction);

			const { signature } = await signAndSendTransaction({
				transaction: new Uint8Array(encodedTransaction),
				wallet: wallet,
				options: {
					commitment: "confirmed",
					maxRetries: 3
				}
			});
			const decodedSignature = getBase58Decoder().decode(signature);

			console.log("✅ Token:", tokenKeypair.address);
			console.log("✅ Signature:", decodedSignature);
		} catch (error) {
			console.error("Error creating token:", error);
		}
	};

	// Detect mobile device
	useEffect(() => {
		const checkMobile = () => {
			const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
				window.innerWidth <= 768 ||
				('ontouchstart' in window);
			setIsMobile(isMobileDevice);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleSwipe = (direction: "left" | "right") => {
		if (isAnimating) {
			return;
		}
		setIsAnimating(true);

		if (direction === "right") {
			handleCreateToken();
		}

		setIsEditing(false);
		cancelChanges();

		const finalOffset = direction === "right" ? 1200 : -1200
		setDragOffset(finalOffset)

		// Use longer animation duration for mobile devices
		const animationDuration = isMobile ? 600 : 400;

		setTimeout(() => {
			setDragOffset(0);
			setIsAnimating(false);

			if (!isFetchingIdeas && ideaIndex >= ideas.length - 20) {
				fetchNewIdeas();
			}

			if (ideaIndex + 1 >= ideas.length) {
				setIdeaIndex(0);
				setIdeasOverflowed(true);
			} else {
				if (ideasOverflowed && newIdeasIndex !== undefined) {
					setIdeaIndex(newIdeasIndex);
					setIdeasOverflowed(false);
					setNewIdeasIndex(undefined);
				} else {
					setIdeaIndex(ideaIndex + 1);
				}
			}
			setImageLoaded(false);
		}, animationDuration)
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
		<>
			<div className="relative w-full max-h-[500px] max-w-sm flex-1 mb-6 pt-4">
				<Card
					ref={cardRef}
					className={cn(
						"h-full p-0 m-0 bg-gray-100 border-0 shadow-xl rounded-2xl overflow-hidden select-none",
						!isEditing && "cursor-grab active:cursor-grabbing",
						(ideas.length === 0 || !imageLoaded) && "pointer-events-none"
					)}
					style={{
						transform: `translateX(${dragOffset}px) rotate(${rotation}deg) scale(${scale})`,
						transition: isDragging
							? "none"
							: isAnimating
								? `all ${isMobile ? '0.6s' : '0.4s'} cubic-bezier(0.25, 0.46, 0.45, 0.94)`
								: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
						userSelect: "none",
						WebkitUserSelect: "none",
						MozUserSelect: "none",
						msUserSelect: "none",
						touchAction: "none",
						WebkitTouchCallout: "none",
						WebkitTapHighlightColor: "transparent",
					}}
					onMouseDown={!isEditing ? handleMouseDown : undefined}
					onMouseMove={!isEditing ? handleMouseMove : undefined}
					onMouseUp={!isEditing ? handleMouseUp : undefined}
					onTouchStart={!isEditing ? handleTouchStart : undefined}
					onTouchMove={!isEditing ? handleTouchMove : undefined}
					onTouchEnd={!isEditing ? handleTouchEnd : undefined}
				>
					{ideas.length > 0 ?
						<>
							<div className="relative h-full">
								{!imageError ? (
									<Image
										src={ideas[ideaIndex].imageUrl || `./pill.svg`}
										alt={ideas[ideaIndex].name}
										fill
										className={cn(
											"object-cover h-full",
											!imageLoaded && "opacity-0"
										)}
										loading="eager"
										onLoad={() => setImageLoaded(true)}
										onError={() => {
											setImageError(true);
											setImageLoaded(true);
										}}
									/>
								) : (
									<Image
										src="./pill.svg"
										alt="Fallback image"
										fill
										className="object-cover h-full"
									/>
								)}
								{!imageLoaded && <Spinner className="scale-20" />}
							</div>
							{!isEditing ? (
								// Display mode
								<>
									<div
										className={cn(
											"absolute h-36 bottom-0 left-0 right-0 p-6 text-white",
										)}
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
							) : (
								// Edit mode - styled like the idea card
								<>
									{/* Overlay with edit form - similar to the original card overlay */}
									<div
										className="absolute h-72 bottom-0 left-0 right-0 p-6 text-white"
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
											{/* Name input */}
											<Input
												value={editFormData.name}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('name', e.target.value)}
												className="text-4xl md:text-4xl font-bold h-auto mb-2 bg-black/30 border-2 border-gray-200 focus:scale-105 transition-all"
												placeholder="Name"
											/>

											{/* Symbol input */}
											<Input
												value={editFormData.symbol}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('symbol', e.target.value)}
												className="text-lg md:text-lg h-auto mb-2 bg-black/30 border-2 border-gray-200 focus:scale-105 transition-all"
												placeholder="Symbol"
											/>

											{/* Description textarea */}
											<Textarea
												value={editFormData.description}
												onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('description', e.target.value)}
												className="resize-none h-auto mb-2 bg-black/30 border-2 border-gray-200 focus:scale-105 transition-all"
												placeholder="Description"

											/>
										</div>
									</div>
								</>
							)}
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
					<X style={{ width: "1.4rem", height: "1.4rem" }} />
				</Button>

				<Button
					size="lg"
					className={cn(
						"w-12 h-12 rounded-full bg-white border-2 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
						isEditing
							? "border-orange-200 text-orange-500 hover:bg-orange-50 hover:border-orange-300"
							: "border-gray-200 text-blue-500 hover:bg-blue-50 hover:border-blue-200"
					)}
					onClick={() => {
						if (!isAnimating) {
							setIsDragging(false);
							setDragOffset(0);
							toggleEditMode();
						}
					}}
					disabled={isAnimating}
				>
					{isEditing ?
						<PencilOff style={{ width: "0.95rem", height: "0.95rem" }} />
						:
						<Pencil style={{ width: "0.95rem", height: "0.95rem" }} />
					}
				</Button>

				<Button
					size="lg"
					className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 text-green-500 hover:bg-green-50 hover:border-green-200 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
					onClick={() => handleSwipe("right")}
					disabled={isAnimating}
				>
					<Heart style={{ width: "1.4rem", height: "1.4rem" }} />
				</Button>
			</div>
		</>
	)
}
