# CNC Service Management App

React Native app built with Expo for managing CNC wood machine services, work orders, and technician scheduling.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
\`\`\`

## 📱 Platform Support

- **Mobile**: iOS and Android via Expo Go or development builds
- **Web**: Progressive Web App with full functionality
- **Desktop**: Web app can be installed as PWA

## 🌐 Web Deployment

### Build for Web
\`\`\`bash
# Export web build to dist/ folder
npm run export:web

# Preview locally
npm run preview:web
\`\`\`

### Deploy to Vercel

1. **Install Vercel CLI**:
\`\`\`bash
npm i -g vercel
\`\`\`

2. **Build and Deploy**:
\`\`\`bash
# Build for web
npm run build:web

# Deploy to Vercel
npm run deploy:vercel
\`\`\`

3. **Automatic Deployment** (Recommended):
   - Connect your GitHub repo to Vercel
   - Set build command: `npm run export:web`
   - Set output directory: `dist`
   - Vercel will auto-deploy on git push

## 🔧 Environment Variables

### Required for All Environments

\`\`\`env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Development redirect URL for email auth
EXPO_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:8081
\`\`\`

### QuickBooks Integration (Serverless Endpoints)

\`\`\`env
# QuickBooks OAuth
EXPO_PUBLIC_QB_CLIENT_ID=your-qb-client-id
EXPO_PUBLIC_QB_CLIENT_SECRET=your-qb-client-secret
EXPO_PUBLIC_QB_REDIRECT_URI=https://yourapp.vercel.app/api/qb/callback

# QuickBooks API Base URL
EXPO_PUBLIC_QB_API_BASE=https://yourapp.vercel.app/api/qb
\`\`\`

### Vercel Deployment Variables

Add these in your Vercel dashboard under Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | All |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | All |
| `EXPO_PUBLIC_QB_CLIENT_ID` | `your-qb-client-id` | All |
| `EXPO_PUBLIC_QB_CLIENT_SECRET` | `your-qb-client-secret` | All |
| `EXPO_PUBLIC_QB_REDIRECT_URI` | `https://yourapp.vercel.app/api/qb/callback` | Production |
| `EXPO_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | `http://localhost:8081` | Development |

## 🔗 Serverless Endpoints

The app expects these QuickBooks integration endpoints to be deployed separately:

- `POST /api/qb/connect` - Initiate QuickBooks OAuth flow
- `GET /api/qb/callback` - Handle OAuth callback and token exchange
- `POST /api/qb/webhook` - Handle QuickBooks webhooks
- `POST /api/qb/invoice` - Create invoice from work order

## 📋 Features

- **Authentication**: OTP-based login with Supabase
- **Work Orders**: Create, manage, and track service requests
- **Sessions**: Time tracking with geofencing and photo capture
- **Parts Management**: Catalog, quotes, and purchase orders
- **Document Signing**: Client signature capture and PDF generation
- **QuickBooks Integration**: Sync customers, items, and invoices
- **Role-Based Access**: Admin, Technician, and Client portals
- **Public Portal**: Client access via secure public keys

## 🏗️ Architecture

- **Frontend**: Expo + React Native with Expo Router
- **UI**: gluestack-ui + NativeWind (Tailwind CSS)
- **Forms**: react-hook-form + Zod validation
- **Database**: Supabase with Row Level Security
- **Storage**: Supabase Storage for documents and images
- **Integration**: QuickBooks Online API via serverless functions

## 📱 Development

\`\`\`bash
# Start with specific platform
expo start --ios
expo start --android
expo start --web

# Clear cache if needed
expo start --clear
\`\`\`

## 🚀 Production Checklist

- [ ] Set up Supabase project and configure RLS policies
- [ ] Deploy QuickBooks serverless endpoints
- [ ] Configure environment variables in Vercel
- [ ] Test OAuth flows in production environment
- [ ] Set up domain and SSL certificate
- [ ] Configure push notifications (if needed)
