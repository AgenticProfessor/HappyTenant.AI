import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to manage your properties
        </p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border-0 p-0 w-full',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'w-full justify-center gap-2',
            formButtonPrimary: 'bg-primary hover:bg-primary/90 w-full',
            footerAction: 'hidden',
          }
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
