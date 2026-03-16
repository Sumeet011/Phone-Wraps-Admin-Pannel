# Admin Panel - Quick Start Guide

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running

### Installation

1. **Install Dependencies**
   ```bash
   cd ADMIN
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and set your backend URL
   # VITE_BACKEND_URL=http://localhost:3000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Admin Panel**
   - Open browser to: `http://localhost:5174`
   - Default admin credentials (check with backend team)

## Project Structure

```
ADMIN/
├── src/
│   ├── assets/          # Images, icons, static files
│   ├── components/      # Reusable React components
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── config/          # Configuration files
│   │   └── api.js       # API endpoints configuration
│   ├── pages/           # Page components
│   │   ├── Add.jsx
│   │   ├── List.jsx
│   │   ├── Orders.jsx
│   │   └── ...
│   ├── services/        # API service layer
│   │   ├── productService.js
│   │   ├── collectionService.js
│   │   └── orderService.js
│   ├── utils/           # Utility functions
│   │   ├── api.js       # API utility functions
│   │   ├── constants.js # Application constants
│   │   └── helpers.js   # Helper functions
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── public/              # Public assets
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Features

### 1. Product Management
- Add new products (Gaming & Standard)
- Edit existing products
- Delete products
- Organize products in collections

### 2. Order Management
- View all orders
- Update order status
- Add tracking information
- Create shipments
- Cancel orders

### 3. Collection Management
- Create gaming collections
- Create standard collections
- Add products to collections
- Remove products from collections

### 4. User Management
- View all users
- View user order history
- User statistics

### 5. Content Management
- Create and edit blogs
- Manage design assets
- Update site settings
- Manage collection tooltips

### 6. Marketing
- Create and manage coupons
- Featured home products
- Suggested products

## Common Tasks

### Adding a New Product

1. Navigate to "Add Items"
2. Select product type (Gaming or Standard)
3. For Gaming:
   - Select group and collection
   - Auto-suggests available level
4. For Standard:
   - Select collection
   - Choose level (1-5)
5. Fill in product details
6. Upload product image
7. Click "Add Product"

### Managing Orders

1. Navigate to "Orders"
2. View order list
3. Update status from dropdown
4. Add tracking information
5. Create shipment (if integrated)
6. View full order details

### Creating a Blog

1. Navigate to "Blogs"
2. Click "Create New Blog"
3. Add title and excerpt
4. Upload cover image
5. Add content blocks:
   - Headings
   - Paragraphs
   - Images
   - Lists
   - Quotes
6. Set status (Draft/Published)
7. Click "Save Blog"

## API Integration

The admin panel is fully integrated with the backend API. All requests are handled through:

1. **API Configuration** (`src/config/api.js`)
   - Centralized endpoint definitions
   - Easy to update

2. **API Utilities** (`src/utils/api.js`)
   - Consistent error handling
   - Automatic toast notifications
   - Support for different request types

3. **Service Layer** (`src/services/`)
   - Organized by feature
   - Reusable functions
   - Easy to test

## Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Displayed with toast notifications
- **Validation Errors**: Shown inline or as toast
- **Loading States**: Loading spinners during API calls
- **Console Logging**: Detailed logs for debugging

## Development Tips

### 1. Using API Utilities

```javascript
import api from '../utils/api';
import API_ENDPOINTS from '../config/api';

// GET request
const data = await api.get(API_ENDPOINTS.PRODUCTS.LIST);

// POST request with auth
const result = await api.post(
  API_ENDPOINTS.PRODUCTS.CREATE,
  formData,
  { token, isMultipart: true }
);
```

### 2. Using Constants

```javascript
import { CURRENCY, ORDER_STATUS } from '../utils/constants';

// Use constants instead of hardcoded values
const price = `${CURRENCY}${amount}`;
const status = ORDER_STATUS.SHIPPED;
```

### 3. Using Helper Functions

```javascript
import { formatCurrency, formatDate } from '../utils/helpers';

// Format currency
const formatted = formatCurrency(1299); // ₹1299.00

// Format date
const dateStr = formatDate(new Date(), 'long');
```

## Troubleshooting

### Issue: API calls not working
**Solution**: 
- Check `.env` file has correct `VITE_BACKEND_URL`
- Verify backend server is running
- Check browser console for errors
- Verify token is valid

### Issue: Login not working
**Solution**:
- Verify admin credentials
- Check backend `/api/auth/admin` endpoint
- Clear browser storage and try again

### Issue: Images not uploading
**Solution**:
- Check file size (max 10MB)
- Verify file format (jpg, png, webp)
- Check backend cloudinary configuration
- Check network tab for upload errors

### Issue: Changes not reflecting
**Solution**:
- Hard refresh browser (Ctrl+F5)
- Clear browser cache
- Check if API call was successful
- Verify backend database updated

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Update Environment Variables

Create a production `.env` file:
```env
VITE_BACKEND_URL=https://your-production-api.com
```

### 3. Deploy

The `dist/` folder contains the production build. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### 4. Verify Deployment

- Test login functionality
- Test all CRUD operations
- Verify file uploads work
- Check all pages load correctly

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use HTTPS** in production
3. **Rotate admin credentials** regularly
4. **Keep dependencies updated**
5. **Use strong passwords**

## Support

For issues or questions:
1. Check this documentation
2. Review `ADMIN_PANEL_UPDATE_DOCUMENTATION.md`
3. Check backend API documentation
4. Contact development team

## Version History

### v2.0.0 (Current)
- ✅ Centralized API configuration
- ✅ API utility layer
- ✅ Helper functions
- ✅ Constants management
- ✅ Service layer
- ✅ Improved error handling
- ✅ Better code organization
- ✅ Industry-standard practices

### v1.0.0
- Initial release
- Basic CRUD operations
- Order management
- Blog management

---

Happy Coding! 🚀
