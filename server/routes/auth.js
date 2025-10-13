import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '../db.js';

const router = Router();
const COLLECTION = process.env.COLLECTION_NAME || 'agents';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function normalizeName(doc) {
  if (doc.firstName && doc.lastName) return `${doc.firstName} ${doc.lastName}`;
  return doc.name || 'Agent';
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, agentCode } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const col = await getCollection(COLLECTION);
    const existing = await col.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const doc = {
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      agentCode: agentCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await col.insertOne(doc);
    const token = jwt.sign({ sub: result.insertedId.toString(), email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      _id: result.insertedId,
      email,
      fullName: normalizeName(doc),
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const col = await getCollection(COLLECTION);
    const user = await col.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Support legacy clear text password field during migration
    if (user.password && user.password === password) {
      const token = jwt.sign({ sub: user._id.toString(), email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ _id: user._id, email: user.email, fullName: normalizeName(user), token });
    }

    if (!user.passwordHash) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id.toString(), email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ _id: user._id, email: user.email, fullName: normalizeName(user), token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
