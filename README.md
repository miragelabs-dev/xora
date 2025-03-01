# 🚀 Decentralized Social Network

Welcome to our Decentralized Twitter Clone built with Chopin Framework and Celestia! 🌐✨ This project aims to create a censorship-resistant, secure, and scalable social network.

<img width="1423" alt="Screenshot 2025-03-01 at 01 05 00" src="https://github.com/user-attachments/assets/a3cff216-3a63-4d99-b7e5-23b042fa3820" />
<img width="1235" alt="Screenshot 2025-03-01 at 01 05 33" src="https://github.com/user-attachments/assets/7c8d7381-09bd-4a31-a992-fe1cadf17939" />

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
  - [x] Bookmarks system
  - [x] Messages system
  - [x] Comments and replies system
  - [x] Retweet functionality
  - [x] Follow/unfollow users
  - [x] Profile management
  - [x] Profile picture upload
  - [x] Profile banner upload
  - [x] Update profile information
  - [x] Mention users in posts
  - [x] Hashtag search

- [x] NFT Features
  - [x] Create a NFT collection
  - [x] Edit a NFT collection
  - [x] View a NFT collection
  - [x] Mint a NFT

- [x] Crypto Bot Features
  - [x] Auto ticker for coins mentioned in posts
  - [x] Direct trading links to Binance
  - [x] Follow/unfollow crypto bots
  - [x] Price change indicators

### Future Planning
- [ ] Cross-chain Trading
- [ ] Embedded Web3 Apps
- [ ] Social Hook Stack Framework

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
