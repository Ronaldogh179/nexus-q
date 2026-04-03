<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progresos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('socio_id')->constrained()->onDelete('cascade');
            $table->decimal('peso', 5, 2);
            $table->decimal('bicep', 5, 2)->nullable();
            $table->decimal('pierna', 5, 2)->nullable();
            $table->decimal('abdomen', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progresos');
    }
};