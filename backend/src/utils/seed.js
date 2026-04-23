const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const ChefDetails = require('../models/ChefDetails');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const VerificationCode = require('../models/VerificationCode');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Drop all existing data (clean slate)
    await User.deleteMany({});
    await ChefDetails.deleteMany({});
    await Recipe.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Bookmark.deleteMany({});
    await VerificationCode.deleteMany({});
    console.log('🗑️ All existing data cleared');

    console.log('\n📝 Creating users...');

    // Create Super Admin - Pass plain password, model will hash
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@recipenest.com',
      password: 'Admin@123456',
      role: 'superadmin',
      isEmailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff'
    });
    console.log(`✅ Admin created: ${admin.email} (Password: Admin@123456)`);

    // Create Chefs - Pass plain passwords
    const chef1 = await User.create({
      name: 'Chef Marco Rossi',
      email: 'marco@recipenest.com',
      password: 'password123',
      role: 'chef',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop'
    });
    console.log(`✅ Chef created: ${chef1.email} (Password: password123)`);

    const chef2 = await User.create({
      name: 'Chef Yuki Tanaka',
      email: 'yuki@recipenest.com',
      password: 'password123',
      role: 'chef',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
    });
    console.log(`✅ Chef created: ${chef2.email} (Password: password123)`);

    const chef3 = await User.create({
      name: 'Chef Sophie Laurent',
      email: 'sophie@recipenest.com',
      password: 'password123',
      role: 'chef',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
    });
    console.log(`✅ Chef created: ${chef3.email} (Password: password123)`);

    const chef4 = await User.create({
      name: 'Chef Miguel Santos',
      email: 'miguel@recipenest.com',
      password: 'password123',
      role: 'chef',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    });
    console.log(`✅ Chef created: ${chef4.email} (Password: password123)`);

    const chef5 = await User.create({
      name: 'Chef Priya Sharma',
      email: 'priya@recipenest.com',
      password: 'password123',
      role: 'chef',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
    });
    console.log(`✅ Chef created: ${chef5.email} (Password: password123)`);

    // Create Regular Users (Food Lovers) - Pass plain passwords
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'foodlover',
      isEmailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff'
    });
    console.log(`✅ User created: ${user1.email} (Password: password123)`);

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'foodlover',
      isEmailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=3b82f6&color=fff'
    });
    console.log(`✅ User created: ${user2.email} (Password: password123)`);

    const user3 = await User.create({
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: 'password123',
      role: 'foodlover',
      isEmailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3b82f6&color=fff'
    });
    console.log(`✅ User created: ${user3.email} (Password: password123)`);

    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'foodlover',
      isEmailVerified: true,
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=10b981&color=fff'
    });
    console.log(`✅ Test user created: ${testUser.email} (Password: password123)`);

    console.log('\n📝 Creating chef details...');

    // Create Chef Details
    await ChefDetails.create({
      userId: chef1._id,
      bio: 'Italian cuisine expert with 15 years of experience. Passionate about traditional recipes with a modern twist.',
      specialty: 'Italian Cuisine',
      experience: 15,
      profileImage: chef1.avatar,
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
      socialMedia: {
        instagram: '@chefmarco',
        twitter: '@marcorossi',
        website: 'www.marcorossi.com'
      }
    });

    await ChefDetails.create({
      userId: chef2._id,
      bio: 'Master of Japanese cuisine specializing in sushi and ramen. Trained in Tokyo for 10 years.',
      specialty: 'Japanese Cuisine',
      experience: 10,
      profileImage: chef2.avatar,
      coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=400&fit=crop',
      socialMedia: {
        instagram: '@yukitanaka',
        facebook: 'Chef Yuki',
        website: 'www.yukitanaka.jp'
      }
    });

    await ChefDetails.create({
      userId: chef3._id,
      bio: 'French pastry chef and culinary instructor. Creating delightful desserts for over 12 years.',
      specialty: 'French Pastry',
      experience: 12,
      profileImage: chef3.avatar,
      coverImage: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&h=400&fit=crop',
      socialMedia: {
        instagram: '@sophiepastry',
        twitter: '@sophielaurent'
      }
    });

    await ChefDetails.create({
      userId: chef4._id,
      bio: 'Mexican cuisine enthusiast bringing authentic flavors from my grandmother\'s kitchen to yours.',
      specialty: 'Mexican Cuisine',
      experience: 8,
      profileImage: chef4.avatar,
      coverImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&h=400&fit=crop',
      socialMedia: {
        instagram: '@chefmiguel',
        website: 'www.miguelsantos.mx'
      }
    });

    await ChefDetails.create({
      userId: chef5._id,
      bio: 'Indian cuisine specialist with expertise in regional dishes. Making spices come alive in every dish.',
      specialty: 'Indian Cuisine',
      experience: 14,
      profileImage: chef5.avatar,
      coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop',
      socialMedia: {
        instagram: '@priyasharma',
        twitter: '@chefpriya'
      }
    });

    console.log('✅ Chef details created');

    console.log('\n📝 Creating recipes...');

    // Create Recipes
    const recipes = [];

    // Recipe 1 - Marco's Pizza
    const recipe1 = await Recipe.create({
      chefId: chef1._id,
      title: 'Classic Margherita Pizza',
      description: 'Authentic Italian pizza with fresh mozzarella, basil, and tomato sauce on a crispy thin crust.',
      category: 'Main Course',
      difficulty: 'Medium',
      prepTime: 120,
      cookTime: 15,
      servings: 4,
      ingredients: [
        { name: 'Pizza dough', quantity: '500', unit: 'g' },
        { name: 'San Marzano tomatoes', quantity: '400', unit: 'g' },
        { name: 'Fresh mozzarella', quantity: '250', unit: 'g' },
        { name: 'Fresh basil', quantity: '1', unit: 'bunch' },
        { name: 'Extra virgin olive oil', quantity: '3', unit: 'tbsp' },
        { name: 'Salt', quantity: '1', unit: 'tsp' }
      ],
      instructions: [
        'Prepare pizza dough and let it rise for 2 hours',
        'Preheat oven to 250°C (482°F)',
        'Roll out dough into a thin circle',
        'Spread crushed tomatoes evenly over the dough',
        'Add torn mozzarella pieces',
        'Drizzle with olive oil and season with salt',
        'Bake for 12-15 minutes until crust is golden',
        'Top with fresh basil leaves and serve immediately'
      ],
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
      tags: ['Italian', 'Pizza', 'Vegetarian'],
      approvalStatus: 'approved',
      views: 1250
    });
    recipes.push(recipe1);

    // Recipe 2 - Marco's Pasta
    const recipe2 = await Recipe.create({
      chefId: chef1._id,
      title: 'Homemade Pasta Carbonara',
      description: 'Creamy Roman pasta dish with guanciale, eggs, and pecorino cheese.',
      category: 'Main Course',
      difficulty: 'Easy',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      ingredients: [
        { name: 'Spaghetti', quantity: '400', unit: 'g' },
        { name: 'Guanciale', quantity: '150', unit: 'g' },
        { name: 'Egg yolks', quantity: '4', unit: 'pcs' },
        { name: 'Pecorino Romano', quantity: '100', unit: 'g' },
        { name: 'Black pepper', quantity: '1', unit: 'tsp' }
      ],
      instructions: [
        'Cook spaghetti in salted boiling water',
        'Cut guanciale into small strips and cook until crispy',
        'Mix egg yolks with grated pecorino',
        'Drain pasta, reserving some pasta water',
        'Toss hot pasta with guanciale',
        'Remove from heat and add egg mixture, stirring quickly',
        'Add pasta water to create creamy sauce',
        'Serve with extra pecorino and black pepper'
      ],
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop',
      tags: ['Italian', 'Pasta', 'Quick'],
      approvalStatus: 'approved',
      views: 890
    });
    recipes.push(recipe2);

    // Recipe 3 - Yuki's Ramen
    const recipe3 = await Recipe.create({
      chefId: chef2._id,
      title: 'Authentic Ramen Bowl',
      description: 'Rich tonkotsu broth with tender chashu pork, soft-boiled eggs, and fresh noodles.',
      category: 'Main Course',
      difficulty: 'Hard',
      prepTime: 240,
      cookTime: 60,
      servings: 4,
      ingredients: [
        { name: 'Pork bones', quantity: '2', unit: 'kg' },
        { name: 'Ramen noodles', quantity: '400', unit: 'g' },
        { name: 'Pork belly', quantity: '500', unit: 'g' },
        { name: 'Eggs', quantity: '4', unit: 'pcs' },
        { name: 'Green onions', quantity: '4', unit: 'stalks' },
        { name: 'Nori sheets', quantity: '4', unit: 'pcs' },
        { name: 'Garlic', quantity: '6', unit: 'cloves' },
        { name: 'Ginger', quantity: '50', unit: 'g' }
      ],
      instructions: [
        'Boil pork bones for 12 hours to create rich broth',
        'Marinate pork belly in soy sauce mixture',
        'Cook pork belly until tender, slice into chashu',
        'Soft-boil eggs for 6 minutes, then marinate',
        'Cook ramen noodles according to package',
        'Assemble bowls with noodles and hot broth',
        'Top with chashu, eggs, green onions, and nori',
        'Serve immediately while hot'
      ],
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
      tags: ['Japanese', 'Ramen', 'Comfort Food'],
      approvalStatus: 'approved',
      views: 2100
    });
    recipes.push(recipe3);

    // Recipe 4 - Yuki's Sushi
    const recipe4 = await Recipe.create({
      chefId: chef2._id,
      title: 'Salmon Sushi Rolls',
      description: 'Fresh salmon maki rolls with cucumber and avocado, served with wasabi and soy sauce.',
      category: 'Appetizer',
      difficulty: 'Medium',
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      ingredients: [
        { name: 'Sushi rice', quantity: '300', unit: 'g' },
        { name: 'Fresh salmon', quantity: '200', unit: 'g' },
        { name: 'Nori sheets', quantity: '4', unit: 'pcs' },
        { name: 'Cucumber', quantity: '1', unit: 'pcs' },
        { name: 'Avocado', quantity: '1', unit: 'pcs' },
        { name: 'Rice vinegar', quantity: '3', unit: 'tbsp' },
        { name: 'Wasabi', quantity: '2', unit: 'tsp' }
      ],
      instructions: [
        'Cook sushi rice and season with rice vinegar',
        'Cut salmon, cucumber, and avocado into strips',
        'Place nori sheet on bamboo mat',
        'Spread rice evenly on nori',
        'Add salmon, cucumber, and avocado in a line',
        'Roll tightly using bamboo mat',
        'Slice into 8 pieces with wet knife',
        'Serve with wasabi, soy sauce, and pickled ginger'
      ],
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
      tags: ['Japanese', 'Sushi', 'Seafood'],
      approvalStatus: 'approved',
      views: 1560
    });
    recipes.push(recipe4);

    // Recipe 5 - Sophie's Croissants
    const recipe5 = await Recipe.create({
      chefId: chef3._id,
      title: 'French Croissants',
      description: 'Flaky, buttery croissants with multiple layers, perfect for breakfast.',
      category: 'Dessert',
      difficulty: 'Hard',
      prepTime: 480,
      cookTime: 20,
      servings: 12,
      ingredients: [
        { name: 'Bread flour', quantity: '500', unit: 'g' },
        { name: 'Butter', quantity: '280', unit: 'g' },
        { name: 'Milk', quantity: '270', unit: 'ml' },
        { name: 'Sugar', quantity: '50', unit: 'g' },
        { name: 'Yeast', quantity: '10', unit: 'g' },
        { name: 'Salt', quantity: '10', unit: 'g' },
        { name: 'Egg', quantity: '1', unit: 'pcs' }
      ],
      instructions: [
        'Mix flour, milk, sugar, yeast, and salt into dough',
        'Refrigerate dough for 1 hour',
        'Roll out dough and add butter block',
        'Fold dough multiple times (lamination)',
        'Refrigerate between each fold (3-4 folds total)',
        'Roll out and cut into triangles',
        'Roll triangles into croissant shape',
        'Proof for 2 hours, brush with egg wash',
        'Bake at 200°C for 15-20 minutes until golden'
      ],
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
      tags: ['French', 'Pastry', 'Breakfast'],
      approvalStatus: 'approved',
      views: 980
    });
    recipes.push(recipe5);

    // Recipe 6 - Sophie's Creme Brulee
    const recipe6 = await Recipe.create({
      chefId: chef3._id,
      title: 'Crème Brûlée',
      description: 'Classic French dessert with creamy vanilla custard and caramelized sugar top.',
      category: 'Dessert',
      difficulty: 'Medium',
      prepTime: 20,
      cookTime: 45,
      servings: 6,
      ingredients: [
        { name: 'Heavy cream', quantity: '500', unit: 'ml' },
        { name: 'Egg yolks', quantity: '6', unit: 'pcs' },
        { name: 'Sugar', quantity: '100', unit: 'g' },
        { name: 'Vanilla bean', quantity: '1', unit: 'pcs' },
        { name: 'Brown sugar', quantity: '6', unit: 'tbsp' }
      ],
      instructions: [
        'Preheat oven to 150°C',
        'Heat cream with vanilla bean',
        'Whisk egg yolks with sugar',
        'Slowly add hot cream to egg mixture',
        'Strain and pour into ramekins',
        'Bake in water bath for 40-45 minutes',
        'Refrigerate for at least 4 hours',
        'Sprinkle brown sugar on top and caramelize with torch'
      ],
      image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
      tags: ['French', 'Dessert', 'Classic'],
      approvalStatus: 'approved',
      views: 750
    });
    recipes.push(recipe6);

    // Recipe 7 - Miguel's Tacos
    const recipe7 = await Recipe.create({
      chefId: chef4._id,
      title: 'Chicken Tacos al Pastor',
      description: 'Marinated chicken with pineapple, served in soft tortillas with fresh cilantro and onions.',
      category: 'Main Course',
      difficulty: 'Easy',
      prepTime: 120,
      cookTime: 20,
      servings: 6,
      ingredients: [
        { name: 'Chicken thighs', quantity: '800', unit: 'g' },
        { name: 'Pineapple', quantity: '200', unit: 'g' },
        { name: 'Corn tortillas', quantity: '12', unit: 'pcs' },
        { name: 'Onion', quantity: '1', unit: 'pcs' },
        { name: 'Cilantro', quantity: '1', unit: 'bunch' },
        { name: 'Lime', quantity: '2', unit: 'pcs' },
        { name: 'Chipotle peppers', quantity: '2', unit: 'pcs' },
        { name: 'Garlic', quantity: '4', unit: 'cloves' }
      ],
      instructions: [
        'Blend chipotle, garlic, and spices for marinade',
        'Marinate chicken for 2 hours',
        'Grill chicken until cooked through',
        'Grill pineapple slices',
        'Slice chicken and pineapple',
        'Warm tortillas on griddle',
        'Assemble tacos with chicken, pineapple, onions, cilantro',
        'Serve with lime wedges and salsa'
      ],
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
      tags: ['Mexican', 'Tacos', 'Grilled'],
      approvalStatus: 'approved',
      views: 1120
    });
    recipes.push(recipe7);

    // Recipe 8 - Miguel's Guacamole
    const recipe8 = await Recipe.create({
      chefId: chef4._id,
      title: 'Guacamole and Chips',
      description: 'Fresh, chunky guacamole with lime and cilantro, served with crispy tortilla chips.',
      category: 'Appetizer',
      difficulty: 'Easy',
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      ingredients: [
        { name: 'Avocados', quantity: '4', unit: 'pcs' },
        { name: 'Lime', quantity: '2', unit: 'pcs' },
        { name: 'Tomato', quantity: '1', unit: 'pcs' },
        { name: 'Red onion', quantity: '1/2', unit: 'pcs' },
        { name: 'Cilantro', quantity: '1/4', unit: 'cup' },
        { name: 'Jalapeño', quantity: '1', unit: 'pcs' },
        { name: 'Salt', quantity: '1', unit: 'tsp' }
      ],
      instructions: [
        'Mash avocados with lime juice',
        'Dice tomato, onion, and jalapeño',
        'Chop cilantro finely',
        'Mix all ingredients together',
        'Season with salt to taste',
        'Serve immediately with tortilla chips'
      ],
      image: 'https://images.unsplash.com/photo-1601923229831-293e0e59072a?w=800&h=600&fit=crop',
      tags: ['Mexican', 'Appetizer', 'Vegan'],
      approvalStatus: 'approved',
      views: 650
    });
    recipes.push(recipe8);

    // Recipe 9 - Priya's Butter Chicken
    const recipe9 = await Recipe.create({
      chefId: chef5._id,
      title: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces, served with naan bread.',
      category: 'Main Course',
      difficulty: 'Medium',
      prepTime: 30,
      cookTime: 40,
      servings: 6,
      ingredients: [
        { name: 'Chicken breast', quantity: '800', unit: 'g' },
        { name: 'Tomato puree', quantity: '400', unit: 'ml' },
        { name: 'Heavy cream', quantity: '200', unit: 'ml' },
        { name: 'Butter', quantity: '100', unit: 'g' },
        { name: 'Onion', quantity: '2', unit: 'pcs' },
        { name: 'Garlic', quantity: '6', unit: 'cloves' },
        { name: 'Ginger', quantity: '30', unit: 'g' },
        { name: 'Garam masala', quantity: '2', unit: 'tbsp' }
      ],
      instructions: [
        'Marinate chicken in yogurt and spices',
        'Cook chicken until golden, set aside',
        'Sauté onions, garlic, and ginger',
        'Add tomato puree and spices',
        'Simmer sauce for 15 minutes',
        'Add butter and cream',
        'Add chicken back to sauce',
        'Garnish with cilantro and serve with naan'
      ],
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop',
      tags: ['Indian', 'Curry', 'Comfort Food'],
      approvalStatus: 'approved',
      views: 1890
    });
    recipes.push(recipe9);

    // Recipe 10 - Priya's Biryani
    const recipe10 = await Recipe.create({
      chefId: chef5._id,
      title: 'Vegetable Biryani',
      description: 'Fragrant basmati rice layered with spiced vegetables and aromatic herbs.',
      category: 'Main Course',
      difficulty: 'Medium',
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      ingredients: [
        { name: 'Basmati rice', quantity: '500', unit: 'g' },
        { name: 'Mixed vegetables', quantity: '400', unit: 'g' },
        { name: 'Onions', quantity: '2', unit: 'pcs' },
        { name: 'Yogurt', quantity: '200', unit: 'ml' },
        { name: 'Mint leaves', quantity: '1', unit: 'cup' },
        { name: 'Saffron', quantity: '1', unit: 'pinch' },
        { name: 'Biryani masala', quantity: '3', unit: 'tbsp' },
        { name: 'Ghee', quantity: '4', unit: 'tbsp' }
      ],
      instructions: [
        'Soak rice for 30 minutes',
        'Fry onions until golden brown',
        'Cook vegetables with spices and yogurt',
        'Parboil rice until 70% cooked',
        'Layer rice and vegetables in pot',
        'Add saffron milk and fried onions',
        'Cover and cook on low heat for 20 minutes',
        'Let it rest, then fluff and serve'
      ],
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop',
      tags: ['Indian', 'Rice', 'Vegetarian'],
      approvalStatus: 'approved',
      views: 1340
    });
    recipes.push(recipe10);

    console.log(`✅ ${recipes.length} recipes created`);

    console.log('\n📝 Creating comments...');

    // Create Comments
    const comments = await Comment.create([
      {
        recipeId: recipe1._id,
        userId: user1._id,
        userName: user1.name,
        userAvatar: user1.avatar,
        content: 'Amazing pizza recipe! The crust came out perfectly crispy.'
      },
      {
        recipeId: recipe1._id,
        userId: user2._id,
        userName: user2.name,
        userAvatar: user2.avatar,
        content: 'Best homemade pizza I\'ve ever made. Thank you for sharing!'
      },
      {
        recipeId: recipe3._id,
        userId: user3._id,
        userName: user3.name,
        userAvatar: user3.avatar,
        content: 'The ramen broth is incredible! Worth the 12-hour cook time.'
      },
      {
        recipeId: recipe5._id,
        userId: user1._id,
        userName: user1.name,
        userAvatar: user1.avatar,
        content: 'These croissants are better than the bakery!'
      },
      {
        recipeId: recipe9._id,
        userId: user2._id,
        userName: user2.name,
        userAvatar: user2.avatar,
        content: 'The butter chicken is restaurant quality! So creamy and flavorful.'
      },
      {
        recipeId: recipe2._id,
        userId: testUser._id,
        userName: testUser.name,
        userAvatar: testUser.avatar,
        content: 'Carbonara turned out great! Thanks for the recipe.'
      },
      {
        recipeId: recipe7._id,
        userId: user3._id,
        userName: user3.name,
        userAvatar: user3.avatar,
        content: 'Best tacos ever! The marinade is perfect.'
      }
    ]);
    console.log(`✅ ${comments.length} comments created`);

    console.log('\n📝 Creating likes...');

    // Create Likes
    const likesData = [
      { recipeId: recipe1._id, userId: user1._id },
      { recipeId: recipe1._id, userId: user2._id },
      { recipeId: recipe1._id, userId: testUser._id },
      { recipeId: recipe2._id, userId: user3._id },
      { recipeId: recipe3._id, userId: user1._id },
      { recipeId: recipe3._id, userId: user2._id },
      { recipeId: recipe3._id, userId: user3._id },
      { recipeId: recipe3._id, userId: testUser._id },
      { recipeId: recipe4._id, userId: user1._id },
      { recipeId: recipe5._id, userId: user2._id },
      { recipeId: recipe5._id, userId: user3._id },
      { recipeId: recipe6._id, userId: testUser._id },
      { recipeId: recipe7._id, userId: user1._id },
      { recipeId: recipe7._id, userId: user2._id },
      { recipeId: recipe8._id, userId: user3._id },
      { recipeId: recipe9._id, userId: user1._id },
      { recipeId: recipe9._id, userId: user2._id },
      { recipeId: recipe9._id, userId: user3._id },
      { recipeId: recipe9._id, userId: testUser._id },
      { recipeId: recipe10._id, userId: user1._id }
    ];

    for (const like of likesData) {
      await Like.create(like);
    }
    console.log(`✅ ${likesData.length} likes created`);

    console.log('\n📝 Creating bookmarks...');

    // Create Bookmarks
    const bookmarksData = [
      { recipeId: recipe1._id, userId: user1._id },
      { recipeId: recipe1._id, userId: user2._id },
      { recipeId: recipe3._id, userId: testUser._id },
      { recipeId: recipe5._id, userId: user2._id },
      { recipeId: recipe5._id, userId: user3._id },
      { recipeId: recipe7._id, userId: user1._id },
      { recipeId: recipe9._id, userId: user2._id },
      { recipeId: recipe9._id, userId: testUser._id },
      { recipeId: recipe10._id, userId: user3._id }
    ];

    for (const bookmark of bookmarksData) {
      await Bookmark.create(bookmark);
    }
    console.log(`✅ ${bookmarksData.length} bookmarks created`);

    // Final Summary
    console.log('\n========================================');
    console.log('🎉 DATABASE SEEDING COMPLETED! 🎉');
    console.log('========================================');
    console.log('📊 Summary:');
    console.log(`   - 1 Super Admin`);
    console.log(`   - 5 Chefs`);
    console.log(`   - 4 Regular Users (including 1 test user)`);
    console.log(`   - ${recipes.length} Recipes`);
    console.log(`   - ${comments.length} Comments`);
    console.log(`   - ${likesData.length} Likes`);
    console.log(`   - ${bookmarksData.length} Bookmarks`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('========================================');
    console.log('ADMIN ACCOUNT:');
    console.log('   Email: admin@recipenest.com');
    console.log('   Password: Admin@123456');
    console.log('\nCHEF ACCOUNTS:');
    console.log('   Email: marco@recipenest.com | Password: password123');
    console.log('   Email: yuki@recipenest.com | Password: password123');
    console.log('   Email: sophie@recipenest.com | Password: password123');
    console.log('   Email: miguel@recipenest.com | Password: password123');
    console.log('   Email: priya@recipenest.com | Password: password123');
    console.log('\nREGULAR USERS:');
    console.log('   Email: john@example.com | Password: password123');
    console.log('   Email: jane@example.com | Password: password123');
    console.log('   Email: mike@example.com | Password: password123');
    console.log('   Email: test@example.com | Password: password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();