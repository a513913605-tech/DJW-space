# Hyround Background Effect Package

这个包里有两种使用方式：

1. 直接预览或部署：打开 `dist/index.html`，或把整个 `dist` 目录放到静态服务器。
2. 继续开发集成：把 `source/index.html`、`source/main.js`、`source/styles.css` 里的结构、脚本和样式迁移到你家里的项目。

本效果依赖：

- Three.js
- Vite

在新电脑继续开发：

```bash
npm install
npm run dev
```

在已有网站里集成时，重点迁移：

- `canvas#scene`
- `main.js` 里的 Three.js 背景逻辑
- `styles.css` 里 `.experience`、`#scene` 和相关背景样式

当前效果：灰暖白背景、金白/虹彩镭射玻璃三角几何体、缓慢漂浮、分子线框和轻微鼠标视差。
