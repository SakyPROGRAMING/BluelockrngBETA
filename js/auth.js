import { supabase } from './config.js';

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (data.user) {
    await supabase.from('user_stats').insert([{
      user_id: data.user.id,
      money: 2000
    }]);
  }
  
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user);
  });
  return subscription;
}