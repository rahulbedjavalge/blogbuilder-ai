import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../utils/supabaseClient'
import { marked } from 'marked'
import slugify from 'slugify'

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

  // Validate that input is exactly one word
  const trimmedWord = word.trim()
  
  if (!trimmedWord) {
    return res.status(400).json({ message: 'Word cannot be empty' })
  }
  
  if (trimmedWord.includes(' ')) {
    return res.status(400).json({ message: 'Please enter only ONE word (no spaces allowed)' })
  }
  
  if (!/^[a-zA-Z]+$/.test(trimmedWord)) {
    return res.status(400).json({ message: 'Please enter only letters (no numbers or special characters)' })
  }
  
  if (trimmedWord.length < 2) {
    return res.status(400).json({ message: 'Word must be at least 2 characters long' })
  }
  
  if (trimmedWord.length > 20) {
    return res.status(400).json({ message: 'Word must be less than 20 characters long' })
  }

  try {
    // Get user from session (optional for homepage usage)
    let userId = null
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    // Generate blog content using OpenRouter
    const blogContent = await generateBlogWithAI(trimmedWord)
    
    // Extract title from the first line or generate one
    const lines = blogContent.split('\n').filter(line => line.trim())
    const title = lines[0]?.replace(/^#+\s*/, '') || `Blog about ${trimmedWord}`
    
    // Create slug from title
    const slug = slugify(title, { lower: true, strict: true })
    
    // Convert markdown to HTML
    const contentHtml = marked(blogContent)
    
    // Extract tags (simple approach - you can enhance this)
    const tags = [trimmedWord.toLowerCase(), 'ai-generated']
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          slug,
          content_md: blogContent,
          content_html: contentHtml,
          tags,
          user_id: userId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ message: 'Failed to save blog' })
    }

    res.status(200).json({ blog: data })
  } catch (error) {
    console.error('Error generating blog:', error)
    res.status(500).json({ message: 'Failed to generate blog' })
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
      model: 'openrouter/cypher-alpha:free',
      messages: [
        {
          role: 'system',
          content: `You are a professional blog writer. Write engaging, informative, and well-structured blog posts based on a SINGLE WORD provided by the user.
                   
                   Instructions:
                   - Create a comprehensive blog post inspired by the single word
                   - Format your response in markdown with proper headings, paragraphs, and structure
                   - Make the content SEO-friendly and reader-engaging
                   - The blog should be at least 800 words long
                   - Include an engaging title that relates to the word
                   - Create multiple sections with H2 headings
                   - Use the word naturally throughout the content
                   - Make it educational, inspiring, or thought-provoking
                   
                   Structure:
                   # [Engaging Title]
                   
                   ## Introduction
                   [Hook the reader and introduce the concept]
                   
                   ## [Section 1 - Main concept]
                   [Detailed exploration]
                   
                   ## [Section 2 - Related aspects]
                   [Further discussion]
                   
                   ## [Section 3 - Practical applications]
                   [Real-world examples or applications]
                   
                   ## Conclusion
                   [Wrap up with key takeaways]`
        },
        {
          role: 'user',
          content: `Write a comprehensive blog post about the word: "${word}". 
                   Explore its meaning, significance, and impact in various contexts. 
                   Make it engaging, informative, and valuable for readers.
                   Start with an engaging title using # and use proper markdown formatting.`
        }
      ],
      temperature: 0.7,
      max_tokens: 20000
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
