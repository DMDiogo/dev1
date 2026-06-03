require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(cors());
app.use(express.json());

// Initialize Prisma
const { PrismaPg } =
    require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });    
//const prisma = new PrismaClient();


// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}
testDatabaseConnection();

// Helper functions
function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return (hour * 60) + minute;
}

async function getCoordinates(address) {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'DeliveryApp/1.0',
        },
      },
    );

    if (!response.data.length) {
      return { latitude: null, longitude: null };
    }

    return {
      latitude: parseFloat(response.data[0].lat),
      longitude: parseFloat(response.data[0].lon),
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return { latitude: null, longitude: null };
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter 
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*
|--------------------------------------------------------------------------
| DASHBOARD API (Converted from Next.js)
|--------------------------------------------------------------------------
*/
app.get('/api/dashboard', async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalRestaurants,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.restaurant.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: true, 
          items: {
            include: {
              product: true,
              restaurant: true
            }
          } 
        },
      }),
      prisma.$queryRaw`
        SELECT status, COUNT(*) as _count
        FROM "Order"
        GROUP BY status
      `,
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalUsers,
      totalRestaurants,
      recentOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

/*
|--------------------------------------------------------------------------
| USERS API (Admin panel)
|--------------------------------------------------------------------------
*/
app.get('/api/users', async (req, res) => {
  try {
    const { role, search } = req.query;

    const where = {};
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        telephone: true,
        role: true,
        address: true,
        taxId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { 
            orders: true, 
            driverOrders: true 
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        telephone: true,
        role: true,
        address: true,
        taxId: true,
        latitude: true,
        longitude: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            driverOrders: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE', 'BLOCKED', 'STAND_BY'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
  }
});

/*
|--------------------------------------------------------------------------
| ORDERS API (Admin panel)
|--------------------------------------------------------------------------
*/
app.get('/api/orders', async (req, res) => {
  try {
    const { status, userId, startDate, endDate } = req.query;
    
    const where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, telephone: true, email: true } },
        driver: { select: { name: true, telephone: true } },
        items: {
          include: {
            product: { select: { name: true, price: true } },
            restaurant: { select: { name: true, address: true } },
          },
        },
      },
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, telephone: true, email: true, address: true } },
        driver: { select: { name: true, telephone: true } },
        items: {
          include: {
            product: { select: { name: true, price: true, taxPercentage: true } },
            restaurant: { select: { name: true, address: true, telephone: true } },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.json;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ACCEPTED_DRIVER', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        driver: { select: { name: true } },
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
  }
});

/*
|--------------------------------------------------------------------------
| RESTAURANTS API (Admin panel)
|--------------------------------------------------------------------------
*/
app.get('/api/restaurants', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        workingHours: true,
        paymentMethods: true,
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Erro ao buscar restaurantes' });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        workingHours: true,
        paymentMethods: true,
        products: {
          orderBy: { name: 'asc' }
        },
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Erro ao buscar restaurante' });
  }
});

app.post('/api/restaurants', async (req, res) => {
  try {
    const { name, address, telephone, email, taxId, website, logo, regimeIva, orderEmail } = req.body;

    if (!name?.trim() || !address?.trim()) {
      return res.status(400).json({ error: 'Nome e morada são obrigatórios' });
    }

    // Get coordinates from address
    let latitude = null;
    let longitude = null;
    
    if (address && address.trim()) {
      const coords = await getCoordinates(address);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        telephone: telephone?.trim() || null,
        email: email?.trim() || null,
        taxId: taxId?.trim() || null,
        website: website?.trim() || null,
        logo: logo?.trim() || null,
        latitude,
        longitude,
        regimeIva: regimeIva || null,
        orderEmail: orderEmail?.trim() || null,
        status: 'ACTIVE',
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Erro ao criar restaurante' });
  }
});

app.patch('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, telephone, email, website, taxId, logo, status } = req.body;

    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (address !== undefined) {
      updateData.address = address.trim();
      // Update coordinates if address changed
      if (address.trim()) {
        const coords = await getCoordinates(address);
        updateData.latitude = coords.latitude;
        updateData.longitude = coords.longitude;
      }
    }
    if (telephone !== undefined) updateData.telephone = telephone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (website !== undefined) updateData.website = website?.trim() || null;
    if (taxId !== undefined) updateData.taxId = taxId?.trim() || null;
    if (logo !== undefined) updateData.logo = logo?.trim() || null;
    if (status !== undefined) updateData.status = status;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
    });

    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Erro ao atualizar restaurante' });
  }
});

