# 🎯 Fine Tracker

> A modern, real-time team fine management system with Slack-style threading and interactive discussions

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎯 Overview

Fine Tracker is a comprehensive team fine management application that brings modern social features to traditional fine tracking. Built with Next.js 15 and Supabase, it provides real-time collaboration, Slack-style comment threading, and an intuitive user interface for managing team fines, credits, and warnings.

**Perfect for:** Sports teams, office environments, group activities, or any community that uses a fine system for accountability and fun.

### Key Problems Solved

- **Real-time Collaboration**: Instant updates and notifications when fines are added or discussed
- **Threaded Discussions**: Slack-style comment system for contextual conversations about each fine
- **Team Transparency**: Public fine tracking with full discussion history
- **Modern UX**: Clean, responsive design with smooth interactions and loading states

### Target Audience

- Sports teams managing player conduct and performance
- Office teams with fun accountability systems
- Social groups tracking shared expenses and responsibilities
- Community organizers managing group activities

## ✨ Features

### 🔧 Core Functionality
- **Fine Management**: Create, edit, and archive fines with flexible amounts
- **User System**: Secure authentication with user profiles and role management
- **Fine Types**: Support for fines, credits, and warnings with color-coded badges
- **Real-time Updates**: Instant synchronization across all connected clients

### 💬 Communication Features
- **Slack-style Threading**: Organized comment discussions on each fine
- **Live Comment Updates**: Real-time comment notifications and updates
- **User Avatars**: Color-coded, deterministic avatars for easy identification
- **Comment History**: Full audit trail of all discussions and changes

### 📊 Dashboard & Analytics
- **Summary Statistics**: Overview of total fines, credits, and warnings
- **Recent Activity**: Timeline of latest comments and fine updates  
- **Filtered Views**: Sort and filter fines by type, date, user, or status
- **Compact List View**: Slack-inspired fine list with inline discussions

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes**: Customizable appearance preferences
- **Loading States**: Smooth skeleton loaders and progress indicators
- **Error Handling**: Graceful error recovery with helpful messages

### 🚀 Performance & Reliability
- **Server-side Rendering**: Fast initial page loads with Next.js App Router
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Query Caching**: Efficient data fetching with TanStack Query
- **Type Safety**: Full TypeScript coverage with runtime validation

## 🛠 Technology Stack

### **Frontend Framework**
- **Next.js 15** - React framework with App Router for modern development
- **React 19** - Latest React features with concurrent rendering
- **TypeScript 5** - Static type checking for robust code

### **Backend & Database**  
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Fine-grained access control and data protection
- **Database Migrations** - Version-controlled schema management

### **State Management**
- **TanStack Query v5** - Server state management with intelligent caching
- **Zustand** - Lightweight client state for UI interactions
- **React Hook Form** - Performant form state management

### **UI & Styling**
- **TailwindCSS 4** - Utility-first CSS framework with modern features
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled primitives for custom components
- **Lucide React** - Beautiful, consistent icon system

### **Validation & Safety**
- **Zod** - Runtime type validation and schema validation
- **ESLint** - Code linting with Next.js recommended rules
- **Prettier** - Consistent code formatting

### **Testing & Quality**
- **Vitest** - Fast unit testing with Vite integration
- **Testing Library** - Component testing utilities
- **Husky** - Git hooks for pre-commit quality checks

