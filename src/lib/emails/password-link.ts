interface PasswordLinkEmailParams {
  url: string
  /** Premier mot de passe d'un compte créé par un admin, et non un renouvellement. */
  isSignup: boolean
  churchName?: string | null
}

export function generatePasswordLinkEmail({ url, isSignup, churchName }: PasswordLinkEmailParams): string {
  const church = churchName ? escapeHtml(churchName) : null

  const title = isSignup ? 'Bienvenue sur Narthex' : 'Réinitialisation de votre mot de passe'
  const intro = isSignup
    ? church
      ? `Un compte a été créé pour vous dans l'espace membre de <strong>${church}</strong> sur Narthex. Choisissez votre mot de passe pour y accéder.`
      : `Un compte Narthex a été créé pour vous. Choisissez votre mot de passe pour y accéder.`
    : church
      ? `Vous avez demandé à changer le mot de passe de votre compte <strong>${church}</strong> sur Narthex.`
      : `Vous avez demandé à changer le mot de passe de votre compte Narthex.`
  const button = isSignup ? 'Créer mon mot de passe' : 'Choisir un nouveau mot de passe'
  const footer = isSignup
    ? `Ce lien expire dans 48 heures.<br/>Si vous n'êtes pas concerné(e), ignorez cet email.`
    : `Ce lien expire dans 3 heures.<br/>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.`

  return `
    <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f0ec; padding: 32px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(30,41,82,0.06);">
        <div style="height: 4px; background-color: #FCCA46;"></div>
        <div style="padding: 40px 32px;">
          <h1 style="font-size: 22px; color: #1e2952; margin: 0 0 16px 0; text-align: center;">
            ${title}
          </h1>
          <p style="font-size: 15px; color: #1e2952; line-height: 1.6; margin: 0 0 8px 0;">
            Bonjour,
          </p>
          <p style="font-size: 15px; color: #1e2952; line-height: 1.6; margin: 0 0 24px 0;">
            ${intro}
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${escapeHtml(url)}" style="display: inline-block; background-color: #FCCA46; color: #1e2952; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; letter-spacing: 0.02em;">
              ${button}
            </a>
          </div>
          <p style="font-size: 13px; color: #1e2952; line-height: 1.5; margin: 0 0 8px 0;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
          </p>
          <p style="font-size: 13px; color: #1e2952; line-height: 1.5; margin: 0; word-break: break-all;">
            ${escapeHtml(url)}
          </p>
          <p style="font-size: 13px; color: #1e2952; opacity: 0.5; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
            ${footer}
          </p>
        </div>
      </div>
    </div>
  `
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
