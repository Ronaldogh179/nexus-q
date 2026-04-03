@extends('layouts.app')

@section('content')
<div class="mobile-dark-shell py-4">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-10 col-lg-8">
                <div class="hero-card p-4 mb-4 text-center position-relative overflow-hidden">
                    <div class="hero-glow"></div>
                    <div class="position-absolute top-0 end-0 p-3 opacity-25" style="font-size: 5rem;">🏆</div>
                    <h5 class="text-uppercase small fw-semibold mb-2 tracking-wide text-info-soft">Perfil del Socio</h5>
                    <h2 class="fw-bold mb-3 text-white">{{ $socio->nombre }}</h2>
                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                        <span class="badge rounded-pill {{ $socio->estado == 'activo' ? 'badge-status-active' : 'badge-status-inactive' }} px-3 py-2 fs-6">
                            <i class="bi bi-check-circle-fill"></i> {{ strtoupper($socio->estado) }}
                        </span>
                        @php
                            $ultimoImc = $socio->ultimoIMC();
                            $badgeClass = 'badge-imc-normal';
                            $badgeLabel = 'IMC';
                            if ($ultimoImc !== null) {
                                if ($ultimoImc > 30) {
                                    $badgeClass = 'badge-imc-rojo';
                                    $badgeLabel = 'IMC ALTO';
                                } elseif ($ultimoImc > 25) {
                                    $badgeClass = 'badge-imc-naranja';
                                    $badgeLabel = 'IMC ELEVADO';
                                } else {
                                    $badgeClass = 'badge-imc-verde';
                                    $badgeLabel = 'IMC IDEAL';
                                }
                            }
                        @endphp
                        @if($ultimoImc !== null)
                            <div class="imc-pill d-inline-flex align-items-center gap-2 {{ $badgeClass }}">
                                <span class="imc-label">{{ $badgeLabel }}</span>
                                <span class="imc-value">{{ number_format($ultimoImc, 1) }}</span>
                            </div>
                        @endif
                    </div>
                </div>

                <div class="main-card mb-5">
                    <div class="card-body p-0">
                        <nav class="p-3 pb-2">
                            <div class="nav nav-tabs nav-justified border-0 custom-tabs" id="nav-tab">
                                <button class="nav-link active py-3 fw-bold border-0 rounded-pill" data-bs-toggle="tab" data-bs-target="#tab-qr">
                                    <i class="bi bi-qr-code"></i><br><small>ACCESO</small>
                                </button>
                                <button class="nav-link py-3 fw-bold border-0 rounded-pill" data-bs-toggle="tab" data-bs-target="#tab-avances">
                                    <i class="bi bi-graph-up-arrow"></i><br><small>AVANCES</small>
                                </button>
                                <button class="nav-link py-3 fw-bold border-0 rounded-pill" data-bs-toggle="tab" data-bs-target="#tab-ia">
                                    <i class="bi bi-robot"></i><br><small>COACH IA</small>
                                </button>
                            </div>
                        </nav>

                        <div class="tab-content px-3 pb-3 pt-2 min-vh-50">
                            <div class="tab-pane fade show active text-center py-3" id="tab-qr">
                                <p class="small text-muted-blue mb-4 text-uppercase">Muestra este codigo en recepcion</p>
                                <div class="qr-frame p-4 d-inline-block rounded-5">
                                    {!! $codigoQR !!}
                                </div>
                                <h4 class="fw-bold text-white mt-4">ID: {{ $socio->dni }}</h4>
                            </div>

                            <div class="tab-pane fade" id="tab-avances">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="fw-bold text-info-soft mb-0">Avances y Medidas</h6>
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-measurements" data-bs-toggle="modal" data-bs-target="#modalMediciones">
                                            Registrar Medidas
                                        </button>
                                        <a href="{{ route('socios.reporte', $socio->id) }}" class="btn btn-outline-light rounded-pill ms-2 fw-bold shadow-sm" style="font-size: 0.85rem; padding: 0.35rem 1.1rem;">
                                            <i class="bi bi-file-earmark-pdf-fill text-danger"></i> PDF
                                        </a>
                                    </div>
                                </div>

                                <div class="featured-chart-card p-4 mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="fw-bold text-info-soft mb-0">EVOLUCION DEL PESO</h6>
                                        <span class="tiny-chip">Progress</span>
                                    </div>
                                    <div style="height: 320px;"><canvas id="chartProgreso"></canvas></div>
                                </div>

                                <div class="info-card p-4 rounded-5">
                                    <h5 class="fw-bold mb-3 text-white"><i class="bi bi-plus-circle text-primary"></i> Registrar Progreso Rapido</h5>
                                    <form action="{{ route('socio.progreso.store', $socio->id) }}" method="POST">
                                        @csrf
                                        <div class="mb-3">
                                            <label class="form-label small fw-bold text-muted-blue">PESO ACTUAL (KG)</label>
                                            <input type="number" step="0.1" name="peso" class="form-control rounded-pill dark-input" required>
                                        </div>
                                        <div class="row g-2 mb-4">
                                            <div class="col-4">
                                                <label class="small fw-bold text-muted-blue">BICEP</label>
                                                <input type="number" step="0.1" name="bicep" class="form-control rounded-pill dark-input">
                                            </div>
                                            <div class="col-4">
                                                <label class="small fw-bold text-muted-blue">PIERNA</label>
                                                <input type="number" step="0.1" name="pierna" class="form-control rounded-pill dark-input">
                                            </div>
                                            <div class="col-4">
                                                <label class="small fw-bold text-muted-blue">ABDOMEN</label>
                                                <input type="number" step="0.1" name="abdomen" class="form-control rounded-pill dark-input">
                                            </div>
                                        </div>
                                        <button type="submit" class="btn glass-btn w-100 rounded-pill fw-bold">GUARDAR PROGRESO</button>
                                    </form>
                                </div>
                            </div>

                            <div class="tab-pane fade text-start" id="tab-ia">
                                <div id="chat-window" class="chat-panel p-3 mb-3 rounded-5 overflow-auto" style="height: 300px;">
                                    <div class="chat-msg coach p-3 mb-2 rounded-4 glass-chat">
                                        <p class="small mb-0 text-white">
                                            <b>🤖 Coach IA:</b> !Hola guerrero! Tu IMC es <b>{{ $imc }}</b>.
                                            @if($socio->progresos->count() > 0)
                                                He notado que tu ultima medida de abdomen fue de {{ $socio->progresos->last()->abdomen }}cm. Quieres una rutina para definir?
                                            @else
                                                Registra tus medidas en la pestana de <b>AVANCES</b> para darte un plan personalizado.
                                            @endif
                                        </p>
                                    </div>
                                </div>
                                <div class="input-group">
                                    <input type="text" id="user-input" class="form-control rounded-pill me-2 px-3 dark-input" placeholder="Preguntale a tu Coach...">
                                    <button class="btn glass-btn-icon rounded-circle" onclick="chatIA()"><i class="bi bi-send-fill"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-grid mb-5">
                    <a href="{{ route('socio.login') }}" class="btn glass-btn rounded-pill fw-bold">SALIR DEL PORTAL</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Lógica de la Gráfica
    const ctx = document.getElementById('chartProgreso').getContext('2d');
    const labels = @json($socio->progresos->pluck('created_at')->map(fn($d) => $d->format('d/m')));
    const dataPeso = @json($socio->progresos->pluck('peso'));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso (kg)',
                data: dataPeso,
                borderColor: '#4ea8ff',
                backgroundColor: 'rgba(78, 168, 255, 0.22)',
                fill: true,
                tension: 0.42,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBorderWidth: 2,
                pointBackgroundColor: '#b8dcff',
                pointBorderColor: '#4ea8ff'
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#9cb8d6' },
                    grid: { color: 'rgba(119, 154, 196, 0.15)' }
                },
                y: {
                    ticks: { color: '#9cb8d6' },
                    grid: { color: 'rgba(119, 154, 196, 0.15)' }
                }
            }
        }
    });

    // Lógica del Chat IA
    function chatIA() {
        const input = document.getElementById('user-input');
        const window = document.getElementById('chat-window');
        if(!input.value) return;

        window.innerHTML += `<div class='text-end mb-2'><div class='d-inline-block chat-user-msg p-2 rounded-4 small'>${input.value}</div></div>`;
        const prompt = input.value.toLowerCase();
        input.value = '';

        setTimeout(() => {
            let resp = "Con tu IMC de {{ $imc }}, te recomiendo 20 min de cardio y enfoque en pesas.";
            if(prompt.includes("abdomen") || prompt.includes("panza")) resp = "Para bajar abdomen, el 80% es dieta y déficit calórico. ¡No te rindas!";
            if(prompt.includes("bicep")) resp = "Para brazos más grandes, aumenta el consumo de proteína y haz 3 series de Curl de Bíceps.";
            
            window.innerHTML += `<div class='p-2 mb-2 rounded-4 glass-chat small text-white'><b>🤖 Coach IA:</b> ${resp}</div>`;
            window.scrollTop = window.scrollHeight;
        }, 800);
    }
