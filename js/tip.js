/* 打赏功能模块 */
const TipManager = {
    _overlay: null,
    _scrollY: 0,

    show() {
        // 防滚动穿透：记录滚动位置并锁定
        this._scrollY = window.scrollY;
        document.body.classList.add('tip-open');
        document.body.style.top = -this._scrollY + 'px';

        if (this._overlay) {
            this._overlay.classList.add('active');
            return;
        }

        this._overlay = document.createElement('div');
        this._overlay.className = 'tip-overlay';
        this._overlay.innerHTML = `
            <div class="tip-modal">
                <button class="tip-close" onclick="TipManager.hide()">✕</button>
                <div class="tip-seal">赏</div>
                <div class="tip-title">请作者喝杯茶</div>
                <div class="tip-subtitle">您的支持是最大的动力</div>
                <div class="tip-poem">
                    乱世英雄谁堪夸，<br>
                    群英荟萃聚天涯。<br>
                    若蒙看官赐薄赏，<br>
                    来日再续好年华。
                </div>
                <img class="tip-qr" src="assets/img/wechat-pay.jpg" alt="微信收款码">
                <div class="tip-footer">长按识别 · 随缘打赏</div>
            </div>
        `;

        // 点击遮罩关闭
        this._overlay.addEventListener('click', (e) => {
            if (e.target === this._overlay) {
                this.hide();
            }
        });

        document.body.appendChild(this._overlay);

        // 触发动画
        requestAnimationFrame(() => {
            this._overlay.classList.add('active');
        });
    },

    hide() {
        if (this._overlay) {
            this._overlay.classList.remove('active');
        }
        // 恢复滚动
        document.body.classList.remove('tip-open');
        document.body.style.top = '';
        window.scrollTo(0, this._scrollY);
    }
};
