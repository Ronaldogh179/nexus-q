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
        Schema::table('socios', function (Blueprint $table) {
            // Añadimos las columnas después del estado
            $table->decimal('peso', 5, 2)->nullable()->after('estado');
            $table->decimal('estatura', 3, 2)->nullable()->after('peso');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('socios', function (Blueprint $table) {
            $table->dropColumn(['peso', 'estatura']);
        });
    }
};