/*
|--------------------------------------------------------------------------
| PRODUCTS API (Admin panel)
|--------------------------------------------------------------------------
*/
app.get('/api/products', async (req, res) => {
  try {
    const { restaurantId, search } = req.query;
    
    const where = {};
    
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: { 
        restaurant: { select: { name: true, address: true } } 
      },
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { 
        restaurant: { select: { name: true, address: true } } 
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, restaurantId, taxPercentage, description, image1, image2, image3, image4 } = req.body;

    if (!name?.trim() || !restaurantId) {
      return res.status(400).json({ error: 'Nome e restaurante são obrigatórios' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Preço inválido' });
    }

    const validTaxRates = ['VAT_6', 'VAT_13', 'VAT_23'];
    const tax = taxPercentage && validTaxRates.includes(taxPercentage) ? taxPercentage : 'VAT_23';

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        restaurantId,
        taxPercentage: tax,
        description: description?.trim() || null,
        image1: image1 || null,
        image2: image2 || null,
        image3: image3 || null,
        image4: image4 || null,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, taxPercentage, description, status, image1, image2, image3, image4 } = req.body;

    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Preço inválido' });
      }
      updateData.price = price;
    }
    if (taxPercentage !== undefined) updateData.taxPercentage = taxPercentage;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (image1 !== undefined) updateData.image1 = image1;
    if (image2 !== undefined) updateData.image2 = image2;
    if (image3 !== undefined) updateData.image3 = image3;
    if (image4 !== undefined) updateData.image4 = image4;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

/*
|--------------------------------------------------------------------------
| RESTAURANT STATISTICS
|--------------------------------------------------------------------------
*/
app.get('/api/restaurants/:restaurantId/stats', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const [totalOrders, completedOrders, totalRevenue, recentOrders] = await Promise.all([
      prisma.order.count({
        where: {
          items: {
            some: { restaurantId }
          }
        }
      }),
      prisma.order.count({
        where: {
          items: { some: { restaurantId } },
          status: 'DELIVERED'
        }
      }),
      prisma.order.aggregate({
        where: {
          items: { some: { restaurantId } },
          status: 'DELIVERED'
        },
        _sum: { total: true }
      }),
      prisma.order.findMany({
        where: {
          items: { some: { restaurantId } }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          items: {
            where: { restaurantId },
            include: { product: true }
          }
        }
      })
    ]);

    res.json({
      totalOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

/*
|--------------------------------------------------------------------------
| UPLOAD ENDPOINT
|--------------------------------------------------------------------------
*/
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

/*
|--------------------------------------------------------------------------
| PUBLIC API ENDPOINTS (For mobile app)
|--------------------------------------------------------------------------
*/

// Restaurant payment methods
app.get('/api/restaurants/:restaurantId/payment-methods', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const paymentMethods = await prisma.restaurantPaymentMethod.findMany({
      where: { restaurantId: restaurantId },
      select: { method: true }
    });
    
    res.json(paymentMethods.map(pm => ({ method: pm.method })));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get restaurant products
app.get('/api/restaurants/:id/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { restaurantId: req.params.id },
      select: {
        id: true,
        name: true,
        price: true,
        restaurantId: true,
        image1: true,
        image2: true,
        image3: true,
        image4: true,
        description: true,
        taxPercentage: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Get all restaurants
app.get('/api/restaurants/public', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        address: true,
        telephone: true,
        email: true,
        website: true,
        logo: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        workingHours: true,
        status: true,
      },
    });

    const now = new Date();
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().substring(0, 5);

    const result = restaurants.map(r => {
      const today = r.workingHours?.find(h => h.dayOfWeek.toUpperCase() === currentDay);
      let isOpen = false;

      if (today) {
        const nowMinutes = timeToMinutes(currentTime);
        const startMinutes = timeToMinutes(today.startTime);
        const endMinutes = timeToMinutes(today.endTime);
        isOpen = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
      }

      return { ...r, isOpen };
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao buscar restaurantes' });
  }
});

// Get single restaurant
app.get('/api/restaurants/public/:id', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        address: true,
        telephone: true,
        email: true,
        website: true,
        logo: true,
        latitude: true,
        longitude: true,
        regimeIva: true,
        taxId: true,
        orderEmail: true,
        paymentMethods: true,
        createdAt: true,
        status: true,
        workingHours: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, address, telephone, taxId, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já existe' });
    }

    // Check taxId
    if (taxId) {
      const existingTaxId = await prisma.user.findFirst({ where: { taxId } });
      if (existingTaxId) {
        return res.status(400).json({ error: 'NIF já registado' });
      }
    }

    // Check telephone
    const existingPhone = await prisma.user.findFirst({ where: { telephone } });
    if (existingPhone) {
      return res.status(400).json({ error: 'Telefone já registado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let latitude = null;
    let longitude = null;

    if (address && address.trim()) {
      const coords = await getCoordinates(address);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    // Set status based on role
    const status = role === "DRIVER" ? "STAND_BY" : "ACTIVE";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        telephone,
        taxId: taxId?.trim() || null,
        role,
        latitude,
        longitude,
        status,
      },
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ message: 'Usuário criado', user: userWithoutPassword });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({ access_token: token, user: userWithoutPassword });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, total, totalIVA, platformTax, deliveryTax, paymentMethod, items } = req.body;

    console.log('Creating order for user:', userId);
    console.log('Payment method:', paymentMethod);
    console.log('Items:', items);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Pedido vazio' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Método de pagamento não selecionado' });
    }

    const order = await prisma.order.create({
      data: {
        total: parseFloat(total),
        totalIVA: parseFloat(totalIVA),
        platformTax: parseFloat(platformTax),
        deliveryFee: parseFloat(deliveryTax),
        paymentMethod: paymentMethod,
        status: 'PENDING',
        user: { connect: { id: String(userId) } },
        items: {
          create: items.map(item => ({
            quantity: parseInt(item.quantity || 1),
            price: parseFloat(item.price),
            product: { connect: { id: String(item.productId) } },
            restaurant: { connect: { id: String(item.restaurantId) } },
          })),
        },
      },
      include: {
        user: true,
        items: { include: { product: true, restaurant: true } },
      },
    });

    res.status(201).json({ message: 'Pedido criado', order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Get available orders for drivers
app.get('/api/orders/available', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'READY_FOR_PICKUP' },
      include: {
        user: { select: { name: true, telephone: true, address: true } },
        items: { 
          include: { 
            product: true, 
            restaurant: { select: { name: true, address: true, telephone: true } } 
          } 
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Accept order by driver
app.post('/api/orders/accept', async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    const order = await prisma.order.update({
      where: { id: String(orderId), status: 'READY_FOR_PICKUP' },
      data: { driverId: String(driverId), status: 'ACCEPTED_DRIVER' },
    });

    res.json(order);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao aceitar pedido' });
  }
});

// Get user orders
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.userId },
      include: {
        items: { include: { product: true, restaurant: true } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao carregar pedidos' });
  }
});

// Get single order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { 
        user: { select: { name: true, telephone: true, email: true, address: true } }, 
        driver: { select: { name: true, telephone: true } }, 
        items: {
          include: {
            product: true,
            restaurant: true
          }
        }
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// Update driver location
app.patch('/api/orders/:orderId/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { driverLatitude: latitude, driverLongitude: longitude },
    });

    res.json(order);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao atualizar localização' });
  }
});

// Update order status
app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId.toString() },
      data: { status },
    });

    res.json(order);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Get driver orders
app.get('/api/orders/driver/:driverId', async (req, res) => {
  try {
    const driverId = req.params.driverId.toString();
    const orders = await prisma.order.findMany({
      where: {
        driverId: driverId,
        status: { in: ['ACCEPTED_DRIVER', 'DELIVERED', 'PICKED_UP', 'IN_TRANSIT'] },
      },
      include: {
        user: { select: { name: true, telephone: true, address: true } },
        items: { 
          include: { 
            product: true, 
            restaurant: { select: { name: true, address: true, telephone: true } } 
          } 
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao buscar entregas' });
  }
});

// Complete order
app.post('/api/orders/complete', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.update({
      where: { id: String(orderId) },
      data: { status: 'DELIVERED' },
    });

    res.json(order);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Erro ao finalizar pedido' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API rodando na porta ${PORT}`);
});