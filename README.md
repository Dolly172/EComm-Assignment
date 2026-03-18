# E-commerce Dynamic Product System - MERN Stack Assignment

A scalable e-commerce product management system with **dynamic category-driven attributes** and **backend-powered search & filters**.

## 🎯 Objective

Design and implement an Add Product system where:
- Product attributes dynamically change based on product category
- Product details page adapts to category specifications
- Search and filters are generated dynamically from backend APIs
- No hardcoding of category-specific fields

## ✨ Key Features

### 1. **Dynamic Category Management**
- Create/Edit categories with custom attributes
- Define attribute types (text, number, select, multiselect, boolean)
- Set validation rules and display order
- Configure filterable and searchable attributes

### 2. **Dynamic Product Forms**
- Form fields automatically render based on selected category
- Required field validation
- Support for multiple input types
- Highlights and specifications sections

### 3. **Advanced Search & Filtering**
- Backend-driven search across all product fields
- Dynamic filter generation based on category
- Price range filtering
- Attribute-based filtering
- Real-time search results

### 4. **Responsive Admin UI**
- Modern React interface with Vite
- Clean sidebar navigation
- Dashboard with statistics
- Mobile-responsive design

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React.js 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **HTTP Client**: Axios

### Project Structure
```
Ecomm-assignment/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   └── searchController.js
│   ├── models/           # MongoDB schemas
│   │   ├── Category.js
│   │   └── Product.js
│   ├── routes/           # API routes
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   └── searchRoutes.js
│   ├── seeders/          # Sample data
│   │   └── seedData.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Categories.jsx
    │   │   ├── CategoryForm.jsx
    │   │   ├── Products.jsx
    │   │   ├── AddProduct.jsx
    │   │   ├── ProductDetail.jsx
    │   │   └── Search.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd Ecomm-assignment
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**
```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-dynamic
NODE_ENV=development
```

5. **Seed sample data**
```bash
cd backend
npm run seed
```

### Running the Application

1. **Start backend server**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

2. **Start frontend development server**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000

## 📊 Database Schema Design

### Category Schema
```javascript
{
  name: String,                    // e.g., "Mobile", "Bangles"
  description: String,
  attributes: [{                   // Dynamic attribute definitions
    name: String,                  // e.g., "RAM", "Color"
    type: String,                  // text|number|select|multiselect|boolean
    options: [String],             // For select/multiselect
    required: Boolean,
    isFilterable: Boolean,
    isSearchable: Boolean,
    displayOrder: Number,
    validation: Object             // min, max, minLength, maxLength
  }],
  uiConfig: {                      // UI rendering config
    icon: String,
    color: String,
    thumbnailAttributes: [String]
  },
  isActive: Boolean
}
```

### Product Schema
```javascript
{
  name: String,
  description: String,
  category: ObjectId,              // Reference to Category
  price: Number,
  discountPrice: Number,
  stock: Number,
  sku: String,
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  attributes: Map,                 // Dynamic key-value pairs
                                   // e.g., { "RAM": "8GB", "Color": "Black" }
  highlights: [String],
  specifications: [{ label: String, value: Mixed }],
  tags: [String],
  status: String,                  // draft|active|inactive|out_of_stock
  ratings: { average: Number, count: Number },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/attributes` - Get category attributes
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/bulk/status` - Bulk update status

### Search
- `GET /api/search?query=...&category=...&minPrice=...` - Search products
- `GET /api/search/suggestions?q=...` - Get search suggestions
- `GET /api/search/filters/:categoryId` - Get dynamic filters for category

## 🎨 Example Categories

### 1. Mobile Category
**Attributes:**
- RAM (Select: 4GB, 6GB, 8GB, 12GB)
- Processor (Text)
- Storage (Select: 128GB, 256GB, 512GB)
- Color (Multiselect)
- Display Size (Select)
- Battery (Number, mAh)

### 2. Bangles Category
**Attributes:**
- Color (Select)
- Size (Select: Small, Medium, Large)
- Material (Select: Gold, Silver, Glass)
- Weight (Text: "45 grams")
- Pattern (Select)
- Occasion (Multiselect)

### 3. Laptops Category
**Attributes:**
- RAM (Select)
- Processor (Select: Intel i5, i7, AMD Ryzen)
- Storage (Select: SSD, HDD)
- Screen Size (Select)
- Graphics Card (Text)
- Operating System (Select)

## 🔍 How Dynamic Rendering Works

### Frontend Flow
1. User selects category in Add Product form
2. Frontend fetches category attributes via API
3. Form dynamically renders fields based on attribute types
4. User fills in category-specific values
5. Data submitted as key-value pairs in `attributes` object

### Backend Flow
1. Search request received with query parameters
2. Backend identifies category from request
3. Fetches category's filterable attributes
4. Builds dynamic MongoDB query
5. Returns products + available filters

### Key Code Snippets

#### Dynamic Field Rendering (AddProduct.jsx)
```javascript
const renderAttributeField = (attribute) => {
  switch (attribute.type) {
    case 'select':
      return <select>...</select>;
    case 'multiselect':
      return <div className="checkbox-group">...</div>;
    case 'number':
      return <input type="number" />;
    // ... more types
  }
};
```

#### Dynamic Filter Generation (searchController.js)
```javascript
async function generateDynamicFilters(baseQuery, selectedCategory) {
  const category = await Category.findById(selectedCategory);
  const filterableAttributes = category.attributes.filter(
    attr => attr.isFilterable !== false
  );
  
  // Generate filter options from actual product data
  for (const attr of filterableAttributes) {
    const uniqueValues = await Product.distinct(
      `attributes.${attr.name}`, 
      baseQuery
    );
    filters.attributes.push({
      name: attr.name,
      type: attr.type,
      options: uniqueValues
    });
  }
}
```

## ✅ Evaluation Criteria Coverage

### 1. ✅ Dynamic UI Rendering in React
- CategoryForm: Dynamic attribute builder
- AddProduct: Renders fields based on category
- ProductDetail: Displays category-specific specs
- Search: Dynamic filter sidebar

### 2. ✅ Scalable DB & Schema Design
- Flexible MongoDB schema with Map type
- Category-driven attribute definitions
- Indexed queries for performance
- Supports unlimited categories

### 3. ✅ Backend-Driven Search & Filters
- Search across name, description, tags, attributes
- Dynamic filter generation from product data
- Category-specific filter options
- Faceted search support

### 4. ✅ API Design & Performance
- RESTful endpoints
- Query parameter filtering
- Pagination support
- MongoDB indexing
- Population for references

### 5. ✅ Code Quality & Documentation
- Clean separation of concerns
- Reusable React components
- Error handling
- Input validation
- Comprehensive comments

## 🎁 Bonus: Scalability Explanation

### How This Design Supports New Categories Without Frontend Changes

**1. Schema Flexibility**
```javascript
// Product attributes stored as Map (key-value pairs)
attributes: {
  type: Map,
  of: mongoose.Schema.Types.Mixed
}

// Can store ANY attribute without schema changes
{
  "RAM": "8GB",           // Mobile category
  "Material": "Gold",     // Bangles category
  "Processor": "M3 Max"   // Laptops category
}
```

**2. Category-Driven UI**
```javascript
// Frontend doesn't know about specific attributes
// It just renders what the category defines

{categories.map(category => (
  <select onChange={() => fetchAttributes(category._id)}>
    <option>{category.name}</option>
  </select>
))}

// Attributes fetched dynamically
const attributes = await categoryAPI.getAttributes(categoryId);

// Render fields based on type
attributes.forEach(attr => {
  renderField(attr.type, attr.name, attr.options);
});
```

**3. Adding a New Category (e.g., "Headphones")**

**Step 1:** Admin creates category via UI
```json
{
  "name": "Headphones",
  "attributes": [
    { "name": "Driver Size", "type": "select", "options": ["40mm", "50mm"] },
    { "name": "Impedance", "type": "number", "validation": { "min": 16, "max": 600 } },
    { "name": "Connectivity", "type": "select", "options": ["Wired", "Wireless", "Bluetooth"] },
    { "name": "Noise Cancellation", "type": "boolean" },
    { "name": "Frequency Response", "type": "text" }
  ]
}
```

**Step 2:** Save to database
- No backend code changes needed
- No frontend code changes needed
- No API endpoint modifications needed

**Step 3:** Immediately usable
- Add Product form shows new fields
- Search generates filters automatically
- Product detail page displays specs
- All working without touching code!

**4. Backend Search Adaptability**
```javascript
// Search works across ALL categories
const searchProducts = async (req, res) => {
  const { category, query } = req.query;
  
  // Dynamically build query based on category
  if (category) {
    const categoryDoc = await Category.findById(category);
    
    // Search in category-specific attributes
    categoryDoc.attributes.forEach(attr => {
      if (attr.isSearchable) {
        searchConditions.push({
          [`attributes.${attr.name}`]: regex
        });
      }
    });
  }
  
  // Execute search
  return Product.find({ $or: searchConditions });
};
```

**5. Infinite Scalability**
- Add 100 categories? ✅ Works
- Each with 50 attributes? ✅ Works
- Different attribute types? ✅ Works
- Custom validation per attribute? ✅ Works

**The Key Insight:**
The frontend only knows about **field types** (text, number, select), not **field meanings**. It's like a form renderer that reads a configuration file (the category). The backend treats all attributes generically as key-value pairs. This abstraction allows infinite scalability.

## 🧪 Testing the Application

### Test Scenarios

1. **Create Categories**
   - Go to Categories → Create Category
   - Add Mobile category with RAM, Processor, Storage attributes
   - Add Bangles category with Color, Size, Material attributes

2. **Add Products**
   - Go to Products → Add Product
   - Select "Mobile" category
   - Notice how form shows Mobile-specific fields
   - Save product
   - Create another product with "Bangles" category
   - See completely different fields

3. **Search & Filter**
   - Go to Search Products
   - Select "Mobile" category
   - See Mobile-specific filters (RAM, Storage, etc.)
   - Switch to "Bangles" category
   - Filters change to bangle-specific attributes

4. **View Product Details**
   - Click on any product
   - See category-specific specifications displayed
   - Mobile shows: RAM, Processor, Battery
   - Bangles show: Material, Size, Weight

## 📝 Sample Data

The seeder creates:
- **3 Categories**: Mobile, Bangles, Laptops
- **6 Products**: 
  - iPhone 15 Pro Max (Mobile)
  - Samsung Galaxy S24 Ultra (Mobile)
  - Gold Temple Bangles (Bangles)
  - Glass Designer Bangles Set (Bangles)
  - MacBook Pro M3 Max (Laptops)
  - Dell XPS 15 (Laptops)

Run seeder:
```bash
cd backend
npm run seed
```

## 🛠️ Future Enhancements

- Image upload functionality
- Product reviews and ratings
- Inventory management
- Order processing integration
- Multi-vendor support
- Elasticsearch integration for advanced search
- Caching with Redis
- GraphQL API option

## 📄 License

MIT License - Educational Purpose

## 👨‍💻 Author

Built as part of MERN stack assignment demonstrating:
- Dynamic schema design
- Category-driven UI rendering
- Backend-powered search
- Scalable architecture patterns

---

**Happy Coding! 🚀**
