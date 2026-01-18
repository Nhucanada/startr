import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter, createContext } from './trpc.ts'

const app = express()
app.use(cors()) // Enable CORS for local development

app.use(
  '/api',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

app.listen(4000, () => {
  console.log('Local tRPC server running on http://localhost:4000/api')
})