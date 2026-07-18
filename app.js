// 1. IMPORTACIONES OFICIALES DE FIREBASE (Versión Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// 2. CONFIGURACIÓN E INICIALIZACIÓN DE TU APP
const firebaseConfig = {
    apiKey: "AIzaSyAUl3FvdFUHebFM5tTxf9EX1sjfoi01gIE",
    authDomain: "cuira-7974a.firebaseapp.com",
    projectId: "cuira-7974a",
    storageBucket: "cuira-7974a.firebasestorage.app",
    messagingSenderId: "839137954556",
    appId: "1:839137954556:web:63d6d5f00e1c9515e5e579",
    measurementId: "G-K8WE682Z0Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables de estado local de la app
let cuiraDB = []; 
let usuarioLogueadoUid = null;
let gustosUsuario = JSON.parse(localStorage.getItem('cuira_user_tastes')) || [];
let filtroActivoTipo = ""; 
let filtroActivoValor = "";

// === BANCO DE PUBLICACIONES DE RELLENO / EJEMPLO ===
const publicacionesDemoRelleno = [
    {
        id: 'demo_acevedo_cacao',
        nombre: 'Cacao Ancestral El Clavo',
        municipio: 'Acevedo',
        categoria: 'Cacao y Chocolate',
        bio: ' 🍫 Bombones finos y barras de chocolate artesanal 100% orgánico cosechado en nuestras tierras de Acevedo. ¡Llevamos el aroma de Barlovento del grano a tu paladar!',
        whatsapp: '584120000000',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23c85a32"/><text x="50%" y="55%" font-size="40" dominant-baseline="middle" text-anchor="middle">🍫</text></svg>',
        fotos: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 100 100"><rect width="100" height="100" fill="%234e342e"/><text x="50%" y="45%" font-size="8" font-weight="bold" fill="%23d7ccc8" text-anchor="middle">CHOCOLATE PREMIUM</text><text x="50%" y="60%" font-size="5" fill="%23b0bec5" text-anchor="middle">Origen: Acevedo, Miranda</text></svg>']
    },
    {
        id: 'demo_brion_dulces',
        nombre: 'Dulcería Tradicional Sabores de Higuerote',
        municipio: 'Brión',
        categoria: 'Gastronomía y Dulcería',
        bio: ' 🍰 Las mejores conservas de coco, majarete barloventeño, cafungas y dulces abrillantados hechos con las recetas secretas de las abuelas costeñas. ¡Pídelos para tus fiestas!',
        whatsapp: '584140000000',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%231e4620"/><text x="50%" y="55%" font-size="40" dominant-baseline="middle" text-anchor="middle">🍰</text></svg>',
        fotos: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23fbe9e7"/><text x="50%" y="45%" font-size="8" font-weight="bold" fill="%23d84315" text-anchor="middle">CONSERVAS Y MAJARETE</text><text x="50%" y="60%" font-size="5" fill="%23ff8a65" text-anchor="middle">Encargos activos para la Costa</text></svg>']
    },
    {
        id: 'demo_paez_turismo',
        nombre: 'Posada Turística Canales del Río',
        municipio: 'Páez',
        categoria: 'Posadas y Turismo',
        bio: ' 🌴 Escápate al paraíso en Río Chico. Habitaciones confortables, piscina, restaurant con la mejor pesca del día y paseos guiados en lancha por nuestros hermosos canales.',
        whatsapp: '584160000000',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230288d1"/><text x="50%" y="55%" font-size="40" dominant-baseline="middle" text-anchor="middle">🌴</text></svg>',
        fotos: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e0f7fa"/><text x="50%" y="45%" font-size="8" font-weight="bold" fill="%23006064" text-anchor="middle">TU DESCANSO EN RÍO CHICO</text><text x="50%" y="60%" font-size="5" fill="%2300838f" text-anchor="middle">¡Reserva este fin de semana!</text></svg>']
    },
    {
        id: 'demo_bello_artesania',
        nombre: 'Taller Cultural San José',
        municipio: 'Andrés Bello',
        categoria: 'Artesanía y Cultura',
        bio: ' 🏺 Tallados artísticos en madera, máscaras tradicionales de los Diablos Danzantes e instrumentos folclóricos fabricados a mano por artesanos locales con maderas nobles.',
        whatsapp: '584240000000',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ef6c00"/><text x="50%" y="55%" font-size="40" dominant-baseline="middle" text-anchor="middle">🏺</text></svg>',
        fotos: ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23efebe9"/><text x="50%" y="45%" font-size="8" font-weight="bold" fill="%234e342e" text-anchor="middle">ARTESANÍA IDENTITARIA</text><text x="50%" y="60%" font-size="5" fill="%238d6e63" text-anchor="middle">Piezas únicas de colección</text></svg>']
    }
];

// === CONTROL DE SESIÓN AUTOMÁTICA ===
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioLogueadoUid = user.uid;
        if(document.getElementById('vista-admin').classList.contains('active')) {
            cargarMiDashboard();
        }
    } else {
        usuarioLogueadoUid = null;
        cargarMiDashboard();
    }
});

