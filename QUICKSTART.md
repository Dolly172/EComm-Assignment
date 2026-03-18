# Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB running locally or MongoDB Atlas URI

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-dynamic
NODE_ENV=development
```

If using MongoDB Atlas, replace MONGODB_URI with your connection string.

## Step 3: Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 3 categories (Mobile, Bangles, Laptops)
- 6 sample products

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend runs on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:3000

## Step 5: Test the Application

1. **Open browser**: http://localhost:3000

2. **Dashboard**: View statistics

3. **Categories**: 
   - View existing categories
   - Create new category (e.g., "Headphones")
   - Add attributes like Driver Size, Impedance, etc.

4. **Products**:
   - Click "Add Product"
   - Select a category
   - See dynamic fields appear
   - Fill in product details
   - Save

5. **Search**:
   - Go to Search Products
   - Select category
   - See dynamic filters
   - Search by text, price, attributes

## Testing Dynamic Behavior

### Test Case 1: Mobile Category
1. Add Product → Select "Mobile"
2. Fields shown: RAM, Processor, Storage, Color, Display Size, Battery
3. Save iPhone 15 Pro Max

### Test Case 2: Bangles Category
1. Add Product → Select "Bangles"
2. Fields shown: Color, Size, Material, Weight, Pattern, Occasion
3. Save Gold Temple Bangles

### Test Case 3: Search Filters
1. Go to Search
2. Select "Mobile" → See RAM, Storage, Processor filters
3. Switch to "Bangles" → Filters change to Material, Size, Pattern

### Test Case 4: Create New Category
1. Go to Categories → Create Category
2. Name: "Headphones"
3. Add attributes:
   - Driver Size (Select: 40mm, 50mm)
   - Impedance (Number: 16-600 ohms)
   - Connectivity (Select: Wired, Wireless, Bluetooth)
4. Save
5. Now Add Product shows Headphones option with new fields!

## API Testing with Postman/cURL

### Get All Categories
```bash
curl http://localhost:5000/api/categories
```

### Get Category Attributes
```bash
curl http://localhost:5000/api/categories/[CATEGORY_ID]/attributes
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "category": "[CATEGORY_ID]",
    "price": 9999,
    "stock": 10,
    "attributes": {
      "RAM": "8GB",
      "Color": "Black"
    }
  }'
```

### Search Products
```bash
curl "http://localhost:5000/api/search?category=[CATEGORY_ID]&minPrice=1000&maxPrice=50000"
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Change port in vite.config.js

### Dependencies Installation Failed
- Delete node_modules: `rm -rf node_modules`
- Clear npm cache: `npm cache clean --force`
- Reinstall: `npm install`

### Seeder Fails
- Ensure MongoDB is running
- Check if database already has data (drop if needed)
- Run seeder again

## Success Indicators

✅ Backend starts without errors
✅ MongoDB connected successfully message
✅ Frontend loads at localhost:3000
✅ Dashboard shows statistics
✅ Categories page shows 3 categories
✅ Products page shows 6 products
✅ Add Product form changes based on category
✅ Search generates dynamic filters

## Next Steps

After verifying basic functionality:
1. Create your own categories
2. Add custom products
3. Test search with different filters
4. Try editing products
5. Test delete operations
6. Explore the code to understand the flow

## Support

For issues:
1. Check console logs (browser + terminal)
2. Verify MongoDB connection
3. Ensure both servers are running
4. Check network tab for API errors

Happy coding! 🚀
