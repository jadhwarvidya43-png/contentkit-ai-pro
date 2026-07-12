# ContentKit AI Pro

A premium SaaS web application that transforms a single piece of content into an entire multi-platform marketing campaign.

## Features

- **Input Methods**: YouTube URL, Vimeo URL, TikTok URL, Instagram Reel URL, X Video URL, Facebook Video URL, Podcast RSS, MP4, MOV, MP3, WAV, Transcript, DOCX, PDF, TXT, Markdown, Blog URL, Website URL, Manual text input
- **AI Content Analysis**: Analyze content for topic, audience, tone, brand voice, emotion, storytelling structure, pain points, solutions, examples, statistics, quotes, calls-to-action, questions, answers, objections, educational moments, entertainment moments, sales moments, virality potential
- **Content Generation**: Generate platform-specific content for Twitter/X, LinkedIn, Instagram, Facebook, Threads, Email Marketing, Blog, YouTube, TikTok, Pinterest, Medium, Reddit
- **Content Rewriting**: One-click conversion into different tones (Professional, Friendly, Casual, Luxury, Startup, Corporate, Funny, Gen Z, Minimal, Persuasive, Sales, Educational, Inspirational, Technical, Journalistic, Storytelling, Minimalist, High-Converting)
- **Multi-Language Support**: English, Hindi, Spanish, French, German, Japanese, Chinese, Arabic, Portuguese, Italian, Russian
- **AI Chat Assistant**: Edit generated content with natural language commands
- **Content Library**: Store projects with folders, tags, favorites, search, archive, delete, duplicate, version history
- **Team Features**: Invite teammates, comments, mentions, approval workflow, role permissions, activity log
- **Brand Kit**: Save brand name, logo, colors, fonts, writing style, mission, target audience, products, offers, CTA, company information; automatically apply to generated assets
- **SEO Engine**: Generate keywords, long-tail keywords, search intent, meta title, meta description, slug, schema suggestions, internal/external linking ideas, readability report, SEO score
- **Viral Engine**: Predict virality score, CTR, watch time, shareability, comment potential, save potential, follower growth potential, revenue potential
- **Smart Exports**: Export as TXT, Markdown, DOCX, PDF, CSV, JSON, HTML, Notion, Google Docs, Microsoft Word, Copy to Clipboard, ZIP Package
- **One-Click Publishing**: Integrate with Twitter/X, LinkedIn, Facebook, Instagram, Threads, Pinterest, Medium, WordPress, Ghost, Webflow, Shopify Blog, Substack, Beehiiv, Mailchimp, ConvertKit, Buffer, Hootsuite, Zapier, Make, n8n; schedule posts
- **AI Automation**: Create workflows (e.g., Upload YouTube Video → Extract Transcript → Generate Content → Generate Blog → Generate Newsletter → Generate LinkedIn → Generate Twitter → Generate Instagram → Generate Pinterest → Schedule Publishing)
- **Dashboard**: View projects, recent content, usage, AI credits, team members, published posts, scheduled posts, performance analytics
- **Analytics**: Track views, clicks, CTR, shares, comments, likes, engagement, SEO ranking, keyword performance, traffic, revenue, conversions
- **Subscriptions**: Free, Starter, Pro, Business, Enterprise tiers with usage limits and credit system
- **Authentication**: Email, Google, GitHub, Microsoft, Magic Link, Forgot Password, 2FA, Profile Management
- **Settings**: Theme (Dark/Light), Language, Notifications, API Keys, Brand Kit, Workspace, Billing, Security
- **Design System**: Premium SaaS design with rounded cards, glassmorphism, smooth animations, loading skeletons, Framer Motion transitions, responsive layout, keyboard shortcuts, command palette, beautiful charts, minimal icons, excellent typography, modern spacing, accessible components
- **AI Models**: Support for OpenAI, Google Gemini, Anthropic Claude, Groq, Mistral, OpenRouter; allow users to choose the AI model
- **Performance**: Streaming AI responses, background processing, autosave, undo/redo, infinite history, optimistic UI, caching, fast loading
- **Security**: Encrypted storage, rate limiting, input validation, workspace isolation, GDPR-ready architecture, secure API routes

## Project Structure

```
contentkit-ai-pro/
├── client/                 # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component with routing
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Tailwind CSS base
│   ├── .env                # Environment variables
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
├── server/                 # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Entry point
│   ├── .env                # Environment variables
│   ├── package.json
│   └── ...                 # Other config files
├── docs/                   # Documentation
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (v5+) - [Install MongoDB](https://docs.mongodb.com/manual/installation/)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```

### Environment Variables

Create `.env` files in both `client` and `server` directories.

**client/.env**:
```
VITE_API_URL=http://localhost:5000/api
```

**server/.env**:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/contentkitai
JWT_SECRET=your_super_secret_jwt_secret_change_in_production
CLIENT_URL=http://localhost:5173
```

### Running the Application

1. Start MongoDB (if not running as a service):
   ```bash
   mongod
   ```
2. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
3. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`

## Backend API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

## Frontend Routes

- `/` - Dashboard (protected)
- `/login` - Login page
- `/register` - Register page
- `/*` - 404 Not Found

## Next Steps

1. Implement content upload and processing endpoints
2. Integrate AI models for content analysis and generation
3. Build content generation UI for each platform
4. Implement content library with storage and retrieval
5. Add team collaboration features
6. Implement brand kit functionality
7. Develop SEO and viral prediction engines
8. Add export functionality for various formats
9. Integrate with publishing platforms via APIs
10. Build analytics dashboard
11. Implement subscription and billing system
12. Add authentication providers (OAuth, magic links, etc.)
13. Implement settings and user preferences
14. Enhance UI/UX with animations and responsive design
15. Add performance optimizations (caching, lazy loading, etc.)
16. Write comprehensive tests
17. Deploy to production

## License

This project is proprietary software. All rights reserved.