// === AUTENTICACIÓN SEGURA ===
async function registrarCuentaFirebase() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if(!email || !password) return alert("Por favor completa los campos.");

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "negocios", user.uid), {
            id: user.uid,
            nombre: "Mi Nuevo Emprendimiento",
            municipio: "Acevedo",
            categoria: "Gastronomía y Dulcería",
            bio: "Edita tu perfil para añadir tu descripción.",
            whatsapp: "",
            avatar: "",
            fotos: []
        });

        alert("¡Cuenta creada con éxito! Ahora configura tu perfil.");
        toggleEditarPerfil();
    } catch (error) {
        alert("Error al registrar: " + error.message);
    }
}

async function iniciarSesionFirebase() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if(!email || !password) return alert("Ingresa tu correo y contraseña.");

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("¡Sesión iniciada correctamente!");
    } catch (error) {
        alert("Acceso denegado: Datos incorrectos.");
    }
}

async function cerrarSesion() {
    try {
        await signOut(auth);
        limpiarFiltrosYHome();
    } catch (error) {
        console.error("Error al cerrar sesión", error);
    }
}

// === DESCARGAR DATOS O APLICAR RELLENO ===
async function descargarBaseDeDatosFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "negocios"));
        let deLaNube = [];
        querySnapshot.forEach((doc) => {
            deLaNube.push(doc.data());
        });

        // SI NO HAY REGISTROS EN FIREBASE, LE METEMOS LOS POSTS DE RELLENO AUTOMÁTICAMENTE
        if (deLaNube.length === 0) {
            cuiraDB = [...publicacionesDemoRelleno];
        } else {
            // Si hay datos en la nube, combinamos o dejamos solo los de la nube
            cuiraDB = [...deLaNube];
        }
    } catch (e) {
        console.error("Error conectando a Firebase, usando modo offline de relleno: ", e);
        cuiraDB = [...publicacionesDemoRelleno];
    }
}

