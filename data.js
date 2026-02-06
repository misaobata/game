// ============================================
// Game Data - Pixel Hero: Rescue the Princess
// Enhanced Version with Town & Visible Monsters
// ============================================

const GAME_DATA = {
  meta: {
    title: "Pixel Hero: Rescue the Princess",
    version: "0.2.0",
    author: "prototype",
    starting: {
      mapId: "castle_hall",
      spawn: { x: 7, y: 10 },
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
    got_tower_key: false,
    boss_defeated: false,
    princess_rescued: false,
    talked_guard: false,
    talked_maid: false,
    got_potion_hall: false,
    got_gold_chest: false
  },

  actors: {
    hero: {
      name: "勇者",
      spriteKey: "hero",
      stats: { level: 1, hp: 30, maxHp: 30, mp: 10, maxMp: 10, atk: 6, def: 3, spd: 4, exp: 0, gold: 50 },
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

    guard: {
      name: "兵士",
      spriteKey: "guard"
    },

    maid: {
      name: "メイド",
      spriteKey: "maid"
    },

    merchant: {
      name: "商人",
      spriteKey: "merchant"
    },

    villager_a: {
      name: "村人",
      spriteKey: "villager"
    },

    villager_b: {
      name: "老人",
      spriteKey: "oldman"
    },

    cat: {
      name: "ネコ",
      spriteKey: "cat"
    }
  },

  items: {
    potion: {
      name: "ポーション",
      type: "consumable",
      desc: "HPを20回復する",
      use: { target: "ally", effects: [{ type: "healHp", value: 20 }] }
    },
    hi_potion: {
      name: "ハイポーション",
      type: "consumable", 
      desc: "HPを50回復する",
      use: { target: "ally", effects: [{ type: "healHp", value: 50 }] }
    },
    ether: {
      name: "エーテル",
      type: "consumable",
      desc: "MPを10回復する",
      use: { target: "ally", effects: [{ type: "healMp", value: 10 }] }
    },
    castle_key: {
      name: "城の鍵",
      type: "keyItem",
      desc: "城の門を開ける鍵"
    },
    tower_key: {
      name: "塔の鍵",
      type: "keyItem",
      desc: "塔の扉を開ける鍵"
    },
    gold_coin: {
      name: "金貨",
      type: "valuable",
      desc: "100Gの価値がある",
      value: 100
    }
  },

  equipment: {
    wood_sword: { name: "木の剣", slot: "weapon", mods: { atk: 2 } },
    iron_sword: { name: "鉄の剣", slot: "weapon", mods: { atk: 5 } },
    cloth_armor: { name: "布の服", slot: "armor", mods: { def: 1 } },
    leather_armor: { name: "皮の鎧", slot: "armor", mods: { def: 3 } }
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
      mapSprite: "slime_map",
      stats: { hp: 12, maxHp: 12, atk: 3, def: 1, spd: 2 },
      drops: [{ itemId: "potion", chance: 0.2, qty: 1 }],
      exp: 4,
      gold: 5,
      ai: { pattern: ["attack"] }
    },
    goblin: {
      name: "ゴブリン",
      spriteKey: "goblin",
      mapSprite: "goblin_map",
      stats: { hp: 18, maxHp: 18, atk: 5, def: 2, spd: 3 },
      drops: [{ itemId: "potion", chance: 0.15, qty: 1 }],
      exp: 7,
      gold: 12,
      ai: { pattern: ["attack", "attack", "defend"] }
    },
    bat: {
      name: "コウモリ",
      spriteKey: "bat",
      mapSprite: "bat_map",
      stats: { hp: 8, maxHp: 8, atk: 4, def: 0, spd: 5 },
      drops: [],
      exp: 3,
      gold: 3,
      ai: { pattern: ["attack"] }
    },
    skeleton: {
      name: "スケルトン",
      spriteKey: "skeleton",
      mapSprite: "skeleton_map",
      stats: { hp: 25, maxHp: 25, atk: 7, def: 3, spd: 3 },
      drops: [{ itemId: "ether", chance: 0.1, qty: 1 }],
      exp: 12,
      gold: 20,
      ai: { pattern: ["attack", "attack"] }
    },
    dark_knight: {
      name: "闇の騎士",
      spriteKey: "dark_knight",
      stats: { hp: 60, maxHp: 60, atk: 10, def: 6, spd: 4 },
      drops: [{ itemId: "tower_key", chance: 1.0, qty: 1 }],
      exp: 40,
      gold: 100,
      boss: true,
      ai: { pattern: ["attack", "attack", "powerAttack"] }
    }
  },

  maps: {
    // ===== CASTLE HALL (Starting Area) =====
    castle_hall: {
      name: "城内ホール",
      size: { w: 20, h: 14 },
      tileData: "castle_inside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "throne_room", at: { x: 9, y: 1 }, spawn: { x: 5, y: 8 } },
        { toMapId: "throne_room", at: { x: 10, y: 1 }, spawn: { x: 5, y: 8 } },
        { toMapId: "town", at: { x: 9, y: 12 }, spawn: { x: 10, y: 2 } },
        { toMapId: "town", at: { x: 10, y: 12 }, spawn: { x: 10, y: 2 } }
      ],
      events: [
        {
          id: "ev_hall_potion",
          trigger: "action",
          at: { x: 3, y: 3 },
          condition: { flag: "got_potion_hall", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "ツボを調べた…ポーションが入っていた！" },
            { type: "giveItem", itemId: "potion", qty: 1 },
            { type: "setFlag", flag: "got_potion_hall", value: true }
          ]
        },
        {
          id: "ev_guard_talk",
          trigger: "action",
          at: { x: 3, y: 7 },
          steps: [
            { type: "showDialogue", speaker: "guard", text: "城の外は危険だ。モンスターが徘徊している。" },
            { type: "showDialogue", speaker: "guard", text: "街を抜けて北の塔へ向かえ。姫はそこに囚われている。" }
          ]
        },
        {
          id: "ev_maid_talk", 
          trigger: "action",
          at: { x: 16, y: 7 },
          steps: [
            { type: "showDialogue", speaker: "maid", text: "勇者さま、お気をつけて…" },
            { type: "showDialogue", speaker: "maid", text: "このポーションをお持ちください。" },
            { type: "giveItem", itemId: "potion", qty: 1 }
          ],
          condition: { flag: "talked_maid", equals: false }
        },
        {
          id: "ev_maid_talk2",
          trigger: "action", 
          at: { x: 16, y: 7 },
          condition: { flag: "talked_maid", equals: true },
          steps: [
            { type: "showDialogue", speaker: "maid", text: "姫さまのご無事をお祈りしています…" }
          ]
        }
      ],
      npcs: [
        { actorId: "guard", pos: { x: 3, y: 7 } },
        { actorId: "maid", pos: { x: 16, y: 7 } }
      ],
      items: [
        { id: "pot1", pos: { x: 3, y: 3 }, sprite: "pot" }
      ]
    },

    // ===== THRONE ROOM =====
    throne_room: {
      name: "玉座の間",
      size: { w: 12, h: 10 },
      tileData: "throne",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,0,0,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "castle_hall", at: { x: 5, y: 9 }, spawn: { x: 9, y: 2 } },
        { toMapId: "castle_hall", at: { x: 6, y: 9 }, spawn: { x: 10, y: 2 } }
      ],
      events: [
        {
          id: "ev_king_intro",
          trigger: "action",
          at: { x: 5, y: 3 },
          condition: { flag: "met_king", equals: false },
          steps: [
            { type: "showDialogue", speaker: "king", text: "おお、勇者よ！よくぞ来てくれた！" },
            { type: "showDialogue", speaker: "king", text: "姫が闇の騎士にさらわれてしまった…" },
            { type: "showDialogue", speaker: "king", text: "北の塔に囚われているらしい。助け出してくれ！" },
            { type: "setFlag", flag: "met_king", value: true },
            { type: "showDialogue", speaker: "king", text: "街を通って北へ向かうのだ。道中、魔物に気をつけよ。" }
          ]
        },
        {
          id: "ev_king_repeat",
          trigger: "action",
          at: { x: 5, y: 3 },
          condition: { flag: "met_king", equals: true },
          steps: [
            { type: "showDialogue", speaker: "king", text: "姫を…頼んだぞ！" }
          ]
        }
      ],
      npcs: [
        { actorId: "king", pos: { x: 5, y: 3 } },
        { actorId: "guard", pos: { x: 2, y: 5 } },
        { actorId: "guard", pos: { x: 9, y: 5 } }
      ]
    },

    // ===== TOWN =====
    town: {
      name: "城下町",
      size: { w: 22, h: 18 },
      tileData: "town",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1],
        [1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1],
        [1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "castle_hall", at: { x: 9, y: 1 }, spawn: { x: 9, y: 11 } },
        { toMapId: "castle_hall", at: { x: 10, y: 1 }, spawn: { x: 10, y: 11 } },
        { toMapId: "castle_hall", at: { x: 11, y: 1 }, spawn: { x: 10, y: 11 } },
        { toMapId: "field_north", at: { x: 9, y: 17 }, spawn: { x: 8, y: 2 } },
        { toMapId: "field_north", at: { x: 10, y: 17 }, spawn: { x: 8, y: 2 } },
        { toMapId: "field_north", at: { x: 11, y: 17 }, spawn: { x: 8, y: 2 } }
      ],
      events: [
        {
          id: "ev_merchant",
          trigger: "action",
          at: { x: 5, y: 4 },
          steps: [
            { type: "showDialogue", speaker: "merchant", text: "いらっしゃい！ポーションはいかが？" },
            { type: "showDialogue", speaker: "merchant", text: "…今日は店じまいだ。また来てくれ！" }
          ]
        },
        {
          id: "ev_villager",
          trigger: "action",
          at: { x: 16, y: 6 },
          steps: [
            { type: "showDialogue", speaker: "villager_a", text: "北の道は危険だよ。モンスターがうろついてる。" },
            { type: "showDialogue", speaker: "villager_a", text: "でも塔に行くにはそこを通るしかない…" }
          ]
        },
        {
          id: "ev_oldman",
          trigger: "action",
          at: { x: 5, y: 12 },
          steps: [
            { type: "showDialogue", speaker: "villager_b", text: "わしの若い頃はのう…" },
            { type: "showDialogue", speaker: "villager_b", text: "…いや、なんでもない。頑張れよ、勇者。" }
          ]
        },
        {
          id: "ev_cat",
          trigger: "action",
          at: { x: 18, y: 11 },
          steps: [
            { type: "showDialogue", speaker: "system", text: "ニャー" }
          ]
        },
        {
          id: "ev_town_chest",
          trigger: "action",
          at: { x: 17, y: 4 },
          condition: { flag: "got_gold_chest", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "宝箱を開けた！" },
            { type: "giveItem", itemId: "hi_potion", qty: 1 },
            { type: "setFlag", flag: "got_gold_chest", value: true },
            { type: "showDialogue", speaker: "system", text: "ハイポーションを手に入れた！" }
          ]
        }
      ],
      npcs: [
        { actorId: "merchant", pos: { x: 5, y: 4 } },
        { actorId: "villager_a", pos: { x: 16, y: 6 } },
        { actorId: "villager_b", pos: { x: 5, y: 12 } },
        { actorId: "cat", pos: { x: 18, y: 11 } }
      ],
      items: [
        { id: "sparkle1", pos: { x: 12, y: 10 }, itemId: "potion", sprite: "sparkle" }
      ]
    },

    // ===== FIELD NORTH (Visible Monsters) =====
    field_north: {
      name: "北の街道",
      size: { w: 18, h: 16 },
      tileData: "field",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "town", at: { x: 7, y: 1 }, spawn: { x: 10, y: 16 } },
        { toMapId: "town", at: { x: 8, y: 1 }, spawn: { x: 10, y: 16 } },
        { toMapId: "town", at: { x: 9, y: 1 }, spawn: { x: 10, y: 16 } },
        { toMapId: "tower_entrance", at: { x: 7, y: 14 }, spawn: { x: 6, y: 2 } },
        { toMapId: "tower_entrance", at: { x: 8, y: 14 }, spawn: { x: 6, y: 2 } },
        { toMapId: "tower_entrance", at: { x: 9, y: 14 }, spawn: { x: 6, y: 2 } }
      ],
      events: [],
      npcs: [],
      monsters: [
        { enemyId: "slime", pos: { x: 4, y: 3 }, movePattern: "wander" },
        { enemyId: "slime", pos: { x: 13, y: 6 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 10, y: 8 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 5, y: 11 }, movePattern: "wander" },
        { enemyId: "bat", pos: { x: 14, y: 12 }, movePattern: "wander" }
      ],
      items: [
        { id: "field_potion", pos: { x: 3, y: 7 }, itemId: "potion", sprite: "sparkle" },
        { id: "field_ether", pos: { x: 15, y: 3 }, itemId: "ether", sprite: "sparkle" }
      ]
    },

    // ===== TOWER ENTRANCE =====
    tower_entrance: {
      name: "塔の入口",
      size: { w: 14, h: 10 },
      tileData: "tower_outside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,1,1,0,0,1,1,0,0,1,1],
        [1,1,0,0,1,1,0,0,1,1,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "field_north", at: { x: 6, y: 8 }, spawn: { x: 8, y: 13 } },
        { toMapId: "field_north", at: { x: 7, y: 8 }, spawn: { x: 8, y: 13 } },
        { toMapId: "castle_tower", at: { x: 6, y: 1 }, spawn: { x: 5, y: 6 }, condition: { flag: "got_tower_key", equals: true } },
        { toMapId: "castle_tower", at: { x: 7, y: 1 }, spawn: { x: 5, y: 6 }, condition: { flag: "got_tower_key", equals: true } }
      ],
      events: [
        {
          id: "ev_tower_locked",
          trigger: "action",
          at: { x: 6, y: 2 },
          condition: { flag: "got_tower_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "塔の扉は固く閉ざされている…" },
            { type: "showDialogue", speaker: "system", text: "鍵が必要なようだ。" }
          ]
        }
      ],
      npcs: [],
      monsters: [
        { enemyId: "skeleton", pos: { x: 4, y: 5 }, movePattern: "patrol" },
        { enemyId: "skeleton", pos: { x: 10, y: 5 }, movePattern: "patrol" }
      ]
    },

    // ===== CASTLE TOWER =====
    castle_tower: {
      name: "闇の塔",
      size: { w: 12, h: 10 },
      tileData: "tower_inside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,0,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "tower_entrance", at: { x: 5, y: 7 }, spawn: { x: 6, y: 2 } },
        { toMapId: "tower_entrance", at: { x: 6, y: 7 }, spawn: { x: 7, y: 2 } }
      ],
      events: [
        {
          id: "ev_boss_fight",
          trigger: "touch",
          at: { x: 5, y: 3 },
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
            { type: "showDialogue", speaker: "princess", text: "あなたのおかげで、やっと自由になれたわ…" },
            { type: "setFlag", flag: "princess_rescued", value: true },
            { type: "endGame", endingId: "good_end" }
          ]
        }
      ],
      npcs: [
        { actorId: "princess", pos: { x: 5, y: 2 }, condition: { flag: "boss_defeated", equals: true } }
      ],
      monsters: []
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
