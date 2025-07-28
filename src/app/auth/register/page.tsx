import { AuthForm } from '@/components/Auth/Form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm type="register" />
    </div>
  )
}
