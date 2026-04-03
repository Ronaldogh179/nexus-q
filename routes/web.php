<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SocioController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicionController;
use App\Http\Controllers\AdminAuthController;

// 1. BIENVENIDA (El selector: Portal o Staff)
Route::get('/', function () { return view('welcome'); });

// 2. RUTAS DE LOGIN STAFF (Para entrar al Búnker)
Route::get('/staff-login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/staff-login', [AdminAuthController::class, 'login'])->name('admin.login.post');
Route::get('/staff-logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

// 3. BURBUJA DE SEGURIDAD (Rutas Protegidas)
// Aquí metemos todo lo que es para el Administrador
Route::middleware([\App\Http\Middleware\AdminAuth::class])->group(function () {
    
    // DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // GESTIÓN DE SOCIOS (CRUD)
    Route::resource('socios', SocioController::class);
    Route::post('/socios/{socio}/renovar', [SocioController::class, 'renovar'])->name('socios.renovar');

    // REPORTES
    Route::get('/reporte-general', [SocioController::class, 'reporteMorosos'])->name('reporte.general');
    Route::get('/socio/{id}/reporte', [SocioController::class, 'generarReporte'])->name('socios.reporte');

});

// 4. PORTAL DEL ATLETA (Público - Los socios entran con su DNI)
Route::get('/portal', function () { return view('socios.login'); })->name('socio.login');
Route::any('/portal/perfil', [SocioController::class, 'perfilSocio'])->name('socio.perfil');

// 5. MEDICIONES E HISTORIAL (Público - Funciona desde el Portal)
Route::post('/mediciones', [MedicionController::class, 'store'])->name('mediciones.store');
Route::post('/socio/{socio}/progreso', [SocioController::class, 'registrarProgreso'])->name('socio.progreso.store');

// 6. CONTROL DE ACCESO (La Puerta - Público)
Route::get('/control-acceso', [SocioController::class, 'accesoIndex'])->name('acceso.index');
Route::post('/validar-acceso', [SocioController::class, 'validarAcceso'])->name('validar.acceso');