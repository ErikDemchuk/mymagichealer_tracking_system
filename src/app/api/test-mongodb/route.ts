import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection...')
    
    const mongoose = await connectToDatabase()
    
    if (!mongoose) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to MongoDB'
      }, { status: 500 })
    }
    
    // Get connection status
    const connectionState = mongoose.connection.readyState
    const states: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    // Get database name
    const dbName = mongoose.connection.db?.databaseName || 'unknown'
    
    // Get collections count
    const collections = await mongoose.connection.db?.listCollections().toArray() || []
    
    return NextResponse.json({
      success: true,
      mongodb: {
        connected: connectionState === 1,
        state: states[connectionState],
        database: dbName,
        collections: collections.map(c => c.name),
        collectionsCount: collections.length,
        host: mongoose.connection.host
      },
      message: '✅ MongoDB connection successful!'
    })
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ MongoDB connection failed'
    }, { status: 500 })
  }
}


