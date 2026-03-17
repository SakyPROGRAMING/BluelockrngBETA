import { initiateTrade, getPendingTrades, acceptTrade, declineTrade } from './trading.js';
import { getInventory } from './inventory.js';
import { showLoader, hideLoader, updateUI } from './ui.js';
import { characterRarities } from './characters.js';

export function openTradeModal(userId) {
  const modal = document.getElementById('trade-modal');
  if (!modal) {
    console.error('Modal de tradeo no encontrado');
    return;
  }
  
  modal.style.display = 'flex';
  loadTradeUI(userId);
}

export function closeTradeModal() {
  const modal = document.getElementById('trade-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function loadTradeUI(userId) {
  showLoader();
  
  try {
    const inventory = await getInventory(userId);
    
    // Mostrar inventario para seleccionar
    const invList = document.getElementById('trade-inventory-list');
    if (!invList) {
      hideLoader();
      console.error('trade-inventory-list no encontrado');
      return;
    }
    
    invList.innerHTML = '';
    
    if (inventory.length === 0) {
      invList.innerHTML = '<p style="color: #888;">Inventario vacío</p>';
    } else {
      inventory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'trade-char-item';
        div.innerHTML = `
          <img src="assets/characters/${item.character_name}.png" alt="${item.character_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
          <small>${item.character_name}</small>
          <input type="checkbox" class="trade-checkbox" data-inventory-id="${item.id}" data-character-name="${item.character_name}">
        `;
        
        applyRarityGlow(div, item.character_name);
        invList.appendChild(div);
      });
    }
    
    // Cargar tradeos pendientes
    const pendingTrades = await getPendingTrades(userId);
    const pendingList = document.getElementById('trade-pending-list');
    
    if (!pendingList) {
      hideLoader();
      console.error('trade-pending-list no encontrado');
      return;
    }
    
    pendingList.innerHTML = '';
    
    if (pendingTrades.length === 0) {
      pendingList.innerHTML = '<p style="color: #888;">Sin solicitudes pendientes</p>';
    } else {
      pendingTrades.forEach(trade => {
        const div = document.createElement('div');
        div.className = 'trade-request-item';
        div.style.cssText = 'padding: 10px; border: 1px solid #4169E1; margin: 5px 0; border-radius: 5px; background: rgba(65, 105, 225, 0.1);';
        
        const initiatorChars = Array.isArray(trade.initiator_characters) 
          ? trade.initiator_characters.join(', ') 
          : trade.initiator_characters;
        
        const receiverChars = Array.isArray(trade.receiver_characters) 
          ? trade.receiver_characters.join(', ') 
          : trade.receiver_characters;
        
        div.innerHTML = `
          <p><strong>Oferta:</strong> ${initiatorChars}</p>
          <p><strong>Solicita:</strong> ${receiverChars}</p>
          <button class="trade-accept-btn" data-trade-id="${trade.trade_id}" style="width: 48%; background: #32CD32; padding: 8px; margin: 5px 1%; border: none; border-radius: 5px; cursor: pointer; color: white; font-weight: bold;">✅ Aceptar</button>
          <button class="trade-decline-btn" data-trade-id="${trade.trade_id}" style="width: 48%; background: #FF1493; padding: 8px; margin: 5px 1%; border: none; border-radius: 5px; cursor: pointer; color: white; font-weight: bold;">❌ Rechazar</button>
        `;
        
        pendingList.appendChild(div);
      });
      
      // Eventos de aceptar/rechazar
      document.querySelectorAll('.trade-accept-btn').forEach(btn => {
        btn.onclick = async () => {
          showLoader();
          try {
            const tradeId = btn.dataset.tradeId;
            await acceptTrade(tradeId, userId, null);
            alert('✅ Tradeo aceptado');
            await updateUI(userId);
            await loadTradeUI(userId);
          } catch (error) {
            hideLoader();
            alert('Error: ' + error.message);
          }
        };
      });
      
      document.querySelectorAll('.trade-decline-btn').forEach(btn => {
        btn.onclick = async () => {
          showLoader();
          try {
            const tradeId = btn.dataset.tradeId;
            await declineTrade(tradeId);
            alert('❌ Tradeo rechazado');
            await loadTradeUI(userId);
          } catch (error) {
            hideLoader();
            alert('Error: ' + error.message);
          }
        };
      });
    }
    
    // Botón para enviar solicitud de tradeo
    const sendBtn = document.getElementById('trade-send-btn');
    if (sendBtn) {
      sendBtn.onclick = async () => {
        const selectedChars = getSelectedCharacters();
        const receiverEmail = document.getElementById('trade-receiver-email').value.trim();
        
        if (selectedChars.length === 0) {
          alert('Selecciona al menos 1 personaje para tradear');
          return;
        }
        
        if (!receiverEmail) {
          alert('Ingresa el email del jugador');
          return;
        }
        
        showLoader();
        try {
          const charNames = selectedChars.map(c => c.character);
          await initiateTrade(userId, receiverEmail, charNames, ['personaje']);
          alert('✅ Solicitud enviada');
          document.getElementById('trade-receiver-email').value = '';
          document.querySelectorAll('.trade-checkbox').forEach(cb => cb.checked = false);
        } catch (error) {
          hideLoader();
          alert('Error: ' + error.message);
        }
      };
    }
    
    hideLoader();
  } catch (error) {
    hideLoader();
    console.error('Error completo:', error);
    alert('Error al cargar UI de tradeo: ' + error.message);
  }
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

export function getSelectedCharacters() {
  const selected = [];
  document.querySelectorAll('.trade-checkbox:checked').forEach(checkbox => {
    selected.push({
      id: checkbox.dataset.inventoryId,
      character: checkbox.dataset.characterName
    });
  });
  return selected;
}