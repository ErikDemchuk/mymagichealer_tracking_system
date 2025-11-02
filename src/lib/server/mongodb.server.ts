import 'server-only';
import mongoose from 'mongoose'

const MONGODB_URI = process.env.STORAGE_MONGODB_URI || ''

if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  STORAGE_MONGODB_URI not defined - MongoDB features will not work')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define STORAGE_MONGODB_URI environment variable')
  }

  if (cached.conn) {
    // Check if connection is still alive
    if (mongoose.connection.readyState === 1) {
    return cached.conn
    }
    // Connection is dead, reset cache
    cached.conn = null
    cached.promise = null
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    }

    console.log('🔵 Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
