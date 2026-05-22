// 三国群英传 - 三阶挑战答题系统
window.QuizManager = {
    currentHero: null,
    currentStage: 0,
    currentQuestionIndex: 0,
    stageQuestions: [],
    stageMistakes: 0,
    maxMistakes: 0,
    hintUsed: false,
    _overlay: null,
    _panel: null,

    // 阶段配置
    stageConfig: {
        1: { name: '初识英雄', icon: '📖', desc: '基础认知', maxMistakes: 0 },
        2: { name: '知兵识将', icon: '⚔️', desc: '深入了解', maxMistakes: 1 },
        3: { name: '博古通今', icon: '🏆', desc: '全面掌握', maxMistakes: 1 }
    },

    // 初始化
    init() {
        this._overlay = document.getElementById('quiz-overlay');
        if (!this._overlay) {
            this._overlay = document.createElement('div');
            this._overlay.className = 'quiz-overlay';
            this._overlay.id = 'quiz-overlay';
            document.body.appendChild(this._overlay);
        }
    },

    // 显示武将介绍+三阶进度
    showQuiz(hero, isRetry = false) {
        this.currentHero = hero;
        this._isRetry = isRetry;
        this.init();

        // 防滚动穿透
        this._scrollY = window.scrollY || 0;
        if (document.body && document.body.classList) {
            document.body.classList.add('quiz-open');
            document.body.style.top = -this._scrollY + 'px';
        }

        const forceColor = heroesData.getForceColor(hero.force);
        const stages = [1, 2, 3];
        let stagesHtml = '';
        let nextStage = 0;

        stages.forEach(n => {
            const status = UnlockManager.getStageStatus(hero.name, n);
            const config = this.stageConfig[n];
            let iconClass = '', iconText = '', statusText = '';

            if (status === 'completed') {
                iconClass = 'completed'; iconText = '✓'; statusText = '已完成';
            } else if (status === 'in_progress') {
                iconClass = 'in-progress'; iconText = '...'; statusText = '进行中';
                nextStage = n;
            } else {
                iconText = '—'; statusText = '未开始';
            }

            // 重复挑战模式：已完成的阶段也可以重新开始
            if (isRetry && status === 'completed') {
                iconClass = 'completed'; iconText = '✓'; statusText = '可重试';
            }

            // 判断下一可开始阶段
            if (status === 'locked' && !isRetry && !nextStage) {
                if (n === 1) {
                    nextStage = 1; // stage1 始终可开始
                } else if (UnlockManager.getStageStatus(hero.name, n-1) === 'completed') {
                    nextStage = n; // 前一阶段已完成才可开始
                }
            }

            stagesHtml += `
                <div class="quiz-stage">
                    <div class="quiz-stage-icon ${iconClass}">${iconText}</div>
                    <div class="quiz-stage-info">
                        <div class="quiz-stage-title">${config.icon} ${config.name}</div>
                        <div class="quiz-stage-desc">${config.desc}</div>
                    </div>
                    <div class="quiz-stage-status ${iconClass}">${statusText}</div>
                </div>
            `;
        });

        // 重复挑战模式：显示三个阶段的挑战按钮
        if (isRetry) {
            nextStage = 0; // 不自动选择下一阶段
        }

        // 如果已全部解锁（非重复模式）
        if (!isRetry && UnlockManager.isHeroUnlocked(hero.name)) {
            nextStage = 0;
        }

        let buttonsHtml = '';
        if (isRetry) {
            // 重复挑战：显示三个阶段的按钮
            buttonsHtml = stages.map(n => {
                const config = this.stageConfig[n];
                return `<button class="quiz-start-btn" style="margin:4px;padding:10px 20px;font-size:14px;" onclick="QuizManager.startStage(${n})">${config.icon} ${config.name}</button>`;
            }).join('');
        } else {
            const startBtnText = nextStage > 0
                ? `开始${this.stageConfig[nextStage].name}`
                : '已全部解锁';
            const startBtnDisabled = nextStage === 0 ? 'disabled' : '';
            buttonsHtml = `<button class="quiz-start-btn" ${startBtnDisabled} onclick="QuizManager.startStage(${nextStage})">${startBtnText}</button>`;
        }

        this._overlay.innerHTML = `
            <div class="quiz-panel" style="position:relative">
                <button class="quiz-close" onclick="QuizManager.closeQuiz()">✕</button>
                <div class="quiz-hero-intro">
                    <div class="quiz-hero-name">${hero.name}</div>
                    <div class="quiz-stages">${stagesHtml}</div>
                    ${buttonsHtml}
                </div>
            </div>
        `;

        this._overlay.classList.add('active');
    },

    // 开始某阶挑战
    startStage(stage) {
        if (!stage || stage < 1 || stage > 3) return;

        // 非重复模式下，检查前置条件
        if (!this._isRetry) {
            if (stage === 2 && UnlockManager.getStageStatus(this.currentHero.name, 1) !== 'completed') return;
            if (stage === 3 && UnlockManager.getStageStatus(this.currentHero.name, 2) !== 'completed') return;
        }

        this.currentStage = stage;
        this.currentQuestionIndex = 0;
        this.stageMistakes = 0;
        this.hintUsed = false;
        this.maxMistakes = this.stageConfig[stage].maxMistakes;

        // 从题库获取题目并洗牌
        const questions = quizBankData.getQuestions(this.currentHero.name, stage);
        if (!questions || questions.length === 0) {
            // 题库为空，不开始
            console.warn(`题库为空: ${this.currentHero.name} stage${stage}`);
            return;
        }
        this.stageQuestions = quizBankData.shuffle([...questions]);

        // 开始阶段
        UnlockManager.startStage(this.currentHero.name, stage);

        // 渲染答题界面
        this._renderGameUI();
        this.showQuestion();
    },

    // 渲染答题UI
    _renderGameUI() {
        const config = this.stageConfig[this.currentStage];
        const totalQ = this.stageQuestions.length;
        const maxM = this.maxMistakes;

        this._overlay.innerHTML = `
            <div class="quiz-panel" style="position:relative">
                <div class="quiz-info-bar">
                    <span class="quiz-info-hero">${this.currentHero.name}</span>
                    <span class="quiz-info-stage">${config.icon} ${config.name}</span>
                    <span class="quiz-info-progress" id="quiz-progress">1/${totalQ}</span>
                    <span class="quiz-info-mistakes" id="quiz-mistakes">失误：0/${maxM}</span>
                    <button class="quiz-exit-btn" onclick="QuizManager.closeQuiz()">✕ 退出</button>
                </div>
                <div class="quiz-game active">
                    <div class="quiz-question-area">
                        <div class="quiz-question-text" id="quiz-question"></div>
                        <div class="quiz-options" id="quiz-options"></div>
                    </div>
                </div>
                <div class="quiz-toolbar">
                    <div class="quiz-items">
                        🎋 提示：<span id="quiz-hint-count">${UnlockManager.getItemCount('hintScroll')}</span>
                    </div>
                    <div>
                        <button class="quiz-use-item" id="quiz-use-hint" onclick="QuizManager.useHint()">使用提示</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 显示当前题目
    showQuestion() {
        if (!this.stageQuestions || this.stageQuestions.length === 0) return;
        if (this.currentQuestionIndex >= this.stageQuestions.length) {
            this._onStageComplete();
            return;
        }

        const q = this.stageQuestions[this.currentQuestionIndex];
        const progressEl = document.getElementById('quiz-progress');
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');

        if (progressEl) progressEl.textContent = `${this.currentQuestionIndex + 1}/${this.stageQuestions.length}`;
        if (questionEl) {
            questionEl.textContent = q.question;
            // 拼音注音
            if (window.PinyinHelper && PinyinHelper.isEnabled()) {
                questionEl.innerHTML = PinyinHelper.annotateText(q.question);
            }
        }

        if (optionsEl) {
            optionsEl.innerHTML = '';
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                // 拼音注音
                if (window.PinyinHelper && PinyinHelper.isEnabled()) {
                    btn.innerHTML = PinyinHelper.annotateText(opt);
                }
                btn.addEventListener('click', () => this.handleAnswer(i));
                optionsEl.appendChild(btn);
            });
        }
    },

    // 处理答题
    handleAnswer(selectedIndex) {
        const q = this.stageQuestions[this.currentQuestionIndex];
        const options = document.querySelectorAll('.quiz-option');

        // 禁用所有选项
        options.forEach(o => o.classList.add('disabled'));

        // 标记正确/错误
        options[q.answer].classList.add('correct');

        if (selectedIndex === q.answer) {
            // 答对
            UnlockManager.recordAnswer(this.currentHero.name, this.currentStage, true);
            this._showFeedback(true);
        } else {
            // 答错
            options[selectedIndex].classList.add('wrong');
            this.stageMistakes++;
            UnlockManager.recordAnswer(this.currentHero.name, this.currentStage, false);
            this._showFeedback(false);

            // 更新失误显示
            const mistakesEl = document.getElementById('quiz-mistakes');
            if (mistakesEl) mistakesEl.textContent = `失误：${this.stageMistakes}/${this.maxMistakes}`;

            // 检查是否超过容错
            if (this.stageMistakes > this.maxMistakes) {
                setTimeout(() => this._onStageFailed(), 1000);
                return;
            }
        }

        // 下一题
        this.currentQuestionIndex++;
        setTimeout(() => this.showQuestion(), 1000);
    },

    // 使用提示
    useHint() {
        if (UnlockManager.useItem('hintScroll')) {
            const q = this.stageQuestions[this.currentQuestionIndex];
            const options = document.querySelectorAll('.quiz-option');

            // 排除一个错误选项
            const wrongOptions = [];
            options.forEach((opt, i) => {
                if (i !== q.answer && !opt.classList.contains('disabled')) {
                    wrongOptions.push(i);
                }
            });

            if (wrongOptions.length > 0) {
                const removeIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                options[removeIndex].classList.add('disabled');
                options[removeIndex].style.opacity = '0.3';
                this.hintUsed = true;
            }

            // 更新提示数量
            const countEl = document.getElementById('quiz-hint-count');
            if (countEl) countEl.textContent = UnlockManager.getItemCount('hintScroll');
        }
    },

    // 显示反馈
    _showFeedback(correct) {
        const fb = document.createElement('div');
        fb.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
        fb.textContent = correct ? '✓ 回答正确' : '✗ 回答错误';
        document.body.appendChild(fb);
        setTimeout(() => fb.remove(), 1200);
    },

    // 阶段通过
    _onStageComplete() {
        // 重复挑战模式：仅当达到完美时才更新数据
        if (!this._isRetry) {
            UnlockManager.completeStage(this.currentHero.name, this.currentStage);
        } else if (this.stageMistakes === 0) {
            // 再次挑战且0失误：更新该阶段为完美
            UnlockManager.completeStage(this.currentHero.name, this.currentStage);
        }

        const isLastStage = this.currentStage === 3;
        // 非重复模式：正常解锁流程
        const isAllUnlocked = !this._isRetry && isLastStage && UnlockManager.isHeroUnlocked(this.currentHero.name);
        // 重复模式且三阶完美：显示庆祝但不改变解锁状态
        const isRetryPerfect = this._isRetry && isLastStage && this.stageMistakes === 0;

        if (isAllUnlocked) {
            const isPerfect = UnlockManager.isPerfectUnlock(this.currentHero.name);
            CardManager.refreshCard(this.currentHero.name, true);
            this._showUnlockCelebration(isPerfect);
        } else if (isRetryPerfect) {
            // 再次挑战达到完美，显示庆祝
            CardManager.refreshCard(this.currentHero.name, true);
            this._showUnlockCelebration(true);
        } else {
            this._showStageResult(true);
            if (!this._isRetry) {
                CardManager.refreshCard(this.currentHero.name);
            }
        }

        // 检查成就
        if (window.AchievementManager) AchievementManager.checkAchievements();
    },

    // 阶段失败
    _onStageFailed() {
        this._showStageResult(false);
    },

    // 显示阶段结果
    _showStageResult(success) {
        const config = this.stageConfig[this.currentStage];
        const nextStage = this.currentStage + 1;
        const hasNext = nextStage <= 3;

        this._overlay.innerHTML = `
            <div class="quiz-panel" style="position:relative">
                <button class="quiz-close" onclick="QuizManager.closeQuiz()">✕</button>
                <div class="quiz-stage-result active">
                    <div class="quiz-result-icon">${success ? '🎉' : '😔'}</div>
                    <div class="quiz-result-title">${success ? '阶段通过！' : '挑战失败'}</div>
                    <div class="quiz-result-desc">
                        ${success
                            ? `${config.name}完成，失误${this.stageMistakes}次${this.stageMistakes === 0 ? '（完美！）' : ''}`
                            : `失误次数超过上限（${this.maxMistakes}次），请再试一次`}
                    </div>
                    <div class="quiz-result-actions">
                        ${success && hasNext && !this._isRetry
                            ? `<button class="quiz-start-btn" onclick="QuizManager.startStage(${nextStage})">进入${this.stageConfig[nextStage].name}</button>`
                            : ''}
                        ${success && this._isRetry
                            ? `<button class="quiz-start-btn" onclick="QuizManager.closeQuiz()">挑战完成</button>`
                            : ''}
                        ${!success && !this._isRetry
                            ? `<button class="quiz-start-btn" onclick="QuizManager.startStage(${this.currentStage})">重新挑战</button>`
                            : ''}
                        ${!success && this._isRetry
                            ? `<button class="quiz-quit-btn" onclick="QuizManager.closeQuiz()">返回</button>`
                            : ''}
                        ${(!this._isRetry || success)
                            ? `<button class="quiz-quit-btn" onclick="QuizManager.closeQuiz()">返回</button>`
                            : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // 显示解锁庆祝
    _showUnlockCelebration(isPerfect) {
        this._overlay.innerHTML = `
            <div class="quiz-panel" style="position:relative">
                <button class="quiz-close" onclick="QuizManager.closeQuiz()">✕</button>
                <div class="quiz-unlock-celebration active">
                    <div class="quiz-celebration-icon">${isPerfect ? '🏆' : '🎊'}</div>
                    <div class="quiz-celebration-title">${isPerfect ? '完美解锁！' : '解锁成功！'}</div>
                    <div class="quiz-celebration-desc">
                        ${this.currentHero.name}的三阶挑战全部完成！${isPerfect ? '三阶0失误，完美通关！' : ''}
                    </div>
                    <button class="quiz-start-btn" onclick="QuizManager.closeQuiz()">太好了！</button>
                </div>
            </div>
        `;
    },

    // 关闭答题
    closeQuiz() {
        if (this._overlay) {
            this._overlay.classList.remove('active');
        }
        // 恢复滚动
        if (document.body && document.body.classList) {
            document.body.classList.remove('quiz-open');
            document.body.style.top = '';
        }
        window.scrollTo(0, this._scrollY || 0);
        // 刷新当前卡片和进度条（不重建整个网格，避免滚动位置丢失）
        if (this.currentHero) {
            CardManager.refreshCard(this.currentHero.name);
        }
        if (typeof updateProgressBar === 'function') updateProgressBar();
    }
};
