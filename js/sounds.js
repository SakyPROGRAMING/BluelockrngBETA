import { soundMap } from './characters.js';

let volume = 0.7;
let currentAudio = null;

export function playSound(file) {
  if (!file) return; // Ignorar si es null
  
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    const audio = new Audio(`assets/sounds/${file}`);
    audio.volume = volume;
    currentAudio = audio;
    audio.play().catch(err => console.log('Audio play blocked:', err));
  } catch (error) {
    console.log('Error playing sound:', error);
  }
}

export function playCharacterSound(characterName) {
  const sound = soundMap[characterName];
  if (sound) {
    playSound(sound);
  }
}

export function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function setVolume(newVolume) {
  volume = Math.max(0, Math.min(1, newVolume));
  if (currentAudio) {
    currentAudio.volume = volume;
  }
  return volume;
}

export function getVolume() {
  return volume;
}