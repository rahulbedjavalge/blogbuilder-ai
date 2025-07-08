# 🚀 BlogBuilder AI

> A production-ready AI-powered blog platform that transforms **a single word** into complete, engaging blog posts using OpenRouter AI and modern web technologies.

## ✨ Key Features

- **🎯 Strict One-Word Input**: Advanced validation ensures only single words generate blogs
- **🧠 AI-Powered Generation**: Complete blog posts from OpenRouter AI integration
- **🔐 User Authentication**: Secure login/signup with Supabase Auth
- **👤 User-Specific Management**: Each user manages their own blog posts
- **✍️ Manual Blog Creation**: Rich text editor for custom blog posts
- **📱 Mobile Responsive**: Professional, clean design with Tailwind CSS
- **🏷️ Smart Tag System**: Automatic and manual tag organization
- **🔍 Search & Filter**: Advanced search and filtering capabilities
- **⚡ Lightning Fast**: Next.js 14 with TypeScript for optimal performance
- **🌐 SEO Optimized**: Meta tags, structured data, and social sharing
- **👥 Social Links**: Professional footer with LinkedIn and GitHub integration

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | React framework with SSR/SSG |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Database** | Supabase (PostgreSQL) | Database with real-time features |
| **Authentication** | Supabase Auth | User management and security |
| **AI Integration** | OpenRouter API | AI-powered content generation |
| **Deployment** | Vercel | Production hosting platform |

## 🎯 One-Word Validation System

This platform enforces **strict one-word input** with comprehensive validation:

### Frontend Validation
- ✅ **Real-time validation** with visual feedback
- ✅ **Red border** for invalid inputs
- ✅ **Disabled submit** when validation fails
- ✅ **Clear error messages** for user guidance
- ✅ **Input tips** for better user experience

### Backend Validation
- ✅ **Server-side security** prevents bypass attempts
- ✅ **Letters only** (no numbers or special characters)
- ✅ **Length limits** (2-20 characters)
- ✅ **Trimmed input** handling
- ✅ **Detailed error responses**

## 📁 Project Structure

```
blogbuilder-ai/
├── components/
│   ├── Navbar.tsx              # Navigation component
│   ├── BlogCard.tsx            # Blog post card
│   ├── AuthModal.tsx           # Authentication modal
│   ├── Footer.tsx              # Professional footer with social links
│   └── ProtectedRoute.tsx      # Route protection
├── pages/
│   ├── index.tsx               # Homepage with AI generation
│   ├── admin.tsx               # User dashboard
│   ├── blog/
│   │   ├── index.tsx           # Blog listing page
│   │   └── [slug].tsx          # Individual blog post
│   ├── api/
│   │   └── generate.ts         # AI blog generation API
│   └── _app.tsx                # Global app configuration
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── utils/
│   └── supabaseClient.ts       # Supabase configuration
├── styles/
│   └── globals.css             # Global styles
├── supabase.sql                # Database schema
└── README.md                   # This file
```

## � Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rahulbedjavalge/blogbuilder-ai.git
   cd blogbuilder-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   Create `.env.local` with your credentials:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database setup**:
   - Create a Supabase project
   - Run the SQL from `supabase.sql` in your SQL editor
   - Enable Row Level Security

5. **Run development server**:
   ```bash
   npm run dev
   ```

6. **Open browser**: Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### For Content Creators
1. **Sign up/Login**: Create your account or sign in
2. **Generate Blog**: Enter a single word to generate a complete blog post
3. **Manage Content**: Use the admin dashboard to view, edit, and delete posts
4. **Manual Creation**: Create custom blog posts with the built-in editor
5. **Organize**: Use tags to categorize your content

### For Developers
1. **Customize AI**: Modify prompts in `pages/api/generate.ts`
2. **Update UI**: Edit components in the `components/` folder
3. **Add Features**: Extend with new pages and API routes
4. **Styling**: Update Tailwind classes for custom branding

## � Database Schema

```sql
-- Blogs table with Row Level Security
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_md TEXT NOT NULL,
  content_html TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own blogs" ON blogs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read access" ON blogs
  FOR SELECT USING (true);
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **User-specific Access**: Users can only manage their own content
- **Public Read Access**: All blogs are publicly viewable
- **Authenticated Actions**: Creating/editing requires authentication
- **Input Validation**: Strict frontend and backend validation
- **SQL Injection Protection**: Parameterized queries

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
```env
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Alternative Platforms
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🔧 Customization

### AI Model Configuration
```typescript
// In pages/api/generate.ts
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4', // Change model here
    messages: [
      {
        role: 'system',
        content: 'You are a professional blog writer...' // Customize prompt
      }
    ]
  })
});
```

### Styling Customization
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-brand-color',
        secondary: '#your-secondary-color'
      }
    }
  }
}
```

## � Performance Optimization

- **Static Site Generation**: Pre-built pages for faster loading
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for smaller bundles
- **CDN Delivery**: Vercel's global CDN for fast content delivery
- **Database Indexing**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Check this README and code comments
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/rahulbedjavalge/blogbuilder-ai/issues)
- 💡 **Feature Requests**: Submit enhancement ideas
- 🗣️ **Discussions**: Join community discussions

## 🌟 Connect

- **LinkedIn**: [@rahul-bedjavalge](https://linkedin.com/in/rahul-bedjavalge)
- **GitHub**: [@rahulbedjavalge](https://github.com/rahulbedjavalge)
- **Project**: [BlogBuilder AI](https://github.com/rahulbedjavalge/blogbuilder-ai)

## 🏆 Features Showcase

### ✅ Production Ready
- Clean, professional codebase
- No ads or monetization distractions
- Comprehensive validation system
- User authentication and security
- Mobile-responsive design
- SEO optimized

### ✅ Developer Friendly
- TypeScript for type safety
- Modern React patterns
- Clean component architecture
- Comprehensive error handling
- Environment-based configuration
- Easy deployment setup

---

**Built with ❤️ by Rahul Bedjavalge using Next.js, TypeScript, Tailwind CSS, Supabase, and OpenRouter AI**
