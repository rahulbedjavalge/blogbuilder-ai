import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { word } = req.body

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ message: 'Word is required' })
  }

  try {
    // Generate blog content using OpenRouter
    const blogContent = await generateBlogWithAI(word)
    
    // Extract title from the first line or generate one
    const lines = blogContent.split('\n').filter(line => line.trim())
    const title = lines[0]?.replace(/^#+\s*/, '') || `Blog about ${word}`
    
    // Extract tags (simple approach - you can enhance this)
    const tags = [word.toLowerCase(), 'ai-generated']
    
    res.status(200).json({ 
      title,
      content: blogContent,
      tags
    })
  } catch (error) {
    console.error('Error generating content:', error)
    res.status(500).json({ message: 'Failed to generate content' })
  }
}

async function generateBlogWithAI(word: string): Promise<string> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tngtech/deepseek-r1t2-chimera:free',
      messages: [
        {
          role: 'system',
          content: `You are a professional blog writer. Write engaging, informative, and well-structured blog posts. 
                   Format your response in markdown with proper headings, paragraphs, and structure.
                   Make the content SEO-friendly and reader-engaging.
                   The blog should be at least 800 words long.
                   
                   IMPORTANT - TITLE CREATIVITY RULES:
                   - NEVER use repetitive title patterns like "Unlocking the Power of...", "Unleashing the Power of...", "The Power of...", "Beyond...", "The Art of...", "Mastering..."
                   - AVOID overused phrases like "power", "unlocking", "unleashing", "mastering", "ultimate guide", "secrets of"
                   - VARY your title beginnings - don't always start with "The" - use different starting words and structures
                   - CREATE unique, creative, and varied title structures for each word
                   - Use fresh angles, unexpected perspectives, metaphors, or thought-provoking questions
                   - Make titles that stand out and avoid generic business/tech jargon
                   - Consider different approaches: storytelling, problem-solving, future-focused, historical, personal, scientific, cultural, etc.
                   
                   Title Examples for Inspiration (DO NOT COPY, just use as style reference):
                   - "When [Word] Meets Reality: A Journey Through..."
                   - "Why [Word] Matters More Than You Think"
                   - "Hidden Truths About [Word]: What We Never Knew"
                   - "[Word] in the Wild: Stories from the Field"
                   - "Breaking Down [Word]: A Fresh Perspective"
                   - "How [Word] Changed Everything We Know"
                   - "Living with [Word]: A Modern Dilemma"
                   - "[Word] Through the Ages: Then and Now"
                   - "Inside [Word]: A Deep Dive"
                   - "Rethinking [Word]: New Perspectives"`
        },
        {
          role: 'user',
          content: `Write a detailed, engaging blog post based on the word: "${word}". 
                   Make it informative, creative, and suitable for publishing. 
                   Include multiple sections, practical insights, and make it valuable for readers.
                   Start with an engaging title (use # for the main title).
                   Use proper markdown formatting with headers, bold text, lists, etc.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenRouter API')
  }

  return data.choices[0].message.content
}
