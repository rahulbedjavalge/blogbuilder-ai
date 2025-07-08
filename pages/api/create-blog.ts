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

  const { title, content, tags } = req.body

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' })
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization
    if (!authHeader) {
      console.error('No authorization header found')
      return res.status(401).json({ message: 'Authorization header required' })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('No token found in authorization header')
      return res.status(401).json({ message: 'Token is required' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(401).json({ message: 'Authentication failed', error: authError.message })
    }

    if (!user) {
      console.error('No user found with token')
      return res.status(401).json({ message: 'User not found' })
    }

    console.log('User authenticated:', user.id)

    // Create slug from title
    let slug = slugify(title, { lower: true, strict: true })
    
    // Check if slug already exists and make it unique
    const { data: existingBlogs } = await supabase
      .from('blogs')
      .select('slug')
      .like('slug', `${slug}%`)
    
    if (existingBlogs && existingBlogs.length > 0) {
      const existingSlugs = existingBlogs.map(blog => blog.slug)
      let counter = 1
      let newSlug = slug
      while (existingSlugs.includes(newSlug)) {
        newSlug = `${slug}-${counter}`
        counter++
      }
      slug = newSlug
    }
    
    console.log('Generated unique slug:', slug)
    
    // Convert markdown to HTML
    const contentHtml = marked(content)
    
    // Process tags - ensure it's an array
    const processedTags = Array.isArray(tags) ? tags : 
                         typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
                         []

    // Add 'manual' tag to distinguish from AI-generated content
    processedTags.push('manual')
    
    console.log('Creating blog with data:', { title, slug, tags: processedTags, user_id: user.id })
    
    // Save to Supabase with user_id
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          slug,
          content_md: content,
          content_html: contentHtml,
          tags: processedTags,
          user_id: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      
      // If it's a schema cache issue, try without user_id temporarily
      if (error.code === 'PGRST204' && error.message.includes('user_id')) {
        console.log('Trying without user_id due to schema cache issue...')
        const { data: retryData, error: retryError } = await supabase
          .from('blogs')
          .insert([
            {
              title,
              slug,
              content_md: content,
              content_html: contentHtml,
              tags: processedTags
            }
          ])
          .select()
          .single()
        
        if (retryError) {
          return res.status(500).json({ 
            message: 'Failed to save blog', 
            error: retryError.message,
            details: retryError.details,
            hint: retryError.hint
          })
        }
        
        console.log('Blog created successfully (without user_id):', retryData)
        return res.status(200).json({ blog: retryData })
      }
      
      return res.status(500).json({ 
        message: 'Failed to save blog', 
        error: error.message,
        details: error.details,
        hint: error.hint
      })
    }

    console.log('Blog created successfully:', data)
    res.status(200).json({ blog: data })
  } catch (error) {
    console.error('Error creating blog:', error)
    res.status(500).json({ 
      message: 'Failed to create blog', 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
