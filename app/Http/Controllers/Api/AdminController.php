<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // --- MANAGE USERS ---
    
    public function index()
    {
        return response()->json(User::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|unique:users',
            'password' => 'required',
            'role' => 'required'
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'password_hash' => Hash::make($validated['password']),
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'role' => $validated['role'],
            'status' => 0
        ]);

        $this->logAction($request->user()->username ?? 'Admin', "Created user {$user->username}");

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function update(Request $request)
    {
        $user = User::find($request->id);
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $user->username = $request->username;
        $user->first_name = $request->firstName;
        $user->last_name = $request->lastName;
        $user->role = $request->role;

        if ($request->password) {
            $user->password_hash = Hash::make($request->password);
        }

        $user->save();
        $this->logAction($request->user()->username ?? 'Admin', "Updated user {$user->username}");

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request)
    {
        $user = User::find($request->id);
        if ($user) {
            $username = $user->username;
            $user->delete();
            $this->logAction($request->user()->username ?? 'Admin', "Deleted user {$username}");
        }
        return response()->json(['success' => true]);
    }

    public function getOnlineUsers()
    {
        // Specific logic for online accounts
        return response()->json(User::where('status', 1)->get());
    }

    // --- AUDIT LOGS ---

    public function getAuditLogs()
    {
        return response()->json(AuditLog::orderBy('created_at', 'desc')->take(100)->get());
    }

    private function logAction($username, $action)
    {
        AuditLog::create(['username' => $username, 'action' => $action]);
    }
}