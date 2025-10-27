import mongoose from 'mongoose'

const MONGODB_URI = process.env.STORAGE_MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define STORAGE_MONGODB_URI in .env.local')
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
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection')
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log('🔵 Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
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

