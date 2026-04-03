<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Nexus-Q</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #222; margin: 30px; }
        .header { text-align: center; border-bottom: 3px solid #e31c1c; padding-bottom: 10px; }
        .title { color: #e31c1c; font-size: 24px; margin-bottom: 5px; }
        .info-box { background: #f9f9f9; padding: 15px; border-radius: 10px; margin-top: 20px; border: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; margin-top: 25px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 13px; }
        th { background-color: #1a1a1a; color: white; text-transform: uppercase; }
        .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
        .imc-bold { font-weight: bold; color: #e31c1c; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">NEXUS-Q | GYM INTELLIGENCE</h1>
        <p style="margin:0; font-weight: bold;">FICHA DE SEGUIMIENTO ANTROPOMÉTRICO</p>
    </div>

    <div class="info-box">
        <p style="margin: 5px 0;"><strong>ATLETA:</strong> {{ strtoupper($socio->nombre) }}</p>
        <p style="margin: 5px 0;"><strong>DNI:</strong> {{ $socio->dni }} | <strong>FECHA REPORTE:</strong> {{ date('d/m/Y') }}</p>
        <p style="margin: 5px 0;"><strong>IMC ACTUAL:</strong> <span class="imc-bold">{{ $imc }}</span></p>
    </div>

    <h3 style="margin-top: 30px; border-left: 5px solid #e31c1c; padding-left: 10px;">HISTORIAL DE MEDICIONES</h3>
    <table>
        <thead>
            <tr>
                <th>FECHA</th>
                <th>PESO (kg)</th>
                <th>TALLA (m)</th>
                <th>IMC</th>
                <th>BÍCEPS (cm)</th>
                <th>ABDOMEN (cm)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($socio->mediciones as $med)
            <tr>
                <td>{{ $med->created_at->format('d/m/Y') }}</td>
                <td>{{ $med->peso }}</td>
                <td>{{ $med->talla }}</td>
                <td class="imc-bold">{{ $med->imc }}</td>
                <td>{{ $med->biceps ?? '-' }}</td>
                <td>{{ $med->abdomen ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Este documento es un reporte generado por el sistema de gestión de gimnasios NEXUS-Q.</p>
        <p>© 2026 Nexus-Q v1.0 - Gestión Inteligente</p>
    </div>
</body>
</html>