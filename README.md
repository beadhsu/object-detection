# Object Detection Tool

<img width="941" alt="截圖 2025-04-07 晚上11 24 32" src="https://github.com/user-attachments/assets/22a9242f-ed22-4a0c-80f0-5c9211e466ac" />


基於Vite和React的純前端物件檢測工具，使用`opencv.js`從圖片中檢測物體，繪製邊框並生成JSON結果。

## Run
https://beadhsu.github.io/object-detection/

## Tech stacks
- **框架**: React
- **工具**: Vite
- **圖片處理**: [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)
- **部署**: GitHub Pages

## 安裝與設置
 ```bash
 git clone https://github.com/beadhsu/object-detection.git
 cd object-detection

 npm install
 npm run dev
 ```

## 部署到 GitHub Pages
### 配置
1. **確認 `vite.config.js`**：
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     base: '/object-detection/' // 與儲存庫名稱一致
   });
   ```

2. **`package.json`**：
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "devDependencies": {
       "gh-pages": "^6.2.0"
     },
     "homepage": "https://beadhsu.github.io/object-detection"
   }
   ```

3. **安裝 `gh-pages`**：
   ```bash
   npm install --save-dev gh-pages
   ```

### 部署
1. **Init Git & Push**：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/beadhsu/object-detection.git
   git branch -M main
   git push -u origin main
   ```

2. Deploy
   ```bash
   npm run deploy
   ```
   - 自動執行 `npm run build` 生成 `dist`。
   - 將 `dist` 推送至 `gh-pages` 分支。
   - URL: `https://beadhsu.github.io/object-detection/`。