### **Development Tools**
- **TypeScript** - Full type safety from database to UI
- **Hot Module Replacement** - Instant development feedback
- **Error Boundaries** - Graceful error handling and recovery

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase Account** (free tier available)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fine-tracker.git
   cd fine-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize Supabase (if not done)
   supabase init
   
   # Start local development server
   supabase start
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Run database migrations**
   ```bash
   supabase db reset
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Common Setup Issues

**Supabase Connection Issues:**
- Verify your project URL and API keys
- Check that your project is not paused in the Supabase dashboard
- Ensure RLS policies are correctly configured

**Database Migration Errors:**
- Run `supabase db reset` to start fresh
- Check migration files in `supabase/migrations/`
- Verify your Supabase CLI is up to date

**TypeScript Errors:**
- Run `npm run build` to check for type issues
- Regenerate Supabase types: `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts`

## 📖 Usage

### Basic Workflow

1. **Authentication**
   - Sign up or log in using email authentication
   - User profiles are automatically created on first login

2. **Creating Fines**
   - Click "Create Fine" from the dashboard
   - Select the person being fined, fine type, amount, and description
   - Submit to instantly notify all team members

3. **Commenting & Discussion**
   - Click on any fine to view or add comments
   - Use threaded replies for organized discussions
   - Get real-time notifications when others comment

4. **Managing Fines**
   - View all fines in the compact Slack-style list
   - Filter by type, date, or search by description
   - Archive completed fines to keep the list clean

### Example Usage Scenarios

**Sports Team:**
```typescript
// Create a fine for missing practice
{
  subject: "John Smith",
  fine_type: "fine", 
  amount: 10.00,
  description: "Missed mandatory practice without notice"
}

// Add a credit for exceptional performance  
{
  subject: "Jane Doe",
  fine_type: "credit",
  amount: 5.00, 
  description: "Player of the match - 3 goals scored"
}
```

**Office Team:**
```typescript
// Warning for first offense
{
  subject: "Team Member",
  fine_type: "warning",
  amount: 0.00,
  description: "Left dishes in sink - friendly reminder"
}
```

### Comment Threading

The system supports Slack-style flat threading:
- **Top-level comments** are direct responses to fines
- **Replies** create threaded discussions under each comment
- **Real-time updates** keep all users synchronized
- **User avatars** provide visual context for discussions

## 📁 Project Structure

```
fine-tracker4/
├── public/                        # Static assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/         # Protected dashboard pages
│   │   │   ├── dashboard/
│   │   │   ├── totals/
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx           # Root layout with providers
│   │   └── page.tsx             # Landing page
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── features/            # Feature-specific components
│   │   │   ├── auth/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── protected-route.tsx
│   │   │   │   └── logout-button.tsx
│   │   │   ├── fines/
│   │   │   │   ├── fine-form.tsx
│   │   │   │   ├── fine-list.tsx
│   │   │   │   └── fine-thread.tsx
│   │   │   └── comments/
│   │   │       ├── comment-form.tsx
│   │   │       └── comment-list.tsx
│   │   └── providers/           # React context providers
│   │       ├── query-provider.tsx
│   │       ├── supabase-provider.tsx
│   │       └── auth-provider.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── auth/
│   │   │   ├── use-auth.ts
│   │   │   └── use-auth-with-profile.ts
│   │   ├── comments/
│   │   │   ├── use-comments.ts
│   │   │   └── use-realtime-comments.ts
│   │   └── fines/
│   │       └── use-fines.ts
│   │
│   ├── lib/
│   │   ├── supabase/           # Database integration
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   ├── middleware.ts   # Auth middleware
│   │   │   ├── types.ts        # Generated database types
│   │   │   └── queries/        # Database query functions
│   │   │       ├── fines.ts
│   │   │       └── comments.ts
│   │   ├── validations/        # Zod schemas
│   │   │   ├── fines.ts
│   │   │   └── comments.ts
│   │   └── utils.ts            # Utility functions
│   │
│   └── types/                  # TypeScript type definitions
│
├── supabase/                   # Supabase configuration
│   ├── config.toml
│   ├── migrations/             # Database migrations
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_fines.sql
│   │   └── 003_create_comments.sql
│   └── seed.sql               # Initial data
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

### Key Directories Explained

**`src/app/`** - Next.js App Router with route groups for organization
**`src/components/features/`** - Domain-specific components grouped by feature
**`src/hooks/`** - Custom hooks for data fetching and state management
**`src/lib/supabase/queries/`** - Reusable database query functions
**`src/lib/validations/`** - Zod schemas for type-safe data validation
**`supabase/migrations/`** - Version-controlled database schema changes

