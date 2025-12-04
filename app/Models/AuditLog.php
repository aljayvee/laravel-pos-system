<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    // 1. Disable automatic timestamps (fixes the crash)
    public $timestamps = false;

    // 2. Allow saving these columns
    protected $fillable = ['username', 'action'];
}