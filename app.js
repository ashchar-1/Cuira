// Base de Datos en LocalStorage
let cuiraDB = JSON.parse(localStorage.getItem('cuira_global_db')) || [];
let miNegocioId = localStorage.getItem('cuira_logged_in_id');
let gustosUsuario = JSON.parse(localStorage.getItem('cuira_user_tastes')) || [];

let filtroActivoTipo = ""; 
let filtroActivoValor = "";

// Fotos Semilla si el almacenamiento está completamente vacío
const fotoSemillaReposteria = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f5ece4'/><text x='50%25' y='50%25' font-size='30' dominant-baseline='middle' text-anchor='middle'>🍰</text></svg>";
const fotoSemillaCacao = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ebdcd0'/><text x='50%25' y='50%25' font-size='30' dominant-baseline='middle' text-anchor='middle'>🍫</text></svg>";

if (cuiraDB.length === 0) {
    cuiraDB = [
        { id: 'seed_1', nombre: 'Dulces de Mi Pueblo', municipio: 'Acevedo', categoria: 'Gastronomía y Dulcería', bio: 'Conservas de coco y repostería artesanal tradicional.', whatsapp: '584141112233', avatar: '', fotos: [fotoSemillaReposteria] },
        { id: 'seed_2', nombre: 'Cacao Ancestral', municipio: 'Brión', categoria: 'Cacao y Chocolate', bio: 'Chocolatería fina procesada desde la semilla en nuestra finca familiar.', whatsapp: '584124445566', avatar: '', fotos: [fotoSemillaCacao] }
    ];
    localStorage.setItem('cuira_global_db', JSON.stringify(cuiraDB));
}

// === COMPORTAMIENTO DEL MENÚ HAMBURGUESA ===
function abrirMenu() {
    document.getElementById("miMenu").style.width = "280px";
    document.getElementById("overlay").style.display = "block";
}
function cerrarMenu() {
    document.getElementById("miMenu").style.width = "0";
    document.getElementById("overlay").style.display = "none";
    document.querySelectorAll('.submenu').forEach(sub => sub.style.maxHeight = "0px");
}
function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    submenu.style.maxHeight = (submenu.style.maxHeight && submenu.style.maxHeight !== "0px") ? "0px" : submenu.scrollHeight + "px";
}

// === ONBOARDING INTERESES ===
function verificarPrimerIngreso() {
    const urlParams = new URLSearchParams(window.location.search);
    const perfilId = urlParams.get('p');
    if (perfilId) { abrirPerfilPublico(perfilId); return; }

    if (!localStorage.getItem('cuira_onboarding_completed')) {
        document.getElementById('onboarding-overlay').classList.add('active-onboarding');
    } else {
        renderizarFeed();
    }
}
function toggleGusto(elemento, categoria) {
    if (gustosUsuario.includes(categoria)) {
        gustosUsuario = gustosUsuario.filter(g => g !== categoria);
        elemento.classList.remove('selected');
    } else {
        gustosUsuario.push(categoria);
        elemento.classList.add('selected');
    }
    document.getElementById('btn-onboarding-ok').classList.toggle('hidden', gustosUsuario.length === 0);
    document.getElementById('btn-onboarding-skip').style.display = gustosUsuario.length > 0 ? "none" : "block";
}
function finalizarOnboarding() {
    localStorage.setItem('cuira_user_tastes', JSON.stringify(gustosUsuario));
    localStorage.setItem('cuira_onboarding_completed', 'true');
    cerrarOnboardingModal();
}
function omitirOnboarding() {
    gustosUsuario = [];
    localStorage.setItem('cuira_user_tastes', JSON.stringify([]));
    localStorage.setItem('cuira_onboarding_completed', 'true');
    cerrarOnboardingModal();
}
function cerrarOnboardingModal() {
    document.getElementById('onboarding-overlay').classList.remove('active-onboarding');
    renderizarFeed();
}
function reiniciarGustos() {
    gustosUsuario = [];
    localStorage.removeItem('cuira_user_tastes');
    localStorage.removeItem('cuira_onboarding_completed');
    document.querySelectorAll('.taste-pill').forEach(p => p.classList.remove('selected'));
    document.getElementById('onboarding-overlay').classList.add('active-onboarding');
}

