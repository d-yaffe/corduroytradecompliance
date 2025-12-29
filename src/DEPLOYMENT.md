# Vercel Deployment Guide

Complete guide for deploying Corduroy AI Compliance to Vercel.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 📋 Pre-Deployment Checklist

- [ ] Git repository is set up (GitHub, GitLab, or Bitbucket)
- [ ] All code is committed and pushed
- [ ] `.env` variables are documented in `.env.example`
- [ ] Node.js version is >= 18.0.0

## 🔧 Vercel Configuration

The project includes a `vercel.json` file with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## 🌐 Step-by-Step Deployment

### Method 1: Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or login with your Git provider

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your Git repository
   - Vercel will auto-detect the Vite framework

3. **Configure Project (Optional)**
   - Add environment variables if needed
   - Configure domain settings
   - Set up team permissions

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live!

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Method 3: Git Integration (Continuous Deployment)

1. **Connect Repository**
   - In Vercel dashboard, import your Git repository
   - Vercel automatically sets up Git integration

2. **Automatic Deployments**
   - **Production**: Every push to `main` branch
   - **Preview**: Every pull request gets a preview URL
   - **Rollback**: Easy rollback to previous deployments

## 🔐 Environment Variables

If you need environment variables:

1. **In Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add your variables:
     - `VITE_API_URL`
     - `VITE_API_KEY`
     - etc.

2. **Via Vercel CLI**
   ```bash
   vercel env add VITE_API_URL
   ```

3. **For Different Environments**
   - Production
   - Preview
   - Development

## 🌍 Custom Domain Setup

1. **Add Domain**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `app.usecorduroy.com`)

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers for full DNS management

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Renews automatically

## 📊 Performance Optimization

The project is configured for optimal performance:

### 1. Code Splitting
```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      'react-vendor': ['react', 'react-dom'],
      'ui-vendor': ['lucide-react', 'recharts'],
    },
  },
}
```

### 2. Asset Caching
```json
// vercel.json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

### 3. Compression
- Vercel automatically enables Brotli/Gzip compression

## 🔍 Post-Deployment Verification

### Check these after deployment:

- [ ] Homepage loads correctly
- [ ] Authentication flow works (login/signup)
- [ ] Classify product feature works
- [ ] Bulk upload processes files
- [ ] Product profiles display correctly
- [ ] All images and assets load
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] SSL certificate is active (https)

### Test URLs:
```bash
# Production
https://your-app.vercel.app

# With custom domain
https://app.usecorduroy.com
```

## 🐛 Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build
```bash
# Solution: Check TypeScript configuration
npm run build
```

**Issue**: Missing dependencies
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**Issue**: 404 on page refresh
- ✅ Already handled by `vercel.json` rewrites

**Issue**: Environment variables not working
- Make sure they start with `VITE_`
- Restart the build after adding variables

**Issue**: Images not loading
- Check `figma:asset` imports are correct
- Verify images are included in build

## 📈 Monitoring & Analytics

### Vercel Analytics (Optional)

1. **Enable Analytics**
   - Go to Project Settings → Analytics
   - Enable Vercel Analytics

2. **View Metrics**
   - Page views
   - Performance scores
   - Web Vitals

### Custom Analytics

Add to `.env`:
```bash
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run build
```

## 🚦 Deployment Checklist

Before going live:

- [ ] Test all features in preview deployment
- [ ] Verify demo credentials work
- [ ] Check mobile responsiveness
- [ ] Test in different browsers
- [ ] Set up custom domain
- [ ] Configure environment variables
- [ ] Enable HTTPS/SSL
- [ ] Set up error monitoring
- [ ] Configure analytics
- [ ] Create backup/rollback plan
- [ ] Document deployment process
- [ ] Train team on deployment workflow

## 📞 Support

### Vercel Support
- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

### Corduroy AI Support
- Email: [support@usecorduroy.com](mailto:support@usecorduroy.com)

## 🎉 Success!

Your Corduroy AI Compliance app is now live on Vercel!

**Production URL**: `https://your-app.vercel.app`

---

Last updated: December 2024
