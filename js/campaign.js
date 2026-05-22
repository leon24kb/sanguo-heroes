// 三国群英传 - 战役模式
window.CampaignManager = {
    campaigns: [
        { id: 'huangjin', name: '黄巾之乱', difficulty: 1, questionCount: 8, requireCollect: 0, reward: { hintScroll: 3 }, rewardDesc: '+3 提示锦囊' },
        { id: 'hulao', name: '虎牢关之战', difficulty: 2, questionCount: 10, requireCollect: 5, reward: { skipScroll: 3 }, rewardDesc: '+3 跳过锦囊' },
        { id: 'guandu', name: '官渡之战', difficulty: 3, questionCount: 12, requireCollect: 10, reward: { hintScroll: 5 }, rewardDesc: '+5 提示锦囊' },
        { id: 'chibi', name: '赤壁之战', difficulty: 4, questionCount: 15, requireCollect: 20, reward: { skipScroll: 5 }, rewardDesc: '+5 跳过锦囊' },
        { id: 'hefei', name: '合肥之战', difficulty: 3, questionCount: 12, requireCollect: 0, reward: { timeScroll: 3 }, rewardDesc: '+3 时间锦囊', requireForce: 'wu', requireForceCount: 5 },
        { id: 'hanzhong', name: '汉中之战', difficulty: 4, questionCount: 15, requireCollect: 0, reward: { cooldownScroll: 3 }, rewardDesc: '+3 冷却锦囊', requireForce: 'shu', requireForceCount: 10 },
        { id: 'jingzhou', name: '荆州之战', difficulty: 4, questionCount: 15, requireCollect: 0, reward: { hintScroll: 5 }, rewardDesc: '+5 提示锦囊', requireHero: '关羽' },
        { id: 'yiling', name: '夷陵之战', difficulty: 5, questionCount: 18, requireCollect: 0, reward: { cooldownScroll: 5 }, rewardDesc: '+5 冷却锦囊', requireHero: '刘备' },
        { id: 'wuzhangyuan', name: '五丈原之战', difficulty: 5, questionCount: 20, requireCollect: 0, reward: { hintScroll: 10 }, rewardDesc: '+10 提示锦囊', requireHero: '诸葛亮' },
        { id: 'jin', name: '三国归晋', difficulty: 5, questionCount: 25, requireCollect: 50, reward: {}, rewardDesc: '称号"天下一统"' }
    ],

    isUnlocked(campaign) {
        if (campaign.requireCollect > 0 && UnlockManager.getUnlockedCount() < campaign.requireCollect) return false;
        if (campaign.requireForce && heroesData.getByForce(campaign.requireForce).filter(h => UnlockManager.isHeroUnlocked(h.name)).length < (campaign.requireForceCount || 0)) return false;
        if (campaign.requireHero && !UnlockManager.isHeroUnlocked(campaign.requireHero)) return false;
        return true;
    },

    getRecommended(unlockedCount) {
        return this.campaigns.filter(c => this.isUnlocked(c) && !(UnlockManager._data.campaigns[c.name]?.completed)).slice(0, 2).map(c => ({
            ...c,
            unlocked: true
        }));
    },

    show() {
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('modal');
        const completed = Object.keys(UnlockManager._data.campaigns || {}).filter(k => UnlockManager._data.campaigns[k].completed).length;

        modal.innerHTML = `
            <div class="modal-panel" style="max-height:85vh;overflow:hidden;">
                <div style="padding:20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <h2 style="font-family:var(--font-title);font-size:28px;">⚔️ 战役模式</h2>
                    <span style="font-size:14px;color:var(--淡墨灰);">已通关 ${completed}/${this.campaigns.length}</span>
                    <button onclick="CampaignManager.close()" style="width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.1);color:var(--淡墨灰);font-size:18px;cursor:pointer;">✕</button>
                </div>
                <div style="padding:20px;max-height:70vh;overflow-y:auto;">
                    ${this.campaigns.map(c => {
                        const unlocked = this.isUnlocked(c);
                        const data = UnlockManager._data.campaigns[c.name] || {};
                        const isCompleted = data.completed;
                        const statusIcon = isCompleted ? '✅' : unlocked ? '🔓' : '🔒';
                        const statusColor = isCompleted ? '#4CAF50' : unlocked ? 'var(--朱砂印)' : 'var(--淡墨灰)';
                        const leftBorder = isCompleted ? '3px solid #4CAF50' : unlocked ? '3px solid var(--朱砂印)' : '3px solid var(--border-color)';

                        return `<div style="padding:14px;border-left:${leftBorder};border-bottom:1px solid var(--border-color);${!unlocked?'opacity:0.5;':''}">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-family:var(--font-title);font-size:18px;">🏯 ${c.name}</div>
                                    <div style="font-size:12px;color:var(--淡墨灰);margin-top:4px;">
                                        ${'★'.repeat(c.difficulty)}${'☆'.repeat(5-c.difficulty)} · ${c.questionCount}题 · ${statusIcon} ${isCompleted ? '最佳：'+data.bestMistakes+'失误' : unlocked ? '可挑战' : this._getLockReason(c)}
                                    </div>
                                    <div style="font-size:11px;color:var(--朱砂印);margin-top:2px;">奖励：${c.rewardDesc}</div>
                                </div>
                                ${unlocked ? `<button class="quiz-start-btn" style="font-size:13px;padding:8px 16px;" onclick="CampaignManager.startCampaign('${c.name}')">${isCompleted ? '再次挑战' : '开始'}</button>` : ''}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');
    },

    _getLockReason(c) {
        if (c.requireCollect > 0) return `需收集${c.requireCollect}人`;
        if (c.requireForce) return `需收集${heroesData.getForceName(c.requireForce)}${c.requireForceCount}人`;
        if (c.requireHero) return `需解锁${c.requireHero}`;
        return '';
    },

    startCampaign(name) {
        const campaign = this.campaigns.find(c => c.name === name);
        if (!campaign || !this.isUnlocked(campaign)) return;

        // 初始化无尽模式的状态和DOM
        EndlessManager._score = 0;
        EndlessManager._streak = 0;
        EndlessManager._heroPool = [...heroesData.heroes];
        EndlessManager._campaignMode = { name, questionCount: campaign.questionCount, answered: 0, mistakes: 0, maxMistakes: 2 };

        // 确保 quiz-overlay 存在
        let overlay = document.getElementById('quiz-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'quiz-overlay';
            overlay.id = 'quiz-overlay';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');

        EndlessManager._showNextQuestion();
    },

    close() {
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('modal').classList.remove('active');
    }
};
