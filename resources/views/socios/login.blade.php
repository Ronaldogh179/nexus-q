@extends('layouts.app')

@section('content')
<div class="netflix-login-page">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-md-10 col-lg-8 col-xl-6">
                <div class="netflix-login-card">
                    <div class="text-center mb-4">
                        <div class="netflix-bolt">
                            <i class="bi bi-lightning-charge-fill"></i>
                        </div>
                        <h1 class="netflix-title mb-1">PORTAL DEL ATLETA</h1>
                        <p class="netflix-subtitle mb-0">Acceso rapido con tu DNI</p>
                    </div>

                    <form action="{{ route('socio.perfil') }}" method="POST">
                        @csrf
                        <div class="mb-4">
                            <label for="dni" class="form-label netflix-label">DNI</label>
                            <input
                                id="dni"
                                type="text"
                                name="dni"
                                class="form-control netflix-input"
                                placeholder="Ej: 77123456"
                                required
                                maxlength="8"
                                inputmode="numeric"
                                autocomplete="off"
                            >
                        </div>

                        <button type="submit" class="btn netflix-btn w-100">
                            ENTRAR
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    body {
        background: #000000 !important;
    }

    .netflix-login-page {
        min-height: calc(100vh - 120px);
        display: flex;
        align-items: center;
        padding: 36px 0;
        font-family: 'Inter', sans-serif;
    }

    .netflix-login-card {
        background: #141414;
        border-radius: 20px;
        padding: 34px 32px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .netflix-bolt {
        color: #e50914;
        font-size: 2.7rem;
        line-height: 1;
        margin-bottom: 12px;
    }

    .netflix-title {
        color: #ffffff;
        font-weight: 800;
        font-size: 2rem;
        letter-spacing: 0.01em;
    }

    .netflix-subtitle {
        color: #ffffff;
        font-weight: 500;
        font-size: 1rem;
    }

    .netflix-label {
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        text-transform: uppercase;
        margin-bottom: 8px;
    }

    .netflix-input {
        height: 56px;
        background: #333333;
        border: 1px solid #333333;
        border-radius: 12px;
        color: #ffffff;
        font-size: 1.05rem;
        font-weight: 600;
        padding: 0 16px;
    }

    .netflix-input::placeholder {
        color: #ffffff;
        opacity: 0.78;
    }

    .netflix-input:focus {
        background: #333333;
        color: #ffffff;
        border-color: rgba(229, 9, 20, 0.65);
        box-shadow: 0 0 0 0.2rem rgba(229, 9, 20, 0.22);
    }

    .netflix-btn {
        height: 56px;
        border-radius: 12px;
        border: 1px solid #e50914;
        background: #e50914;
        color: #ffffff;
        font-weight: 800;
        font-size: 1rem;
        letter-spacing: 0.02em;
    }

    .netflix-btn:hover,
    .netflix-btn:focus,
    .netflix-btn:active {
        background: #e50914 !important;
        border-color: #e50914 !important;
        color: #ffffff !important;
        filter: brightness(1.05);
    }
</style>
@endsection
