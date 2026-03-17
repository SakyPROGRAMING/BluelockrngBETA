import { onAuthStateChange, login, signup, logout } from './auth.js';
import { spin, redeemCode } from './game.js';
import { updateUI, showLoader, hideLoader } from './ui.js';
import { setVolume, getVolume } from './sounds.js';
import { sellAllInventory } from './inventory.js';
import { getNotifications, subscribeToNotifications, markAsRead } from './notifications.js';

let currentUser = null;
let notificationSubscription = null;

window.addEventListener('DOMContentLoaded', async () => {
  const timeout = setTimeout(() => {
    console.error('Timeout en carga');
    hideLoader();
  }, 15000);

  try {
    onAuthStateChange(async (event, user) => {
      clearTimeout(timeout);
      
      if (user) {
        currentUser = user;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        
        try {
          await updateUI(user.id);
          await loadNotifications(user.id);
          
          if (notificationSubscription) notificationSubscription.unsubscribe();
          notificationSubscription = await subscribeToNotifications(user.id, (newNotification) => {
            loadNotifications(user.id);
          });
        } catch (error) {
          console.error('Error cargando datos:', error);
        }
        
        hideLoader();
      } else {
        currentUser = null;
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('game').style.display = 'none';
        if (notificationSubscription) notificationSubscription.unsubscribe();
        hideLoader();
      }
    });
  } catch (error) {
    console.error('Error en DOMContentLoaded:', error);
    hideLoader();
  }
  
  // ===== LOGIN =====
  document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    
    if (!email || !password) {
      alert('Completa todos los campos');
      return;
    }
    
    showLoader();
    try {
      await login(email, password);
      document.getElementById('email-input').value = '';
      document.getElementById('password-input').value = '';
    } catch (error) {
      hideLoader();
      alert('Error: ' + error.message);
    }
  };
  
  // ===== SIGNUP =====
  document.getElementById('signup-btn').onclick = async () => {
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    
    if (!email || !password) {
      alert('Completa todos los campos');
      return;
    }
    
    if (password.length < 6) {
      alert('Mínimo 6 caracteres');
      return;
    }
    
    showLoader();
    try {
      await signup(email, password);
      hideLoader();
      alert('¡Cuenta creada! Inicia sesión.');
      document.getElementById('email-input').value = '';
      document.getElementById('password-input').value = '';
    } catch (error) {
      hideLoader();
      alert('Error: ' + error.message);
    }
  };
  
  // ===== LOGOUT =====
  document.getElementById('logout-btn').onclick = async () => {
    if (confirm('¿Salir del juego?')) {
      showLoader();
      try {
        await logout();
      } catch (error) {
        hideLoader();
        alert('Error: ' + error.message);
      }
    }
  };
  
  // ===== SPINS =====
  document.getElementById('spin-normal').onclick = async () => {
    if (currentUser) await spin('normal', currentUser.id);
  };
  
  document.getElementById('spin-lucky').onclick = async () => {
    if (currentUser) await spin('lucky', currentUser.id);
  };
  
  document.getElementById('spin-master').onclick = async () => {
    if (currentUser) await spin('master', currentUser.id);
  };
  
  document.getElementById('spin-kuon').onclick = async () => {
    if (currentUser) await spin('kuon', currentUser.id);
  };
  
  // ===== SELL ALL =====
  document.getElementById('sell-all-btn').onclick = async () => {
    if (!currentUser) return;
    
    if (confirm('¿Vender TODO?')) {
      showLoader();
      try {
        const totalMoney = await sellAllInventory(currentUser.id);
        alert(`¡Vendido! +${totalMoney} monedas`);
        await updateUI(currentUser.id);
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        hideLoader();
      }
    }
  };
  
  // ===== TRADE =====
  // ===== TRADE =====
const tradeBtn = document.getElementById('trade-btn');
if (tradeBtn) {
  tradeBtn.onclick = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión');
      return;
    }
    
    showLoader();
    try {
      const { openTradeModal } = await import('./trade-ui.js');
      hideLoader();
      openTradeModal(currentUser.id);
    } catch (error) {
      hideLoader();
      console.error('Error al abrir modal de trade:', error);
      alert('Error al abrir modal: ' + error.message);
    }
  };
}
  
  // ===== RESET =====
  document.getElementById('reset-btn').onclick = async () => {
    if (confirm('⚠️ ¿REINICIAR? Se perderán TODOS los datos.')) {
      if (confirm('¿ESTÁS SEGURO?')) {
        alert('Función en desarrollo');
      }
    }
  };
  
  // ===== CÓDIGO =====
  document.getElementById('codigo-btn').onclick = async () => {
    if (!currentUser) return;
    
    const code = document.getElementById('codigo-input').value.trim();
    if (!code) {
      alert('Ingresa un código');
      return;
    }
    
    showLoader();
    try {
      const result = await redeemCode(code, currentUser.id);
      if (result.success) {
        alert('✅ ' + result.message);
        document.getElementById('codigo-input').value = '';
        await updateUI(currentUser.id);
      } else {
        hideLoader();
        alert('❌ ' + result.message);
      }
    } catch (error) {
      hideLoader();
      alert('Error: ' + error.message);
    }
  };
  
  // ===== VOLUMEN =====
  document.getElementById('vol-up').onclick = () => {
    const newVol = setVolume(getVolume() + 0.1);
    alert(`🔊 ${Math.round(newVol * 100)}%`);
  };
  
  document.getElementById('vol-down').onclick = () => {
    const newVol = setVolume(getVolume() - 0.1);
    alert(`🔉 ${Math.round(newVol * 100)}%`);
  };
  
  // ===== NOTIFICACIONES =====
  document.getElementById('notifications-btn').onclick = async () => {
    if (currentUser) {
      document.getElementById('notifications-panel').style.display = 
        document.getElementById('notifications-panel').style.display === 'none' ? 'block' : 'none';
      await loadNotifications(currentUser.id);
    }
  };
});

async function loadNotifications(userId) {
  try {
    const notifications = await getNotifications(userId);
    const panel = document.getElementById('notifications-list');
    panel.innerHTML = '';
    
    if (notifications.length === 0) {
      panel.innerHTML = '<p style="color: #888;">Sin notificaciones</p>';
      return;
    }
    
    notifications.forEach(notif => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 10px; border-bottom: 1px solid #4169E1; cursor: pointer;';
      div.innerHTML = `
        <small style="color: #FFD700;">${notif.type}</small>
        <p>${notif.message}</p>
        <small style="color: #888;">${new Date(notif.created_at).toLocaleTimeString()}</small>
      `;
      div.onclick = async () => {
        await markAsRead(notif.id);
        await loadNotifications(userId);
      };
      panel.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  }
}