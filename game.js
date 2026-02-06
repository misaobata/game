// ============================================
// ピクセルの王国と最後の塔
// Game Engine - Fixed Version
// ============================================

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    
    // Core systems
    this.spriteRenderer = new SpriteRenderer();
    this.audio = new AudioSystem();
    
    // Display settings
    this.tileSize = 16;
    this.displayScale = 2;
    this.scaledTileSize = this.tileSize * this.displayScale;
    
    // Movement settings - MUCH SLOWER for precise control
    this.moveSpeed = 0.004; // Very slow: tiles per ms
    this.moveCooldown = 150; // ms between moves
    this.lastInputTime = 0;
    this.currentMoveTime = 0;
    this.startPosition = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    
    // Input state
    this.input = { up: false, down: false, left: false, right: false };
    this.inputHeld = false;
    
    // Game state
    this.state = {
      screen: 'map',
      currentMapId: null,
      currentMap: null,
      mapBackground: null,
      position: { x: 0, y: 0 },
      direction: 'down',
      isMoving: false,
      flags: { ...GAME_DATA.flags },
      party: [],
      partyStats: {},
      inventory: [],
      gold: 100,
      battleState: null,
      currentDialogue: null,
      eventSteps: null
    };
    
    this.lastTime = 0;
    this.defeatedMonsters = new Set();
    this.monsterPositions = {};
    this.monsterMoveTimer = 0;
    
    this.init();
  }
  
  init() {
    this.initParty();
    this.setupInput();
    this.setupUI();
    this.loadMap(GAME_DATA.meta.starting.mapId, GAME_DATA.meta.starting.spawn);
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  initParty() {
    const heroData = GAME_DATA.actors.hero;
    this.state.party = ['hero'];
    this.state.partyStats = {
      hero: {
        ...JSON.parse(JSON.stringify(heroData.stats)),
        equipment: { ...heroData.equipment },
        skills: [...heroData.skills]
      }
    };
    this.state.inventory = JSON.parse(JSON.stringify(heroData.inventory || []));
    this.state.gold = heroData.stats.gold || 100;
  }
  
  setupInput() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    document.addEventListener('click', () => this.audio.resume(), { once: true });
    document.addEventListener('keydown', () => this.audio.resume(), { once: true });
  }
  
  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (this.state.screen === 'map' && !this.state.currentDialogue) {
      if (key === 'arrowup' || key === 'w') { this.input.up = true; e.preventDefault(); }
      if (key === 'arrowdown' || key === 's') { this.input.down = true; e.preventDefault(); }
      if (key === 'arrowleft' || key === 'a') { this.input.left = true; e.preventDefault(); }
      if (key === 'arrowright' || key === 'd') { this.input.right = true; e.preventDefault(); }
      if (key === 'enter' || key === ' ') {
        e.preventDefault();
        this.handleAction();
      }
      if (key === 'escape' || key === 'm') {
        this.toggleMenu();
      }
    } else if (this.state.currentDialogue) {
      if (key === 'enter' || key === ' ') {
        e.preventDefault();
        this.advanceDialogue();
      }
    } else if (this.state.screen === 'menu') {
      if (key === 'escape' || key === 'm') {
        this.closeMenu();
      }
    } else if (this.state.screen === 'battle') {
      // Battle controls
      if (key === '1') this.handleBattleCommand('attack');
      if (key === '2') this.handleBattleCommand('skill');
      if (key === '3') this.handleBattleCommand('item');
      if (key === '4') this.handleBattleCommand('defend');
    }
  }
  
  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (key === 'arrowup' || key === 'w') this.input.up = false;
    if (key === 'arrowdown' || key === 's') this.input.down = false;
    if (key === 'arrowleft' || key === 'a') this.input.left = false;
    if (key === 'arrowright' || key === 'd') this.input.right = false;
  }
  
  setupUI() {
    document.getElementById('btn-menu')?.addEventListener('click', () => this.toggleMenu());
    
    document.querySelectorAll('.battle-cmd').forEach(btn => {
      btn.addEventListener('click', () => this.handleBattleCommand(btn.dataset.cmd));
    });
    
    document.querySelectorAll('.menu-item').forEach(btn => {
      btn.addEventListener('click', () => this.selectMenuItem(btn.dataset.menu));
    });
    
    document.getElementById('btn-retry')?.addEventListener('click', () => location.reload());
    document.getElementById('btn-title')?.addEventListener('click', () => location.reload());
    document.getElementById('dialogue-box')?.addEventListener('click', () => this.advanceDialogue());
  }
  
  // === MAP ===
  
  loadMap(mapId, spawn) {
    const map = GAME_DATA.maps[mapId];
    if (!map) {
      console.error(`Map not found: ${mapId}`);
      return;
    }
    
    console.log(`Loading map: ${mapId}`);
    
    this.state.currentMapId = mapId;
    this.state.currentMap = { ...map, id: mapId };
    this.state.position = { x: spawn.x, y: spawn.y };
    this.state.isMoving = false;
    
    // Generate map background with tiles
    this.state.mapBackground = this.spriteRenderer.generateMapBackground(map, this.displayScale);
    
    // Initialize monster positions
    this.initMonsterPositions();
    
    // Update UI
    document.getElementById('map-name').textContent = `${map.name} (Lv.${map.recommendedLevel})`;
    
    // Check auto events
    setTimeout(() => this.checkAutoEvents(), 200);
  }
  
  initMonsterPositions() {
    const map = this.state.currentMap;
    this.monsterPositions = {};
    
    if (map.monsters) {
      map.monsters.forEach((monster, idx) => {
        const key = `${map.id}_${idx}`;
        if (!this.defeatedMonsters.has(key) && this.checkCondition(monster.condition)) {
          this.monsterPositions[key] = { x: monster.pos.x, y: monster.pos.y };
        }
      });
    }
  }
  
  // === MOVEMENT ===
  
  move(direction) {
    if (this.state.isMoving || this.state.screen !== 'map' || this.state.currentDialogue) return;
    
    const now = Date.now();
    if (now - this.lastInputTime < this.moveCooldown) return;
    this.lastInputTime = now;
    
    const vectors = GAME_DATA.constants.directionVectors;
    const vector = vectors[direction];
    
    this.state.direction = direction;
    
    const currentX = Math.round(this.state.position.x);
    const currentY = Math.round(this.state.position.y);
    const newX = currentX + vector.x;
    const newY = currentY + vector.y;
    
    // Check exit
    const exit = this.checkExit(newX, newY);
    if (exit) {
      if (!exit.condition || this.checkCondition(exit.condition)) {
        this.audio.step();
        this.loadMap(exit.toMapId, exit.spawn);
        return;
      }
    }
    
    // Check collision with walls/NPCs
    if (!this.checkCollision(newX, newY)) {
      // Check monster collision BEFORE moving
      const monsterKey = this.checkMonsterAt(newX, newY);
      if (monsterKey) {
        this.audio.encounter();
        const map = this.state.currentMap;
        const monsterIdx = parseInt(monsterKey.split('_').pop());
        const monster = map.monsters[monsterIdx];
        this.startBattle(monster.enemyId, 1, monsterKey, monster.boss);
        return;
      }
      
      // Start movement
      this.state.isMoving = true;
      this.startPosition = { x: currentX, y: currentY };
      this.targetPosition = { x: newX, y: newY };
      this.currentMoveTime = 0;
      this.audio.step();
    }
  }
  
  checkCollision(x, y) {
    const map = this.state.currentMap;
    if (!map) return true;
    
    if (x < 0 || y < 0 || x >= map.size.w || y >= map.size.h) return true;
    if (map.collision[y]?.[x] === 1) return true;
    
    // NPC collision
    if (map.npcs) {
      for (const npc of map.npcs) {
        if (!this.checkCondition(npc.condition)) continue;
        if (npc.pos.x === x && npc.pos.y === y) return true;
      }
    }
    
    return false;
  }
  
  checkMonsterAt(x, y) {
    const map = this.state.currentMap;
    if (!map?.monsters) return null;
    
    for (let idx = 0; idx < map.monsters.length; idx++) {
      const monster = map.monsters[idx];
      const key = `${map.id}_${idx}`;
      const pos = this.monsterPositions[key];
      
      if (!pos || this.defeatedMonsters.has(key)) continue;
      if (!this.checkCondition(monster.condition)) continue;
      
      if (pos.x === x && pos.y === y) {
        return key;
      }
    }
    return null;
  }
  
  checkExit(x, y) {
    const map = this.state.currentMap;
    if (!map?.exits) return null;
    
    for (const exit of map.exits) {
      if (exit.at.x === x && exit.at.y === y) {
        return exit;
      }
    }
    return null;
  }
  
  checkCondition(condition) {
    if (!condition) return true;
    
    let result = true;
    if (condition.flag !== undefined) {
      result = result && (this.state.flags[condition.flag] === condition.equals);
    }
    if (condition.flag2 !== undefined) {
      result = result && (this.state.flags[condition.flag2] === condition.equals2);
    }
    return result;
  }
  
  handleAction() {
    if (this.state.isMoving) return;
    
    const vectors = GAME_DATA.constants.directionVectors;
    const vector = vectors[this.state.direction];
    const targetX = Math.round(this.state.position.x) + vector.x;
    const targetY = Math.round(this.state.position.y) + vector.y;
    
    this.checkActionEvents(targetX, targetY);
  }
  
  // === EVENTS ===
  
  checkAutoEvents() {
    const map = this.state.currentMap;
    if (!map?.events) return;
    
    for (const event of map.events) {
      if (event.trigger === 'auto' && this.checkCondition(event.condition)) {
        this.runEvent(event);
        break;
      }
    }
  }
  
  checkTouchEvents(x, y) {
    const map = this.state.currentMap;
    if (!map?.events) return;
    
    for (const event of map.events) {
      if (event.trigger === 'touch' && event.at.x === x && event.at.y === y) {
        if (this.checkCondition(event.condition)) {
          this.runEvent(event);
          return;
        }
      }
    }
    
    // Check item pickup
    this.checkItemPickup(x, y);
  }
  
  checkActionEvents(x, y) {
    const map = this.state.currentMap;
    if (!map?.events) return;
    
    for (const event of map.events) {
      if (event.trigger === 'action' && event.at.x === x && event.at.y === y) {
        if (this.checkCondition(event.condition)) {
          this.audio.select();
          this.runEvent(event);
          return;
        }
      }
    }
    
    // Check item/chest action
    this.checkItemAction(x, y);
  }
  
  checkItemPickup(x, y) {
    const map = this.state.currentMap;
    if (!map?.items) return;
    
    for (const item of map.items) {
      if (item.pos.x === x && item.pos.y === y && item.sprite === 'sparkle') {
        const flagKey = `item_${map.id}_${item.id}`;
        if (!this.state.flags[flagKey]) {
          this.state.flags[flagKey] = true;
          if (item.itemId) {
            this.giveItem(item.itemId, 1);
            const itemData = GAME_DATA.items[item.itemId];
            this.audio.getItem();
            this.showDialogue('system', `${itemData?.name || item.itemId}を手に入れた！`);
          }
        }
      }
    }
  }
  
  checkItemAction(x, y) {
    const map = this.state.currentMap;
    if (!map?.items) return;
    
    for (const item of map.items) {
      if (item.pos.x === x && item.pos.y === y) {
        const flagKey = `item_${map.id}_${item.id}`;
        if (this.state.flags[flagKey]) continue;
        
        if (item.sprite === 'pot') {
          this.audio.select();
          // Pot already handled by events
        } else if (item.sprite === 'chest') {
          this.audio.chest();
          // Chest already handled by events
        }
      }
    }
  }
  
  runEvent(event) {
    this.state.eventSteps = [...event.steps];
    this.processNextEventStep();
  }
  
  processNextEventStep() {
    if (!this.state.eventSteps || this.state.eventSteps.length === 0) {
      this.state.eventSteps = null;
      return;
    }
    
    const step = this.state.eventSteps.shift();
    
    switch (step.type) {
      case 'showDialogue':
        this.showDialogue(step.speaker, step.text, () => this.processNextEventStep());
        break;
        
      case 'setFlag':
        this.state.flags[step.flag] = step.value;
        this.processNextEventStep();
        break;
        
      case 'giveItem':
        this.giveItem(step.itemId, step.qty);
        this.audio.getItem();
        this.processNextEventStep();
        break;
        
      case 'startBattle':
        const battle = GAME_DATA.battles[step.battleId];
        if (battle) {
          this.state.pendingBattleVictory = battle.victory;
          this.state.pendingBattleDefeat = battle.defeat;
          const enemy = battle.enemies[0];
          this.startBattle(enemy.enemyId, enemy.qty, null, true);
        }
        break;
        
      case 'endGame':
        this.showEnding(step.endingId);
        break;
        
      case 'gameOver':
        this.showGameOver();
        break;
        
      default:
        this.processNextEventStep();
    }
  }
  
  // === DIALOGUE ===
  
  showDialogue(speaker, text, callback) {
    const speakerName = speaker === 'system' ? '' : 
      (GAME_DATA.actors[speaker]?.name || GAME_DATA.enemies[speaker]?.name || speaker);
    
    this.state.currentDialogue = { speaker: speakerName, text, callback };
    
    const box = document.getElementById('dialogue-box');
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');
    
    speakerEl.textContent = speakerName;
    textEl.textContent = '';
    box.classList.remove('hidden');
    
    // Typewriter effect
    let i = 0;
    const typewriter = setInterval(() => {
      if (i < text.length) {
        textEl.textContent += text[i];
        if (i % 3 === 0) this.audio.text();
        i++;
      } else {
        clearInterval(typewriter);
      }
    }, 40);
    
    this.state.typewriterInterval = typewriter;
  }
  
  advanceDialogue() {
    if (!this.state.currentDialogue) return;
    
    if (this.state.typewriterInterval) {
      clearInterval(this.state.typewriterInterval);
      this.state.typewriterInterval = null;
    }
    
    const callback = this.state.currentDialogue.callback;
    this.state.currentDialogue = null;
    
    document.getElementById('dialogue-box').classList.add('hidden');
    this.audio.select();
    
    if (callback) callback();
  }
  
  // === BATTLE ===
  
  startBattle(enemyId, count = 1, monsterKey = null, isBoss = false) {
    const enemy = GAME_DATA.enemies[enemyId];
    if (!enemy) {
      console.error(`Enemy not found: ${enemyId}`);
      return;
    }
    
    console.log(`Starting battle with: ${enemy.name}`);
    
    this.state.screen = 'battle';
    this.state.battleState = {
      enemies: [{
        ...JSON.parse(JSON.stringify(enemy)),
        id: enemyId,
        hp: enemy.stats.hp,
        maxHp: enemy.stats.maxHp
      }],
      turn: 'player',
      monsterKey,
      isBoss,
      defending: {}
    };
    
    this.showScreen('battle-screen');
    this.updateBattleUI();
    this.enableBattleCommands(true);
    
    if (isBoss) {
      this.audio.bossAppear();
    }
    
    this.showBattleMessage(`${enemy.name}が現れた！`);
  }
  
  updateBattleUI() {
    const bs = this.state.battleState;
    if (!bs) return;
    
    const enemy = bs.enemies[0];
    const hero = this.getTotalStats('hero');
    
    // Enemy
    document.getElementById('enemy-name').textContent = enemy.name;
    const enemyHpFill = document.querySelector('.enemy-hp .hp-fill');
    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
    enemyHpFill.style.width = `${hpPercent}%`;
    enemyHpFill.className = 'hp-fill' + (hpPercent < 25 ? ' low' : hpPercent < 50 ? ' mid' : '');
    
    // Enemy sprite
    const enemySprite = this.spriteRenderer.getEnemySprite(enemy.id, 4);
    const enemySpriteEl = document.getElementById('enemy-sprite');
    enemySpriteEl.innerHTML = '';
    if (enemySprite) {
      enemySpriteEl.appendChild(enemySprite);
    }
    
    // Hero
    document.getElementById('hero-hp-text').textContent = `${hero.hp}/${hero.maxHp}`;
    document.getElementById('hero-mp-text').textContent = `${hero.mp}/${hero.maxMp}`;
    
    const heroHpFill = document.querySelector('.hero-hp .hp-fill');
    const heroHpPercent = (hero.hp / hero.maxHp) * 100;
    heroHpFill.style.width = `${heroHpPercent}%`;
    heroHpFill.className = 'hp-fill' + (heroHpPercent < 25 ? ' low' : heroHpPercent < 50 ? ' mid' : '');
    
    const heroMpFill = document.querySelector('.mp-fill');
    heroMpFill.style.width = `${(hero.mp / hero.maxMp) * 100}%`;
  }
  
  showBattleMessage(text) {
    document.getElementById('battle-message').textContent = text;
  }
  
  enableBattleCommands(enabled) {
    document.querySelectorAll('.battle-cmd').forEach(btn => {
      btn.disabled = !enabled;
    });
  }
  
  handleBattleCommand(cmd) {
    if (this.state.screen !== 'battle') return;
    if (this.state.battleState?.turn !== 'player') return;
    
    this.audio.select();
    this.enableBattleCommands(false);
    
    switch (cmd) {
      case 'attack':
        this.playerAttack();
        break;
      case 'skill':
        this.playerSkill();
        break;
      case 'item':
        this.playerItem();
        break;
      case 'defend':
        this.playerDefend();
        break;
    }
  }
  
  playerAttack() {
    const hero = this.getTotalStats('hero');
    const enemy = this.state.battleState.enemies[0];
    
    const baseDamage = Math.max(1, hero.atk - enemy.stats.def / 2);
    const variance = Math.random() * 0.3 + 0.85;
    const damage = Math.floor(baseDamage * variance);
    
    enemy.hp = Math.max(0, enemy.hp - damage);
    
    this.audio.attack();
    this.showBattleEffect('slash');
    this.showBattleMessage(`勇者の攻撃！\n${damage}のダメージ！`);
    this.updateBattleUI();
    
    setTimeout(() => this.checkBattleEnd(), 1200);
  }
  
  playerSkill() {
    const hero = this.getPartyMember('hero');
    const skill = GAME_DATA.skills.brave_strike;
    
    if (hero.mp < skill.cost.mp) {
      this.showBattleMessage('MPが足りない！');
      this.enableBattleCommands(true);
      return;
    }
    
    hero.mp -= skill.cost.mp;
    
    const heroStats = this.getTotalStats('hero');
    const enemy = this.state.battleState.enemies[0];
    const baseDamage = Math.max(1, heroStats.atk * skill.power - enemy.stats.def / 2);
    const damage = Math.floor(baseDamage * (Math.random() * 0.2 + 0.9));
    
    enemy.hp = Math.max(0, enemy.hp - damage);
    
    this.audio.critical();
    this.showBattleEffect('slash');
    this.showBattleMessage(`勇者の剣！\n${damage}のダメージ！`);
    this.updateBattleUI();
    
    setTimeout(() => this.checkBattleEnd(), 1200);
  }
  
  playerItem() {
    const potion = this.state.inventory.find(i => 
      i.itemId === 'potion' || i.itemId === 'hi_potion'
    );
    
    if (!potion) {
      this.showBattleMessage('使えるアイテムがない！');
      this.enableBattleCommands(true);
      return;
    }
    
    const item = GAME_DATA.items[potion.itemId];
    this.removeItem(potion.itemId, 1);
    
    const hero = this.getPartyMember('hero');
    const healAmount = item.use.effects[0].value;
    const heal = Math.min(healAmount, hero.maxHp - hero.hp);
    hero.hp += heal;
    
    this.audio.heal();
    this.showBattleMessage(`${item.name}を使った！\nHPが${heal}回復した！`);
    this.updateBattleUI();
    
    setTimeout(() => this.enemyTurn(), 1200);
  }
  
  playerDefend() {
    this.state.battleState.defending['hero'] = true;
    this.showBattleMessage('勇者は身を守っている！');
    setTimeout(() => this.enemyTurn(), 1000);
  }
  
  enemyTurn() {
    const bs = this.state.battleState;
    if (!bs || bs.enemies[0].hp <= 0) return;
    
    bs.turn = 'enemy';
    
    const enemy = bs.enemies[0];
    const ai = enemy.ai?.pattern || ['attack'];
    const action = ai[Math.floor(Math.random() * ai.length)];
    
    const hero = this.getPartyMember('hero');
    const heroStats = this.getTotalStats('hero');
    
    let damage = 0;
    let message = '';
    
    const defending = bs.defending['hero'];
    const defMod = defending ? 2 : 1;
    
    switch (action) {
      case 'attack':
        damage = Math.max(1, Math.floor((enemy.stats.atk - heroStats.def / defMod) * (Math.random() * 0.3 + 0.85)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の攻撃！\n${damage}のダメージ！`;
        this.audio.damage();
        this.showBattleEffect('damage');
        break;
        
      case 'powerAttack':
        damage = Math.max(1, Math.floor((enemy.stats.atk * 1.5 - heroStats.def / defMod) * (Math.random() * 0.3 + 0.85)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の強攻撃！\n${damage}のダメージ！`;
        this.audio.critical();
        this.showBattleEffect('damage');
        break;
        
      case 'defend':
        message = `${enemy.name}は身構えている…`;
        break;
        
      default:
        damage = Math.max(1, Math.floor((enemy.stats.atk - heroStats.def / defMod) * (Math.random() * 0.3 + 0.85)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の攻撃！\n${damage}のダメージ！`;
        this.audio.damage();
        this.showBattleEffect('damage');
    }
    
    bs.defending = {};
    this.showBattleMessage(message);
    this.updateBattleUI();
    
    setTimeout(() => {
      if (hero.hp <= 0) {
        this.battleDefeat();
      } else {
        bs.turn = 'player';
        this.enableBattleCommands(true);
        this.showBattleMessage('どうする？');
      }
    }, 1500);
  }
  
  showBattleEffect(type) {
    const effectEl = document.getElementById('battle-effect');
    effectEl.className = `battle-effect ${type}`;
    setTimeout(() => {
      effectEl.className = 'battle-effect';
    }, 200);
  }
  
  checkBattleEnd() {
    const bs = this.state.battleState;
    const enemy = bs.enemies[0];
    
    if (enemy.hp <= 0) {
      this.battleVictory();
    } else {
      setTimeout(() => this.enemyTurn(), 500);
    }
  }
  
  battleVictory() {
    const bs = this.state.battleState;
    const enemy = bs.enemies[0];
    const enemyData = GAME_DATA.enemies[enemy.id];
    
    this.audio.victory();
    
    if (bs.monsterKey) {
      this.defeatedMonsters.add(bs.monsterKey);
    }
    
    const expGain = enemyData.exp || 10;
    const goldGain = enemyData.gold || 5;
    
    this.state.gold += goldGain;
    this.giveExp('hero', expGain);
    
    // Drops
    let dropMessage = '';
    if (enemyData.drops) {
      for (const drop of enemyData.drops) {
        if (Math.random() < drop.chance) {
          this.giveItem(drop.itemId, drop.qty);
          const itemData = GAME_DATA.items[drop.itemId];
          dropMessage = `\n${itemData?.name}を手に入れた！`;
        }
      }
    }
    
    this.showBattleMessage(`${enemy.name}を倒した！\n${expGain}EXP ${goldGain}G獲得！${dropMessage}`);
    
    setTimeout(() => {
      if (this.state.pendingBattleVictory) {
        this.state.eventSteps = [...this.state.pendingBattleVictory];
        this.state.pendingBattleVictory = null;
        this.state.pendingBattleDefeat = null;
        this.endBattle();
        this.processNextEventStep();
      } else {
        this.endBattle();
      }
    }, 2500);
  }
  
  battleDefeat() {
    this.audio.defeat();
    this.showBattleMessage('勇者は倒れた…');
    
    setTimeout(() => {
      if (this.state.pendingBattleDefeat) {
        this.state.eventSteps = [...this.state.pendingBattleDefeat];
        this.state.pendingBattleVictory = null;
        this.state.pendingBattleDefeat = null;
        this.endBattle();
        this.processNextEventStep();
      } else {
        this.showGameOver();
      }
    }, 2000);
  }
  
  endBattle() {
    this.state.battleState = null;
    this.state.screen = 'map';
    this.showScreen('map-screen');
    this.enableBattleCommands(true);
  }
  
  // === STATS ===
  
  getPartyMember(actorId) {
    return this.state.partyStats[actorId];
  }
  
  getTotalStats(actorId) {
    const member = this.getPartyMember(actorId);
    if (!member) return null;
    
    const stats = { ...member };
    
    for (const slot of ['weapon', 'armor']) {
      const equipId = member.equipment[slot];
      const equip = GAME_DATA.equipment[equipId];
      if (equip?.mods) {
        for (const [stat, value] of Object.entries(equip.mods)) {
          stats[stat] = (stats[stat] || 0) + value;
        }
      }
    }
    
    return stats;
  }
  
  giveExp(memberId, amount) {
    const member = this.getPartyMember(memberId);
    if (!member) return;
    
    member.exp += amount;
    
    const expTable = GAME_DATA.constants.expTable;
    const maxLevel = GAME_DATA.constants.maxLevel;
    
    while (member.level < maxLevel && member.exp >= expTable[member.level]) {
      this.levelUp(memberId);
    }
  }
  
  levelUp(memberId) {
    const member = this.getPartyMember(memberId);
    const actor = GAME_DATA.actors[memberId];
    if (!member || !actor) return;
    
    member.level++;
    
    const growths = actor.growths;
    member.maxHp += growths.hp;
    member.hp = member.maxHp;
    member.maxMp += growths.mp;
    member.mp = member.maxMp;
    member.atk += growths.atk;
    member.def += growths.def;
    member.spd += growths.spd;
    
    this.audio.levelUp();
    this.showDialogue('system', `レベルアップ！\n${actor.name}はレベル${member.level}になった！`);
  }
  
  // === INVENTORY ===
  
  giveItem(itemId, qty = 1) {
    const existing = this.state.inventory.find(i => i.itemId === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.state.inventory.push({ itemId, qty });
    }
  }
  
  removeItem(itemId, qty = 1) {
    const existing = this.state.inventory.find(i => i.itemId === itemId);
    if (existing) {
      existing.qty -= qty;
      if (existing.qty <= 0) {
        const idx = this.state.inventory.indexOf(existing);
        this.state.inventory.splice(idx, 1);
      }
    }
  }
  
  // === MENU ===
  
  toggleMenu() {
    if (this.state.screen === 'menu') {
      this.closeMenu();
    } else if (this.state.screen === 'map' && !this.state.currentDialogue) {
      this.openMenu();
    }
  }
  
  openMenu() {
    this.audio.select();
    this.state.screen = 'menu';
    this.showScreen('menu-screen');
    this.updateMenuUI();
  }
  
  closeMenu() {
    this.audio.cancel();
    this.state.screen = 'map';
    this.showScreen('map-screen');
  }
  
  selectMenuItem(menu) {
    this.audio.cursor();
    
    document.querySelectorAll('.menu-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.menu === menu);
    });
    
    document.querySelectorAll('.menu-view').forEach(view => {
      view.classList.remove('active');
    });
    
    if (menu === 'close') {
      this.closeMenu();
      return;
    }
    
    document.getElementById(`${menu}-view`)?.classList.add('active');
    this.updateMenuUI();
  }
  
  updateMenuUI() {
    const hero = this.getTotalStats('hero');
    const heroBase = this.getPartyMember('hero');
    
    document.getElementById('stat-level').textContent = hero.level;
    document.getElementById('stat-hp').textContent = hero.hp;
    document.getElementById('stat-maxhp').textContent = hero.maxHp;
    document.getElementById('stat-mp').textContent = hero.mp;
    document.getElementById('stat-maxmp').textContent = hero.maxMp;
    document.getElementById('stat-atk').textContent = hero.atk;
    document.getElementById('stat-def').textContent = hero.def;
    document.getElementById('stat-spd').textContent = hero.spd;
    document.getElementById('stat-exp').textContent = heroBase.exp;
    document.getElementById('stat-gold').textContent = this.state.gold;
    
    // Items
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';
    for (const inv of this.state.inventory) {
      const item = GAME_DATA.items[inv.itemId];
      const li = document.createElement('li');
      li.innerHTML = `<span>${item?.name || inv.itemId}</span><span class="item-qty">x${inv.qty}</span>`;
      li.addEventListener('click', () => this.useMenuItem(inv.itemId));
      itemList.appendChild(li);
    }
    
    if (this.state.inventory.length === 0) {
      itemList.innerHTML = '<li style="color:#666">アイテムなし</li>';
    }
    
    // Equipment
    const weapon = GAME_DATA.equipment[heroBase.equipment.weapon];
    const armor = GAME_DATA.equipment[heroBase.equipment.armor];
    document.getElementById('equip-weapon').textContent = weapon?.name || 'なし';
    document.getElementById('equip-armor').textContent = armor?.name || 'なし';
  }
  
  useMenuItem(itemId) {
    const item = GAME_DATA.items[itemId];
    if (!item || item.type !== 'consumable') return;
    
    const hero = this.getPartyMember('hero');
    
    for (const effect of item.use.effects) {
      if (effect.type === 'healHp' && hero.hp < hero.maxHp) {
        const heal = Math.min(effect.value, hero.maxHp - hero.hp);
        hero.hp += heal;
        this.removeItem(itemId, 1);
        this.audio.heal();
        this.showDialogue('system', `${item.name}を使った！\nHPが${heal}回復した！`);
        this.updateMenuUI();
        return;
      }
    }
    
    this.audio.cancel();
  }
  
  // === SCREENS ===
  
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId)?.classList.add('active');
  }
  
  showGameOver() {
    this.state.screen = 'gameover';
    this.showScreen('gameover-screen');
  }
  
  showEnding(endingId) {
    const ending = GAME_DATA.endings[endingId];
    if (!ending) return;
    
    this.audio.gameClear();
    this.state.screen = 'ending';
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-text').textContent = ending.text;
    this.showScreen('ending-screen');
  }
  
  // === GAME LOOP ===
  
  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  update(deltaTime) {
    if (this.state.screen !== 'map' || this.state.currentDialogue) return;
    
    // Update monsters
    this.monsterMoveTimer += deltaTime;
    if (this.monsterMoveTimer > 2000) {
      this.monsterMoveTimer = 0;
      this.updateMonsters();
    }
    
    if (this.state.isMoving) {
      this.currentMoveTime += deltaTime;
      const duration = 1 / this.moveSpeed;
      let progress = this.currentMoveTime / duration;
      
      if (progress >= 1) {
        this.state.position = { x: this.targetPosition.x, y: this.targetPosition.y };
        this.state.isMoving = false;
        this.currentMoveTime = 0;
        
        this.checkTouchEvents(this.state.position.x, this.state.position.y);
      } else {
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        this.state.position.x = this.startPosition.x + (this.targetPosition.x - this.startPosition.x) * easedProgress;
        this.state.position.y = this.startPosition.y + (this.targetPosition.y - this.startPosition.y) * easedProgress;
      }
    } else {
      if (this.input.up) this.move('up');
      else if (this.input.down) this.move('down');
      else if (this.input.left) this.move('left');
      else if (this.input.right) this.move('right');
    }
  }
  
  updateMonsters() {
    const map = this.state.currentMap;
    if (!map?.monsters) return;
    
    const vectors = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    
    for (let idx = 0; idx < map.monsters.length; idx++) {
      const monster = map.monsters[idx];
      const key = `${map.id}_${idx}`;
      const pos = this.monsterPositions[key];
      
      if (!pos || this.defeatedMonsters.has(key)) continue;
      if (monster.movePattern === 'none') continue;
      
      if (Math.random() < 0.3) {
        const dir = vectors[Math.floor(Math.random() * vectors.length)];
        const newX = pos.x + dir.x;
        const newY = pos.y + dir.y;
        
        if (!this.checkCollision(newX, newY)) {
          pos.x = newX;
          pos.y = newY;
        }
      }
    }
  }
  
  render() {
    if (this.state.screen !== 'map') return;
    
    const ctx = this.ctx;
    const map = this.state.currentMap;
    if (!map) return;
    
    // Clear
    ctx.fillStyle = '#1a2636';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Camera
    const camX = this.state.position.x * this.scaledTileSize - this.canvas.width / 2 + this.scaledTileSize / 2;
    const camY = this.state.position.y * this.scaledTileSize - this.canvas.height / 2 + this.scaledTileSize / 2;
    
    const maxCamX = map.size.w * this.scaledTileSize - this.canvas.width;
    const maxCamY = map.size.h * this.scaledTileSize - this.canvas.height;
    const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
    const clampedCamY = Math.max(0, Math.min(maxCamY, camY));
    
    // Map background
    if (this.state.mapBackground) {
      ctx.drawImage(this.state.mapBackground, -clampedCamX, -clampedCamY);
    }
    
    // Items
    if (map.items) {
      for (const item of map.items) {
        const flagKey = `item_${map.id}_${item.id}`;
        if (this.state.flags[flagKey]) continue;
        
        const sprite = this.spriteRenderer.getTileSprite(item.sprite || 'sparkle', this.displayScale);
        if (sprite) {
          ctx.drawImage(sprite,
            item.pos.x * this.scaledTileSize - clampedCamX,
            item.pos.y * this.scaledTileSize - clampedCamY
          );
        }
      }
    }
    
    // NPCs
    if (map.npcs) {
      for (const npc of map.npcs) {
        if (!this.checkCondition(npc.condition)) continue;
        
        const actor = GAME_DATA.actors[npc.actorId];
        const spriteKey = actor?.spriteKey || npc.actorId;
        const sprite = this.spriteRenderer.getCharacterSprite(spriteKey, 'down', this.displayScale);
        
        if (sprite) {
          ctx.drawImage(sprite,
            npc.pos.x * this.scaledTileSize - clampedCamX,
            npc.pos.y * this.scaledTileSize - clampedCamY
          );
        }
      }
    }
    
    // Monsters
    if (map.monsters) {
      for (let idx = 0; idx < map.monsters.length; idx++) {
        const monster = map.monsters[idx];
        const key = `${map.id}_${idx}`;
        const pos = this.monsterPositions[key];
        
        if (!pos || this.defeatedMonsters.has(key)) continue;
        if (!this.checkCondition(monster.condition)) continue;
        
        const sprite = this.spriteRenderer.getEnemySprite(monster.enemyId, this.displayScale);
        if (sprite) {
          ctx.drawImage(sprite,
            pos.x * this.scaledTileSize - clampedCamX,
            pos.y * this.scaledTileSize - clampedCamY
          );
        }
      }
    }
    
    // Hero
    const heroSprite = this.spriteRenderer.getCharacterSprite('hero', this.state.direction, this.displayScale);
    if (heroSprite) {
      ctx.drawImage(heroSprite,
        this.state.position.x * this.scaledTileSize - clampedCamX,
        this.state.position.y * this.scaledTileSize - clampedCamY
      );
    }
    
    // Exit arrows
    if (map.exits) {
      for (const exit of map.exits) {
        if (exit.condition && !this.checkCondition(exit.condition)) continue;
        
        const sprite = this.spriteRenderer.getTileSprite('exit_arrow', this.displayScale);
        if (sprite) {
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 300) * 0.2;
          ctx.drawImage(sprite,
            exit.at.x * this.scaledTileSize - clampedCamX,
            exit.at.y * this.scaledTileSize - clampedCamY
          );
          ctx.globalAlpha = 1;
        }
      }
    }
  }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
