<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Socio;

class DashboardController extends Controller
{
    public function index()
    {
        $totalSocios = Socio::count();

        // Usamos el accessor estado_real para mantener una sola lógica de estado.
        $sociosEstado = Socio::select('id', 'fecha_vencimiento')->get();
        $activos = $sociosEstado->where('estado_real', 'ACTIVO')->count();
        $vencidos = $sociosEstado->where('estado_real', 'VENCIDO')->count();

        $recientes = Socio::latest()->take(5)->get();

        return view('dashboard', compact('totalSocios', 'activos', 'vencidos', 'recientes'));
    }
}
