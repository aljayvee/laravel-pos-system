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

            // Verify Password (supports both Bcrypt and your Seeder's SHA256)
            $isValid = false;
            
            // 1. Check standard Laravel Bcrypt
            if (Hash::check($request->password, $user->password_hash)) {
                $isValid = true;
            } 
            // 2. Check legacy/seeder SHA256
            else if ($user->password_hash === hash('sha256', $request->password)) {
                $isValid = true;
                // Optional: Upgrade to Bcrypt automatically
                $user->password_hash = Hash::make($request->password);
                $user->save();
            }

            if (!$isValid) {
                return response()->json(['success' => false, 'message' => 'Invalid password'], 401);
            }

            // Update status
            $user->status = 1;
            $user->save();

            return response()->json([
                'success' => true,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function logout(Request $request)
    {
        $id = $request->input('id');
        if ($id) {
            $user = User::find($id);
            if ($user) {
                $user->status = 0;
                $user->save();
            }
        }
        return response()->json(['success' => true]);
    }
}