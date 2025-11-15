import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
// simple request logger to help debug 404s
app.use((req, _res, next) => {
  try {
    console.log(`--> ${req.method} ${req.path}`);
  } catch (e) {
    // ignore
  }
  next();
});

// log all incoming requests (method + url) for debugging
app.use((req, _res, next) => {
  try {
    // eslint-disable-next-line no-console
    console.log('[REQ]', req.method, req.originalUrl || req.url);
  } catch (e) {
    // ignore
  }
  next();
});

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => cb(null, uploadsDir),
  filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`),
});
const upload = multer({ storage });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';
const PORT = process.env.PORT || 4000;

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Schemas
const NoticeSchema = new mongoose.Schema(
  {
    title: String,
    department: String,
    year: String,
    type: String, // Exam, Event, General
    content: String,
    attachmentUrl: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const LostFoundSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    contact: String,
    imageUrl: String,
    status: { type: String, default: 'Active' }, // Active, Claimed
    date: { type: Date, default: Date.now },
    reportedByEmail: String,
  },
  { timestamps: true }
);

const ResourceSchema = new mongoose.Schema(
  {
    title: String,
    department: String,
    subject: String,
    year: String,
    tags: [String],
    url: String, // PDF URL
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema(
  {
    title: String,
    date: String,
    location: String,
    organizer: String,
    description: String,
  },
  { timestamps: true }
);

// Study Groups
const GroupSchema = new mongoose.Schema(
  {
    name: String,
    subject: String,
    createdByEmail: String,
    members: [String],
  },
  { timestamps: true }
);

const Notice = mongoose.model('Notice', NoticeSchema);
const LostFound = mongoose.model('LostFound', LostFoundSchema);
const Resource = mongoose.model('Resource', ResourceSchema);
const Event = mongoose.model('Event', EventSchema);
const Group = mongoose.model('Group', GroupSchema);
// Users
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

// CRUD endpoints (basic)
app.get('/api/notices', async (req, res) => {
  const { department, year, type, q } = req.query as any;
  const query: any = {};
  if (department) query.department = department;
  if (year) query.year = year;
  if (type) query.type = type;
  if (q) query.$text = { $search: q };
  const items = await Notice.find(query).sort({ createdAt: -1 });
  res.json(items);
});
app.post('/api/notices', async (req, res) => {
  const created = await Notice.create(req.body);
  res.status(201).json(created);
});

app.get('/api/lostfound', async (_req, res) => {
  const items = await LostFound.find().sort({ createdAt: -1 });
  res.json(items);
});
app.post('/api/lostfound', async (req, res) => {
  const created = await LostFound.create(req.body);
  res.status(201).json(created);
});
app.delete('/api/lostfound/:id', async (req, res) => {
  const { reporter } = req.query as any;
  const item = await LostFound.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (reporter && item.reportedByEmail && reporter !== item.reportedByEmail) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await LostFound.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
app.patch('/api/lostfound/:id/claim', async (req, res) => {
  const updated = await LostFound.findByIdAndUpdate(
    req.params.id,
    { status: 'Claimed' },
    { new: true }
  );
  res.json(updated);
});

app.get('/api/resources', async (req, res) => {
  const { q, subject, year } = req.query as any;
  const query: any = {};
  if (subject) query.subject = subject;
  if (year) query.year = year;
  if (q) query.$text = { $search: q };
  const items = await Resource.find(query).sort({ createdAt: -1 });
  res.json(items);
});
app.post('/api/resources', async (req, res) => {
  const created = await Resource.create(req.body);
  res.status(201).json(created);
});

// Simple auth endpoints (signup/login) for demo purposes
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash: hash });
  res.status(201).json({ email: user.email });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid' });
  res.json({ email: user.email });
});

// upload endpoint: accepts multipart/form-data 'file' and returns { url }
app.post('/api/upload', upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  // return a publicly accessible URL
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Study Groups API
app.get('/api/groups', async (_req, res) => {
  const items = await Group.find().sort({ createdAt: -1 });
  res.json(items);
});
app.post('/api/groups', async (req, res) => {
  const { name, subject, createdByEmail } = req.body;
  const created = await Group.create({ name, subject, createdByEmail, members: [createdByEmail] });
  res.status(201).json(created);
});
app.post('/api/groups/:id/join', async (req, res) => {
  const { email } = req.body;
  const g = await Group.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: email } },
    { new: true }
  );
  res.json(g);
});

app.post('/api/groups/:id/leave', async (req, res) => {
  const { email } = req.body;
  const g = await Group.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: email } },
    { new: true }
  );
  res.json(g);
});

app.delete('/api/groups/:id', async (req, res) => {
  const { requester } = req.query as any;
  const g = await Group.findById(req.params.id);
  if (!g) return res.status(404).json({ error: 'Not found' });
  if (requester && g.createdByEmail && requester !== g.createdByEmail) return res.status(403).json({ error: 'Forbidden' });
  await Group.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.get('/api/events', async (_req, res) => {
  const items = await Event.find().sort({ date: 1 });
  res.json(items);
});
app.post('/api/events', async (req, res) => {
  const created = await Event.create(req.body);
  res.status(201).json(created);
});

async function start() {
  await mongoose.connect(MONGO_URI);
  // print registered routes for debugging
  try {
    // some Express builds keep router on app._router
    // collect route informations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routes: Array<{ path: string; methods: string[] }> = [];
    // @ts-ignore
    const stack = app._router && app._router.stack ? app._router.stack : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stack.forEach((layer: any) => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods || {});
        routes.push({ path: layer.route.path, methods });
      }
    });
    console.log('Registered routes:', JSON.stringify(routes, null, 2));
  } catch (e) {
    console.warn('Could not enumerate routes', e);
  }

  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});


