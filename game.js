// ============================================
// Game Engine - Pixel Hero: Rescue the Princess
// Complete Edition with Party, Quests & Sound
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
    
    // Movement settings (slightly faster than before)
    this.moveSpeed = 0.12; // Tiles per ms (was 0.08)
    this.moveCooldown = 60; // ms between moves (was 80)
    this.lastInputTime = 0;
    this.currentMoveTime = 0;
    this.startPosition = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    
    // Input state
    this.input = { up: false, down: false, left: false, right: false, action: false };
    
    // Game state
    this.state = {
      screen: 'map', // map, battle, menu, dialogue
      currentMapId: null,
      currentMap: null,
      mapBackground: null,
      position: { x: 0, y: 0 },
      direction: 'down',
      isMoving: false,
      flags: { ...GAME_DATA.flags },
      party: [], // Party member IDs
      partyStats: {}, // Stats for each party member
      inventory: [],
      gold: 100,
      quests: { active: [], completed: [] },
      questProgress: {}, // Track enemy kills etc
      battleState: null,
      dialogueQueue: [],
      currentDialogue: null
    };
    
    // Timing
    this.lastTime = 0;
    
    // Monster tracking (for respawn/removal)
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
    // Initialize hero
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
    
    // Resume audio on first interaction
    document.addEventListener('click', () => this.audio.resume(), { once: true });
    document.addEventListener('keydown', () => this.audio.resume(), { once: true });
  }
  
  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (this.state.screen === 'map' && !this.state.currentDialogue) {
      if (key === 'arrowup' || key === 'w') this.input.up = true;
      if (key === 'arrowdown' || key === 's') this.input.down = true;
      if (key === 'arrowleft' || key === 'a') this.input.left = true;
      if (key === 'arrowright' || key === 'd') this.input.right = true;
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
    // Menu button
    document.getElementById('btn-menu')?.addEventListener('click', () => {
      this.toggleMenu();
    });
    
    // Battle commands
    document.querySelectorAll('.battle-cmd').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        this.handleBattleCommand(cmd);
      });
    });
    
    // Menu items
    document.querySelectorAll('.menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const menu = btn.dataset.menu;
        this.selectMenuItem(menu);
      });
    });
    
    // Retry/Title buttons
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      location.reload();
    });
    
    document.getElementById('btn-title')?.addEventListener('click', () => {
      location.reload();
    });
    
    // Dialogue click
    document.getElementById('dialogue-box')?.addEventListener('click', () => {
      this.advanceDialogue();
    });
  }
  
  // === MAP & MOVEMENT ===
  
  loadMap(mapId, spawn) {
    const map = GAME_DATA.maps[mapId];
    if (!map) {
      console.error(`Map not found: ${mapId}`);
      return;
    }
    
    this.state.currentMapId = mapId;
    this.state.currentMap = { ...map, id: mapId };
    this.state.position = { ...spawn };
    this.state.isMoving = false;
    
    // Generate map background
    this.state.mapBackground = this.spriteRenderer.generateMapBackground(map, this.displayScale);
    
    // Initialize monster positions
    this.initMonsterPositions();
    
    // Update UI
    document.getElementById('map-name').textContent = `${map.name} (Lv.${map.recommendedLevel})`;
    
    // Check auto events
    setTimeout(() => this.checkAutoEvents(), 100);
  }
  
  initMonsterPositions() {
    const map = this.state.currentMap;
    this.monsterPositions = {};
    
    if (map.monsters) {
      map.monsters.forEach((monster, idx) => {
        const key = `${map.id}_${idx}`;
        if (!this.defeatedMonsters.has(key) && this.checkCondition(monster.condition)) {
          this.monsterPositions[key] = { ...monster.pos };
        }
      });
    }
  }
  
  move(direction) {
    if (this.state.isMoving || this.state.screen !== 'map' || this.state.currentDialogue) return;
    
    const now = Date.now();
    if (now - this.lastInputTime < this.moveCooldown) return;
    this.lastInputTime = now;
    
    const vectors = GAME_DATA.constants.directionVectors;
    const vector = vectors[direction];
    
    this.state.direction = direction;
    
    const newX = Math.round(this.state.position.x) + vector.x;
    const newY = Math.round(this.state.position.y) + vector.y;
    
    // Check exit first
    const exit = this.checkExit(newX, newY);
    if (exit) {
      if (!exit.condition || this.checkCondition(exit.condition)) {
        this.audio.step();
        this.loadMap(exit.toMapId, exit.spawn);
        return;
      }
    }
    
    // Check collision
    if (!this.checkCollision(newX, newY)) {
      this.state.isMoving = true;
      this.startPosition = { x: Math.round(this.state.position.x), y: Math.round(this.state.position.y) };
      this.targetPosition = { x: newX, y: newY };
      this.currentMoveTime = 0;
      this.audio.step();
    }
  }
  
  checkCollision(x, y) {
    const map = this.state.currentMap;
    if (!map) return true;
    
    // Bounds check
    if (x < 0 || y < 0 || x >= map.size.w || y >= map.size.h) return true;
    
    // Collision tile check
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
    
    // Check action events
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
          break;
        }
      }
    }
    
    // Check monster collision
    this.checkMonsterCollision(x, y);
    
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
    
    // Check item actions (pots, chests)
    this.checkItemAction(x, y);
  }
  
  checkMonsterCollision(x, y) {
    const map = this.state.currentMap;
    if (!map?.monsters) return;
    
    for (let idx = 0; idx < map.monsters.length; idx++) {
      const monster = map.monsters[idx];
      const key = `${map.id}_${idx}`;
      const pos = this.monsterPositions[key];
      
      if (!pos || this.defeatedMonsters.has(key)) continue;
      if (!this.checkCondition(monster.condition)) continue;
      
      if (pos.x === x && pos.y === y) {
        this.audio.encounter();
        this.startBattle(monster.enemyId, 1, key, monster.boss);
        break;
      }
    }
  }
  
  checkItemPickup(x, y) {
    const map = this.state.currentMap;
    if (!map?.items) return;
    
    for (const item of map.items) {
      if (item.pos.x === x && item.pos.y === y) {
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
      if (item.pos.x === x && item.pos.y === y && item.sprite === 'pot') {
        const flagKey = `item_${map.id}_${item.id}`;
        if (!this.state.flags[flagKey]) {
          this.state.flags[flagKey] = true;
          
          if (item.itemId) {
            this.giveItem(item.itemId, 1);
            const itemData = GAME_DATA.items[item.itemId];
            this.audio.chest();
            this.showDialogue('system', `ツボを調べた…${itemData?.name || item.itemId}を見つけた！`);
          } else {
            this.showDialogue('system', 'ツボは空だった。');
          }
          return;
        }
      }
      if (item.pos.x === x && item.pos.y === y && item.sprite === 'chest') {
        const flagKey = `item_${map.id}_${item.id}`;
        if (!this.state.flags[flagKey]) {
          this.state.flags[flagKey] = true;
          
          if (item.itemId) {
            this.giveItem(item.itemId, 1);
            const itemData = GAME_DATA.items[item.itemId];
            this.audio.chest();
            this.showDialogue('system', `宝箱を開けた！${itemData?.name || item.itemId}を手に入れた！`);
          }
          return;
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
        
      case 'removeItem':
        this.removeItem(step.itemId, step.qty);
        this.processNextEventStep();
        break;
        
      case 'giveGold':
        this.state.gold += step.amount;
        this.audio.getItem();
        this.processNextEventStep();
        break;
        
      case 'addPartyMember':
        this.addPartyMember(step.actorId);
        this.audio.partyJoin();
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
        
      case 'startQuest':
        this.startQuest(step.questId);
        this.processNextEventStep();
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
  
  // === PARTY SYSTEM ===
  
  addPartyMember(actorId) {
    if (this.state.party.includes(actorId)) return;
    
    const actor = GAME_DATA.actors[actorId];
    if (!actor) return;
    
    this.state.party.push(actorId);
    this.state.partyStats[actorId] = {
      ...JSON.parse(JSON.stringify(actor.stats)),
      equipment: { ...actor.equipment },
      skills: [...actor.skills]
    };
  }
  
  getPartyMember(actorId) {
    return this.state.partyStats[actorId];
  }
  
  getTotalStats(actorId) {
    const member = this.getPartyMember(actorId);
    if (!member) return null;
    
    const stats = { ...member };
    
    // Add equipment bonuses
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
  
  // === QUEST SYSTEM ===
  
  startQuest(questId) {
    if (this.state.quests.active.includes(questId)) return;
    if (this.state.quests.completed.includes(questId)) return;
    
    this.state.quests.active.push(questId);
    this.state.questProgress[questId] = { kills: {} };
  }
  
  updateQuestProgress(enemyId) {
    for (const questId of this.state.quests.active) {
      const quest = GAME_DATA.quests[questId];
      if (quest?.target?.enemy === enemyId) {
        const progress = this.state.questProgress[questId];
        progress.kills[enemyId] = (progress.kills[enemyId] || 0) + 1;
        
        if (progress.kills[enemyId] >= quest.target.count) {
          this.completeQuest(questId);
        }
      }
    }
  }
  
  completeQuest(questId) {
    const idx = this.state.quests.active.indexOf(questId);
    if (idx === -1) return;
    
    this.state.quests.active.splice(idx, 1);
    this.state.quests.completed.push(questId);
    
    const quest = GAME_DATA.quests[questId];
    if (quest) {
      this.state.flags[quest.flag] = true;
      
      // Give rewards
      if (quest.reward) {
        if (quest.reward.exp) {
          for (const memberId of this.state.party) {
            this.giveExp(memberId, quest.reward.exp);
          }
        }
        if (quest.reward.gold) {
          this.state.gold += quest.reward.gold;
        }
        if (quest.reward.item) {
          this.giveItem(quest.reward.item, quest.reward.qty || 1);
        }
      }
      
      this.audio.questComplete();
      this.showDialogue('system', `【クエスト完了】${quest.name}`);
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
        if (i % 2 === 0) this.audio.text();
        i++;
      } else {
        clearInterval(typewriter);
      }
    }, 30);
    
    this.state.typewriterInterval = typewriter;
  }
  
  advanceDialogue() {
    if (!this.state.currentDialogue) return;
    
    // Clear typewriter
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
  
  // === BATTLE SYSTEM ===
  
  startBattle(enemyId, count = 1, monsterKey = null, isBoss = false) {
    const enemy = GAME_DATA.enemies[enemyId];
    if (!enemy) return;
    
    this.state.screen = 'battle';
    this.state.battleState = {
      enemies: [{
        ...JSON.parse(JSON.stringify(enemy)),
        id: enemyId,
        hp: enemy.stats.hp,
        maxHp: enemy.stats.maxHp
      }],
      currentMemberIndex: 0,
      turn: 'player',
      monsterKey,
      isBoss,
      defending: {}
    };
    
    this.showScreen('battle-screen');
    this.updateBattleUI();
    
    if (isBoss) {
      this.audio.bossAppear();
    } else {
      this.audio.encounter();
    }
    
    this.showBattleMessage(`${enemy.name}が現れた！`);
  }
  
  updateBattleUI() {
    const bs = this.state.battleState;
    if (!bs) return;
    
    const enemy = bs.enemies[0];
    const hero = this.getTotalStats('hero');
    
    // Enemy info
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
    
    // Hero info
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
    if (this.state.battleState?.turn !== 'player') return;
    
    this.audio.select();
    
    switch (cmd) {
      case 'attack':
        this.playerAttack();
        break;
      case 'skill':
        this.showSkillMenu();
        break;
      case 'item':
        this.showBattleItemMenu();
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
    this.showBattleMessage(`${hero.level > 1 ? '勇者' : '勇者'}の攻撃！${damage}のダメージ！`);
    this.updateBattleUI();
    
    setTimeout(() => this.checkBattleEnd(), 1000);
  }
  
  playerDefend() {
    this.state.battleState.defending['hero'] = true;
    this.showBattleMessage('勇者は身を守っている！');
    setTimeout(() => this.enemyTurn(), 1000);
  }
  
  showSkillMenu() {
    const hero = this.getPartyMember('hero');
    const skills = hero.skills;
    
    let msg = 'とくぎ: ';
    skills.forEach((skillId, i) => {
      const skill = GAME_DATA.skills[skillId];
      msg += `${i + 1}.${skill.name}(MP${skill.cost.mp}) `;
    });
    
    this.showBattleMessage(msg);
    
    // For simplicity, use first offensive skill
    const skillId = skills.find(s => GAME_DATA.skills[s].target === 'enemy');
    if (skillId) {
      setTimeout(() => this.useSkill(skillId), 500);
    } else {
      setTimeout(() => this.enemyTurn(), 500);
    }
  }
  
  useSkill(skillId) {
    const skill = GAME_DATA.skills[skillId];
    const hero = this.getPartyMember('hero');
    
    if (hero.mp < skill.cost.mp) {
      this.showBattleMessage('MPが足りない！');
      setTimeout(() => this.enemyTurn(), 1000);
      return;
    }
    
    hero.mp -= skill.cost.mp;
    
    if (skill.target === 'enemy') {
      const heroStats = this.getTotalStats('hero');
      const enemy = this.state.battleState.enemies[0];
      const baseDamage = Math.max(1, heroStats.atk * skill.power - enemy.stats.def / 2);
      const damage = Math.floor(baseDamage * (Math.random() * 0.2 + 0.9));
      
      enemy.hp = Math.max(0, enemy.hp - damage);
      
      this.audio.attack();
      this.showBattleEffect('slash');
      this.showBattleMessage(`${skill.name}！${damage}のダメージ！`);
    } else if (skill.healAmount) {
      const heal = Math.min(skill.healAmount, hero.maxHp - hero.hp);
      hero.hp += heal;
      this.audio.heal();
      this.showBattleMessage(`${skill.name}！HPが${heal}回復した！`);
    }
    
    this.updateBattleUI();
    setTimeout(() => this.checkBattleEnd(), 1000);
  }
  
  showBattleItemMenu() {
    const consumables = this.state.inventory.filter(item => {
      const data = GAME_DATA.items[item.itemId];
      return data?.type === 'consumable';
    });
    
    if (consumables.length === 0) {
      this.showBattleMessage('使えるアイテムがない！');
      return;
    }
    
    // Use first potion
    const potion = consumables.find(i => i.itemId === 'potion' || i.itemId === 'hi_potion');
    if (potion) {
      this.useBattleItem(potion.itemId);
    } else {
      this.showBattleMessage('回復アイテムがない！');
    }
  }
  
  useBattleItem(itemId) {
    const item = GAME_DATA.items[itemId];
    if (!item) return;
    
    this.removeItem(itemId, 1);
    
    const hero = this.getPartyMember('hero');
    for (const effect of item.use.effects) {
      if (effect.type === 'healHp') {
        const heal = Math.min(effect.value, hero.maxHp - hero.hp);
        hero.hp += heal;
        this.audio.heal();
        this.showBattleMessage(`${item.name}を使った！HPが${heal}回復した！`);
      } else if (effect.type === 'healMp') {
        const heal = Math.min(effect.value, hero.maxMp - hero.mp);
        hero.mp += heal;
        this.audio.heal();
        this.showBattleMessage(`${item.name}を使った！MPが${heal}回復した！`);
      }
    }
    
    this.updateBattleUI();
    setTimeout(() => this.enemyTurn(), 1000);
  }
  
  enemyTurn() {
    const bs = this.state.battleState;
    if (!bs || bs.enemies[0].hp <= 0) return;
    
    bs.turn = 'enemy';
    this.enableBattleCommands(false);
    
    const enemy = bs.enemies[0];
    const ai = enemy.ai?.pattern || ['attack'];
    const action = ai[Math.floor(Math.random() * ai.length)];
    
    const hero = this.getPartyMember('hero');
    const heroStats = this.getTotalStats('hero');
    
    let damage = 0;
    let message = '';
    
    switch (action) {
      case 'attack':
        const defending = bs.defending['hero'];
        const defMod = defending ? 2 : 1;
        damage = Math.max(1, Math.floor((enemy.stats.atk - heroStats.def / defMod) * (Math.random() * 0.3 + 0.85)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の攻撃！${damage}のダメージ！`;
        this.audio.damage();
        this.showBattleEffect('damage');
        break;
        
      case 'powerAttack':
        damage = Math.max(1, Math.floor((enemy.stats.atk * 1.5 - heroStats.def) * (Math.random() * 0.3 + 0.85)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の強攻撃！${damage}のダメージ！`;
        this.audio.critical();
        this.showBattleEffect('damage');
        break;
        
      case 'magic':
        damage = Math.max(1, Math.floor(enemy.stats.atk * 1.2 * (Math.random() * 0.3 + 0.85)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の魔法攻撃！${damage}のダメージ！`;
        this.audio.damage();
        this.showBattleEffect('damage');
        break;
        
      case 'ultimate':
        damage = Math.max(1, Math.floor(enemy.stats.atk * 2 * (Math.random() * 0.2 + 0.9)));
        hero.hp = Math.max(0, hero.hp - damage);
        message = `${enemy.name}の究極攻撃！${damage}のダメージ！`;
        this.audio.critical();
        this.showBattleEffect('damage');
        break;
        
      case 'defend':
        message = `${enemy.name}は身構えている…`;
        break;
    }
    
    bs.defending = {}; // Reset defending
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
    
    // Mark monster as defeated
    if (bs.monsterKey) {
      this.defeatedMonsters.add(bs.monsterKey);
    }
    
    // Update quest progress
    this.updateQuestProgress(enemy.id);
    
    // Calculate rewards
    const expGain = enemyData.exp || 10;
    const goldGain = enemyData.gold || 5;
    
    this.state.gold += goldGain;
    
    // Give EXP to all party members
    for (const memberId of this.state.party) {
      this.giveExp(memberId, expGain);
    }
    
    // Check drops
    let dropMessage = '';
    if (enemyData.drops) {
      for (const drop of enemyData.drops) {
        if (Math.random() < drop.chance) {
          this.giveItem(drop.itemId, drop.qty);
          const itemData = GAME_DATA.items[drop.itemId];
          dropMessage = `\n${itemData?.name || drop.itemId}を手に入れた！`;
        }
      }
    }
    
    this.showBattleMessage(`${enemy.name}を倒した！\n${expGain}EXP ${goldGain}G獲得！${dropMessage}`);
    
    setTimeout(() => {
      // Check for scripted battle victory
      if (this.state.pendingBattleVictory) {
        this.state.eventSteps = [...this.state.pendingBattleVictory];
        this.state.pendingBattleVictory = null;
        this.state.pendingBattleDefeat = null;
        this.endBattle();
        this.processNextEventStep();
      } else {
        this.endBattle();
      }
    }, 2000);
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
  
  // === LEVELING ===
  
  giveExp(memberId, amount) {
    const member = this.getPartyMember(memberId);
    if (!member) return;
    
    member.exp += amount;
    
    // Check level up
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
    
    // Apply growths
    const growths = actor.growths;
    member.maxHp += growths.hp;
    member.hp = member.maxHp;
    member.maxMp += growths.mp;
    member.mp = member.maxMp;
    member.atk += growths.atk;
    member.def += growths.def;
    member.spd += growths.spd;
    
    this.audio.levelUp();
    this.showDialogue('system', `${actor.name}はレベル${member.level}になった！`);
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
  
  hasItem(itemId) {
    return this.state.inventory.some(i => i.itemId === itemId && i.qty > 0);
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
    
    // Status
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
    
    // Equipment
    const weapon = GAME_DATA.equipment[heroBase.equipment.weapon];
    const armor = GAME_DATA.equipment[heroBase.equipment.armor];
    document.getElementById('equip-weapon').textContent = weapon?.name || 'なし';
    document.getElementById('equip-armor').textContent = armor?.name || 'なし';
    
    // Party display
    this.updatePartyUI();
    
    // Quest display
    this.updateQuestUI();
  }
  
  updatePartyUI() {
    const partyList = document.getElementById('party-list');
    if (!partyList) return;
    
    partyList.innerHTML = '';
    for (const memberId of this.state.party) {
      const member = this.getPartyMember(memberId);
      const actor = GAME_DATA.actors[memberId];
      
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="party-name">${actor.name}</span>
        <span class="party-class">${actor.class}</span>
        <span class="party-level">Lv.${member.level}</span>
        <span class="party-hp">HP:${member.hp}/${member.maxHp}</span>
      `;
      partyList.appendChild(li);
    }
  }
  
  updateQuestUI() {
    const questList = document.getElementById('quest-list');
    if (!questList) return;
    
    questList.innerHTML = '';
    for (const questId of this.state.quests.active) {
      const quest = GAME_DATA.quests[questId];
      const progress = this.state.questProgress[questId];
      
      const li = document.createElement('li');
      let progressText = '';
      if (quest.target) {
        const kills = progress?.kills?.[quest.target.enemy] || 0;
        progressText = ` (${kills}/${quest.target.count})`;
      }
      li.innerHTML = `<span class="quest-name">${quest.name}${progressText}</span><span class="quest-type">${quest.type === 'main' ? 'メイン' : 'サブ'}</span>`;
      questList.appendChild(li);
    }
    
    if (this.state.quests.active.length === 0) {
      questList.innerHTML = '<li class="no-quests">進行中のクエストはありません</li>';
    }
  }
  
  useMenuItem(itemId) {
    const item = GAME_DATA.items[itemId];
    if (!item || item.type !== 'consumable') return;
    
    const hero = this.getPartyMember('hero');
    let used = false;
    
    for (const effect of item.use.effects) {
      if (effect.type === 'healHp' && hero.hp < hero.maxHp) {
        const heal = Math.min(effect.value, hero.maxHp - hero.hp);
        hero.hp += heal;
        this.removeItem(itemId, 1);
        this.audio.heal();
        this.showDialogue('system', `${item.name}を使った！HPが${heal}回復した！`);
        used = true;
        break;
      } else if (effect.type === 'healMp' && hero.mp < hero.maxMp) {
        const heal = Math.min(effect.value, hero.maxMp - hero.mp);
        hero.mp += heal;
        this.removeItem(itemId, 1);
        this.audio.heal();
        this.showDialogue('system', `${item.name}を使った！MPが${heal}回復した！`);
        used = true;
        break;
      }
    }
    
    if (!used) {
      this.audio.cancel();
    }
    
    this.updateMenuUI();
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
    
    this.update(deltaTime, timestamp);
    this.render(timestamp);
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  update(deltaTime, timestamp) {
    if (this.state.screen !== 'map' || this.state.currentDialogue) return;
    
    // Update monster movement
    this.updateMonsters(deltaTime);
    
    if (this.state.isMoving) {
      this.currentMoveTime += deltaTime;
      const duration = 1 / this.moveSpeed;
      let progress = this.currentMoveTime / duration;
      
      if (progress >= 1) {
        this.state.position = { ...this.targetPosition };
        this.state.isMoving = false;
        this.currentMoveTime = 0;
        
        // Check events at new position
        this.checkTouchEvents(this.state.position.x, this.state.position.y);
      } else {
        // Ease out
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        this.state.position.x = this.startPosition.x + (this.targetPosition.x - this.startPosition.x) * easedProgress;
        this.state.position.y = this.startPosition.y + (this.targetPosition.y - this.startPosition.y) * easedProgress;
      }
    } else {
      // Handle input
      if (this.input.up) this.move('up');
      else if (this.input.down) this.move('down');
      else if (this.input.left) this.move('left');
      else if (this.input.right) this.move('right');
    }
  }
  
  updateMonsters(deltaTime) {
    this.monsterMoveTimer += deltaTime;
    if (this.monsterMoveTimer < 1000) return; // Move every 1 second
    this.monsterMoveTimer = 0;
    
    const map = this.state.currentMap;
    if (!map?.monsters) return;
    
    const vectors = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 }
    ];
    
    for (let idx = 0; idx < map.monsters.length; idx++) {
      const monster = map.monsters[idx];
      const key = `${map.id}_${idx}`;
      const pos = this.monsterPositions[key];
      
      if (!pos || this.defeatedMonsters.has(key)) continue;
      if (monster.movePattern === 'none') continue;
      
      // Random movement
      if (Math.random() < 0.5) {
        const dir = vectors[Math.floor(Math.random() * vectors.length)];
        const newX = pos.x + dir.x;
        const newY = pos.y + dir.y;
        
        // Check collision
        if (!this.checkCollision(newX, newY) && 
            !(newX === Math.round(this.state.position.x) && newY === Math.round(this.state.position.y))) {
          pos.x = newX;
          pos.y = newY;
        }
      }
    }
  }
  
  render(timestamp) {
    if (this.state.screen !== 'map') return;
    
    const ctx = this.ctx;
    const map = this.state.currentMap;
    if (!map) return;
    
    // Update animation
    this.spriteRenderer.updateAnimation(timestamp);
    
    // Clear
    ctx.fillStyle = '#1a2636';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate camera
    const camX = this.state.position.x * this.scaledTileSize - this.canvas.width / 2 + this.scaledTileSize / 2;
    const camY = this.state.position.y * this.scaledTileSize - this.canvas.height / 2 + this.scaledTileSize / 2;
    
    const maxCamX = map.size.w * this.scaledTileSize - this.canvas.width;
    const maxCamY = map.size.h * this.scaledTileSize - this.canvas.height;
    const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
    const clampedCamY = Math.max(0, Math.min(maxCamY, camY));
    
    // Draw map background
    if (this.state.mapBackground) {
      ctx.drawImage(this.state.mapBackground, -clampedCamX, -clampedCamY);
    }
    
    // Draw items (sparkles, pots, chests)
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
    
    // Draw NPCs
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
    
    // Draw monsters
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
    
    // Draw hero
    const heroSprite = this.spriteRenderer.getCharacterSprite('hero', this.state.direction, this.displayScale);
    if (heroSprite) {
      ctx.drawImage(heroSprite,
        this.state.position.x * this.scaledTileSize - clampedCamX,
        this.state.position.y * this.scaledTileSize - clampedCamY
      );
    }
    
    // Draw exit indicators
    if (map.exits) {
      for (const exit of map.exits) {
        if (exit.condition && !this.checkCondition(exit.condition)) continue;
        
        const sprite = this.spriteRenderer.getTileSprite('exit_arrow', this.displayScale);
        if (sprite) {
          ctx.globalAlpha = 0.7;
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

// Start game
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
