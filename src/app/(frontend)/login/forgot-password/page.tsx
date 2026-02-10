import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '@/components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
