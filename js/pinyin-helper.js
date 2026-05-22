// 三国群英传 - 拼音注音助手
window.PinyinHelper = {
    _loaded: false,
    _pinyinPro: null,
    _enabled: false, // 拼音开关，默认关闭

    // 切换拼音开关
    toggle() {
        this._enabled = !this._enabled;
        return this._enabled;
    },

    // 获取当前开关状态
    isEnabled() {
        return this._enabled;
    },

    // 动态加载 pinyin-pro 库
    async load() {
        if (this._loaded) return true;
        try {
            if (!window.pinyinPro) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.18.2/dist/index.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            this._pinyinPro = window.pinyinPro;
            this._loaded = true;
            console.log('拼音库加载成功');
            return true;
        } catch(e) {
            console.warn('拼音库加载失败，将跳过拼音注音', e);
            return false;
        }
    },

    // 判断是否为中文字符
    isChinese(char) {
        return /[\u4e00-\u9fff]/.test(char);
    },

    // 为文本添加拼音注音（仅在开关开启时生效）
    annotateText(text) {
        if (!this._enabled) return text;
        if (!this._loaded || !this._pinyinPro) return text;

        let result = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (this.isChinese(char)) {
                try {
                    const py = this._pinyinPro.pinyin(char, { toneType: 'symbol' });
                    result += `<ruby>${char}<rt>${py}</rt></ruby>`;
                } catch(e) {
                    result += char;
                }
            } else {
                result += char;
            }
        }
        return result;
    },

    // 为元素添加拼音
    async annotateElement(element) {
        if (!this._enabled) return;
        const loaded = await this.load();
        if (loaded && element) {
            element.innerHTML = this.annotateText(element.textContent);
        }
    }
};

// 页面加载后自动加载拼音库
document.addEventListener('DOMContentLoaded', () => {
    PinyinHelper.load();
});
