// ============================================
// ピクセルの王国と最後の塔
// Game Data - Restructured Story
// ============================================

const GAME_DATA = {
  meta: {
    title: "ピクセルの王国と最後の塔",
    version: "2.0.0",
    author: "prototype",
    starting: {
      mapId: "village",
      spawn: { x: 7, y: 8 },
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
    expTable: [0, 15, 40, 80, 140, 220, 320, 450, 600, 800, 1000],
    maxLevel: 10
  },

  flags: {
    met_king: false,
    got_castle_key: false,
    boss_defeated: false,
    princess_rescued: false,
    talked_villager_a: false,
    talked_villager_b: false,
    talked_soldier: false,
    got_village_potion: false,
    got_field_chest: false,
    got_castle_chest: false
  },

  // === ACTORS ===
  actors: {
    hero: {
      name: "勇者",
      class: "勇者",
      spriteKey: "hero",
      stats: { 
        level: 1, hp: 40, maxHp: 40, mp: 15, maxMp: 15, 
        atk: 8, def: 5, spd: 5, exp: 0, gold: 50 
      },
      growths: { hp: 8, mp: 4, atk: 3, def: 2, spd: 1 },
      equipment: { weapon: "wood_sword", armor: "cloth_armor" },
      skills: ["slash", "brave_strike"],
      inventory: [{ itemId: "potion", qty: 3 }]
    },
    
    king: { name: "王", spriteKey: "king" },
    princess: { name: "姫", spriteKey: "princess" },
    soldier: { name: "兵士", spriteKey: "guard" },
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
      desc: "強力な一撃 (MP5)",
      cost: { mp: 5 },
      power: 2.0,
      target: "enemy"
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
    castle_key: {
      name: "城の鍵",
      type: "keyItem",
      desc: "城門を開ける古い鍵"
    }
  },

  // === EQUIPMENT ===
  equipment: {
    wood_sword: { name: "木の剣", slot: "weapon", mods: { atk: 3 }, price: 30 },
    iron_sword: { name: "鉄の剣", slot: "weapon", mods: { atk: 8 }, price: 100 },
    cloth_armor: { name: "布の服", slot: "armor", mods: { def: 2 }, price: 20 },
    leather_armor: { name: "皮の鎧", slot: "armor", mods: { def: 5 }, price: 80 }
  },

  // === ENEMIES ===
  enemies: {
    slime: {
      name: "スライム",
      spriteKey: "slime",
      stats: { hp: 12, maxHp: 12, atk: 5, def: 1, spd: 2 },
      drops: [{ itemId: "potion", chance: 0.5, qty: 1 }],
      exp: 8, gold: 8,
      ai: { pattern: ["attack"] }
    },
    goblin: {
      name: "ゴブリン",
      spriteKey: "goblin",
      stats: { hp: 20, maxHp: 20, atk: 8, def: 3, spd: 3 },
      drops: [{ itemId: "potion", chance: 0.6, qty: 1 }],
      exp: 15, gold: 15,
      ai: { pattern: ["attack", "attack", "defend"] }
    },
    skeleton: {
      name: "スケルトン",
      spriteKey: "skeleton",
      stats: { hp: 30, maxHp: 30, atk: 12, def: 5, spd: 3 },
      drops: [{ itemId: "hi_potion", chance: 0.5, qty: 1 }],
      exp: 25, gold: 25,
      ai: { pattern: ["attack", "attack"] }
    },
    dark_knight: {
      name: "闇の騎士",
      spriteKey: "dark_knight",
      boss: true,
      stats: { hp: 150, maxHp: 150, atk: 18, def: 8, spd: 4 },
      drops: [{ itemId: "hi_potion", chance: 1.0, qty: 3 }],
      exp: 200, gold: 500,
      ai: { pattern: ["attack", "attack", "powerAttack", "defend"] }
    }
  },

  // === MAPS ===
  maps: {
    // ===== ① はじまりの村 =====
    village: {
      name: "はじまりの村",
      recommendedLevel: 1,
      size: { w: 16, h: 14 },
      tileData: "town",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1],
        [1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1],
        [1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        { toMapId: "field", at: { x: 7, y: 13 }, spawn: { x: 7, y: 2 } },
        { toMapId: "field", at: { x: 8, y: 13 }, spawn: { x: 8, y: 2 } }
      ],
      events: [
        // 王様との会話（初回）
        {
          id: "ev_king_intro",
          trigger: "action",
          at: { x: 7, y: 3 },
          condition: { flag: "met_king", equals: false },
          steps: [
            { type: "showDialogue", speaker: "king", text: "勇者よ…よく目を覚ましてくれた。" },
            { type: "showDialogue", speaker: "king", text: "姫は城の塔に囚われている。\n闇の騎士を倒し、姫を救ってほしい。" },
            { type: "showDialogue", speaker: "king", text: "城の門は闇の力で封印されている…\n草原の奥で「城の鍵」を探すのだ。" },
            { type: "setFlag", flag: "met_king", value: true },
            { type: "showDialogue", speaker: "system", text: "【操作方法】\n矢印キー: 移動\nEnter/Space: 話す/調べる\nESC/M: メニュー" }
          ]
        },
        // 王様との会話（繰り返し）
        {
          id: "ev_king_repeat",
          trigger: "action",
          at: { x: 7, y: 3 },
          condition: { flag: "met_king", equals: true },
          steps: [
            { type: "showDialogue", speaker: "king", text: "城の鍵を見つけ、姫を救ってくれ…" }
          ]
        },
        // 村人A
        {
          id: "ev_villager_a",
          trigger: "action",
          at: { x: 4, y: 7 },
          steps: [
            { type: "showDialogue", speaker: "villager_a", text: "南に出ると草原だよ。\nモンスターがいるから気をつけてね。" },
            { type: "setFlag", flag: "talked_villager_a", value: true }
          ]
        },
        // 村人B（老人）
        {
          id: "ev_villager_b",
          trigger: "action",
          at: { x: 12, y: 7 },
          steps: [
            { type: "showDialogue", speaker: "villager_b", text: "城の門は闇の力で封印されておる…\n鍵は草原の奥にあるという噂じゃ。" },
            { type: "setFlag", flag: "talked_villager_b", value: true }
          ]
        },
        // ツボを調べる（説明のみ）
        {
          id: "ev_village_pot",
          trigger: "action",
          at: { x: 13, y: 2 },
          steps: [
            { type: "showDialogue", speaker: "system", text: "ツボを調べた…空っぽだ。\nモンスターを倒してアイテムを集めよう！" }
          ]
        },
        // 井戸を調べる
        {
          id: "ev_village_well",
          trigger: "action",
          at: { x: 2, y: 3 },
          steps: [
            { type: "showDialogue", speaker: "system", text: "古い井戸だ。\n水は枯れてしまっているようだ。" }
          ]
        }
      ],
      npcs: [
        { actorId: "king", pos: { x: 7, y: 3 } },
        { actorId: "villager_a", pos: { x: 4, y: 7 } },
        { actorId: "villager_b", pos: { x: 12, y: 7 } },
        { actorId: "cat", pos: { x: 2, y: 11 } }
      ],
      decorations: [
        { sprite: "well", x: 2, y: 3 },
        { sprite: "pot", x: 13, y: 2 },
        { sprite: "pot", x: 14, y: 2 }
      ],
      items: []
    },

    // ===== ② 草原と城門前 =====
    field: {
      name: "草原",
      recommendedLevel: 2,
      size: { w: 18, h: 20 },
      tileData: "field",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        // 村への帰り道
        { toMapId: "village", at: { x: 7, y: 1 }, spawn: { x: 7, y: 12 } },
        { toMapId: "village", at: { x: 8, y: 1 }, spawn: { x: 8, y: 12 } },
        { toMapId: "village", at: { x: 9, y: 1 }, spawn: { x: 7, y: 12 } },
        { toMapId: "village", at: { x: 10, y: 1 }, spawn: { x: 8, y: 12 } },
        // 城門へ（鍵がない場合）
        { toMapId: "castle_gate", at: { x: 7, y: 18 }, spawn: { x: 7, y: 2 } },
        { toMapId: "castle_gate", at: { x: 8, y: 18 }, spawn: { x: 8, y: 2 } },
        { toMapId: "castle_gate", at: { x: 9, y: 18 }, spawn: { x: 7, y: 2 } },
        { toMapId: "castle_gate", at: { x: 10, y: 18 }, spawn: { x: 8, y: 2 } }
      ],
      events: [
        // 宝箱（城の鍵）
        {
          id: "ev_field_chest",
          trigger: "action",
          at: { x: 15, y: 6 },
          condition: { flag: "got_castle_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "宝箱を開けた！" },
            { type: "showDialogue", speaker: "system", text: "「城の鍵」を手に入れた！\nこれで城門を開けられる！" },
            { type: "giveItem", itemId: "castle_key", qty: 1 },
            { type: "setFlag", flag: "got_castle_key", value: true }
          ]
        },
        {
          id: "ev_field_chest_empty",
          trigger: "action",
          at: { x: 15, y: 6 },
          condition: { flag: "got_castle_key", equals: true },
          steps: [
            { type: "showDialogue", speaker: "system", text: "宝箱は空だ。" }
          ]
        },
        // 兵士
        {
          id: "ev_soldier",
          trigger: "action",
          at: { x: 5, y: 12 },
          steps: [
            { type: "showDialogue", speaker: "soldier", text: "この先に城がある。\n闇の騎士が占拠しているらしい…" },
            { type: "showDialogue", speaker: "soldier", text: "戦う前にレベルを上げておけよ。" },
            { type: "setFlag", flag: "talked_soldier", value: true }
          ]
        }
      ],
      npcs: [
        { actorId: "soldier", pos: { x: 5, y: 12 } }
      ],
      decorations: [
        { sprite: "chest", x: 15, y: 6 }
      ],
      items: [
        { id: "chest1", pos: { x: 15, y: 6 }, sprite: "chest" }
      ],
      monsters: [
        { enemyId: "slime", pos: { x: 4, y: 4 }, movePattern: "wander" },
        { enemyId: "slime", pos: { x: 13, y: 3 }, movePattern: "wander" },
        { enemyId: "slime", pos: { x: 8, y: 8 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 12, y: 11 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 5, y: 16 }, movePattern: "wander" },
        { enemyId: "goblin", pos: { x: 14, y: 15 }, movePattern: "wander" }
      ]
    },

    // ===== 城門 =====
    castle_gate: {
      name: "城門前",
      recommendedLevel: 3,
      size: { w: 14, h: 12 },
      tileData: "castle_outside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        // 草原に戻る
        { toMapId: "field", at: { x: 6, y: 10 }, spawn: { x: 8, y: 17 } },
        { toMapId: "field", at: { x: 7, y: 10 }, spawn: { x: 9, y: 17 } }
      ],
      events: [
        // 城門（鍵なし）- 調べたとき
        {
          id: "ev_gate_locked",
          trigger: "action",
          at: { x: 6, y: 2 },
          condition: { flag: "got_castle_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "門は闇の力で封印されている…\n鍵がなければ開けられない。" }
          ]
        },
        {
          id: "ev_gate_locked2",
          trigger: "action",
          at: { x: 7, y: 2 },
          condition: { flag: "got_castle_key", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "門は闇の力で封印されている…\n鍵がなければ開けられない。" }
          ]
        },
        // 城門（鍵あり）- 調べたら入れる
        {
          id: "ev_gate_unlock",
          trigger: "action",
          at: { x: 6, y: 2 },
          condition: { flag: "got_castle_key", equals: true },
          steps: [
            { type: "showDialogue", speaker: "system", text: "城の鍵を使った！\n封印が解けた！" },
            { type: "changeMap", mapId: "castle_hall", spawn: { x: 8, y: 10 } }
          ]
        },
        {
          id: "ev_gate_unlock2",
          trigger: "action",
          at: { x: 7, y: 2 },
          condition: { flag: "got_castle_key", equals: true },
          steps: [
            { type: "showDialogue", speaker: "system", text: "城の鍵を使った！\n封印が解けた！" },
            { type: "changeMap", mapId: "castle_hall", spawn: { x: 8, y: 10 } }
          ]
        }
      ],
      decorations: [
        { sprite: "gate", x: 6, y: 1 },
        { sprite: "gate", x: 7, y: 1 }
      ],
      npcs: [],
      monsters: [
        { enemyId: "skeleton", pos: { x: 4, y: 5 }, movePattern: "patrol" },
        { enemyId: "skeleton", pos: { x: 10, y: 7 }, movePattern: "patrol" }
      ]
    },

    // ===== ③ 城内ホール =====
    castle_hall: {
      name: "城内ホール",
      recommendedLevel: 3,
      size: { w: 18, h: 14 },
      tileData: "castle_inside",
      collision: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        // 城門に戻る
        { toMapId: "castle_gate", at: { x: 7, y: 12 }, spawn: { x: 6, y: 3 } },
        { toMapId: "castle_gate", at: { x: 8, y: 12 }, spawn: { x: 7, y: 3 } },
        { toMapId: "castle_gate", at: { x: 9, y: 12 }, spawn: { x: 6, y: 3 } },
        { toMapId: "castle_gate", at: { x: 10, y: 12 }, spawn: { x: 7, y: 3 } },
        // 塔へ
        { toMapId: "tower", at: { x: 8, y: 0 }, spawn: { x: 5, y: 8 } },
        { toMapId: "tower", at: { x: 9, y: 0 }, spawn: { x: 6, y: 8 } }
      ],
      events: [
        // 城内の警告
        {
          id: "ev_castle_warning",
          trigger: "auto",
          condition: { flag: "boss_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "城内は静まり返っている…" },
            { type: "showDialogue", speaker: "system", text: "奥から不気味な気配を感じる。" }
          ]
        },
        // 宝箱
        {
          id: "ev_castle_chest",
          trigger: "action",
          at: { x: 15, y: 2 },
          condition: { flag: "got_castle_chest", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "宝箱を開けた！\nハイポーションを手に入れた！" },
            { type: "giveItem", itemId: "hi_potion", qty: 2 },
            { type: "setFlag", flag: "got_castle_chest", value: true }
          ]
        },
        // ツボ
        {
          id: "ev_castle_pot",
          trigger: "action",
          at: { x: 2, y: 2 },
          steps: [
            { type: "showDialogue", speaker: "system", text: "ツボは空だった…\n誰かが先に調べたようだ。" }
          ]
        },
        // 塔への扉
        {
          id: "ev_tower_door",
          trigger: "action",
          at: { x: 8, y: 1 },
          condition: { flag: "boss_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "system", text: "この先に、闇の騎士がいる…" },
            { type: "showDialogue", speaker: "system", text: "準備はいいか？" }
          ]
        }
      ],
      decorations: [
        { sprite: "chest", x: 15, y: 2 },
        { sprite: "pot", x: 2, y: 2 },
        { sprite: "pot", x: 2, y: 11 },
        { sprite: "pot", x: 15, y: 11 }
      ],
      npcs: [],
      items: [
        { id: "chest2", pos: { x: 15, y: 2 }, sprite: "chest" }
      ],
      monsters: [
        { enemyId: "skeleton", pos: { x: 5, y: 6 }, movePattern: "wander" },
        { enemyId: "skeleton", pos: { x: 12, y: 6 }, movePattern: "wander" }
      ]
    },

    // ===== ④ 城の塔・ボス戦 =====
    tower: {
      name: "城の塔",
      recommendedLevel: 4,
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
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,0,0,1,1,1,1,1]
      ],
      encounters: { enabled: false },
      exits: [
        // 城内に戻る
        { toMapId: "castle_hall", at: { x: 5, y: 9 }, spawn: { x: 8, y: 2 } },
        { toMapId: "castle_hall", at: { x: 6, y: 9 }, spawn: { x: 9, y: 2 } }
      ],
      events: [
        // ボス戦
        {
          id: "ev_boss_battle",
          trigger: "touch",
          at: { x: 5, y: 2 },
          condition: { flag: "boss_defeated", equals: false },
          steps: [
            { type: "showDialogue", speaker: "dark_knight", text: "よく来たな、勇者よ…" },
            { type: "showDialogue", speaker: "dark_knight", text: "まだ希望を捨てぬか…愚かな！" },
            { type: "startBattle", battleId: "boss_dark_knight" }
          ]
        },
        // 姫救出
        {
          id: "ev_rescue_princess",
          trigger: "action",
          at: { x: 5, y: 1 },
          condition: { flag: "boss_defeated", equals: true, flag2: "princess_rescued", equals2: false },
          steps: [
            { type: "showDialogue", speaker: "princess", text: "勇者さま…！" },
            { type: "showDialogue", speaker: "princess", text: "ありがとう…\nあなたを信じて待っていたわ。" },
            { type: "setFlag", flag: "princess_rescued", value: true },
            { type: "endGame", endingId: "good_end" }
          ]
        }
      ],
      npcs: [
        { actorId: "princess", pos: { x: 5, y: 1 }, condition: { flag: "boss_defeated", equals: true } }
      ],
      monsters: [
        { enemyId: "dark_knight", pos: { x: 5, y: 2 }, movePattern: "none", boss: true, condition: { flag: "boss_defeated", equals: false } }
      ]
    }
  },

  // === BATTLES ===
  battles: {
    boss_dark_knight: {
      name: "闇の騎士",
      enemies: [{ enemyId: "dark_knight", qty: 1 }],
      victory: [
        { type: "showDialogue", speaker: "dark_knight", text: "馬鹿な…この私が…" },
        { type: "showDialogue", speaker: "system", text: "闇の騎士を倒した！\n封印が解ける…" },
        { type: "setFlag", flag: "boss_defeated", value: true }
      ],
      defeat: [
        { type: "showDialogue", speaker: "dark_knight", text: "所詮、貴様もこの程度か…" },
        { type: "gameOver" }
      ]
    }
  },

  // === ENDINGS ===
  endings: {
    good_end: {
      title: "〜 姫救出 〜",
      text: "闇の騎士を倒し、\n姫を救い出した勇者。\n\n王国に光が戻り、\n勇者は静かに村へ帰った。\n\n「こうして勇者は名を刻まず、\nただ世界を救った。」\n\n\n〜 THE END 〜\n\nおめでとうございます！"
    }
  }
};

Object.freeze(GAME_DATA.constants);
Object.freeze(GAME_DATA.items);
Object.freeze(GAME_DATA.equipment);
Object.freeze(GAME_DATA.skills);
Object.freeze(GAME_DATA.enemies);
Object.freeze(GAME_DATA.endings);
