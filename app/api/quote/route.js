// Fetches a random quote from the ZenQuotes API and returns it as JSON, with local fallback
const fallbackQuotes = [
  {
    text: "Pilates is complete coordination of body, mind, and spirit.",
    author: "Joseph Pilates",
    category: "Philosophy",
  },
  {
    text: "Physical fitness is the first requisite of happiness.",
    author: "Joseph Pilates",
    category: "Wellness",
  },
  {
    text: "Change happens through movement and movement heals.",
    author: "Joseph Pilates",
    category: "Motivation",
  },
]

export async function GET() {
  try {
    const res = await fetch('https://zenquotes.io/api/random', { cache: 'no-store' })
    if (!res.ok) {
      throw new Error('Failed to fetch quote: ' + res.status)
    }
    const data = await res.json()
    // ZenQuotes returns an array with one object
    const quoteObj = data[0]
    return Response.json({
      text: quoteObj.q,
      author: quoteObj.a,
      category: quoteObj.h ? 'Motivation' : 'General',
    })
  } catch (error) {
    console.error('Quote API error:', error)
    // Fallback to a random local quote
    const local = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    return Response.json({
      ...local,
      fallback: true,
      error: 'Could not fetch quote from API, using local fallback.',
      details: error.message,
    }, { status: 200 })
  }
}
