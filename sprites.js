// ============================================
// Sprite Generator - Pixel Art Definitions
// ============================================

const SPRITES = {
  // Character sprites (16x16 pixel art as 2D arrays)
  // 0 = transparent, other numbers = color palette index
  
  characters: {
    hero: {
      down: [
        "....4444....",
        "...444444...",
        "..44444444..",
        "..4F4FF4F4..",
        "..44FFFF44..",
        "..44F00F44..",
        "...4FFFF4...",
        "....6666....",
        "...666666...",
        "..66622666..",
        "..66622666..",
        "..66666666..",
        "...66..66...",
        "..666..666..",
        "..555..555..",
        "..555..555.."
      ],
      up: [
        "....4444....",
        "...444444...",
        "..44444444..",
        "..44444444..",
        "..44444444..",
        "..44444444..",
        "...444444...",
        "....6666....",
        "...666666...",
        "..66622666..",
        "..66622666..",
        "..66666666..",
        "...66..66...",
        "..666..666..",
        "..555..555..",
        "..555..555.."
      ],
      left: [
        "....4444....",
        "...444444...",
        "..44444444..",
        "..4F44F444..",
        "..4FFF4444..",
        "..4F0F4444..",
        "...4FFF4....",
        "....6666....",
        "...666666...",
        "..66226666..",
        "..66226666..",
        "..66666666..",
        "...66..66...",
        "..666..666..",
        "..555..555..",
        "..555..555.."
      ],
      right: [
        "....4444....",
        "...444444...",
        "..44444444..",
        "..444F44F4..",
        "..4444FFF4..",
        "..4444F0F4..",
        "...4FFF4....",
        "....6666....",
        "...666666...",
        "..66666226..",
        "..66666226..",
        "..66666666..",
        "...66..66...",
        "..666..666..",
        "..555..555..",
        "..555..555.."
      ]
    },
    
    king: {
      down: [
        "...EEEEEE...",
        "..E7E77E7E..",
        "..EEEEEEEE..",
        "...EEEEEE...",
        "..EF4FF4FE..",
        "..E44FF44E..",
        "..E4F00F4E..",
        "...EFFFFE...",
        "....9999....",
        "...999999...",
        "..99999999..",
        "..99999999..",
        "..99999999..",
        "...99..99...",
        "..999..999..",
        "..555..555.."
      ]
    },
    
    princess: {
      down: [
        "....EEEE....",
        "...E7EE7E...",
        "..EEEEEEEE..",
        "..EAAAAAAE..",
        "..AFAFFAFA..",
        "..AAFFFFAA..",
        "..AAF00FAA..",
        "...AFFFFA...",
        "....CCCC....",
        "...CCCCCC...",
        "..CCCCCCCC..",
        "..CCCCCCCC..",
        "..CCCCCCCC..",
        "..CCCCCCCC..",
        "...CCCCCC...",
        "....FFFF...."
      ]
    },
    
    villager: {
      down: [
        "............",
        "....5555....",
        "...555555...",
        "..55555555..",
        "..5F5FF5F5..",
        "..55FFFF55..",
        "..55F00F55..",
        "...5FFFF5...",
        "....8888....",
        "...888888...",
        "..88888888..",
        "..88888888..",
        "..88888888..",
        "...88..88...",
        "..555..555..",
        "..555..555.."
      ]
    }
  },
  
  enemies: {
    slime: [
      "................",
      "................",
      "................",
      "................",
      "......3333......",
      "....33333333....",
      "...3333333333...",
      "..333F3333F333..",
      "..33303333033 3..",
      "..333333333333..",
      ".33333333333333.",
      ".33333FFFF33333.",
      ".33333333333333.",
      "..333333333333..",
      "...3333333333...",
      "................"
    ],
    
    goblin: [
      "................",
      "....33333333....",
      "...3333333333...",
      "..33F333333F33..",
      "..3303333330 33..",
      "..333333333333..",
      "..33333FF33333..",
      "...333333333 3...",
      "....88888888....",
      "...8888888888...",
      "..888888888888..",
      "..888822228888..",
      "...8888888888...",
      "....88....88....",
      "...888....888...",
      "...555....555..."
    ],
    
    dark_knight: [
      ".....111111.....",
      "....11111111....",
      "...1111111111...",
      "..111F1111F111..",
      "..111011110111..",
      "..111111111111..",
      "..1111FFFF1111..",
      "...1111111111...",
      "....22222222....",
      "...2222222222...",
      "..222222222222..",
      "..221111112222..",
      "..222222222222..",
      "...2222222222...",
      "..2222....2222..",
      "..1111....1111.."
    ]
  },
  
  tiles: {
    grass: {
      base: '3',
      pattern: [
        "3333333333333333",
        "3323333333333333",
        "3333333332333333",
        "3333333333333333",
        "3333323333333333",
        "3333333333333233",
        "3333333333333333",
        "3333333333333333",
        "3332333333333333",
        "3333333333323333",
        "3333333333333333",
        "3333333333333333",
        "3333333333333333",
        "3233333333333333",
        "3333333233333333",
        "3333333333333333"
      ]
    },
    
    wall: {
      base: '5',
      pattern: [
        "5555555555555555",
        "5666566656665666",
        "5666566656665666",
        "5555555555555555",
        "6655566555655565",
        "6655566555655565",
        "5555555555555555",
        "5666566656665666",
        "5666566656665666",
        "5555555555555555",
        "6655566555655565",
        "6655566555655565",
        "5555555555555555",
        "5666566656665666",
        "5666566656665666",
        "5555555555555555"
      ]
    },
    
    floor: {
      base: '8',
      pattern: [
        "8888888888888888",
        "8888888888888888",
        "8888888888888888",
        "8877888888888887",
        "8888888888888888",
        "8888888888888888",
        "8888888888888888",
        "8888878888878888",
        "8888888888888888",
        "8888888888888888",
        "8888888888888888",
        "8788888888888888",
        "8888888888888878",
        "8888888888888888",
        "8888888888888888",
        "8888888888888888"
      ]
    },
    
    stone: {
      base: '7',
      pattern: [
        "7777777777777777",
        "7666766676667666",
        "7666766676667666",
        "7777777777777777",
        "6677766777677767",
        "6677766777677767",
        "7777777777777777",
        "7666766676667666",
        "7666766676667666",
        "7777777777777777",
        "6677766777677767",
        "6677766777677767",
        "7777777777777777",
        "7666766676667666",
        "7666766676667666",
        "7777777777777777"
      ]
    },
    
    tower_floor: {
      base: '1',
      pattern: [
        "1111111111111111",
        "1222122212221222",
        "1222122212221222",
        "1111111111111111",
        "2211122111211121",
        "2211122111211121",
        "1111111111111111",
        "1222122212221222",
        "1222122212221222",
        "1111111111111111",
        "2211122111211121",
        "2211122111211121",
        "1111111111111111",
        "1222122212221222",
        "1222122212221222",
        "1111111111111111"
      ]
    },
    
    chest: [
      "................",
      "................",
      "................",
      "................",
      "..EEEEEEEEEEEE..",
      "..E7777777777E..",
      "..EEEEEEEEEEEE..",
      "..EEEEEEEEEEEE..",
      "..E5555555555E..",
      "..E5555E55555E..",
      "..E5555E55555E..",
      "..E5555555555E..",
      "..EEEEEEEEEEEE..",
      "................",
      "................",
      "................"
    ],
    
    chest_open: [
      "..EEEEEEEEEEEE..",
      "..E7777777777E..",
      "..E7777777777E..",
      "..EEEEEEEEEEEE..",
      "..EEEEEEEEEEEE..",
      "..E5555555555E..",
      "..E5555555555E..",
      "..E5555555555E..",
      "..E5555555555E..",
      "..E5555555555E..",
      "..E5555555555E..",
      "..E5555555555E..",
      "..EEEEEEEEEEEE..",
      "................",
      "................",
      "................"
    ],
    
    door: [
      "5555555555555555",
      "5666666666666665",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5688888E88888865",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5688888888888865",
      "5666666666666665",
      "5555555555555555"
    ],
    
    exit_arrow: [
      "................",
      "................",
      "................",
      "......EE........",
      ".....EEE........",
      "....EEEE........",
      "...EEEEEEEEEEE..",
      "..EEEEEEEEEEEE..",
      "..EEEEEEEEEEEE..",
      "...EEEEEEEEEEE..",
      "....EEEE........",
      ".....EEE........",
      "......EE........",
      "................",
      "................",
      "................"
    ]
  },
  
  // Color palette
  palette: {
    '0': '#000000', // Black
    '1': '#2c2137', // Dark purple
    '2': '#764462', // Purple
    '3': '#4b8056', // Green (grass)
    '4': '#e8b749', // Yellow/Gold (hero hair)
    '5': '#8b6b4a', // Brown
    '6': '#c4a35a', // Tan/beige
    '7': '#a8a8a8', // Light gray
    '8': '#6b5344', // Dark brown
    '9': '#9b2335', // Red (king robe)
    'A': '#e85d9c', // Pink (princess hair)
    'B': '#5b8fc9', // Blue
    'C': '#d17ac1', // Light pink (princess dress)
    'D': '#52c33f', // Bright green
    'E': '#ffe478', // Gold/Yellow
    'F': '#ffccaa', // Skin tone
    '.': 'transparent'
  }
};

