@extends('layouts.app')

@section('content')
<div class="animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
            <h2 class="fw-bold text-white mb-0">
                <i class="bi bi-speedometer2 text-danger me-2"></i>Dashboard Administrativo
            </h2>
            <p class="text-muted small mb-0">Métricas de rendimiento y estado de membresías</p>
        </div>
        <a href="{{ route('reporte.general') }}" class="btn btn-outline-danger rounded-pill fw-bold px-4">
            <i class="bi bi-file-earmark-pdf-fill me-1"></i> REPORTE MOROSOS
        </a>
    </div>

    <div class="row g-4 mb-5">
        <div class="col-md-4">
            <div class="card border-0 shadow-lg p-3 h-100" style="background: linear-gradient(145deg, #1a1a1a, #111111); border-left: 5px solid #0d6efd !important;">
                <div class="d-flex align-items-center">
                    <div class="icon-box bg-primary bg-opacity-10 text-primary p-3 rounded-4 me-3">
                        <i class="bi bi-people-fill fs-3"></i>
                    </div>
                    <div>
                        <h6 class="text-muted small mb-0 text-uppercase fw-bold">Total Socios</h6>
                        <h2 class="fw-bold mb-0 text-white">{{ $totalSocios ?? $stats['total'] ?? 0 }}</h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-0 shadow-lg p-3 h-100" style="background: linear-gradient(145deg, #1a1a1a, #111111); border-left: 5px solid #198754 !important;">
                <div class="d-flex align-items-center">
                    <div class="icon-box bg-success bg-opacity-10 text-success p-3 rounded-4 me-3">
                        <i class="bi bi-check-circle-fill fs-3"></i>
                    </div>
                    <div>
                        <h6 class="text-muted small mb-0 text-uppercase fw-bold">Activos</h6>
                        <h2 class="fw-bold mb-0 text-success">{{ $activos ?? $stats['activos'] ?? 0 }}</h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card border-0 shadow-lg p-3 h-100" style="background: linear-gradient(145deg, #1a1a1a, #111111); border-left: 5px solid #dc3545 !important;">
                <div class="d-flex align-items-center">
                    <div class="icon-box bg-danger bg-opacity-10 text-danger p-3 rounded-4 me-3">
                        <i class="bi bi-x-circle-fill fs-3"></i>
                    </div>
                    <div>
                        <h6 class="text-muted small mb-0 text-uppercase fw-bold">Vencidos</h6>
                        <h2 class="fw-bold mb-0 text-danger">{{ $vencidos ?? $stats['vencidos'] ?? 0 }}</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-md-7">
            <div class="card border-0 shadow-lg p-4 h-100" style="background: #141414;">
                <h5 class="fw-bold mb-4 text-white"><i class="bi bi-graph-up text-danger me-2"></i>Estado de Membresías</h5>
                <div style="height: 300px; position: relative;">
                    <canvas id="gymChart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-md-5">
            <div class="card border-0 shadow-lg p-4 h-100" style="background: #141414;">
                <h5 class="fw-bold mb-4 text-white"><i class="bi bi-clock-history text-danger me-2"></i>Últimos Registros</h5>
                <div class="list-group list-group-flush bg-transparent">
                    @php $lista = $recientes ?? $stats['recientes'] ?? []; @endphp
                    @forelse($lista as $reciente)
                    <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-secondary border-opacity-25 bg-transparent text-white">
                        <div>
                            <div class="fw-bold">{{ $reciente->nombre }}</div>
                            <small class="text-muted">{{ $reciente->created_at->diffForHumans() }}</small>
                        </div>
                        <span class="badge rounded-pill {{ $reciente->estado_real == 'ACTIVO' ? 'bg-success' : 'bg-danger' }} bg-opacity-25 {{ $reciente->estado_real == 'ACTIVO' ? 'text-success' : 'text-danger' }} border {{ $reciente->estado_real == 'ACTIVO' ? 'border-success' : 'border-danger' }}">
                            {{ $reciente->estado_real }}
                        </span>
                    </div>
                    @empty
                    <div class="text-center py-5">
                        <i class="bi bi-inbox text-muted display-4"></i>
                        <p class="text-muted mt-2">No hay ingresos recientes</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const canvas = document.getElementById('gymChart');
        // Usamos null coalescing para evitar errores de JS
        const activos = {{ $activos ?? $stats['activos'] ?? 0 }};
        const vencidos = {{ $vencidos ?? $stats['vencidos'] ?? 0 }};

        if(canvas) {
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Activos', 'Vencidos'],
                    datasets: [{
                        data: [activos, vencidos],
                        backgroundColor: ['#198754', '#dc3545'],
                        hoverOffset: 15,
                        borderWidth: 0
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#999', font: { size: 14, weight: '600' }, padding: 20 }
                        }
                    }
                }
            });
        }
    });
</script>

<style>
    .icon-box { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
    .card { transition: transform 0.3s ease; }
    .card:hover { transform: translateY(-5px); }
</style>
@endsection