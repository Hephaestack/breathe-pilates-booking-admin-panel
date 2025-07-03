import { NextResponse } from "next/server"

const QUOTE_GARDEN_URL = "https://quotegarden.herokuapp.com/api/v3/quotes/random"

// GET /api/quote
export async function GET() {
  try {
    // Disable caching so a fresh quote is returned every request
    const res = await fetch(QUOTE_GARDEN_URL, { next: { revalidate: 0 } })

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: 502 })
    }

    const payload = await res.json()
    const raw = payload?.data?.[0] ?? {}

    return NextResponse.json({
      text: (raw.quoteText ?? "").replace(/['"]/g, ""),
      author: raw.quoteAuthor || "Unknown",
      source: "QuoteGarden API",
    })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
