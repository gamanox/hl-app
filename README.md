# CNC Service Management App

React Native app built with Expo for managing CNC wood machine services, work orders, and technician scheduling with role-based access control.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values

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

## 👥 User Roles & Features

### **Admin Dashboard**
- Global work order overview and analytics
- User management (customers, technicians, machines)
- QuickBooks integration and sync management
- Document generation and approval workflows
- System settings and role management

### **Technician Portal**
- Assigned work order backlog
- Session tracking with geofencing
- Photo capture and notes
- Parts catalog and usage tracking
- Calendar view of scheduled appointments

### **Client Portal**
- Service request creation
- Order status tracking
- Document signing (quotes, purchase orders)
- Service history and invoices
- Public portal access via secure links

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

## 📋 Core Features

### **Work Order Management**
- 5-step creation wizard (client, machine, service type, scheduling, parts)
- Status tracking (pending → in_progress → done → archived)
- Priority levels (low, normal, high) with visual indicators
- Technician assignment and workload balancing
- Estimated vs actual duration tracking

### **Session Tracking**
- Start/pause/resume/finish session controls
- Geofencing with location verification
- Photo capture and note-taking
- Parts usage tracking during sessions
- Automatic time calculations and reporting

### **Parts & Inventory**
- Searchable parts catalog with categories
- Quote and purchase order generation
- Client signature capture for approvals
- Cost estimation and tracking
- Integration with QuickBooks items

### **Document Management**
- PDF generation for quotes and purchase orders
- Digital signature capture (react-native-signature-canvas)
- Document preview (react-native-pdf on mobile, iframe on web)
- Email sharing and download functionality
- Public portal access for client signatures

### **Calendar & Scheduling**
- Agenda view with react-native-calendars
- Drag-and-drop session rescheduling
- Technician availability and workload view
- Appointment reminders and notifications
- Color-coded priority and status indicators

## 🏗️ Project Structure

\`\`\`
app/
├── (auth)/                 # Authentication screens
│   ├── login.tsx          # 2-step OTP login
│   └── register.tsx       # User registration
├── (app)/                 # Main authenticated app
│   ├── dashboard.tsx      # Role-based dashboard
│   ├── calendar.tsx       # Agenda view with scheduling
│   ├── customers.tsx      # Customer management
│   ├── machines.tsx       # Machine catalog
│   ├── technicians.tsx    # Technician management
│   └── settings.tsx       # App configuration
├── (work-orders)/         # Work order management
│   ├── index.tsx          # Work order list with filters
│   ├── new.tsx           # 5-step creation wizard
│   └── [id].tsx          # Detailed work order view
├── (sessions)/            # Session tracking
│   └── index.tsx          # Active session controls
└── (public)/              # Public client portal
    └── [publicKey].tsx    # Secure client access

components/
├── ui/                    # Base UI components
├── parts/                 # Parts management components
└── DocumentPreview.tsx    # Cross-platform PDF viewer

lib/
├── supabase.ts           # Database client and auth
├── quickbooks.ts         # QB integration service
├── zod-schemas.ts        # Data validation schemas
├── design-tokens.ts      # Accessibility and design system
└── work-orders.ts        # Work order business logic
\`\`\`

## 🏗️ Architecture

- **Frontend**: Expo + React Native with Expo Router
- **UI**: gluestack-ui + NativeWind (Tailwind CSS)
- **Forms**: react-hook-form + Zod validation
- **Database**: Supabase with Row Level Security
- **Storage**: Supabase Storage for documents and images
- **Integration**: QuickBooks Online API via serverless functions
- **Authentication**: Supabase Auth with OTP-based login
- **State Management**: React Context + Custom hooks
- **Navigation**: Expo Router with role-based routing

## 📱 Development

\`\`\`bash
# Start with specific platform
expo start --ios
expo start --android
expo start --web

# Clear cache if needed
expo start --clear

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-based routing**: Different app sections per user type
- **Public key access**: Secure client portal without authentication
- **Token encryption**: Secure QuickBooks token storage
- **Input validation**: Zod schemas for all forms
- **HTTPS enforcement**: Secure communication in production

## 🚀 Production Checklist

- [ ] Set up Supabase project and configure RLS policies
- [ ] Deploy QuickBooks serverless endpoints
- [ ] Configure environment variables in Vercel
- [ ] Test OAuth flows in production environment
- [ ] Set up domain and SSL certificate
- [ ] Configure push notifications (if needed)
- [ ] Test all user roles and permissions
- [ ] Verify document signing and PDF generation
- [ ] Test mobile app builds (iOS/Android)
- [ ] Set up monitoring and error tracking

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
\`\`\`bash
expo start --clear
\`\`\`

**Web build fails:**
\`\`\`bash
rm -rf dist/ .expo/
npm run export:web
\`\`\`

**Supabase connection issues:**
- Verify EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
- Check RLS policies are properly configured
- Ensure user roles are set correctly in auth.users metadata

**QuickBooks integration issues:**
- Verify serverless endpoints are deployed and accessible
- Check QB_CLIENT_ID and QB_CLIENT_SECRET are valid
- Ensure redirect URI matches exactly in QB developer console

## 📞 Support

For technical support or feature requests, please create an issue in the repository or contact the development team.
