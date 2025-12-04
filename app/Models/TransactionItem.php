<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    public $timestamps = false;
    protected $guarded = []; // Allow all columns to be filled
}