<?php

namespace App\Http\Controllers;

use App\Models\Socio;
use App\Models\Medicion;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;

class SocioController extends Controller
{
    public function index() {
        $socios = Socio::orderBy('created_at', 'desc')->get();
        return view('socios.index', compact('socios'));
    }

    public function create() { return view('socios.create'); }

    public function store(Request $request) {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'dni' => 'required|digits:8|unique:socios,dni',
            'fecha_inscripcion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_inscripcion',
            'peso' => 'nullable|numeric|min:20|max:300',
            'estatura' => 'nullable|numeric|min:1|max:2.5',
        ]);

        Socio::create($request->all());
        return redirect()->route('socios.index')->with('success', 'Socio registrado con éxito.');
    }

    public function edit(Socio $socio) { return view('socios.edit', compact('socio')); }

    public function update(Request $request, Socio $socio) {
        $request->validate([
            'nombre' => 'required|string',
            'peso' => 'nullable|numeric|min:1',
            'estatura' => 'nullable|numeric|min:1',
        ]);
        $socio->update($request->all());
        return redirect()->route('socios.index')->with('success', 'Datos actualizados.');
    }

    public function renovar(Socio $socio) {
        // Calidad: La renovación añade 30 días desde HOY o desde el vencimiento si es futuro
        $nuevaFecha = ($socio->fecha_vencimiento > now()) 
            ? $socio->fecha_vencimiento->addDays(30) 
            : now()->addDays(30);

        $socio->update([
            'estado' => 'activo',
            'fecha_vencimiento' => $nuevaFecha
        ]);
        return back()->with('success', 'Membresía renovada hasta el ' . $nuevaFecha->format('d/m/Y'));
    }

    /**
     * Perfil del Socio con persistencia de sesión
     */
    public function perfilSocio(Request $request) {
        // Buscamos el DNI en el request (formulario) o en la sesión (por si regresamos de guardar medidas)
        $dni = $request->dni ?? session('perfil_dni');

        if (!$dni) {
            return redirect()->route('socio.login')->with('error', 'Por favor, ingrese su DNI.');
        }

        $socio = Socio::with(['mediciones'])->where('dni', $dni)->first();
        
        if (!$socio) {
            return redirect()->route('socio.login')->withErrors(['dni' => 'DNI no encontrado.']);
        }

        // Guardamos el DNI en la sesión para que el botón "atrás" o "refresh" no rompa la página
        session(['perfil_dni' => $dni]);

        $imc = $socio->ultimoIMC() ?? "N/A";
        $codigoQR = QrCode::size(250)->generate($socio->dni);
        
        return view('socios.perfil', compact('socio', 'codigoQR', 'imc'));
    }

    public function registrarProgreso(Request $request, Socio $socio) {
        $request->validate([
            'peso' => 'required|numeric|min:1',
        ]);
        // Aquí puedes añadir más lógica si usas la tabla 'progresos'
        $socio->update(['peso' => $request->peso]);
        return back()->with('success', '¡Peso actualizado!');
    }

    public function generarReporte($id) {
        $socio = Socio::with('mediciones')->findOrFail($id);
        $imc = $socio->ultimoIMC() ?? "N/A";
        $pdf = Pdf::loadView('socios.reporte_pdf', compact('socio', 'imc'));
        return $pdf->download('Ficha_'.$socio->dni.'.pdf');
    }

    public function accesoIndex() { return view('control.acceso'); }

    public function validarAcceso(Request $request) {
        $socio = Socio::where('dni', $request->dni)->first();
        if (!$socio) return back()->with('error', 'Socio no existe.');
        
        return ($socio->estado_real === 'VENCIDO') 
            ? back()->with('denegado', $socio->toArray()) 
            : back()->with('concedido', $socio->toArray());
    }

    public function destroy(Socio $socio) {
        $socio->delete();
        return redirect()->route('socios.index')->with('success', 'Socio eliminado.');
    }
    public function reporteMorosos() {
        $socios = Socio::all()->filter(function($socio) {
            return $socio->estado_real === 'VENCIDO';
        });

        $pdf = Pdf::loadView('socios.reporte_morosos', compact('socios'));
        return $pdf->download('Reporte_Morosos_NexusQ.pdf');
    }
}