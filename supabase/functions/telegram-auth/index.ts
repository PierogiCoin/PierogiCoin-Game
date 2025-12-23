// Supabase Edge Function for Telegram initData validation
// Deploy this to Supabase Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-init-data",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

function validateTelegramInitData(initData: string, botToken: string): TelegramUser | null {
    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get("hash");
        if (!hash) return null;

        // Remove hash from data for validation
        urlParams.delete("hash");

        // Sort parameters alphabetically
        const dataCheckArr: string[] = [];
        const sortedParams = Array.from(urlParams.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [key, value] of sortedParams) {
            dataCheckArr.push(`${key}=${value}`);
        }
        const dataCheckString = dataCheckArr.join("\n");

        // Create HMAC-SHA256 hash
        const secretKey = createHmac("sha256", "WebAppData")
            .update(new TextEncoder().encode(botToken))
            .digest();

        const calculatedHash = createHmac("sha256", secretKey)
            .update(new TextEncoder().encode(dataCheckString))
            .digest("hex");

        if (calculatedHash !== hash) {
            console.error("Hash mismatch");
            return null;
        }

        // Check auth_date (not older than 24 hours)
        const authDate = parseInt(urlParams.get("auth_date") || "0");
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            console.error("Auth date too old");
            return null;
        }

        // Parse user data
        const userStr = urlParams.get("user");
        if (!userStr) return null;

        return JSON.parse(userStr) as TelegramUser;
    } catch (error) {
        console.error("Validation error:", error);
        return null;
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const initData = req.headers.get("x-telegram-init-data");

        if (!initData) {
            return new Response(
                JSON.stringify({ error: "Missing initData" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate Telegram initData
        const telegramUser = validateTelegramInitData(initData, TELEGRAM_BOT_TOKEN);

        if (!telegramUser) {
            return new Response(
                JSON.stringify({ error: "Invalid initData" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create Supabase client with service role (bypasses RLS)
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get request body
        const { action, data } = await req.json();

        let result;

        switch (action) {
            case "loadUser": {
                const userId = telegramUser.id.toString();
                const username = telegramUser.username || telegramUser.first_name || `User${telegramUser.id}`;

                // Try to get existing user
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (userError && userError.code !== "PGRST116") {
                    throw userError;
                }

                if (userData) {
                    // Get game state
                    const { data: gameState } = await supabase
                        .from("game_states")
                        .select("*")
                        .eq("user_id", userId)
                        .single();

                    result = { user: userData, gameState };
                } else {
                    // Create new user
                    const newUser = {
                        id: userId,
                        username,
                        level: 1,
                        xp: 0,
                        prg: 0,
                        gems: 0,
                        energy: 100,
                        max_energy: 100,
                    };

                    await supabase.from("users").insert(newUser);

                    const newGameState = {
                        user_id: userId,
                        daily_bonus_claimed: false,
                        is_sound_on: true,
                    };

                    await supabase.from("game_states").insert(newGameState);

                    result = { user: newUser, gameState: newGameState, isNew: true };
                }
                break;
            }

            case "saveUser": {
                const userId = telegramUser.id.toString();

                if (data.userProfile) {
                    await supabase
                        .from("users")
                        .update(data.userProfile)
                        .eq("id", userId);
                }

                if (data.gameState) {
                    await supabase
                        .from("game_states")
                        .update(data.gameState)
                        .eq("user_id", userId);
                }

                result = { success: true };
                break;
            }

            case "getLeaderboard": {
                const { data: leaderboard } = await supabase
                    .from("users")
                    .select("id, username, level, prg, avatar_id")
                    .order("prg", { ascending: false })
                    .limit(100);

                result = { leaderboard };
                break;
            }

            default:
                return new Response(
                    JSON.stringify({ error: "Unknown action" }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
        }

        return new Response(
            JSON.stringify(result),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