// Sprite rendering class
class SpriteRenderer {
  constructor(palette = SPRITES.palette) {
    this.palette = palette;
    this.cache = new Map();
  }
  
  // Create canvas from pixel art string array
  createSprite(pixelData, scale = 1) {
    const cacheKey = JSON.stringify(pixelData) + scale;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const height = pixelData.length;
    const width = pixelData[0].length;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = false;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const colorKey = pixelData[y][x];
        const color = this.palette[colorKey];
        
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    
    this.cache.set(cacheKey, canvas);
    return canvas;
  }
  
  // Create a character sprite
  getCharacterSprite(charKey, direction = 'down', scale = 1) {
    const charData = SPRITES.characters[charKey];
    if (!charData) return null;
    
    const frameData = charData[direction] || charData.down || charData;
    return this.createSprite(frameData, scale);
  }
  
  // Create an enemy sprite
  getEnemySprite(enemyKey, scale = 1) {
    const enemyData = SPRITES.enemies[enemyKey];
    if (!enemyData) return null;
    
    return this.createSprite(enemyData, scale);
  }
  
  // Create a tile sprite
  getTileSprite(tileKey, scale = 1) {
    const tileData = SPRITES.tiles[tileKey];
    if (!tileData) return null;
    
    if (tileData.pattern) {
      return this.createSprite(tileData.pattern, scale);
    }
    return this.createSprite(tileData, scale);
  }
  
