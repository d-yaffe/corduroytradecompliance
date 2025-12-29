# Corduroy AI Compliance

AI-native trade compliance service that automates HS/HTS classification for importers and manufacturers with 95% accuracy.

## 🚀 Features

- **AI-Powered Classification**: Automatic HTS code assignment with confidence scoring
- **Exception-Driven Workflow**: Only review items that need your attention
- **Bulk Upload Processing**: Handle hundreds of products via CSV/Excel
- **Product Profile Management**: Build once, reuse forever
- **Real-Time Progress Tracking**: Monitor classification status in real-time
- **Integrated LLM Assistant**: Get help with trade compliance questions

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd corduroy-ai-compliance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚢 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

### Option 3: Deploy via Git Integration

1. **Connect Repository**
   - Push your code to GitHub, GitLab, or Bitbucket
   - Import the repository in Vercel
   - Vercel will auto-detect Vite settings

2. **Automatic Deployments**
   - Every push to `main` branch triggers a production deployment
   - Pull requests get preview deployments

## 🔧 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Notifications**: Sonner

## 🎯 Demo Credentials

```
Email: demo@usecorduroy.com
Password: demo123
```

## 📱 Core Features

### 1. Classify New Products
Single product classification with AI-powered accuracy:
- Enter product details (description, materials, origin, costs)
- AI analyzes and assigns HTS code with confidence score
- Review and save as product profile

### 2. Bulk Upload
Process hundreds of products at once:
- Upload CSV or Excel file
- Real-time processing progress
- Exception-driven review workflow

### 3. Product Profiles
Your compliance library:
- Search, filter, and sort products
- Track materials, origin, costs, and vendors
- Reuse profiles for consistent classification

### 4. Exception-Driven Dashboard
- High confidence (95%+): Auto-approved
- Medium confidence (80-94%): Quick review recommended
- Low confidence (<80%): Expert review required

## 🔐 Environment Variables

Create a `.env` file in the root directory (optional):

```bash
# API endpoints (if using backend)
VITE_API_URL=https://api.usecorduroy.com

# Feature flags
VITE_ENABLE_ANALYTICS=true
```

## 📝 Project Structure

```
/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── ui/              # Reusable UI components
│   └── ...              # Feature components
├── styles/              # Global styles
├── imports/             # Static assets
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment config
```

## 🤝 Support

Need help? Contact support at [support@usecorduroy.com](mailto:support@usecorduroy.com)

## 📄 License

Proprietary - Corduroy AI © 2025

---

Built with ❤️ by the Corduroy AI team
