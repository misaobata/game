// ============================================
// Game Data - Pixel Hero: Rescue the Princess
// Complete Edition with Party & Quests
// ============================================

const GAME_DATA = {
  meta: {
    title: "Pixel Hero: Rescue the Princess",
    version: "1.0.0",
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
    },
    // EXP required for each level: level * 15 + (level-1)^2 * 5
    expTable: [0, 20, 50, 95, 160, 245, 350, 475, 620, 785, 970, 1175, 1400, 1645, 1910, 2195],
    maxLevel: 15
  },

  flags: {
    met_king: false,
    got_tower_key: false,
    boss_defeated: false,
    princess_rescued: false,
    talked_maid: false,
    got_potion_hall: false,
    got_town_chest: false,
    warrior_joined: false,
    mage_joined: false,
    healer_joined: false,
    quest_slimes_done: false,
    quest_goblin_done: false,
    quest_delivery_done: false,
    quest_rescue_done: false,
    miniboss_defeated: false,
    demon_lord_defeated: false
  },

  // === PARTY MEMBERS ===
  actors: {
    hero: {
      name: "勇者",
      class: "勇者",
      spriteKey: "hero",
      isRecruitable: false,
      stats: { 
        level: 1, hp: 35, maxHp: 35, mp: 12, maxMp: 12, 
        atk: 7, def: 4, spd: 5, exp: 0, gold: 100 
      },
      growths: { hp: 6, mp: 3, atk: 2, def: 2, spd: 1 },
      equipment: { weapon: "wood_sword", armor: "cloth_armor" },
      skills: ["slash", "brave_strike"],
      inventory: [{ itemId: "potion", qty: 3 }]
    },
    
    warrior: {
      name: "戦士",
      class: "戦士",
      spriteKey: "warrior",
      isRecruitable: true,
      recruitLocation: "town",
      recruitCondition: null,
      stats: { 
        level: 2, hp: 45, maxHp: 45, mp: 5, maxMp: 5, 
        atk: 9, def: 6, spd: 3, exp: 0 
      },
      growths: { hp: 8, mp: 1, atk: 3, def: 3, spd: 1 },
      equipment: { weapon: "iron_sword", armor: "leather_armor" },
      skills: ["slash", "power_strike"]
    },
    
    mage: {
      name: "魔法使い",
      class: "魔法使い",
      spriteKey: "mage",
      isRecruitable: true,
      recruitLocation: "field_north",
      recruitCondition: { flag: "quest_slimes_done", equals: true },
      stats: { 
        level: 2, hp: 25, maxHp: 25, mp: 30, maxMp: 30, 
        atk: 4, def: 2, spd: 4, exp: 0 
      },
      growths: { hp: 3, mp: 5, atk: 1, def: 1, spd: 2 },
      equipment: { weapon: "wood_staff", armor: "robe" },
      skills: ["fire", "ice", "thunder"]
    },
    
    healer: {
      name: "僧侶",
      class: "僧侶",
      spriteKey: "healer",
      isRecruitable: true,
      recruitLocation: "tower_entrance",
      recruitCondition: { flag: "miniboss_defeated", equals: true },
      stats: { 
        level: 3, hp: 30, maxHp: 30, mp: 25, maxMp: 25, 
        atk: 5, def: 4, spd: 3, exp: 0 
      },
      growths: { hp: 4, mp: 4, atk: 1, def: 2, spd: 1 },
      equipment: { weapon: "wood_staff", armor: "robe" },
      skills: ["heal", "cure", "barrier"]
    },
    
    // NPCs
    king: { name: "王", spriteKey: "king" },
    princess: { name: "姫", spriteKey: "princess" },
    guard: { name: "兵士", spriteKey: "guard" },
    maid: { name: "メイド", spriteKey: "maid" },
    merchant: { name: "商人", spriteKey: "merchant" },
    villager_a: { name: "村人", spriteKey: "villager" },
    villager_b: { name: "老人", spriteKey: "oldman" },
    cat: { name: "ネコ", spriteKey: "cat" }
  },

  // === SKILLS ===
  skills: {
    slash: {
      name: "斬りつけ",
      desc: "通常攻撃",
      cost: { mp: 0 },
      power: 1.0,
      target: "enemy"
    },
    brave_strike: {
      name: "勇者の剣",
      desc: "強力な一撃 (MP4)",
      cost: { mp: 4 },
      power: 1.8,
      target: "enemy"
    },
    power_strike: {
      name: "パワーストライク",
      desc: "力を込めた攻撃 (MP3)",
      cost: { mp: 3 },
      power: 1.5,
      target: "enemy"
    },
    fire: {
      name: "ファイア",
      desc: "炎の魔法 (MP5)",
      cost: { mp: 5 },
      power: 1.6,
      element: "fire",
      target: "enemy"
    },
    ice: {
      name: "アイス",
      desc: "氷の魔法 (MP5)",
      cost: { mp: 5 },
      power: 1.6,
      element: "ice",
      target: "enemy"
    },
    thunder: {
      name: "サンダー",
      desc: "雷の魔法 (MP6)",
      cost: { mp: 6 },
      power: 1.8,
      element: "thunder",
      target: "enemy"
    },
    heal: {
      name: "ヒール",
      desc: "HP30回復 (MP4)",
      cost: { mp: 4 },
      healAmount: 30,
      target: "ally"
    },
    cure: {
      name: "キュア",
      desc: "HP全回復 (MP10)",
      cost: { mp: 10 },
      healAmount: 999,
      target: "ally"
    },
    barrier: {
      name: "バリア",
      desc: "防御力UP (MP6)",
      cost: { mp: 6 },
      buff: { def: 5, turns: 3 },
      target: "ally"
    }
  },

  // === ITEMS ===
  items: {
    potion: {
      name: "ポーション",
      type: "consumable",
      desc: "HPを30回復",
      price: 20,
      use: { effects: [{ type: "healHp", value: 30 }] }
    },
    hi_potion: {
      name: "ハイポーション",
      type: "consumable", 
      desc: "HPを80回復",
      price: 60,
      use: { effects: [{ type: "healHp", value: 80 }] }
    },
    ether: {
      name: "エーテル",
      type: "consumable",
      desc: "MPを15回復",
      price: 50,
      use: { effects: [{ type: "healMp", value: 15 }] }
    },
    elixir: {
      name: "エリクサー",
      type: "consumable",
      desc: "HP/MP全回復",
      price: 300,
      use: { effects: [{ type: "healHp", value: 999 }, { type: "healMp", value: 999 }] }
    },
    antidote: {
      name: "どくけし",
      type: "consumable",
      desc: "毒を治す",
      price: 15,
      use: { effects: [{ type: "cureStatus", status: "poison" }] }
    },
    tower_key: {
      name: "塔の鍵",
      type: "keyItem",
      desc: "闇の塔を開ける鍵"
    },
    letter: {
      name: "手紙",
      type: "keyItem",
      desc: "老人への手紙"
    }
  },

  // === EQUIPMENT ===
  equipment: {
    // Weapons
    wood_sword: { name: "木の剣", slot: "weapon", mods: { atk: 2 }, price: 30 },
    iron_sword: { name: "鉄の剣", slot: "weapon", mods: { atk: 5 }, price: 100 },
    steel_sword: { name: "鋼の剣", slot: "weapon", mods: { atk: 10 }, price: 300 },
    hero_sword: { name: "勇者の剣", slot: "weapon", mods: { atk: 18 }, price: 0 },
    wood_staff: { name: "木の杖", slot: "weapon", mods: { atk: 1, mp: 5 }, price: 40 },
    magic_staff: { name: "魔法の杖", slot: "weapon", mods: { atk: 3, mp: 15 }, price: 200 },
    
    // Armor
    cloth_armor: { name: "布の服", slot: "armor", mods: { def: 1 }, price: 20 },
    leather_armor: { name: "皮の鎧", slot: "armor", mods: { def: 4 }, price: 80 },
    iron_armor: { name: "鉄の鎧", slot: "armor", mods: { def: 8 }, price: 250 },
    hero_armor: { name: "勇者の鎧", slot: "armor", mods: { def: 15 }, price: 0 },
    robe: { name: "ローブ", slot: "armor", mods: { def: 2, mp: 10 }, price: 60 },
    magic_robe: { name: "魔法のローブ", slot: "armor", mods: { def: 5, mp: 20 }, price: 180 }
  },

  // === ENEMIES ===
  enemies: {
    slime: {
      name: "スライム",
      spriteKey: "slime",
      mapSprite: "slime_map",
      stats: { hp: 15, maxHp: 15, atk: 4, def: 1, spd: 2 },
      drops: [{ itemId: "potion", chance: 0.15, qty: 1 }],
      exp: 5, gold: 8,
      ai: { pattern: ["attack"] }
    },
    goblin: {
      name: "ゴブリン",
      spriteKey: "goblin",
      mapSprite: "goblin_map",
      stats: { hp: 25, maxHp: 25, atk: 7, def: 3, spd: 3 },
      drops: [{ itemId: "potion", chance: 0.2, qty: 1 }],
      exp: 12, gold: 18,
      ai: { pattern: ["attack", "attack", "defend"] }
    },
    bat: {
      name: "コウモリ",
      spriteKey: "bat",
      mapSprite: "bat_map",
      stats: { hp: 12, maxHp: 12, atk: 5, def: 0, spd: 6 },
      drops: [],
      exp: 6, gold: 5,
      ai: { pattern: ["attack"] }
    },
    skeleton: {
      name: "スケルトン",
      spriteKey: "skeleton",
      mapSprite: "skeleton_map",
      stats: { hp: 35, maxHp: 35, atk: 10, def: 5, spd: 3 },
      drops: [{ itemId: "ether", chance: 0.15, qty: 1 }],
      exp: 20, gold: 30,
      ai: { pattern: ["attack", "attack"] }
    },
    orc: {
      name: "オーク",
      spriteKey: "orc",
      mapSprite: "orc_map",
      stats: { hp: 50, maxHp: 50, atk: 12, def: 7, spd: 2 },
      drops: [{ itemId: "hi_potion", chance: 0.2, qty: 1 }],
      exp: 30, gold: 45,
      ai: { pattern: ["attack", "powerAttack", "attack"] }
    },
    dark_mage: {
      name: "闇魔道士",
      spriteKey: "dark_mage",
      mapSprite: "dark_mage_map",
      stats: { hp: 40, maxHp: 40, atk: 15, def: 3, spd: 5 },
      drops: [{ itemId: "ether", chance: 0.25, qty: 1 }],
      exp: 35, gold: 50,
      ai: { pattern: ["magic", "magic", "attack"] }
    },
    golem: {
      name: "ゴーレム",
      spriteKey: "golem",
      boss: true,
      stats: { hp: 120, maxHp: 120, atk: 18, def: 12, spd: 1 },
      drops: [{ itemId: "tower_key", chance: 1.0, qty: 1 }],
      exp: 80, gold: 150,
      ai: { pattern: ["attack", "powerAttack", "defend", "powerAttack"] }
    },
    dark_knight: {
      name: "闇の騎士",
      spriteKey: "dark_knight",
      boss: true,
      stats: { hp: 180, maxHp: 180, atk: 22, def: 10, spd: 4 },
      drops: [{ itemId: "hi_potion", chance: 1.0, qty: 2 }],
      exp: 120, gold: 200,
      ai: { pattern: ["attack", "attack", "powerAttack", "defend"] }
    },
    demon_lord: {
      name: "魔王",
      spriteKey: "demon_lord",
      boss: true,
      stats: { hp: 350, maxHp: 350, atk: 30, def: 15, spd: 5 },
      drops: [],
      exp: 500, gold: 1000,
      ai: { pattern: ["attack", "magic", "powerAttack", "magic", "attack", "ultimate"] }
    }
  },

  // === QUESTS ===
  quests: {
    main_rescue: {
      name: "姫を救え！",
      desc: "魔王に囚われた姫を救い出せ",
      type: "main",
      steps: [
        { desc: "王様に会う", flag: "met_king" },
        { desc: "塔の鍵を手に入れる", flag: "got_tower_key" },
        { desc: "闇の騎士を倒す", flag: "boss_defeated" },
        { desc: "魔王を倒す", flag: "demon_lord_defeated" },
        { desc: "姫を救出する", flag: "princess_rescued" }
      ]
    },
    side_slimes: {
      name: "スライム退治",
      desc: "北の街道のスライムを3体倒せ",
      type: "side",
      target: { enemy: "slime", count: 3 },
      reward: { exp: 30, gold: 50, item: "potion", qty: 2 },
      flag: "quest_slimes_done"
    },
    side_goblin: {
      name: "ゴブリン討伐",
      desc: "ゴブリンを5体倒せ",
      type: "side",
      target: { enemy: "goblin", count: 5 },
      reward: { exp: 60, gold: 100, item: "hi_potion", qty: 1 },
      flag: "quest_goblin_done"
    },
    side_delivery: {
      name: "手紙の配達",
      desc: "メイドの手紙を老人に届けろ",
      type: "side",
      reward: { exp: 20, gold: 30 },
      flag: "quest_delivery_done"
    }
  },

  // === MAPS ===
  maps: {
    // ===== CASTLE HALL =====
    castle_hall: {
      name: "城内ホール",
      recommendedLevel: 1,
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
            { type: "showDialogue", speaker: "guard", text: "街を抜けて北へ。塔に姫が囚われているらしい。" }
          ]
        },
        {
          id: "ev_maid_quest",
          trigger: "action",
          at: { x: 16, y: 7 },
          condition: { flag: "talked_maid", equals: false },
          steps: [
            { type: "showDialogue", speaker: "maid", text: "勇者さま、お願いがあります…" },
            { type: "showDialogue", speaker: "maid", text: "この手紙を街の老人に届けてください。" },
            { type: "giveItem", itemId: "letter", qty: 1 },
            { type: "setFlag", flag: "talked_maid", value: true },
            { type: "startQuest", questId: "side_delivery" },
            { type: "showDialogue", speaker: "system", text: "【クエスト開始】手紙の配達" }
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
      recommendedLevel: 1,
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
            { type: "showDialogue", speaker: "king", text: "姫が魔王にさらわれてしまった…" },
            { type: "showDialogue", speaker: "king", text: "闇の塔に囚われている。助け出してくれ！" },
            { type: "setFlag", flag: "met_king", value: true },
            { type: "startQuest", questId: "main_rescue" },
            { type: "showDialogue", speaker: "system", text: "【メインクエスト開始】姫を救え！" },
            { type: "showDialogue", speaker: "king", text: "街で仲間を探すと良い。一人では厳しいぞ。" }
          ]
        },
        {
          id: "ev_king_repeat",
          trigger: "action",
          at: { x: 5, y: 3 },
          condition: { flag: "met_king", equals: true },
          steps: [
            { type: "showDialogue", speaker: "king", text: "姫を…頼んだぞ！仲間と共に進め！" }
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
      recommendedLevel: 1,
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
          id: "ev_warrior_recruit",
          trigger: "action",
          at: { x: 5, y: 4 },
          condition: { flag: "warrior_joined", equals: false },
          steps: [
            { type: "showDialogue", speaker: "warrior", text: "俺は戦士だ。魔王を倒しに行くのか？" },
            { type: "showDialogue", speaker: "warrior", text: "よし、俺も連れて行ってくれ！" },
            { type: "addPartyMember", actorId: "warrior" },
            { type: "setFlag", flag: "warrior_joined", value: true },
            { type: "showDialogue", speaker: "system", text: "【戦士が仲間になった！】" }
          ]
        },
        {
          id: "ev_oldman_quest",
          trigger: "action",
          at: { x: 5, y: 12 },
          condition: { flag: "quest_delivery_done", equals: false, flag2: "talked_maid", equals2: true },
          steps: [
            { type: "showDialogue", speaker: "villager_b", text: "おお…メイドからの手紙か。ありがとう。" },
            { type: "removeItem", itemId: "letter", qty: 1 },
            { type: "setFlag", flag: "quest_delivery_done", value: true },
            { type: "giveItem", itemId: "hi_potion", qty: 2 },
            { type: "giveGold", amount: 50 },
            { type: "showDialogue", speaker: "system", text: "【クエスト完了】手紙の配達\nハイポーション×2と50Gを獲得！" }
          ]
        },
        {
          id: "ev_oldman_normal",
          trigger: "action",
          at: { x: 5, y: 12 },
          condition: { flag: "quest_delivery_done", equals: true },
          steps: [
            { type: "showDialogue", speaker: "villager_b", text: "頑張れよ、勇者。姫を救うのだ。" }
          ]
        },
        {
          id: "ev_town_chest",
          trigger: "action",
          at: { x: 17, y: 4 },
          condition: { flag: "got_town_chest", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "宝箱を開けた！" },
            { type: "giveItem", itemId: "hi_potion", qty: 1 },
            { type: "setFlag", flag: "got_town_chest", value: true },
            { type: "showDialogue", speaker: "system", text: "ハイポーションを手に入れた！" }
          ]
        }
      ],
      npcs: [
        { actorId: "warrior", pos: { x: 5, y: 4 }, condition: { flag: "warrior_joined", equals: false } },
        { actorId: "villager_b", pos: { x: 5, y: 12 } },
        { actorId: "cat", pos: { x: 18, y: 11 } }
      ],
      items: [
        { id: "sparkle1", pos: { x: 12, y: 10 }, itemId: "potion", sprite: "sparkle" }
      ]
    },

    // ===== FIELD NORTH =====
    field_north: {
      name: "北の街道",
      recommendedLevel: 2,
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
      events: [
        {
          id: "ev_mage_recruit",
          trigger: "action",
          at: { x: 14, y: 7 },
          condition: { flag: "mage_joined", equals: false, flag2: "quest_slimes_done", equals2: true },
          steps: [
            { type: "showDialogue", speaker: "mage", text: "スライムを退治してくれたのね。感謝するわ。" },
            { type: "showDialogue", speaker: "mage", text: "私も魔王討伐に協力させて！" },
            { type: "addPartyMember", actorId: "mage" },
            { type: "setFlag", flag: "mage_joined", value: true },
            { type: "showDialogue", speaker: "system", text: "【魔法使いが仲間になった！】" }
          ]
        },
        {
          id: "ev_mage_wait",
          trigger: "action",
          at: { x: 14, y: 7 },
          condition: { flag: "mage_joined", equals: false, flag2: "quest_slimes_done", equals2: false },
          steps: [
            { type: "showDialogue", speaker: "mage", text: "この辺のスライムが邪魔なの…退治してくれない？" },
            { type: "startQuest", questId: "side_slimes" },
            { type: "showDialogue", speaker: "system", text: "【クエスト開始】スライム退治" }
          ]
        }
      ],
      npcs: [
        { actorId: "mage", pos: { x: 14, y: 7 }, condition: { flag: "mage_joined", equals: false } }
      ],
      monsters: [
        { enemyId: "slime", pos: { x: 4, y: 3 }, movePattern: "wander" },
        { enemyId: "slime", pos: { x: 13, y: 6 }, movePattern: "wander" },
        { enemyId: "slime", pos: { x: 6, y: 11 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 10, y: 8 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 5, y: 7 }, movePattern: "wander" }
      ],
      items: [
        { id: "field_potion", pos: { x: 3, y: 7 }, itemId: "potion", sprite: "sparkle" },
        { id: "field_ether", pos: { x: 15, y: 3 }, itemId: "ether", sprite: "sparkle" }
      ]
    },

    // ===== TOWER ENTRANCE =====
    tower_entrance: {
      name: "塔の入口",
      recommendedLevel: 4,
      size: { w: 14, h: 12 },
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
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "field_north", at: { x: 6, y: 10 }, spawn: { x: 8, y: 13 } },
        { toMapId: "field_north", at: { x: 7, y: 10 }, spawn: { x: 8, y: 13 } },
        { toMapId: "tower_floor1", at: { x: 6, y: 1 }, spawn: { x: 6, y: 8 }, condition: { flag: "got_tower_key", equals: true } },
        { toMapId: "tower_floor1", at: { x: 7, y: 1 }, spawn: { x: 6, y: 8 }, condition: { flag: "got_tower_key", equals: true } }
      ],
      events: [
        {
          id: "ev_tower_locked",
          trigger: "action",
          at: { x: 6, y: 2 },
          condition: { flag: "got_tower_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "塔の扉は固く閉ざされている…" },
            { type: "showDialogue", speaker: "system", text: "鍵が必要だ。門番のゴーレムが持っているようだ。" }
          ]
        },
        {
          id: "ev_miniboss",
          trigger: "touch",
          at: { x: 7, y: 5 },
          condition: { flag: "miniboss_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "ゴーレムが襲いかかってきた！" },
            { type: "startBattle", battleId: "miniboss_golem" }
          ]
        },
        {
          id: "ev_healer_recruit",
          trigger: "action",
          at: { x: 3, y: 7 },
          condition: { flag: "healer_joined", equals: false, flag2: "miniboss_defeated", equals2: true },
          steps: [
            { type: "showDialogue", speaker: "healer", text: "ゴーレムを倒してくれたのですね！" },
            { type: "showDialogue", speaker: "healer", text: "私は僧侶です。回復魔法で助けになります。" },
            { type: "addPartyMember", actorId: "healer" },
            { type: "setFlag", flag: "healer_joined", value: true },
            { type: "showDialogue", speaker: "system", text: "【僧侶が仲間になった！】" }
          ]
        }
      ],
      npcs: [
        { actorId: "healer", pos: { x: 3, y: 7 }, condition: { flag: "healer_joined", equals: false, flag2: "miniboss_defeated", equals2: true } }
      ],
      monsters: [
        { enemyId: "skeleton", pos: { x: 4, y: 4 }, movePattern: "patrol" },
        { enemyId: "skeleton", pos: { x: 10, y: 6 }, movePattern: "patrol" },
        { enemyId: "golem", pos: { x: 7, y: 5 }, movePattern: "none", boss: true, condition: { flag: "miniboss_defeated", equals: false } }
      ]
    },

    // ===== TOWER FLOOR 1 =====
    tower_floor1: {
      name: "闇の塔 1F",
      recommendedLevel: 5,
      size: { w: 14, h: 12 },
      tileData: "tower_inside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "tower_entrance", at: { x: 6, y: 9 }, spawn: { x: 6, y: 2 } },
        { toMapId: "tower_entrance", at: { x: 7, y: 9 }, spawn: { x: 7, y: 2 } },
        { toMapId: "tower_floor2", at: { x: 12, y: 1 }, spawn: { x: 1, y: 8 } }
      ],
      events: [],
      npcs: [],
      monsters: [
        { enemyId: "skeleton", pos: { x: 3, y: 3 }, movePattern: "wander" },
        { enemyId: "orc", pos: { x: 10, y: 5 }, movePattern: "wander" },
        { enemyId: "dark_mage", pos: { x: 6, y: 2 }, movePattern: "patrol" }
      ],
      items: [
        { id: "tower1_potion", pos: { x: 11, y: 2 }, itemId: "hi_potion", sprite: "sparkle" }
      ]
    },

    // ===== TOWER FLOOR 2 =====
    tower_floor2: {
      name: "闘の塔 2F",
      recommendedLevel: 6,
      size: { w: 12, h: 10 },
      tileData: "tower_inside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "tower_floor1", at: { x: 1, y: 8 }, spawn: { x: 12, y: 1 } },
        { toMapId: "tower_top", at: { x: 10, y: 1 }, spawn: { x: 5, y: 7 } }
      ],
      events: [
        {
          id: "ev_dark_knight",
          trigger: "touch",
          at: { x: 5, y: 3 },
          condition: { flag: "boss_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "闇の騎士が立ちはだかった！" },
            { type: "startBattle", battleId: "boss_dark_knight" }
          ]
        }
      ],
      npcs: [],
      monsters: [
        { enemyId: "dark_knight", pos: { x: 5, y: 3 }, movePattern: "none", boss: true, condition: { flag: "boss_defeated", equals: false } },
        { enemyId: "orc", pos: { x: 9, y: 6 }, movePattern: "patrol" },
        { enemyId: "dark_mage", pos: { x: 2, y: 5 }, movePattern: "wander" }
      ],
      items: [
        { id: "tower2_elixir", pos: { x: 10, y: 7 }, itemId: "elixir", sprite: "sparkle" }
      ]
    },

    // ===== TOWER TOP (Demon Lord) =====
    tower_top: {
      name: "闇の塔 最上階",
      recommendedLevel: 8,
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
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,0,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "tower_floor2", at: { x: 5, y: 8 }, spawn: { x: 10, y: 2 } },
        { toMapId: "tower_floor2", at: { x: 6, y: 8 }, spawn: { x: 10, y: 2 } }
      ],
      events: [
        {
          id: "ev_demon_lord",
          trigger: "touch",
          at: { x: 5, y: 2 },
          condition: { flag: "demon_lord_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "demon_lord", text: "よく来たな、勇者よ…" },
            { type: "showDialogue", speaker: "demon_lord", text: "だが、ここが貴様の墓場だ！" },
            { type: "startBattle", battleId: "boss_demon_lord" }
          ]
        },
        {
          id: "ev_rescue_princess",
          trigger: "auto",
          condition: { flag: "demon_lord_defeated", equals: true, flag2: "princess_rescued", equals2: false },
          steps: [
            { type: "showDialogue", speaker: "princess", text: "勇者さま…ついに魔王を倒してくれたのね！" },
            { type: "showDialogue", speaker: "princess", text: "ありがとう…本当にありがとう…" },
            { type: "setFlag", flag: "princess_rescued", value: true },
            { type: "showDialogue", speaker: "system", text: "【メインクエスト完了】姫を救え！" },
            { type: "endGame", endingId: "good_end" }
          ]
        }
      ],
      npcs: [
        { actorId: "princess", pos: { x: 5, y: 1 }, condition: { flag: "demon_lord_defeated", equals: true } }
      ],
      monsters: [
        { enemyId: "demon_lord", pos: { x: 5, y: 2 }, movePattern: "none", boss: true, condition: { flag: "demon_lord_defeated", equals: false } }
      ]
    }
  },

  // === BATTLES ===
  battles: {
    miniboss_golem: {
      name: "門番ゴーレム",
      enemies: [{ enemyId: "golem", qty: 1 }],
      victory: [
        { type: "showDialogue", speaker: "system", text: "ゴーレムを倒した！塔の鍵を手に入れた！" },
        { type: "setFlag", flag: "miniboss_defeated", value: true },
        { type: "setFlag", flag: "got_tower_key", value: true }
      ],
      defeat: [
        { type: "showDialogue", speaker: "system", text: "勇者たちは倒れた…" },
        { type: "gameOver" }
      ]
    },
    boss_dark_knight: {
      name: "闇の騎士",
      enemies: [{ enemyId: "dark_knight", qty: 1 }],
      victory: [
        { type: "showDialogue", speaker: "system", text: "闇の騎士を倒した！" },
        { type: "setFlag", flag: "boss_defeated", value: true }
      ],
      defeat: [
        { type: "showDialogue", speaker: "system", text: "勇者たちは倒れた…" },
        { type: "gameOver" }
      ]
    },
    boss_demon_lord: {
      name: "魔王",
      enemies: [{ enemyId: "demon_lord", qty: 1 }],
      victory: [
        { type: "showDialogue", speaker: "system", text: "魔王を倒した！世界に平和が戻った！" },
        { type: "setFlag", flag: "demon_lord_defeated", value: true }
      ],
      defeat: [
        { type: "showDialogue", speaker: "system", text: "勇者たちは倒れた…" },
        { type: "gameOver" }
      ]
    }
  },

  // === ENDINGS ===
  endings: {
    good_end: {
      title: "〜 姫救出 〜",
      text: "勇者は仲間たちと共に魔王を倒し、\n姫を救い出した。\n\n平和が訪れた王国で、\n勇者たちは英雄として讃えられ、\n末永く幸せに暮らしました。\n\n〜 THE END 〜\n\nおめでとうございます！"
    }
  }
};

Object.freeze(GAME_DATA.constants);
Object.freeze(GAME_DATA.items);
Object.freeze(GAME_DATA.equipment);
Object.freeze(GAME_DATA.skills);
Object.freeze(GAME_DATA.enemies);
Object.freeze(GAME_DATA.endings);
