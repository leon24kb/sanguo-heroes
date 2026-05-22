# 三国群英传 - 水墨丹青

一款以三国人物为主题的答题解锁卡牌游戏，采用水墨丹青风格设计。

## 功能特色

- **三阶挑战系统**：每位武将设有初识、知遇、知己三阶挑战，难度递进
- **答题解锁机制**：答对题目解锁武将卡牌，收集全部武将
- **战役模式**：经典战役关卡挑战，重温三国历史
- **无尽模式**：随机题目无限挑战，考验知识储备
- **成就系统**：解锁成就获得奖励，增加游戏乐趣
- **水墨丹青风格**：青绿山水背景，传统中国风设计

## 技术栈

- 纯前端实现，无需后端服务
- 原生 JavaScript + CSS + HTML
- 响应式设计，支持手机端

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/your-username/sanguo-heroes.git
```

2. 打开项目目录
```bash
cd sanguo-heroes
```

3. 用浏览器打开 `index.html` 或启动本地服务器
```bash
npx http-server -p 8080
```

4. 访问 `http://localhost:8080`

## 项目结构

```
sanguo-heroes/
├── assets/
│   └── img/
│       ├── portraits/     # 武将立绘
│       ├── locked-hero.jpg
│       └── wechat-pay.jpg
├── css/
│   ├── theme.css          # 主题变量
│   ├── layout.css         # 页面布局
│   ├── card.css           # 卡片样式
│   ├── quiz.css           # 答题系统
│   └── ...
├── js/
│   ├── data.js            # 武将数据
│   ├── quiz-bank.js       # 题库
│   ├── app.js             # 主入口
│   └── ...
└── index.html
```

## 许可证

MIT License
