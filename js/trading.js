import { supabase } from './config.js';
import { getInventory } from './inventory.js';

export async function initiateTrade(initiatorId, receiverEmail, initiatorChars, receiverChars) {
  try {
    // Buscar el usuario por email en auth
    const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      throw new Error('Error al buscar usuario: ' + searchError.message);
    }
    
    const receiverUser = users.find(u => u.email === receiverEmail);
    
    if (!receiverUser) {
      throw new Error('Usuario no encontrado con ese email');
    }
    
    const receiverId = receiverUser.id;
    const tradeId = `TRADE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('trades')
      .insert([{
        trade_id: tradeId,
        initiator_id: initiatorId,
        receiver_id: receiverId,
        initiator_characters: initiatorChars,
        receiver_characters: receiverChars,
        status: 'pending'
      }])
      .select();
    
    if (error) throw new Error('Error al crear tradeo: ' + error.message);
    
    // Crear notificación
    await supabase.from('notifications').insert([{
      user_id: receiverId,
      type: 'trade_request',
      from_user_id: initiatorId,
      trade_id: tradeId,
      message: `Solicitud de tradeo recibida`
    }]);
    
    return data[0];
  } catch (error) {
    console.error('Error en initiateTrade:', error);
    throw error;
  }
}

export async function getPendingTrades(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('receiver_id', userId)
    .eq('status', 'pending');
  
  if (error) throw new Error('Error al obtener tradeos: ' + error.message);
  return data || [];
}

export async function acceptTrade(tradeId, receiverId, initiatorId) {
  try {
    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .select('*')
      .eq('trade_id', tradeId)
      .single();
    
    if (tradeError) throw new Error('Tradeo no encontrado');
    
    // Actualizar tradeo
    const { error: updateError } = await supabase
      .from('trades')
      .update({ status: 'completed' })
      .eq('trade_id', tradeId);
    
    if (updateError) throw new Error('Error al completar tradeo');
    
    return true;
  } catch (error) {
    console.error('Error en acceptTrade:', error);
    throw error;
  }
}

export async function declineTrade(tradeId) {
  try {
    const { error } = await supabase
      .from('trades')
      .update({ status: 'declined' })
      .eq('trade_id', tradeId);
    
    if (error) throw new Error('Error al rechazar tradeo');
    
    return true;
  } catch (error) {
    console.error('Error en declineTrade:', error);
    throw error;
  }
}

export async function getTradeHistory(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error('Error al obtener historial');
  
  return data || [];
}

export async function getUserByEmail(email) {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw new Error('Error al buscar usuario');
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    return user;
  } catch (error) {
    console.error('Error en getUserByEmail:', error);
    throw error;
  }
}