$port = 8000
$apiKey = "AQ.Ab8RN6Loq-X8PdxXrdVU00wjWNOPSwBFzfqv0-PRcFfS5Py_Tw"
$modelsToTry = @("gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest")

$systemInstruction = @"
Eres un asistente virtual interactivo especializado en la Guerra de Malvinas (1982), historiográfico y con profunda empatía hacia los veteranos de guerra y sus familiares.
Tus directivas maestras son:
1. RIGOR HISTÓRICO Y TOPONIMIA: Conoces en profundidad todos los hechos del conflicto (19 de marzo al 15 de junio de 1982), fechas, montes (Longdon, Tumbledown, Harriet, Dos Hermanas), buques (Crucero General Belgrano, Sheffield, Coventry, etc.), aviación (A-4 Skyhawk, Super Étendard, Dagger, Mirage, Hércules C-130), y unidades militares reales de todo el país (por ejemplo, el Regimiento de Infantería 12 de Mercedes, Corrientes en Pradera del Ganso y Darwin, el BIM 5 de Río Grande en Tumbledown, el RI 7 de La Plata en Longdon, el RI 25 de Sarmiento en Darwin y San Carlos, etc.).
2. INTERACCIÓN NATURAL Y ESCUCHA ACTIVA: Eres una IA conversacional libre y dinámica. NUNCA respondas con plantillas fijas, cuestionarios repetitivos ni frases acartonadas. Responde directamente y con calidez a lo que el usuario te escribe.
3. EMPATÍA Y SOLEMNIDAD: Si un usuario te comparte el testimonio de su padre, familiar o su propia experiencia como veterano, acógelo con honor, respeto y gratitud por su servicio a la Patria, comentando con precisión y respeto la unidad o hecho al que se refiere.
4. FORMATO: Mantén un lenguaje formal, solemne, patriótico y fluido en español.
"@

Function Call-GeminiApi($userMessage, $history) {
    # Construcción garantizada de JSON sin problemas de serialización de arrays
    $items = [System.Collections.ArrayList]::new()
    if ($history) {
        foreach ($h in $history) {
            $t = ""
            if ($h.parts -and $h.parts.Count -gt 0) {
                $t = $h.parts[0].text
            }
            if ($t) {
                $r = if ($h.role -eq "model") { "model" } else { "user" }
                $textJson = $t | ConvertTo-Json
                [void]$items.Add(@"
    {
      "role": "$r",
      "parts": [ { "text": $textJson } ]
    }
"@)
            }
        }
    }

    $userTextJson = $userMessage | ConvertTo-Json
    [void]$items.Add(@"
    {
      "role": "user",
      "parts": [ { "text": $userTextJson } ]
    }
"@)

    $contentsJson = $items -join ",`n"
    $sysTextJson = $systemInstruction | ConvertTo-Json

    $jsonPayload = @"
{
  "system_instruction": {
    "parts": [
      { "text": $sysTextJson }
    ]
  },
  "contents": [
$contentsJson
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1500
  }
}
"@

    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonPayload)
    $lastError = ""

    foreach ($m in $modelsToTry) {
        try {
            Write-Host "[Gemini] Conectando con modelo: $m ..."
            $url = "https://generativelanguage.googleapis.com/v1beta/models/$($m):generateContent?key=$apiKey"
            $req = [System.Net.HttpWebRequest]::Create($url)
            $req.Method = "POST"
            $req.ContentType = "application/json; charset=utf-8"
            $req.Headers.Add("x-goog-api-key", $apiKey)
            $req.ContentLength = $bodyBytes.Length
            $req.Timeout = 30000

            $stream = $req.GetRequestStream()
            $stream.Write($bodyBytes, 0, $bodyBytes.Length)
            $stream.Close()

            $resp = $req.GetResponse()
            $respStream = $resp.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($respStream, [System.Text.Encoding]::UTF8)
            $respText = $reader.ReadToEnd()
            $reader.Close()
            $resp.Close()

            $resJson = $respText | ConvertFrom-Json
            
            $replyText = ""
            if ($resJson.candidates -and $resJson.candidates.Count -gt 0) {
                $cand = $resJson.candidates[0]
                if ($cand.content -and $cand.content.parts) {
                    $finalParts = [System.Collections.ArrayList]::new()
                    foreach ($p in $cand.content.parts) {
                        if ($p.text -and -not $p.thought) {
                            [void]$finalParts.Add($p.text)
                        }
                    }
                    if ($finalParts.Count -eq 0) {
                        foreach ($p in $cand.content.parts) {
                            if ($p.text) { [void]$finalParts.Add($p.text) }
                        }
                    }
                    $replyText = $finalParts -join "`n`n"
                }
            }

            if ([string]::IsNullOrWhiteSpace($replyText)) {
                $replyText = "Gracias por compartir este testimonio histórico con nosotros."
            }

            Write-Host "[Gemini] Respuesta generada exitosamente con $m."
            return @{
                status = "success"
                respuesta = $replyText
            }
        } catch [System.Net.WebException] {
            $errResp = $_.Exception.Response
            if ($errResp) {
                $errStream = $errResp.GetResponseStream()
                $errReader = New-Object System.IO.StreamReader($errStream, [System.Text.Encoding]::UTF8)
                $errBody = $errReader.ReadToEnd()
                $errReader.Close()
                $lastError = "HTTP $([int]$errResp.StatusCode): $errBody"
                Write-Host "[Gemini] Error en $m : $lastError"
            } else {
                $lastError = $_.Exception.Message
                Write-Host "[Gemini] Error de conexion en $m : $lastError"
            }
        } catch {
            $lastError = $_.Exception.Message
            Write-Host "[Gemini] Error procesando respuesta de $m : $lastError"
        }
    }

    return @{
        status = "error"
        respuesta = "Hubo una demora con el servicio de IA. Detalle: $lastError"
    }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "============================================================"
Write-Host "  SERVIDOR PUENTE MALVINAS 1982 CONECTADO CON GEMINI IA ACTIVO"
Write-Host "  Frontend y API disponibles en: http://localhost:$port/"
Write-Host "  Endpoint sin restricciones CORS: http://localhost:$port/api/chat"
Write-Host "============================================================"

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-goog-api-key")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        if ($request.Url.AbsolutePath -eq "/api/chat" -or $request.Url.AbsolutePath -eq "/api/chat/") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $bodyText = $reader.ReadToEnd()
            $jsonBody = $bodyText | ConvertFrom-Json

            $userMessage = $jsonBody.message
            $history = $jsonBody.history

            $outObj = Call-GeminiApi -userMessage $userMessage -history $history

            $outJson = $outObj | ConvertTo-Json
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($outJson)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
        } else {
            # Servir archivos estáticos del frontend
            $relPath = $request.Url.AbsolutePath.TrimStart('/')
            if ([string]::IsNullOrEmpty($relPath)) { $relPath = "index.html" }
            $filePath = Join-Path $baseDir $relPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    Default { "application/octet-stream" }
                }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mime
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
            $response.Close()
        }
    } catch {
        # Control de excepciones de socket
    }
}
