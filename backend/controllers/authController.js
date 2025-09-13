const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

 

exports.init = async (req, res) => {
  try {
    await User.deleteMany({});
    await Tenant.deleteMany({});

    const acme = new Tenant({ name: 'Acme', slug: 'acme' });
    const globex = new Tenant({ name: 'Globex', slug: 'globex' });

    await acme.save();
    await globex.save();

    const users = [
      { email: 'admin@acme.test', password: 'password', role: 'admin', plan: 'pro', tenant: acme._id },
      { email: 'user@acme.test', password: 'password', role: 'member', plan: 'free', tenant: acme._id },
      { email: 'admin@globex.test', password: 'password', role: 'admin', plan: 'pro', tenant: globex._id },
      { email: 'user@globex.test', password: 'password', role: 'member', plan: 'free', tenant: globex._id }
    ];

    // Hash passwords for each user before saving
    const usersWithHashedPasswords = await Promise.all(users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }));

    await User.insertMany(usersWithHashedPasswords);

    res.status(201).json({ message: 'Database initialized with test users and tenants.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during initialization' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('tenant');
    if (!user) return res.status(400).json({ error: 'Invalid Credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });
    
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      tenantId: user.tenant._id,
      tenantSlug: user.tenant.slug,
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};