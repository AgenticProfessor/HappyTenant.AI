import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your free account</h1>
        <p className="text-muted-foreground mt-2">
          Start managing your properties with AI-powered tools.
        </p>
      </div>

      <SignUp
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
        signInUrl="/sign-in"
      />
    </div>
  )
}