## 🔌 API Reference

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fines Table  
```sql
CREATE TYPE fine_type_enum AS ENUM ('fine', 'credit', 'warning');

CREATE TABLE fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES users(id),
  proposer_id UUID REFERENCES users(id),
  subject_name TEXT NOT NULL,
  proposer_name TEXT NOT NULL,
  fine_type fine_type_enum DEFAULT 'fine',
  amount DECIMAL(10,2) DEFAULT 0.00,
  description TEXT NOT NULL,
  comment_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_id UUID REFERENCES fines(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),
  author_id UUID REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,  
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Real-time Subscriptions

The application uses Supabase real-time subscriptions for live updates:

```typescript
// Listen for new fines
supabase
  .channel('fines')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'fines' },
    (payload) => handleNewFine(payload.new)
  )
  .subscribe();

// Listen for comment changes
supabase
  .channel(`comments:${fineId}`)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'comments', filter: `fine_id=eq.${fineId}` },
    (payload) => handleCommentChange(payload)
  )
  .subscribe();
```

## 👨‍💻 Development

### Development Workflow

1. **Start local Supabase**
   ```bash
   supabase start
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Make changes** - Hot reload automatically updates

4. **Run tests**
   ```bash
   npm run test        # Run unit tests
   npm run test:watch  # Watch mode
   npm run lint        # Check code quality
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run start       # Test production build locally
   ```

### Adding New Features

1. **Database changes** - Create new migration file
   ```bash
   supabase migration new add_feature_name
   ```

2. **Update types** - Regenerate TypeScript types
   ```bash
   supabase gen types typescript --project-id YOUR_ID > src/lib/supabase/types.ts
   ```

3. **Add validation** - Create Zod schemas in `src/lib/validations/`

4. **Create queries** - Add database functions in `src/lib/supabase/queries/`  

5. **Build hooks** - Create React Query hooks in `src/hooks/`

6. **Add components** - Build UI components in `src/components/features/`

### Code Style Guidelines

- Use TypeScript for all files
- Follow the existing component structure patterns
- Write descriptive commit messages
- Add JSDoc comments for complex functions
- Use semantic HTML and accessible components
- Follow the established naming conventions

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch  

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- fine-form.test.tsx
```

Test files are located alongside their components using the `.test.tsx` suffix.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect your repository**
   - Import your GitHub repository to Vercel
   - Vercel automatically detects Next.js configuration

2. **Configure environment variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key  
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```

3. **Deploy**
   ```bash
   # Automatic deployment on git push
   git push origin main
   
   # Or deploy manually
   vercel --prod
   ```

### Production Supabase Setup

1. **Create production project** in Supabase dashboard
2. **Run migrations** against production database
   ```bash
   supabase db push --project-ref your-project-ref
   ```
3. **Configure RLS policies** for security
4. **Set up custom domain** (optional)

### Environment Configuration

Create appropriate environment files:

**`.env.local`** (Development)
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
```

**`.env.production`** (Production)  
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Performance Optimization

- Images are automatically optimized by Next.js
- Static pages are pre-rendered at build time
- Database queries are optimized with proper indexing
- React Query provides intelligent caching
- Code splitting reduces initial bundle size

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Make your changes** following our code style guidelines  
4. **Add tests** for new functionality
5. **Run the test suite**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```
6. **Submit a pull request** with a clear description

### Areas for Contribution

- 🐛 **Bug fixes** - Help squash bugs and improve stability
- 🚀 **Performance improvements** - Optimize queries and rendering
- 📱 **Mobile enhancements** - Improve mobile user experience  
- 🎨 **UI/UX improvements** - Polish the interface and interactions
- 📖 **Documentation** - Improve guides and API documentation
- 🧪 **Testing** - Increase test coverage and add integration tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent real-time database platform
- **Vercel** for seamless Next.js hosting and deployment
- **shadcn/ui** for the beautiful, accessible component library
- **TanStack Query** for powerful data fetching and caching
- **The open source community** for the amazing tools and libraries

## 📞 Support

- 📧 **Email**: your-email@example.com
- 💬 **Discord**: [Join our community](https://discord.gg/your-server)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/fine-tracker/issues)
- 📖 **Documentation**: [Full documentation](https://docs.your-domain.com)

---

**Built with ❤️ by the Fine Tracker team**

*Making team accountability fun, transparent, and engaging.*
