import { router } from './trpc-init.ts'
import { userRouter } from './user.ts'
import { habitsRouter } from './habits.ts'

export { createContext } from './trpc-init.ts'

export const appRouter = router({
  user: userRouter,
  habits: habitsRouter,
})

export type AppRouter = typeof appRouter