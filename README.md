# 🚀 Decentralized Social Network

Welcome to our Decentralized Twitter Clone built with Chopin Framework and Celestia! 🌐✨ This project aims to create a censorship-resistant, secure, and scalable social network.

## 🏆 Why This Project?
Existing social networks are either centralized (X) or don't fully inherit blockchain security (Farcaster). Our solution leverages Chopin Framework + Celestia to ensure true decentralization while remaining scalable.

## ⚙️ Tech Stack
- 🔹 Chopin Framework 🛠️ (Modular blockchain infra)
- 🔹 Celestia 🌐 (Data availability & security)
- 🔹 Next.js ⚡ (Frontend framework)
- 🔹 PostgreSQL 🗄️ (Database)
- 🔹 Drizzle ORM 🎯 (TypeScript ORM)
- 🔹 Cloudinary ☁️ (Image storage) 
- 🔹 TailwindCSS 🎨 (Styling)
- 🔹 Shadcn/UI 🎯 (UI Components)
- 🔹 tRPC 🎯 (API layer)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PNPM package manager
- Chopin CLI
- Docker (for local development)

### Installation
```bash
# Copy .env.example to .env and set the environment variables
cp .env.example .env

# Database setup
docker compose up -d

# Install dependencies
pnpm install

# Migrate database
pnpm db:push

# Start Chopin node & Development server
npx chopd
```

## 📋 TODO List

### Core Features
- [x] Retweet functionality
- [x] Bookmarks management
- [x] Comments and replies system
- [x] Enhanced user profiles
- [ ] Post dropdown menu improvements:
  - [ ] Copy text
  - [ ] Copy post URL
- [ ] Notification system:
  - [x] Retweet notifications
  - [x] Comment notifications
  - [x] Like notifications
  - [ ] Follow notifications

### Layout Enhancements
- [ ] Right sidebar search functionality
- [ ] "Who to follow" section:
  - [ ] Random user suggestions

## 🛠️ Development Guidelines
This project includes Cursor AI rules (`.mdc` files) for consistent development practices:
- TypeScript best practices and style guidelines
- Next.js App Router specific guidelines
- Performance optimization rules
- Tailwind CSS styling conventions
- Shadcn UI and Radix UI component conventions
- General project conventions and standards

## 📜 License
MIT License. Use, modify, and contribute freely. 📝

👀 Stay tuned for updates & feel free to share your thoughts! 🚀
