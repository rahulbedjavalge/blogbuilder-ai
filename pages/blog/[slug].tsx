import { GetStaticProps, GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { supabase, Blog } from '../../utils/supabaseClient'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import Head from 'next/head'

interface BlogPostProps {
  blog: Blog
}

interface Params extends ParsedUrlQuery {
  slug: string
}

export default function BlogPost({ blog }: BlogPostProps) {
  return (
    <>
      <Head>
        <title>{blog.title} - BlogBuilder AI</title>
        <meta name="description" content={blog.content_md.substring(0, 160)} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.content_md.substring(0, 160)} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.content_md.substring(0, 160)} />
        
        {/* Google AdSense Script */}
        <script 
          async 
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`}
          crossOrigin="anonymous"
        />
      </Head>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <time dateTime={blog.created_at} className="text-sm">
              Published on {format(new Date(blog.created_at), 'MMMM dd, yyyy')}
            </time>
            
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="text-sm text-gray-500">
              {Math.ceil(blog.content_md.length / 1000)} min read
            </div>
          </div>
        </header>

        {/* Google Ads - Top */}
        <div className="ads mb-8 flex justify-center">
          <AdSense 
            adSlot={ADSENSE_CONFIG.adUnits.postTop} 
            adFormat="auto"
            className="w-full max-w-4xl"
          />
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-5">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-700">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 mb-4">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
            }}
          >
            {blog.content_md}
          </ReactMarkdown>
        </div>

        {/* Google Ads - Middle */}
        <div className="ads my-8 flex justify-center">
          <AdSense 
            adSlot={ADSENSE_CONFIG.adUnits.postMiddle} 
            adFormat="rectangle"
            className="w-full max-w-md"
          />
        </div>

        {/* Custom Affiliate Deal */}
        <div className="custom-deal bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-2">🔥 Special Deal!</h3>
          <p className="mb-4">
            Get exclusive access to premium tools and resources related to this topic.
          </p>
          <a
            href="https://example.com/deal?ref=blogbuilder"
            className="inline-block bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Claim Your Deal →
          </a>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-4 pt-8 border-t border-gray-200">
          <span className="text-gray-600 font-medium">Share this article:</span>
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Google Ads - Bottom */}
        <div className="ads mt-8 flex justify-center">
          <AdSense 
            adSlot={ADSENSE_CONFIG.adUnits.postBottom} 
            adFormat="auto"
            className="w-full max-w-4xl"
          />
        </div>
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('slug')

  if (error) {
    console.error('Error fetching blog slugs:', error)
    return {
      paths: [],
      fallback: 'blocking',
    }
  }

  const paths = (blogs || []).map((blog) => ({
    params: { slug: blog.slug },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<BlogPostProps, Params> = async ({ params }) => {
  if (!params?.slug) {
    return {
      notFound: true,
    }
  }

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !blog) {
    console.error('Error fetching blog:', error)
    return {
      notFound: true,
    }
  }

  return {
    props: {
      blog,
    },
    revalidate: 60, // Revalidate every minute
  }
}
