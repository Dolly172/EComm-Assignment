const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

// Sample categories with dynamic attributes
const categories = [
  {
    name: 'Mobile',
    description: 'Smartphones and mobile devices',
    attributes: [
      {
        name: 'RAM',
        type: 'select',
        options: ['4GB', '6GB', '8GB', '12GB', '16GB'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 1
      },
      {
        name: 'Processor',
        type: 'text',
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 2
      },
      {
        name: 'Storage',
        type: 'select',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 3
      },
      {
        name: 'Color',
        type: 'multiselect',
        options: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gold', 'Silver'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 4
      },
      {
        name: 'Display Size',
        type: 'select',
        options: ['5.0"', '5.5"', '6.0"', '6.5"', '6.7"'],
        required: false,
        isFilterable: true,
        isSearchable: false,
        displayOrder: 5
      },
      {
        name: 'Battery',
        type: 'number',
        required: false,
        validation: { min: 2000, max: 6000 },
        isFilterable: true,
        isSearchable: false,
        displayOrder: 6
      }
    ],
    uiConfig: {
      icon: '📱',
      color: '#3B82F6',
      thumbnailAttributes: ['RAM', 'Storage', 'Color']
    }
  },
  {
    name: 'Bangles',
    description: 'Traditional and fashionable bangles',
    attributes: [
      {
        name: 'Color',
        type: 'select',
        options: ['Gold', 'Silver', 'Red', 'Green', 'Blue', 'Pink', 'White', 'Black'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 1
      },
      {
        name: 'Size',
        type: 'select',
        options: ['Small (2.5")', 'Medium (2.75")', 'Large (3")', 'Extra Large (3.25")'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 2
      },
      {
        name: 'Material',
        type: 'select',
        options: ['Gold', 'Silver', 'Platinum', 'Glass', 'Plastic', 'Brass', 'Copper'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 3
      },
      {
        name: 'Weight',
        type: 'text',
        required: true,
        isFilterable: true,
        isSearchable: false,
        displayOrder: 4,
        validation: { maxLength: 20 }
      },
      {
        name: 'Pattern',
        type: 'select',
        options: ['Plain', 'Designer', 'Antique', 'Polki', 'Kundan', 'Temple'],
        required: false,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 5
      },
      {
        name: 'Occasion',
        type: 'multiselect',
        options: ['Wedding', 'Party', 'Casual', 'Festival', 'Daily Wear', 'Bridal'],
        required: false,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 6
      }
    ],
    uiConfig: {
      icon: '👜',
      color: '#EC4899',
      thumbnailAttributes: ['Material', 'Color', 'Pattern']
    }
  },
  {
    name: 'Laptops',
    description: 'Laptops and notebooks for work and gaming',
    attributes: [
      {
        name: 'RAM',
        type: 'select',
        options: ['4GB', '8GB', '16GB', '32GB', '64GB'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 1
      },
      {
        name: 'Processor',
        type: 'select',
        options: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 2
      },
      {
        name: 'Storage',
        type: 'select',
        options: ['256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD', '2TB HDD'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 3
      },
      {
        name: 'Screen Size',
        type: 'select',
        options: ['13.3"', '14"', '15.6"', '16"', '17.3"'],
        required: true,
        isFilterable: true,
        isSearchable: false,
        displayOrder: 4
      },
      {
        name: 'Graphics Card',
        type: 'text',
        required: false,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 5
      },
      {
        name: 'Operating System',
        type: 'select',
        options: ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'Chrome OS'],
        required: true,
        isFilterable: true,
        isSearchable: true,
        displayOrder: 6
      }
    ],
    uiConfig: {
      icon: '💻',
      color: '#8B5CF6',
      thumbnailAttributes: ['RAM', 'Processor', 'Screen Size']
    }
  }
];

// Sample products
const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'The ultimate iPhone with titanium design and A17 Pro chip',
    category: null, // Will be set dynamically
    price: 159999,
    discountPrice: 149999,
    stock: 25,
    sku: 'APPL-IPH15PM-001',
    attributes: new Map([
      ['RAM', '8GB'],
      ['Processor', 'A17 Pro'],
      ['Storage', '256GB'],
      ['Color', 'Natural Titanium'],
      ['Display Size', '6.7"'],
      ['Battery', '4422']
    ]),
    highlights: [
      'Titanium design with aerospace-grade alloy',
      'A17 Pro chip for unprecedented performance',
      'Pro camera system with 48MP main camera',
      'Action button for quick access to features'
    ],
    specifications: [
      { label: 'Display', value: '6.7-inch Super Retina XDR' },
      { label: 'Chip', value: 'A17 Pro chip' },
      { label: 'Camera', value: '48MP Main, 12MP Ultra Wide, 12MP Telephoto' },
      { label: 'Video', value: '4K Dolby Vision up to 60 fps' },
      { label: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.3' }
    ],
    images: [
      { url: 'https://example.com/iphone15promax-1.jpg', alt: 'iPhone 15 Pro Max - Front', isPrimary: true },
      { url: 'https://example.com/iphone15promax-2.jpg', alt: 'iPhone 15 Pro Max - Back' }
    ],
    tags: ['iPhone', 'Apple', '5G', 'Premium', 'Flagship'],
    status: 'active'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Galaxy AI is here with the most powerful Galaxy S yet',
    category: null,
    price: 129999,
    discountPrice: 119999,
    stock: 40,
    sku: 'SAMS-S24U-001',
    attributes: new Map([
      ['RAM', '12GB'],
      ['Processor', 'Snapdragon 8 Gen 3'],
      ['Storage', '512GB'],
      ['Color', 'Titanium Gray'],
      ['Display Size', '6.8"'],
      ['Battery', '5000']
    ]),
    highlights: [
      'Galaxy AI for enhanced productivity',
      '200MP camera with advanced AI features',
      'Built-in S Pen for precision control',
      'Titanium frame for durability'
    ],
    specifications: [
      { label: 'Display', value: '6.8-inch Dynamic AMOLED 2X' },
      { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { label: 'Camera', value: '200MP + 50MP + 12MP + 10MP' },
      { label: 'Battery', value: '5000mAh with 45W charging' },
      { label: 'S Pen', value: 'Built-in with Air Actions' }
    ],
    images: [
      { url: 'https://example.com/s24ultra-1.jpg', alt: 'Galaxy S24 Ultra - Front', isPrimary: true },
      { url: 'https://example.com/s24ultra-2.jpg', alt: 'Galaxy S24 Ultra - Side' }
    ],
    tags: ['Samsung', 'Galaxy', '5G', 'Android', 'S Pen'],
    status: 'active'
  },
  {
    name: 'Gold Temple Bangles',
    description: 'Traditional 22K gold temple jewelry bangles with intricate designs',
    category: null,
    price: 185000,
    stock: 8,
    sku: 'BANG-GOLD-TMP-001',
    attributes: new Map([
      ['Color', 'Gold'],
      ['Size', 'Medium (2.75")'],
      ['Material', 'Gold'],
      ['Weight', '45 grams'],
      ['Pattern', 'Temple'],
      ['Occasion', ['Wedding', 'Festival', 'Bridal']]
    ]),
    highlights: [
      '22K pure gold craftsmanship',
      'Traditional temple jewelry design',
      'Intricate hand-carved patterns',
      'Comes with authenticity certificate'
    ],
    specifications: [
      { label: 'Purity', value: '22 Karat (91.6% pure)' },
      { label: 'Weight', value: '45 grams (±2 grams)' },
      { label: 'Size', value: '2.75 inches diameter' },
      { label: 'Finish', value: 'Matte and Polished' },
      { label: 'Certification', value: 'BIS Hallmarked' }
    ],
    images: [
      { url: 'https://example.com/gold-bangle-1.jpg', alt: 'Gold Temple Bangles - Pair', isPrimary: true },
      { url: 'https://example.com/gold-bangle-2.jpg', alt: 'Gold Temple Bangles - Detail' }
    ],
    tags: ['Gold', 'Temple Jewelry', 'Traditional', 'Wedding', 'Bridal'],
    status: 'active'
  },
  {
    name: 'Glass Designer Bangles Set',
    description: 'Elegant set of 6 glass bangles with golden detailing',
    category: null,
    price: 2500,
    discountPrice: 1999,
    stock: 50,
    sku: 'BANG-GLS-DSN-006',
    attributes: new Map([
      ['Color', ['Red', 'Gold', 'Green']],
      ['Size', 'Large (3")'],
      ['Material', 'Glass'],
      ['Weight', '120 grams (set)'],
      ['Pattern', 'Designer'],
      ['Occasion', ['Party', 'Festival', 'Casual']]
    ]),
    highlights: [
      'Set of 6 beautifully designed bangles',
      'Durable glass with golden accents',
      'Perfect for festivals and parties',
      'Lightweight and comfortable to wear'
    ],
    specifications: [
      { label: 'Material', value: 'Premium Glass with Gold Foil' },
      { label: 'Set Includes', value: '6 bangles (mixed sizes)' },
      { label: 'Size', value: '3 inches diameter' },
      { label: 'Care', value: 'Handle with care, avoid water' },
      { label: 'Packaging', value: 'Gift box included' }
    ],
    images: [
      { url: 'https://example.com/glass-bangle-set-1.jpg', alt: 'Glass Bangles Set', isPrimary: true },
      { url: 'https://example.com/glass-bangle-set-2.jpg', alt: 'Glass Bangles - Worn' }
    ],
    tags: ['Glass Bangles', 'Designer', 'Party Wear', 'Affordable', 'Gift'],
    status: 'active'
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'The most powerful MacBook Pro ever with M3 Max chip',
    category: null,
    price: 319900,
    stock: 15,
    sku: 'APPL-MBP16-M3MAX',
    attributes: new Map([
      ['RAM', '36GB'],
      ['Processor', 'Apple M3 Max'],
      ['Storage', '1TB SSD'],
      ['Screen Size', '16"'],
      ['Graphics Card', '40-core GPU'],
      ['Operating System', 'macOS Sonoma']
    ]),
    highlights: [
      'M3 Max chip with 16-core CPU',
      'Stunning Liquid Retina XDR display',
      'Up to 22 hours battery life',
      'Advanced camera and audio systems'
    ],
    specifications: [
      { label: 'Display', value: '16.2-inch Liquid Retina XDR' },
      { label: 'Chip', value: 'Apple M3 Max' },
      { label: 'Memory', value: '36GB unified memory' },
      { label: 'Storage', value: '1TB SSD' },
      { label: 'Battery', value: 'Up to 22 hours' },
      { label: 'Ports', value: '3x Thunderbolt 4, HDMI, SDXC' }
    ],
    images: [
      { url: 'https://example.com/macbook-pro-16-1.jpg', alt: 'MacBook Pro 16 - Front', isPrimary: true },
      { url: 'https://example.com/macbook-pro-16-2.jpg', alt: 'MacBook Pro 16 - Side' }
    ],
    tags: ['MacBook', 'Apple', 'M3 Max', 'Professional', 'Creative'],
    status: 'active'
  },
  {
    name: 'Dell XPS 15',
    description: 'Premium Windows laptop with InfinityEdge display',
    category: null,
    price: 189990,
    discountPrice: 174990,
    stock: 20,
    sku: 'DELL-XPS15-001',
    attributes: new Map([
      ['RAM', '16GB'],
      ['Processor', 'Intel i7'],
      ['Storage', '512GB SSD'],
      ['Screen Size', '15.6"'],
      ['Graphics Card', 'NVIDIA RTX 4050'],
      ['Operating System', 'Windows 11']
    ]),
    highlights: [
      '15.6-inch OLED InfinityEdge display',
      '13th Gen Intel Core i7 processor',
      'NVIDIA GeForce RTX 4050 graphics',
      'Premium CNC aluminum design'
    ],
    specifications: [
      { label: 'Display', value: '15.6" FHD+ InfinityEdge' },
      { label: 'Processor', value: 'Intel Core i7-13700H' },
      { label: 'Graphics', value: 'NVIDIA RTX 4050 6GB' },
      { label: 'Memory', value: '16GB DDR5' },
      { label: 'Storage', value: '512GB PCIe NVMe SSD' },
      { label: 'Battery', value: '86Whr' }
    ],
    images: [
      { url: 'https://example.com/dell-xps15-1.jpg', alt: 'Dell XPS 15 - Open', isPrimary: true },
      { url: 'https://example.com/dell-xps15-2.jpg', alt: 'Dell XPS 15 - Closed' }
    ],
    tags: ['Dell', 'XPS', 'Windows', 'Premium', 'Creator Laptop'],
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✓ Cleared existing data');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✓ Inserted ${insertedCategories.length} categories`);

    // Find category IDs
    const mobileCategory = insertedCategories.find(c => c.name === 'Mobile');
    const banglesCategory = insertedCategories.find(c => c.name === 'Bangles');
    const laptopsCategory = insertedCategories.find(c => c.name === 'Laptops');

    // Assign categories to products
    products[0].category = mobileCategory._id; // iPhone
    products[1].category = mobileCategory._id; // Samsung
    products[2].category = banglesCategory._id; // Gold Bangles
    products[3].category = banglesCategory._id; // Glass Bangles
    products[4].category = laptopsCategory._id; // MacBook
    products[5].category = laptopsCategory._id; // Dell XPS

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✓ Inserted ${insertedProducts.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Data:');
    console.log('- Categories:', insertedCategories.map(c => c.name).join(', '));
    console.log('- Products:', insertedProducts.map(p => p.name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
