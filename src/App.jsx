import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [detectionData, setDetectionData] = useState(null);
  const [isCvLoaded, setIsCvLoaded] = useState(false);
  const canvasRef = useRef(null);

  window.onOpenCvReady = () => {
    console.log("OpenCV.js is ready");
    setIsCvLoaded(true);
  };

  const handleImageUpload = (e) => {
    if (!isCvLoaded) {
      alert("OpenCV.js還沒載入");
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      processImage(file);
    }
  };

  const processImage = (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageWidth = img.width;
      const imageHeight = img.height;

      // opencv.js
      const src = cv.imread(canvas);
      let mask = new cv.Mat();
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();

      // 如果有透明通道 用它來創建遮罩
      // 否則用THRESH_OTSU自動計算閾值 將圖片分成前景和背景
      // 得出二值化遮罩 白色為物體，黑色為背景
      let channels = new cv.MatVector();
      cv.split(src, channels);
      const alphaChannel = channels.size() === 4 ? channels.get(3) : null;

      if (alphaChannel) {
        cv.threshold(alphaChannel, mask, 1, 255, cv.THRESH_BINARY);
      } else {
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.threshold(gray, mask, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        gray.delete();
      }

      // 尋找edge, 只檢測最外層輪廓 忽略內部輪廓, 只保留關鍵點(矩形四個角)
      cv.findContours(
        mask,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      // 處理每個edge
      let objectsInfo = [];
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const rect = cv.boundingRect(contour);
        const { x, y, width, height } = rect;

        if (width * height > 100) {
          const centerX = x + Math.floor(width / 2);
          const centerY = y + Math.floor(height / 2);

          objectsInfo.push({
            x,
            y,
            width,
            height,
            center_x: centerX,
            center_y: centerY,
          });
        }
      }

      // 按 center_x 排序
      objectsInfo.sort((a, b) => a.center_x - b.center_x);

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      objectsInfo.forEach((obj) => {
        minX = Math.min(minX, obj.x);
        minY = Math.min(minY, obj.y);
        maxX = Math.max(maxX, obj.x + obj.width);
        maxY = Math.max(maxY, obj.y + obj.height);
      });
      // 計算距離
      const distances = {
        left: minX,
        top: minY,
        right: imageWidth - maxX,
        bottom: imageHeight - maxY,
      };

      const finalObjectsInfo = [];
      objectsInfo.forEach((obj, index) => {
        const number = index + 1;

        // 邊框
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

        // 中心點
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(obj.center_x, obj.center_y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // 編號
        ctx.fillStyle = "green";
        ctx.font = "16px Arial";
        const textY = obj.y - 10 < 0 ? obj.y + 20 : obj.y - 10; // 若超出頂部，移到物體內部
        ctx.fillText(`Obj ${number}`, obj.x, textY);

        finalObjectsInfo.push({
          number,
          position: { x: obj.x, y: obj.y },
          size: { width: obj.width, height: obj.height },
          center: { x: obj.center_x, y: obj.center_y },
          corners: {
            top_left: { x: obj.x, y: obj.y },
            top_right: { x: obj.x + obj.width, y: obj.y },
            bottom_left: { x: obj.x, y: obj.y + obj.height },
            bottom_right: { x: obj.x + obj.width, y: obj.y + obj.height },
          },
        });
      });

      setDetectionData({
        image_size: { width: imageWidth, height: imageHeight },
        distances:
          objectsInfo.length > 0
            ? distances
            : { left: 0, top: 0, right: 0, bottom: 0 },
        objects: finalObjectsInfo,
      });

      // 清理記憶體 Opencv API
      src.delete();
      mask.delete();
      contours.delete();
      hierarchy.delete();
      if (alphaChannel) channels.delete();
    };
  };

  return (
    <div className="app">
      <h1>物件檢測工具</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {!isCvLoaded && <p>載入OpenCV.js中..</p>}
      {isCvLoaded && <p>OpenCV.js載入完成</p>}
      <canvas ref={canvasRef} className="canvas" />
      {detectionData && (
        <div className="json-display">
          <h2>檢測結果 (JSON)</h2>
          <pre>{JSON.stringify(detectionData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
