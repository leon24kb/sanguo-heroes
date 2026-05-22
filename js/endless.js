// 三国群英传 - 无尽挑战模式
window.EndlessManager = {
    _score: 0,
    _streak: 0,
    _currentQuestion: null,
    _heroPool: [],
    _campaignMode: null,

    // 检查是否可以开始无尽模式（需要全部87位武将解锁）
    canStart() {
        return UnlockManager.getUnlockedCount() >= heroesData.getTotalCount();
    },

    show() {
        const best = UnlockManager._data.endlessBest || 0;
        const unlocked = UnlockManager.getUnlockedCount();
        const total = heroesData.getTotalCount();
        const canStart = this.canStart();
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('modal');

        modal.innerHTML = `
            <div class="modal-panel" style="text-align:center;">
                <h2 style="font-family:var(--font-title);font-size:32px;margin-bottom:8px;">♾️ 无尽挑战</h2>
                <p style="color:var(--淡墨灰);font-size:14px;margin-bottom:20px;">随机出题，答对加分，答错结束</p>
                <div style="margin-bottom:20px;">
                    <span style="font-size:14px;color:var(--淡墨灰);">最高纪录：</span>
                    <span style="font-size:24px;font-weight:700;color:var(--朱砂印);">${best}</span>
                </div>
                ${canStart
                    ? `<button class="quiz-start-btn" onclick="EndlessManager.start()">开始挑战</button>`
                    : `<div style="margin-bottom:16px;padding:12px;border-radius:8px;background:rgba(178,34,34,0.08);color:var(--朱砂印);font-size:14px;">🔒 需要解锁全部${total}位武将才能开启<br>当前进度：${unlocked}/${total}</div>`
                }
                <br><br>
                <button class="quiz-quit-btn" onclick="EndlessManager.close()">返回</button>
            </div>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');
    },

    start() {
        this._score = 0;
        this._streak = 0;
        this._campaignMode = null;
        this._heroPool = [...heroesData.heroes];

        const overlay = document.getElementById('quiz-overlay');
        if (!overlay) {
            const o = document.createElement('div');
            o.className = 'quiz-overlay';
            o.id = 'quiz-overlay';
            document.body.appendChild(o);
        }

        this._showNextQuestion();
    },

    _showNextQuestion(retryCount = 0) {
        const overlay = document.getElementById('quiz-overlay');
        if (!overlay) return;

        // 防止无限递归
        if (retryCount > 20) {
            console.error('无法获取有效题目，请检查题库');
            this._showGameOver();
            return;
        }

        // 战役模式检查完成条件
        if (this._campaignMode) {
            if (this._campaignMode.answered >= this._campaignMode.questionCount) {
                this._showCampaignResult(true);
                return;
            }
            if (this._campaignMode.mistakes >= this._campaignMode.maxMistakes) {
                this._showCampaignResult(false);
                return;
            }
        }

        // 随机选一个武将和阶段
        const hero = this._heroPool[Math.floor(Math.random() * this._heroPool.length)];
        const stage = Math.ceil(Math.random() * 3);
        const questions = quizBankData.getQuestions(hero.name, stage);

        if (!questions || questions.length === 0) {
            this._showNextQuestion(retryCount + 1);
            return;
        }

        const q = questions[Math.floor(Math.random() * questions.length)];
        this._currentQuestion = { ...q, heroName: hero.name };

        // 拼音注音
        const annotatedQuestion = (window.PinyinHelper && PinyinHelper.isEnabled())
            ? PinyinHelper.annotateText(q.question) : q.question;
        const annotatedOptions = q.options.map(opt =>
            (window.PinyinHelper && PinyinHelper.isEnabled())
                ? PinyinHelper.annotateText(opt) : opt
        );

        const modeTitle = this._campaignMode ? `⚔️ ${this._campaignMode.name}` : '♾️ 无尽挑战';
        const progressInfo = this._campaignMode
            ? `${this._campaignMode.answered + 1}/${this._campaignMode.questionCount}`
            : `得分：${this._score}`;
        const extraInfo = this._campaignMode
            ? `失误：${this._campaignMode.mistakes}/${this._campaignMode.maxMistakes}`
            : `连对：${this._streak}`;

        overlay.innerHTML = `
            <div class="quiz-panel">
                <div class="quiz-info-bar">
                    <span class="quiz-info-hero">${modeTitle}</span>
                    <span class="quiz-info-progress">${progressInfo}</span>
                    <span class="quiz-info-mistakes">${extraInfo}</span>
                    <button class="quiz-exit-btn" onclick="EndlessManager.exit()">✕ 退出</button>
                </div>
                <div class="quiz-game active">
                    <div class="quiz-question-area">
                        <div class="quiz-question-text">${annotatedQuestion}</div>
                        <div class="quiz-options" id="endless-options">
                            ${annotatedOptions.map((opt, i) => `<button class="quiz-option" onclick="EndlessManager.answer(${i})">${opt}</button>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        overlay.classList.add('active');
    },

    answer(index) {
        const q = this._currentQuestion;
        const options = document.querySelectorAll('#endless-options .quiz-option');
        options.forEach(o => o.classList.add('disabled'));

        if (index === q.answer) {
            options[index].classList.add('correct');
            this._score += 10 + this._streak * 2;
            this._streak++;
            UnlockManager._data.stats.totalCorrect++;
            if (this._streak > (UnlockManager._data.stats.maxStreak || 0)) {
                UnlockManager._data.stats.maxStreak = this._streak;
            }
            UnlockManager.saveProgress();

            if (this._campaignMode) {
                this._campaignMode.answered++;
            }

            setTimeout(() => this._showNextQuestion(), 800);
        } else {
            options[index].classList.add('wrong');
            options[q.answer].classList.add('correct');

            if (this._campaignMode) {
                this._campaignMode.mistakes++;
                setTimeout(() => this._showNextQuestion(), 1200);
            } else {
                // 无尽模式：答错即结束
                if (this._score > (UnlockManager._data.endlessBest || 0)) {
                    UnlockManager._data.endlessBest = this._score;
                    UnlockManager.saveProgress();
                }
                setTimeout(() => this._showGameOver(), 1200);
            }
        }
    },

    _showCampaignResult(success) {
        const overlay = document.getElementById('quiz-overlay');
        if (!overlay) return;

        const mode = this._campaignMode;
        if (!mode) return;

        const campaign = CampaignManager.campaigns.find(c => c.name === mode.name);

        if (success) {
            this._completeCampaign();
        }

        overlay.innerHTML = `
            <div class="quiz-panel">
                <div class="quiz-stage-result active">
                    <div class="quiz-result-icon">${success ? '🎉' : '😔'}</div>
                    <div class="quiz-result-title">${success ? '战役胜利！' : '战役失败'}</div>
                    <div class="quiz-result-desc">
                        ${success
                            ? `${mode.name}通关！失误${mode.mistakes}次<br>奖励：${campaign ? campaign.rewardDesc : '无'}`
                            : `失误${mode.mistakes}次，超过上限${mode.maxMistakes}次`}
                    </div>
                    <div class="quiz-result-actions">
                        ${!success ? `<button class="quiz-start-btn" onclick="CampaignManager.startCampaign('${mode.name}')">再次挑战</button>` : ''}
                        <button class="quiz-quit-btn" onclick="EndlessManager.close()" style="padding:10px 24px;font-size:14px;">返回</button>
                    </div>
                </div>
            </div>
        `;

        if (window.AchievementManager) AchievementManager.checkAchievements();
    },

    _completeCampaign() {
        const mode = this._campaignMode;
        if (!mode) return;

        const campaign = CampaignManager.campaigns.find(c => c.name === mode.name);
        if (!campaign) return;

        // 更新战役完成状态
        if (!UnlockManager._data.campaigns[mode.name]) {
            UnlockManager._data.campaigns[mode.name] = {};
        }
        UnlockManager._data.campaigns[mode.name].completed = true;
        UnlockManager._data.campaigns[mode.name].bestMistakes = Math.min(
            mode.mistakes,
            UnlockManager._data.campaigns[mode.name].bestMistakes !== undefined
                ? UnlockManager._data.campaigns[mode.name].bestMistakes
                : Infinity
        );

        // 发放奖励
        if (campaign.reward) {
            Object.entries(campaign.reward).forEach(([item, count]) => {
                UnlockManager.addItem(item, count);
            });
        }

        UnlockManager.saveProgress();
    },

    _showGameOver() {
        const overlay = document.getElementById('quiz-overlay');
        if (!overlay) return;

        const best = UnlockManager._data.endlessBest || 0;
        const isNew = this._score >= best;

        overlay.innerHTML = `
            <div class="quiz-panel">
                <div class="quiz-stage-result active">
                    <div class="quiz-result-icon">😔</div>
                    <div class="quiz-result-title">挑战结束</div>
                    <div class="quiz-result-desc">
                        本次得分：<strong>${this._score}</strong><br>
                        ${isNew ? '🎉 新纪录！' : `最高纪录：${best}`}
                    </div>
                    <div class="quiz-result-actions">
                        <button class="quiz-start-btn" onclick="EndlessManager.start()">再来一次</button>
                        <button class="quiz-quit-btn" onclick="EndlessManager.close()" style="padding:10px 24px;font-size:14px;">返回</button>
                    </div>
                </div>
            </div>
        `;

        if (window.AchievementManager) AchievementManager.checkAchievements();
    },

    // 中途退出战役/无尽模式
    exit() {
        if (confirm('确定要退出当前挑战吗？进度将不会保存。')) {
            this._campaignMode = null;
            const overlay = document.getElementById('quiz-overlay');
            if (overlay) overlay.classList.remove('active');
        }
    },

    close() {
        this._campaignMode = null;
        const overlay = document.getElementById('quiz-overlay');
        if (overlay) overlay.classList.remove('active');
        const overlay2 = document.getElementById('overlay');
        if (overlay2) overlay2.classList.remove('active');
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('active');
    }
};
