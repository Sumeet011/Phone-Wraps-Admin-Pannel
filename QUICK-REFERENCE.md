# Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev                 # Start development server (http://localhost:5174)

# Production
npm run build              # Build for production
npm run preview            # Preview production build locally

# Code Quality
npm run lint               # Run ESLint to check code quality
```

---

## 🔑 Environment Variables

Create `.env` file in root:
```env
VITE_BACKEND_URL=https://your-backend-api.com
```

**Important:** Restart dev server after changing .env file!

---

## 📂 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app component with routing |
| `src/main.jsx` | Entry point with ErrorBoundary |
| `src/components/ErrorBoundary.jsx` | Catches and displays errors gracefully |
| `src/components/LoadingSpinner.jsx` | Reusable loading indicator |
| `src/components/ConfirmDialog.jsx` | Confirmation modals |
| `src/utils/api.js` | Axios instance with interceptors |
| `src/utils/validation.js` | Form validation utilities |
| `src/utils/logger.js` | Dev-only logging (removes in prod) |
| `src/utils/helpers.js` | Utility functions (debounce, throttle, etc) |
| `src/utils/constants.js` | App-wide constants |
| `src/utils/formatters.js` | Date, currency, string formatting |
| `vite.config.js` | Build configuration |
| `.env.example` | Environment variables template |

---

## 🛠️ Utilities Available

### Validation (`src/utils/validation.js`)
```javascript
import { 
  validateEmail, 
  validatePassword, 
  validateRequired, 
  validatePositiveNumber,
  validateImageFile,
  sanitizeInput 
} from '../utils/validation';

// Example
if (!validateEmail(email)) {
  toast.error('Invalid email');
}
```

### Logger (`src/utils/logger.js`)
```javascript
import logger from '../utils/logger';

// Only logs in development
logger.log('Debug info');
logger.error('Error info');
logger.warn('Warning info');
```

### Helpers (`src/utils/helpers.js`)
```javascript
import { debounce, throttle, apiRateLimiter } from '../utils/helpers';

// Debounce search
const debouncedSearch = debounce((query) => {
  // Search logic
}, 500);

// Check rate limit
if (!apiRateLimiter.canMakeRequest()) {
  toast.error('Too many requests');
}
```

### Formatters (`src/utils/formatters.js`)
```javascript
import { 
  formatDate, 
  formatCurrency, 
  truncateString 
} from '../utils/formatters';

formatDate('2024-01-01'); // "Jan 1, 2024"
formatCurrency(1000); // "₹1,000"
truncateString('Long text...', 20); // "Long text..."
```

---

## 🎨 Components

### LoadingSpinner
```jsx
import LoadingSpinner from '../components/LoadingSpinner';

<LoadingSpinner size="md" />
<LoadingSpinner size="lg" fullScreen />
```

### ConfirmDialog
```jsx
import ConfirmDialog from '../components/ConfirmDialog';

const [showDialog, setShowDialog] = useState(false);

<ConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure?"
  type="danger"
/>
```

---

## 🔐 Security Best Practices

### 1. Always Validate Inputs
```javascript
import { validateRequired, validateEmail } from '../utils/validation';

if (!validateRequired(name)) {
  toast.error('Name is required');
  return;
}
```

### 2. Use Logger (Not console.log)
```javascript
import logger from '../utils/logger';

// ❌ Don't
console.log('Debug info');

// ✅ Do
logger.log('Debug info');
```

### 3. Handle Errors Properly
```javascript
try {
  const response = await axios.get(url);
  // Handle success
} catch (error) {
  logger.error('Error:', error);
  toast.error(error.response?.data?.message || 'Operation failed');
}
```

### 4. Show Loading States
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

---

## 📱 Toast Notifications

```javascript
import { toast } from 'react-toastify';

// Success
toast.success('Operation completed!');

// Error
toast.error('Something went wrong');

// Warning
toast.warn('Please be careful');

// Info
toast.info('Information message');
```

---

## 🐛 Common Issues & Solutions

### Issue: Changes in .env not reflecting
**Solution:** Restart the dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: "Module not found" error
**Solution:** Install dependencies
```bash
npm install
```

### Issue: Build fails
**Solution:** Check for syntax errors and imports
```bash
npm run lint
```

### Issue: API calls failing
**Solution:** Check VITE_BACKEND_URL in .env
```env
VITE_BACKEND_URL=https://your-api.com
```

---

## 📦 Deployment to Vercel

### Method 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_BACKEND_URL` = your API URL
6. Click "Deploy"

### Method 2: CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🎯 Quick Checklist Before Deployment

- [ ] Set `VITE_BACKEND_URL` in production env vars
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Check for console errors in browser
- [ ] Test login functionality
- [ ] Test all CRUD operations
- [ ] Test on mobile devices
- [ ] Verify API connections work
- [ ] Check all images load correctly

---

## 📊 Project Stats

- **React** 18.3.1
- **Vite** 5.4.1
- **TailwindCSS** 3.4.10
- **Axios** 1.7.4
- **React Router** 6.26.1

---

## 🆘 Getting Help

1. Check `README.md` for project overview
2. Check `DEPLOYMENT.md` for deployment details
3. Check `SECURITY.md` for security checklist
4. Check `IMPROVEMENTS.md` for what was changed
5. Check browser console for error messages
6. Check network tab for API call issues

---

## 💡 Pro Tips

1. **Use logger instead of console.log** - Keeps production clean
2. **Always validate inputs** - Prevents bad data
3. **Show loading states** - Better UX
4. **Handle errors gracefully** - User-friendly messages
5. **Use constants** - Easier to maintain
6. **Keep components small** - Easier to understand
7. **Test before deploy** - Use `npm run preview`

---

**Happy Coding! 🎉**
