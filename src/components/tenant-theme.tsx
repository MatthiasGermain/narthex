const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/

function isValidColor(value: string | null | undefined): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value)
}

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

  if (isValidColor(primary)) {
    vars.push(
      `--primary: ${primary}`,
      `--ring: ${primary}`,
      `--sidebar-primary: ${primary}`,
      `--sidebar-ring: ${primary}`,
      `--chart-1: ${primary}`,
    )
  }

  if (isValidColor(secondary)) {
    vars.push(`--secondary: ${secondary}`)
  }

  if (isValidColor(accent)) {
    vars.push(`--accent: ${accent}`)
  }

  if (isValidColor(foreground)) {
    vars.push(
      `--foreground: ${foreground}`,
      `--card-foreground: ${foreground}`,
      `--popover-foreground: ${foreground}`,
    )
  }

  if (isValidColor(background)) {
    vars.push(`--background: ${background}`)
  }

  if (vars.length === 0) return null

  const css = `:root { ${vars.map((v) => `${v};`).join(' ')} }`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