</script>

<div class="modal fade" id="modalMediciones" tabindex="-1" aria-labelledby="modalMedicionesLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content modal-measurements">
            <div class="modal-header border-0">
                <h5 class="modal-title text-white fw-bold" id="modalMedicionesLabel">
                    Registrar Medidas
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form action="{{ route('mediciones.store') }}" method="POST">
                    @csrf
                    <input type="hidden" name="socio_id" value="{{ $socio->id }}">

                    <div class="mb-3">
                        <label class="form-label text-white small fw-bold text-uppercase">Peso (kg)</label>
                        <input type="number" step="0.01" name="peso" class="form-control input-measure" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-white small fw-bold text-uppercase">Talla (m)</label>
                        <input type="number" step="0.01" name="talla" class="form-control input-measure" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-white small fw-bold text-uppercase">Bíceps (cm)</label>
                        <input type="number" step="0.1" name="biceps" class="form-control input-measure">
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-white small fw-bold text-uppercase">Abdomen (cm)</label>
                        <input type="number" step="0.1" name="abdomen" class="form-control input-measure">
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-white small fw-bold text-uppercase">Muslo (cm)</label>
                        <input type="number" step="0.1" name="muslo" class="form-control input-measure">
                    </div>

                    <div class="d-grid">
                        <button type="submit" class="btn btn-save-measure fw-bold rounded-pill">
                            Guardar Medidas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
    .mobile-dark-shell {
        min-height: 100vh;
        background:
            radial-gradient(80% 50% at 10% 0%, rgba(30, 80, 160, 0.45), transparent 70%),
            radial-gradient(90% 60% at 100% 0%, rgba(18, 62, 124, 0.4), transparent 68%),
            linear-gradient(165deg, #060b18 0%, #0a1224 45%, #0b1730 100%);
    }
    .hero-card,
    .main-card,
    .featured-chart-card,
    .info-card,
    .chat-panel {
        border-radius: 30px;
        border: 1px solid rgba(154, 201, 255, 0.18);
        background: linear-gradient(160deg, rgba(18, 31, 58, 0.85), rgba(11, 21, 43, 0.9));
        box-shadow: 0 20px 55px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(166, 209, 255, 0.08);
    }
    .hero-card { position: relative; }
    .hero-glow {
        position: absolute;
        width: 180px;
        height: 180px;
        top: -60px;
        left: -50px;
        background: radial-gradient(circle, rgba(69, 151, 255, 0.55), transparent 65%);
        pointer-events: none;
    }
    .main-card { padding: 2px; }
    .featured-chart-card {
        background: linear-gradient(165deg, rgba(19, 41, 77, 0.95), rgba(11, 24, 48, 0.98));
        border: 1px solid rgba(120, 180, 255, 0.28);
    }
    .qr-frame {
        background: #ffffff;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
    }
    .badge-status-active { background: rgba(25, 184, 113, 0.2); color: #86ffc9; }
    .badge-status-inactive { background: rgba(255, 80, 80, 0.2); color: #ffb7b7; }
    .text-info-soft { color: #8ec6ff; }
    .text-muted-blue { color: #8da8cb; }
    .tracking-wide { letter-spacing: 0.08em; }
    .tiny-chip {
        font-size: 0.72rem;
        padding: 0.35rem 0.65rem;
        border-radius: 999px;
        color: #9fd0ff;
        background: rgba(78, 168, 255, 0.12);
        border: 1px solid rgba(122, 190, 255, 0.32);
    }
    .custom-tabs .nav-link {
        color: #8da8cb;
        background: rgba(255, 255, 255, 0.02);
        transition: 0.22s ease;
    }
    .custom-tabs .nav-link.active {
        color: #eaf4ff;
        background: rgba(75, 148, 242, 0.24);
        box-shadow: inset 0 0 0 1px rgba(129, 190, 255, 0.44), 0 8px 26px rgba(15, 30, 59, 0.6);
    }
    .dark-input {
        color: #eaf4ff;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(138, 183, 234, 0.28);
    }
    .dark-input::placeholder { color: #86a3c5; }
    .dark-input:focus {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(121, 187, 255, 0.7);
        box-shadow: 0 0 0 0.2rem rgba(78, 168, 255, 0.2);
    }
    .glass-btn,
    .glass-btn-icon {
        color: #ecf6ff;
        border: 1px solid rgba(174, 216, 255, 0.42);
        background: linear-gradient(140deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.07));
        backdrop-filter: blur(9px);
        -webkit-backdrop-filter: blur(9px);
        box-shadow: 0 12px 24px rgba(4, 10, 24, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .glass-btn:hover,
    .glass-btn-icon:hover {
        color: #ffffff;
        transform: translateY(-1px);
        background: linear-gradient(140deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.1));
        box-shadow: 0 16px 26px rgba(5, 12, 27, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.35);
    }
    .glass-btn-icon {
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .chat-panel { background: linear-gradient(165deg, rgba(17, 35, 66, 0.8), rgba(10, 23, 46, 0.86)); }
    .glass-chat {
        border: 1px solid rgba(129, 190, 255, 0.26);
        background: linear-gradient(140deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
    }
    .chat-user-msg {
        color: #eaf6ff;
        border: 1px solid rgba(132, 198, 255, 0.38);
        background: linear-gradient(140deg, rgba(66, 144, 249, 0.6), rgba(30, 83, 165, 0.65));
        box-shadow: 0 8px 18px rgba(13, 31, 66, 0.46);
    }
    .imc-pill {
        padding: 0.3rem 0.9rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .imc-label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.9;
    }
    .imc-value {
        font-size: 1rem;
        font-weight: 800;
    }
    .badge-imc-verde {
        background: radial-gradient(circle at 0 0, rgba(16, 185, 129, 0.7), rgba(6, 95, 70, 0.9));
        color: #bbf7d0;
    }
    .badge-imc-naranja {
        background: radial-gradient(circle at 0 0, rgba(251, 191, 36, 0.8), rgba(154, 52, 18, 0.95));
        color: #ffedd5;
    }
    .badge-imc-rojo {
        background: radial-gradient(circle at 0 0, rgba(248, 113, 113, 0.85), rgba(127, 29, 29, 0.98));
        color: #fee2e2;
    }
    .btn-measurements {
        background: #e50914;
        color: #ffffff;
        border-radius: 999px;
        border: 1px solid #e50914;
        padding: 0.35rem 1.1rem;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .btn-measurements:hover {
        background: #f01420;
        border-color: #f01420;
        color: #ffffff;
    }
    .modal-measurements {
        background: #121212;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .input-measure {
        background: #000000;
        color: #ffffff;
        border: 1px solid #333333;
    }
    .input-measure::placeholder {
        color: #9ca3af;
    }
    .input-measure:focus {
        background: #000000;
        color: #ffffff;
        border-color: rgba(227, 28, 28, 0.8);
        box-shadow: 0 0 0 0.15rem rgba(227, 28, 28, 0.28);
    }
    .btn-save-measure {
        background: #e50914;
        border-color: #e50914;
        color: #ffffff;
        padding: 0.7rem 1rem;
    }
    .btn-save-measure:hover,
    .btn-save-measure:focus {
        background: #f01420;
        border-color: #f01420;
        color: #ffffff;
    }
</style>
@endsection