// === RENDERIZADO DEL MURO SOCIAL (TIPO RED SOCIAL) ===
function renderizarFeed() {
    const container = document.getElementById('feed-container');
    container.innerHTML = '';

    // Mostrar u ocultar el banner según las preferencias configuradas
    document.getElementById('banner-personalizado').classList.toggle('hidden', gustosUsuario.length === 0 || !!filtroActivoTipo);

    // 1. Filtrar negocios válidos
    let negociosFiltrados = cuiraDB.filter(n => {
        if (filtroActivoTipo === 'muni') return n.municipio === filtroActivoValor;
        if (filtroActivoTipo === 'cat') return n.categoria === filtroActivoValor;
        return true;
    });

    // 2. Extraer todas las fotos como publicaciones individuales (Muro Dinámico)
    let publicaciones = [];
    negociosFiltrados.forEach(negocio => {
        const fotosA_Mostrar = (negocio.fotos && negocio.fotos.length > 0) ? negocio.fotos : ['https://via.placeholder.com/500?text=Visita+Nuestro+Catálogo'];
        fotosA_Mostrar.forEach((foto, index) => {
            publicaciones.push({
                negocio: negocio,
                foto: foto,
                fotoIndex: index
            });
        });
    });

    if (publicaciones.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-light); padding:40px;">No hay publicaciones en esta sección todavía.</p>`;
        return;
    }

    // 3. Mezclar aleatoriamente el muro
    publicaciones.sort(() => Math.random() - 0.5);

    // 4. Si el usuario guardó gustos, priorizar esas categorías arriba
    if (gustosUsuario.length > 0 && !filtroActivoTipo) {
        publicaciones.sort((a, b) => {
            const aCoincide = gustosUsuario.includes(a.negocio.categoria) ? 1 : 0;
            const bCoincide = gustosUsuario.includes(b.negocio.categoria) ? 1 : 0;
            return bCoincide - aCoincide;
        });
    }

    // 5. Inyectar HTML con estructura de Post Red Social
    publicaciones.forEach((pub, i) => {
        const neg = pub.negocio;
        const postId = `post_${neg.id}_${pub.fotoIndex}_${i}`; // ID único en el dom
        const avatarImg = neg.avatar || 'https://via.placeholder.com/100?text=Shop';

        container.innerHTML += `
            <div class="social-post">
                <!-- Encabezado de la Publicación -->
                <div class="post-header">
                    <img class="post-header-avatar" src="${avatarImg}" onclick="abrirPerfilPublico('${neg.id}')" alt="Logo">
                    <div class="post-header-info">
                        <h4 class="post-biz-name" onclick="abrirPerfilPublico('${neg.id}')">${neg.nombre}</h4>
                        <p class="post-biz-meta">📍 ${neg.municipio} • 🛍️ ${neg.categoria || 'General'}</p>
                    </div>
                </div>

                <!-- Imagen del Producto -->
                <div class="post-image-wrapper" onclick="abrirPerfilPublico('${neg.id}')">
                    <img class="post-img" src="${pub.foto}" alt="Publicación">
                </div>

                <!-- Pictograma Flotante de Compartir -->
                <div class="post-actions-bar">
                    <button class="btn-share-pictogram" onclick="toggleShareDrawer('${postId}')" title="Compartir publicación">
                        📤
                    </button>
                </div>

                <!-- Cajón Desplegable Interno de Opciones de Compartir -->
                <div id="drawer_${postId}" class="share-options-drawer">
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('copiar', '${neg.id}')">🔗 Copiar Enlace</button>
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('enlace', '${neg.id}')">📲 Enviar Enlace</button>
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('ver-qr', '${neg.id}')">👁️ Ver QR</button>
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('enviar-qr', '${neg.id}')">🖼️ Compartir QR</button>
                </div>

                <!-- Pie de Post (Descripción) -->
                <div class="post-body">
                    <p class="post-caption">
                        <strong>${neg.nombre}</strong>${neg.bio}
                    </p>
                </div>
            </div>
        `;
    });
}

