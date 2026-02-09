// ============================================
// ピクセルの王国と最後の塔
// Game Engine - Complete Rewrite
// ============================================

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    
    this.spriteRenderer = new SpriteRenderer();
    this.audio = new AudioSystem();
    
    // Display
    this.tileSize = 16;
    this.scale = 2;
    this.scaledTile = this.tileSize * this.scale;
    
    // Movement - VERY SLOW
    this.moveTime = 250; // ms to move one tile
    this.moveCooldown = 100;
    this.lastMoveTime = 0;
    this.moving = false;
    this.moveProgress = 0;
    this.fromPos = { x: 0, y: 0 };
    this.toPos = { x: 0, y: 0 };
    
    // Input
    this.keys = {};
    
    // State
    this.screen = 'map'; // map, battle, menu, gameover, ending
    this.mapId = null;
    this.map = null;
    this.mapBg = null;
    this.pos = { x: 0, y: 0 };
    this.dir = 'down';
    this.flags = {};
    this.hero = null;
    this.inventory = [];
    this.gold = 0;
    this.dialogue = null;
    this.eventQueue = [];
    
    // Monsters
    this.monsters = {};
    this.killedMonsters = new Set();
    
    // Battle
    this.battle = null;
    this.battleEvents = null;
    
    this.lastTime = 0;
    
    this.init();
  }
  
  init() {
    console.log('Game initializing...');
    
    // Copy flags
    this.flags = { ...GAME_DATA.flags };
    
    // Init hero
    const heroData = GAME_DATA.actors.hero;
    this.hero = {
      ...JSON.parse(JSON.stringify(heroData.stats)),
      equipment: { ...heroData.equipment },
      skills: [...heroData.skills]
    };
    this.inventory = JSON.parse(JSON.stringify(heroData.inventory || []));
    this.gold = heroData.stats.gold || 50;
    
    // Setup
    this.setupInput();
    this.setupUI();
    
    // Load starting map
    const start = GAME_DATA.meta.starting;
    this.loadMap(start.mapId, start.spawn);
    
    // Start loop
    requestAnimationFrame(t => this.loop(t));
    
    console.log('Game initialized!');
  }
  
  setupInput() {
    window.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;
      this.handleKey(e);
    });
    window.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // Audio resume
    document.addEventListener('click', () => this.audio.resume(), { once: true });
  }
  
  handleKey(e) {
    const key = e.key.toLowerCase();
    
    if (this.dialogue) {
      if (key === 'enter' || key === ' ') {
        e.preventDefault();
        this.closeDialogue();
      }
      return;
    }
    
    if (this.screen === 'map') {
      if (key === 'enter' || key === ' ') {
        e.preventDefault();
        this.doAction();
      }
      if (key === 'escape' || key === 'm') {
        this.openMenu();
      }
    }
    else if (this.screen === 'battle') {
      if (key === '1') this.battleCommand('attack');
      if (key === '2') this.battleCommand('skill');
      if (key === '3') this.battleCommand('item');
      if (key === '4') this.battleCommand('defend');
    }
    else if (this.screen === 'menu') {
      if (key === 'escape' || key === 'm') {
        this.closeMenu();
      }
    }
  }
  
  setupUI() {
    // Menu button
    document.getElementById('btn-menu').onclick = () => this.openMenu();
    
    // Battle commands
    document.querySelectorAll('.battle-cmd').forEach(btn => {
      btn.onclick = () => this.battleCommand(btn.dataset.cmd);
    });
    
    // Menu items
    document.querySelectorAll('.menu-item').forEach(btn => {
      btn.onclick = () => this.menuSelect(btn.dataset.menu);
    });
    
    // Retry/Title
    document.getElementById('btn-retry').onclick = () => location.reload();
    document.getElementById('btn-title').onclick = () => location.reload();
    
    // Dialogue click
    document.getElementById('dialogue-box').onclick = () => this.closeDialogue();
  }
  
  // === MAP ===
  
  loadMap(mapId, spawn) {
    console.log(`Loading map: ${mapId}`);
    
    const mapData = GAME_DATA.maps[mapId];
    if (!mapData) {
      console.error(`Map not found: ${mapId}`);
      return;
    }
    
    this.mapId = mapId;
    this.map = { ...mapData, id: mapId };
    this.pos = { x: spawn.x, y: spawn.y };
    this.moving = false;
    
    // Generate background
    this.mapBg = this.spriteRenderer.generateMapBackground(this.map, this.scale);
    
    // Init monsters
    this.monsters = {};
    if (mapData.monsters) {
      mapData.monsters.forEach((m, i) => {
        const key = `${mapId}_${i}`;
        if (!this.killedMonsters.has(key) && this.checkCond(m.condition)) {
          this.monsters[key] = { ...m, x: m.pos.x, y: m.pos.y };
        }
      });
    }
    
    // Update UI
    document.getElementById('map-name').textContent = 
      `${mapData.name} (推奨Lv.${mapData.recommendedLevel})`;
    
    // Auto events
    setTimeout(() => this.checkAutoEvents(), 300);
  }
  
  checkCond(cond) {
    if (!cond) return true;
    let ok = true;
    if (cond.flag !== undefined) {
      ok = ok && (this.flags[cond.flag] === cond.equals);
    }
    if (cond.flag2 !== undefined) {
      ok = ok && (this.flags[cond.flag2] === cond.equals2);
    }
    return ok;
  }
  
  // === MOVEMENT ===
  
  tryMove(dir) {
    if (this.moving || this.screen !== 'map' || this.dialogue) return;
    
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveCooldown) return;
    
    this.dir = dir;
    
    const vec = GAME_DATA.constants.directionVectors[dir];
    const nx = Math.round(this.pos.x) + vec.x;
    const ny = Math.round(this.pos.y) + vec.y;
    
    // Check exit
    const exit = this.getExit(nx, ny);
    if (exit && this.checkCond(exit.condition)) {
      this.audio.step();
      this.loadMap(exit.toMapId, exit.spawn);
      return;
    }
    
    // Check collision
    if (this.isBlocked(nx, ny)) return;
    
    // Check monster
    const monsterKey = this.getMonsterAt(nx, ny);
    if (monsterKey) {
      console.log(`Monster encounter: ${monsterKey}`);
      const m = this.monsters[monsterKey];
      this.startBattle(m.enemyId, monsterKey, m.boss);
      return;
    }
    
    // Move
    this.moving = true;
    this.moveProgress = 0;
    this.fromPos = { x: Math.round(this.pos.x), y: Math.round(this.pos.y) };
    this.toPos = { x: nx, y: ny };
    this.lastMoveTime = now;
    this.audio.step();
  }
  
  isBlocked(x, y) {
    if (!this.map) return true;
    if (x < 0 || y < 0 || x >= this.map.size.w || y >= this.map.size.h) return true;
    if (this.map.collision[y]?.[x] === 1) return true;
    
    // NPCs
    if (this.map.npcs) {
      for (const npc of this.map.npcs) {
        if (!this.checkCond(npc.condition)) continue;
        if (npc.pos.x === x && npc.pos.y === y) return true;
      }
    }
    return false;
  }
  
  getExit(x, y) {
    if (!this.map?.exits) return null;
    return this.map.exits.find(e => e.at.x === x && e.at.y === y);
  }
  
  getMonsterAt(x, y) {
    for (const [key, m] of Object.entries(this.monsters)) {
      if (m.x === x && m.y === y) return key;
    }
    return null;
  }
  
  doAction() {
    if (this.moving) return;
    
    const vec = GAME_DATA.constants.directionVectors[this.dir];
    const px = Math.round(this.pos.x);
    const py = Math.round(this.pos.y);
    const tx = px + vec.x;
    const ty = py + vec.y;
    
    // Check events at facing position AND current position
    if (this.map?.events) {
      // First check facing position
      for (const ev of this.map.events) {
        if (ev.trigger === 'action' && ev.at.x === tx && ev.at.y === ty) {
          if (this.checkCond(ev.condition)) {
            this.audio.select();
            this.runEvent(ev.steps);
            return;
          }
        }
      }
      // Then check current position (for standing on interactive tiles)
      for (const ev of this.map.events) {
        if (ev.trigger === 'action' && ev.at.x === px && ev.at.y === py) {
          if (this.checkCond(ev.condition)) {
            this.audio.select();
            this.runEvent(ev.steps);
            return;
          }
        }
      }
    }
  }
  
  // === EVENTS ===
  
  checkAutoEvents() {
    if (!this.map?.events) return;
    for (const ev of this.map.events) {
      if (ev.trigger === 'auto' && this.checkCond(ev.condition)) {
        this.runEvent(ev.steps);
        return;
      }
    }
  }
  
  checkTouchEvents(x, y) {
    if (!this.map?.events) return;
    for (const ev of this.map.events) {
      if (ev.trigger === 'touch' && ev.at.x === x && ev.at.y === y) {
        if (this.checkCond(ev.condition)) {
          this.runEvent(ev.steps);
          return;
        }
      }
    }
  }
  
  runEvent(steps) {
    this.eventQueue = [...steps];
    this.nextEvent();
  }
  
  nextEvent() {
    if (this.eventQueue.length === 0) {
      this.eventQueue = null;
      return;
    }
    
    const step = this.eventQueue.shift();
    
    switch (step.type) {
      case 'showDialogue':
        this.showDialogue(step.speaker, step.text);
        break;
      case 'setFlag':
        this.flags[step.flag] = step.value;
        this.nextEvent();
        break;
      case 'giveItem':
        this.giveItem(step.itemId, step.qty);
        this.audio.getItem();
        this.nextEvent();
        break;
      case 'changeMap':
        this.eventQueue = [];
        this.loadMap(step.mapId, step.spawn);
        break;
      case 'startBattle':
        const battle = GAME_DATA.battles[step.battleId];
        if (battle) {
          this.battleEvents = { victory: battle.victory, defeat: battle.defeat };
          this.startBattle(battle.enemies[0].enemyId, null, true);
        }
        break;
      case 'endGame':
        this.showEnding(step.endingId);
        break;
      case 'gameOver':
        this.showGameOver();
        break;
      default:
        this.nextEvent();
    }
  }
  
  // === DIALOGUE ===
  
  showDialogue(speaker, text) {
    const name = speaker === 'system' ? '' :
      (GAME_DATA.actors[speaker]?.name || GAME_DATA.enemies[speaker]?.name || speaker);
    
    this.dialogue = { speaker: name, text };
    
    document.getElementById('dialogue-speaker').textContent = name;
    document.getElementById('dialogue-text').textContent = '';
    document.getElementById('dialogue-box').classList.remove('hidden');
    
    // Typewriter
    let i = 0;
    const el = document.getElementById('dialogue-text');
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        if (i % 3 === 0) this.audio.text();
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    this.typewriter = interval;
  }
  
  closeDialogue() {
    if (!this.dialogue) return;
    
    if (this.typewriter) {
      clearInterval(this.typewriter);
      this.typewriter = null;
    }
    
    this.dialogue = null;
    document.getElementById('dialogue-box').classList.add('hidden');
    this.audio.select();
    
    if (this.eventQueue) {
      this.nextEvent();
    }
  }
  
  // === BATTLE ===
  
  startBattle(enemyId, monsterKey, isBoss = false) {
    console.log(`Starting battle: ${enemyId}`);
    
    const enemyData = GAME_DATA.enemies[enemyId];
    if (!enemyData) {
      console.error(`Enemy not found: ${enemyId}`);
      return;
    }
    
    this.screen = 'battle';
    this.battle = {
      enemy: {
        id: enemyId,
        name: enemyData.name,
        hp: enemyData.stats.hp,
        maxHp: enemyData.stats.maxHp,
        stats: { ...enemyData.stats },
        ai: enemyData.ai,
        exp: enemyData.exp,
        gold: enemyData.gold,
        drops: enemyData.drops
      },
      monsterKey,
      isBoss,
      turn: 'player',
      defending: false
    };
    
    this.showScreen('battle-screen');
    this.updateBattleUI();
    this.enableBattleCmd(true);
    
    if (isBoss) {
      this.audio.bossAppear();
    } else {
      this.audio.encounter();
    }
    
    this.battleMsg(`${enemyData.name}が現れた！`);
  }
  
  updateBattleUI() {
    if (!this.battle) return;
    
    const e = this.battle.enemy;
    const h = this.getHeroStats();
    
    // Enemy
    document.getElementById('enemy-name').textContent = e.name;
    const eHpPct = (e.hp / e.maxHp) * 100;
    const eHpFill = document.querySelector('.enemy-hp .hp-fill');
    eHpFill.style.width = `${eHpPct}%`;
    eHpFill.className = 'hp-fill' + (eHpPct < 25 ? ' low' : eHpPct < 50 ? ' mid' : '');
    
    // Enemy sprite
    const sprite = this.spriteRenderer.getEnemySprite(e.id, 6);
    const spriteEl = document.getElementById('enemy-sprite');
    spriteEl.innerHTML = '';
    if (sprite) spriteEl.appendChild(sprite);
    
    // Hero
    document.getElementById('hero-hp-text').textContent = `${h.hp}/${h.maxHp}`;
    document.getElementById('hero-mp-text').textContent = `${this.hero.mp}/${this.hero.maxMp}`;
    
    const hHpPct = (h.hp / h.maxHp) * 100;
    const hHpFill = document.querySelector('.hero-hp .hp-fill');
    hHpFill.style.width = `${hHpPct}%`;
    hHpFill.className = 'hp-fill' + (hHpPct < 25 ? ' low' : hHpPct < 50 ? ' mid' : '');
    
    document.querySelector('.mp-fill').style.width = `${(this.hero.mp / this.hero.maxMp) * 100}%`;
  }
  
  battleMsg(text) {
    document.getElementById('battle-message').textContent = text;
  }
  
  enableBattleCmd(on) {
    document.querySelectorAll('.battle-cmd').forEach(b => b.disabled = !on);
  }
  
  battleCommand(cmd) {
    if (this.screen !== 'battle' || this.battle?.turn !== 'player') return;
    
    this.audio.select();
    this.enableBattleCmd(false);
    
    switch (cmd) {
      case 'attack': this.heroAttack(); break;
      case 'skill': this.heroSkill(); break;
      case 'item': this.heroItem(); break;
      case 'defend': this.heroDefend(); break;
    }
  }
  
  heroAttack() {
    const h = this.getHeroStats();
    const e = this.battle.enemy;
    
    const dmg = Math.max(1, Math.floor((h.atk - e.stats.def / 2) * (0.85 + Math.random() * 0.3)));
    e.hp = Math.max(0, e.hp - dmg);
    
    this.audio.attack();
    this.battleEffect('slash');
    this.battleMsg(`勇者の攻撃！\n${dmg}のダメージ！`);
    this.updateBattleUI();
    
    setTimeout(() => this.checkBattleEnd(), 1200);
  }
  
  heroSkill() {
    const skill = GAME_DATA.skills.brave_strike;
    if (this.hero.mp < skill.cost.mp) {
      this.battleMsg('MPが足りない！');
      this.enableBattleCmd(true);
      return;
    }
    
    this.hero.mp -= skill.cost.mp;
    
    const h = this.getHeroStats();
    const e = this.battle.enemy;
    const dmg = Math.max(1, Math.floor((h.atk * skill.power - e.stats.def / 2) * (0.9 + Math.random() * 0.2)));
    e.hp = Math.max(0, e.hp - dmg);
    
    this.audio.critical();
    this.battleEffect('slash');
    this.battleMsg(`勇者の剣！\n${dmg}のダメージ！`);
    this.updateBattleUI();
    
    setTimeout(() => this.checkBattleEnd(), 1200);
  }
  
  heroItem() {
    const potion = this.inventory.find(i => i.itemId === 'potion' || i.itemId === 'hi_potion');
    if (!potion) {
      this.battleMsg('使えるアイテムがない！');
      this.enableBattleCmd(true);
      return;
    }
    
    const item = GAME_DATA.items[potion.itemId];
    this.removeItem(potion.itemId, 1);
    
    const heal = Math.min(item.use.effects[0].value, this.hero.maxHp - this.hero.hp);
    this.hero.hp += heal;
    
    this.audio.heal();
    this.battleMsg(`${item.name}を使った！\nHPが${heal}回復！`);
    this.updateBattleUI();
    
    setTimeout(() => this.enemyTurn(), 1200);
  }
  
  heroDefend() {
    this.battle.defending = true;
    this.battleMsg('勇者は身を守っている！');
    setTimeout(() => this.enemyTurn(), 1000);
  }
  
  enemyTurn() {
    if (!this.battle || this.battle.enemy.hp <= 0) return;
    
    this.battle.turn = 'enemy';
    
    const e = this.battle.enemy;
    const h = this.getHeroStats();
    const ai = e.ai?.pattern || ['attack'];
    const action = ai[Math.floor(Math.random() * ai.length)];
    
    const defMod = this.battle.defending ? 2 : 1;
    let dmg = 0;
    let msg = '';
    
    if (action === 'powerAttack') {
      dmg = Math.max(1, Math.floor((e.stats.atk * 1.5 - h.def / defMod) * (0.85 + Math.random() * 0.3)));
      msg = `${e.name}の強攻撃！\n${dmg}のダメージ！`;
      this.audio.critical();
    } else if (action === 'defend') {
      msg = `${e.name}は身構えている…`;
    } else {
      dmg = Math.max(1, Math.floor((e.stats.atk - h.def / defMod) * (0.85 + Math.random() * 0.3)));
      msg = `${e.name}の攻撃！\n${dmg}のダメージ！`;
      this.audio.damage();
    }
    
    if (dmg > 0) {
      this.hero.hp = Math.max(0, this.hero.hp - dmg);
      this.battleEffect('damage');
    }
    
    this.battle.defending = false;
    this.battleMsg(msg);
    this.updateBattleUI();
    
    setTimeout(() => {
      if (this.hero.hp <= 0) {
        this.battleLose();
      } else {
        this.battle.turn = 'player';
        this.enableBattleCmd(true);
        this.battleMsg('どうする？');
      }
    }, 1500);
  }
  
  battleEffect(type) {
    const el = document.getElementById('battle-effect');
    el.className = `battle-effect ${type}`;
    setTimeout(() => el.className = 'battle-effect', 250);
  }
  
  checkBattleEnd() {
    if (this.battle.enemy.hp <= 0) {
      this.battleWin();
    } else {
      setTimeout(() => this.enemyTurn(), 500);
    }
  }
  
  battleWin() {
    this.audio.victory();
    
    const e = this.battle.enemy;
    
    // Remove monster
    if (this.battle.monsterKey) {
      this.killedMonsters.add(this.battle.monsterKey);
      delete this.monsters[this.battle.monsterKey];
    }
    
    // Rewards
    const exp = e.exp || 10;
    const gold = e.gold || 5;
    this.gold += gold;
    this.giveExp(exp);
    
    // Drops
    let dropMsg = '';
    if (e.drops) {
      for (const d of e.drops) {
        if (Math.random() < d.chance) {
          this.giveItem(d.itemId, d.qty);
          dropMsg = `\n${GAME_DATA.items[d.itemId]?.name}をゲット！`;
        }
      }
    }
    
    this.battleMsg(`${e.name}を倒した！\n${exp}EXP ${gold}G獲得！${dropMsg}`);
    
    setTimeout(() => {
      if (this.battleEvents?.victory) {
        this.eventQueue = [...this.battleEvents.victory];
        this.battleEvents = null;
        this.endBattle();
        this.nextEvent();
      } else {
        this.endBattle();
      }
    }, 2500);
  }
  
  battleLose() {
    this.audio.defeat();
    this.battleMsg('勇者は倒れた…');
    
    setTimeout(() => {
      if (this.battleEvents?.defeat) {
        this.eventQueue = [...this.battleEvents.defeat];
        this.battleEvents = null;
        this.endBattle();
        this.nextEvent();
      } else {
        this.showGameOver();
      }
    }, 2000);
  }
  
  endBattle() {
    this.battle = null;
    this.screen = 'map';
    this.showScreen('map-screen');
    this.enableBattleCmd(true);
  }
  
  // === STATS ===
  
  getHeroStats() {
    const s = { ...this.hero };
    
    // Equipment bonuses
    for (const slot of ['weapon', 'armor']) {
      const eq = GAME_DATA.equipment[this.hero.equipment[slot]];
      if (eq?.mods) {
        for (const [k, v] of Object.entries(eq.mods)) {
          s[k] = (s[k] || 0) + v;
        }
      }
    }
    return s;
  }
  
  giveExp(amt) {
    this.hero.exp += amt;
    
    const table = GAME_DATA.constants.expTable;
    while (this.hero.level < GAME_DATA.constants.maxLevel && this.hero.exp >= table[this.hero.level]) {
      this.levelUp();
    }
  }
  
  levelUp() {
    this.hero.level++;
    const g = GAME_DATA.actors.hero.growths;
    this.hero.maxHp += g.hp;
    this.hero.hp = this.hero.maxHp;
    this.hero.maxMp += g.mp;
    this.hero.mp = this.hero.maxMp;
    this.hero.atk += g.atk;
    this.hero.def += g.def;
    
    this.audio.levelUp();
    this.showDialogue('system', `レベルアップ！\n勇者はLv.${this.hero.level}になった！`);
  }
  
  giveItem(id, qty = 1) {
    const existing = this.inventory.find(i => i.itemId === id);
    if (existing) existing.qty += qty;
    else this.inventory.push({ itemId: id, qty });
  }
  
  removeItem(id, qty = 1) {
    const existing = this.inventory.find(i => i.itemId === id);
    if (existing) {
      existing.qty -= qty;
      if (existing.qty <= 0) {
        this.inventory.splice(this.inventory.indexOf(existing), 1);
      }
    }
  }
  
  // === MENU ===
  
  openMenu() {
    if (this.screen !== 'map' || this.dialogue) return;
    this.audio.select();
    this.screen = 'menu';
    this.showScreen('menu-screen');
    this.updateMenuUI();
  }
  
  closeMenu() {
    this.audio.cancel();
    this.screen = 'map';
    this.showScreen('map-screen');
  }
  
  menuSelect(menu) {
    this.audio.cursor();
    
    document.querySelectorAll('.menu-item').forEach(b => {
      b.classList.toggle('active', b.dataset.menu === menu);
    });
    document.querySelectorAll('.menu-view').forEach(v => v.classList.remove('active'));
    
    if (menu === 'close') {
      this.closeMenu();
      return;
    }
    
    document.getElementById(`${menu}-view`)?.classList.add('active');
  }
  
  updateMenuUI() {
    const h = this.getHeroStats();
    
    document.getElementById('stat-level').textContent = this.hero.level;
    document.getElementById('stat-hp').textContent = this.hero.hp;
    document.getElementById('stat-maxhp').textContent = this.hero.maxHp;
    document.getElementById('stat-mp').textContent = this.hero.mp;
    document.getElementById('stat-maxmp').textContent = this.hero.maxMp;
    document.getElementById('stat-atk').textContent = h.atk;
    document.getElementById('stat-def').textContent = h.def;
    document.getElementById('stat-exp').textContent = this.hero.exp;
    document.getElementById('stat-gold').textContent = this.gold;
    
    // Items
    const list = document.getElementById('item-list');
    list.innerHTML = '';
    if (this.inventory.length === 0) {
      list.innerHTML = '<li style="color:#666">アイテムなし</li>';
    } else {
      for (const inv of this.inventory) {
        const item = GAME_DATA.items[inv.itemId];
        const li = document.createElement('li');
        li.innerHTML = `<span>${item?.name || inv.itemId}</span><span class="item-qty">x${inv.qty}</span>`;
        li.onclick = () => this.useItem(inv.itemId);
        list.appendChild(li);
      }
    }
    
    // Equipment
    document.getElementById('equip-weapon').textContent = 
      GAME_DATA.equipment[this.hero.equipment.weapon]?.name || 'なし';
    document.getElementById('equip-armor').textContent = 
      GAME_DATA.equipment[this.hero.equipment.armor]?.name || 'なし';
  }
  
  useItem(id) {
    const item = GAME_DATA.items[id];
    if (!item || item.type !== 'consumable') return;
    
    if (item.use.effects[0].type === 'healHp' && this.hero.hp < this.hero.maxHp) {
      const heal = Math.min(item.use.effects[0].value, this.hero.maxHp - this.hero.hp);
      this.hero.hp += heal;
      this.removeItem(id, 1);
      this.audio.heal();
      this.closeMenu();
      this.showDialogue('system', `${item.name}を使った！\nHPが${heal}回復！`);
    }
  }
  
  // === SCREENS ===
  
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  }
  
  showGameOver() {
    this.screen = 'gameover';
    this.showScreen('gameover-screen');
  }
  
  showEnding(id) {
    const ending = GAME_DATA.endings[id];
    if (!ending) return;
    
    this.audio.gameClear();
    this.screen = 'ending';
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-text').textContent = ending.text;
    this.showScreen('ending-screen');
  }
  
  // === GAME LOOP ===
  
  loop(time) {
    const dt = time - this.lastTime;
    this.lastTime = time;
    
    this.update(dt);
    this.render();
    
    requestAnimationFrame(t => this.loop(t));
  }
  
  update(dt) {
    if (this.screen !== 'map' || this.dialogue) return;
    
    // Movement
    if (this.moving) {
      this.moveProgress += dt;
      const t = Math.min(1, this.moveProgress / this.moveTime);
      const ease = 1 - Math.pow(1 - t, 2);
      
      this.pos.x = this.fromPos.x + (this.toPos.x - this.fromPos.x) * ease;
      this.pos.y = this.fromPos.y + (this.toPos.y - this.fromPos.y) * ease;
      
      if (t >= 1) {
        this.pos = { ...this.toPos };
        this.moving = false;
        this.checkTouchEvents(this.pos.x, this.pos.y);
      }
    } else {
      // Input
      if (this.keys['arrowup'] || this.keys['w']) this.tryMove('up');
      else if (this.keys['arrowdown'] || this.keys['s']) this.tryMove('down');
      else if (this.keys['arrowleft'] || this.keys['a']) this.tryMove('left');
      else if (this.keys['arrowright'] || this.keys['d']) this.tryMove('right');
    }
    
    // Monster movement (slow)
    if (!this.monsterTimer) this.monsterTimer = 0;
    this.monsterTimer += dt;
    if (this.monsterTimer > 2000) {
      this.monsterTimer = 0;
      this.moveMonsters();
    }
  }
  
  moveMonsters() {
    const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    
    for (const [key, m] of Object.entries(this.monsters)) {
      if (m.movePattern === 'none') continue;
      if (Math.random() > 0.3) continue;
      
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      const nx = m.x + d.x;
      const ny = m.y + d.y;
      
      if (!this.isBlocked(nx, ny) && !(nx === Math.round(this.pos.x) && ny === Math.round(this.pos.y))) {
        m.x = nx;
        m.y = ny;
      }
    }
  }
  
  render() {
    if (this.screen !== 'map') return;
    
    const ctx = this.ctx;
    if (!this.map) return;
    
    // Clear with map-based color (bright!)
    let bgColor = '#2d3436';
    switch (this.map.tileData) {
      case 'field': bgColor = '#00b894'; break;       // Bright teal green
      case 'castle_inside': bgColor = '#b97a57'; break; // Warm brown
      case 'castle_outside': bgColor = '#636e72'; break; // Cool gray
      case 'tower_inside': bgColor = '#2c2c54'; break;  // Dark purple
      case 'town': bgColor = '#a0a0c0'; break;        // Light purple-gray
    }
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Camera
    const camX = this.pos.x * this.scaledTile - this.canvas.width / 2 + this.scaledTile / 2;
    const camY = this.pos.y * this.scaledTile - this.canvas.height / 2 + this.scaledTile / 2;
    const maxCamX = this.map.size.w * this.scaledTile - this.canvas.width;
    const maxCamY = this.map.size.h * this.scaledTile - this.canvas.height;
    const cx = Math.max(0, Math.min(maxCamX, camX));
    const cy = Math.max(0, Math.min(maxCamY, camY));
    
    // Background
    if (this.mapBg) {
      if (!this._bgLoggedOnce) {
        console.log('Drawing mapBg:', this.mapBg.width, 'x', this.mapBg.height, 'at', -cx, -cy);
        this._bgLoggedOnce = true;
      }
      ctx.drawImage(this.mapBg, -cx, -cy);
    } else {
      // Fallback - draw colored background based on map type
      switch (this.map.tileData) {
        case 'field':
          ctx.fillStyle = '#3cb371';
          break;
        case 'castle_inside':
          ctx.fillStyle = '#5a4a3a';
          break;
        case 'castle_outside':
          ctx.fillStyle = '#4a4a5a';
          break;
        case 'tower_inside':
          ctx.fillStyle = '#1a1a2e';
          break;
        default:
          ctx.fillStyle = '#6a6a7a';
      }
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Items (treasures)
    if (this.map.items) {
      for (const item of this.map.items) {
        // Check if this item has been obtained via related flag
        let taken = false;
        if (item.id === 'chest1') taken = this.flags.got_castle_key;
        if (item.id === 'chest2') taken = this.flags.got_castle_chest;
        if (taken) continue;
        
        // Draw chest with sparkle effect
        const spr = this.spriteRenderer.getTileSprite(item.sprite || 'chest', this.scale);
        if (spr) {
          const px = item.pos.x * this.scaledTile - cx;
          const py = item.pos.y * this.scaledTile - cy;
          
          // Add glow effect for items
          ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
          ctx.fillStyle = '#FFCC00';
          ctx.fillRect(px - 2, py - 2, this.scaledTile + 4, this.scaledTile + 4);
          ctx.globalAlpha = 1;
          
          ctx.drawImage(spr, px, py);
        }
      }
    }
    
    // NPCs
    if (this.map.npcs) {
      for (const npc of this.map.npcs) {
        if (!this.checkCond(npc.condition)) continue;
        
        const actor = GAME_DATA.actors[npc.actorId];
        const spr = this.spriteRenderer.getCharacterSprite(actor?.spriteKey || npc.actorId, 'down', this.scale);
        if (spr) ctx.drawImage(spr, npc.pos.x * this.scaledTile - cx, npc.pos.y * this.scaledTile - cy);
      }
    }
    
    // Monsters
    for (const [key, m] of Object.entries(this.monsters)) {
      const spr = this.spriteRenderer.getEnemySprite(m.enemyId, this.scale);
      if (spr) ctx.drawImage(spr, m.x * this.scaledTile - cx, m.y * this.scaledTile - cy);
    }
    
    // Hero
    const heroSpr = this.spriteRenderer.getCharacterSprite('hero', this.dir, this.scale);
    if (heroSpr) ctx.drawImage(heroSpr, this.pos.x * this.scaledTile - cx, this.pos.y * this.scaledTile - cy);
    
    // Exit arrows
    if (this.map.exits) {
      for (const exit of this.map.exits) {
        if (exit.condition && !this.checkCond(exit.condition)) continue;
        
        const spr = this.spriteRenderer.getTileSprite('exit_arrow', this.scale);
        if (spr) {
          ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.3;
          ctx.drawImage(spr, exit.at.x * this.scaledTile - cx, exit.at.y * this.scaledTile - cy);
          ctx.globalAlpha = 1;
        }
      }
    }
  }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
  console.log('Starting game...');
  window.game = new Game();
});
