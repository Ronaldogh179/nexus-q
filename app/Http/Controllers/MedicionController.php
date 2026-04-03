<?php

namespace App\Http\Controllers;

use App\Models\Medicion;
use App\Models\Socio;
use Illuminate\Http\Request;

class MedicionController extends Controller
{
    /**
     * Guarda las nuevas medidas y calcula el IMC automáticamente.
     */
    public function store(Request $request)
    {
        // 1. VALIDACIÓN DE CALIDAD
        $request->validate([
            'socio_id' => 'required|exists:socios,id',
            'peso' => 'required|numeric|min:20|max:300',
            'talla' => 'required|numeric|min:1|max:2.5',
            'biceps' => 'nullable|numeric',
            'abdomen' => 'nullable|numeric',
            'muslo' => 'nullable|numeric',
        ]);

        // 2. LÓGICA DE NEGOCIO: Cálculo automático del IMC
        // Fórmula: peso / (talla * talla)
        $imc = round($request->peso / ($request->talla ** 2), 1);

        // 3. GUARDAR EN LA BASE DE DATOS
        Medicion::create([
            'socio_id' => $request->socio_id,
            'peso' => $request->peso,
            'talla' => $request->talla,
            'imc' => $imc,
            'biceps' => $request->biceps,
            'abdomen' => $request->abdomen,
            'muslo' => $request->muslo,
            'fecha_control' => now(), // Se guarda con la fecha de hoy
        ]);

        // 4. ACTUALIZAR EL PESO EN LA FICHA DEL SOCIO (Opcional pero recomendado)
        $socio = Socio::find($request->socio_id);
        $socio->update(['peso' => $request->peso]);

        // 5. REGRESAR CON ÉXITO
        return back()->with('success', '¡Medidas registradas! El IMC calculado es: ' . $imc);
    }
}