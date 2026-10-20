import bcrypt from 'bcryptjs'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { connectDB } from './config/db.js'
import Category from './models/Category.js'
import User from './models/User.js'
import authRoutes from './routes/authRoutes.js'
import bookmarkRoutes from './routes/bookmarkRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import characterRoutes from './routes/characterRoutes.js'
import contentRoutes from './routes/contentRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import merchandiseRoutes from './routes/merchandiseRoutes.js'
import submissionRoutes from './routes/submissionRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Fan Hub Plus API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/characters', characterRoutes)
app.use('/api/merchandise', merchandiseRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/users', userRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    return
  }

  const cleanEmail = email.toLowerCase().trim()
  const oldAdmin = await User.findOne({ email: cleanEmail })

  if (oldAdmin) {
    const passwordMatched = await bcrypt.compare(password, oldAdmin.password)

    if (!passwordMatched) {
      oldAdmin.password = await bcrypt.hash(password, 10)
    }

    if (oldAdmin.role !== 'admin') {
      oldAdmin.role = 'admin'
    }

    await oldAdmin.save()
    console.log('Default admin is ready')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await User.create({
    name: 'FanHub Admin',
    email: cleanEmail,
    password: hashedPassword,
    role: 'admin'
  })

  console.log('Default admin created')
}

const createCategories = async () => {
  const categoryNames = [
    'Anime',
    'Gaming',
    'Movies and TV',
    'K-Pop',
    'Comics and Manga',
    'Cosplay'
  ]

  for (const name of categoryNames) {
    const oldCategory = await Category.findOne({ name: name })

    if (!oldCategory) {
      await Category.create({
        name: name,
        status: 'active'
      })
    }
  }
}

const startServer = async () => {
  await connectDB()
  await createAdmin()
  await createCategories()

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

startServer()
