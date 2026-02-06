// ============================================
// Game Data - Pixel Hero: Rescue the Princess
// ============================================

const GAME_DATA = {
  meta: {
    title: "Pixel Hero: Rescue the Princess",
    version: "0.1.0",
    author: "prototype",
    starting: {
      mapId: "village_01",
      spawn: { x: 6, y: 10 },
      party: ["hero"]
    }
  },

  constants: {
    tileSize: 16,
    directions: ["up", "right", "down", "left"],
    directionVectors: {
      up: { x: 0, y: -1 },
      right: { x: 1, y: 0 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }
    }
  },

  flags: {
    met_king: false,
    got_castle_key: false,
    boss_defeated: false,
    princess_rescued: false
  },

  actors: {
    hero: {
      name: "勇者",
      spriteKey: "hero",
      stats: { level: 1, hp: 30, maxHp: 30, mp: 10, maxMp: 10, atk: 6, def: 3, spd: 4, exp: 0 },
      equipment: { weapon: "wood_sword", armor: "cloth_armor" },
      skills: ["slash"],
      inventory: [{ itemId: "potion", qty: 2 }]
    },

    princess: {
      name: "姫",
      spriteKey: "princess"
    },

    king: {
      name: "王",
      spriteKey: "king"
    },

    villager_a: {
      name: "村人",
      spriteKey: "villager"
    }
  },

  items: {
    potion: {
      name: "ポーション",
      type: "consumable",
      desc: "HPを20回復する",
      use: { target: "ally", effects: [{ type: "healHp", value: 20 }] }
    },
    castle_key: {
      name: "城の鍵",
      type: "keyItem",
      desc: "城の門を開ける鍵"
    }
  },

  equipment: {
    wood_sword: { name: "木の剣", slot: "weapon", mods: { atk: 2 } },
    cloth_armor: { name: "布の服", slot: "armor", mods: { def: 1 } }
  },

  skills: {
    slash: {
      name: "斬りつけ",
      cost: { mp: 0 },
      target: "enemy",
      effects: [{ type: "damage", formula: "atk*1.2 - def*0.6", min: 1 }]
    }
  },

  enemies: {
    slime: {
      name: "スライム",
      spriteKey: "slime",
      stats: { hp: 12, maxHp: 12, atk: 3, def: 1, spd: 2 },
      drops: [{ itemId: "potion", chance: 0.2, qty: 1 }],
      exp: 4,
      ai: { pattern: ["attack"] }
    },
    goblin: {
      name: "ゴブリン",
      spriteKey: "goblin",
      stats: { hp: 18, maxHp: 18, atk: 5, def: 2, spd: 3 },
      drops: [{ itemId: "potion", chance: 0.15, qty: 1 }],
      exp: 7,
      ai: { pattern: ["attack", "attack", "defend"] }
    },
    dark_knight: {
      name: "闇の騎士",
      spriteKey: "dark_knight",
      stats: { hp: 60, maxHp: 60, atk: 10, def: 6, spd: 4 },
      drops: [{ itemId: "castle_key", chance: 1.0, qty: 1 }],
      exp: 40,
      boss: true,
      ai: { pattern: ["attack", "attack", "powerAttack"] }
    }
  },

  maps: {
    village_01: {
      name: "はじまりの村",
      size: { w: 16, h: 16 },
      tileData: "village",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: {
        enabled: true,
        rate: 0.08,
        table: [
          { enemyId: "slime", weight: 70, count: [1, 2] },
          { enemyId: "goblin", weight: 30, count: [1, 1] }
        ]
      },
      exits: [
        { toMapId: "castle_entrance", at: { x: 15, y: 8 }, spawn: { x: 1, y: 5 } }
      ],
      events: [
        {
          id: "ev_king_intro",
          trigger: "action",
          at: { x: 6, y: 6 },
          condition: { flag: "met_king", equals: false },
          steps: [
            { type: "showDialogue", speaker: "king", text: "勇者よ…姫が闇の騎士にさらわれた！城へ向かってくれ！" },
            { type: "setFlag", flag: "met_king", value: true },
            { type: "showDialogue", speaker: "king", text: "城の門は固い。鍵は城の中で手に入るはずだ。" }
          ]
        },
        {
          id: "ev_king_repeat",
          trigger: "action",
          at: { x: 6, y: 6 },
          condition: { flag: "met_king", equals: true },
          steps: [
            { type: "showDialogue", speaker: "king", text: "姫を…頼んだぞ…！" }
          ]
        },
        {
          id: "ev_villager_hint",
          trigger: "action",
          at: { x: 4, y: 10 },
          steps: [
            { type: "showDialogue", speaker: "villager_a", text: "草むらではモンスターが出るよ。ポーションは大事にね。" }
          ]
        }
      ],
      npcs: [
        { actorId: "king", pos: { x: 6, y: 6 } },
        { actorId: "villager_a", pos: { x: 4, y: 10 } }
      ]
    },

    castle_entrance: {
      name: "城門前",
      size: { w: 12, h: 10 },
      tileData: "castle_outside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "village_01", at: { x: 0, y: 5 }, spawn: { x: 14, y: 8 } },
        { toMapId: "castle_hall", at: { x: 11, y: 5 }, spawn: { x: 1, y: 5 }, condition: { flag: "got_castle_key", equals: true } }
      ],
      events: [
        {
          id: "ev_gate_locked",
          trigger: "action",
          at: { x: 11, y: 5 },
          condition: { flag: "got_castle_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "門は鍵がかかっている…" }
          ]
        }
      ],
      npcs: []
    },

    castle_hall: {
      name: "城内ホール",
      size: { w: 14, h: 12 },
      tileData: "castle_inside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "castle_entrance", at: { x: 0, y: 5 }, spawn: { x: 10, y: 5 } },
        { toMapId: "castle_tower", at: { x: 13, y: 2 }, spawn: { x: 1, y: 4 } }
      ],
      events: [
        {
          id: "ev_key_chest",
          trigger: "action",
          at: { x: 7, y: 9 },
          condition: { flag: "got_castle_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "宝箱を開けた！" },
            { type: "giveItem", itemId: "castle_key", qty: 1 },
            { type: "setFlag", flag: "got_castle_key", value: true },
            { type: "showDialogue", speaker: "system", text: "城の鍵を手に入れた！" }
          ]
        },
        {
          id: "ev_key_chest_empty",
          trigger: "action",
          at: { x: 7, y: 9 },
          condition: { flag: "got_castle_key", equals: true },
          steps: [
            { type: "showDialogue", speaker: "system", text: "空っぽの宝箱だ。" }
          ]
        }
      ],
      npcs: []
    },

    castle_tower: {
      name: "城の塔（最上階）",
      size: { w: 10, h: 8 },
      tileData: "castle_tower",
      collision: [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "castle_hall", at: { x: 0, y: 4 }, spawn: { x: 12, y: 2 } }
      ],
      events: [
        {
          id: "ev_boss_fight",
          trigger: "touch",
          at: { x: 7, y: 3 },
          condition: { flag: "boss_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "闇の騎士が立ちふさがった！" },
            { type: "startBattle", battleId: "boss_dark_knight" }
          ]
        },
        {
          id: "ev_after_boss",
          trigger: "auto",
          condition: { flag: "boss_defeated", equals: true, flag2: "princess_rescued", equals2: false },
          steps: [
            { type: "showDialogue", speaker: "princess", text: "ありがとう…助けに来てくれたのね。" },
            { type: "setFlag", flag: "princess_rescued", value: true },
            { type: "endGame", endingId: "good_end" }
          ]
        }
      ],
      npcs: [
        { actorId: "princess", pos: { x: 8, y: 3 }, condition: { flag: "boss_defeated", equals: true } }
      ]
    }
  },

  battles: {
    boss_dark_knight: {
      name: "闇の騎士",
      enemies: [{ enemyId: "dark_knight", qty: 1 }],
      victory: [
        { type: "showDialogue", speaker: "system", text: "闇の騎士を倒した！" },
        { type: "setFlag", flag: "boss_defeated", value: true }
      ],
      defeat: [
        { type: "showDialogue", speaker: "system", text: "勇者は倒れた…" },
        { type: "gameOver" }
      ]
    }
  },

  endings: {
    good_end: {
      title: "姫救出エンド",
      text: "勇者は姫を救い、国に光が戻った。\n\n平和が訪れた王国で、勇者と姫は末永く幸せに暮らしました。\n\n〜 FIN 〜"
    }
  }
};

// Freeze the data to prevent accidental modifications
Object.freeze(GAME_DATA.constants);
Object.freeze(GAME_DATA.items);
Object.freeze(GAME_DATA.equipment);
Object.freeze(GAME_DATA.skills);
Object.freeze(GAME_DATA.enemies);
Object.freeze(GAME_DATA.endings);