  // Generate a map background
  generateMapBackground(mapData, tileSize = 16) {
    const { w, h } = mapData.size;
    const canvas = document.createElement('canvas');
    canvas.width = w * tileSize;
    canvas.height = h * tileSize;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = false;
    
    // Determine tileset based on map type
    let floorTile, wallTile;
    switch(mapData.tileData) {
      case 'village':
        floorTile = this.getTileSprite('grass');
        wallTile = this.getTileSprite('wall');
        break;
      case 'castle_outside':
        floorTile = this.getTileSprite('stone');
        wallTile = this.getTileSprite('wall');
        break;
      case 'castle_inside':
        floorTile = this.getTileSprite('floor');
        wallTile = this.getTileSprite('wall');
        break;
      case 'castle_tower':
        floorTile = this.getTileSprite('tower_floor');
        wallTile = this.getTileSprite('wall');
        break;
      default:
        floorTile = this.getTileSprite('grass');
        wallTile = this.getTileSprite('wall');
    }
    
    // Draw tiles
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const collision = mapData.collision[y]?.[x] || 0;
        const tile = collision === 1 ? wallTile : floorTile;
        
        if (tile) {
          ctx.drawImage(tile, x * tileSize, y * tileSize);
        }
      }
    }
    
    return canvas;
  }
}

// Export
window.SpriteRenderer = SpriteRenderer;
window.SPRITES = SPRITES;

