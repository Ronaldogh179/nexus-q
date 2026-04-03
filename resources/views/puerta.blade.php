<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Control de Acceso</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        :root {
            --bg: #000000;
            --panel: #111111;
            --input: #0d0d0d;
            --text: #ffffff;
            --muted: #9ca3af;
            --ok: #10b981;
            --danger: #ef4444;
        }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            background: radial-gradient(circle at top, #101010 0%, #000000 55%);
            color: var(--text);
            font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
        }

        .access-wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .access-panel {
            width: min(900px, 100%);
            text-align: center;
        }

        .access-title {
            font-size: clamp(1.2rem, 2.4vw, 1.8rem);
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 20px;
            color: #f3f4f6;
        }

        .dni-input {
            width: 100%;
            height: 96px;
            border-radius: 22px;
            border: 1px solid #262626;
            background: var(--input);
            color: var(--text);
            text-align: center;
            font-size: clamp(1.6rem, 4vw, 2.6rem);
            font-weight: 700;
            letter-spacing: 0.08em;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .dni-input::placeholder { color: #d1d5db; opacity: 0.75; }
        .dni-input:focus {
            border-color: #3b3b3b;
            box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.08);
        }

        .helper {
            margin-top: 14px;
            color: var(--muted);
            font-size: 0.9rem;
            letter-spacing: 0.02em;
        }

        .result {
            margin: 30px auto 0;
            min-height: 280px;
            display: grid;
            place-items: center;
            visibility: hidden;
            opacity: 0;
            transform: translateY(6px) scale(0.98);
            transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        }

        .result.show {
            visibility: visible;
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .status-circle {
            width: 190px;
            height: 190px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5rem;
            color: #ffffff;
            margin: 0 auto 18px;
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
        }

        .status-circle.ok {
            background: radial-gradient(circle at 30% 30%, #34d399 0%, var(--ok) 55%, #047857 100%);
        }

        .status-circle.error {
            background: radial-gradient(circle at 30% 30%, #f87171 0%, var(--danger) 55%, #991b1b 100%);
        }

        .result-title {
            font-size: clamp(1.2rem, 2.6vw, 2rem);
            font-weight: 800;
            letter-spacing: 0.04em;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .result-subtitle {
            font-size: clamp(1rem, 2vw, 1.35rem);
            color: #f3f4f6;
            margin: 0;
        }
    </style>
</head>
<body>
    <main class="access-wrap">
        <section class="access-panel">
            <h1 class="access-title">Control de Acceso</h1>

            <input id="dniInput" type="text" class="dni-input" placeholder="INGRESE DNI" maxlength="12" autocomplete="off">
            <p class="helper">Presione Enter para validar el acceso</p>

            <div id="result" class="result" aria-live="polite"></div>
        </section>
    </main>

    <script>
        const dniInput = document.getElementById('dniInput');
        const result = document.getElementById('result');
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        let clearTimer = null;

        function renderResult(type, title, subtitle, iconClass) {
            result.innerHTML = `
                <div>
                    <div class="status-circle ${type}">
                        <i class="bi ${iconClass}"></i>
                    </div>
                    <h2 class="result-title">${title}</h2>
                    <p class="result-subtitle">${subtitle}</p>
                </div>
            `;
            result.classList.add('show');

            if (clearTimer) clearTimeout(clearTimer);
            clearTimer = setTimeout(() => {
                result.classList.remove('show');
                dniInput.value = '';
                dniInput.focus();
            }, 3000);
        }

        async function checkAccess() {
            const dni = dniInput.value.trim();
            if (!dni) return;

            try {
                const response = await fetch('/puerta/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ dni })
                });

                const data = await response.json();

                if (!response.ok) {
                    renderResult('error', 'NO REGISTRADO', data.error || 'SOCIO NO ENCONTRADO', 'bi-x-lg');
                    return;
                }

                if (data.estado === 'ACTIVO') {
                    renderResult('ok', 'ACCESO PERMITIDO', data.nombre, 'bi-check-lg');
                } else {
                    renderResult('error', 'ACCESO DENEGADO', 'PAGO PENDIENTE', 'bi-x-lg');
                }
            } catch (error) {
                renderResult('error', 'ERROR DE RED', 'INTENTE NUEVAMENTE', 'bi-x-lg');
            }
        }

        dniInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                checkAccess();
            }
        });

        dniInput.focus();
    </script>
</body>
</html>
