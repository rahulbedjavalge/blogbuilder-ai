import { useState, useEffect } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import BlogCard from '../components/BlogCard'
import { supabase, Blog } from '../utils/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

interface HomeProps {
  blogs: Blog[]
}

export default function Home({ blogs }: HomeProps) {
  const { user } = useAuth()
  const [word, setWord] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBlog, setGeneratedBlog] = useState<Blog | null>(null)
  const [validationError, setValidationError] = useState('')
  const [loadingStage, setLoadingStage] = useState('')

  const validateWord = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) {
      setValidationError('')
      return false
    }
    
    // Check if input contains only one word (no spaces)
    if (trimmed.includes(' ')) {
      setValidationError('Please enter only ONE word')
      return false
    }
    
    // Check if word contains only letters (no numbers or special characters)
    if (!/^[a-zA-Z]+$/.test(trimmed)) {
      setValidationError('Please enter only letters')
      return false
    }
    
    setValidationError('')
    return true
  }

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWord(value)
    validateWord(value)
  }

  const generateBlog = async () => {
    const trimmedWord = word.trim()
    if (!trimmedWord || !validateWord(trimmedWord)) return

    // Check if user is authenticated
    if (!user) {
      alert('Please sign in to create blogs.')
      return
    }

    setIsGenerating(true)
    setLoadingStage('Preparing AI generation...')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please sign in to create blogs.')
        return
      }

      setLoadingStage('AI is creating your blog content...')
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ word: trimmedWord }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate blog')
      }

      setLoadingStage('Finalizing and saving your blog...')
      
      const data = await response.json()
      setGeneratedBlog(data.blog)
      setWord('') // Clear the input after successful generation
      setLoadingStage('')
    } catch (error) {
      console.error('Error generating blog:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate blog. Please try again.')
      setLoadingStage('')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Head>
        <title>BlogBuilder AI - Generate Amazing Blogs with AI</title>
        <meta name="description" content="Transform a single word into a complete, engaging blog post using the power of artificial intelligence." />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Generate Amazing Blogs with <span className="text-primary-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform a single word into a complete, engaging blog post using the power of artificial intelligence.
          </p>

          {/* AI Generator Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Blog Post</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={word}
                onChange={handleWordChange}
                placeholder="Enter a single word (e.g., 'freedom', 'innovation', 'travel')"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isGenerating}
              />
              {validationError && (
                <p className="mt-2 text-sm text-red-600">{validationError}</p>
              )}
            </div>
            <button
              onClick={generateBlog}
              disabled={isGenerating || !word.trim() || !!validationError || !user}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : !user ? 'Sign In to Generate Blog' : 'Generate Blog'}
            </button>
          </div>

          {isGenerating && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-800 font-medium">{loadingStage || 'Creating your unique blog post...'}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-blue-700 mt-2 text-center">
                ✨ AI is crafting a creative title and engaging content for "{word}"
              </p>
              <p className="text-xs text-blue-600 mt-1 text-center">
                This usually takes 30-60 seconds...
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-4">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use only <strong>one word</strong> (no spaces)</li>
              <li>Use only <strong>letters</strong> (no numbers or symbols)</li>
              <li>Try words like: technology, adventure, creativity, freedom</li>
              <li className="text-blue-600"><strong>Sign in required</strong> to create and save blogs</li>
            </ul>
          </div>

          {generatedBlog && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Blog Generated Successfully!</h3>
              <p className="text-green-700 mb-4">
                Your blog post "{generatedBlog.title}" has been created and saved.
              </p>
              <a
                href={`/blog/${generatedBlog.slug}`}
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                View Blog Post
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Recent Blogs Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Blog Posts</h2>
        
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs yet. Generate your first blog above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose BlogBuilder AI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">Generate high-quality blog posts using advanced AI technology</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Create complete blog posts in seconds, not hours</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Monetization Ready</h3>
            <p className="text-gray-600">Built-in support for ads and affiliate marketing</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching blogs:', error)
    return {
      props: {
        blogs: [],
      },
      revalidate: 60, // Revalidate every minute
    }
  }

  return {
    props: {
      blogs: blogs || [],
    },
    revalidate: 60,
  }
}
