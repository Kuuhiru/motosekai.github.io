// ==================== main.js - 加强诊断版 ====================

let allResources = [];

// 检查 SheetJS 是否成功加载
console.log("SheetJS 加载状态:", typeof XLSX !== 'undefined' ? "✅ 已加载" : "❌ 未加载");

async function loadExcelData() {
    const container = document.getElementById('resourceList');
    
    try {
        console.log("开始尝试加载 Excel...");
        console.log("当前路径:", window.location.href);
        
        const url = 'data/resources.xlsx';
        console.log("尝试加载文件路径:", url);
        
        const response = await fetch(url);
        console.log("Fetch 响应状态:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP 错误! 状态码: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log("文件大小:", arrayBuffer.byteLength, "bytes");
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        console.log("SheetJS 读取成功，工作表数量:", workbook.SheetNames.length);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("原始行数:", jsonData.length);
        
        allResources = parseExcelToResources(jsonData);
        console.log("✅ 最终解析资源数量:", allResources.length);
        
        return true;
        
    } catch (err) {
        console.error("❌ 详细错误信息:", err);
        container.innerHTML = `
            <p style="text-align:center; color:red; padding:40px; background:#ffebee; border-radius:8px;">
                ❌ Excel 加载失败<br><br>
                错误: ${err.message}<br><br>
                请把 F12 Console 中的错误信息发给我
            </p>`;
        return false;
    }
}

// 解析函数（保持不变）
function parseExcelToResources(data) {
    const resources = [];
    if (data.length < 2) return resources;

    const rows = data.slice(1);
    let currentResource = null;

    rows.forEach(row => {
        if (!row || row.length < 2 || !row[0]) return;

        const id = String(row[0]).trim();
        if (!currentResource || currentResource.id !== id) {
            currentResource = {
                id: id,
                title: String(row[1] || '').trim(),
                category: String(row[2] || '').trim(),
                tags: row[3] ? String(row[3]).split(',').map(t => t.trim()) : [],
                description: String(row[4] || '').trim(),
                versions: []
            };
            resources.push(currentResource);
        }

        if (row[5] && String(row[5]).trim() !== '') {
            currentResource.versions.push({
                version: String(row[5] || '').trim(),
                size: String(row[6] || '').trim(),
                externalLink: String(row[7] || '').trim(),
                md5: String(row[8] || '').trim(),
                sha256: String(row[9] || '').trim(),
                uploadDate: String(row[10] || '').trim(),
                note: String(row[11] || '').trim()
            });
        }
    });

    return resources;
}

// 其他渲染函数保持不变（太长我先省略）
function renderResourceCard(resource) { /* ... 同之前版本 */ }
function renderAllResources(resources) { /* ... 同之前版本 */ }
function populateCategoryFilter() { /* ... 同之前版本 */ }
function filterResources() { /* ... 同之前版本 */ }

// 初始化
window.onload = async () => {
    console.log("页面初始化开始...");
    const success = await loadExcelData();
    
    if (success && allResources.length > 0) {
        populateCategoryFilter();
        renderAllResources(allResources);
        
        document.getElementById('searchInput').addEventListener('input', filterResources);
        document.getElementById('categoryFilter').addEventListener('change', filterResources);
        document.getElementById('showFavorites').addEventListener('click', showFavorites);
    }
};

function showFavorites() { /* ... 同之前 */ }

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-btn')) {
        const id = e.target.dataset.id;
        const isNowFav = toggleFavorite(id);
        e.target.textContent = isNowFav ? '❤️' : '♡';
    }
});