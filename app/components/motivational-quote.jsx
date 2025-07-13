"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { RefreshCw, Quote, Wifi, WifiOff } from "lucide-react"
import { Button } from "./ui/button"

// Local Pilates quotes as a LAST-RESORT fallback
const fallbackQuotes = [
	{
		text: "Το Pilates είναι πλήρης συνδιασμός σώματος, νου και πνεύματος.",
		author: "Joseph Pilates",
		category: "Φιλοσοφία",
	},
	{
		text: "Η φυσική κατάσταση είναι η πρώτη προϋπόθεση της ευτυχίας.",
		author: "Joseph Pilates",
		category: "Ευεξία",
	},
	{
		text: "Αλλάξτε τον τρόπο που κινείστε και αλλάξτε τον τρόπο που αισθάνεστε.",
		author: "Σωματική Άσκηση",
		category: "Κίνηση",
	},
	{
		text: "Η ισορροπία δεν είναι κάτι που βρίσκετε, είναι κάτι που δημιουργείτε.",
		author: "Pilates Wisdom",
		category: "Ισορροπία",
	},
]

export function MotivationalQuote() {
	const [quote, setQuote] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [lastUpdated, setLastUpdated] = useState(null)
	const [isOnline, setIsOnline] = useState(true)

	const fetchQuote = async () => {
		setLoading(true)
		setError(null)

		try {
			setIsOnline(navigator.onLine)

			if (!navigator.onLine) throw new Error("offline")

			const res = await fetch("/api/quote")
			if (!res.ok) throw new Error("api")

			const data = await res.json()
			setQuote({
				text: data.text,
				author: data.author,
			})
		} catch (e) {
			// Ultimate fallback
			const local =
				fallbackQuotes[
					Math.floor(Math.random() * fallbackQuotes.length)
				]
			setQuote({ ...local })
			setError(e.message === "offline" ? "Λειτουργία offline" : "API μη διαθέσιμο")
		} finally {
			setLoading(false)
			setLastUpdated(new Date())
		}
	}

	// Initial + hourly refresh
	useEffect(() => {
		fetchQuote()
		const id = setInterval(fetchQuote, 60 * 60 * 1000)
		return () => clearInterval(id)
	}, [])

	// Retry automatically when connection returns
	useEffect(() => {
		const online = () => {
			setIsOnline(true)
			fetchQuote()
		}
		const offline = () => setIsOnline(false)

		window.addEventListener("online", online)
		window.addEventListener("offline", offline)
		return () => {
			window.removeEventListener("online", online)
			window.removeEventListener("offline", offline)
		}
	}, [])

	const statusIcon = isOnline ? (
		<Wifi className="w-3 h-3 text-green-400" />
	) : (
		<WifiOff className="w-3 h-3 text-red-400" />
	)

	if (loading && !quote) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center h-64">
					<RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="relative overflow-hidden group shadow-xl border-0 rounded-xl bg-gradient-to-br from-black to-zinc-900">
			<CardContent className="p-0">
				{/* Minimal flat black background */}
				<div className="absolute inset-0 pointer-events-none">
					<svg
						width="100%"
						height="100%"
						className="absolute inset-0"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect
							width="100%"
							height="100%"
							fill="url(#bwGradient)"
						/>
						<defs>
							<linearGradient
								id="bwGradient"
								x1="0"
								y1="0"
								x2="1"
								y2="1"
							>
								<stop offset="0%" stopColor="#000" />
								<stop offset="100%" stopColor="#18181b" />
							</linearGradient>
						</defs>
					</svg>
					<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:24px_24px]" />
				</div>
				{/* Quote content */}
				<div className="relative p-6 h-64 flex flex-col justify-center text-white">
					<Quote className="w-8 h-8 text-white mb-4 opacity-80" />
					<blockquote className="italic text-lg md:text-xl font-medium mb-4">
						"{quote.text}"
					</blockquote>
					<cite className="text-zinc-300 font-semibold text-right">
						— {quote.author}
					</cite>
					{/* Refresh button */}
					<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							variant="ghost"
							size="sm"
							onClick={fetchQuote}
							disabled={loading}
							className="text-white hover:bg-white/20 backdrop-blur-sm"
						>
							<RefreshCw
								className={`w-4 h-4 ${
									loading ? "animate-spin" : ""
								}`}
							/>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
