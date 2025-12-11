// public/pdf-viewer.js

// 從全局 window 對象獲取 PDF.js 核心對象 (由 index.html 的模組載入設置)
const pdfjsLib = window.pdfjsLib; 

if (!pdfjsLib) {
    console.error("PDF.js 模組未能成功載入。請檢查 index.html 中的 <script type='module'> 標籤路徑是否為 /pdfjs/build/pdf.min.mjs，以及 Node.js 伺服器路徑配置是否正確。");
    alert("初始化錯誤：PDF 核心函式庫缺失。");
    throw new Error("PDF.js initialization failed."); 
}

// 設置 Worker 路徑 (保持不變)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs-dist/build/pdf.worker.js';

const pdfUrl = '/sample.pdf';
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5, // 縮放比例
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * 根據頁碼渲染特定頁面
 * @param {number} num 要渲染的頁碼
 */
function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function(page) {
        let viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        let renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        let renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('page_num').textContent = num;
}

/**
 * 如果前一個渲染任務仍在進行中，則將頁碼排入隊列
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// 事件處理器：上一頁
function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

// 事件處理器：下一頁
function onNextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

// 載入 PDF 文件
pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // 初始渲染第一頁
    renderPage(pageNum);
}).catch(function(error) {
    console.error('載入 PDF 失敗：', error);
    alert('無法載入 PDF 文件。請檢查 public/sample.pdf 是否存在，並確認伺服器已啟動。');
});