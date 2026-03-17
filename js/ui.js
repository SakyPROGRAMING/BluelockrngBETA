import { getMoney, getInventory, getSafe, getIndex, removeFromInventory, removeFromSafe, sellCharacter, addInventoryFromSafe } from './inventory.js';
import { characterRarities } from './characters.js';
import { initializeDragDrop } from './dragdrop.js';

let isLoading = false;

export function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
    isLoading = true;
  }
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
    isLoading = false;
  }
}

export async function updateUI(userId) {
  try {
    const money = await getMoney(userId);
    const inventory = await getInventory(userId);
    const safe = await getSafe(userId);
    const index = await getIndex(userId);
    
    document.getElementById('money-display').innerText = money.toLocaleString();
    
    // ===== INVENTARIO =====
    const invDiv = document.getElementById('inventory');
    invDiv.innerHTML = '<h3>📦 Inventario</h3>';
    
    if (inventory.length === 0) {
      invDiv.innerHTML += '<p style="color: #888;">Vacío</p>';
    }
    
    inventory.forEach(item => {
      const card = createCharacterCard(item.character_name, item.id, 'inventory', userId);
      card.style.cursor = 'pointer';
      
      // Click para vender
      card.onclick = async () => {
        showLoader();
        try {
          const price = await sellCharacter(item.id, item.character_name, userId);
          alert(`¡Vendido por ${price} monedas!`);
          await updateUI(userId);
        } catch (error) {
          alert('Error al vender: ' + error.message);
        } finally {
          hideLoader();
        }
      };
      
      applyRarityGlow(card, item.character_name);
      invDiv.appendChild(card);
    });
    
    // ===== CAJA FUERTE =====
    const safeDiv = document.getElementById('safe');
    safeDiv.innerHTML = '<h3>🏦 Caja Fuerte</h3>';
    
    if (safe.length === 0) {
      safeDiv.innerHTML += '<p style="color: #888;">Vacía</p>';
    }
    
    safe.forEach(item => {
      const card = createCharacterCard(item.character_name, item.id, 'safe', userId);
      card.style.cursor = 'grab';
      
      // Click para mover a inventario
      card.onclick = async () => {
        showLoader();
        try {
          await removeFromSafe(item.id);
          await addInventoryFromSafe(item.character_name, userId);
          alert('Movido a inventario');
          await updateUI(userId);
        } catch (error) {
          alert('Error: ' + error.message);
        } finally {
          hideLoader();
        }
      };
      
      applyRarityGlow(card, item.character_name);
      safeDiv.appendChild(card);
    });
    
    // ===== ÍNDICE =====
    const indexDiv = document.getElementById('index-list');
    indexDiv.innerHTML = '';
    
    if (index.length === 0) {
      document.getElementById('index').innerHTML = '<h3>📖 Índice (Vacío)</h3>';
    } else {
      index.forEach(item => {
        const card = createCharacterCard(item.character_name, item.id, 'index', userId);
        applyRarityGlow(card, item.character_name);
        indexDiv.appendChild(card);
      });
    }
    
    // Reinicializar drag & drop
    initializeDragDrop(userId);
    
  } catch (error) {
    console.error('Error al actualizar UI:', error);
  }
}

function createCharacterCard(characterName, id, source, userId) {
  const div = document.createElement('div');
  div.className = 'char-card';
  div.id = `char-${id}`;
  div.dataset.characterName = characterName;
  div.dataset.source = source;
  div.dataset.userId = userId;
  div.draggable = true;
  
  div.innerHTML = `<img src="assets/characters/${characterName}.png" alt="${characterName}" loading="lazy">
    <small>${characterName}</small>`;
  
  return div;
}

function applyRarityGlow(element, characterName) {
  const rarity = characterRarities[characterName];
  const glowMap = {
    comun: '#888888',
    epico: '#4169E1',
    raro: '#32CD32',
    mitico: '#FF8C00',
    legendario: '#FFD700',
    newgen: '#FF1493',
    master: '#FFD700',
    special: '#FF1493'
  };
  
  const color = glowMap[rarity] || '#888888';
  element.style.boxShadow = `0 0 15px ${color}, 0 0 30px ${color}`;
  element.style.borderColor = color;
}

export function createCharacterCardForTrading(characterName, inventoryId) {
  const div = document.createElement('div');
  div.className = 'char-card-trade';
  div.id = `trade-char-${inventoryId}`;
  div.dataset.inventoryId = inventoryId;
  div.dataset.characterName = characterName;
  
  div.innerHTML = `<img src="assets/characters/${characterName}.png" alt="${characterName}">`;
  applyRarityGlow(div, characterName);
  
  return div;
}