// === INTERRUPTOR DEL DESPLEGABLE DE COMPARTIR POR POST ===
function toggleShareDrawer(postId) {
    const drawer = document.getElementById(`drawer_${postId}`);
    
    // Si ya está abierto, lo cerramos
    if (drawer.classList.contains('open-drawer')) {
        drawer.classList.remove('open-drawer');
    } else {
        // Cerramos cualquier otro menú de compartir que esté abierto para limpieza visual
        document.querySelectorAll('.share-options-drawer').forEach(d => d.classList.remove('open-drawer'));
        // Abrimos el actual
        drawer.classList.add('open-drawer');
    }
}

// === MOTOR INTEGRADO DE ACCIONES DE COMPARTIR Y QR EN EL MURO ===
function ejecutarAccionCompartir(accion, negocioId) {
    const negocio = cuiraDB.find(n => n.id === negocioId);
    if (!negocio) return;

    // Enlace directo al perfil específico (Deep Linking)
    const urlCompartir = `${window.location.origin}${window.location.pathname}?p=${negocio.id}`;
    const titulo = `🌊 Cuira | ${negocio.nombre}`;
    const textoMensaje = `¡Mira esta publicación de *${negocio.nombre}* (${negocio.categoria}) en Cuira! 📍 Región de ${negocio.municipio}.\n\n"${negocio.bio.substring(0, 120)}..."\n\nVer catálogo completo en la red aquí:\n`;

    if (accion === 'copiar') {
        navigator.clipboard.writeText(`${textoMensaje}${urlCompartir}`).then(() => {
            alert(`¡Enlace y datos de "${negocio.nombre}" copiados para pegar donde quieras!`);
        });
    } 
    else if (accion === 'enlace') {
        if (navigator.share) {
            navigator.share({ title: titulo, text: textoMensaje, url: urlCompartir }).catch(console.error);
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensaje + urlCompartir)}`, '_blank');
        }
    } 
    else if (accion === 'ver-qr') {
        document.getElementById('qr-modal-title').innerText = `QR Oficial de ${negocio.nombre}`;
        const canvas = document.getElementById('qr-generator-canvas');
        
        new QRious({
            element: canvas,
            value: urlCompartir,
            size: 300,
            background: '#ffffff',
            foreground: '#c85a32' // Tono de la marca arcilla/terracota
        });

        // Configurar el botón interno del modal para que responda a este negocio concreto
        document.getElementById('btn-modal-compartir-qr').onclick = () => ejecutarAccionCompartir('enviar-qr', negocioId);

        document.getElementById('modal-qr').classList.add('active-modal');
    } 
    else if (accion === 'enviar-qr') {
        const canvas = document.getElementById('qr-generator-canvas');
        new QRious({ element: canvas, value: urlCompartir, size: 400, background: '#ffffff', foreground: '#c85a32' });

        canvas.toBlob((blob) => {
            const file = new File([blob], `${negocio.nombre.replace(/\s+/g, '_')}_QR.png`, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], title: `Código QR`, text: `Escanea para ingresar al muro de ${negocio.nombre}` }).catch(console.error);
            } else {
                const a = document.createElement('a');
                a.href = canvas.toDataURL("image/png");
                a.download = `${negocio.nombre}_QR.png`;
                a.click();
                alert("QR guardado en tu dispositivo. ¡Ya puedes compartirlo en tus estados o chats!");
            }
        }, "image/png");
    }
}

function cerrarModalQR() {
    document.getElementById('modal-qr').classList.remove('active-modal');
}

// === MANEJO DE NAVEGACIÓN Y FILTROS ===
function filtrarDesdeMenu(tipo, valor) {
    filtroActivoTipo = tipo; filtroActivoValor = valor;
    const titulo = document.getElementById('feed-titulo-dinamico');
    const subtitulo = document.getElementById('feed-subtitulo-dinamico');
    
    if (tipo === 'muni') { titulo.innerText = `Producción en ${valor}`; subtitulo.innerText = `Filtrado por municipio`; }
    else if (tipo === 'cat') { titulo.innerText = valor; subtitulo.innerText = `Categoría especializada`; }
    
    mostrarVista('feed'); cerrarMenu();
}

function limpiarFiltrosYHome() {
    filtroActivoTipo = ""; filtroActivoValor = "";
    window.history.replaceState({}, document.title, window.location.pathname);
    document.getElementById('feed-titulo-dinamico').innerText = "Muro de Nuestra Tierra";
    document.getElementById('feed-subtitulo-dinamico').innerText = "Publicaciones recientes de los productores locales";
    mostrarVista('feed');
}

function abrirPerfilPublico(id) {
    const negocio = cuiraDB.find(n => n.id === id);
    if (!negocio) return;
    document.getElementById('pub-avatar').src = negocio.avatar || 'https://via.placeholder.com/90';
    document.getElementById('pub-nombre').innerText = negocio.nombre;
    document.getElementById('pub-muni').innerText = "📍 " + negocio.municipio;
    document.getElementById('pub-cat').innerText = negocio.categoria || 'General';
    document.getElementById('pub-bio').innerText = negocio.bio;
    document.getElementById('pub-wa').href = `https://wa.me/${negocio.whatsapp}`;
    mostrarVista('perfil');
}

