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
docker-compose -f docker-compose.dev.yml up -d
```

The development environment will be available at:
- Next.js: http://localhost:3000
- Chopin Proxy: http://localhost:4000
- PostgreSQL: localhost:5432

> Note: The `docker-compose.dev.yml` automatically starts all required services including Next.js dev server and Chopin proxy.

### Production Environment
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
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
The project includes a GitHub Actions workflow for automatic deployment to a VPS:

1. **Prerequisites:**
   - A VPS with Docker installed
   - SSH access to the VPS
   - GitHub repository secrets configured:
     - `VPS_HOST`: Your VPS IP/hostname
     - `VPS_USERNAME`: SSH username
     - `VPS_SSH_KEY`: SSH private key
     - `REPO_URL`: Repository URL
     - `DOMAIN`: Your domain name

2. **Environment Variables:**
   Configure these GitHub variables:
   - `POSTGRES_USER`: Database username
   - `POSTGRES_PASSWORD`: Database password
   - `POSTGRES_DATABASE`: Database name
   - `DATABASE_URL`: Database URL
   
3. **SSL Certificate Setup:**
   The deployment process automatically handles SSL certificate generation:
   - First deployment will generate SSL certificates using Let's Encrypt
   - Certificates auto-renew every 12 hours if needed
   - Uses webroot method for domain validation
   - Nginx automatically reloads when certificates are renewed

4. **Manual SSL Setup:**
   If you need to manually manage SSL certificates:
   ```bash
   # SSH into your VPS
   ssh your-username@your-vps

   # Navigate to app directory
   cd nextjs-app

   # Initialize SSL certificate
   ./scripts/init-ssl.sh your-domain.com
   ```

5. **Deployment Process:**
   - Automatically triggers on push to `main` branch
   - Clones/updates code on VPS
   - Sets up environment variables
   - Manages SSL certificates
   - Rebuilds and restarts Docker containers

6. **Manual Deployment:**
   ```bash
   # SSH into your VPS
   ssh your-username@your-vps

   # Navigate to app directory
   cd nextjs-app

   # Pull latest changes
   git pull origin main

   # Rebuild and restart containers
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
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
