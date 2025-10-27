# 📖 Installation Guide

Detailed installation instructions for the Taman Kehati project.

## Prerequisites

### System Requirements
- **Operating System**: macOS, Linux, or Windows
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **CPU**: 2+ cores recommended

### Required Software
- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
- **Git**: [Download here](https://git-scm.com/downloads)
- **Code Editor**: VS Code recommended

## Installation Methods

### Method 1: Docker (Recommended)

#### Step 1: Install Docker Desktop
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Verify installation:
   ```bash
   docker --version
   docker compose --version
   ```

#### Step 2: Clone Repository
```bash
git clone <repository-url>
cd tamankehati_21
```

#### Step 3: Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit environment variables if needed
nano .env
```

#### Step 4: Start Services
```bash
# Make script executable
chmod +x docker-dev.sh

# Start all services
./docker-dev.sh start
```

#### Step 5: Verify Installation
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Method 2: Manual Installation

#### Backend Installation

##### Prerequisites
- Python 3.12+
- PostgreSQL 15+
- Redis 7+

##### Step 1: Python Setup
```bash
cd apps/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

##### Step 2: Database Setup
```bash
# Create database
createdb -h localhost -U postgres kehati_db

# Run migrations
alembic upgrade head
```

##### Step 3: Start Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Installation

##### Prerequisites
- Node.js 20+
- npm or yarn

##### Step 1: Install Dependencies
```bash
cd apps/frontend
npm install
```

##### Step 2: Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit environment variables
nano .env.local
```

##### Step 3: Start Frontend
```bash
npm run dev
```

## Platform-Specific Instructions

### macOS Installation

#### Using Homebrew
```bash
# Install Docker Desktop
brew install --cask docker

# Install Git (if not installed)
brew install git

# Install Node.js (for manual installation)
brew install node

# Install PostgreSQL (for manual installation)
brew install postgresql
brew services start postgresql
```

#### Using MacPorts
```bash
# Install Docker Desktop from website
# Install Git
sudo port install git

# Install Node.js
sudo port install nodejs20

# Install PostgreSQL
sudo port install postgresql15
```

### Linux Installation

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Git
sudo apt install git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### CentOS/RHEL/Fedora
```bash
# Install Docker
sudo dnf install docker-ce docker-ce-cli containerd.io

# Install Git
sudo dnf install git

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs

# Install PostgreSQL
sudo dnf install postgresql postgresql-server
```

### Windows Installation

#### Using Chocolatey
```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker Desktop
choco install docker-desktop

# Install Git
choco install git

# Install Node.js
choco install nodejs
```

#### Manual Installation
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Download Git from [git-scm.com](https://git-scm.com/downloads)
3. Download Node.js from [nodejs.org](https://nodejs.org/)

## Configuration

### Environment Variables

#### Required Variables
```bash
# Database
DATABASE_URL="postgresql+asyncpg://kehati_user:kehati_password@localhost:5432/kehati_db"

# Security
SECRET_KEY="your-secret-key-change-in-production"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

#### Optional Variables
```bash
# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Debug mode
DEBUG="true"

# Log level
LOG_LEVEL="INFO"
```

### Database Configuration

#### PostgreSQL Setup
```bash
# Create user and database
sudo -u postgres psql

# In PostgreSQL shell:
CREATE USER kehati_user WITH PASSWORD 'kehati_password';
CREATE DATABASE kehati_db OWNER kehati_user;
GRANT ALL PRIVILEGES ON DATABASE kehati_db TO kehati_user;
\q
```

#### Redis Setup
```bash
# Start Redis server
redis-server

# Test connection
redis-cli ping
```

## Verification

### Check Installation
```bash
# Check Docker services
docker compose ps

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check database connection
docker compose exec backend python -c "from core.database import engine; print('DB OK')"
```

### Test Features
1. **User Registration**: Visit http://localhost:3000/register
2. **User Login**: Visit http://localhost:3000/login
3. **API Documentation**: Visit http://localhost:8000/docs
4. **Dashboard**: Login and access dashboard

## Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Check Docker status
docker --version
docker compose --version

# Restart Docker Desktop
# Check if ports are available
lsof -i :3000
lsof -i :8000
```

#### Database Issues
```bash
# Check PostgreSQL status
docker compose exec postgres pg_isready

# Check database connection
docker compose exec backend python -c "from core.database import engine; engine.connect()"
```

#### Frontend Issues
```bash
# Check Node.js version
node --version
npm --version

# Clear cache
rm -rf apps/frontend/.next
rm -rf apps/frontend/node_modules
npm install
```

### Getting Help
- Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Review [Docker Setup Guide](docker-setup.md)
- See [Quick Start Guide](quick-start.md)

## Next Steps

After successful installation:
1. [Quick Start Guide](quick-start.md) - Get up and running
2. [Development Workflow](../development/workflow.md) - Start developing
3. [API Documentation](../development/api-docs.md) - Learn the API
4. [Features Overview](../features/) - Explore features

## Uninstallation

### Docker Method
```bash
# Stop and remove containers
docker compose down -v

# Remove images
docker rmi $(docker images -q)

# Remove volumes
docker volume prune
```

### Manual Method
```bash
# Stop services
# Remove virtual environment
rm -rf apps/backend/venv

# Remove node_modules
rm -rf apps/frontend/node_modules

# Remove database (if local)
dropdb kehati_db
```

## Related Documentation

- [Quick Start Guide](quick-start.md)
- [Docker Setup Guide](docker-setup.md)
- [Development Workflow](../development/workflow.md)
- [Troubleshooting Guide](../troubleshooting/common-issues.md)
