@extends('layouts.app')

@section('content')
<div class="control-acceso-shell d-flex align-items-center justify-content-center" style="min-height: 80vh; background: #000;">
    <div class="card p-5 text-center shadow-lg" style="background: #141414; border: 1px solid #333; border-radius: 20px; width: 100%; max-width: 500px;">
        
        <h2 class="text-primary fw-bold mb-4"><i class="bi bi-shield-lock-fill"></i> CONTROL DE ACCESO</h2>

        <form action="{{ route('validar.acceso') }}" method="POST" class="mb-4">
            @csrf
            <div class="input-group mb-3">
                <span class="input-group-text bg-primary text-white border-0"><i class="bi bi-qr-code-scan"></i></span>
                <input type="text" name="dni" class="form-control form-control-lg bg-dark text-white border-0" placeholder="Escanee QR o ingrese DNI" autofocus required style="border-radius: 0 10px 10px 0;">
                <button class="btn btn-danger fw-bold px-4" type="submit">VALIDAR</button>
            </div>
        </form>

        <hr style="border-color: #333;">

        @if(session('concedido'))
            <div class="result-box py-4 animate__animated animate__zoomIn">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 6rem;"></i>
                <h1 class="text-success fw-bold mt-3">ACCESO CONCEDIDO</h1>
                <h3 class="text-white">{{ is_array(session('concedido')) ? session('concedido')['nombre'] : session('concedido')->nombre }}</h3>
                <p class="text-muted">¡Bienvenido al entrenamiento!</p>
            </div>
        @endif

        @if(session('denegado'))
            <div class="result-box py-4 animate__animated animate__shakeX">
                <i class="bi bi-x-circle-fill text-danger" style="font-size: 6rem;"></i>
                <h1 class="text-danger fw-bold mt-3">ACCESO DENEGADO</h1>
                <h3 class="text-white">{{ is_array(session('denegado')) ? session('denegado')['nombre'] : session('denegado')->nombre }}</h3>
                <p class="text-warning">Membresía Vencida o Inactiva</p>
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-dark border-danger text-danger">
                <i class="bi bi-exclamation-triangle-fill"></i> {{ session('error') }}
            </div>
        @endif
    </div>
</div>

<style>
    .control-acceso-shell {
        background-color: #000;
    }
    .form-control:focus {
        background-color: #1a1a1a !important;
        color: white;
        box-shadow: 0 0 0 0.25rem rgba(227, 28, 28, 0.25);
    }
    /* Animación simple para que el círculo aparezca con impacto */
    .animate__animated {
        animation-duration: 0.5s;
    }
    @keyframes zoomIn {
        from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
        to { opacity: 1; }
    }
    .animate__zoomIn { animation-name: zoomIn; }
</style>
@endsection