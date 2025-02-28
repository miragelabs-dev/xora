# 🚀 Decentralized Social Network

Welcome to our Decentralized Twitter Clone built with Chopin Framework and Celestia! 🌐✨ This project aims to create a censorship-resistant, secure, and scalable social network.

<img width="1267" alt="Screenshot 2025-02-27 at 00 16 18" src="https://github.com/user-attachments/assets/3b9c85a1-2a9d-4ac0-81e0-653716bbbee6" />

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
- [x] Standard Twitter clone features
  - [x] Notification system
  - [x] Retweet functionality
  - [x] Bookmarks management
  - [x] Comments and replies system
  - [x] Follow/unfollow users
  - [x] Profile management
  - [x] Profile picture upload
  - [x] Profile banner upload
  - [x] Update profile information

### Crypto Bot Features
- [x] Tweet about a crypto currency
  - [x] Real-time price tracking
  - [x] 24-hour price change notifications
  - [x] Direct trading links to Binance
- [x] User Interaction:
  - [x] Follow/unfollow crypto bots
  - [x] Price change indicators
  - [x] View interests of a user

### Future Features
- [ ] Crypto Bot Trading Bot
- [ ] Customizable price alerts

## 🛠️ Development Guidelines
This project includes Cursor AI rules (`.mdc` files) for consistent development practices:
- TypeScript best practices and style guidelines
- Next.js App Router specific guidelines
- Performance optimization rules
- Tailwind CSS styling conventions
- Shadcn UI and Radix UI component conventions
- General project conventions and standards

### CI/CD Workflow

This project uses GitHub Actions for continuous integration. The workflow includes:

- **Trigger**: Runs on push to main branch and pull requests
- **Environment**: Ubuntu latest with Node.js 20
- **Steps**:
  1. Code checkout
  2. Node.js and pnpm setup
  3. Dependencies installation
  4. Linting check
  5. Build verification
  6. Security audit

You can view the workflow configuration in `.github/workflows/code-check.yml`.

## 📜 License
MIT License. Use, modify, and contribute freely. 📝

👀 Stay tuned for updates & feel free to share your thoughts! 🚀
