@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-4">
        <div class="card shadow-lg border-0 text-center overflow-hidden">
            <div class="card-header bg-dark text-white fw-bold py-3">
                <i class="bi bi-person-badge"></i> CARNET DIGITAL NEXUS-Q
            </div>
            <div class="card-body py-4 bg-white">
                <h3 class="mb-1 text-uppercase fw-bold">{{ $socio->nombre }}</h3>
                <p class="text-muted mb-4 small">DNI: {{ $socio->dni }}</p>
                
                <div class="p-3 d-inline-block border rounded shadow-sm bg-light mb-3">
                    {!! $codigoQR !!}
                </div>
                
                <hr>

                <p class="mt-3 mb-0">
                    <span class="text-muted small d-block mb-1 text-uppercase">Estado de Acceso</span>
                    <span class="badge rounded-pill {{ $socio->estado == 'activo' ? 'bg-success' : 'bg-danger' }} px-4 py-2 fs-6">
                        <i class="bi {{ $socio->estado == 'activo' ? 'bi-check-circle' : 'bi-x-circle' }}"></i> 
                        {{ strtoupper($socio->estado) }}
                    </span>
                </p>
            </div>
            <div class="card-footer bg-light border-0 py-3 d-flex justify-content-between">
                <button onclick="window.print()" class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-printer"></i> Imprimir
                </button>
                <a href="{{ route('socios.index') }}" class="btn btn-link btn-sm text-decoration-none text-muted">
                    <i class="bi bi-arrow-left"></i> Volver a lista
                </a>
            </div>
        </div>
        
        <div class="text-center mt-3 small text-muted">
            <i class="bi bi-shield-check"></i> Generado por Nexus-Q V1.0 para Fitness Center Huancayo
        </div>
    </div>
</div>
@endsection