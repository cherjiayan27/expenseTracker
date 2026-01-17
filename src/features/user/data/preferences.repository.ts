import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";
import type { UserPreference, PreferenceKey, SavePreferenceInput } from "../domain/preferences.types";

export class PreferencesRepository {
  constructor(private supabase: SupabaseClient<Database, "public", any>) {} // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Get a specific preference for a user by userId
   * Use this when you already have the user ID to avoid an extra getUser() call
   */
  async getPreferenceById(userId: string, preferenceKey: PreferenceKey): Promise<UserPreference | null> {
    const { data, error } = await this.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("preference_key", preferenceKey)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as UserPreference | null;
  }

  /**
   * Get a specific preference for the current user
   */
  async getPreference(preferenceKey: PreferenceKey): Promise<UserPreference | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    return this.getPreferenceById(user.id, preferenceKey);
  }

  /**
   * Get all preferences for the current user
   */
  async getAllPreferences(): Promise<UserPreference[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await this.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return (data || []) as UserPreference[];
  }

  /**
   * Save or update a preference (upsert)
   */
  async savePreference(input: SavePreferenceInput): Promise<UserPreference> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await this.supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        preference_key: input.preference_key,
        preference_value: input.preference_value as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,preference_key",
      })
      .select()
      .single();

    if (error) {
      console.error("Upsert error details:", error);
      throw error;
    }

    return data as UserPreference;
  }

  /**
   * Delete a specific preference
   */
  async deletePreference(preferenceKey: PreferenceKey): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await this.supabase
      .from("user_preferences")
      .delete()
      .eq("user_id", user.id)
      .eq("preference_key", preferenceKey);

    if (error) {
      throw error;
    }
  }
}

