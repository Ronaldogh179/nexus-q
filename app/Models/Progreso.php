<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Progreso extends Model
{
    protected $fillable = ['socio_id', 'peso', 'bicep', 'pierna', 'abdomen'];

    public function socio() {
        return $this->belongsTo(Socio::class);
    }
}