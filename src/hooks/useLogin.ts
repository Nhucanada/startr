import { trpc } from '../utils/trpc.js'

export function useLogin() {
  const loginMutation = trpc.user.login.useMutation({
    onSuccess: (data) => {
      if (data.session) {
        window.localStorage.setItem('auth_token', data.session.access_token)
        window.localStorage.setItem('user', JSON.stringify({
          id: data.session.user.id,
          email: data.session.user.email
        }))
      }
    },
  })

  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password })
  }

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  }
}
