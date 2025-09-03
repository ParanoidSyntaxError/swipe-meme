import { Swiper } from "@/components/swiper"
import Web3Provider from "@/components/web3-provider"

export default function Home() {
	return (
		<main className="bg-white h-screen w-screen overflow-hidden">
			<Web3Provider>
				<Swiper />
			</Web3Provider>
		</main>
	)
}
