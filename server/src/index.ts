import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

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
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});


