<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model {
    public $timestamps = false; // We use created_at manually via migration default
    protected $guarded = [];
    public function items() {
        return $this->hasMany(TransactionItem::class);
    }
}
