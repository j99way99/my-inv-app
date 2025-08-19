const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Item = require('./models/Item');
const ApplyEvent = require('./models/ApplyEvent');
const Order = require('./models/Order');
const Counter = require('./models/Counter');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World from Node.js Backend!' });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: '이미 존재하는 사용자명 또는 이메일입니다.' 
      });
    }

    // Create new user
    const user = new User({ username, email, password, name });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ error: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ createdBy: req.user.userId });
    
    // Calculate salesQuantity for each item from orders
    const itemsWithSales = await Promise.all(items.map(async (item) => {
      const orders = await Order.find({ 
        'orderItems.item': item._id,
        createdBy: req.user.userId 
      });
      
      const totalSales = orders.reduce((sum, order) => {
        const orderItem = order.orderItems.find(oi => oi.item.toString() === item._id.toString());
        return sum + (orderItem ? orderItem.quantity : 0);
      }, 0);
      
      return {
        ...item.toObject(),
        salesQuantity: totalSales
      };
    }));
    
    res.json(itemsWithSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const itemNumber = await getNextSequence('itemNumber');
    const { salesQuantity, ...itemData } = req.body; // Remove salesQuantity if sent
    const item = new Item({
      ...itemData,
      itemNumber: `ITEM-${String(itemNumber).padStart(6, '0')}`,
      salesQuantity: 0, // Always initialize to 0
      createdBy: req.user.userId
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/apply-events', authenticateToken, async (req, res) => {
  try {
    const events = await ApplyEvent.find({ createdBy: req.user.userId })
      .populate('eventItems.item')
      .sort({ createdAt: -1 });
    
    // Calculate available stock for each item by subtracting completed orders
    const eventsWithAvailableStock = await Promise.all(events.map(async (event) => {
      const eventItemsWithStock = await Promise.all(event.eventItems.map(async (eventItem) => {
        // Find all completed orders for this item
        const completedOrders = await Order.find({ 
          'orderItems.item': eventItem.item._id,
          status: 'completed'
        });
        
        // Calculate total ordered quantity for this item
        const totalOrderedQuantity = completedOrders.reduce((sum, order) => {
          const orderItem = order.orderItems.find(oi => oi.item.toString() === eventItem.item._id.toString());
          return sum + (orderItem ? orderItem.quantity : 0);
        }, 0);
        
        // Calculate available stock
        const availableStock = Math.max(0, eventItem.item.stockQuantity - totalOrderedQuantity);
        
        return {
          ...eventItem.toObject(),
          item: {
            ...eventItem.item.toObject(),
            availableStock: availableStock
          }
        };
      }));
      
      return {
        ...event.toObject(),
        eventItems: eventItemsWithStock
      };
    }));
    
    res.json(eventsWithAvailableStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apply-events', authenticateToken, async (req, res) => {
  try {
    const event = new ApplyEvent({
      ...req.body,
      createdBy: req.user.userId
    });
    await event.save();
    
    const populatedEvent = await ApplyEvent.findById(event._id)
      .populate('eventItems.item');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/apply-events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await ApplyEvent.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true }
    ).populate('eventItems.item');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or not authorized' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/apply-events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await ApplyEvent.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.userId 
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or not authorized' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ createdBy: req.user.userId })
      .populate('applyEvent')
      .populate('orderItems.item')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    console.log('Order request body:', req.body);
    
    const order = new Order({
      ...req.body,
      createdBy: req.user.userId
    });
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('applyEvent')
      .populate('orderItems.item');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ error: error.message, details: error });
  }
});

app.patch('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      req.body,
      { new: true }
    )
      .populate('applyEvent')
      .populate('orderItems.item');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found or not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});