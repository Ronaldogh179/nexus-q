<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Socio extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'dni', 'telefono', 'fecha_inscripcion', 'fecha_vencimiento', 'estado', 'peso', 'estatura'];

    protected $casts = [
        'fecha_inscripcion' => 'date',
        'fecha_vencimiento' => 'date',
    ];

    // Relación para traer todos sus avances
    public function progresos(): HasMany
    {
        return $this->hasMany(Progreso::class)->orderBy('created_at', 'asc');
    }

    public function mediciones(): HasMany
    {
        return $this->hasMany(Medicion::class);
    }

    public function ultimoIMC(): ?float
    {
        $medicion = $this->mediciones()
            ->orderByDesc('fecha_control')
            ->orderByDesc('created_at')
            ->first();

        return $medicion?->imc;
    }

    public function getEstadoRealAttribute(): string
    {
        if (!$this->fecha_vencimiento) {
            return 'ACTIVO';
        }

        return $this->fecha_vencimiento->lt(now()) ? 'VENCIDO' : 'ACTIVO';
    }
}