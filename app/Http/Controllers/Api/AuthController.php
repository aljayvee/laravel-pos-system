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
        // We check standard Laravel Hash (Bcrypt) OR the simple SHA256 from your old seeder
        $isValid = false;

        if (Hash::check($request->password, $user->password_hash)) {
            $isValid = true;
        } 
        else if ($user->password_hash === hash('sha256', $request->password)) {
            $isValid = true;
            // Upgrade to Bcrypt automatically for security
            $user->password_hash = Hash::make($request->password);
            $user->save();
        }

        if (!$isValid) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        // 4. Update Status to Online
        $user->status = 1;
        $user->save();

        // 5. Return Success Response
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
                $user->status = 0;
                $user->save();
            }
        }
        return response()->json(['success' => true, 'message' => 'Logged out']);
    }
}