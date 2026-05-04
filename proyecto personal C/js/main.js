// ---- CURSOR ----
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  ring.style.left = e.clientX + 'px';
  ring.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .portfolio-item, .pillar, .service-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('expand'));
  el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
});
 
// ---- NAV SCROLL ----
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 60);
});
 
// ---- STAT COUNTER ----
let projects = JSON.parse(localStorage.getItem('cgpv_projects') || '[]');
 
function updateStatCounter() {
  const el = document.getElementById('statProjects');
  const target = Math.max(projects.length, 12);
  let current = 0;
  const interval = setInterval(() => {
    current += 1;
    el.textContent = current + '+';
    if (current >= target) { el.textContent = target + '+'; clearInterval(interval); }
  }, 60);
}
 
// ---- PORTFOLIO ----
const defaultProjects = [
  { name: 'Casa del Bosque', cat: 'Residencial', loc: 'Valle Verde', year: '2024', desc: 'Residencia privada integrada en entorno natural', color: '#8B7355' },
  { name: 'Centro Comercial Plaza', cat: 'Comercial', loc: 'Centro Histórico', year: '2023', desc: 'Diseño de fachada y espacios comerciales', color: '#6B8B7A' },
  { name: 'Café Minerva', cat: 'Interiores', loc: 'Ciudad', year: '2023', desc: 'Interiorismo de café boutique', color: '#8B6B6B' },
  { name: 'Unidad Educativa', cat: 'Institucional', loc: 'Zona Norte', year: '2022', desc: 'Diseño de campus educativo bioclimático', color: '#7A7B6B' },
  { name: 'Loft Urbano', cat: 'Residencial', loc: 'Centro', year: '2022', desc: 'Renovación de loft industrial', color: '#8B7B6B' },
  { name: 'Parque Lineal', cat: 'Urbanismo', loc: 'Ribera del Río', year: '2021', desc: 'Diseño de espacio público y paisajismo', color: '#6B7B6B' }
];
 
const gridSizes = [
  { col: 'span 7', minH: '480px' },
  { col: 'span 5', minH: '240px' },
  { col: 'span 5', minH: '240px' },
  { col: 'span 4', minH: '280px' },
  { col: 'span 4', minH: '280px' },
  { col: 'span 4', minH: '280px' },
];
 
function renderPortfolio(filter = 'all') {
  const grid = document.getElementById('portfolioGrid');
  const all = [...defaultProjects, ...projects];
  const filtered = filter === 'all' ? all : all.filter(p => p.cat === filter);
  
  grid.innerHTML = filtered.map((p, i) => {
    const size = gridSizes[i % gridSizes.length];
    const hasImg = p.imageUrl;
    const bg = hasImg ? `url(${p.imageUrl}) center/cover no-repeat` : `linear-gradient(160deg, ${p.color || '#A08866'}33 0%, ${p.color || '#6B5340'}55 100%)`;
    return `
      <div class="portfolio-item" style="grid-column:${size.col}; min-height:${size.minH}; background: ${bg};">
        ${!hasImg ? `<div class="portfolio-item-inner" style="background:${bg}"></div>` : ''}
        ${!hasImg ? `<div class="portfolio-placeholder-text">
          <div class="ppt-icon">📐</div>
          <div class="ppt-label">${p.name.substring(0,2).toUpperCase()}</div>
        </div>` : ''}
        <div class="portfolio-overlay">
          <div class="portfolio-cat">${p.cat} · ${p.year || ''}</div>
          <div class="portfolio-title">${p.name}</div>
          <div class="portfolio-loc">${p.loc || ''}</div>
        </div>
      </div>
    `;
  }).join('');
}
 
renderPortfolio();
updateStatCounter();
 
// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPortfolio(btn.dataset.filter);
  });
});
 
// ---- MODAL ----
const modal = document.getElementById('modalOverlay');
document.getElementById('openModalBtn').addEventListener('click', () => modal.classList.add('open'));
document.getElementById('modalClose').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('open'); });
 
// Upload zone
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewImages = document.getElementById('previewImages');
let uploadedImages = [];
 
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));
 
function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      uploadedImages.push(e.target.result);
      renderPreviews();
    };
    reader.readAsDataURL(file);
  });
}
 
function renderPreviews() {
  previewImages.innerHTML = uploadedImages.map((src, i) => `
    <div class="preview-img-wrap">
      <img src="${src}" alt="Preview ${i+1}">
      <button class="remove-img" onclick="removeImage(${i})">✕</button>
    </div>
  `).join('');
}
 
window.removeImage = (i) => {
  uploadedImages.splice(i, 1);
  renderPreviews();
};
 
// Submit project
document.getElementById('submitProject').addEventListener('click', () => {
  const name = document.getElementById('projName').value.trim();
  if (!name) { showNotification('Por favor ingresa el nombre del proyecto.'); return; }
  
  const proj = {
    name,
    cat: document.getElementById('projCat').value || 'Otro',
    year: document.getElementById('projYear').value || new Date().getFullYear(),
    loc: document.getElementById('projLoc').value,
    desc: document.getElementById('projDesc').value,
    area: document.getElementById('projArea').value,
    status: document.getElementById('projStatus').value,
    imageUrl: uploadedImages[0] || null,
  };
  
  projects.push(proj);
  localStorage.setItem('cgpv_projects', JSON.stringify(projects));
  
  renderPortfolio();
  
  // Update counter
  const el = document.getElementById('statProjects');
  const total = defaultProjects.length + projects.length;
  el.textContent = total + '+';
  
  modal.classList.remove('open');
  
  // Reset form
  document.getElementById('projName').value = '';
  document.getElementById('projCat').value = '';
  document.getElementById('projYear').value = '';
  document.getElementById('projLoc').value = '';
  document.getElementById('projDesc').value = '';
  document.getElementById('projArea').value = '';
  uploadedImages = [];
  previewImages.innerHTML = '';
  
  showNotification('✓ Proyecto "' + proj.name + '" añadido al portafolio');
});
 
// ---- NOTIFICATION ----
function showNotification(msg) {
  const notif = document.getElementById('notification');
  document.getElementById('notificationMsg').textContent = msg;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 4000);
}
window.showNotification = showNotification;
 
// ---- SCROLL ANIMATIONS ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });
 
document.querySelectorAll('.pillar, .service-card, .stat-item, .process-step, .testimonial-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});