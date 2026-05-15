import { createClient } from "@/utils/supabase/client";
import { UserData } from "@/lib/types";

const supabase = createClient();

export async function initializeAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Error initializing auth:", error);
    return null;
  }
}

export async function signUpUser(
  email: string,
  password: string,
  username: string,
  fullName: string,
  language: string = "en"
) {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    // Create profile in database
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName,
        xp: 0,
        level: 1,
        streak: 0,
        language,
        last_active_date: new Date().toDateString(),
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Initialize weekly XP for current week
    const weekStart = getWeekStart(new Date());
    await supabase.from("weekly_xp").insert({
      user_id: authData.user.id,
      week_start_date: weekStart,
      xp: 0,
    });

    return { user: authData.user, profile: profileData, error: null };
  } catch (error) {
    console.error("Signup error:", error);
    return { user: null, profile: null, error };
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw profileError;

    return { user: data.user, profile: profileData, error: null };
  } catch (error) {
    console.error("Sign in error:", error);
    return { user: null, profile: null, error };
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error };
  }
}

export async function getCurrentUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error) {
    console.error("Error fetching profile:", error);
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
    console.error("Error updating profile:", error);
    return { profile: null, error };
  }
}

export async function addSessionRecord(
  userId: string,
  sessionData: {
    type: string;
    drill_id?: string;
    drill_name?: string;
    transcript?: string;
    analysis?: any;
    xp_gained: number;
  }
) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        ...sessionData,
      })
      .select()
      .single();

    if (error) throw error;

    // Update user XP and weekly XP
    const { profile } = await getCurrentUserProfile(userId);
    if (profile) {
      const newXp = profile.xp + sessionData.xp_gained;
      const newLevel = Math.floor(newXp / 500) + 1;

      // Update profile
      await updateUserProfile(userId, {
        xp: newXp,
        level: newLevel,
      });

      // Update weekly XP
      const weekStart = getWeekStart(new Date());
      const { data: weeklyData } = await supabase
        .from("weekly_xp")
        .select("*")
        .eq("user_id", userId)
        .eq("week_start_date", weekStart)
        .single();

      if (weeklyData) {
        await supabase
          .from("weekly_xp")
          .update({ xp: weeklyData.xp + sessionData.xp_gained })
          .eq("user_id", userId)
          .eq("week_start_date", weekStart);
      } else {
        await supabase.from("weekly_xp").insert({
          user_id: userId,
          week_start_date: weekStart,
          xp: sessionData.xp_gained,
        });
      }
    }

    return { session: data, error: null };
  } catch (error) {
    console.error("Error adding session:", error);
    return { session: null, error };
  }
}

export async function getWeeklyLeaderboard(weekStart?: string) {
  try {
    const week = weekStart || getWeekStart(new Date());
    const { data, error } = await supabase
      .from("weekly_xp")
      .select(
        `
        xp,
        profiles:user_id (
          id,
          username,
          level,
          streak,
          avatar_url
        )
      `
      )
      .eq("week_start_date", week)
      .order("xp", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { leaderboard: data, error: null };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { leaderboard: null, error };
  }
}

export async function addFriend(userId: string, friendUsername: string) {
  try {
    // Find friend by username
    const { data: friendData, error: friendError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", friendUsername)
      .single();

    if (friendError) throw new Error("Friend not found");

    // Add friendship
    const { data, error } = await supabase
      .from("friends")
      .insert({
        user_id: userId,
        friend_id: friendData.id,
        status: "accepted",
      })
      .select()
      .single();

    if (error) throw error;
    return { friendship: data, error: null };
  } catch (error) {
    console.error("Error adding friend:", error);
    return { friendship: null, error };
  }
}

export async function getFriendsList(userId: string) {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select(
        `
        id,
        profiles:friend_id (
          id,
          username,
          level,
          xp,
          streak,
          avatar_url
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (error) throw error;
    return { friends: data, error: null };
  } catch (error) {
    console.error("Error fetching friends:", error);
    return { friends: null, error };
  }
}

export async function searchUsers(query: string, excludeUserId?: string) {
  try {
    let q = supabase
      .from("profiles")
      .select("id, username, level, xp, avatar_url")
      .ilike("username", `%${query}%`)
      .limit(10);

    if (excludeUserId) {
      q = q.neq("id", excludeUserId);
    }

    const { data, error } = await q;

    if (error) throw error;
    return { results: data, error: null };
  } catch (error) {
    console.error("Error searching users:", error);
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

    // Ignore unique constraint errors (already unlocked)
    if (error && error.code !== "23505") throw error;

    return { achievement: data, error: null };
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return { achievement: null, error };
  }
}

export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("badge_id, unlocked_at")
      .eq("user_id", userId);

    if (error) throw error;
    return { achievements: data, error: null };
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return { achievements: null, error };
  }
}

// Helper function to get week start date (Monday)
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}
