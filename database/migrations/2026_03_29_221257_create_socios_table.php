<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de socios con todos sus campos.
     */
    public function up(): void
    {
        Schema::create('socios', function (Blueprint $table) {
            $table->id(); 
            $table->string('nombre');                // Nombre del socio
            $table->string('dni')->unique();         // DNI (no se puede repetir)
            $table->string('telefono')->nullable();  // Teléfono (opcional)
            $table->date('fecha_inscripcion');       // Fecha de ingreso
            $table->enum('estado', ['activo', 'vencido'])->default('activo'); 
            $table->timestamps();                    // created_at y updated_at
        });
    }

    /**
     * Borra la tabla si es necesario.
     */
    public function down(): void
    {
        Schema::dropIfExists('socios');
    }
};