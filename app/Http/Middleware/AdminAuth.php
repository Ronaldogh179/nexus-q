<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Si en la memoria (sesion) no dice que el admin se logueó...
        if (!session('admin_logged_in')) {
            // ...lo mandamos a la pantalla de login con un mensaje de error.
            return redirect()->route('admin.login')->with('error', 'Debes identificarte para entrar aquí.');
        }

        return $next($request);
    }
}