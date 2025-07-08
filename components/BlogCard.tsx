import Link from 'next/link'
import { format } from 'date-fns'
import { Blog } from '../utils/supabaseClient'

interface BlogCardProps {
  blog: Blog
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-3">
          <time dateTime={blog.created_at} className="mb-2 sm:mb-0">
            {format(new Date(blog.created_at), 'MMM dd, yyyy')}
          </time>
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
        </div>
        
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 hover:text-primary-600 transition-colors leading-tight">
          <Link href={`/blog/${blog.slug}`}>
            {blog.title}
          </Link>
        </h2>
        
        <div className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
          {blog.content_md.substring(0, 150)}...
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <Link 
            href={`/blog/${blog.slug}`}
            className="text-primary-600 hover:text-primary-800 font-medium transition-colors inline-flex items-center gap-1"
          >
            Read more 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <div className="text-sm text-gray-500">
            {Math.ceil(blog.content_md.length / 1000)} min read
          </div>
        </div>
      </div>
    </div>
  )
}
