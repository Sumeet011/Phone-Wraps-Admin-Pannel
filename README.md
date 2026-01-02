# PhoneWraps Admin Panel

A modern, secure admin dashboard for managing PhoneWraps e-commerce platform.

## Features

- 🔐 **Secure Authentication** - Protected admin routes with JWT tokens
- 📦 **Product Management** - Add, edit, and delete products with collections
- 📋 **Order Management** - View and manage customer orders
- 🎨 **Content Management** - Manage blogs, design assets, and site settings
- 💳 **Coupon System** - Create and manage discount coupons
- 📱 **Phone Brand Management** - Organize products by phone brands
- 🎯 **Collection Tooltips** - Manage collection descriptions and info
- 🛡️ **Error Handling** - Comprehensive error boundaries and user feedback
- ⚡ **Optimized Performance** - Code splitting and lazy loading
- 📊 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **TailwindCSS** - Utility-first CSS framework
- **React Toastify** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ADMIN
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` with your backend URL
```env
VITE_BACKEND_URL=http://localhost:4000
```

5. Start development server
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
ADMIN/
├── src/
│   ├── assets/         # Images and static assets
│   ├── components/     # Reusable components
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── config/         # Configuration files
│   │   └── env.js
│   ├── pages/          # Page components
│   │   ├── Add.jsx
│   │   ├── List.jsx
│   │   ├── Orders.jsx
│   │   ├── Coupons.jsx
│   │   └── ...
│   ├── utils/          # Utility functions
│   │   ├── api.js
│   │   ├── validation.js
│   │   ├── helpers.js
│   │   └── logger.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Public assets
├── .env.example        # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── DEPLOYMENT.md       # Deployment guide
└── README.md
```

## Security Features

- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ Secure token storage
- ✅ CSRF protection
- ✅ Error boundaries
- ✅ Rate limiting (client-side)
- ✅ Secure headers in production

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables

Required environment variables:

- `VITE_BACKEND_URL` - Backend API URL

See `.env.example` for full list.

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

### Error Handling

- All API calls should have try-catch blocks
- Use toast notifications for user feedback
- Log errors in development mode only
- Provide user-friendly error messages

### Performance

- Use lazy loading for routes
- Optimize images
- Minimize bundle size
- Avoid unnecessary re-renders

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

[Your License]

## Support

For support, email [your-email] or open an issue on GitHub.
