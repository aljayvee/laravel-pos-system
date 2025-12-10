<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Use 'username' and 'password_hash' instead of defaults
    protected $fillable = [
        'username',
        'password_hash',
        'first_name',
        'last_name',
        'role',
        'status', // Added status to fillable
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];
}