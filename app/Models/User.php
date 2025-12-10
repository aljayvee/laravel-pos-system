<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Import Sanctum

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens; // Add HasApiTokens

    public $timestamps = true;

    protected $fillable = [
        'username',
        'password_hash', // Custom password column
        'first_name',
        'last_name',
        'role',
        'status',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    // FIX: Tell Laravel to use 'password_hash' instead of 'password'
    public function getAuthPassword()
    {
        return $this->password_hash;
    }
}