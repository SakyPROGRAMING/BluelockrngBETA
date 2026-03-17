import { characters, characterRarities } from './characters.js';
import { playSound, playCharacterSound, stopCurrentAudio } from './sounds.js';
import { addToInventory, addToIndex, getMoney, subtractMoney } from './inventory.js';
import { updateUI, showLoader, hideLoader } from './ui.js';

const spinCosts = {
  normal: 50,
  lucky: 500,
  master: 2000,
  kuon: 5000
};

export async function spin(type, userId) {
  showLoader();
  stopCurrentAudio(); // Detener audio anterior
  
  try {
    const cost = spinCosts[type];
    const currentMoney = await getMoney(userId);
    
    if (currentMoney < cost) {
      hideLoader();
      alert(`No tienes suficiente dinero. Necesitas ${cost} monedas.`);
      return null;
    }
    
    await subtractMoney(userId, cost);
    
    const img = document.getElementById('character-img');
    await spinAnimation(img);
    
    let result = '';
    
    if (type === 'kuon') {
      result = Math.random() < 0.99 ? 'hiori' : 'kuon';
    } else {
      const rarity = getRarityByType(type);
      const characterList = characters[rarity];
      result = characterList[Math.floor(Math.random() * characterList.length)];
    }
    
    await addToInventory(result, userId);
    await addToIndex(result, userId);
    
    img.src = `assets/characters/${result}.png`;
    document.getElementById('result').innerText = `¡Te tocó: ${result}!`;
    
    // Reproducir sonido (Kaiser NO tiene sonido)
    playCharacterSound(result);
    
    // SOLO KAISER y KAISER_NESS: reproducir video SIN sonido
    if (result === 'michael_kaiser' || result === 'kaiser_ness') {
      const video = document.getElementById('kaiser-video');
      video.src = 'assets/videos/kaiser.mp4';
      video.muted = false;
      video.style.display = 'block';
      video.onended = () => {
        video.style.display = 'none';
        stopCurrentAudio();
      };
    }
    
    await updateUI(userId);
    
    hideLoader();
    return result;
  } catch (error) {
    console.error('Error en spin:', error);
    stopCurrentAudio();
    hideLoader();
    alert('Error al hacer spin: ' + error.message);
  }
}

function getRarityByType(type) {
  const r = Math.random() * 100;
  let rarity = '';
  
  if (type === 'normal') {
    if (r < 40) rarity = 'comun';
    else if (r < 65) rarity = 'epico';
    else if (r < 80) rarity = 'raro';
    else if (r < 90) rarity = 'mitico';
    else if (r < 96) rarity = 'legendario';
    else if (r < 99) rarity = 'newgen';
    else rarity = 'master';
  } else if (type === 'lucky') {
    if (r < 20) rarity = 'comun';
    else if (r < 40) rarity = 'epico';
    else if (r < 60) rarity = 'raro';
    else if (r < 80) rarity = 'mitico';
    else if (r < 92) rarity = 'legendario';
    else if (r < 98) rarity = 'newgen';
    else rarity = 'master';
  } else if (type === 'master') {
    if (r < 10) rarity = 'epico';
    else if (r < 25) rarity = 'raro';
    else if (r < 50) rarity = 'mitico';
    else if (r < 75) rarity = 'legendario';
    else if (r < 95) rarity = 'newgen';
    else rarity = 'master';
  }
  
  return rarity;
}

async function spinAnimation(img) {
  return new Promise(resolve => {
    const frames = ['bachira', 'isagi', 'rin', 'barou', 'reo', 'nagi', 'shidou'];
    let i = 0;
    
    const interval = setInterval(() => {
      const randomChar = frames[Math.floor(Math.random() * frames.length)];
      img.src = `assets/characters/${randomChar}.png`;
      img.style.display = 'block';
      i++;
      
      if (i > 20) {
        clearInterval(interval);
        resolve();
      }
    }, 70);
  });
}

export async function redeemCode(code, userId) {
  showLoader();
  stopCurrentAudio();
  
  try {
    if (code === 'Kuontraition') {
      await addToInventory('michael_kaiser', userId);
      await addToIndex('michael_kaiser', userId);
      playCharacterSound('michael_kaiser');
      hideLoader();
      return { success: true, message: '+2000 monedas + Kaiser' };
    }
    
    if (code === 'Sorryfortheloosingitems_Asiermiamigo') {
      const { addMoney } = await import('./inventory.js');
      await addMoney(userId, 10000);
      hideLoader();
      return { success: true, message: '+10000 monedas' };
    }
    
    hideLoader();
    return { success: false, message: 'Código inválido' };
  } catch (error) {
    hideLoader();
    throw error;
  }
}