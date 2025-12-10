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
        try {
            $request->validate([
                'username' => 'required',
                'password' => 'required',
            ]);

            $user = User::where('username', $request->username)->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 401);
            }

            // --- PASSWORD VERIFICATION LOGIC ---
            $isValid = false;

            // 1. Check Standard Laravel Hash (Needs APP_KEY)
            if (Hash::check($request->password, $user->password_hash)) {
                $isValid = true;
            } 
            // 2. Check Legacy SHA256 (from your Seeder)
            else if ($user->password_hash === hash('sha256', $request->password)) {
                $isValid = true;
                // Auto-upgrade to secure hash
                $user->password_hash = Hash::make($request->password);
                $user->save();
            }

            if (!$isValid) {
                return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
            }

            // --- SUCCESS ---
            $user->status = 1;
            $user->save();

            // Generate Token for API access
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token 
            ]);

        } catch (\Exception $e) {
            // Return JSON error instead of crashing with HTML 500
            return response()->json([
                'success' => false, 
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $id = $request->input('id');
        if ($id) {
            $user = User::find($id);
            if ($user) {
                $user->status = 0;
                $user->tokens()->delete(); // Revoke tokens
                $user->save();
            }
        }
        return response()->json(['success' => true]);
    }
}