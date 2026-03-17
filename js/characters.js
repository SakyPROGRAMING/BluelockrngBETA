export const characters = {
  comun: ["aiku", "bachira", "barou", "chigiri", "gagamaru", "hiori"],
  epico: ["karasu", "reo"],
  raro: ["nagi", "shidou"],
  mitico: ["nel_bachira", "nel_barou", "nel_isagi", "nel_nagi", "nel_reo", "nel_rin"],
  legendario: ["isagi", "rin", "sae"],
  newgen: ["michael_kaiser", "ness", "kaiser_ness"],
  master: ["loki", "lavinho", "lavinho_master"],
  special: ["kuon", "kid_bachira", "kid_rin", "kid_sae", "jimpachi_ego", "don_lorenzo", "don_lorenzo_poor_edition"]
};

export const characterRarities = {};
Object.keys(characters).forEach(rarity => {
  characters[rarity].forEach(char => {
    characterRarities[char] = rarity;
  });
});

export const soundMap = {
  // COMUN - tienen sonido
  "aiku": "anri.mp3",
  "bachira": "bachira.mp3",
  "barou": "exclusivos.mp3",
  "chigiri": "chigiri.mp3",
  "gagamaru": "gagamaru.mp3",
  "hiori": "exclusivos.mp3",
  
  // EPICO
  "karasu": "chamaleon_Defense.mp3",
  "reo": "chamaleon_Defense.mp3",
  
  // RARO
  "nagi": "nagi.mp3",
  "shidou": "shidou.mp3",
  
  // MITICO
  "nel_bachira": "bachira.mp3",
  "nel_barou": "exclusivos.mp3",
  "nel_isagi": "isagi.mp3",
  "nel_nagi": "nagi.mp3",
  "nel_reo": "chamaleon_Defense.mp3",
  "nel_rin": "rin.mp3",
  
  // LEGENDARIO
  "isagi": "isagi.mp3",
  "rin": "rin.mp3",
  "sae": "sae.mp3",
  
  // NEWGEN (Kaiser NO tiene sonido)
  "michael_kaiser": null,
  "ness": "exclusivos.mp3",
  "kaiser_ness": null,
  
  // MASTER
  "loki": "loki.mp3",
  "lavinho": "lavinho.mp3",
  "lavinho_master": "lavinho.mp3",
  
  // SPECIAL
  "kuon": "kuon.mp3",
  "kid_bachira": "bachira.mp3",
  "kid_rin": "rin.mp3",
  "kid_sae": "sae.mp3",
  "jimpachi_ego": "exclusivos.mp3",
  "don_lorenzo": "donlorenzo.mp3",
  "don_lorenzo_poor_edition": "donlorenzo.mp3"
};

export const sellPrice = {
  comun: 50,
  epico: 150,
  raro: 300,
  mitico: 600,
  legendario: 1200,
  newgen: 2500,
  master: 5000,
  special: 10000
};