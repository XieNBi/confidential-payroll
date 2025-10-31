# 🚀 Deploy to Netlify Guide

Complete guide to deploy your Confidential Payroll System frontend to Netlify.

## 📋 Prerequisites

- ✅ GitHub repository is set up: https://github.com/XieNBi/confidential-payroll
- ✅ Netlify account (free tier is sufficient)
- ✅ Smart contracts deployed to Sepolia testnet

---

## 🎯 Deployment Methods

### Method 1: Deploy from GitHub (Recommended)

This method enables automatic deployments whenever you push to GitHub.

#### Step 1: Connect to Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Sign up with GitHub"** (easiest option)

#### Step 2: Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub account
4. Select repository: **`XieNBi/confidential-payroll`**

#### Step 3: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

#### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://random-name-123456.netlify.app`

#### Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to set up your domain

---

### Method 2: Manual Deploy (Drag & Drop)

This method is faster but requires manual re-deployment for updates.

#### Step 1: Build Locally

```bash
# Navigate to frontend directory
cd E:\ZAMAcode\004\frontend

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This creates a `frontend/dist/` folder with optimized production files.

#### Step 2: Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Log in to your account
3. Drag and drop the entire **`frontend/dist`** folder onto the Netlify dashboard
4. Wait for deployment to complete
5. Your site is live!

---

### Method 3: Netlify CLI

For advanced users who prefer command line.

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login

```bash
netlify login
```

This opens your browser for authentication.

#### Step 3: Initialize and Deploy

```bash
# Navigate to project root
cd E:\ZAMAcode\004

# Initialize Netlify (first time only)
netlify init

# Deploy
netlify deploy --prod
```

---

## ⚙️ Configuration Files

### `netlify.toml` (Already Created)

Located in project root. Key settings:

```toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Important Notes:

1. **SPA Redirect**: The `/*` → `/index.html` redirect ensures React Router works correctly
2. **Base Directory**: Set to `frontend/` so Netlify knows where to find package.json
3. **Node Version**: Set to Node 18 for compatibility

---

## 🔧 Post-Deployment Configuration

### Update Contract Addresses (If Needed)

If you deploy new contracts, update `frontend/src/constants/contracts.ts`:

```typescript
export const PAYROLL_SIMPLE_ADDRESS = "0xYourNewAddress";
export const PAYROLL_FHE_ADDRESS = "0xYourNewAddress";
```

Then push to GitHub (auto-deploys) or rebuild manually.

### Environment Variables

Netlify doesn't need environment variables for this project (all configs are in the frontend code), but if you add any:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add your variables
4. Redeploy

---

## 🌐 Custom Domain Setup

### Option 1: Netlify Subdomain (Free)

1. Go to **Site settings** → **Domain management** → **Custom domains**
2. Click **"Options"** → **"Edit site name"**
3. Change from `random-name-123456` to `confidential-payroll`
4. Your site: `https://confidential-payroll.netlify.app`

### Option 2: Your Own Domain

1. Purchase domain from provider (Namecheap, GoDaddy, etc.)
2. In Netlify: **Site settings** → **Domain management** → **Add custom domain**
3. Enter your domain: `yourdomain.com`
4. Follow Netlify's DNS configuration instructions

**Example DNS Records:**

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

---

## 📊 Build Status

### Check Build Logs

1. Go to **Deploys** tab
2. Click on latest deployment
3. View **Deploy log** for any errors

### Common Build Errors

#### Error: "Command not found: npm"
**Solution**: Node version issue. Add to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

#### Error: "Cannot find module"
**Solution**: Clear cache and rebuild
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Clear cache and retry deploy"**

#### Error: "Out of memory"
**Solution**: Increase build memory (may require paid plan)

---

## 🚀 Performance Optimization

### Enable HTTPS (Auto-enabled)

Netlify provides free SSL certificates automatically.

### Enable Asset Optimization

Already configured in `netlify.toml`:
- CSS/JS minification
- Image compression
- Caching headers

### Custom Headers

Security headers are already set in `netlify.toml`:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

---

## 📈 Monitoring & Analytics

### Netlify Analytics (Optional, Paid)

1. Go to **Site settings** → **Analytics**
2. Enable **Netlify Analytics** ($9/month)
3. View visitor stats, bandwidth, etc.

### Free Alternative: Google Analytics

Add to `frontend/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Once connected to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Netlify auto-deploys in ~2 minutes
```

### Deploy Contexts

Netlify supports different deploy contexts:

- **Production**: `main` branch → `yourdomain.com`
- **Branch Deploys**: Other branches → `branch-name--yourdomain.netlify.app`
- **Deploy Previews**: Pull requests → `deploy-preview-123--yourdomain.netlify.app`

---

## 🎨 Status Badge

Add deployment status to your README:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)
```

Find your site ID: **Site settings** → **General** → **Site details**

---

## 🐛 Troubleshooting

### MetaMask Not Connecting

**Issue**: MetaMask shows connection but doesn't work

**Solution**: 
- Clear browser cache
- Ensure you're on Sepolia network
- Check browser console for errors

### Contract Addresses Not Found

**Issue**: "Contract not deployed" error

**Solution**:
1. Verify contract addresses in `frontend/src/constants/contracts.ts`
2. Ensure contracts are deployed on Sepolia
3. Check network in MetaMask

### Build Timeout

**Issue**: Build takes too long and times out

**Solution**:
- Free tier timeout: 15 minutes
- Optimize dependencies
- Consider upgrading plan

---

## 📞 Support

### Netlify Support
- [Netlify Docs](https://docs.netlify.com/)
- [Community Forum](https://answers.netlify.com/)
- [Status Page](https://www.netlifystatus.com/)

### Project Issues
- [GitHub Issues](https://github.com/XieNBi/confidential-payroll/issues)

---

## ✅ Deployment Checklist

Before going live:

- [ ] Smart contracts deployed on Sepolia
- [ ] Contract addresses updated in code
- [ ] Build completes successfully locally (`npm run build`)
- [ ] Test on Sepolia testnet
- [ ] MetaMask connection works
- [ ] All features functional
- [ ] README updated with live demo link
- [ ] Analytics configured (optional)
- [ ] Custom domain set up (optional)

---

## 🎉 Success!

Your Confidential Payroll System is now live on Netlify!

**Next Steps:**
1. Test thoroughly on live site
2. Share with Zama community
3. Submit to Zama Developer Program
4. Monitor analytics
5. Iterate and improve

---

**Built with ❤️ for Zama Developer Program**



