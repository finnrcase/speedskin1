"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "@/lib/data/types";

type AuthStatus =
  | "loading"
  | "unconfigured"
  | "signed-out"
  | "needs-role"
  | "authenticated";

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextValue {
  status: AuthStatus;
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  authMessage: string | null;
  authError: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeRoleOnboarding: (role: UserRole, fullName?: string) => Promise<void>;
  signInAsDemo: (role: UserRole, fullName?: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_PROFILE_KEY = "speedskin:demo-profile";
const DEMO_ROLE_COOKIE = "speedskin-demo-role";

const PROFILE_COLUMNS =
  "id,user_id,email,full_name,avatar_url,role,created_at,updated_at,last_login";

function demoNameForRole(role: UserRole) {
  if (role === "teacher") return "Casey Teacher";
  if (role === "admin") return "Avery Admin";
  return "Jordan Learner";
}

function demoProfile(role: UserRole, fullName?: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id: `demo-${role}`,
    userId: `demo-${role}`,
    email: `demo-${role}@speedskin.app`,
    fullName: fullName?.trim() || demoNameForRole(role),
    avatarUrl: null,
    role,
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
  };
}

function readDemoProfile(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as UserProfile;
    return saved?.id?.startsWith("demo-") && saved.role ? saved : null;
  } catch {
    return null;
  }
}

function profileFromRow(row: {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}): UserProfile {
  return {
    id: row.id,
    userId: row.user_id ?? row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
  };
}

function fallbackFullName(user: User | null) {
  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;
  return metadataName ?? user?.email?.split("@")[0] ?? "SpeedSkin learner";
}

/** Human-friendly copy for the common Supabase auth error messages. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email or password is incorrect.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with that email already exists. Try logging in.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email, then log in.";
  if (m.includes("password") && m.includes("6"))
    return "Password must be at least 6 characters.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network problem — check your connection and try again.";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? "loading" : "unconfigured",
  );
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!supabase) return null;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setSession(null);
      setProfile(null);
      setStatus("signed-out");
      return null;
    }

    const user = userData.user;
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setAuthError(error.message);
      setStatus("needs-role");
      return null;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email ?? "",
          full_name: fallbackFullName(user),
          role: null,
        })
        .select(PROFILE_COLUMNS)
        .single();

      if (insertError) {
        setAuthError(insertError.message);
        setStatus("needs-role");
        return null;
      }

      const nextProfile = profileFromRow(inserted);
      setProfile(nextProfile);
      setStatus(nextProfile.role ? "authenticated" : "needs-role");
      return nextProfile;
    }

    const nextProfile = profileFromRow(data);
    setProfile(nextProfile);
    setStatus(nextProfile.role ? "authenticated" : "needs-role");
    return nextProfile;
  }, [supabase]);

  useEffect(() => {
    const saved = readDemoProfile();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(null);
      setProfile(saved);
      setStatus("authenticated");
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    if (readDemoProfile()) return;

    let active = true;

    supabase.auth.getSession().then(
      async ({ data }: { data: { session: Session | null } }) => {
        if (!active) return;
        setSession(data.session);
        if (data.session) {
          await refreshProfile();
        } else {
          const saved = readDemoProfile();
          if (saved) {
            setProfile(saved);
            setStatus("authenticated");
          } else {
            setProfile(null);
            setStatus("signed-out");
          }
        }
      },
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        setAuthError(null);
        setAuthMessage(null);
        if (!nextSession) {
          const saved = readDemoProfile();
          if (saved) {
            setProfile(saved);
            setStatus("authenticated");
          } else {
            setProfile(null);
            setStatus("signed-out");
          }
          return;
        }
        // Record the login timestamp (best-effort) once per sign-in.
        if (event === "SIGNED_IN" && nextSession.user) {
          void supabase
            .from("profiles")
            .update({ last_login: new Date().toISOString() })
            .eq("id", nextSession.user.id);
        }
        void refreshProfile();
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile, supabase]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return;
      setAuthError(null);
      setAuthMessage(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setAuthError(friendlyAuthError(error.message));
        return;
      }
      await refreshProfile();
    },
    [refreshProfile, supabase],
  );

  const signUpWithEmail = useCallback(
    async ({ email, password, fullName, role }: SignUpInput) => {
      if (!supabase) return;
      setAuthError(null);
      setAuthMessage(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        setAuthError(friendlyAuthError(error.message));
        return;
      }

      if (!data.session) {
        setAuthMessage("Check your email to confirm your SpeedSkin account.");
        return;
      }

      await refreshProfile();
    },
    [refreshProfile, supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase || typeof window === "undefined") return;
    setAuthError(null);
    setAuthMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setAuthError(friendlyAuthError(error.message));
  }, [supabase]);

  const completeRoleOnboarding = useCallback(
    async (role: UserRole, fullName?: string) => {
      if (!supabase || !session?.user) return;
      setAuthError(null);
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: fullName?.trim() || fallbackFullName(session.user),
          role,
        })
        .select(PROFILE_COLUMNS)
        .single();

      if (error) {
        setAuthError(friendlyAuthError(error.message));
        return;
      }

      const nextProfile = profileFromRow(data);
      setProfile(nextProfile);
      setStatus("authenticated");
    },
    [session, supabase],
  );

  const signInAsDemo = useCallback((role: UserRole, fullName?: string) => {
    const nextProfile = demoProfile(role, fullName);
    try {
      window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(nextProfile));
      document.cookie = `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=604800; SameSite=Lax`;
    } catch {
      // Local demo persistence is best-effort.
    }
    setSession(null);
    setAuthError(null);
    setAuthMessage(null);
    setProfile(nextProfile);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    try {
      window.localStorage.removeItem(DEMO_PROFILE_KEY);
      document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    } catch {
      // ignore
    }
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setStatus(supabase ? "signed-out" : "unconfigured");
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      supabase,
      session,
      user: session?.user ?? null,
      profile,
      authMessage,
      authError,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      completeRoleOnboarding,
      signInAsDemo,
      signOut,
      refreshProfile,
    }),
    [
      authError,
      authMessage,
      completeRoleOnboarding,
      profile,
      refreshProfile,
      session,
      signInAsDemo,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      status,
      supabase,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
