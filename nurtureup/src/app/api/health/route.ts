import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if essential tables exist
    const userCount = await prisma.user.count();
    const familyCount = await prisma.family.count();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        tables: 'accessible',
        users: userCount,
        families: familyCount
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: 'disconnected'
      }
    };

    return NextResponse.json(healthData, { status: 503 });
  }
}