import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { supabase, Blog } from '../utils/supabaseClient'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

interface AdminProps {
  blogs: Blog[]
}

export default function Admin({ blogs: initialBlogs }: AdminProps) {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBlog, setNewBlog] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  })

  // Get unique tags from all blogs
  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)))

  // Filter blogs based on search and tag
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content_md.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || blog.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const deleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBlogs(blogs.filter(blog => blog.id !== id))
      alert('Blog deleted successfully!')
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBlogs = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error refreshing blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    setIsCreating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please log in to create a blog')
        return
      }

      const response = await fetch('/api/create-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(newBlog),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data)
        throw new Error(data.message || 'Failed to create blog')
      }

      setBlogs([data.blog, ...blogs])
      setNewBlog({ title: '', content: '', tags: [] })
      setShowCreateForm(false)
      alert('Blog created successfully!')
    } catch (error) {
      console.error('Error creating blog:', error)
      alert(`Failed to create blog: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  const generateAIContent = async (word: string) => {
    if (!word.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setNewBlog({
        title: data.title,
        content: data.content,
        tags: data.tags
      })
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Load user's blogs on mount
  useEffect(() => {
    if (user) {
      refreshBlogs()
    }
  }, [user])

  return (
    <ProtectedRoute>
      <Head>
        <title>Admin Dashboard - BlogBuilder AI</title>
        <meta name="description" content="Manage your blog posts and monitor performance" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your blog posts and monitor performance</p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Blogs</h3>
          <p className="text-3xl font-bold text-primary-600">{blogs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Tags</h3>
          <p className="text-3xl font-bold text-primary-600">{allTags.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Latest Blog</h3>
          <p className="text-sm text-gray-600">
            {blogs.length > 0 ? format(new Date(blogs[0].created_at), 'MMM dd, yyyy') : 'No blogs yet'}
          </p>
        </div>
      </div>

      {/* Create Blog Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          ✍️ Create New Blog Post
        </button>
      </div>

      {/* Create Blog Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Blog Post</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createBlog} className="space-y-6">
              {/* AI Generation Helper */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">🤖 AI Content Helper</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Need inspiration? Enter a word and let AI generate content for you to edit!
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter a word (e.g., 'productivity', 'health', 'technology')"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        generateAIContent((e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
                      generateAIContent(input.value)
                    }}
                    disabled={isCreating}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isCreating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter an engaging blog title..."
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Content (Markdown supported)
                </label>
                <textarea
                  id="content"
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Write your blog content in Markdown format...

# Main Heading
## Subheading

Your content here with **bold text** and *italic text*.

- List item 1
- List item 2

> Blockquote

And much more!"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  You can use Markdown formatting: **bold**, *italic*, # headings, - lists, &gt; quotes, etc.
                  <br />
                  <strong>Quick tips:</strong> Use # for main heading, ## for subheadings, **text** for bold, *text* for italic.
                </p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={newBlog.tags.join(', ')}
                  onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="technology, web development, tutorials"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Publish Blog Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <button
            onClick={refreshBlogs}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Create Blog Form */}
      {showCreateForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Blog</h2>
          <form onSubmit={createBlog} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newBlog.title}
                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newBlog.tags}
                onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Blog'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + Create New Blog
          </button>
        </div>
      )}

      {/* Blog List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Blog Posts ({filteredBlogs.length})
          </h2>
        </div>
        
        {filteredBlogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || selectedTag ? 'No blogs match your filters' : 'No blogs found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {blog.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {blog.content_md.length} characters
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(blog.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <a
                          href={`/blog/${blog.slug}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteBlog(blog.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Google Ads Integration Info */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">💰 Monetization Tips</h3>
        <ul className="text-yellow-700 space-y-1">
          <li>• Add your Google AdSense code to _app.tsx</li>
          <li>• Place ad units between blog paragraphs</li>
          <li>• Add affiliate links in blog content</li>
          <li>• Use analytics to track performance</li>
        </ul>
      </div>      </div>
    </ProtectedRoute>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // For now, we'll return empty blogs since we'll load user-specific blogs on client side
  // In a real application, you'd want to verify the user's session server-side
  return {
    props: {
      blogs: [],
    },
  }
}
