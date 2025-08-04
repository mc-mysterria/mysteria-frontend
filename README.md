# UAProject Frontend

A modern Vue 3 gaming community platform built with TypeScript, Vite, and Pinia. This application serves as the frontend for a gaming community website featuring user applications, court systems, news, shop functionality, and support tickets.

## ✨ Features

- **User Management**: Discord OAuth authentication with role-based permissions
- **Application System**: Multi-step application forms with status tracking
- **Court System**: Community-driven dispute resolution with case management
- **News Platform**: Admin-controlled news creation and publishing
- **E-commerce**: Shop functionality with subscription management
- **Support System**: Real-time ticket system with WebSocket chat
- **Community Features**: Player statistics dashboard and team profiles
- **Real-time Updates**: WebSocket integration for live data

## 🛠 Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Testing**: Vitest + jsdom
- **Styling**: PostCSS + Custom CSS
- **Package Manager**: Bun
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics

## 📁 Project Structure

```
src/
├── components/        # Feature-organized Vue components
│   ├── application/   # Application system components
│   ├── court/         # Court system components
│   ├── home/          # Homepage components
│   ├── layout/        # Layout components (header, footer, sidebar)
│   ├── news/          # News system components
│   ├── profile/       # User profile components
│   ├── shop/          # E-commerce components
│   ├── tickets/       # Support ticket components
│   └── ui/            # Reusable UI components
├── stores/            # Pinia state management
├── views/             # Page-level components
├── utils/api/         # API client classes
├── types/             # TypeScript definitions
├── services/          # Business logic services
├── composables/       # Vue composables
└── assets/            # Static assets
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd new-frontend

# Install dependencies
bun install
```

### Development

```bash
# Start development server with hot reload
bun dev

# The application will be available at http://localhost:8100
```

### Building

```bash
# Type-check and build for production
bun run build

# Preview production build
bun run preview
```

## 🧪 Testing

```bash
# Run unit tests
bun test:unit

# Run tests in watch mode
bun test:unit --watch
```

## 🔧 Code Quality

```bash
# Lint with ESLint (auto-fix)
bun lint

# Format code with Prettier
bun run format

# Type checking only
bun run type-check
```

## 🌐 API Integration

The application integrates with multiple backend services:

- **Main API** (`/api`): Core application functionality
- **Aphrodite API** (`/aphrodite`): User management
- **Plan API** (`/plan`): Planning and scheduling
- **Anaya API** (`/anaya`): Additional services
- **Catwalk API** (`/catwalk`): Statistics and analytics

All API endpoints are proxied through Vite for development.

## 🏗 Architecture Highlights

### State Management
- Pinia stores with dedicated watchers for real-time updates
- Feature-based store organization (auth, balance, applications, etc.)
- Centralized error handling and notifications

### Component Architecture
- Feature-driven component organization
- Reusable UI component library
- Composition API throughout for better TypeScript support

### Performance Optimizations
- Route-based code splitting
- Custom Vite chunk optimization
- Tree-shaking and minification with Terser
- Asset optimization and compression

## 🔒 Security Features

- Cookie-based authentication with Discord OAuth
- Route guards for protected pages
- Input sanitization with DOMPurify
- Error tracking with Sentry
- CORS configuration for API security

## 🎨 Development Guidelines

### IDE Setup
- **Recommended**: VSCode with Volar extension
- Disable Vetur if installed
- TypeScript strict mode enabled

### Code Style
- ESLint + Prettier configuration
- Vue 3 Composition API preferred
- TypeScript strict typing
- Feature-based file organization

## 📱 Browser Support

- Modern browsers with ES2020+ support
- Mobile-responsive design
- Progressive Web App features

## 🚢 Deployment

The application is configured for deployment on Vercel with:
- Automatic builds on push
- Environment variable management
- CDN optimization
- Analytics integration

## 📄 License

This project is private and proprietary to UAProject.

## 🤝 Contributing

1. Follow the established code style and architecture patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure all checks pass before submitting PRs

## 📞 Support

For technical support or questions about the codebase, please refer to the project documentation or contact the development team.
