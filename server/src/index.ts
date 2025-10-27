
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db } from './firebaseConfig';
import * as admin from 'firebase-admin';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Firestore connection test
app.get('/api/test-firestore', async (_req, res) => {
  try {
    const docRef = db.collection('test').doc('hello-world');
    await docRef.set({
      message: 'Hello, Firestore! The connection is working.',
      timestamp: new Date(),
    });
    res.json({ success: true, message: 'Test document written to Firestore.' });
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    res.status(500).json({ success: false, error: 'Failed to connect to Firestore.' });
  }
});


// CRUD endpoints for notices
app.get('/api/notices', async (req, res) => {
  const { department, year, type, q } = req.query as any;
  let query: admin.firestore.Query = db.collection('notices');

  if (department) {
    query = query.where('department', '==', department);
  }
  if (year) {
    query = query.where('year', '==', year);
  }
  if (type) {
    query = query.where('type', '==', type);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  const items = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
  res.json(items);
});

app.post('/api/notices', async (req, res) => {
  const notice = {
    ...req.body,
    createdAt: new Date(),
  };
  const docRef = await db.collection('notices').add(notice);
  res.status(201).json({ id: docRef.id, ...notice });
});

// CRUD endpoints for lost and found
app.get('/api/lostfound', async (_req, res) => {
  const snapshot = await db.collection('lostfound').orderBy('createdAt', 'desc').get();
  const items = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
  res.json(items);
});

app.post('/api/lostfound', async (req, res) => {
  const item = {
    ...req.body,
    status: 'Active',
    createdAt: new Date(),
  };
  const docRef = await db.collection('lostfound').add(item);
  res.status(201).json({ id: docRef.id, ...item });
});

app.delete('/api/lostfound/:id', async (req, res) => {
    const { id } = req.params;
    const { reporter } = req.query as any;
  
    const docRef = db.collection('lostfound').doc(id);
    const doc = await docRef.get();
  
    if (!doc.exists) {
      return res.status(404).json({ error: 'Not found' });
    }
  
    const data = doc.data();
    if (reporter && data && data.reportedByEmail && reporter !== data.reportedByEmail) {
        return res.status(403).json({ error: 'Forbidden' });
    }
  
    await docRef.delete();
    res.json({ ok: true });
  });

app.patch('/api/lostfound/:id/claim', async (req, res) => {
  const { id } = req.params;
  const docRef = db.collection('lostfound').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return res.status(404).json({ error: 'Not found' });
  }

  await docRef.update({ status: 'Claimed' });
  const updatedDoc = await docRef.get();

  res.json({ id: updatedDoc.id, ...updatedDoc.data() });
});

// CRUD endpoints for resources
app.get('/api/resources', async (req, res) => {
  const { q, subject, year } = req.query as any;
  let query: admin.firestore.Query = db.collection('resources');
  if (subject) {
    query = query.where('subject', '==', subject);
  }
  if (year) {
    query = query.where('year', '==', year);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  const items = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
  res.json(items);
});

app.post('/api/resources', async (req, res) => {
  const resource = {
    ...req.body,
    popularity: 0,
    createdAt: new Date(),
  };
  const docRef = await db.collection('resources').add(resource);
  res.status(201).json({ id: docRef.id, ...resource });
});

// CRUD endpoints for study groups
app.get('/api/groups', async (_req, res) => {
  const snapshot = await db.collection('groups').orderBy('createdAt', 'desc').get();
  const items = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
  res.json(items);
});

app.post('/api/groups', async (req, res) => {
  const { name, subject, createdByEmail } = req.body;
  const group = {
    name,
    subject,
    createdByEmail,
    members: [createdByEmail],
    createdAt: new Date(),
  };
  const docRef = await db.collection('groups').add(group);
  res.status(201).json({ id: docRef.id, ...group });
});

app.post('/api/groups/:id/join', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const docRef = db.collection('groups').doc(id);
  
  await docRef.update({
    members: admin.firestore.FieldValue.arrayUnion(email),
  });

  const updatedDoc = await docRef.get();
  res.json({ id: updatedDoc.id, ...updatedDoc.data() });
});

// CRUD endpoints for events
app.get('/api/events', async (_req, res) => {
  const snapshot = await db.collection('events').orderBy('date', 'asc').get();
  const items = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
  res.json(items);
});

app.post('/api/events', async (req, res) => {
  const event = {
    ...req.body,
    createdAt: new Date(),
  };
  const docRef = await db.collection('events').add(event);
  res.status(201).json({ id: docRef.id, ...event });
});

async function start() {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
