export function TenantTheme({
  colors,
}: {
  colors: {
    primary?: string | null
    secondary?: string | null
    accent?: string | null
    foreground?: string | null
    background?: string | null
  }
}) {
  const { primary, secondary, accent, foreground, background } = colors
  if (!primary && !secondary && !accent && !foreground && !background) return null

  const vars: string[] = []

  if (primary) {
    vars.push(
      `--primary: ${primary}`,
      `--ring: ${primary}`,
      `--sidebar-primary: ${primary}`,
      `--sidebar-ring: ${primary}`,
      `--chart-1: ${primary}`,
    )
  }

  if (secondary) {
    vars.push(`--secondary: ${secondary}`)
  }

  if (accent) {
    vars.push(`--accent: ${accent}`)
  }

  if (foreground) {
    vars.push(
      `--foreground: ${foreground}`,
      `--card-foreground: ${foreground}`,
      `--popover-foreground: ${foreground}`,
    )
  }

  if (background) {
    vars.push(`--background: ${background}`)
  }

  const css = `:root { ${vars.map((v) => `${v};`).join(' ')} }`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
