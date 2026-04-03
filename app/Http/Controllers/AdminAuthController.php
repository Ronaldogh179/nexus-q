<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminAuthController extends Controller
{
    public function showLogin() {
        return view('auth.admin_login');
    }

    public function login(Request $request) {
        // Aquí defines tu contraseña maestra (Cámbiala por la que quieras)
        $password_maestra = "admin123"; 

        if ($request->password === $password_maestra) {
            session(['admin_logged_in' => true]);
            return redirect()->route('dashboard')->with('success', 'Bienvenido al Búnker, Admin.');
        }

        return back()->with('error', 'Contraseña incorrecta. Acceso denegado.');
    }

    public function logout() {
        session()->forget('admin_logged_in');
        return redirect()->route('socio.login');
    }
}