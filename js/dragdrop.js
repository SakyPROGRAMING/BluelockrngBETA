import { addToSafe, removeFromInventory, removeFromSafe, addInventoryFromSafe } from './inventory.js';
import { updateUI, showLoader, hideLoader } from './ui.js';

export function initializeDragDrop(userId) {
  const safeZone = document.getElementById('safe');
  const invZone = document.getElementById('inventory');
  
  if (!safeZone || !invZone) {
    console.error('Safe o Inventory no encontrados');
    return;
  }
  
  // ===== DRAG OVER SAFE =====
  safeZone.ondragover = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    safeZone.style.borderColor = '#FF1493';
    safeZone.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.8)';
  };
  
  safeZone.ondragleave = (e) => {
    if (e.target === safeZone) {
      safeZone.style.borderColor = '#FFD700';
      safeZone.style.boxShadow = '';
    }
  };
  
  safeZone.ondrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    safeZone.style.borderColor = '#FFD700';
    safeZone.style.boxShadow = '';
    
    showLoader();
    try {
      const inventoryId = e.dataTransfer.getData('inventoryId');
      const characterName = e.dataTransfer.getData('characterName');
      
      if (inventoryId && characterName) {
        console.log('Moviendo a safe:', characterName, inventoryId);
        
        // Agregar a safe
        await addToSafe(characterName, userId, inventoryId);
        
        // Actualizar UI
        await updateUI(userId);
        alert('✅ Guardado en caja fuerte');
      }
    } catch (error) {
      console.error('Error al mover a safe:', error);
      alert('Error: ' + error.message);
    } finally {
      hideLoader();
    }
  };
  
  // ===== DRAG OVER INVENTORY =====
  invZone.ondragover = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    invZone.style.borderColor = '#FF1493';
    invZone.style.boxShadow = '0 0 20px rgba(65, 105, 225, 0.8)';
  };
  
  invZone.ondragleave = (e) => {
    if (e.target === invZone) {
      invZone.style.borderColor = '#4169E1';
      invZone.style.boxShadow = '';
    }
  };
  
  invZone.ondrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    invZone.style.borderColor = '#4169E1';
    invZone.style.boxShadow = '';
    
    showLoader();
    try {
      const safeId = e.dataTransfer.getData('safeId');
      const characterName = e.dataTransfer.getData('characterName');
      
      if (safeId && characterName) {
        console.log('Moviendo a inventario:', characterName, safeId);
        
        // Eliminar de safe
        await removeFromSafe(safeId);
        
        // Agregar a inventario
        await addInventoryFromSafe(characterName, userId);
        
        // Actualizar UI
        await updateUI(userId);
        alert('✅ Movido al inventario');
      }
    } catch (error) {
      console.error('Error al mover a inventario:', error);
      alert('Error: ' + error.message);
    } finally {
      hideLoader();
    }
  };
  
  // ===== INICIALIZAR DRAG EN LOS ELEMENTOS =====
  initializeCharacterDrag();
}

function initializeCharacterDrag() {
  // Cartas del inventario
  document.querySelectorAll('.char-card[data-source="inventory"]').forEach(card => {
    card.draggable = true;
    
    card.ondragstart = (e) => {
      const inventoryId = card.id.replace('char-', '');
      const characterName = card.dataset.characterName;
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('inventoryId', inventoryId);
      e.dataTransfer.setData('characterName', characterName);
      
      console.log('Arrastrando:', characterName, inventoryId);
      card.style.opacity = '0.5';
    };
    
    card.ondragend = () => {
      card.style.opacity = '1';
    };
  });
  
  // Cartas de safe
  document.querySelectorAll('.char-card[data-source="safe"]').forEach(card => {
    card.draggable = true;
    
    card.ondragstart = (e) => {
      const safeId = card.id.replace('char-', '');
      const characterName = card.dataset.characterName;
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('safeId', safeId);
      e.dataTransfer.setData('characterName', characterName);
      
      console.log('Arrastrando safe:', characterName, safeId);
      card.style.opacity = '0.5';
    };
    
    card.ondragend = () => {
      card.style.opacity = '1';
    };
  });
}