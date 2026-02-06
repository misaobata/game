// ============================================
// Game Engine - Pixel Hero: Rescue the Princess
// Dragon Quest Style Movement
// ============================================

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    
    this.tileSize = 16;
    this.spriteRenderer = new SpriteRenderer();
    
    // Movement settings (Dragon Quest style)
    this.moveSpeed = 0.08; // How fast to move between tiles (lower = slower)
    this.moveCooldown = 80; // ms between moves when holding direction
    
    // Game state
    this.state = {
      screen: 'map', // 'map', 'battle', 'menu', 'dialogue', 'gameover', 'ending'
      flags: { ...GAME_DATA.flags },
      hero: this.initHero(),
      currentMapId: null,
      currentMap: null,
      mapBackground: null,
      // Position tracking for smooth movement
      position: { x: 0, y: 0 },           // Current tile position
      renderPosition: { x: 0, y: 0 },     // Interpolated render position
      targetPosition: { x: 0, y: 0 },     // Target tile position
      moveProgress: 0,                     // 0-1 progress of current move
      direction: 'down',
      isMoving: false,
      walkFrame: 0,
      walkFrameTimer: 0,
      lastMoveTime: 0,
      dialogueQueue: [],
      battleState: null,
      pendingEventSteps: [],
      currentEventIndex: 0
    };
    
    this.input = {
      up: false, down: false, left: false, right: false,
      action: false, menu: false
    };
    
    this.lastInputTime = 0;
    this.inputCooldown = 150;
    
    this.init();
  }
  
  initHero() {
    const heroData = GAME_DATA.actors.hero;
    return {
      ...heroData,
      stats: { ...heroData.stats },
      inventory: heroData.inventory.map(i => ({ ...i })),
      equipment: { ...heroData.equipment }
    };
  }
  
  init() {
    // Setup input
    this.setupInput();
    
    // Load starting map
    const starting = GAME_DATA.meta.starting;
    this.loadMap(starting.mapId, starting.spawn);
    
    // Setup UI
    this.setupUI();
    
    // Start game loop
    this.lastTime = 0;
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  setupInput() {
    // Keyboard
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // D-pad buttons
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        this.input[btn.dataset.dir] = true;
      });
      btn.addEventListener('mouseup', () => {
        this.input[btn.dataset.dir] = false;
      });
      btn.addEventListener('mouseleave', () => {
        this.input[btn.dataset.dir] = false;
      });
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.input[btn.dataset.dir] = true;
      });
      btn.addEventListener('touchend', () => {
        this.input[btn.dataset.dir] = false;
      });
    });
    
    // Action button
    const actionBtn = document.getElementById('btn-action');
    actionBtn.addEventListener('click', () => this.handleAction());
    actionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleAction();
    });
    
    // Menu button
    const menuBtn = document.getElementById('btn-menu');
    menuBtn.addEventListener('click', () => this.toggleMenu());
  }
  
  handleKeyDown(e) {
    const keyMap = {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right',
      'Space': 'action', 'Enter': 'action',
      'Escape': 'menu'
    };
    
    const action = keyMap[e.code];
    if (action) {
      e.preventDefault();
      if (action === 'action') {
        this.handleAction();
      } else if (action === 'menu') {
        this.toggleMenu();
      } else {
        this.input[action] = true;
      }
    }
  }
  
  handleKeyUp(e) {
    const keyMap = {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right'
    };
    
    const action = keyMap[e.code];
    if (action) {
      this.input[action] = false;
    }
  }
  
  handleAction() {
    const now = Date.now();
    if (now - this.lastInputTime < this.inputCooldown) return;
    this.lastInputTime = now;
    
    if (this.state.screen === 'dialogue') {
      this.advanceDialogue();
    } else if (this.state.screen === 'map' && !this.state.isMoving) {
      this.checkActionEvents();
    }
  }
  
  toggleMenu() {
    if (this.state.screen === 'menu') {
      this.closeMenu();
    } else if (this.state.screen === 'map' && !this.state.isMoving) {
      this.openMenu();
    }
  }
  
  setupUI() {
    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const menu = item.dataset.menu;
        if (menu === 'close') {
          this.closeMenu();
        } else {
          this.selectMenuItem(menu);
        }
      });
    });
    
    // Battle commands
    document.querySelectorAll('.battle-cmd').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.state.screen === 'battle' && this.state.battleState?.phase === 'command') {
          this.handleBattleCommand(btn.dataset.cmd);
        }
      });
    });
    
    // Retry button
    document.getElementById('btn-retry').addEventListener('click', () => {
      location.reload();
    });
    
    // Title button
    document.getElementById('btn-title').addEventListener('click', () => {
      location.reload();
    });
  }
  
  // ============ Map System ============
  
  loadMap(mapId, spawn) {
    const mapData = GAME_DATA.maps[mapId];
    if (!mapData) {
      console.error(`Map not found: ${mapId}`);
      return;
    }
    
    this.state.currentMapId = mapId;
    this.state.currentMap = mapData;
    this.state.position = { ...spawn };
    this.state.renderPosition = { x: spawn.x, y: spawn.y };
    this.state.targetPosition = { ...spawn };
    this.state.direction = 'down';
    this.state.isMoving = false;
    this.state.moveProgress = 0;
    
    // Generate map background
    this.state.mapBackground = this.spriteRenderer.generateMapBackground(mapData, this.tileSize);
    
    // Update UI
    document.getElementById('map-name').textContent = mapData.name;
    
    // Check auto events
    this.checkAutoEvents();
  }
  
  checkCollision(x, y) {
    const map = this.state.currentMap;
    if (!map) return true;
    
    // Bounds check
    if (x < 0 || y < 0 || x >= map.size.w || y >= map.size.h) {
      return true;
    }
    
    // Collision layer
    if (map.collision[y]?.[x] === 1) {
      return true;
    }
    
    // NPC collision
    for (const npc of map.npcs) {
      if (this.checkNpcCondition(npc) && npc.pos.x === x && npc.pos.y === y) {
        return true;
      }
    }
    
    return false;
  }
  
  checkNpcCondition(npc) {
    if (!npc.condition) return true;
    return this.state.flags[npc.condition.flag] === npc.condition.equals;
  }
  
  // Start movement to adjacent tile
  startMove(direction) {
    if (this.state.isMoving || this.state.screen !== 'map') return;
    
    const now = Date.now();
    if (now - this.state.lastMoveTime < this.moveCooldown) return;
    
    const vectors = GAME_DATA.constants.directionVectors;
    const vector = vectors[direction];
    
    this.state.direction = direction;
    
    const newX = this.state.position.x + vector.x;
    const newY = this.state.position.y + vector.y;
    
    // Check exit first
    const exit = this.checkExit(newX, newY);
    if (exit) {
      this.loadMap(exit.toMapId, exit.spawn);
      return;
    }
    
    if (!this.checkCollision(newX, newY)) {
      // Start smooth movement
      this.state.targetPosition = { x: newX, y: newY };
      this.state.isMoving = true;
      this.state.moveProgress = 0;
      this.state.lastMoveTime = now;
    }
  }
  
  // Update movement animation
  updateMovement(deltaTime) {
    if (!this.state.isMoving) return;
    
    // Progress the movement
    this.state.moveProgress += this.moveSpeed;
    
    // Update walking animation frame
    this.state.walkFrameTimer += deltaTime;
    if (this.state.walkFrameTimer > 150) {
      this.state.walkFrame = (this.state.walkFrame + 1) % 2;
      this.state.walkFrameTimer = 0;
    }
    
    // Interpolate render position
    const startX = this.state.position.x;
    const startY = this.state.position.y;
    const endX = this.state.targetPosition.x;
    const endY = this.state.targetPosition.y;
    
    // Smooth easing
    const t = this.easeInOut(Math.min(1, this.state.moveProgress));
    this.state.renderPosition.x = startX + (endX - startX) * t;
    this.state.renderPosition.y = startY + (endY - startY) * t;
    
    // Complete movement
    if (this.state.moveProgress >= 1) {
      this.state.position.x = this.state.targetPosition.x;
      this.state.position.y = this.state.targetPosition.y;
      this.state.renderPosition.x = this.state.position.x;
      this.state.renderPosition.y = this.state.position.y;
      this.state.isMoving = false;
      this.state.moveProgress = 0;
      this.state.walkFrame = 0;
      
      // Check touch events at new position
      this.checkTouchEvents(this.state.position.x, this.state.position.y);
      
      // Random encounter check
      this.checkRandomEncounter();
    }
  }
  
  // Easing function for smooth movement
  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  
  checkExit(x, y) {
    const map = this.state.currentMap;
    if (!map?.exits) return null;
    
    for (const exit of map.exits) {
      if (exit.at.x === x && exit.at.y === y) {
        // Check exit condition
        if (exit.condition) {
          if (this.state.flags[exit.condition.flag] !== exit.condition.equals) {
            return null;
          }
        }
        return exit;
      }
    }
    return null;
  }
  
  checkRandomEncounter() {
    const map = this.state.currentMap;
    if (!map?.encounters?.enabled) return;
    
    if (Math.random() < map.encounters.rate) {
      // Select enemy from table
      const totalWeight = map.encounters.table.reduce((sum, e) => sum + e.weight, 0);
      let roll = Math.random() * totalWeight;
      
      for (const entry of map.encounters.table) {
        roll -= entry.weight;
        if (roll <= 0) {
          const count = entry.count[0] + Math.floor(Math.random() * (entry.count[1] - entry.count[0] + 1));
          this.startBattle(entry.enemyId, count);
          break;
        }
      }
    }
  }
  
  // ============ Event System ============
  
  checkAutoEvents() {
    const map = this.state.currentMap;
    if (!map?.events) return;
    
    for (const event of map.events) {
      if (event.trigger === 'auto' && this.checkEventCondition(event)) {
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
        if (this.checkEventCondition(event)) {
          this.runEvent(event);
          break;
        }
      }
    }
  }
  
  checkActionEvents() {
    const map = this.state.currentMap;
    if (!map?.events) return;
    
    const vectors = GAME_DATA.constants.directionVectors;
    const vector = vectors[this.state.direction];
    const targetX = this.state.position.x + vector.x;
    const targetY = this.state.position.y + vector.y;
    
    for (const event of map.events) {
      if (event.trigger === 'action' && event.at.x === targetX && event.at.y === targetY) {
        if (this.checkEventCondition(event)) {
          this.runEvent(event);
          return;
        }
      }
    }
  }
  
  checkEventCondition(event) {
    if (!event.condition) return true;
    
    const result = this.state.flags[event.condition.flag] === event.condition.equals;
    
    // Check secondary condition
    if (result && event.condition.flag2) {
      return this.state.flags[event.condition.flag2] === event.condition.equals2;
    }
    
    return result;
  }
  
  runEvent(event) {
    this.state.pendingEventSteps = [...event.steps];
    this.state.currentEventIndex = 0;
    this.processNextEventStep();
  }
  
  processNextEventStep() {
    if (this.state.currentEventIndex >= this.state.pendingEventSteps.length) {
      this.state.pendingEventSteps = [];
      this.state.currentEventIndex = 0;
      this.checkAutoEvents(); // Check for new auto events
      return;
    }
    
    const step = this.state.pendingEventSteps[this.state.currentEventIndex];
    this.state.currentEventIndex++;
    
    switch(step.type) {
      case 'showDialogue':
        this.showDialogue(step.speaker, step.text);
        break;
      case 'setFlag':
        this.state.flags[step.flag] = step.value;
        this.processNextEventStep();
        break;
      case 'giveItem':
        this.giveItem(step.itemId, step.qty);
        this.processNextEventStep();
        break;
      case 'startBattle':
        this.startBattleFromEvent(step.battleId);
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
  
  // ============ Dialogue System ============
  
  showDialogue(speakerId, text) {
    this.state.screen = 'dialogue';
    
    const dialogueBox = document.getElementById('dialogue-box');
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');
    
    // Get speaker name
    let speakerName = '';
    if (speakerId === 'system') {
      speakerName = '';
    } else if (GAME_DATA.actors[speakerId]) {
      speakerName = GAME_DATA.actors[speakerId].name;
    } else {
      speakerName = speakerId;
    }
    
    speakerEl.textContent = speakerName;
    speakerEl.style.display = speakerName ? 'block' : 'none';
    textEl.textContent = '';
    dialogueBox.classList.remove('hidden');
    
    // Typewriter effect
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        textEl.textContent += text[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
    
    this.currentTypeInterval = typeInterval;
    this.currentDialogueText = text;
  }
  
  advanceDialogue() {
    const textEl = document.getElementById('dialogue-text');
    
    // If still typing, complete immediately
    if (this.currentTypeInterval && textEl.textContent.length < this.currentDialogueText.length) {
      clearInterval(this.currentTypeInterval);
      textEl.textContent = this.currentDialogueText;
      return;
    }
    
    // Close dialogue and process next step
    document.getElementById('dialogue-box').classList.add('hidden');
    this.state.screen = 'map';
    this.processNextEventStep();
  }
  
  // ============ Battle System ============
  
  startBattle(enemyId, count = 1) {
    const enemyData = GAME_DATA.enemies[enemyId];
    if (!enemyData) return;
    
    this.state.screen = 'battle';
    this.showScreen('battle-screen');
    
    // Initialize battle state
    this.state.battleState = {
      phase: 'start', // 'start', 'command', 'action', 'enemy', 'victory', 'defeat'
      enemy: {
        ...enemyData,
        stats: { ...enemyData.stats },
        currentHp: enemyData.stats.hp
      },
      turn: 0,
      aiIndex: 0,
      defending: false
    };
    
    // Update UI
    this.updateBattleUI();
    
    // Show enemy sprite
    const enemySprite = this.spriteRenderer.getEnemySprite(enemyId, 4);
    const enemySpriteEl = document.getElementById('enemy-sprite');
    enemySpriteEl.innerHTML = '';
    if (enemySprite) {
      enemySpriteEl.appendChild(enemySprite);
    }
    
    // Show battle start message
    this.showBattleMessage(`${enemyData.name}があらわれた！`);
    
    setTimeout(() => {
      this.state.battleState.phase = 'command';
      this.enableBattleCommands(true);
    }, 1000);
  }
  
  startBattleFromEvent(battleId) {
    const battle = GAME_DATA.battles[battleId];
    if (!battle) return;
    
    this.currentBattleData = battle;
    const enemyEntry = battle.enemies[0];
    this.startBattle(enemyEntry.enemyId, enemyEntry.qty);
  }
  
  updateBattleUI() {
    const hero = this.state.hero;
    const enemy = this.state.battleState?.enemy;
    
    // Hero stats
    document.getElementById('hero-hp-text').textContent = `${hero.stats.hp}/${hero.stats.maxHp}`;
    document.getElementById('hero-mp-text').textContent = `${hero.stats.mp}/${hero.stats.maxMp}`;
    
    // HP bar
    const hpPercent = (hero.stats.hp / hero.stats.maxHp) * 100;
    const heroHpFill = document.querySelector('.hero-hp .hp-fill');
    heroHpFill.style.width = `${hpPercent}%`;
    heroHpFill.classList.remove('mid', 'low');
    if (hpPercent <= 25) heroHpFill.classList.add('low');
    else if (hpPercent <= 50) heroHpFill.classList.add('mid');
    
    // MP bar
    const mpPercent = (hero.stats.mp / hero.stats.maxMp) * 100;
    document.querySelector('.mp-fill').style.width = `${mpPercent}%`;
    
    // Enemy HP
    if (enemy) {
      document.getElementById('enemy-name').textContent = enemy.name;
      const enemyHpPercent = (enemy.currentHp / enemy.stats.maxHp) * 100;
      const enemyHpFill = document.querySelector('.enemy-hp .hp-fill');
      enemyHpFill.style.width = `${enemyHpPercent}%`;
      enemyHpFill.classList.remove('mid', 'low');
      if (enemyHpPercent <= 25) enemyHpFill.classList.add('low');
      else if (enemyHpPercent <= 50) enemyHpFill.classList.add('mid');
    }
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
    this.enableBattleCommands(false);
    this.state.battleState.defending = false;
    
    switch(cmd) {
      case 'attack':
        this.heroAttack();
        break;
      case 'skill':
        this.heroSkill();
        break;
      case 'item':
        this.showItemMenu();
        break;
      case 'defend':
        this.heroDefend();
        break;
    }
  }
  
  heroAttack() {
    const hero = this.state.hero;
    const enemy = this.state.battleState.enemy;
    
    // Calculate damage
    const weaponMod = GAME_DATA.equipment[hero.equipment.weapon]?.mods?.atk || 0;
    const atk = hero.stats.atk + weaponMod;
    const damage = Math.max(1, Math.floor(atk * 1.2 - enemy.stats.def * 0.6));
    
    // Apply damage
    enemy.currentHp = Math.max(0, enemy.currentHp - damage);
    
    // Show effect
    document.getElementById('battle-effect').classList.add('slash');
    setTimeout(() => {
      document.getElementById('battle-effect').classList.remove('slash');
    }, 300);
    
    this.showBattleMessage(`${hero.name}の攻撃！${enemy.name}に${damage}のダメージ！`);
    this.updateBattleUI();
    
    setTimeout(() => this.checkBattleEnd(), 1200);
  }
  
  heroSkill() {
    // Use basic slash skill
    this.heroAttack();
  }
  
  heroDefend() {
    this.state.battleState.defending = true;
    this.showBattleMessage(`${this.state.hero.name}は身を守っている！`);
    
    setTimeout(() => this.enemyTurn(), 1200);
  }
  
  showItemMenu() {
    const usableItems = this.state.hero.inventory.filter(inv => {
      const item = GAME_DATA.items[inv.itemId];
      return item && item.type === 'consumable' && inv.qty > 0;
    });
    
    if (usableItems.length === 0) {
      this.showBattleMessage('使えるアイテムがない！');
      setTimeout(() => {
        this.enableBattleCommands(true);
        this.state.battleState.phase = 'command';
      }, 800);
      return;
    }
    
    // For simplicity, use first potion
    const potionInv = this.state.hero.inventory.find(inv => inv.itemId === 'potion' && inv.qty > 0);
    if (potionInv) {
      this.useItemInBattle('potion');
    } else {
      this.showBattleMessage('使えるアイテムがない！');
      setTimeout(() => {
        this.enableBattleCommands(true);
        this.state.battleState.phase = 'command';
      }, 800);
    }
  }
  
  useItemInBattle(itemId) {
    const hero = this.state.hero;
    const item = GAME_DATA.items[itemId];
    const inv = hero.inventory.find(i => i.itemId === itemId);
    
    if (!inv || inv.qty <= 0) return;
    
    inv.qty--;
    
    // Apply effects
    for (const effect of item.use.effects) {
      if (effect.type === 'healHp') {
        const oldHp = hero.stats.hp;
        hero.stats.hp = Math.min(hero.stats.maxHp, hero.stats.hp + effect.value);
        const healed = hero.stats.hp - oldHp;
        this.showBattleMessage(`${item.name}を使った！HPが${healed}回復した！`);
      }
    }
    
    this.updateBattleUI();
    setTimeout(() => this.enemyTurn(), 1200);
  }
  
  enemyTurn() {
    const hero = this.state.hero;
    const enemy = this.state.battleState.enemy;
    
    if (enemy.currentHp <= 0) {
      this.checkBattleEnd();
      return;
    }
    
    // Get AI action
    const pattern = enemy.ai.pattern;
    const action = pattern[this.state.battleState.aiIndex % pattern.length];
    this.state.battleState.aiIndex++;
    
    let damage = 0;
    
    switch(action) {
      case 'attack':
        const armorMod = GAME_DATA.equipment[hero.equipment.armor]?.mods?.def || 0;
        const def = hero.stats.def + armorMod;
        damage = Math.max(1, Math.floor(enemy.stats.atk - def * 0.5));
        
        if (this.state.battleState.defending) {
          damage = Math.floor(damage / 2);
        }
        
        hero.stats.hp = Math.max(0, hero.stats.hp - damage);
        
        document.getElementById('battle-effect').classList.add('damage');
        setTimeout(() => {
          document.getElementById('battle-effect').classList.remove('damage');
        }, 200);
        
        this.showBattleMessage(`${enemy.name}の攻撃！${hero.name}は${damage}のダメージを受けた！`);
        break;
        
      case 'powerAttack':
        const armorMod2 = GAME_DATA.equipment[hero.equipment.armor]?.mods?.def || 0;
        const def2 = hero.stats.def + armorMod2;
        damage = Math.max(1, Math.floor(enemy.stats.atk * 1.5 - def2 * 0.3));
        
        if (this.state.battleState.defending) {
          damage = Math.floor(damage / 2);
        }
        
        hero.stats.hp = Math.max(0, hero.stats.hp - damage);
        
        document.getElementById('battle-effect').classList.add('damage');
        setTimeout(() => {
          document.getElementById('battle-effect').classList.remove('damage');
        }, 200);
        
        this.showBattleMessage(`${enemy.name}の強攻撃！${hero.name}は${damage}のダメージを受けた！`);
        break;
        
      case 'defend':
        this.showBattleMessage(`${enemy.name}は身を守っている！`);
        break;
    }
    
    this.updateBattleUI();
    setTimeout(() => this.checkBattleEnd(), 1200);
  }
  
  checkBattleEnd() {
    const hero = this.state.hero;
    const enemy = this.state.battleState.enemy;
    
    if (hero.stats.hp <= 0) {
      // Defeat
      this.state.battleState.phase = 'defeat';
      
      if (this.currentBattleData?.defeat) {
        this.state.pendingEventSteps = [...this.currentBattleData.defeat];
        this.state.currentEventIndex = 0;
        setTimeout(() => this.processNextEventStep(), 1000);
      } else {
        this.showBattleMessage('勇者は倒れた…');
        setTimeout(() => this.showGameOver(), 2000);
      }
      return;
    }
    
    if (enemy.currentHp <= 0) {
      // Victory
      this.state.battleState.phase = 'victory';
      
      // Grant EXP
      const exp = enemy.exp;
      this.state.hero.stats.exp += exp;
      
      // Check drops
      let dropMsg = '';
      for (const drop of enemy.drops) {
        if (Math.random() < drop.chance) {
          this.giveItem(drop.itemId, drop.qty);
          const item = GAME_DATA.items[drop.itemId];
          dropMsg = `${item.name}を手に入れた！`;
        }
      }
      
      this.showBattleMessage(`${enemy.name}を倒した！${exp}の経験値を得た！${dropMsg}`);
      
      // Check level up
      this.checkLevelUp();
      
      if (this.currentBattleData?.victory) {
        this.state.pendingEventSteps = [...this.currentBattleData.victory];
        this.state.currentEventIndex = 0;
        setTimeout(() => {
          this.endBattle();
          this.processNextEventStep();
        }, 2000);
      } else {
        setTimeout(() => this.endBattle(), 2000);
      }
      return;
    }
    
    // Continue battle
    this.state.battleState.turn++;
    this.state.battleState.phase = 'command';
    this.enableBattleCommands(true);
    this.showBattleMessage('コマンド？');
  }
  
  checkLevelUp() {
    const hero = this.state.hero;
    const expNeeded = hero.stats.level * 20;
    
    if (hero.stats.exp >= expNeeded) {
      hero.stats.level++;
      hero.stats.exp -= expNeeded;
      hero.stats.maxHp += 5;
      hero.stats.hp = hero.stats.maxHp;
      hero.stats.maxMp += 2;
      hero.stats.mp = hero.stats.maxMp;
      hero.stats.atk += 2;
      hero.stats.def += 1;
      hero.stats.spd += 1;
      
      this.showBattleMessage(`レベルアップ！${hero.name}はレベル${hero.stats.level}になった！`);
    }
  }
  
  endBattle() {
    this.currentBattleData = null;
    this.state.battleState = null;
    this.state.screen = 'map';
    this.showScreen('map-screen');
  }
  
  // ============ Menu System ============
  
  openMenu() {
    this.state.screen = 'menu';
    this.showScreen('menu-screen');
    this.updateMenuUI();
    this.selectMenuItem('status');
  }
  
  closeMenu() {
    this.state.screen = 'map';
    this.showScreen('map-screen');
  }
  
  selectMenuItem(menuId) {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.toggle('active', item.dataset.menu === menuId);
    });
    
    document.querySelectorAll('.menu-view').forEach(view => {
      view.classList.remove('active');
    });
    
    const view = document.getElementById(`${menuId}-view`);
    if (view) view.classList.add('active');
  }
  
  updateMenuUI() {
    const hero = this.state.hero;
    
    // Status
    document.getElementById('stat-level').textContent = hero.stats.level;
    document.getElementById('stat-hp').textContent = hero.stats.hp;
    document.getElementById('stat-maxhp').textContent = hero.stats.maxHp;
    document.getElementById('stat-mp').textContent = hero.stats.mp;
    document.getElementById('stat-maxmp').textContent = hero.stats.maxMp;
    document.getElementById('stat-atk').textContent = hero.stats.atk + (GAME_DATA.equipment[hero.equipment.weapon]?.mods?.atk || 0);
    document.getElementById('stat-def').textContent = hero.stats.def + (GAME_DATA.equipment[hero.equipment.armor]?.mods?.def || 0);
    document.getElementById('stat-spd').textContent = hero.stats.spd;
    document.getElementById('stat-exp').textContent = hero.stats.exp;
    
    // Hero portrait
    const portrait = document.querySelector('.hero-portrait');
    portrait.innerHTML = '';
    const heroSprite = this.spriteRenderer.getCharacterSprite('hero', 'down', 4);
    if (heroSprite) portrait.appendChild(heroSprite);
    
    // Items
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';
    
    for (const inv of hero.inventory) {
      if (inv.qty > 0) {
        const item = GAME_DATA.items[inv.itemId];
        const li = document.createElement('li');
        li.innerHTML = `${item.name} <span class="item-qty">×${inv.qty}</span>`;
        li.addEventListener('click', () => this.useItemFromMenu(inv.itemId));
        itemList.appendChild(li);
      }
    }
    
    // Check for key items
    if (this.state.flags.got_castle_key) {
      const keyItem = GAME_DATA.items.castle_key;
      const li = document.createElement('li');
      li.textContent = `${keyItem.name} (大事なもの)`;
      itemList.appendChild(li);
    }
    
    if (itemList.children.length === 0) {
      itemList.innerHTML = '<li>アイテムがない</li>';
    }
    
    // Equipment
    document.getElementById('equip-weapon').textContent = GAME_DATA.equipment[hero.equipment.weapon]?.name || 'なし';
    document.getElementById('equip-armor').textContent = GAME_DATA.equipment[hero.equipment.armor]?.name || 'なし';
  }
  
  useItemFromMenu(itemId) {
    const item = GAME_DATA.items[itemId];
    const inv = this.state.hero.inventory.find(i => i.itemId === itemId);
    
    if (!inv || inv.qty <= 0 || item.type !== 'consumable') return;
    
    inv.qty--;
    
    for (const effect of item.use.effects) {
      if (effect.type === 'healHp') {
        this.state.hero.stats.hp = Math.min(this.state.hero.stats.maxHp, this.state.hero.stats.hp + effect.value);
      }
    }
    
    this.updateMenuUI();
  }
  
  // ============ Utility ============
  
  giveItem(itemId, qty) {
    const existing = this.state.hero.inventory.find(i => i.itemId === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.state.hero.inventory.push({ itemId, qty });
    }
  }
  
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  }
  
  showGameOver() {
    this.state.screen = 'gameover';
    this.showScreen('gameover-screen');
  }
  
  showEnding(endingId) {
    const ending = GAME_DATA.endings[endingId];
    if (!ending) return;
    
    this.state.screen = 'ending';
    this.showScreen('ending-screen');
    
    document.getElementById('ending-title').textContent = ending.title;
    document.getElementById('ending-text').textContent = ending.text;
    
    // Draw ending art
    const endingArt = document.querySelector('.ending-art');
    endingArt.innerHTML = '';
    const heroSprite = this.spriteRenderer.getCharacterSprite('hero', 'down', 4);
    const princessSprite = this.spriteRenderer.getCharacterSprite('princess', 'down', 4);
    if (heroSprite) endingArt.appendChild(heroSprite);
    if (princessSprite) endingArt.appendChild(princessSprite);
  }
  
  // ============ Game Loop ============
  
  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  update(deltaTime) {
    if (this.state.screen !== 'map') return;
    
    // Update movement animation
    this.updateMovement(deltaTime);
    
    // Handle movement input (only when not already moving)
    if (!this.state.isMoving) {
      if (this.input.up) this.startMove('up');
      else if (this.input.down) this.startMove('down');
      else if (this.input.left) this.startMove('left');
      else if (this.input.right) this.startMove('right');
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
    
    // Use interpolated render position for smooth movement
    const renderX = this.state.renderPosition.x;
    const renderY = this.state.renderPosition.y;
    
    // Calculate camera offset to center player
    const camX = renderX * this.tileSize - this.canvas.width / 2 + this.tileSize / 2;
    const camY = renderY * this.tileSize - this.canvas.height / 2 + this.tileSize / 2;
    
    // Clamp camera
    const maxCamX = map.size.w * this.tileSize - this.canvas.width;
    const maxCamY = map.size.h * this.tileSize - this.canvas.height;
    const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
    const clampedCamY = Math.max(0, Math.min(maxCamY, camY));
    
    // Draw map background
    if (this.state.mapBackground) {
      ctx.drawImage(this.state.mapBackground, -clampedCamX, -clampedCamY);
    }
    
    // Draw exit indicators
    for (const exit of (map.exits || [])) {
      const exitSprite = this.spriteRenderer.getTileSprite('exit_arrow');
      if (exitSprite) {
        ctx.drawImage(exitSprite, 
          exit.at.x * this.tileSize - clampedCamX, 
          exit.at.y * this.tileSize - clampedCamY
        );
      }
    }
    
    // Draw chest if exists
    for (const event of (map.events || [])) {
      if (event.id.includes('chest')) {
        const isOpen = event.condition && this.state.flags[event.condition.flag] === true;
        const chestSprite = this.spriteRenderer.getTileSprite(isOpen ? 'chest_open' : 'chest');
        if (chestSprite) {
          ctx.drawImage(chestSprite,
            event.at.x * this.tileSize - clampedCamX,
            event.at.y * this.tileSize - clampedCamY
          );
        }
      }
    }
    
    // Draw NPCs
    for (const npc of (map.npcs || [])) {
      if (!this.checkNpcCondition(npc)) continue;
      
      const actor = GAME_DATA.actors[npc.actorId];
      if (!actor) continue;
      
      const sprite = this.spriteRenderer.getCharacterSprite(actor.spriteKey, 'down');
      if (sprite) {
        ctx.drawImage(sprite,
          npc.pos.x * this.tileSize - clampedCamX,
          npc.pos.y * this.tileSize - clampedCamY
        );
      }
    }
    
    // Draw boss (dark knight) before defeated
    if (map.name === '城の塔（最上階）' && !this.state.flags.boss_defeated) {
      const darkKnightSprite = this.spriteRenderer.getEnemySprite('dark_knight');
      if (darkKnightSprite) {
        ctx.drawImage(darkKnightSprite,
          7 * this.tileSize - clampedCamX,
          3 * this.tileSize - clampedCamY
        );
      }
    }
    
    // Draw hero with smooth position
    const heroSprite = this.spriteRenderer.getCharacterSprite('hero', this.state.direction);
    if (heroSprite) {
      // Add slight bob when walking
      let bobOffset = 0;
      if (this.state.isMoving) {
        bobOffset = this.state.walkFrame === 1 ? -1 : 0;
      }
      
      ctx.drawImage(heroSprite,
        renderX * this.tileSize - clampedCamX,
        renderY * this.tileSize - clampedCamY + bobOffset
      );
    }
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
