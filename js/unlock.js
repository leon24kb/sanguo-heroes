/**
 * 三国群英传 - 解锁状态管理模块 (unlock.js)
 * 
 * 管理武将三阶解锁状态、锦囊道具、全局统计、战役进度、成就等。
 * 使用 localStorage 持久化存储。
 */

window.UnlockManager = {
    STORAGE_KEY: 'sanguo_unlock',

    _data: null,
    _listeners: {},

    // === 初始化与持久化 ===

    /**
     * 初始化：从 localStorage 加载进度，若无则创建默认数据
     */
    init() {
        this._data = this.loadProgress();
        if (!this._data) {
            this._data = this.createDefault();
            this.saveProgress();
        }
    },

    /**
     * 创建默认数据结构
     */
    createDefault() {
        return {
            heroes: {},
            stats: {
                totalCorrect: 0,
                totalAnswered: 0,
                currentStreak: 0,
                maxStreak: 0,
                perfectUnlocks: 0,
                noHintUnlocks: 0
            },
            items: {
                hintScroll: 3,
                skipScroll: 3,
                timeScroll: 0,
                cooldownScroll: 0
            },
            campaigns: {},
            achievements: [],
            equippedTitle: '',
            endlessBest: 0
        };
    },

    /**
     * 从 localStorage 加载进度
     */
    loadProgress() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * 保存进度到 localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._data));
        } catch (e) {
            console.error('保存失败:', e);
        }
    },

    // === 三阶状态管理 ===

    /**
     * 获取武将某阶状态
     * @param {string} heroName - 武将名
     * @param {number} stage - 阶数 (1/2/3)
     * @returns {string} 'locked' | 'in_progress' | 'completed'
     */
    getStageStatus(heroName, stage) {
        const hero = this._data.heroes[heroName];
        if (!hero) return 'locked';
        const s = hero['stage' + stage];
        return s ? s.status : 'locked';
    },

    /**
     * 开始某阶挑战
     * - 第一阶：任何武将均可直接开始
     * - 第二阶：需要第一阶完成
     * - 第三阶：需要第二阶完成
     */
    startStage(heroName, stage) {
        if (!this._data.heroes[heroName]) {
            this._data.heroes[heroName] = {
                stage1: { status: 'locked', mistakes: 0 },
                stage2: { status: 'locked', mistakes: 0 },
                stage3: { status: 'locked', mistakes: 0 }
            };
        }

        if (stage === 1) {
            this._data.heroes[heroName].stage1 = { status: 'in_progress', mistakes: 0, correctCount: 0 };
            this.saveProgress();
            return true;
        } else if (stage === 2 && this.getStageStatus(heroName, 1) === 'completed') {
            this._data.heroes[heroName].stage2 = { status: 'in_progress', mistakes: 0, correctCount: 0 };
            this.saveProgress();
            return true;
        } else if (stage === 3 && this.getStageStatus(heroName, 2) === 'completed') {
            this._data.heroes[heroName].stage3 = { status: 'in_progress', mistakes: 0, correctCount: 0 };
            this.saveProgress();
            return true;
        }

        return false;
    },

    /**
     * 记录答题结果
     * @param {string} heroName - 武将名
     * @param {number} stage - 阶数
     * @param {boolean} correct - 是否正确
     */
    recordAnswer(heroName, stage, correct) {
        const hero = this._data.heroes[heroName];
        if (!hero) return;
        const s = hero['stage' + stage];
        if (!s || s.status !== 'in_progress') return;

        this._data.stats.totalAnswered++;

        if (correct) {
            s.correctCount = (s.correctCount || 0) + 1;
            this._data.stats.totalCorrect++;
            this._data.stats.currentStreak++;
            if (this._data.stats.currentStreak > this._data.stats.maxStreak) {
                this._data.stats.maxStreak = this._data.stats.currentStreak;
            }
        } else {
            s.mistakes = (s.mistakes || 0) + 1;
            this._data.stats.currentStreak = 0;
        }

        this.saveProgress();
    },

    /**
     * 完成某阶挑战
     * 若三阶全部完美通关（0失误），则增加完美解锁计数
     */
    completeStage(heroName, stage) {
        const hero = this._data.heroes[heroName];
        if (!hero) return;
        const s = hero['stage' + stage];
        if (!s || s.status !== 'in_progress') return;

        s.status = 'completed';

        // 三阶全部完美时增加完美计数
        if (s.mistakes === 0 && stage === 3 &&
            hero.stage1.mistakes === 0 && hero.stage2.mistakes === 0) {
            this._data.stats.perfectUnlocks++;
        }

        this.saveProgress();
        this._emit('stageComplete', { heroName, stage, mistakes: s.mistakes });
    },

    /**
     * 武将是否完全解锁（三阶全部完成）
     */
    isHeroUnlocked(heroName) {
        return this.getStageStatus(heroName, 1) === 'completed' &&
               this.getStageStatus(heroName, 2) === 'completed' &&
               this.getStageStatus(heroName, 3) === 'completed';
    },

    /**
     * 武将是否完美解锁（三阶全部完成且0失误）
     */
    isPerfectUnlock(heroName) {
        const hero = this._data.heroes[heroName];
        if (!hero) return false;
        return hero.stage1?.status === 'completed' && hero.stage1?.mistakes === 0 &&
               hero.stage2?.status === 'completed' && hero.stage2?.mistakes === 0 &&
               hero.stage3?.status === 'completed' && hero.stage3?.mistakes === 0;
    },

    /**
     * 获取已解锁武将列表
     */
    getUnlockedHeroes() {
        return Object.keys(this._data.heroes).filter(name => this.isHeroUnlocked(name));
    },

    /**
     * 获取已解锁武将数量
     */
    getUnlockedCount() {
        return this.getUnlockedHeroes().length;
    },

    // === 锦囊道具系统 ===

    /**
     * 使用锦囊道具
     * @param {string} itemType - 道具类型 (hintScroll/skipScroll/timeScroll/cooldownScroll)
     * @returns {boolean} 是否使用成功
     */
    useItem(itemType) {
        if (this._data.items[itemType] > 0) {
            this._data.items[itemType]--;
            this.saveProgress();
            return true;
        }
        return false;
    },

    /**
     * 添加锦囊道具
     */
    addItem(itemType, count) {
        this._data.items[itemType] = (this._data.items[itemType] || 0) + count;
        this.saveProgress();
    },

    /**
     * 获取锦囊道具数量
     */
    getItemCount(itemType) {
        return this._data.items[itemType] || 0;
    },

    // === 统计 ===

    /**
     * 获取全局统计数据
     */
    getStats() {
        return this._data.stats;
    },

    // === 事件系统 ===

    /**
     * 注册事件监听
     */
    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    },

    /**
     * 触发事件
     */
    _emit(event, detail) {
        (this._listeners[event] || []).forEach(cb => cb(detail));
    },

    // === 重置 ===

    /**
     * 重置所有数据为默认值
     */
    reset() {
        this._data = this.createDefault();
        this.saveProgress();
        this._emit('reset', {});
    }
};

