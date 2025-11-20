# 🐳 Docker Deployment Guide

Panduan lengkap untuk mendeploy **Kalkulator Pajak Pro** menggunakan Docker.

## 📋 Prerequisites

- Docker Engine 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose 2.0+ (biasanya sudah termasuk dengan Docker Desktop)
- GEMINI_API_KEY dari [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Quick Start

### Menggunakan Docker Compose (Recommended)

1. **Clone repository dan masuk ke direktori project**
   ```bash
   cd kalkulator-pajak-pro
   ```

2. **Set environment variables**
   ```bash
   # Copy template .env
   cp .env.example .env
   
   # Edit .env dan masukkan GEMINI_API_KEY Anda
   # Windows (PowerShell):
   notepad .env
   
   # Linux/Mac:
   nano .env
   ```

3. **Build dan jalankan container**
   ```bash
   docker-compose up -d
   ```

4. **Akses aplikasi**
   
   Buka browser dan akses: http://localhost:8080

### Menggunakan Docker CLI

1. **Build image**
   ```bash
   docker build -t kalkulator-pajak-pro:latest \
     --build-arg GEMINI_API_KEY=your_api_key_here .
   ```

2. **Run container**
   ```bash
   docker run -d \
     --name kalkulator-pajak-pro \
     -p 8080:80 \
     --restart unless-stopped \
     kalkulator-pajak-pro:latest
   ```

3. **Akses aplikasi**
   
   Buka browser dan akses: http://localhost:8080

## 🏗️ Architecture

Dockerfile menggunakan **multi-stage build** untuk optimasi:

1. **Stage 1 (Builder)**: 
   - Base image: `node:20-alpine`
   - Install dependencies dengan pnpm
   - Build aplikasi Vite
   - Output: `/app/dist`

2. **Stage 2 (Production)**:
   - Base image: `nginx:alpine`
   - Copy built assets dari stage 1
   - Serve dengan nginx
   - Final image size: ~25MB (sangat ringan!)

## 📦 Production Features

### ✅ Optimizations

- **Multi-stage build** - Image size minimal
- **Gzip compression** - Transfer data lebih cepat
- **Static asset caching** - Cache 1 tahun untuk assets
- **Health checks** - Monitoring container health
- **Security headers** - X-Frame-Options, CSP, dll
- **SPA routing** - Fallback ke index.html untuk semua routes

### 🔒 Security

Nginx dikonfigurasi dengan security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Referrer-Policy`

## 🛠️ Commands

### Docker Compose

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Check status
docker-compose ps
```

### Docker CLI

```bash
# View logs
docker logs -f kalkulator-pajak-pro

# Stop container
docker stop kalkulator-pajak-pro

# Start container
docker start kalkulator-pajak-pro

# Remove container
docker rm -f kalkulator-pajak-pro

# View container stats
docker stats kalkulator-pajak-pro

# Execute command in container
docker exec -it kalkulator-pajak-pro sh
```

## 🌐 Production Deployment

### Deploy ke Cloud Platform

#### **1. Google Cloud Run**

```bash
# Build dan push ke Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/kalkulator-pajak-pro

# Deploy ke Cloud Run
gcloud run deploy kalkulator-pajak-pro \
  --image gcr.io/PROJECT_ID/kalkulator-pajak-pro \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_api_key
```

#### **2. AWS ECS/Fargate**

```bash
# Login ke ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Build dan push
docker build -t kalkulator-pajak-pro .
docker tag kalkulator-pajak-pro:latest ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/kalkulator-pajak-pro:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/kalkulator-pajak-pro:latest

# Deploy menggunakan ECS CLI atau AWS Console
```

#### **3. DigitalOcean App Platform**

```bash
# Push ke Docker Hub
docker build -t username/kalkulator-pajak-pro:latest .
docker push username/kalkulator-pajak-pro:latest

# Deploy via DigitalOcean Console atau doctl CLI
```

#### **4. Heroku Container Registry**

```bash
# Login ke Heroku Container Registry
heroku container:login

# Build dan push
heroku container:push web -a your-app-name

# Release
heroku container:release web -a your-app-name
```

### Reverse Proxy dengan Custom Domain

Jika menggunakan reverse proxy (nginx/traefik) di server:

```nginx
# /etc/nginx/sites-available/kalkulator-pajak.conf
server {
    listen 80;
    server_name kalkulator-pajak.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Dengan SSL (Let's Encrypt):

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Dapatkan SSL certificate
sudo certbot --nginx -d kalkulator-pajak.yourdomain.com
```

## 🔍 Troubleshooting

### Container tidak start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps
```

### Port sudah digunakan

Ubah port di `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Ganti 8080 ke port lain
```

### Build error

```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Health check failed

```bash
# Check nginx status
docker exec kalkulator-pajak-pro nginx -t

# Check health endpoint
curl http://localhost:8080/health
```

## 📊 Monitoring

### Health Check

Container memiliki built-in health check:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' kalkulator-pajak-pro
```

Health check endpoint: `http://localhost:8080/health`

### Resource Usage

```bash
# Monitor real-time stats
docker stats kalkulator-pajak-pro

# View container info
docker inspect kalkulator-pajak-pro
```

## 🔄 Updates

### Update aplikasi

```bash
# Pull latest code
git pull origin main

# Rebuild dan restart
docker-compose up -d --build
```

### Update dependencies

```bash
# Update package.json
# Rebuild image
docker-compose build --no-cache
docker-compose up -d
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API Key | Yes | - |
| `NODE_ENV` | Environment mode | No | `production` |

## 🎯 Best Practices

1. **Jangan commit `.env` file** - Gunakan `.env.example` sebagai template
2. **Gunakan secrets management** untuk production (AWS Secrets Manager, GCP Secret Manager, dll)
3. **Set resource limits** untuk container:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```
4. **Backup data** jika menggunakan volumes
5. **Monitor logs** secara regular
6. **Update base images** secara berkala untuk security patches

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## 🆘 Support

Jika mengalami masalah, silakan:
1. Check logs: `docker-compose logs -f`
2. Buka issue di GitHub repository
3. Konsultasi dokumentasi Docker dan Vite

---

**Happy Deploying! 🚀**
