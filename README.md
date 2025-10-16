# Mysteria Frontend

A modern Vue 3 frontend for Mysteria, a Lord of The Mysteries-inspired Minecraft server. Built with TypeScript, Vite, and Pinia.

## ✨ Features

-   **Authentication**: Discord OAuth for user login.
-   **User Profiles**: View and manage user information.
-   **E-commerce**: In-game item shop.
-   **News & Updates**: Announcements and articles.
-   **Admin Panel**: Content and user management.
-   **Static Pages**: Rules, guides, and wiki.
-   **Multi-language Support**: English and Ukrainian.

## 🛠 Tech Stack

-   **Framework**: Vue 3 (Composition API)
-   **Language**: TypeScript
-   **Build Tool**: Vite
-   **State Management**: Pinia
-   **Routing**: Vue Router
-   **Styling**: PostCSS
-   **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

-   [Bun](https://bun.sh/) or Node.js 18+

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd mysteria-frontend
    ```

2.  Install dependencies:
    ```bash
    bun install
    ```

### Development

Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:8100`.

### Building for Production

```bash
bun run build
```

## 📁 Project Structure

```
src/
├── assets/            # Static assets (images, styles, fonts)
├── components/        # Reusable Vue components
│   ├── admin/
│   ├── layout/
│   ├── profile/
│   ├── shop/
│   └── ui/
├── composables/       # Vue composables (e.g., useI18n)
├── router/            # Vue Router configuration
├── services/          # Business logic services
├── stores/            # Pinia state management stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and API helpers
└── views/             # Page-level components
```

## 📄 License

This project is private and proprietary to Mysterria.