// === RENDERIZADO DEL MURO SOCIAL ===
async function renderizarFeed() {
    const container = document.getElementById('feed-container');
    container.innerHTML = '<p style="text-align:center; color:var(--text-light);">Sincronizando el Muro...</p>';
    
    await descargarBaseDeDatosFirestore();

    container.innerHTML = '';
    document.getElementById('banner-personalizado').classList.toggle('hidden', gustosUsuario.length === 0 || !!filtroActivoTipo);

    let negociosFiltrados = cuiraDB.filter(n => {
        if (filtroActivoTipo === 'muni') return n.municipio === filtroActivoValor;
        if (filtroActivoTipo === 'cat') return n.categoria === filtroActivoValor;
        return true;
    });

    let publicaciones = [];
    negociosFiltrados.forEach(negocio => {
        const fotosA_Mostrar = (negocio.fotos && negocio.fotos.length > 0) ? negocio.fotos : [];
        fotosA_Mostrar.forEach((foto, index) => {
            publicaciones.push({ negocio: negocio, foto: foto, fotoIndex: index });
        });
    });

    if (publicaciones.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-light); padding:40px;">No hay publicaciones en esta sección todavía.</p>`;
        return;
    }

    // Mezclar para que se vea dinámico como Instagram
    publicaciones.sort(() => Math.random() - 0.5);

    if (gustosUsuario.length > 0 && !filtroActivoTipo) {
        publicaciones.sort((a, b) => {
            const aCoincide = gustosUsuario.includes(a.negocio.categoria) ? 1 : 0;
            const bCoincide = gustosUsuario.includes(b.negocio.categoria) ? 1 : 0;
            return bCoincide - aCoincide;
        });
    }

    publicaciones.forEach((pub, i) => {
        const neg = pub.negocio;
        const postId = `post_${neg.id}_${pub.fotoIndex}_${i}`;
        const avatarImg = neg.avatar || 'https://via.placeholder.com/100?text=Shop';

        container.innerHTML += `
            <div class="social-post">
                <div class="post-header">
                    <img class="post-header-avatar" src="${avatarImg}" onclick="abrirPerfilPublico('${neg.id}')" alt="Logo">
                    <div class="post-header-info">
                        <h4 class="post-biz-name" onclick="abrirPerfilPublico('${neg.id}')">${neg.nombre}</h4>
                        <p class="post-biz-meta">📍 ${neg.municipio} • 🛍️ ${neg.categoria || 'General'}</p>
                    </div>
                </div>
                <div class="post-image-wrapper" onclick="abrirPerfilPublico('${neg.id}')">
                    <img class="post-img" src="${pub.foto}" alt="Publicación">
                </div>
                <div class="post-actions-bar">
                    <button class="btn-share-pictogram" onclick="toggleShareDrawer('${postId}')">📤</button>
                </div>
                <div id="drawer_${postId}" class="share-options-drawer">
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('copiar', '${neg.id}')">🔗 Enlace</button>
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('enlace', '${neg.id}')">📲 Enviar</button>
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('ver-qr', '${neg.id}')">👁️ Ver QR</button>
                    <button class="drawer-btn" onclick="ejecutarAccionCompartir('enviar-qr', '${neg.id}')">🖼️ Compartir QR</button>
                </div>
                <div class="post-body">
                    <p class="post-caption"><strong>${neg.nombre}</strong>${neg.bio}</p>
                </div>
            </div>
        `;
    });
}

