
$csv = Import-Csv -Path "public/demandas2026.csv" -Encoding UTF8
$totalCount = $csv.Count
$totalValue = 0
foreach ($row in $csv) {
    # Remove Currency symbols, dots (thousands) and fix comma (decimal)
    $valStr = $row."VALOR ESTIMADO PARA 2026" -replace 'R\$', '' -replace '[^\d,]', '' -replace ',', '.'
    if ($valStr -as [double]) {
        $totalValue += [double]$valStr
    }
}
Write-Output "--- SUMMARY ---"
Write-Output "Total Count: $totalCount"
Write-Output "Total Value: $($totalValue.ToString('C', [cultureinfo]::GetCultureInfo('pt-BR')))"

Write-Output "`n--- DETALHAMENTO POR SETOR (Normalize like Relatorios.tsx) ---"

# Simulating normalizeSector
$csvData = $csv | ForEach-Object {
    $s = $_."SETOR REQUISITANTE".Trim().ToUpper()
    if ($s -eq "CAA" -or $s -eq "PROCON") { $s = "CAA/PROCON" }
    elseif ($s -eq "PLAN") { $s = "PLANEJAMENTO" }
    
    $vStr = $_."VALOR ESTIMADO PARA 2026" -replace 'R\$', '' -replace '[^\d,]', '' -replace ',', '.'
    $v = 0
    if ($vStr -as [double]) { $v = [double]$vStr }

    [PSCustomObject]@{
        Sector = $s
        Value = $v
    }
}

$csvData | Group-Object Sector | ForEach-Object {
    $sector = $_.Name
    $count = $_.Count
    $sum = ($_.Group | Measure-Object Value -Sum).Sum
    Write-Output "Sector: $($sector.PadRight(20)) | Qtd: $($count.ToString().PadLeft(3)) | Total: $($sum.ToString('C', [cultureinfo]::GetCultureInfo('pt-BR')))"
} | Sort-Object
