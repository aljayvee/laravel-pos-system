<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate Input
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        // 2. Find the user
        $user = User::where('username', $request->username)->first();

        // 3. Check Credentials
        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        // PASSWORD CHECK LOGIC
        // Your UserSeeder used simple SHA256, but standard Laravel uses Bcrypt.
        // We check both to support your seeded 'admin' account and new users.
        $isValid = false;

        // Check 1: Standard Laravel Hash (Bcrypt)
        if (Hash::check($request->password, $user->password_hash)) {
            $isValid = true;
        } 
        // Check 2: Legacy/Seeder Hash (SHA256)
        // Only strictly necessary if you are using the exact seeder provided in your uploads
        else if ($user->password_hash === hash('sha256', $request->password)) {
            $isValid = true;
            // Optional: Rehash to Bcrypt for security update
            $user->password_hash = Hash::make($request->password);
            $user->save();
        }

        if (!$isValid) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        // 4. Login Success: Update Status to Online (1)
        $user->status = 1;
        $user->save();

        // 5. Return User Data (Excluded sensitive fields)
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role,
                'status' => $user->status
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $id = $request->input('id');
        
        if ($id) {
            $user = User::find($id);
            if ($user) {
                $user->status = 0; // Set status to Offline
                $user->save();
            }
        }

        return response()->json(['success' => true, 'message' => 'Logged out']);
    }
}