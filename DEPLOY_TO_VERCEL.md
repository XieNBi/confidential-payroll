# 🚀 Deploy to Vercel (China-Friendly)

Vercel is more accessible in China compared to Netlify.

## Quick Deploy

### Method 1: From GitHub (Auto-deploy)

1. Visit: https://vercel.com/
2. Sign up with GitHub
3. Click **"Add New"** → **"Project"**
4. Import: **XieNBi/confidential-payroll**
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

Done! Your site will be at: `https://your-project.vercel.app`

### Method 2: CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd E:\ZAMAcode\004\frontend
vercel --prod
```

## Advantages over Netlify

- ✅ Better accessibility in China
- ✅ Faster edge network in Asia
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy

## Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```



