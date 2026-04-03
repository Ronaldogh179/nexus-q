@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-10">
        <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="background: #141414; color: #fff;">
            <div class="card-header bg-danger text-white py-3">
                <h4 class="mb-0 fw-bold"><i class="bi bi-person-plus-fill"></i> Registro de Nuevo Socio</h4>
            </div>
            <div class="card-body p-4">
                <form action="{{ route('socios.store') }}" method="POST">
                    @csrf
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label small text-uppercase fw-bold">Nombre Completo</label>
                            <input type="text" name="nombre" class="form-control bg-dark text-white border-secondary" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small text-uppercase fw-bold">DNI (8 dígitos)</label>
                            <input type="text" name="dni" maxlength="8" class="form-control bg-dark text-white border-secondary" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small text-uppercase fw-bold">Fecha de Inscripción</label>
                            <input type="date" name="fecha_inscripcion" class="form-control bg-dark text-white border-secondary" value="{{ date('Y-m-d') }}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small text-uppercase fw-bold text-warning">Fecha de Vencimiento</label>
                            <input type="date" name="fecha_vencimiento" class="form-control bg-dark text-white border-warning" value="{{ date('Y-m-d', strtotime('+1 month')) }}" required>
                        </div>
                        
                        <div class="col-12"><hr class="border-secondary"></div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label small text-uppercase fw-bold">Peso (kg)</label>
                            <input type="number" step="0.01" name="peso" class="form-control bg-dark text-white border-secondary" placeholder="70.00">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small text-uppercase fw-bold">Estatura (m)</label>
                            <input type="number" step="0.01" name="estatura" class="form-control bg-dark text-white border-secondary" placeholder="1.75">
                        </div>
                    </div>

                    <div class="d-grid gap-2 mt-4">
                        <button type="submit" class="btn btn-danger btn-lg fw-bold rounded-pill">GUARDAR SOCIO</button>
                        <a href="{{ route('socios.index') }}" class="btn btn-link text-muted">Cancelar</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection