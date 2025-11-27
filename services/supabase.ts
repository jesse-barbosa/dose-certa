import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_KEY } =
  Constants.expoConfig.extra;

export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_KEY
);