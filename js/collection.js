// 三国群英传 - 图鉴系统
window.CollectionManager = {
    show() {
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('modal');

        const forces = [
            { key: 'all', name: '全部', count: heroesData.getTotalCount() },
            { key: 'wei', name: '魏国', count: heroesData.getByForce('wei').length },
            { key: 'shu', name: '蜀国', count: heroesData.getByForce('shu').length },
            { key: 'wu', name: '吴国', count: heroesData.getByForce('wu').length },
            { key: 'qun', name: '群雄', count: heroesData.getByForce('qun').length }
        ];

        const unlocked = UnlockManager.getUnlockedCount();

        modal.innerHTML = `
            <div class="modal-panel" style="max-height:85vh;overflow:hidden;">
                <div style="padding:20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <h2 style="font-family:var(--font-title);font-size:28px;">📖 图鉴</h2>
                    <span style="font-size:14px;color:var(--淡墨灰);">已收集 ${unlocked}/${heroesData.getTotalCount()}</span>
                    <button onclick="CollectionManager.close()" style="width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.1);color:var(--淡墨灰);font-size:18px;cursor:pointer;">✕</button>
                </div>
                <div style="display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--border-color);flex-wrap:wrap;">
                    ${forces.map(f => `
                        <button class="filter-btn collection-tab ${f.key === 'all' ? 'active' : ''}"
                                data-force="${f.key}" onclick="CollectionManager.filter('${f.key}')">
                            ${f.name}(${f.count})
                        </button>
                    `).join('')}
                </div>
                <div id="collection-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;padding:20px;max-height:60vh;overflow-y:auto;">
                </div>
                <div style="padding:12px 20px;border-top:1px solid var(--border-color);">
                    ${['wei','shu','wu','qun'].map(f => {
                        const total = heroesData.getByForce(f).length;
                        const done = heroesData.getByForce(f).filter(h => UnlockManager.isHeroUnlocked(h.name)).length;
                        const pct = total > 0 ? Math.round(done/total*100) : 0;
                        const color = heroesData.getForceColor(f);
                        const name = heroesData.getForceName(f);
                        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px;">
                            <span style="width:30px;color:${color};font-weight:700;">${name}</span>
                            <div style="flex:1;height:6px;background:var(--progress-bg);border-radius:3px;overflow:hidden;">
                                <div style="width:${pct}%;height:100%;background:${color};border-radius:3px;"></div>
                            </div>
                            <span style="color:var(--淡墨灰);width:50px;text-align:right;">${done}/${total}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;

        overlay.classList.add('active');
        modal.classList.add('active');

        this.filter('all');
    },

    filter(force) {
        const grid = document.getElementById('collection-grid');
        if (!grid) return;

        // 更新tab状态
        document.querySelectorAll('.collection-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.force === force);
        });

        let heroes = force === 'all' ? heroesData.heroes : heroesData.getByForce(force);

        grid.innerHTML = heroes.map(h => {
            const unlocked = UnlockManager.isHeroUnlocked(h.name);
            const color = heroesData.getForceColor(h.force);
            return `<div style="text-align:center;padding:8px;border-radius:8px;border:1px solid ${unlocked ? color : 'var(--border-color)'};background:${unlocked ? 'var(--card-bg)' : 'var(--progress-bg)'};">
                <div style="font-family:var(--font-title);font-size:18px;color:${unlocked ? 'var(--水墨黑)' : 'var(--淡墨灰)'};">${unlocked ? h.name : '?'}</div>
                <div style="font-size:10px;color:var(--淡墨灰);">${unlocked ? (h.courtesyName ? '字'+h.courtesyName : '') : '待解锁'}</div>
                <div style="margin-top:4px;">${'★'.repeat(h.rarity)}${'☆'.repeat(5-h.rarity)}</div>
            </div>`;
        }).join('');
    },

    close() {
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('modal').classList.remove('active');
    }
};
