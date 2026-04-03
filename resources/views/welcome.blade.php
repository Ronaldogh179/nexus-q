@extends('layouts.app')

@section('content')
<div class="container py-5 text-center landing-noir">
    <div class="mb-5 mt-4">
        <h1 class="display-3 fw-bold text-bone">NEXUS<span class="text-crimson">-Q</span></h1>
        <p class="lead text-soft">Gestion Inteligente de Rendimiento y Membresias</p>
    </div>

    <div class="row justify-content-center g-4 mt-2">
        <div class="col-md-5">
            <div class="card landing-card shadow-lg border-0 h-100 p-4" style="transition: transform 0.3s;">
                <div class="card-body">
                    <div class="icon-crimson-wrap rounded-circle d-inline-flex p-4 mb-4">
                        <i class="bi bi-person-vcard-fill fs-1"></i>
                    </div>
                    <h2 class="fw-bold text-bone">Portal Socio</h2>
                    <p class="text-soft mb-4">Accede con tu DNI para ver tu carnet digital, progreso fisico y metricas de salud (IMC).</p>
                    <a href="{{ route('socio.login') }}" class="btn btn-primary btn-lg w-100 rounded-pill fw-bold">
                        INGRESAR AL PORTAL <i class="bi bi-arrow-right ms-2"></i>
                    </a>
                </div>
            </div>
        </div>

        <div class="col-md-5">
            <div class="card landing-card shadow-lg border-0 h-100 p-4">
                <div class="card-body">
                    <div class="icon-crimson-wrap rounded-circle d-inline-flex p-4 mb-4">
                        <i class="bi bi-shield-lock-fill fs-1"></i>
                    </div>
                    <h2 class="fw-bold text-bone">Acceso Staff</h2>
                    <p class="text-soft mb-4">Modulo de gestion interna: control de pagos, reportes de morosos y registro de nuevos atletas.</p>
                    <a href="{{ route('dashboard') }}" class="btn btn-dark btn-lg w-100 rounded-pill fw-bold">
                        PANEL DE CONTROL <i class="bi bi-gear-fill ms-2"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .landing-noir {
        color: #f1f5f9;
    }
    .text-bone { color: #f1f5f9; }
    .text-soft { color: #cbd5e1; }
    .text-crimson { color: #ef4444; }
    .landing-card {
        background: #1a1a1a;
        border-radius: 22px;
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }
    .landing-card:hover { transform: translateY(-10px); }
    .icon-crimson-wrap {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .btn-dark {
        background: #111111;
        border-color: #2a2a2a;
        color: #f1f5f9;
    }
    .btn-dark:hover,
    .btn-dark:focus,
    .btn-dark:active {
        background: #ef4444 !important;
        border-color: #ef4444 !important;
        color: #f1f5f9 !important;
    }
</style>
@endsection