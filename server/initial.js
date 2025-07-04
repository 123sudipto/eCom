import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shoe-store')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      isAdmin: true
    });

    console.log('Admin user created:', adminUser.email);

    // Create sample products
    const products = [
      {
        name: 'Classic Leather Sneakers',
        description: 'Timeless leather sneakers perfect for casual wear. Features premium leather upper and comfortable cushioning.',
        price: 79.99,
        images: [
          'https://example.com/images/sneaker1.jpg',
          'https://example.com/images/sneaker1-alt.jpg'
        ],
        brand: 'ClassicWear',
        category: 'casual',
        sizes: [
          { size: 8, stock: 10 },
          { size: 9, stock: 15 },
          { size: 10, stock: 12 }
        ],
        color: 'Brown',
        featured: true
      },
      {
        name: 'Professional Oxford Shoes',
        description: 'Elegant oxford shoes for formal occasions. Made with genuine leather and featuring a classic design.',
        price: 129.99,
        images: [
          'https://example.com/images/oxford1.jpg',
          'https://example.com/images/oxford1-alt.jpg'
        ],
        brand: 'FormalFit',
        category: 'formal',
        sizes: [
          { size: 8, stock: 8 },
          { size: 9, stock: 10 },
          { size: 10, stock: 8 }
        ],
        color: 'Black',
        featured: true
      },
      {
        name: 'Performance Running Shoes',
        description: 'Lightweight and breathable running shoes with advanced cushioning technology.',
        price: 99.99,
        images: [
          'https://example.com/images/running1.jpg',
          'https://example.com/images/running1-alt.jpg'
        ],
        brand: 'SportMax',
        category: 'sports',
        sizes: [
          { size: 8, stock: 12 },
          { size: 9, stock: 18 },
          { size: 10, stock: 15 }
        ],
        color: 'Blue/White',
        featured: true
      },
      {
        name: 'Waterproof Hiking Boots',
        description: 'Durable hiking boots with waterproof membrane and excellent traction.',
        price: 149.99,
        images: [
          'https://example.com/images/boots1.jpg',
          'https://example.com/images/boots1-alt.jpg'
        ],
        brand: 'TrailMaster',
        category: 'boots',
        sizes: [
          { size: 8, stock: 6 },
          { size: 9, stock: 8 },
          { size: 10, stock: 7 }
        ],
        color: 'Brown/Black',
        featured: false
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 