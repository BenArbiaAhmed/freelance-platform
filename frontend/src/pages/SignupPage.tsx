import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, Briefcase, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['client', 'freelance'], { error: 'Select a role' }),
})

type FormData = z.infer<typeof schema>

const dotGridUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%236366f1' fill-opacity='0.18'/%3E%3C/svg%3E")`

const roles = [
  {
    value: 'client' as const,
    icon: Briefcase,
    title: "I'm a Client",
    description: 'Post missions and hire talent',
  },
  {
    value: 'freelance' as const,
    icon: Code2,
    title: "I'm a Freelancer",
    description: 'Find missions and get paid',
  },
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const registerUser = useAuthStore((s) => s.register)
  const serverError = useAuthStore((s) => s.error)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const selectedRole = watch('role')

  async function onSubmit(data: FormData) {
    try {
      await registerUser({
        nom: data.name,
        email: data.email,
        motDePasse: data.password,
        role: data.role,
      })
      navigate('/onboarding')
    } catch {
      // error surfaced via the auth store
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden bg-white">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: dotGridUrl }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl text-foreground mb-8">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5" />
          </span>
          Embark
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-white/80 backdrop-blur-md shadow-xl shadow-black/5 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join 12,000+ professionals on Embark</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

            {/* Role selector */}
            <div>
              <Label>I want to…</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {roles.map(({ value, icon: Icon, title, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value, { shouldValidate: true })}
                    className={cn(
                      'flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all',
                      selectedRole === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-white hover:border-primary/40'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', selectedRole === value ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{description}</span>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* Full name */}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                autoComplete="name"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive text-center -mt-1">{serverError}</p>
            )}

            <Button type="submit" size="lg" className="w-full mt-1 shadow-md shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
