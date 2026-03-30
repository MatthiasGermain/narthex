'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { importMembers } from '@/app/(frontend)/dashboard/members/import/actions'

interface CsvImportProps {
  churchRoles: { value: string; label: string }[]
}

interface ParsedRow {
  firstName: string
  lastName: string
  email: string
  phone: string
  churchRole: string
  valid: boolean
  warning: string | null
}

interface ImportResult {
  row: number
  firstName: string
  lastName: string
  status: 'created' | 'skipped' | 'error'
  message: string
}

function parseCsv(text: string, churchRoles: Set<string>): ParsedRow[] {
  const cleaned = text.replace(/^\uFEFF/, '')
  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const delimiter = lines[0].includes(';') ? ';' : ','
  const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''))

  const colMap = {
    firstName: header.findIndex((h) => ['prenom', 'prénom', 'firstname', 'first_name'].includes(h)),
    lastName: header.findIndex((h) => ['nom', 'lastname', 'last_name'].includes(h)),
    email: header.findIndex((h) => ['email', 'e-mail', 'mail'].includes(h)),
    phone: header.findIndex((h) => ['telephone', 'téléphone', 'phone', 'tel'].includes(h)),
    churchRole: header.findIndex((h) => ['role', 'rôle', 'churchrole', 'church_role'].includes(h)),
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''))

    const firstName = colMap.firstName >= 0 ? cols[colMap.firstName] || '' : ''
    const lastName = colMap.lastName >= 0 ? cols[colMap.lastName] || '' : ''
    const email = colMap.email >= 0 ? cols[colMap.email] || '' : ''
    const phone = colMap.phone >= 0 ? cols[colMap.phone] || '' : ''
    let churchRole = colMap.churchRole >= 0 ? cols[colMap.churchRole]?.toLowerCase() || 'membre' : 'membre'

    let warning: string | null = null
    if (!churchRoles.has(churchRole)) {
      warning = `Rôle "${churchRole}" inconnu → membre`
      churchRole = 'membre'
    }

    const valid = Boolean(firstName.trim() && lastName.trim())

    return { firstName, lastName, email, phone, churchRole, valid, warning }
  }).filter((row) => row.firstName || row.lastName || row.email)
}

export function CsvImport({ churchRoles }: CsvImportProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'results'>('upload')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const validRoles = new Set(churchRoles.map((r) => r.value))
  const roleLabelMap = Object.fromEntries(churchRoles.map((r) => [r.value, r.label]))

  function handleFileSelect(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCsv(text, validRoles)
      if (parsed.length === 0) {
        alert('Aucune donnée trouvée dans le fichier. Vérifiez le format.')
        return
      }
      setRows(parsed)
      setStep('preview')
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.valid)
    setImporting(true)
    setProgress(0)

    const importResults = await importMembers(
      validRows.map((r) => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        email: r.email.trim() || undefined,
        phone: r.phone.trim() || undefined,
        churchRole: r.churchRole,
      })),
    )

    setResults(importResults)
    setProgress(100)
    setImporting(false)
    setStep('results')
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length
  const warningCount = rows.filter((r) => r.warning).length

  if (step === 'upload') {
    return (
      <div className="max-w-2xl">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Cliquer pour sélectionner un fichier CSV</p>
            <p className="text-sm text-muted-foreground mt-1">
              Colonnes attendues : prénom, nom, email, téléphone, rôle
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />
        <div className="mt-4 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium mb-2">Format attendu :</p>
          <code className="text-xs text-muted-foreground block">
            prénom;nom;email;téléphone;rôle<br />
            Jean;Dupont;jean@email.com;06 12 34 56 78;membre<br />
            Marie;Martin;marie@email.com;;pasteur
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Séparateur : virgule ou point-virgule. Rôles : {churchRoles.map((r) => r.label.toLowerCase()).join(', ')}.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            {validCount} valide{validCount > 1 ? 's' : ''}
          </Badge>
          {invalidCount > 0 && (
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
              <XCircle className="h-3 w-3 mr-1" />
              {invalidCount} invalide{invalidCount > 1 ? 's' : ''}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="text-xs text-sunglow-foreground border-sunglow/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {warningCount} avertissement{warningCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="border rounded-lg overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Prénom</th>
                <th className="px-3 py-2 text-left font-medium">Nom</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Tél.</th>
                <th className="px-3 py-2 text-left font-medium">Rôle</th>
                <th className="px-3 py-2 text-left font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={!row.valid ? 'bg-destructive/5' : row.warning ? 'bg-sunglow/5' : ''}>
                  <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-1.5">{row.firstName || <span className="text-destructive">—</span>}</td>
                  <td className="px-3 py-1.5">{row.lastName || <span className="text-destructive">—</span>}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{row.email || '—'}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{row.phone || '—'}</td>
                  <td className="px-3 py-1.5">{roleLabelMap[row.churchRole] || row.churchRole}</td>
                  <td className="px-3 py-1.5">
                    {!row.valid ? (
                      <span className="text-destructive text-xs">Prénom/nom requis</span>
                    ) : row.warning ? (
                      <span className="text-xs text-muted-foreground">{row.warning}</span>
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={handleImport} disabled={validCount === 0 || importing}>
            <Upload className="h-4 w-4 mr-2" />
            Importer {validCount} membre{validCount > 1 ? 's' : ''}
          </Button>
          <Button variant="outline" onClick={() => { setStep('upload'); setRows([]) }}>
            Annuler
          </Button>
        </div>
      </div>
    )
  }

  // Results
  const created = results.filter((r) => r.status === 'created').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const errors = results.filter((r) => r.status === 'error').length

  return (
    <div className="max-w-4xl">
      {importing && (
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {created > 0 && (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {created} créé{created > 1 ? 's' : ''}
          </Badge>
        )}
        {skipped > 0 && (
          <Badge variant="outline" className="bg-sunglow/10 border-sunglow/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {skipped} ignoré{skipped > 1 ? 's' : ''}
          </Badge>
        )}
        {errors > 0 && (
          <Badge variant="outline" className="text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            {errors} erreur{errors > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="border rounded-lg overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">Membre</th>
              <th className="px-3 py-2 text-left font-medium">Statut</th>
              <th className="px-3 py-2 text-left font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr
                key={result.row}
                className={
                  result.status === 'error' ? 'bg-destructive/5' :
                  result.status === 'skipped' ? 'bg-sunglow/5' : ''
                }
              >
                <td className="px-3 py-1.5 text-muted-foreground">{result.row + 1}</td>
                <td className="px-3 py-1.5">{result.firstName} {result.lastName}</td>
                <td className="px-3 py-1.5">
                  {result.status === 'created' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {result.status === 'skipped' && <AlertTriangle className="h-4 w-4 text-sunglow" />}
                  {result.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground text-xs">{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Button onClick={() => { router.push('/dashboard/members'); router.refresh() }}>
          Retour aux membres
        </Button>
      </div>
    </div>
  )
}
