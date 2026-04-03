<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mediciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('socio_id')->constrained('socios')->cascadeOnDelete();
            $table->decimal('peso', 5, 2);
            $table->decimal('talla', 5, 2)->nullable();
            $table->decimal('imc', 5, 2)->nullable();
            $table->decimal('biceps', 5, 2)->nullable();
            $table->decimal('abdomen', 5, 2)->nullable();
            $table->decimal('muslo', 5, 2)->nullable();
            $table->date('fecha_control')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mediciones');
    }
};