// === GESTIÓN DEL PANEL DEL EMPRENDEDOR (DASHBOARD) ===
async function cargarMiDashboard() {
    const dashboard = document.getElementById('ig-dashboard');
    const fallback = document.getElementById('ig-register-fallback');
    
    if (usuarioLogueadoUid) {
        fallback.classList.add('hidden');
        dashboard.classList.remove('hidden');

        const docRef = doc(db, "negocios", usuarioLogueadoUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const miNegocio = docSnap.data();
            
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
    } else {
        fallback.classList.remove('hidden');
        dashboard.classList.add('hidden');
    }
}

async function guardarNegocio(e) {
    e.preventDefault();
    if (!usuarioLogueadoUid) return;

    const negocioRef = doc(db, "negocios", usuarioLogueadoUid);
    
    const datosActualizados = {
        nombre: document.getElementById('in-nombre').value,
        municipio: document.getElementById('in-muni').value,
        categoria: document.getElementById('in-cat').value,
        bio: document.getElementById('in-bio').value,
        whatsapp: document.getElementById('in-wa').value.replace(/\D/g, '')
    };

    try {
        await updateDoc(negocioRef, datosActualizados);
        alert("¡Datos del negocio actualizados!");
        document.getElementById('ig-edit-form-panel').classList.add('hidden-panel');
        cargarMiDashboard();
    } catch (error) {
        alert("Error al guardar: " + error.message);
    }
}

async function subirFotoCatalogo(e) {
    if (!usuarioLogueadoUid) return;
    const file = e.target.files[0]; if (!file) return;

    const b64 = await fileToBase64(file);
    const negocioRef = doc(db, "negocios", usuarioLogueadoUid);

    try {
        await updateDoc(negocioRef, { fotos: arrayUnion(b64) });
        cargarMiDashboard();
    } catch (error) {
        console.error("Error al subir foto:", error);
    }
}

async function eliminarFoto(indexFoto) {
    if (!confirm("¿Eliminar este post definitivamente?")) return;
    if (!usuarioLogueadoUid) return;

    const negocioRef = doc(db, "negocios", usuarioLogueadoUid);
    try {
        const docSnap = await getDoc(negocioRef);
        if (docSnap.exists()) {
            const fotosActuales = docSnap.data().fotos || [];
            const fotoAEliminar = fotosActuales[indexFoto];
            await updateDoc(negocioRef, { fotos: arrayRemove(fotoAEliminar) });
            cargarMiDashboard();
        }
    } catch (error) {
        alert("No se pudo eliminar.");
    }
}

// === INTERFAZ GENERAL Y COMPARTIR ===
function toggleShareDrawer(postId) {
    const drawer = document.getElementById(`drawer_${postId}`);
    if (drawer.classList.contains('open-drawer')) {
        drawer.classList.remove('open-drawer');
    } else {
        document.querySelectorAll('.share-options-drawer').forEach(d => d.classList.remove('open-drawer'));
        drawer.classList.add('open-drawer');
    }
}

function ejecutarAccionCompartir(accion, negocioId) {
    const negocio = cuiraDB.find(n => n.id === negocioId);
    if (!negocio) return;

    const urlCompartir = `${window.location.origin}${window.location.pathname}?p=${negocio.id}`;
    const textoMensaje = `¡Mira el post de *${negocio.nombre}* en Cuira! Red local de ${negocio.municipio}.\n\n`;

    if (accion === 'copiar') {
        navigator.clipboard.writeText(`${textoMensaje}${urlCompartir}`).then(() => alert("¡Copiado con éxito!"));
    } else if (accion === 'enlace') {
        if (navigator.share) {
            navigator.share({ title: negocio.nombre, text: textoMensaje, url: urlCompartir }).catch(console.error);
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensaje + urlCompartir)}`, '_blank');
        }
    } else if (accion === 'ver-qr') {
        document.getElementById('qr-modal-title').innerText = `QR de ${negocio.nombre}`;
        new QRious({ element: document.getElementById('qr-generator-canvas'), value: urlCompartir, size: 300, background: '#ffffff', foreground: '#c85a32' });
        document.getElementById('btn-modal-compartir-qr').onclick = () => ejecutarAccionCompartir('enviar-qr', negocioId);
        document.getElementById('modal-qr').classList.add('active-modal');
    } else if (accion === 'enviar-qr') {
        const canvas = document.getElementById('qr-generator-canvas');
        canvas.toBlob((blob) => {
            const file = new File([blob], `QR_${negocio.nombre}.png`, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], title: `QR` }).catch(console.error);
            } else {
                const a = document.createElement('a'); a.href = canvas.toDataURL(); a.download = `QR_${negocio.nombre}.png`; a.click();
            }
        });
    }
}

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
function finalizarOnboarding() { localStorage.setItem('cuira_user_tastes', JSON.stringify(gustosUsuario)); localStorage.setItem('cuira_onboarding_completed', 'true'); cerrarOnboardingModal(); }
// Al omitir rellenamos vacío pero dejamos correr el feed
function omitirOnboarding() { gustosUsuario = []; localStorage.setItem('cuira_user_tastes', JSON.stringify([])); localStorage.setItem('cuira_onboarding_completed', 'true'); cerrarOnboardingModal(); }
function cerrarOnboardingModal() { document.getElementById('onboarding-overlay').classList.remove('active-onboarding'); renderizarFeed(); }
function reiniciarGustos() { gustosUsuario = []; localStorage.removeItem('cuira_user_tastes'); localStorage.removeItem('cuira_onboarding_completed'); document.querySelectorAll('.taste-pill').forEach(p => p.classList.remove('selected')); document.getElementById('onboarding-overlay').classList.add('active-onboarding'); }

function abrirMenu() { document.getElementById("miMenu").style.width = "280px"; document.getElementById("overlay").style.display = "block"; }
function cerrarMenu() { document.getElementById("miMenu").style.width = "0"; document.getElementById("overlay").style.display = "none"; document.querySelectorAll('.submenu').forEach(sub => sub.style.maxHeight = "0px"); }
function toggleSubmenu(id) { const s = document.getElementById(id); s.style.maxHeight = (s.style.maxHeight && s.style.maxHeight !== "0px") ? "0px" : s.scrollHeight + "px"; }
function filtrarDesdeMenu(tipo, valor) { filtroActivoTipo = tipo; filtroActivoValor = valor; const t = document.getElementById('feed-titulo-dinamico'); const s = document.getElementById('feed-subtitulo-dinamico'); if (tipo === 'muni') { t.innerText = `Producción en ${valor}`; s.innerText = `Por municipio`; } else if (tipo === 'cat') { t.innerText = valor; s.innerText = `Categoría especializada`; } mostrarVista('feed'); cerrarMenu(); }
function limpiarFiltrosYHome() { filtroActivoTipo = ""; filtroActivoValor = ""; window.history.replaceState({}, document.title, window.location.pathname); document.getElementById('feed-titulo-dinamico').innerText = "Muro de Nuestra Tierra"; document.getElementById('feed-subtitulo-dinamico').innerText = "Publicaciones recientes de los productores locales"; mostrarVista('feed'); }

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

function toggleEditarPerfil() { document.getElementById('ig-edit-form-panel').classList.toggle('hidden-panel'); }
function renderizarCuadranteInstagram(fotos) { const g = document.getElementById('ig-photo-grid'); g.innerHTML = ''; fotos.forEach((f, i) => { g.innerHTML += `<div class="ig-grid-item"><img src="${f}"><div class="post-overlay"><button class="btn-delete-post" onclick="eliminarFoto(${i})">✕</button></div></div>`; }); }
function cerrarModalQR() { document.getElementById('modal-qr').classList.remove('active-modal'); }
async function actualizarAvatarPrevia(e) { const file = e.target.files[0]; if (!file) return; const b64 = await fileToBase64(file); document.getElementById('ig-display-avatar').src = b64; if (usuarioLogueadoUid) { await updateDoc(doc(db, "negocios", usuarioLogueadoUid), { avatar: b64 }); } }
function fileToBase64(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = e => rej(e); r.readAsDataURL(file); }); }


window.abrirMenu = abrirMenu;
window.cerrarMenu = cerrarMenu;
window.toggleSubmenu = toggleSubmenu;
window.filtrarDesdeMenu = filtrarDesdeMenu;
window.limpiarFiltrosYHome = limpiarFiltrosYHome;
window.toggleGusto = toggleGusto;
window.finalizarOnboarding = finalizarOnboarding;
window.omitirOnboarding = omitirOnboarding;
window.reiniciarGustos = reiniciarGustos;
window.toggleShareDrawer = toggleShareDrawer;
window.ejecutarAccionCompartir = ejecutarAccionCompartir;
window.cerrarModalQR = cerrarModalQR;
window.abrirPerfilPublico = abrirPerfilPublico;
window.mostrarVista = mostrarVista;
window.toggleEditarPerfil = toggleEditarPerfil;
window.actualizarAvatarPrevia = actualizarAvatarPrevia;
window.guardarNegocio = guardarNegocio;
window.subirFotoCatalogo = subirFotoCatalogo;
window.eliminarFoto = eliminarFoto;
window.iniciarSesionFirebase = iniciarSesionFirebase;
window.registrarCuentaFirebase = registrarCuentaFirebase;
window.cerrarSesion = cerrarSesion;

// Ejecución inicial segura
window.addEventListener('DOMContentLoaded', () => {
    verificarPrimerIngreso();
});
