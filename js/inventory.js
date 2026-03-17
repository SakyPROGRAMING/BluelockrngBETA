import { supabase } from './config.js';
import { sellPrice, characterRarities } from './characters.js';

export async function addToInventory(characterName, userId) {
  const { data, error } = await supabase
    .from('inventory')
    .insert([{ user_id: userId, character_name: characterName }]);
  
  // Permitir duplicados (ignorar constraint unique)
  if (error && error.code === '23505') {
    console.log('Permitiendo duplicado:', characterName);
    return { character_name: characterName, user_id: userId };
  }
  
  if (error) throw new Error('Error al agregar inventario: ' + error.message);
  return data;
}

export async function getInventory(userId) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error('Error al obtener inventario: ' + error.message);
  return data || [];
}

export async function removeFromInventory(id) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error('Error al eliminar: ' + error.message);
}

export async function sellCharacter(inventoryId, characterName, userId) {
  const rarity = characterRarities[characterName];
  const price = sellPrice[rarity] || 50;
  
  await removeFromInventory(inventoryId);
  await addMoney(userId, price);
  
  return price;
}

export async function sellAllInventory(userId) {
  const inventory = await getInventory(userId);
  let totalMoney = 0;
  
  for (const item of inventory) {
    const price = sellPrice[characterRarities[item.character_name]] || 50;
    totalMoney += price;
  }
  
  await supabase
    .from('inventory')
    .delete()
    .eq('user_id', userId);
  
  await addMoney(userId, totalMoney);
  return totalMoney;
}

// Safe (Caja Fuerte)
export async function addToSafe(characterName, userId, inventoryId = null) {
  const { data, error } = await supabase
    .from('safe')
    .insert([{ user_id: userId, character_name: characterName }]);
  
  if (error) throw new Error('Error al agregar a safe: ' + error.message);
  
  if (inventoryId) {
    await removeFromInventory(inventoryId);
  }
  
  return data;
}

export async function getSafe(userId) {
  const { data, error } = await supabase
    .from('safe')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error('Error al obtener safe: ' + error.message);
  return data || [];
}

export async function removeFromSafe(id) {
  const { error } = await supabase
    .from('safe')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error('Error al eliminar de safe: ' + error.message);
}

export async function addInventoryFromSafe(characterName, userId) {
  return await addToInventory(characterName, userId);
}

// Index (Personajes desbloqueados)
export async function addToIndex(characterName, userId) {
  const { data, error } = await supabase
    .from('index_list')
    .insert([{ user_id: userId, character_name: characterName }])
    .select();
  
  if (error && error.code !== '23505') {
    throw new Error('Error al agregar a índice: ' + error.message);
  }
  return data;
}

export async function getIndex(userId) {
  const { data, error } = await supabase
    .from('index_list')
    .select('*')
    .eq('user_id', userId)
    .order('first_obtained', { ascending: false });
  
  if (error) throw new Error('Error al obtener índice: ' + error.message);
  return data || [];
}

// Money
export async function getMoney(userId) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('money')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code === 'PGRST116') {
    await supabase.from('user_stats').insert([{
      user_id: userId,
      money: 2000
    }]);
    return 2000;
  }
  
  if (error) throw new Error('Error al obtener dinero: ' + error.message);
  return data?.money || 2000;
}

export async function setMoney(userId, amount) {
  const { data: existing } = await supabase
    .from('user_stats')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  if (existing) {
    const { error } = await supabase
      .from('user_stats')
      .update({ money: amount, updated_at: new Date() })
      .eq('user_id', userId);
    
    if (error) throw new Error('Error al actualizar dinero: ' + error.message);
  } else {
    const { error } = await supabase
      .from('user_stats')
      .insert([{ user_id: userId, money: amount }]);
    
    if (error) throw new Error('Error al crear dinero: ' + error.message);
  }
}

export async function addMoney(userId, amount) {
  const current = await getMoney(userId);
  await setMoney(userId, current + amount);
}

export async function subtractMoney(userId, amount) {
  const current = await getMoney(userId);
  const newAmount = Math.max(0, current - amount);
  await setMoney(userId, newAmount);
}