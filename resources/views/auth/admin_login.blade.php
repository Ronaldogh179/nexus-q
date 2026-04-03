@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-center align-items-center" style="min-height: 70vh;">
    <div class="card border-0 shadow-lg p-4" style="width: 100%; max-width: 400px; background: #141414; border-radius: 20px;">
        <div class="text-center mb-4">
            <div class="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i class="bi bi-shield-lock-fill text-danger fs-1"></i>
            </div>
            <h3 class="fw-bold text-white">ACCESO STAFF</h3>
            <p class="text-muted small">Solo personal autorizado</p>
        </div>

        @if(session('error'))
            <div class="alert alert-danger py-2 small">{{ session('error') }}</div>
        @endif

        <form action="{{ route('admin.login.post') }}" method="POST">
            @csrf
            <div class="mb-4">
                <label class="form-label text-muted small fw-bold text-uppercase">Contraseña Maestra</label>
                <input type="password" name="password" class="form-control form-control-lg bg-dark text-white border-secondary" placeholder="••••••••" required autofocus>
            </div>
            <button type="submit" class="btn btn-danger btn-lg w-100 fw-bold rounded-pill shadow-sm">
                DESBLOQUEAR PANEL
            </button>
        </form>
    </div>
</div>
@endsection