function mostrarVista(vista) {
    document.querySelectorAll('.view-section').forEach(sec => { sec.classList.remove('active'); sec.style.display = "none"; });
    const destino = document.getElementById(`vista-${vista}`);
    destino.style.display = "block";
    setTimeout(() => destino.classList.add('active'), 20);

    if (vista === 'feed') renderizarFeed();
    else if (vista === 'admin') cargarMiDashboard();
}

// === INSTAGRAM BACKEND (GESTIÓN) ===
function cargarMiDashboard() {
    const dashboard = document.getElementById('ig-dashboard');
    const fallback = document.getElementById('ig-register-fallback');
    
    if (miNegocioId) {
        const miNegocio = cuiraDB.find(n => n.id === miNegocioId);
        if (miNegocio) {
            fallback.classList.add('hidden'); dashboard.classList.remove('hidden');
            document.getElementById('ig-display-nombre').innerText = miNegocio.nombre;
            document.getElementById('ig-display-avatar').src = miNegocio.avatar || 'https://via.placeholder.com/150';
            document.getElementById('ig-display-muni').innerText = "📍 " + miNegocio.municipio;
            document.getElementById('ig-display-cat').innerText = miNegocio.categoria || "General";
            document.getElementById('ig-display-bio').innerText = miNegocio.bio;
            document.getElementById('ig-display-wa').href = `https://wa.me/${miNegocio.whatsapp}`;
            document.getElementById('stat-fotos-count').innerText = miNegocio.fotos ? miNegocio.fotos.length : 0;

            document.getElementById('in-nombre').value = miNegocio.nombre;
            document.getElementById('in-muni').value = miNegocio.municipio;
            document.getElementById('in-cat').value = miNegocio.categoria;
            document.getElementById('in-bio').value = miNegocio.bio;
            document.getElementById('in-wa').value = miNegocio.whatsapp;

            renderizarCuadranteInstagram(miNegocio.fotos || []);
        }
    } else { fallback.classList.remove('hidden'); dashboard.classList.add('hidden'); }
}