// === TDD 自验证测试 ===

window.UnlockManager.runTests = function () {
    console.log('=== UnlockManager 测试 ===');
    let passed = 0, failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log('✅', name);
            passed++;
        } catch (e) {
            console.log('❌', name, '-', e.message);
            failed++;
        }
    }

    function assert(cond, msg) {
        if (!cond) throw new Error(msg || '断言失败');
    }

    // 重置数据，确保干净的测试环境
    this.reset();

    // 测试1: 初始化
    test('初始化后数据不为空', () => {
        assert(this._data !== null, '数据为空');
        assert(this._data.stats.totalCorrect === 0, '初始正确数应为0');
    });

    // 测试2: 开始第一阶
    test('可以开始第一阶', () => {
        this.startStage('关羽', 1);
        assert(this.getStageStatus('关羽', 1) === 'in_progress', '第一阶应为进行中');
    });

    // 测试3: 记录答题
    test('记录正确答题', () => {
        this.recordAnswer('关羽', 1, true);
        assert(this._data.stats.totalCorrect === 1, '正确数应为1');
        assert(this._data.stats.currentStreak === 1, '连对应为1');
    });

    test('记录错误答题', () => {
        this.recordAnswer('关羽', 1, false);
        assert(this._data.heroes['关羽'].stage1.mistakes === 1, '失误应为1');
        assert(this._data.stats.currentStreak === 0, '连对应重置');
    });

    // 测试4: 完成阶段
    test('完成第一阶', () => {
        // 先重置关羽数据，模拟全对通过
        this._data.heroes['关羽'] = {
            stage1: { status: 'in_progress', mistakes: 0, correctCount: 3 },
            stage2: { status: 'locked', mistakes: 0 },
            stage3: { status: 'locked', mistakes: 0 }
        };
        this.completeStage('关羽', 1);
        assert(this.getStageStatus('关羽', 1) === 'completed', '第一阶应完成');
    });

    // 测试5: 第二阶需要第一阶完成
    test('第一阶完成后才能开始第二阶', () => {
        this.startStage('关羽', 2);
        assert(this.getStageStatus('关羽', 2) === 'in_progress', '第二阶应为进行中');
    });

    // 测试6: 未完成前一阶不能开始下一阶
    test('未完成前一阶不能开始下一阶', () => {
        this.startStage('赵云', 2); // 赵云没有完成第一阶
        assert(this.getStageStatus('赵云', 2) === 'locked', '第二阶应锁定');
    });

    // 测试7: 完美解锁检测
    test('完美解锁检测', () => {
        this._data.heroes['张飞'] = {
            stage1: { status: 'completed', mistakes: 0 },
            stage2: { status: 'completed', mistakes: 0 },
            stage3: { status: 'completed', mistakes: 0 }
        };
        assert(this.isPerfectUnlock('张飞') === true, '张飞应完美解锁');
        assert(this.isPerfectUnlock('关羽') === false, '关羽不应完美（有失误）');
    });

    // 测试8: 锦囊系统
    test('锦囊使用和添加', () => {
        const initial = this.getItemCount('hintScroll');
        assert(this.useItem('hintScroll') === true, '应能使用锦囊');
        assert(this.getItemCount('hintScroll') === initial - 1, '锦囊应减少');
        this.addItem('hintScroll', 5);
        assert(this.getItemCount('hintScroll') === initial + 4, '锦囊应增加5');
    });

    // 测试9: 已解锁计数
    test('已解锁武将计数', () => {
        const count = this.getUnlockedCount();
        assert(count >= 1, '至少应有1个解锁（张飞）');
    });

    // 测试10: 重置
    test('重置功能', () => {
        this.reset();
        assert(this.getUnlockedCount() === 0, '重置后应为0');
        assert(this._data.stats.totalCorrect === 0, '重置后统计应为0');
    });

    console.log('\n=== 测试结果: ' + passed + ' 通过, ' + failed + ' 失败 ===');
    return failed === 0;
};

// 测试需手动调用: UnlockManager.runTests()
// 注意: runTests() 会调用 reset()，请勿在生产环境自动执行
