// src/lib/userDb.js
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
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

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf8');
  }
}

export function getAllUsers() {
  ensureDb();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read users DB, using defaults:', err);
    return { ...DEFAULT_USERS };
  }
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

  ensureDb();
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
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

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
