# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (React Admin Panel)                        │
│                     http://localhost:3000                       │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Dashboard  │  │ Categories │  │  Products  │  │  Search  │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/JSON (Axios)
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (Express)                      │
│                     http://localhost:5000                       │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ /api/categories │  │ /api/products   │  │ /api/search    │  │
│  │                 │  │                 │  │                │  │
│  │ GET all         │  │ GET all         │  │ GET search     │  │
│  │ GET by id       │  │ GET by id       │  │ GET filters    │  │
│  │ POST create     │  │ POST create     │  │ GET suggestions│  │
│  │ PUT update      │  │ PUT update      │  │                │  │
│  │ DELETE remove   │  │ DELETE remove   │  │                │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│                        (Controllers)                            │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │categoryController│  │productController │  │searchController││
│  │                  │  │                  │  │              │  │
│  │ getAllCategories │  │ getAllProducts   │  │searchProducts│  │
│  │ getCategoryById  │  │ getProductById   │  │generateFilters│ │
│  │ createCategory   │  │ createProduct    │  │getSuggestions│  │
│  │ updateCategory   │  │ updateProduct    │  │              │  │
│  │ deleteCategory   │  │ deleteProduct    │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ MongoDB Driver
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│                      (MongoDB Database)                         │
│                 mongodb://localhost:27017                       │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │   Collection: categories│  │   Collection: products      │  │
│  │                         │  │                             │  │
│  │ _id: ObjectId           │  │ _id: ObjectId               │  │
│  │ name: String            │  │ name: String                │  │
│  │ description: String     │  │ description: String         │  │
│  │ attributes: [           │  │ category: ObjectId →        │  │
│  │   {                     │  │ price: Number               │  │
│  │     name: String,       │  │ discountPrice: Number       │  │
│  │     type: String,       │  │ stock: Number               │  │
│  │     options: [String],  │  │ sku: String                 │  │
│  │     required: Boolean,  │  │ images: [{url, alt}]        │  │
│  │     isFilterable: Bool, │  │ attributes: Map             │  │
│  │     isSearchable: Bool  │  │   {"RAM": "8GB", ...}       │  │
│  │   }]                    │  │ highlights: [String]        │  │
│  │ uiConfig: {icon, color} │  │ specifications: [...]       │  │
│  │ isActive: Boolean       │  │ tags: [String]              │  │
│  │ createdAt: Date         │  │ status: String              │  │
│  │ updatedAt: Date         │  │ ratings: {avg, count}       │  │
│  │                         │  │ createdAt: Date             │  │
│  │ Indexes:                │  │ updatedAt: Date             │  │
│  │ - name, isActive        │  │                             │  │
│  └─────────────────────────┘  │ Indexes:                    │  │
│                               │ - category, status          │  │
│                               │ - name (text)               │  │
│                               │ - attributes.$** (text)     │  │
│                               └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Create Category Flow

```
User (Admin)
    ↓
[CategoryForm.jsx]
    ↓
Fill category details + attributes
    ↓
[categoryAPI.create(formData)]
    ↓
POST /api/categories
    ↓
[categoryController.createCategory]
    ↓
Validate input
    ↓
Category.create(req.body)
    ↓
MongoDB: categories.insertOne()
    ↓
Return new category
    ↓
Navigate to /categories
    ↓
Display success message
```

### 2. Add Product with Dynamic Fields

```
User selects category
    ↓
[AddProduct.jsx]
    ↓
Handle category change
    ↓
[categoryAPI.getById(categoryId)]
    ↓
GET /api/categories/:id
    ↓
[categoryController.getCategoryById]
    ↓
Return category with attributes
    ↓
Store in state: selectedCategory
    ↓
Render dynamic fields
    ↓
For each attribute in selectedCategory.attributes:
    - renderAttributeField(attr)
    - Switch on attr.type
    - Render appropriate input
    ↓
User fills form
    ↓
Submit product
    ↓
[productAPI.create(formData)]
    ↓
POST /api/products
    ↓
[productController.createProduct]
    ↓
Verify category exists
    ↓
Convert attributes to Map
    ↓
Product.create(req.body)
    ↓
MongoDB: products.insertOne()
    ↓
Return populated product
    ↓
Navigate to /products
```

### 3. Dynamic Search & Filter Generation

```
User goes to Search page
    ↓
[Search.jsx]
    ↓
Select category filter
    ↓
Handle category change
    ↓
[searchAPI.getFiltersByCategory(categoryId)]
    ↓
GET /api/search/filters/:categoryId
    ↓
[searchController.getFiltersByCategory]
    ↓
Find category
    ↓
Get filterable attributes
    ↓
For each attribute:
    - Get unique values from products
    - Build filter options
    ↓
Return filters structure
    ↓
Store in state: filters
    ↓
Render filter sidebar
    ↓
User applies filters
    ↓
Click Search
    ↓
[searchAPI.search(params)]
    ↓
GET /api/search?category=&RAM=8GB&...
    ↓
[searchController.searchProducts]
    ↓
Build query object
    ↓
If category selected:
    - Get category attributes
    - Add attribute conditions to query
    ↓
Product.find(query)
    ↓
MongoDB executes query
    ↓
Return matching products
    ↓
Also return available filters
    ↓
Display results + filters
```

## Component Hierarchy

```
App.jsx
├── Layout.jsx
│   ├── Sidebar Navigation
│   └── Outlet (Page Content)
│       ├── Dashboard.jsx
│       ├── Categories.jsx
│       ├── CategoryForm.jsx
│       ├── Products.jsx
│       ├── AddProduct.jsx
│       ├── ProductDetail.jsx
│       └── Search.jsx
```

## State Management

```
Component Level State (useState):
├── formData (form inputs)
├── loading (loading states)
├── data (fetched data)
├── error (error messages)
└── filters (filter selections)

No global state management needed
(Simple enough for Context API if needed later)
```

## Security Architecture

```
Current (Educational):
├── Input validation (Mongoose schemas)
├── Error handling middleware
└── CORS enabled

Production Would Add:
├── JWT Authentication
├── Role-based Authorization
├── Rate Limiting
├── Input Sanitization
├── HTTPS Enforcement
└── CSRF Protection
```

## Deployment Architecture

```
Development:
├── Frontend: localhost:3000 (Vite dev server)
└── Backend: localhost:5000 (Node.js)

Production Would Be:
├── Frontend: Vercel/Netlify (Static hosting)
├── Backend: Heroku/Railway/VPS
└── Database: MongoDB Atlas (Cloud)
```

## Scalability Considerations

### Current Design Supports:
- ✅ Unlimited categories
- ✅ Unlimited attributes per category
- ✅ Different attribute types
- ✅ Custom validation rules
- ✅ Real-time filter generation
- ✅ Text search across all fields

### Future Enhancements:
- Add Redis caching for frequent searches
- Implement Elasticsearch for advanced search
- Add CDN for image delivery
- Database replication for read scaling
- Load balancing for high traffic
- Microservices separation

## Performance Optimizations

### Implemented:
- MongoDB indexes on frequently queried fields
- Selective field projection in queries
- Pagination support
- Efficient aggregation pipelines

### Potential:
- Query result caching
- Debounced search inputs
- Lazy loading components
- Code splitting
- Image optimization

