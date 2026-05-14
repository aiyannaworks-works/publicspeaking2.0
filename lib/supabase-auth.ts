import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function signUp(email: string, password: string, username: string, fullName: string) {
  try {
    // Sign up with auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName,
        xp: 0,
        level: 1,
        streak: 0,
      });

    if (profileError) throw profileError;

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}

export async function addSession(userId: string, session: any) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        ...session,
      })
      .select()
      .single();

    if (error) throw error;
    return { session: data, error: null };
  } catch (error) {
    return { session: null, error };
  }
}

export async function getWeeklyLeaderboard(weekStartDate: string) {
  try {
    const { data, error } = await supabase
      .from("weekly_xp")
      .select("*, profiles(username, level, streak)")
      .eq("week_start_date", weekStartDate)
      .order("xp", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { leaderboard: data, error: null };
  } catch (error) {
    return { leaderboard: null, error };
  }
}

export async function addFriend(userId: string, friendId: string) {
  try {
    const { data, error } = await supabase
      .from("friends")
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: "accepted",
      })
      .select()
      .single();

    if (error) throw error;
    return { friendship: data, error: null };
  } catch (error) {
    return { friendship: null, error };
  }
}

export async function getFriends(userId: string) {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select("*, profiles(id, username, xp, level, streak)")
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (error) throw error;
    return { friends: data, error: null };
  } catch (error) {
    return { friends: null, error };
  }
}

export async function searchUsers(query: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, level, xp")
      .or(`username.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return { results: data, error: null };
  } catch (error) {
    return { results: null, error };
  }
}

export async function unlockAchievement(userId: string, badgeId: string) {
  try {
    const { data, error } = await supabase
      .from("achievements")
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .select()
      .single();

    if (error && error.code !== "23505") throw error; // 23505 = unique violation (already unlocked)
    return { achievement: data, error: null };
  } catch (error) {
    return { achievement: null, error };
  }
}
