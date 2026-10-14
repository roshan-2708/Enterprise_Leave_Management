// src/lib/userDb.js
import fs from 'fs';
import path from 'path';
import os from 'os';

// In serverless environments like Vercel, the project root is read-only (/var/task).
// Only os.tmpdir() (/tmp) is writable.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? os.tmpdir() : path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Default initial users
const DEFAULT_USERS = {
  EMP101: {
    id: 'EMP101',
    name: 'Roshan Kumar Patra',
    role: 'EMPLOYEE',
    designation: 'Cloud Developer Intern',
    department: 'Engineering',
    email: 'roshan@company.com',
    password: 'password123',
    createdAt: new Date().toISOString(),
  },
  MGR001: {
    id: 'MGR001',
    name: 'Lead Manager',
    role: 'MANAGER',
    designation: 'Engineering Lead',
    department: 'Management',
    email: 'manager@company.com',
    password: 'password123',
    createdAt: new Date().toISOString(),
  },
};

// Global in-memory store
let memoryUsers = { ...DEFAULT_USERS };

function ensureDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('Filesystem write notice, using in-memory store:', err.message);
  }
}

export function getAllUsers() {
  ensureDb();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      memoryUsers = { ...DEFAULT_USERS, ...parsed };
      return memoryUsers;
    }
  } catch (err) {
    console.warn('Failed to read users file, using memory store:', err.message);
  }
  return memoryUsers;
}

export function findUser(id) {
  if (!id) return null;
  const users = getAllUsers();
  return users[id.trim().toUpperCase()] || null;
}

export function saveUser({ id, name, department, email, role, password }) {
  if (!id || !name) {
    throw new Error('User ID and Name are required');
  }

  const users = getAllUsers();
  const cleanId = id.trim().toUpperCase();

  const newUser = {
    id: cleanId,
    name: name.trim(),
    role: role || 'EMPLOYEE',
    designation: role === 'MANAGER' ? 'Manager' : 'Employee',
    department: department || 'Engineering',
    email: email || `${cleanId.toLowerCase()}@company.com`,
    password: password || 'password123',
    createdAt: new Date().toISOString(),
  };

  users[cleanId] = newUser;
  memoryUsers = users;

  try {
    ensureDb();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('Serverless storage fallback: saved user to in-memory store:', err.message);
  }

  // Return user without sensitive password
  const safeUser = { ...newUser };
  delete safeUser.password;
  return safeUser;
}

export function verifyUser(id, password) {
  const user = findUser(id);
  if (!user) return null;
  if (user.password !== password) return null;

  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}