function toggleEditarPerfil() {
    const p = document.getElementById('ig-edit-form-panel');
    p.classList.toggle('hidden-panel');
}

function inicializarNuevoPerfilVacio() {
    document.getElementById('ig-register-fallback').classList.add('hidden');
    document.getElementById('ig-dashboard').classList.remove('hidden');
    document.getElementById('form-admin').reset();
    document.getElementById('ig-display-avatar').src = 'https://via.placeholder.com/150';
    document.getElementById('ig-photo-grid').innerHTML = '';
    toggleEditarPerfil();
}

async function actualizarAvatarPrevia(e) {
    const file = e.target.files[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    document.getElementById('ig-display-avatar').src = b64;
    if (miNegocioId) {
        let idx = cuiraDB.findIndex(n => n.id === miNegocioId);
        if(idx>=0) { cuiraDB[idx].avatar = b64; localStorage.setItem('cuira_global_db', JSON.stringify(cuiraDB)); }
    }
}

async function guardarNegocio(e) {
    e.preventDefault();
    let miNegocio;
    let idx = miNegocioId ? cuiraDB.findIndex(n => n.id === miNegocioId) : -1;

    if (idx >= 0) { miNegocio = cuiraDB[idx]; } 
    else { miNegocio = { id: 'biz_' + Date.now(), fotos: [], avatar: document.getElementById('ig-display-avatar').src }; }

    miNegocio.nombre = document.getElementById('in-nombre').value;
    miNegocio.municipio = document.getElementById('in-muni').value;
    miNegocio.categoria = document.getElementById('in-cat').value;
    miNegocio.bio = document.getElementById('in-bio').value;
    miNegocio.whatsapp = document.getElementById('in-wa').value.replace(/\D/g, '');

    if (idx >= 0) cuiraDB[idx] = miNegocio; else cuiraDB.push(miNegocio);
    localStorage.setItem('cuira_global_db', JSON.stringify(cuiraDB));
    miNegocioId = miNegocio.id;
    localStorage.setItem('cuira_logged_in_id', miNegocioId);
    toggleEditarPerfil(); cargarMiDashboard();
}

async function subirFotoCatalogo(e) {
    if (!miNegocioId) { alert("Guarda la info del perfil primero."); return; }
    const file = e.target.files[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    let idx = cuiraDB.findIndex(n => n.id === miNegocioId);
    if (idx >= 0) {
        if (!cuiraDB[idx].fotos) cuiraDB[idx].fotos = [];
        cuiraDB[idx].fotos.push(b64);
        localStorage.setItem('cuira_global_db', JSON.stringify(cuiraDB));
        cargarMiDashboard();
    }
}

function renderizarCuadranteInstagram(fotos) {
    const grid = document.getElementById('ig-photo-grid'); grid.innerHTML = '';
    fotos.forEach((f, i) => {
        grid.innerHTML += `<div class="ig-grid-item"><img src="${f}"><div class="post-overlay"><button class="btn-delete-post" onclick="eliminarFoto(${i})">✕</button></div></div>`;
    });
}

function eliminarFoto(indexFoto) {
    if (!confirm("¿Eliminar este post?")) return;
    let idx = cuiraDB.findIndex(n => n.id === miNegocioId);
    if (idx >= 0) { cuiraDB[idx].fotos.splice(indexFoto, 1); localStorage.setItem('cuira_global_db', JSON.stringify(cuiraDB)); cargarMiDashboard(); }
}

function fileToBase64(file) {
    return new Promise((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result); r.onerror = e => rej(e); r.readAsDataURL(file);
    });
}

function cerrarSesion() { miNegocioId = null; localStorage.removeItem('cuira_logged_in_id'); limpiarFiltrosYHome(); }

window.onload = () => { verificarPrimerIngreso(); };
