<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medicion extends Model
{
    // ESTA LÍNEA ES LA QUE SALVA EL DÍA:
    protected $table = 'mediciones';

    protected $fillable = [
        'socio_id',
        'peso',
        'talla',
        'imc',
        'biceps',
        'abdomen',
        'muslo',
        'fecha_control',
    ];

    public function socio(): BelongsTo
    {
        return $this->belongsTo(Socio::class);
    }
}