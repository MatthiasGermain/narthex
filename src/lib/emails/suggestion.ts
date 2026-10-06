interface SuggestionEmailParams {
  churchName: string
  churchSlug: string
  authorName: string | null
  authorEmail: string
  kindLabel: string
  page: string
  message: string
  adminUrl: string
}

export function generateSuggestionEmail({
  churchName,
  churchSlug,
  authorName,
  authorEmail,
  kindLabel,
  page,
  message,
  adminUrl,
}: SuggestionEmailParams): string {
  const author = authorName ? `${escapeHtml(authorName)} &lt;${escapeHtml(authorEmail)}&gt;` : escapeHtml(authorEmail)

  return `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2 style="color: #1e2952;">Suggestion — ${escapeHtml(kindLabel)}</h2>
      <p><strong>Église :</strong> ${escapeHtml(churchName)} (${escapeHtml(churchSlug)})</p>
      <p><strong>De :</strong> ${author}</p>
      <p><strong>Page :</strong> ${escapeHtml(page)}</p>
      <hr style="border: none; border-top: 1px solid #d8d2cc; margin: 16px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      <hr style="border: none; border-top: 1px solid #d8d2cc; margin: 16px 0;" />
      <p><a href="${escapeHtml(adminUrl)}">Voir dans l'admin</a></p>
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
