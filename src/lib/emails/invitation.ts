interface InvitationEmailParams {
  churchName: string
  token: string
  baseUrl: string
}

export function generateInvitationEmail({ churchName, token, baseUrl }: InvitationEmailParams): string {
  const acceptUrl = `${baseUrl}/invitation/accept?token=${token}`

  return `
    <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f0ec; padding: 32px;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(30,41,82,0.06);">
        <div style="height: 4px; background-color: #FCCA46;"></div>
        <div style="padding: 40px 32px;">
          <h1 style="font-size: 22px; color: #1e2952; margin: 0 0 16px 0; text-align: center;">
            Rejoignez ${escapeHtml(churchName)}
          </h1>
          <p style="font-size: 15px; color: #1e2952; line-height: 1.6; margin: 0 0 8px 0;">
            Bonjour,
          </p>
          <p style="font-size: 15px; color: #1e2952; line-height: 1.6; margin: 0 0 24px 0;">
            Vous avez été invité(e) à rejoindre l'espace membre de <strong>${escapeHtml(churchName)}</strong> sur Narthex.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${acceptUrl}" style="display: inline-block; background-color: #FCCA46; color: #1e2952; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; letter-spacing: 0.02em;">
              Accepter l'invitation
            </a>
          </div>
          <p style="font-size: 13px; color: #1e2952; opacity: 0.5; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
            Cette invitation expire dans 7 jours.<br/>
            Si vous n'êtes pas concerné(e), ignorez cet email.
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
