# Ghostly by Plugzy - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
1. Shopify Partner Account
2. Production Shopify Store
3. Hosting Platform (Heroku, Vercel, Railway, etc.)

### Step 1: Environment Setup
1. Copy `.env.production` to `.env` 
2. Update these critical values:
   ```
   SHOPIFY_API_KEY=your_actual_api_key
   SHOPIFY_API_SECRET=your_actual_secret
   HOST=https://your-domain.com
   DATABASE_URL=your_database_url
   SESSION_SECRET=random_secure_string
   ```

### Step 2: Shopify App Setup
1. Create new app in Shopify Partners
2. Set App URL to your domain
3. Set Allowed redirection URLs
4. Copy API credentials to `.env`

### Step 3: Deploy to Platform

#### Heroku Deployment:
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set SHOPIFY_API_KEY=your_key
heroku config:set SHOPIFY_API_SECRET=your_secret
heroku config:set HOST=https://your-app-name.herokuapp.com
git push heroku main
```

#### Vercel Deployment:
```bash
vercel --prod
# Configure environment variables in Vercel dashboard
```

### Step 4: Install on Store
1. Visit your app URL
2. Complete OAuth flow
3. Test with store products

### Step 5: Client Handover
1. Provide admin dashboard access
2. Share documentation
3. Set up monitoring/support

## 🔧 Configuration Options

### Performance Tuning:
- `GHOSTLY_BATCH_SIZE`: Products per API call (default: 50)
- `GHOSTLY_MAX_RETRIES`: Retry failed requests (default: 3)

### Development Mode:
- Set `NODE_ENV=development` for mock data
- Set `ENABLE_MOCK_DATA=true` to force mock data

## 📞 Support
Contact: support@plugzy.com
