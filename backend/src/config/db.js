import mongoose from 'mongoose'

// Connects to MongoDB Atlas. dbName pins the database so we don't depend on
// the connection string containing one (Atlas defaults to "test" otherwise).
export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set. Copy your root .env into backend/.env')
    process.exit(1)
  }
  await mongoose.connect(uri, { dbName: 'resumeparser' })
  console.log('MongoDB connected:', mongoose.connection.name)
}
