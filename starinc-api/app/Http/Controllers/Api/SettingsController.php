<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppearanceSetting;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    // ── Public ──

    /**
     * Get appearance settings (public / homepage CMS).
     */
    public function appearance()
    {
        return response()->json(AppearanceSetting::getAll());
    }

    /**
     * Get payment config (public / invoice page).
     */
    public function paymentInfo()
    {
        return response()->json([
            'bank_name'      => SystemSetting::getValue('payment_bank_name', 'BCA'),
            'account_number' => SystemSetting::getValue('payment_account_number', '888888888'),
            'account_name'   => SystemSetting::getValue('payment_account_name', 'PT BBK'),
        ]);
    }

    // ── Admin ──

    /**
     * Get all system settings grouped (admin).
     */
    public function adminSettings()
    {
        $settings = SystemSetting::all()->groupBy('group')->map(function ($group) {
            return $group->pluck('value', 'key');
        });

        return response()->json($settings);
    }

    /**
     * Update system settings (admin).
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key'   => 'required|string',
            'settings.*.value' => 'required|string',
            'settings.*.group' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            SystemSetting::setValue(
                $setting['key'],
                $setting['value'],
                $setting['group'] ?? 'general'
            );
        }

        return response()->json(['message' => 'Pengaturan berhasil disimpan.']);
    }

    /**
     * Get appearance settings (admin).
     */
    public function adminAppearance()
    {
        return response()->json(AppearanceSetting::getAll());
    }

    /**
     * Update appearance settings (admin).
     */
    public function updateAppearance(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            AppearanceSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json(['message' => 'Tampilan berhasil diperbarui.']);
    }

    /**
     * Update Tier setting (admin)
     */
    public function updateTier(Request $request, int $id)
    {
        $tier = \App\Models\Tier::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'min_spend' => 'sometimes|numeric',
            'discount_percent' => 'sometimes|numeric',
        ]);
        
        $tier->update($validated);
        
        return response()->json(['message' => 'Tier berhasil diupdate.', 'tier' => $tier]);
    }
}
