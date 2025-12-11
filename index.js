// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 1. 設置 public 資料夾為靜態資源目錄
app.use(express.static(path.join(__dirname, 'public')));

// 2. 設置 /pdfjs 路徑，指向 node_modules/pdfjs-dist
app.use('/pdfjs', express.static(path.join(__dirname, 'node_modules', 'pdfjs-dist'))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🎉 PDF 閱讀器伺服器已啟動於 http://localhost:${port}`);
    console.log(`======================================================`);
});
