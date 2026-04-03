@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-7">
        <div class="card shadow-lg border-0 rounded-4">
            <div class="card-header bg-warning text-dark py-3">
                <h4 class="mb-0 fw-bold"><i class="bi bi-pencil-square"></i> Editar Socio: {{ $socio->nombre }}</h4>
            </div>
            <div class="card-body p-4 p-lg-5">
                <form action="{{ route('socios.update', $socio->id) }}" method="POST">
                    @csrf 
                    @method('PUT')
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label fw-bold text-dark">Nombre Completo</label>
                            <input type="text" name="nombre" class="form-control form-control-lg border-2 shadow-sm" value="{{ $socio->nombre }}" required>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold text-dark">DNI</label>
                            <input type="text" name="dni" class="form-control form-control-lg border-2 shadow-sm" value="{{ $socio->dni }}" required>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold text-dark">Estado de Membresía</label>
                            <select name="estado" class="form-select form-select-lg border-2 shadow-sm">
                                <option value="activo" {{ $socio->estado == 'activo' ? 'selected' : '' }}>Activo</option>
                                <option value="vencido" {{ $socio->estado == 'vencido' ? 'selected' : '' }}>Vencido</option>
                            </select>
                        </div>

                        <hr class="my-4 opacity-10">
                        <h6 class="fw-bold text-success mb-3"><i class="bi bi-heart-pulse"></i> Actualizar Métricas (IMC)</h6>

                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold text-muted small text-uppercase">Peso Actual (kg)</label>
                            <div class="input-group shadow-sm">
                                <span class="input-group-text bg-white border-2 border-end-0"><i class="bi bi-speedometer2"></i></span>
                                <input type="number" step="0.01" name="peso" class="form-control form-control-lg border-2 border-start-0" value="{{ $socio->peso }}" placeholder="0.00">
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold text-muted small text-uppercase">Estatura Actual (m)</label>
                            <div class="input-group shadow-sm">
                                <span class="input-group-text bg-white border-2 border-end-0"><i class="bi bi-ruler"></i></span>
                                <input type="number" step="0.01" name="estatura" class="form-control form-control-lg border-2 border-start-0" value="{{ $socio->estatura }}" placeholder="0.00">
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-2 mt-4 pt-2">
                        <button type="submit" class="btn btn-primary btn-lg fw-bold shadow rounded-pill py-3">
                            <i class="bi bi-arrow-repeat"></i> ACTUALIZAR FICHA DE SOCIO
                        </button>
                        <a href="{{ route('socios.index') }}" class="btn btn-link text-muted text-decoration-none">Cancelar y salir</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection