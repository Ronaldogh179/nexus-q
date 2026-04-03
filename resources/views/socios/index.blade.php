@extends('layouts.app')

@section('content')
<div class="socios-panel-dark">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
            <h2 class="fw-bold text-white mb-0"><i class="bi bi-people-fill text-danger"></i> Gestión de Socios</h2>
            <p class="text-muted small">Panel administrativo Nexus-Q</p>
        </div>
        <a href="{{ route('socios.create') }}" class="btn btn-danger rounded-pill px-4 fw-bold">
            <i class="bi bi-person-plus-fill"></i> NUEVO SOCIO
        </a>
    </div>

    <div class="card shadow-sm border-0 rounded-4 overflow-hidden" style="background: #141414;">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="color: #fff;">
                <thead style="background: #000;">
                    <tr>
                        <th class="ps-4">Socio / DNI</th>
                        <th>Estado / Vencimiento</th>
                        <th>IMC Actual</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($socios as $socio)
                    <tr style="border-bottom: 1px solid #222;">
                        <td class="ps-4">
                            <div class="fw-bold">{{ $socio->nombre }}</div>
                            <small class="text-muted">DNI: {{ $socio->dni }}</small>
                        </td>
                        <td>
                            <span class="badge rounded-pill {{ $socio->estado_real == 'ACTIVO' ? 'bg-success' : 'bg-danger' }} mb-1">
                                {{ $socio->estado_real }}
                            </span><br>
                            <small class="text-muted">Vence: {{ $socio->fecha_vencimiento ? $socio->fecha_vencimiento->format('d/m/Y') : 'Sin fecha' }}</small>
                        </td>
                        <td>
                            <strong class="text-danger">{{ $socio->ultimoIMC() ?? '--' }}</strong>
                        </td>
                        <td class="text-center">
                            <div class="btn-group">
                                <a href="{{ route('socios.edit', $socio->id) }}" class="btn btn-outline-warning btn-sm"><i class="bi bi-pencil"></i></a>
                                
                                @if($socio->estado_real == 'VENCIDO')
                                <form action="{{ route('socios.renovar', $socio->id) }}" method="POST" class="d-inline">
                                    @csrf
                                    <button type="submit" class="btn btn-outline-success btn-sm"><i class="bi bi-cash-stack"></i> RENOVAR</button>
                                </form>
                                @endif

                                <form action="{{ route('socios.destroy', $socio->id) }}" method="POST" class="d-inline">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-outline-danger btn-sm" onclick="return confirm('¿Eliminar?')"><i class="bi bi-trash"></i></button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection