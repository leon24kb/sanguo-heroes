// 三国群英传 - 成就系统
window.AchievementManager = {
    achievements: [
        // 收集类(14)
        { id: 'gather_5', name: '初出茅庐', desc: '收集5位武将', category: '收集', tier: 1, check: () => UnlockManager.getUnlockedCount() >= 5 },
        { id: 'gather_10', name: '小有所成', desc: '收集10位武将', category: '收集', tier: 1, check: () => UnlockManager.getUnlockedCount() >= 10 },
        { id: 'gather_20', name: '广纳贤才', desc: '收集20位武将', category: '收集', tier: 2, check: () => UnlockManager.getUnlockedCount() >= 20 },
        { id: 'gather_30', name: '群英荟萃', desc: '收集30位武将', category: '收集', tier: 2, check: () => UnlockManager.getUnlockedCount() >= 30 },
        { id: 'gather_50', name: '半壁江山', desc: '收集50位武将', category: '收集', tier: 3, check: () => UnlockManager.getUnlockedCount() >= 50 },
        { id: 'gather_all', name: '三分归一', desc: '收集全部武将', category: '收集', tier: 3, check: () => UnlockManager.getUnlockedCount() >= 86 },
        { id: 'wei_10', name: '魏武之强', desc: '收集10位魏国武将', category: '收集', tier: 1, check: () => heroesData.getByForce('wei').filter(h => UnlockManager.isHeroUnlocked(h.name)).length >= 10 },
        { id: 'shu_10', name: '蜀汉忠义', desc: '收集10位蜀国武将', category: '收集', tier: 1, check: () => heroesData.getByForce('shu').filter(h => UnlockManager.isHeroUnlocked(h.name)).length >= 10 },
        { id: 'wu_10', name: '江东猛虎', desc: '收集10位吴国武将', category: '收集', tier: 1, check: () => heroesData.getByForce('wu').filter(h => UnlockManager.isHeroUnlocked(h.name)).length >= 10 },
        { id: 'qun_5', name: '群雄逐鹿', desc: '收集5位群雄武将', category: '收集', tier: 1, check: () => heroesData.getByForce('qun').filter(h => UnlockManager.isHeroUnlocked(h.name)).length >= 5 },
        { id: 'wei_all', name: '曹魏霸业', desc: '收集全部魏国武将', category: '收集', tier: 3, check: () => heroesData.getByForce('wei').every(h => UnlockManager.isHeroUnlocked(h.name)) },
        { id: 'shu_all', name: '匡扶汉室', desc: '收集全部蜀国武将', category: '收集', tier: 3, check: () => heroesData.getByForce('shu').every(h => UnlockManager.isHeroUnlocked(h.name)) },
        { id: 'wu_all', name: '虎踞江东', desc: '收集全部吴国武将', category: '收集', tier: 3, check: () => heroesData.getByForce('wu').every(h => UnlockManager.isHeroUnlocked(h.name)) },
        { id: 'qun_all', name: '乱世英雄', desc: '收集全部群雄武将', category: '收集', tier: 3, check: () => heroesData.getByForce('qun').every(h => UnlockManager.isHeroUnlocked(h.name)) },
        // 答题类(12)
        { id: 'quiz_50', name: '博闻强识', desc: '累计答对50题', category: '答题', tier: 1, check: () => UnlockManager.getStats().totalCorrect >= 50 },
        { id: 'quiz_100', name: '学富五车', desc: '累计答对100题', category: '答题', tier: 1, check: () => UnlockManager.getStats().totalCorrect >= 100 },
        { id: 'quiz_300', name: '满腹经纶', desc: '累计答对300题', category: '答题', tier: 2, check: () => UnlockManager.getStats().totalCorrect >= 300 },
        { id: 'quiz_500', name: '才高八斗', desc: '累计答对500题', category: '答题', tier: 2, check: () => UnlockManager.getStats().totalCorrect >= 500 },
        { id: 'quiz_1000', name: '学究天人', desc: '累计答对1000题', category: '答题', tier: 3, check: () => UnlockManager.getStats().totalCorrect >= 1000 },
        { id: 'streak_10', name: '过目不忘', desc: '连续答对10题', category: '答题', tier: 1, check: () => UnlockManager.getStats().maxStreak >= 10 },
        { id: 'streak_30', name: '对答如流', desc: '连续答对30题', category: '答题', tier: 2, check: () => UnlockManager.getStats().maxStreak >= 30 },
        { id: 'streak_50', name: '才思敏捷', desc: '连续答对50题', category: '答题', tier: 3, check: () => UnlockManager.getStats().maxStreak >= 50 },
        { id: 'perfect_5', name: '明察秋毫', desc: '完美解锁5位武将', category: '答题', tier: 1, check: () => UnlockManager._data.stats.perfectUnlocks >= 5 },
        { id: 'perfect_20', name: '慧眼识珠', desc: '完美解锁20位武将', category: '答题', tier: 2, check: () => UnlockManager._data.stats.perfectUnlocks >= 20 },
        { id: 'perfect_50', name: '火眼金睛', desc: '完美解锁50位武将', category: '答题', tier: 3, check: () => UnlockManager._data.stats.perfectUnlocks >= 50 },
        // 无尽挑战类(14) - 简化版
        { id: 'endless_10', name: '初试锋芒', desc: '无尽模式答对10题', category: '无尽', tier: 1, check: () => (UnlockManager._data.endlessBest || 0) >= 10 },
        { id: 'endless_30', name: '过关斩将', desc: '无尽模式答对30题', category: '无尽', tier: 1, check: () => (UnlockManager._data.endlessBest || 0) >= 30 },
        { id: 'endless_50', name: '勇冠三军', desc: '无尽模式答对50题', category: '无尽', tier: 2, check: () => (UnlockManager._data.endlessBest || 0) >= 50 },
        { id: 'endless_100', name: '万夫莫敌', desc: '无尽模式答对100题', category: '无尽', tier: 2, check: () => (UnlockManager._data.endlessBest || 0) >= 100 },
        { id: 'endless_200', name: '天下无双', desc: '无尽模式答对200题', category: '无尽', tier: 3, check: () => (UnlockManager._data.endlessBest || 0) >= 200 },
        // 特殊荣誉(10)
        { id: 'unlock_caocao', name: '乱世奸雄', desc: '完美解锁曹操', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('曹操') },
        { id: 'unlock_liubei', name: '仁德之主', desc: '完美解锁刘备', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('刘备') },
        { id: 'unlock_guanyu', name: '武圣降临', desc: '完美解锁关羽', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('关羽') },
        { id: 'unlock_zhugeliang', name: '卧龙出山', desc: '完美解锁诸葛亮', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('诸葛亮') },
        { id: 'unlock_zhaoyun', name: '一身是胆', desc: '完美解锁赵云', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('赵云') },
        { id: 'unlock_lvbu', name: '人中吕布', desc: '完美解锁吕布', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('吕布') },
        { id: 'unlock_simayi', name: '冢虎之智', desc: '完美解锁司马懿', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('司马懿') },
        { id: 'unlock_diaochan', name: '闭月羞花', desc: '完美解锁貂蝉', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('貂蝉') },
        { id: 'unlock_sunquan', name: '江东霸主', desc: '完美解锁孙权', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('孙权') },
        { id: 'unlock_zhouyu', name: '赤壁雄风', desc: '完美解锁周瑜', category: '特殊', tier: 3, check: () => UnlockManager.isPerfectUnlock('周瑜') }
    ],

    show() {
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('modal');

        // 检查成就
        const unlocked = UnlockManager._data.achievements || [];
        const categories = ['全部', '收集', '答题', '无尽', '特殊'];

        modal.innerHTML = `
            <div class="modal-panel" style="max-height:85vh;overflow:hidden;">
                <div style="padding:20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <h2 style="font-family:var(--font-title);font-size:28px;">🏆 成就</h2>
                    <span style="font-size:14px;color:var(--淡墨灰);">已获得 ${unlocked.length}/${this.achievements.length}</span>
                    <button onclick="AchievementManager.close()" style="width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.1);color:var(--淡墨灰);font-size:18px;cursor:pointer;">✕</button>
                </div>
                <div style="display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
                    ${categories.map(c => `<button class="filter-btn ach-tab ${c==='全部'?'active':''}" onclick="AchievementManager.filterCategory('${c}')">${c}</button>`).join('')}
                </div>
                <div id="achievement-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:20px;max-height:60vh;overflow-y:auto;">
                </div>
            </div>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');
        this.filterCategory('全部');
    },

    filterCategory(cat) {
        const grid = document.getElementById('achievement-grid');
        if (!grid) return;

        document.querySelectorAll('.ach-tab').forEach(t => t.classList.toggle('active', t.textContent === cat));

        const unlocked = UnlockManager._data.achievements || [];
        const filtered = cat === '全部' ? this.achievements : this.achievements.filter(a => a.category === cat);

        grid.innerHTML = filtered.map(a => {
            const isUnlocked = unlocked.includes(a.id);
            const tierIcon = a.tier === 1 ? '🥉' : a.tier === 2 ? '🥈' : '🥇';
            const borderColor = isUnlocked ? '#DAA520' : '#999';
            return `<div style="padding:12px;border-radius:8px;border:1px solid ${borderColor};${isUnlocked ? '' : 'opacity:0.5;'}">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:24px;">${isUnlocked ? tierIcon : '🔒'}</span>
                    <div>
                        <div style="font-size:14px;font-weight:700;">${a.name}</div>
                        <div style="font-size:12px;color:var(--淡墨灰);">${a.desc}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // 检查并解锁新成就
    checkAchievements() {
        const current = UnlockManager._data.achievements || [];
        let newUnlocks = [];

        this.achievements.forEach(a => {
            if (!current.includes(a.id) && a.check()) {
                current.push(a.id);
                newUnlocks.push(a);
            }
        });

        if (newUnlocks.length > 0) {
            UnlockManager._data.achievements = current;
            UnlockManager.saveProgress();

            // 显示新成就提示
            newUnlocks.forEach((a, i) => {
                setTimeout(() => {
                    const fb = document.createElement('div');
                    fb.className = 'quiz-feedback correct';
                    fb.textContent = `🏆 成就解锁：${a.name}`;
                    document.body.appendChild(fb);
                    setTimeout(() => fb.remove(), 2000);
                }, i * 1500);
            });
        }
    },

    close() {
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('modal').classList.remove('active');
    }
};
