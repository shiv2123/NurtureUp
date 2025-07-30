import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Jest timeout for async operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up global test environment...');
});

afterAll(async () => {
  console.log('🧹 Cleaning up global test environment...');
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Mock console.error and console.warn to reduce test output noise
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});