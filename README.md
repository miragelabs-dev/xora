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
- 🔹 TailwindCSS 🎨 (Styling)
- 🔹 Shadcn/UI 🎯 (UI Components)
- 🔹 tRPC 🎯 (API layer)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PNPM package manager
- Docker & Docker Compose
- Chopin CLI

### Development Environment
```bash
# Install dependencies
pnpm install

# Start all development services
docker compose -f docker-compose.dev.yml up -d
```

The development environment will be available at:
- Next.js: http://localhost:3000
- Chopin Proxy: http://localhost:4000
- PostgreSQL: localhost:5432

> Note: The `docker-compose.dev.yml` automatically starts all required services including Next.js dev server and Chopin proxy.

### Production Environment
```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down
```

The production environment will be available at:
- Application: http://localhost (Nginx)
- Chopin Proxy: http://localhost:4000
- PostgreSQL: Internal network only

### Environment Structure
- **Development:**
  - PostgreSQL runs in Docker
  - Next.js runs locally
  - Chopin runs locally
  - Hot-reload enabled
  - Easy debugging

- **Production:**
  - All services in Docker
  - Nginx as reverse proxy
  - Optimized builds
  - Container orchestration
  - Automatic restarts

## 🚀 Deployment

### GitHub Actions Deployment
The project includes a GitHub Actions workflow for automatic deployment using self-hosted runners:

1. **Prerequisites:**
   - A self-hosted GitHub Actions runner
   - Docker installed on the runner
   - GitHub repository secrets configured:
     - `POSTGRES_USER`: Database username
     - `POSTGRES_PASSWORD`: Database password
     - `POSTGRES_DATABASE`: Database name
     - `DATABASE_URL`: Database URL

2. **Deployment Process:**
   - Automatically triggers on push to `main` branch
   - Uses self-hosted runner for deployment
   - Sets up environment variables
   - Rebuilds and restarts Docker containers

3. **Manual Deployment:**
   ```bash
   # Set required environment variables
   export POSTGRES_USER=your_user
   export POSTGRES_PASSWORD=your_password
   export POSTGRES_DATABASE=your_database
   export DATABASE_URL=your_database_url
   export NODE_ENV=production

   # Rebuild and restart containers
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d --build
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
