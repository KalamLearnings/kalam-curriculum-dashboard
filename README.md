# 🎨 Kalam Curriculum Dashboard

Complete Next.js dashboard for managing Arabic learning curriculum with visual builders, asset management, and analytics.

## 🌟 Features

### **Authentication**
- ✅ Magic link login (passwordless)
- ✅ Email domain restriction (@kalamkidslearning.com only)
- ✅ Automatic session management

### **Phase 1: Core CRUD**
- ✅ Curriculum management (create, edit, delete, publish)
- ✅ Visual node builder with drag-and-drop positioning
- ✅ Dynamic activity editor (form changes based on type)
- ✅ Asset upload (audio & images)

### **Phase 2: Advanced Features**
- ✅ Activity preset templates
- ✅ Bulk asset upload
- ✅ Curriculum preview (mobile app simulation)
- ✅ Publish workflow with validation

### **Phase 3: Polish**
- ✅ Analytics dashboard (usage stats, storage, activity breakdown)
- ✅ Multi-user collaboration
- ✅ Version control for curricula
- ✅ Import/export (JSON format)

---

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
cd /Users/salehqadan/Projects/Kalam/kalam-curriculum-dashboard
npm install
```

### **2. Setup Environment**
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://192.168.5.165:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@kalamkidslearning.com
```

### **3. Run Development Server**
```bash
npm run dev
```

Visit: **http://localhost:3001**

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Setup instructions
- **[DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md)** - Complete file structure
- **[../kalam-readers-backend/CURRICULUM_API.md](../kalam-readers-backend/CURRICULUM_API.md)** - Backend API docs
- **[../kalam-readers-backend/ASSET_MANAGEMENT.md](../kalam-readers-backend/ASSET_MANAGEMENT.md)** - Asset storage guide

---

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query
- **Auth**: Supabase Auth (Magic Links)
- **Storage**: Supabase Storage
- **Database**: PostgreSQL (via Supabase)

### **Project Structure**
```
app/
├── (auth)/           # Authentication pages
├── (dashboard)/      # Main dashboard pages
└── api/              # API routes

components/
├── auth/             # Login/auth guards
├── curriculum/       # Curriculum builders
├── assets/           # Asset management
├── analytics/        # Charts and stats
└── ui/               # Reusable components

lib/
├── supabase/         # Supabase clients
├── api/              # API helpers
├── schemas/          # Zod schemas
└── hooks/            # Custom hooks
```

---

## 🎯 User Workflow

### **Creating a Curriculum**

1. **Login** with @kalamkidslearning.com email
2. **Create Curriculum**
   - Set letter (e.g., "Ba")
   - Configure theme (colors, background)
   - Set difficulty level
3. **Add Nodes**
   - Drag to position on map
   - Set type (intro, lesson, practice, review, boss)
   - Configure rewards
4. **Add Activities**
   - Select activity type (tap, balloon, write, etc.)
   - Form adapts to show relevant fields
   - Reference uploaded audio/images
5. **Upload Assets**
   - Drag-and-drop audio files
   - Organize by category
   - Auto-register metadata
6. **Preview**
   - See curriculum as it appears in mobile app
   - Test activity flow
7. **Publish**
   - Validate curriculum
   - Make live for students

---

## 🔐 Security

### **Authentication**
- Magic link email authentication
- No password storage
- Email domain whitelist
- Session-based auth with Supabase

### **Authorization**
- Row Level Security (RLS) policies
- Users can only edit their own curricula
- Published curricula are public read-only
- Asset uploads require authentication

### **Data Validation**
- Zod schemas for all forms
- Server-side validation in edge functions
- Type safety with TypeScript
- SQL injection prevention via Supabase client

---

## 🎨 Key Components

### **CurriculumForm**
Create/edit curriculum with validation
- Letter selection
- Theme configuration
- Metadata (difficulty, duration)

### **NodeBuilder**
Visual node positioning
- Drag-and-drop interface
- Automatic path drawing
- Prerequisite management

### **ActivityEditor**
Dynamic form based on activity type
- Type selector
- Type-specific fields
- Asset selection
- Audio/image preview

### **AssetUploader**
File upload with metadata
- Drag-and-drop support
- Progress tracking
- Auto-categorization
- Bulk upload

### **CurriculumPreview**
Mobile app simulation
- Render activities like app
- Test user flow
- Preview audio/visuals

---

## 📊 Analytics Features

### **Dashboard Overview**
- Total curricula count
- Published vs draft
- Storage usage
- Recent activity

### **Curriculum Stats**
- Activity type breakdown
- Completion rates
- Average duration
- Difficulty distribution

### **Asset Management**
- Storage usage by type
- Most used assets
- Unused assets cleanup
- Format distribution

---

## 🚀 Deployment

### **Development**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Variables (Production)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=@kalamkidslearning.com
```

### **Recommended Hosting**
- **Vercel** (Next.js optimized)
- **Netlify** (Alternative)
- **Self-hosted** (Docker + Node.js)

---

## 🔄 Workflow Integration

### **With Mobile App**
1. Dashboard creates/publishes curriculum
2. Mobile app fetches from backend API
3. Curricula appear automatically
4. Updates sync in real-time

### **With Backend**
1. Dashboard → API → Supabase
2. Direct storage uploads (no edge function)
3. Metadata registered via edge functions
4. RLS policies enforce permissions

---

## 🛠️ Development

### **Adding New Activity Type**

1. **Add type to schema** (`lib/schemas/activity.ts`)
2. **Create form fields** (`components/curriculum/ActivityEditor.tsx`)
3. **Register in registry** (mobile app)
4. **Test in preview**

### **Adding New Asset Category**

1. **Update asset types** (`types/asset.ts`)
2. **Add category filter** (`components/assets/AssetBrowser.tsx`)
3. **Update upload form** (`components/assets/AssetUploader.tsx`)

---

## 🐛 Troubleshooting

### **Login Issues**
- Check email domain matches `.env.local`
- Verify Supabase is running
- Check spam folder for magic link

### **Upload Failures**
- Verify storage bucket exists
- Check RLS policies
- Ensure file size within limits

### **API Errors**
- Check backend is running (port 54321)
- Verify edge functions are deployed
- Check auth token in requests

---

## 📝 License

Private - Kalam Kids Learning

---

## 👥 Team

Built for Kalam Arabic Learning Platform

---

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Supabase for backend infrastructure
- Radix UI for accessible components
- shadcn/ui for beautiful designs
