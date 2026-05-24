// ==================== main.js - 最终修复版 ====================

let allResources = [];

// ==================== 1. 加载 Excel ====================
async function loadExcelData() {
    try {
        console.log("开始加载 Excel...");
        const response = await fetch('data/resources.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        allResources = parseExcelToResources(jsonData);
        
        console.log(`✅ 成功解析 ${allResources.length} 个资源`);
        return true;
        
    } catch (err) {
        console.error("加载失败:", err);
        return false;
    }
}

// ==================== 2. Excel 转资源对象 ====================
function parseExcelToResources(data) {
    const resources = [];
    if (data.length < 2) return resources;

    let currentResource = null;
    const rows = data.slice(1);

    rows.forEach(row => {
        if (!row || !row[0]) return;

        const id = String(row[0]).trim();

        if (!currentResource || currentResource.id !== id) {
            currentResource = {
                id: id,
                title: String(row[1] || '未命名').trim(),
                category: String(row[2] || '未分类').trim(),
                tags: row[3] ? String(row[3]).split(',').map(t => t.trim()) : [],
                description: String(row[4] || '').trim(),
                versions: []
            };
            resources.push(currentResource);
        }

        // 添加版本
        if (row[5] && String(row[5]).trim() !== '') {
            currentResource.versions.push({
                version: String(row[5] || '').trim(),
                size: String(row[6] || '').trim(),
                externalLink: String(row[7] || '#').trim(),
                md5: String(row[8] || '').trim(),
                sha256: String(row[9] || '').trim(),
                uploadDate: String(row[10] || '').trim(),
                note: String(row[11] || '').trim()
            });
        }
    });

    return resources;
}

// ==================== 3. 渲染单个卡片 ====================
function renderResourceCard(resource) {
    const isFav = isFavorite(resource.id);
    
    let html = `
        <div class="resource-card">
            <button class="favorite-btn" data-id="${resource.id}">${isFav ? '❤️' : '♡'}</button>
            <h3>${resource.title}</h3>
            <p><strong>分类：</strong>${resource.category}</p>
            ${resource.description ? `<p>${resource.description}</p>` : ''}
            
            <div class="tags">
                ${resource.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
    `;

    resource.versions.forEach(ver => {
        html += `
            <div class="version">
                <strong>${ver.version}</strong> <span style="color:#666">(${ver.size})</span><br>
                <small>上传日期：${ver.uploadDate}</small>
                
                ${ver.md5 ? `<div class="hash"><strong>MD5: </strong>${ver.md5} <button onclick="copyToClipboard('${ver.md5}')">复制</button></div>` : ''}
                ${ver.sha256 ? `<div class="hash"><strong>SHA256: </strong>${ver.sha256} <button onclick="copyToClipboard('${ver.sha256}')">复制</button></div>` : ''}
                
                <a href="${ver.externalLink}" target="_blank" class="download-btn">⬇ 下载</a>
                ${ver.note ? `<p><small>备注：${ver.note}</small></p>` : ''}
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

// ==================== 4. 渲染全部 ====================
function renderAllResources(resources) {
    const container = document.getElementById('resourceList');
    container.innerHTML = resources.length > 0 
        ? resources.map(r => renderResourceCard(r)).join('') 
        : '<p style="text-align:center;padding:50px;">没有找到资源</p>';
}

// ==================== 5. 填充分类 ====================
function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    const categories = [...new Set(allResources.map(r => r.category))];
    
    select.innerHTML = '<option value="">全部分类</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// ==================== 6. 筛选 ====================
function filterResources() {
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    const category = document.getElementById('categoryFilter').value;

    let filtered = allResources;

    if (category) {
        filtered = filtered.filter(r => r.category === category);
    }

    if (searchText) {
        filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(searchText) ||
            r.description.toLowerCase().includes(searchText) ||
            r.tags.some(tag => tag.toLowerCase().includes(searchText))
        );
    }

    renderAllResources(filtered);
}

// ==================== 初始化 ====================
window.onload = async () => {
    console.log("页面初始化开始...");
    
    const success = await loadExcelData();
    
    if (success && allResources.length > 0) {
        console.log("开始渲染页面...");
        populateCategoryFilter();
        renderAllResources(allResources);

        // 绑定事件
        document.getElementById('searchInput').addEventListener('input', filterResources);
        document.getElementById('categoryFilter').addEventListener('change', filterResources);
        document.getElementById('showFavorites').addEventListener('click', showFavorites);
    } else {
        console.log("没有资源或加载失败");
    }
};

// 显示收藏
function showFavorites() {
    const favorites = allResources.filter(r => isFavorite(r.id));
    renderAllResources(favorites);
}

// 收藏按钮
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-btn')) {
        const id = e.target.dataset.id;
        const nowFav = toggleFavorite(id);
        e.target.textContent = nowFav ? '❤️' : '♡';
    }
});
