<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use Illuminate\Http\Request;

class PuertaController extends Controller
{
    public function index()
    {
        return view('puerta');
    }

    public function check(Request $request)
    {
        $data = $request->validate([
            'dni' => ['required', 'string'],
        ]);

        $socio = Socio::where('dni', $data['dni'])->first();

        if (!$socio) {
            return response()->json([
                'error' => 'Socio no encontrado.',
            ], 404);
        }

        return response()->json([
            'nombre' => $socio->nombre,
            'estado' => $socio->estado_real,
        ]);
    }
}
