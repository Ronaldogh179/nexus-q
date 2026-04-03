<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXUS-Q | Gym Intelligence</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

    <style>
        :root {
            --nx-black: #000000;
            --nx-dark: #141414;
            --nx-gray: #1f1f1f;
            --nx-crimson: #E50914; /* Rojo Netflix */
            --nx-blood: #b20710;
            --nx-text: #ffffff;
            --nx-muted: #999999;
        }

        body {
            background-color: var(--nx-black);
            color: var(--nx-text);
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
        }

        /* Navbar Estilo Glassmorphism */
        .navbar {
            background-color: rgba(0, 0, 0, 0.85) !important;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(229, 9, 20, 0.3);
            padding: 15px 0;
        }

        .navbar-brand {
            font-weight: 800;
            letter-spacing: -1px;
            color: var(--nx-crimson) !important;
            font-size: 1.5rem;
        }

        .nav-link {
            color: var(--nx-text) !important;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            margin: 0 10px;
            transition: 0.3s;
        }

        .nav-link:hover {
            color: var(--nx-crimson) !important;
            transform: translateY(-2px);
        }

        /* Botón Portal Socio Especial */
        .btn-portal {
            background-color: var(--nx-crimson);
            color: white !important;
            border-radius: 50px;
            padding: 8px 20px !important;
            box-shadow: 0 0 15px rgba(229, 9, 20, 0.4);
        }

        /* Contenedor Principal */
        .main-content {
            padding-top: 40px;
            padding-bottom: 60px;
            min-height: 85vh;
        }

        /* Estilo de Tarjetas Nexus */
        .card {
            background-color: var(--nx-dark);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            color: white;
            transition: 0.3s;
        }

        /* Alertas Personalizadas */
        .alert {
            border-radius: 12px;
            border: none;
            background-color: var(--nx-gray);
            color: white;
            border-left: 5px solid var(--nx-crimson);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--nx-crimson); }
    </style>
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-dark sticky-top">
        <div class="container">
            <a class="navbar-brand" href="{{ route('dashboard') }}">
                <i class="bi bi-lightning-charge-fill"></i> NEXUS-Q <span class="fw-light small text-white opacity-50">V1.0</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('dashboard') }}"><i class="bi bi-grid-1x2-fill me-1"></i> Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('socios.index') }}"><i class="bi bi-people-fill me-1"></i> Socios</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('acceso.index') }}"><i class="bi bi-shield-lock-fill me-1"></i> Puerta</a>
                    </li>
                    <li class="nav-item ms-lg-3">
                        <a class="nav-link btn-portal" href="{{ route('socio.login') }}">
                            <i class="bi bi-person-circle me-1"></i> PORTAL SOCIO
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container main-content">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show mb-4 animate__animated animate__fadeInDown" role="alert">
                <i class="bi bi-check-circle-fill me-2 text-success"></i> {{ session('success') }}
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
        @endif

        @yield('content')
    </div>

    <footer class="py-4 text-center border-top border-dark opacity-50">
        <p class="small mb-0">© 2026 NEXUS-Q GYM INTELLIGENCE | Diseñado para el Alto Rendimiento</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>