const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wings_jewellers');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial data if database is empty
    await seedInitialData();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedInitialData = async () => {
  try {
    const Category = require('../models/Category');
    const Product = require('../models/Product');
    const User = require('../models/User');

    const categoryCount = await Category.countDocuments({});
    if (categoryCount === 0) {
      console.log('Database empty. Initializing custom seeder...');

      // 1. Seed Categories
      const necklaces = await Category.create({ name: 'Necklaces', description: 'Elegant Korean Necklaces' });
      const bracelets = await Category.create({ name: 'Bracelets', description: 'Chic Korean Bracelets' });
      const anklets = await Category.create({ name: 'Anklets', description: 'Graceful Korean Anklets' });
      console.log('[+] seeded standard Categories.');

      // 2. Seed Products
      const products = [
        {
          name: 'Butterfly Whisper Necklace',
          description: 'Subtle, stunning Butterfly Whisper Necklace with fine link chain details.',
          price: 29.00,
          category: necklaces._id,
          inventory: 4,
          isCustomizable: true,
          images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1887']
        },
        {
          name: 'Tiny Heart Bracelet',
          description: 'A minimal, dainty Korean style bracelet featuring a fine, hand-polished heart charm.',
          price: 24.00,
          category: bracelets._id,
          inventory: 12,
          isCustomizable: true,
          images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070']
        },
        {
          name: 'Butterfly Charm Anklet',
          description: 'Express your graceful walk with our light-weight, double-layered butterfly anklet.',
          price: 26.00,
          category: anklets._id,
          inventory: 8,
          isCustomizable: true,
          images: ['https://images.unsplash.com/photo-1535633302704-c02fbc751c0a?q=80&w=1887']
        }
      ];

      await Product.insertMany(products);
      console.log('[+] Seeded default products catalog.');

      // 3. Seed Default Users
      // Regular user
      await User.create({
        name: 'Elena Park',
        email: 'elena@wingsjewellers.com',
        password: 'password123',
        role: 'user'
      });

      // Admin user
      await User.create({
        name: 'Admin Admin',
        email: 'admin@wingsjewellers.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('[+] Seeded default Elena (User) and Admin accounts.');
      console.log('Seeding process completed successfully!');
    }
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

module.exports = connectDB;
