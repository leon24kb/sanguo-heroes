// 三国群英传 - 卡片组件
window.CardManager = {

    // 创建单张卡片DOM
    createCard(hero) {
        const card = document.createElement('div');
        card.className = 'hero-card';
        card.dataset.heroName = hero.name;

        const isUnlocked = UnlockManager.isHeroUnlocked(hero.name);
        const isPerfect = UnlockManager.isPerfectUnlock(hero.name);
        const stage1Status = UnlockManager.getStageStatus(hero.name, 1);

        if (isUnlocked) {
            card.classList.add('unlocked');
            if (isPerfect) card.classList.add('perfect');
            this._renderUnlocked(card, hero, isPerfect);
        } else if (stage1Status === 'completed') {
            card.classList.add('in-progress');
            this._renderInProgress(card, hero);
        } else {
            card.classList.add('locked');
            this._renderLocked(card, hero);
        }

        // 点击事件
        card.addEventListener('click', () => {
            if (isUnlocked) {
                this.showDetail(hero);
            } else if (stage1Status === 'in_progress' || stage1Status === 'completed') {
                // 进行中，打开答题
                QuizManager.showQuiz(hero);
            } else {
                // 未开始，打开答题
                QuizManager.showQuiz(hero);
            }
        });

        return card;
    },

    // 渲染已解锁卡片
    _renderUnlocked(card, hero, isPerfect) {
        const forceClass = 'force-' + hero.force;
        const starsHtml = this._renderStars(hero.rarity);

        card.innerHTML = `
            <div class="card-header">
                <span class="force-tag ${forceClass}">${hero.forceName}</span>
                <div class="card-stars">${starsHtml}</div>
            </div>
            <div class="card-portrait" data-name="${hero.name}"
                 style="background-image: url('${hero.portrait}')">
                ${isPerfect ? '<div class="perfect-badge">\uD83C\uDFC6</div>' : ''}
            </div>
            <div class="card-footer">
                <div class="card-info-row">
                    <span class="card-name">${hero.name}</span>
                    ${hero.courtesyName && hero.courtesyName.trim() ? `<span class="card-courtesy">字${hero.courtesyName}</span>` : ''}
                    ${hero.position && hero.position !== '无' ? `<span class="card-position">${hero.position}</span>` : ''}
                </div>
            </div>
        `;
    },

    // 渲染进行中卡片
    _renderInProgress(card, hero) {
        const forceClass = 'force-' + hero.force;
        const starsHtml = this._renderStars(hero.rarity);

        card.innerHTML = `
            <div class="card-header">
                <span class="force-tag ${forceClass}">${hero.forceName}</span>
                <div class="card-stars">${starsHtml}</div>
            </div>
            <div class="card-portrait" data-name="${hero.name}"
                 style="background-image: url('${hero.portrait}'); opacity: 0.6;"></div>
            <div class="card-footer">
                <div class="card-info-row">
                    <span class="card-name">${hero.name}</span>
                    ${hero.courtesyName && hero.courtesyName.trim() ? `<span class="card-courtesy">字${hero.courtesyName}</span>` : ''}
                </div>
            </div>
            ${this._renderStageProgress(hero)}
        `;
    },

    // 渲染未解锁卡片
    _renderLocked(card, hero) {
        const forceClass = 'force-' + hero.force;
        const starsHtml = this._renderStars(hero.rarity);

        card.innerHTML = `
            <div class="card-header">
                <span class="force-tag ${forceClass}">${hero.forceName}</span>
                <div class="card-stars">${starsHtml}</div>
            </div>
            <div class="card-portrait" data-name="${hero.name}"></div>
            <div class="card-footer">
                <div class="card-info-row">
                    <span class="card-name">${hero.name}</span>
                    <span class="card-courtesy">待解锁</span>
                </div>
            </div>
            <div class="lock-overlay">
                <div class="lock-icon">\uD83D\uDD12</div>
                <div class="lock-text">待解锁</div>
            </div>
        `;
    },

    // 渲染星级（墨点）
    _renderStars(rarity) {
        let html = '';
        for (let i = 0; i < 5; i++) {
            html += `<div class="star ${i < rarity ? 'filled' : ''}"></div>`;
        }
        return html;
    },

    // 渲染三阶进度
    _renderStageProgress(hero) {
        const stages = [
            { num: 1, label: '初识' },
            { num: 2, label: '知兵' },
            { num: 3, label: '博古' }
        ];

        let html = '<div class="stage-progress">';
        stages.forEach(s => {
            const status = UnlockManager.getStageStatus(hero.name, s.num);
            const statusText = status === 'completed' ? '\u2713' : status === 'in_progress' ? '...' : '\u2014';
            const fillClass = status === 'completed' ? 'completed' : status === 'in_progress' ? 'in-progress' : 'locked';
            const fillWidth = status === 'completed' ? '100%' : status === 'in_progress' ? '50%' : '0%';

            html += `
                <div class="stage-row">
                    <span class="stage-label">${s.label}</span>
                    <div class="stage-bar"><div class="stage-bar-fill ${fillClass}" style="width:${fillWidth}"></div></div>
                    <span class="stage-status ${status === 'completed' ? 'completed' : ''}">${statusText}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    // 显示卡片背面详情
    showDetail(hero) {
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('modal');

        const forceColor = heroesData.getForceColor(hero.force);

        modal.innerHTML = `
            <div class="detail-modal">
                <div class="detail-header" style="background: linear-gradient(135deg, ${forceColor}22, transparent)">
                    <div class="detail-name-row">
                        <span class="detail-name">${hero.name}</span>
                        ${hero.courtesyName && hero.courtesyName.trim() ? `<span class="detail-courtesy">\u00B7 ${hero.courtesyName}</span>` : ''}
                        <span class="force-tag force-${hero.force}" style="margin-left:auto">${hero.forceName}</span>
                    </div>
                    <div class="detail-info-row">
                        <span class="detail-info-item">\uD83C\uDFDB\uFE0F ${hero.position}</span>
                        <span class="detail-info-item">\u2694\uFE0F ${hero.weapon}</span>
                        ${hero.horse !== '\u65E0' ? `<span class="detail-info-item">\uD83D\uDC0E ${hero.horse}</span>` : ''}
                    </div>
                </div>
                <div class="detail-story">
                    <div class="detail-section-title">\uD83D\uDCDC 生平事迹</div>
                    <div class="detail-story-text" id="detail-story-content">${hero.story}</div>
                </div>
                <div class="detail-ending">
                    <div class="detail-section-title">\u26B0\uFE0F 结局</div>
                    <div class="detail-ending-text" id="detail-ending-content">${hero.ending}</div>
                </div>
                ${hero.quote ? `<div class="detail-quote" id="detail-quote-content">"${hero.quote}"</div>` : ''}
                <div class="detail-footer">
                    ${UnlockManager.isPerfectUnlock(hero.name) ? '<span class="perfect-seal">\uD83C\uDFC6 完美</span>' : ''}
                    ${UnlockManager.isHeroUnlocked(hero.name) ? `<button class="detail-retry-btn" onclick="CardManager.closeDetail(); QuizManager.showQuiz(heroesData.getByName('${hero.name}'), true);">🔄 再次挑战</button>` : ''}
                    <button class="detail-close" onclick="CardManager.closeDetail()">\u2715</button>
                </div>
            </div>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');

        // 异步加载拼音注音
        this._annotateDetailPinyin();
    },

    // 为卡片详情添加拼音注音
    async _annotateDetailPinyin() {
        if (!window.PinyinHelper) return;
        const loaded = await PinyinHelper.load();
        if (!loaded) return;

        const storyEl = document.getElementById('detail-story-content');
        const endingEl = document.getElementById('detail-ending-content');
        const quoteEl = document.getElementById('detail-quote-content');

        if (storyEl) storyEl.innerHTML = PinyinHelper.annotateText(storyEl.textContent);
        if (endingEl) endingEl.innerHTML = PinyinHelper.annotateText(endingEl.textContent);
        if (quoteEl) quoteEl.innerHTML = PinyinHelper.annotateText(quoteEl.textContent);
    },

    // 关闭详情
    closeDetail() {
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('modal').classList.remove('active');
    },

    // 刷新单张卡片
    refreshCard(heroName, animate = false) {
        const card = document.querySelector(`.hero-card[data-hero-name="${heroName}"]`);
        if (card) {
            const hero = heroesData.getByName(heroName);
            if (hero) {
                const newCard = this.createCard(hero);
                if (animate) {
                    newCard.classList.add('unlock-animate');
                }
                card.replaceWith(newCard);
            }
        }
    },

    // 刷新所有卡片
    refreshAll() {
        const grid = document.getElementById('card-grid');
        if (grid) {
            grid.innerHTML = '';
            this.renderGrid();
        }
    },

    // 渲染卡片网格
    renderGrid(heroes) {
        const grid = document.getElementById('card-grid');
        if (!grid) return;

        // 默认使用排序后的列表（已解锁优先）
        if (!heroes) heroes = heroesData.getSortedHeroes ? heroesData.getSortedHeroes() : heroesData.heroes;

        grid.innerHTML = '';
        heroes.forEach(hero => {
            grid.appendChild(this.createCard(hero));
        });
    }
};

// 点击遮罩关闭详情
document.addEventListener('click', (e) => {
    if (e.target.id === 'overlay') {
        CardManager.closeDetail();
    }
});
