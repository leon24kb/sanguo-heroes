// 三国群英传 - 主应用入口
(function() {
    'use strict';

    // 全局函数：更新进度条
    window.updateProgressBar = function() {
        const unlocked = UnlockManager.getUnlockedCount();
        const total = heroesData.getTotalCount();
        const percent = total > 0 ? ((unlocked / total) * 100).toFixed(1) : 0;

        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');

        if (fill) fill.style.width = percent + '%';
        if (text) text.textContent = `已收集 ${unlocked}/${total}  ${percent}%`;
    };

    // 全局函数：深色模式切换
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        const btn = document.getElementById('btn-dark-mode');
        if (btn) {
            btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        }
        localStorage.setItem('sanguo_dark_mode', document.body.classList.contains('dark-mode'));
    };

    // 初始化应用
    function init() {
        // 初始化解锁管理器
        UnlockManager.init();

        // 深色模式恢复
        if (localStorage.getItem('sanguo_dark_mode') === 'true') {
            document.body.classList.add('dark-mode');
            const btn = document.getElementById('btn-dark-mode');
            if (btn) btn.textContent = '☀️';
        }

        // 渲染卡片网格（已解锁优先）
        CardManager.renderGrid();

        // 更新进度条
        updateProgressBar();

        // 设置事件监听
        setupEventListeners();

        // 渲染推荐战役
        renderCampaignRecommend();

        console.log('三国群英传初始化完成');
        console.log('武将总数:', heroesData.getTotalCount());
        console.log('已解锁:', UnlockManager.getUnlockedCount());
    }

    // 设置事件监听
    function setupEventListeners() {
        // 筛选按钮
        const filterBar = document.getElementById('filter-bar');
        if (filterBar) {
            filterBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;

                // 更新活跃状态
                filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const force = btn.dataset.filter;
                filterCards(force);
            });
        }

        // 功能按钮
        const campaignBtn = document.getElementById('btn-campaign');
        if (campaignBtn) campaignBtn.addEventListener('click', () => {
            if (window.CampaignManager) CampaignManager.show();
        });

        const achievementsBtn = document.getElementById('btn-achievements');
        if (achievementsBtn) achievementsBtn.addEventListener('click', () => {
            if (window.AchievementManager) AchievementManager.show();
        });

        const endlessBtn = document.getElementById('btn-endless');
        if (endlessBtn) endlessBtn.addEventListener('click', () => {
            if (window.EndlessManager) EndlessManager.show();
        });

        const collectionBtn = document.getElementById('btn-collection');
        if (collectionBtn) collectionBtn.addEventListener('click', () => {
            if (window.CollectionManager) CollectionManager.show();
        });

        const pinyinBtn = document.getElementById('btn-pinyin');
        if (pinyinBtn) pinyinBtn.addEventListener('click', () => {
            if (window.PinyinHelper) {
                const enabled = PinyinHelper.toggle();
                pinyinBtn.style.background = enabled ? '#4CAF50' : '';
                pinyinBtn.style.boxShadow = enabled ? '0 2px 8px rgba(76,175,80,0.4)' : '';
            }
        });

        const darkModeBtn = document.getElementById('btn-dark-mode');
        if (darkModeBtn) darkModeBtn.addEventListener('click', toggleDarkMode);

        // 解锁事件监听
        UnlockManager.on('stageComplete', () => {
            updateProgressBar();
        });
    }

    // 筛选卡片（始终已解锁优先）
    function filterCards(force) {
        let heroes = heroesData.getSortedHeroes ? heroesData.getSortedHeroes() : heroesData.heroes;
        if (force !== 'all') {
            heroes = heroes.filter(h => h.force === force);
        }
        CardManager.renderGrid(heroes);
    }

    // 渲染推荐战役
    function renderCampaignRecommend() {
        const container = document.getElementById('campaign-recommend');
        if (!container || !window.CampaignManager) {
            if (container) container.style.display = 'none';
            return;
        }

        const unlocked = UnlockManager.getUnlockedCount();
        const recommended = CampaignManager.getRecommended(unlocked);

        if (recommended.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <h3 style="font-family:var(--font-title);font-size:20px;color:var(--水墨黑);margin-bottom:16px;text-align:center;">⚔️ 推荐战役</h3>
            ${recommended.map(c => `
                <div class="campaign-recommend-card" style="padding:16px;border:1px solid var(--border-color);border-radius:12px;margin-bottom:12px;background:var(--card-bg);">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-family:var(--font-title);font-size:18px;">🏯 ${c.name}</div>
                            <div style="font-size:12px;color:var(--淡墨灰);margin-top:4px;">
                                ${'★'.repeat(c.difficulty)}${'☆'.repeat(5-c.difficulty)} · ${c.questionCount}题
                                ${c.unlocked ? '' : ` · 需收集${c.requireCollect}人`}
                            </div>
                        </div>
                        <button class="quiz-start-btn" style="font-size:14px;padding:8px 20px;"
                                ${c.unlocked ? `onclick="CampaignManager.startCampaign('${c.name}')"` : 'disabled'}>
                            ${c.unlocked ? '进入战役' : '未解锁'}
                        </button>
                    </div>
                </div>
            `).join('')}
            <div style="text-align:center;margin-top:8px;">
                <button class="quiz-quit-btn" style="font-size:13px;" onclick="CampaignManager.show()">查看全部战役 →</button>
            </div>
        `;
    }

    // 回到顶部功能
window.App = {
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// 回到顶部按钮显示/隐藏控制
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    let ticking = false;

    function updateButton() {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateButton);
            ticking = true;
        }
    }, { passive: true });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    initBackToTop();
});
})();
