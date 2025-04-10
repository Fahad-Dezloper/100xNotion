
const adjectives = [
    'acoustic', 'ancient', 'autumn', 'bold', 'brave', 'bright', 'cosmic', 'crimson',
    'crystal', 'divine', 'electric', 'elegant', 'emerald', 'epic', 'fierce'
  ];
  
  const dinosaurs = [
    'raptor', 'rex', 'ozraraptor', 'velociraptor', 'spinosaurus', 'triceratops',
    'brachiosaurus', 'stegosaurus', 'pterodactyl', 'archaeopteryx'
  ];
  
  export function generateRoomName(): string {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const dinosaur = dinosaurs[Math.floor(Math.random() * dinosaurs.length)];
    const number = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${adjective}-${dinosaur}-${number}`;
  }