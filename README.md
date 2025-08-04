# 🇱🇻 VisiPakalpojumi - Local Services Aggregator

A comprehensive web application for connecting local service providers with customers in Latvia. Built with modern technologies and optimized for the Latvian market.

## 🎯 **Project Overview**

**VisiPakalpojumi** (All Services) is a local services aggregator platform designed specifically for the Latvian market. The platform connects customers with verified service providers including handymen, cleaners, tutors, electricians, babysitters, and more.

### **Key Features**
- 🔍 **Service Discovery**: Find local service providers by category and location
- ⭐ **Verified Reviews**: Real reviews from actual customers
- 💬 **Real-time Chat**: Direct communication between users and providers
- 💳 **Secure Payments**: Integrated payment processing
- 🌍 **Multi-language**: Latvian (primary), Russian, English
- 📱 **Mobile-first**: Responsive design optimized for mobile devices

## 🏗️ **Tech Stack**

### **Frontend**
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **React Query** - State management

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication

### **Infrastructure**
- **Ubuntu 24.04 VPS** - Hosting
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **Let's Encrypt** - SSL certificates

## 🚀 **Quick Start**

### **Prerequisites**
- Ubuntu 24.04 VPS with 4GB RAM
- Domain name (optional for development)
- Node.js 18+ installed

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd visipakalpojumi
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment setup**
```bash
# Copy environment files
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Create database and run migrations
npm run db:setup
```

5. **Start development servers**
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## 📁 **Project Structure**

```
visipakalpojumi/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # CSS styles
│   │   └── locales/        # i18n translations
│   ├── public/             # Static assets
│   └── package.json
├── docs/                   # Documentation
├── scripts/                # Deployment scripts
└── README.md
```

## 🌍 **Multi-language Support**

The application supports three languages:
- **Latvian** (primary) - `lv`
- **Russian** - `ru`
- **English** - `en`

Translation files are located in `frontend/src/locales/`

## 🔧 **Development**

### **Available Scripts**

**Backend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

### **Database Migrations**
```bash
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database
```

## 🚀 **Deployment**

### **VPS Setup**
1. Update system and install dependencies
2. Configure PostgreSQL database
3. Set up Nginx reverse proxy
4. Install SSL certificate
5. Deploy with PM2

### **Environment Variables**
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/visipakalpojumi
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 📊 **Monitoring**

- **PM2** - Process monitoring
- **Nginx** - Access logs
- **PostgreSQL** - Database performance
- **Sentry** - Error tracking (free tier)

## 🔒 **Security**

- JWT authentication
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- HTTPS enforcement

## 📈 **Performance**

- Database query optimization
- Image compression
- Code splitting
- CDN integration (future)
- Caching strategies

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**Built with ❤️ for Latvia**