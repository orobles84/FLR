import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, setDoc, getDoc, serverTimestamp, updateDoc, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const getJsPDF = () => (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
const getChart = () => window.Chart;


const firebaseConfig = {
    apiKey: "AIzaSyCm6676ihFlDMoKsBxzZtk9oHOC8yBsI88",
    authDomain: "flr-db.firebaseapp.com",
    projectId: "flr-db",
    storageBucket: "flr-db.firebasestorage.app",
    messagingSenderId: "778387910304",
    appId: "1:778387910304:web:cff24e43422477f9bee3c5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentAuthUid = null;
let currentAuthEmail = null;
let muestraActualEnModal = null;
let catacionActualEnModal = null;
let tostadoActualEnModal = null;
let ventaActualEditando = null;
let inventarioActualEditando = null;
let isManualLogin = false;
let modoInvitado = false;
let invitadoId = null;
let filtroVentasActual = 'todas';
let filtroCatacionesActual = 'todas';
let todasLasVentas = [];
let todasLasCataciones = [];
let chartTostadoInstance = null;
let carritoVenta = [];
let chartVentasMesesInstance = null;
let chartTopProductosInstance = null;
let chartCatacionCirculoInstance = null;
let metaMensualActual = parseFloat(localStorage.getItem('flr_meta_mensual')) || 10000;
let todosLosClientes = [];
let clienteActualHistorial = null;
let filtroTipoClienteActual = 'todos';
let busquedaClienteTerm = '';
let todosLosPedidos = [];
let filtroPedidosActual = 'pendientes';
let busquedaPedidoTerm = '';
let pedidoActualEnModal = null;
let pedidoActualEditando = null;
let carritoPedido = [];

const FLETES = { "usa-golfo":90, "usa-este":110, "canada":105, "europa":120, "japon":160, "corea":155, "australia":200, "china":170 };

const PRECIOS_DEFAULT = {
    "Tostado": { nombre: "Café Tostado (Entero/Molido)", unidad: "libra", precio: 80 },
    "Oro": { nombre: "Café Verde (Oro)", unidad: "libra", precio: 25 },
    "Pergamino": { nombre: "Café Pergamino", unidad: "libra", precio: 12 },
    "Miel-Botella": { nombre: "Miel de Abeja Botella 750ml", unidad: "botella", precio: 75 },
    "Miel-Galon": { nombre: "Miel de Abeja Galón", unidad: "galón", precio: 375 },
    "Licor-Botella": { nombre: "Licor de Guayaba Botella 750ml", unidad: "botella", precio: 75 },
    "Licor-Litro": { nombre: "Licor de Guayaba Litro", unidad: "litro", precio: 85 },
    "Licor-Galon": { nombre: "Licor de Guayaba Galón", unidad: "galón", precio: 300 }
};

let preciosListaActual = { ...PRECIOS_DEFAULT };

const SCA_CATEGORIAS = [
    { k:'fragancia', n:'1. Fragancia / Aroma', d:'Evaluación del café seco y húmedo', min:6, def:7.5 },
    { k:'sabor', n:'2. Sabor (Flavor)', d:'Impresión gustativa principal', min:6, def:7.5 },
    { k:'retrgusto', n:'3. Retrogusto', d:'Duración del sabor residual', min:6, def:7.5 },
    { k:'acidez', n:'4. Acidez', d:'Intensidad y calidad de la acidez', min:6, def:7.5 },
    { k:'cuerpo', n:'5. Cuerpo', d:'Sensación táctil en boca', min:6, def:7.5 },
    { k:'uniformidad', n:'6. Uniformidad', d:'Consistencia entre tazas', min:0, def:10 },
    { k:'balance', n:'7. Balance', d:'Armonía general', min:6, def:7.5 },
    { k:'dulzura', n:'8. Dulzura', d:'Dulzor natural', min:0, def:10 },
    { k:'limpieza', n:'9. Limpieza de Taza', d:'Ausencia de defectos', min:0, def:10 },
    { k:'global', n:'10. Puntaje Global', d:'Impresión general', min:6, def:7.5 }
];

window.toggleSidebar = () => { 
    document.getElementById('sidebar').classList.toggle('open'); 
    document.getElementById('overlay').classList.toggle('show'); 
};

window.cerrarModal = (id) => { 
    const el = document.getElementById(id);
    if (el) el.style.display = 'none'; 
    if (id === 'modal-ver-tostado' && chartTostadoInstance) {
        chartTostadoInstance.destroy();
        chartTostadoInstance = null;
    }
    muestraActualEnModal = null; 
    catacionActualEnModal = null; 
    tostadoActualEnModal = null; 
};

function showError(id, msg) { 
    const el = document.getElementById(id); 
    if (el) { el.innerText = msg; el.style.display = 'block'; } 
    else { alert(msg); } 
}

// Estados de venta permitidos: SOLO 'pagado' y 'pendiente'
function derivarEstadoPagoDeMetodo(pago) {
    if (pago === 'Pendiente') return 'pendiente';
    return 'pagado';
}

function obtenerOCrearInvitadoId() {
    let id = localStorage.getItem('invitadoId');
    if (!id) {
        id = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('invitadoId', id);
    }
    return id;
}

function construirCategoriasSCA() {
    const container = document.getElementById('sca-categories-container');
    if (!container) return;
    container.innerHTML = '';
    SCA_CATEGORIAS.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'sca-category';
        div.innerHTML = `
            <div class="sca-category-header">
                <div style="flex:1;">
                    <div class="sca-category-name">${cat.n}</div>
                    <div class="sca-category-desc">${cat.d}</div>
                </div>
                <input type="number" class="sca-score-input" id="c-${cat.k}" min="${cat.min}" max="10" step="0.25" value="${cat.def}">
            </div>
            <div class="sca-bar-container"><div class="sca-bar" id="bar-${cat.k}" style="width:75%;"></div></div>
            <div class="sca-bar-labels"><span>${cat.min}</span><span>7</span><span>8</span><span>9</span><span>10</span></div>
        `;
        container.appendChild(div);
        const input = div.querySelector('input');
        if (input) input.addEventListener('input', window.calcularCatacion);
    });
    const defDiv = document.createElement('div');
    defDiv.className = 'sca-category';
    defDiv.style.borderLeftColor = 'var(--danger)';
    defDiv.innerHTML = `
        <div class="sca-category-header">
            <div style="flex:1;">
                <div class="sca-category-name" style="color:var(--danger);">⚠️ Defectos</div>
                <div class="sca-category-desc">Puntos a restar del total</div>
            </div>
            <input type="number" class="sca-score-input" id="c-defectos" min="0" max="10" step="0.25" value="0" style="border-color:var(--danger);">
        </div>
        <div class="sca-bar-container"><div class="sca-bar" id="bar-defectos" style="width:0%; background:var(--danger);"></div></div>
        <div class="sca-bar-labels"><span>0</span><span>2</span><span>5</span><span>10</span></div>
    `;
    container.appendChild(defDiv);
    const defInput = defDiv.querySelector('input');
    if (defInput) defInput.addEventListener('input', window.calcularCatacion);
}

function generarTablaTostado() {
    const tbody = document.getElementById('tbody-temp-tostado');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i <= 15; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:bold; text-align:center;">${i}</td>
            <td><input type="number" id="t-out-${i}" placeholder="°F" step="1"></td>
            <td><input type="number" id="t-in-${i}" placeholder="°F" step="1"></td>
            <td><input type="text" id="t-pot-${i}" placeholder="P"></td>
        `;
        tbody.appendChild(row);
    }
}

function construirMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;
    container.innerHTML = '';
    if (modoInvitado) {
        const item = document.createElement('div');
        item.className = 'menu-item active';
        item.onclick = () => window.showSection('catacion', item);
        item.innerHTML = '<span class="icon">☕</span> Catación SCA';
        container.appendChild(item);
        document.getElementById('menu-password-section').style.display = 'none';
        document.getElementById('sidebar-user-info').innerHTML = '👤 Modo Invitado<br><small style="opacity:0.7;">ID: ' + invitadoId.substr(0,12) + '...</small>';
        document.getElementById('logout-text').innerText = 'Salir';
        document.getElementById('guest-badge-top').style.display = 'inline-block';
    } else {
        const items = [
            { id:'dashboard', icon:'📊', label:'Dashboard' },
            { id:'pedidos', icon:'📋', label:'Pedidos' },
            { id:'ventas', icon:'💰', label:'Ventas' },
            { id:'clientes', icon:'👥', label:'Clientes' },
            { id:'inventario', icon:'📦', label:'Inventario' },
            { id:'precios', icon:'🏷️', label:'Lista de Precios' },
            { id:'costos', icon:'🧮', label:'Costos Tostado' },
            { id:'cotizador', icon:'💵', label:'Cotizador Verde' },
            { id:'tostado', icon:'🔥', label:'Control Tostado' },
            { id:'catacion', icon:'☕', label:'Catación SCA' },
            { id:'muestreo', icon:'🔬', label:'Muestreo Lab' }
        ];
        items.forEach((it, i) => {
            const div = document.createElement('div');
            div.className = 'menu-item' + (i===0?' active':'');
            div.onclick = () => window.showSection(it.id, div);
            div.innerHTML = `<span class="icon">${it.icon}</span> ${it.label}`;
            container.appendChild(div);
        });
        document.getElementById('menu-password-section').style.display = 'block';
        document.getElementById('sidebar-user-info').innerText = currentAuthEmail || 'Usuario';
        document.getElementById('logout-text').innerText = 'Cerrar Sesión';
        document.getElementById('guest-badge-top').style.display = 'none';
    }
}

function entrarAlSistema() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    construirMenu();
    if (!modoInvitado) {
        cargarPreciosLista();
        cargarDatosIniciales();
        cargarClientes();
        cargarPedidos();
        window.calcularCotizador();
        window.onVentaTipoChange();
    } else {
        cargarCataciones();
    }
    window.calcularCatacion();
    generarTablaTostado();
}

window.login = async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showError('login-error', '⚠️ Ingresa correo y contraseña.');
    const btn = document.getElementById('btn-login');
    btn.disabled = true; btn.innerText = "Ingresando...";
    document.getElementById('login-error').style.display = 'none';
    isManualLogin = true;
    modoInvitado = false;
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        currentAuthUid = cred.user.uid; currentAuthEmail = cred.user.email;
        const userDoc = await getDoc(doc(db, "usuarios", currentAuthUid));
        if (userDoc.exists() && userDoc.data().primerLogin === true) {
            alert("🔑 Es tu primer ingreso. Te enviaremos un correo para cambiar tu contraseña.");
            await sendPasswordResetEmail(auth, email);
            await updateDoc(doc(db, "usuarios", currentAuthUid), { primerLogin: false });
            await signOut(auth);
            showError('login-error', '📧 Revisa tu correo para establecer tu nueva contraseña.');
            isManualLogin = false;
            btn.disabled = false; btn.innerText = "Ingresar";
            return;
        }
        entrarAlSistema();
    } catch (e) {
        const msgs = {
            'auth/invalid-credential': '❌ Correo o contraseña incorrectos.',
            'auth/wrong-password': '❌ Contraseña incorrecta.',
            'auth/user-not-found': '❌ No existe una cuenta con este correo.',
            'auth/invalid-email': '❌ Formato de correo no válido.',
            'auth/user-disabled': '❌ Cuenta deshabilitada.',
            'auth/too-many-requests': '❌ Demasiados intentos.',
            'auth/network-request-failed': '❌ Sin conexión a internet.'
        };
        showError('login-error', msgs[e.code] || ('❌ Error: ' + e.message));
    } finally {
        btn.disabled = false; btn.innerText = "Ingresar";
        setTimeout(() => { isManualLogin = false; }, 3000);
    }
};

window.loginInvitado = () => {
    modoInvitado = true;
    invitadoId = obtenerOCrearInvitadoId();
    currentAuthUid = null; currentAuthEmail = null;
    entrarAlSistema();
};

window.cambiarContrasena = async () => {
    if (modoInvitado) { alert("Los invitados no pueden cambiar contraseña."); return; }
    if (!currentAuthEmail) return;
    if (!confirm(`Se enviará un enlace a:\n${currentAuthEmail}\n\n¿Continuar?`)) return;
    try {
        await sendPasswordResetEmail(auth, currentAuthEmail);
        alert("✅ Correo enviado.");
    } catch (e) { alert("❌ Error: " + e.message); }
};

window.logout = async () => {
    if (modoInvitado) {
        modoInvitado = false;
        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        return;
    }
    try { await signOut(auth); } catch(e){}
    location.reload();
};

onAuthStateChanged(auth, (user) => {
    if (isManualLogin || modoInvitado) return;
    if (user) {
        getDoc(doc(db, "usuarios", user.uid)).then(s => {
            if (s.exists()) {
                currentAuthUid = user.uid; currentAuthEmail = user.email;
                modoInvitado = false;
                entrarAlSistema();
            } else { signOut(auth); }
        }).catch(() => {});
    }
});

window.showSection = (id, el) => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');
    if (el) el.classList.add('active');
    if (window.innerWidth < 1024) window.toggleSidebar();

    if (id === 'dashboard') {
        setTimeout(() => {
            if (typeof window.actualizarDashboardMetas === 'function') window.actualizarDashboardMetas();
            if (typeof window.actualizarGraficasDashboard === 'function') window.actualizarGraficasDashboard();
            if (typeof window.actualizarTopProductosDashboard === 'function') window.actualizarTopProductosDashboard();
        }, 100);
    } else if (id === 'pedidos') {
        renderTablaPedidos();
        actualizarKPIsPedidos();
    } else if (id === 'ventas') {
        actualizarBannerPedidosVentas();
    } else if (id === 'clientes') {
        renderTablaClientes();
        actualizarKPIsClientes();
    }
};

async function cargarPreciosLista() {
    try {
        const snap = await getDoc(doc(db, "precios", "catalogo"));
        if (snap.exists()) preciosListaActual = snap.data().productos || { ...PRECIOS_DEFAULT };
        else preciosListaActual = { ...PRECIOS_DEFAULT };
        renderPreciosLista();
    } catch (e) {
        preciosListaActual = { ...PRECIOS_DEFAULT };
        renderPreciosLista();
    }
}

function renderPreciosLista() {
    const container = document.getElementById('precios-container');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(preciosListaActual).forEach(key => {
        const p = preciosListaActual[key];
        const row = document.createElement('div');
        row.className = 'precio-row';
        row.innerHTML = `
            <div class="producto-nombre">${p.nombre}</div>
            <input type="number" value="${p.precio}" step="0.01" data-key="${key}" data-field="precio">
            <input type="text" value="${p.unidad}" data-key="${key}" data-field="unidad">
            <button class="btn btn-small btn-danger" onclick="eliminarProductoLista('${key}')">🗑️</button>
        `;
        container.appendChild(row);
    });
}

window.guardarPreciosLista = async () => {
    document.querySelectorAll('#precios-container input').forEach(input => {
        const key = input.dataset.key;
        const field = input.dataset.field;
        if (preciosListaActual[key]) {
            if (field === 'precio') preciosListaActual[key].precio = parseFloat(input.value) || 0;
            else if (field === 'unidad') preciosListaActual[key].unidad = input.value;
        }
    });
    try {
        await setDoc(doc(db, "precios", "catalogo"), { productos: preciosListaActual, actualizado: serverTimestamp() });
        alert("✅ Lista guardada.");
    } catch (e) { alert("Error: " + e.message); }
};

window.restaurarPreciosDefault = () => {
    if (confirm("¿Restaurar precios por defecto?")) {
        preciosListaActual = JSON.parse(JSON.stringify(PRECIOS_DEFAULT));
        renderPreciosLista();
    }
};

window.eliminarProductoLista = (key) => {
    if (confirm(`¿Eliminar "${preciosListaActual[key].nombre}"?`)) {
        delete preciosListaActual[key];
        renderPreciosLista();
    }
};

window.onVentaTipoChange = async () => {
    const tipo = document.getElementById('venta-tipo').value;
    const isTostado = tipo === 'Tostado';
    document.getElementById('venta-presentacion-group').style.display = isTostado ? 'flex' : 'none';
    document.getElementById('venta-lote-group').style.display = isTostado ? 'flex' : 'none';
    if (preciosListaActual[tipo]) document.getElementById('venta-precio').value = preciosListaActual[tipo].precio;
    if (isTostado) await window.cargarLotesDisponibles();
};

window.cargarLotesDisponibles = async () => {
    const presentacion = document.getElementById('venta-presentacion').value;
    const select = document.getElementById('venta-lote');
    select.innerHTML = '<option value="">Cargando...</option>';
    try {
        const snap = await getDocs(query(collection(db, "inventario"), where("estado", "==", "Tostado"), where("presentacion", "==", presentacion)));
        select.innerHTML = '';
        const lotes = [];
        snap.forEach(d => {
            const inv = d.data();
            if (inv.cantidad > 0) lotes.push({ id: d.id, ...inv });
        });
        lotes.sort((a, b) => (a.fechaTostado || '').localeCompare(b.fechaTostado || ''));
        if (lotes.length === 0) {
            select.innerHTML = '<option value="">⚠️ No hay lotes disponibles</option>';
            return;
        }
        lotes.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.dataset.cantidad = l.cantidad;
            opt.textContent = `📅 ${l.fechaTostado || 'S/F'} | ${l.variedad || 'N/A'} | ${l.proceso || 'N/A'} | ${l.cantidad.toFixed(1)} lb`;
            select.appendChild(opt);
        });
    } catch (e) {
        select.innerHTML = '<option value="">Error cargando lotes</option>';
    }
};

window.toggleInvFields = () => {
    const est = document.getElementById('inv-estado').value;
    const isTostado = est === 'Tostado';
    const isCafe = ['Pergamino','Oro','Tostado'].includes(est);
    document.getElementById('inv-presentacion-group').style.display = isTostado ? 'flex' : 'none';
    document.getElementById('field-tostado').style.display = isTostado ? 'flex' : 'none';
    document.getElementById('inv-variedad-group').style.display = isCafe ? 'flex' : 'none';
    document.getElementById('inv-proceso-group').style.display = isCafe ? 'flex' : 'none';
};

window.guardarInventario = async () => {
    const est = document.getElementById('inv-estado').value;
    const isCafe = ['Pergamino','Oro','Tostado'].includes(est);
    const presentacion = est === 'Tostado' ? document.getElementById('inv-presentacion').value : 'N/A';
    const cantidad = parseFloat(document.getElementById('inv-cantidad').value) || 0;
    const finca = document.getElementById('inv-finca').value;
    const variedad = isCafe ? document.getElementById('inv-variedad').value : 'N/A';
    const proceso = isCafe ? document.getElementById('inv-proceso').value : 'N/A';
    const fechaTostado = est === 'Tostado' ? document.getElementById('inv-fecha-tostado').value : '';

    if (cantidad <= 0) return alert("La cantidad debe ser mayor a 0.");

    try {
        const snap = await getDocs(collection(db, "inventario"));
        let itemExistente = null;
        let docIdExistente = null;
        
        for (const d of snap.docs) {
            const inv = d.data();
            if (inv.estado === est &&
                (inv.presentacion || 'N/A') === presentacion &&
                (inv.finca || '') === finca &&
                (inv.variedad || 'N/A') === variedad &&
                (inv.proceso || 'N/A') === proceso &&
                (inv.fechaTostado || '') === fechaTostado) {
                itemExistente = inv;
                docIdExistente = d.id;
                break;
            }
        }

        if (itemExistente) {
            const nuevaCantidad = (itemExistente.cantidad || 0) + cantidad;
            await updateDoc(doc(db, "inventario", docIdExistente), { cantidad: nuevaCantidad });
            alert(`✅ Se sumaron ${cantidad} al inventario existente.\n\nCantidad anterior: ${(itemExistente.cantidad || 0).toFixed(1)}\nNueva cantidad: ${nuevaCantidad.toFixed(1)}`);
        } else {
            await addDoc(collection(db,"inventario"), {
                estado: est, presentacion, cantidad, finca, variedad, proceso, fechaTostado,
                fecha: serverTimestamp()
            });
            alert("✅ Inventario agregado.");
        }
        cargarDatosIniciales();
        document.getElementById('inv-cantidad').value = '';
    } catch (e) {
        alert("Error: " + e.message);
    }
};

// --- LÓGICA DE VENTAS MULTI-PRODUCTO (CARRITO) ---

window.agregarItemAlCarrito = async () => {
    const tipo = document.getElementById('venta-tipo').value;
    const isTostado = tipo === 'Tostado';
    const pres = isTostado ? document.getElementById('venta-presentacion').value : 'N/A';
    const cant = parseFloat(document.getElementById('venta-cantidad').value) || 0;
    const prec = parseFloat(document.getElementById('venta-precio').value) || 0;
    const loteSelect = document.getElementById('venta-lote');
    
    if (cant <= 0) return alert("⚠️ La cantidad debe ser mayor a 0.");
    if (prec < 0) return alert("⚠️ El precio unitario no puede ser negativo.");

    let loteDocId = null;
    let loteInfo = 'N/A';

    if (isTostado) {
        loteDocId = loteSelect ? loteSelect.value : null;
        if (!loteDocId) return alert("⚠️ Por favor selecciona un lote de café tostado disponible.");
        
        const selectedOpt = loteSelect.selectedOptions ? loteSelect.selectedOptions[0] : null;
        loteInfo = selectedOpt ? selectedOpt.textContent.trim() : 'Lote Tostado';
        
        // Validar stock disponible considerando lo que ya esté en el carrito
        const stockDisponible = selectedOpt ? (parseFloat(selectedOpt.dataset.cantidad) || 0) : 0;
        const yaEnCarrito = carritoVenta
            .filter(it => it.loteDocId === loteDocId)
            .reduce((acc, it) => acc + it.cantidad, 0);

        if ((yaEnCarrito + cant) > stockDisponible) {
            return alert(`❌ Stock insuficiente en este lote.\n\nDisponible en inventario: ${stockDisponible.toFixed(2)} lb\nYa en tu carrito: ${yaEnCarrito.toFixed(2)} lb\nIntentas agregar: ${cant.toFixed(2)} lb`);
        }
    }

    const prodInfo = preciosListaActual[tipo] || { nombre: tipo, unidad: 'un.' };
    const subtotal = cant * prec;

    carritoVenta.push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        tipo,
        nombre: prodInfo.nombre,
        unidad: prodInfo.unidad,
        presentacion: pres,
        loteDocId,
        loteInfo,
        cantidad: cant,
        precio: prec,
        subtotal: subtotal
    });

    // Limpiar input de cantidad para el siguiente producto
    document.getElementById('venta-cantidad').value = '';
    window.renderCarritoVenta();
};

window.quitarItemDelCarrito = (itemId) => {
    carritoVenta = carritoVenta.filter(it => it.id !== itemId);
    window.renderCarritoVenta();
};

window.limpiarCarritoVenta = () => {
    if (carritoVenta.length === 0) return;
    if (confirm("¿Deseas vaciar todos los productos agregados a la venta actual?")) {
        carritoVenta = [];
        window.renderCarritoVenta();
    }
};

window.renderCarritoVenta = () => {
    const tbody = document.getElementById('carrito-items-body');
    const totalDisplay = document.getElementById('venta-total-display');
    const badgeCount = document.getElementById('cart-count');
    const resumenLabel = document.getElementById('venta-items-resumen-lbl');
    const btnGuardar = document.getElementById('btn-guardar-venta-final');

    if (!tbody) return;

    if (carritoVenta.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="cart-empty-msg">No hay productos agregados a esta venta aún. Selecciona un producto arriba y pulsa <strong>"➕ Agregar a la Venta"</strong>.</td></tr>`;
        if (totalDisplay) totalDisplay.innerText = "Q 0.00";
        if (badgeCount) badgeCount.innerText = "0";
        if (resumenLabel) resumenLabel.innerText = "0 productos agregados";
        if (btnGuardar) btnGuardar.disabled = true;
        return;
    }

    let total = 0;
    let totalUnidades = 0;
    let html = '';

    carritoVenta.forEach((it, idx) => {
        total += it.subtotal;
        totalUnidades += it.cantidad;
        const presBadge = it.presentacion !== 'N/A' ? `<span class="cart-badge">${it.presentacion}</span>` : '';
        const loteTxt = it.loteDocId ? `<small style="color:#555;">${it.loteInfo}</small>` : '<span style="color:#999;">-</span>';

        html += `<tr>
            <td><strong>${it.nombre}</strong> ${presBadge}</td>
            <td style="font-size:0.8rem;">${loteTxt}</td>
            <td><strong>${it.cantidad.toFixed(2)}</strong> ${it.unidad}</td>
            <td>Q ${it.precio.toFixed(2)}</td>
            <td><strong>Q ${it.subtotal.toFixed(2)}</strong></td>
            <td style="text-align:center;">
                <button class="btn btn-xs btn-danger" title="Quitar de la venta" onclick="quitarItemDelCarrito('${it.id}')">🗑️</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
    if (totalDisplay) totalDisplay.innerText = "Q " + total.toFixed(2);
    if (badgeCount) badgeCount.innerText = carritoVenta.length;
    if (resumenLabel) resumenLabel.innerText = `${carritoVenta.length} producto(s) agregados (${totalUnidades.toFixed(1)} unidades en total)`;
    if (btnGuardar) btnGuardar.disabled = false;
};

window.onMetodoPagoChange = () => {
    const pago = document.getElementById('venta-pago').value;
    const estSelect = document.getElementById('venta-estado-pago');
    if (estSelect) {
        estSelect.value = derivarEstadoPagoDeMetodo(pago);
    }
};

window.guardarVenta = async () => {
    // Si no ha presionado "Agregar a la venta" pero llenó una cantidad > 0, auto-agregar
    if (carritoVenta.length === 0) {
        const cantInput = parseFloat(document.getElementById('venta-cantidad').value) || 0;
        if (cantInput > 0) {
            await window.agregarItemAlCarrito();
        }
    }

    if (carritoVenta.length === 0) {
        return alert("⚠️ Debes agregar al menos un producto a la venta utilizando el botón '➕ Agregar a la Venta'.");
    }

    const pago = document.getElementById('venta-pago').value;
    let estadoPago = document.getElementById('venta-estado-pago').value;
    if (estadoPago !== 'pendiente') estadoPago = 'pagado';
    const selCliente = document.getElementById('venta-cliente-id');
    const clienteId = selCliente ? selCliente.value : '';
    let clienteNombre = '';
    if (clienteId) {
        const cliObj = todosLosClientes.find(c => c.id === clienteId);
        if (cliObj) clienteNombre = cliObj.data.nombre || '';
    }
    const notas = document.getElementById('venta-notas').value.trim();
    const fechaPersonalizada = document.getElementById('venta-fecha-registro') ? document.getElementById('venta-fecha-registro').value : '';

    const btnGuardar = document.getElementById('btn-guardar-venta-final');
    if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.innerText = "Registrando Venta..."; }

    try {
        // 1. Validar stock en tiempo real en Firestore antes de procesar
        for (const it of carritoVenta) {
            if (it.tipo === 'Tostado' && it.loteDocId) {
                const loteSnap = await getDoc(doc(db, "inventario", it.loteDocId));
                if (!loteSnap.exists()) {
                    throw new Error(`El lote de café tostado "${it.nombre}" no existe en inventario.`);
                }
                const loteData = loteSnap.data();
                if (loteData.cantidad < it.cantidad) {
                    throw new Error(`Stock insuficiente para ${it.nombre} (${it.presentacion}).\nDisponible: ${loteData.cantidad.toFixed(2)} lb\nSolicitado: ${it.cantidad.toFixed(2)} lb`);
                }
            }
        }

        // 2. Calcular totales
        const totalMonto = carritoVenta.reduce((acc, it) => acc + it.subtotal, 0);
        const totalCantidad = carritoVenta.reduce((acc, it) => acc + it.cantidad, 0);
        
        // Nombres y lotes resumidos para compatibilidad con vistas legacy
        const nombresResumen = carritoVenta.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(' + ');
        const lotesResumen = carritoVenta.filter(it => it.loteDocId).map(it => it.loteInfo).join(' | ') || 'N/A';

        const ventaDoc = {
            items: carritoVenta,
            total: totalMonto,
            cantidad: totalCantidad,
            tipo: nombresResumen,
            loteInfo: lotesResumen,
            pago: pago,
            estadoPago: estadoPago,
            clienteId: clienteId || null,
            clienteNombre: clienteNombre || null,
            notas: notas,
            fechaVentaPersonalizada: fechaPersonalizada || null,
            fecha: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "ventas"), ventaDoc);

        // 3. Descontar inventario de cada producto
        for (const it of carritoVenta) {
            if (it.tipo === 'Tostado' && it.loteDocId) {
                const loteSnap = await getDoc(doc(db, "inventario", it.loteDocId));
                if (loteSnap.exists()) {
                    const cantActual = loteSnap.data().cantidad || 0;
                    await updateDoc(doc(db, "inventario", it.loteDocId), { cantidad: Math.max(0, cantActual - it.cantidad) });
                }
            } else {
                let pend = it.cantidad;
                const snap = await getDocs(query(collection(db, "inventario"), where("estado", "==", it.tipo)));
                for (const d of snap.docs) {
                    if (pend <= 0) break;
                    const inv = d.data();
                    if (inv.cantidad >= pend) {
                        await updateDoc(doc(db, "inventario", d.id), { cantidad: inv.cantidad - pend });
                        pend = 0;
                    } else {
                        await updateDoc(doc(db, "inventario", d.id), { cantidad: 0 });
                        pend -= inv.cantidad;
                    }
                }
            }
        }

        alert(`✅ Venta registrada exitosamente.\n\nTotal: Q ${totalMonto.toFixed(2)}\nEstado: ${estadoPago.toUpperCase()}\nProductos: ${carritoVenta.length}${clienteNombre ? `\nCliente: ${clienteNombre}` : ''}`);
        
        // Limpiar formulario y carrito
        carritoVenta = [];
        window.renderCarritoVenta();
        document.getElementById('venta-cantidad').value = '';
        document.getElementById('venta-notas').value = '';
        if (selCliente) selCliente.value = '';
        const badgeCli = document.getElementById('venta-cliente-badge-info');
        if (badgeCli) { badgeCli.style.display = 'none'; badgeCli.innerHTML = ''; }
        
        cargarDatosIniciales();
    } catch (e) {
        alert("❌ Error al registrar venta: " + e.message);
    } finally {
        if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.innerText = "💾 Confirmar y Registrar Venta"; }
    }
};

window.verVentaDetalle = (docId) => {
    const v = todasLasVentas.find(item => item.id === docId);
    if (!v) return alert("Venta no encontrada.");
    const d = v.data;

    const fechaTxt = d.fecha ? new Date(d.fecha.seconds * 1000).toLocaleString('es-GT') : (d.fechaVentaPersonalizada || 'N/A');
    let clienteTxt = '';
    if (d.clienteId) {
        clienteTxt = `<strong>👤 ${d.clienteNombre || 'Cliente Registrado'}</strong> 
            <button type="button" class="btn btn-xs btn-primary" onclick="cerrarModal('modal-ver-venta'); window.verHistorialCliente('${d.clienteId}');" style="margin-left:8px; display:inline-block; width:auto; padding:3px 10px; font-size:0.78rem;">📜 Ver Historial de Compras</button>
            ${d.notas && d.notas !== d.clienteNombre ? `<br><small style="color:#666;">Nota: ${d.notas}</small>` : ''}`;
    } else if (d.clienteNombre) {
        clienteTxt = `<strong>👤 ${d.clienteNombre}</strong> ${d.notas && d.notas !== d.clienteNombre ? `<br><small style="color:#666;">Nota: ${d.notas}</small>` : ''}`;
    } else {
        clienteTxt = d.notas || '<span style="color:#999; font-style:italic;">No especificado</span>';
    }
    const estadoBadge = d.estadoPago === 'pendiente' 
        ? '<span class="pago-badge pago-pendiente">🔴 PENDIENTE DE PAGO</span>' 
        : '<span class="pago-badge pago-pagado">🟢 PAGADO</span>';

    const totalVenta = d.total !== undefined ? d.total : (d.cantidad * d.precio);
    
    let itemsHTML = '';
    if (d.items && Array.isArray(d.items) && d.items.length > 0) {
        itemsHTML = `
            <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
                <thead>
                    <tr style="background:var(--primary); color:white; text-align:left;">
                        <th style="padding:8px;">Producto</th>
                        <th style="padding:8px;">Detalle / Lote</th>
                        <th style="padding:8px; text-align:right;">Cantidad</th>
                        <th style="padding:8px; text-align:right;">Precio Unit.</th>
                        <th style="padding:8px; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${d.items.map(it => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:8px;"><strong>${it.nombre}</strong> ${it.presentacion !== 'N/A' ? `(${it.presentacion})` : ''}</td>
                            <td style="padding:8px; font-size:0.8rem; color:#555;">${it.loteInfo || '-'}</td>
                            <td style="padding:8px; text-align:right;">${it.cantidad} ${it.unidad}</td>
                            <td style="padding:8px; text-align:right;">Q ${(it.precio||0).toFixed(2)}</td>
                            <td style="padding:8px; text-align:right; font-weight:bold;">Q ${(it.subtotal || it.cantidad*it.precio).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        // Venta clásica de un solo producto
        const nombreProd = preciosListaActual[d.tipo] ? preciosListaActual[d.tipo].nombre : d.tipo;
        const unidad = preciosListaActual[d.tipo] ? preciosListaActual[d.tipo].unidad : '';
        itemsHTML = `
            <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
                <thead>
                    <tr style="background:var(--primary); color:white; text-align:left;">
                        <th style="padding:8px;">Producto</th>
                        <th style="padding:8px;">Lote</th>
                        <th style="padding:8px; text-align:right;">Cantidad</th>
                        <th style="padding:8px; text-align:right;">Precio Unit.</th>
                        <th style="padding:8px; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:8px;"><strong>${nombreProd}</strong></td>
                        <td style="padding:8px; font-size:0.8rem; color:#555;">${d.loteInfo || '-'}</td>
                        <td style="padding:8px; text-align:right;">${d.cantidad} ${unidad}</td>
                        <td style="padding:8px; text-align:right;">Q ${(d.precio||0).toFixed(2)}</td>
                        <td style="padding:8px; text-align:right; font-weight:bold;">Q ${(d.cantidad*d.precio).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    const contenido = `
        <div class="detail-grid" style="margin-bottom:1rem;">
            <div class="detail-item"><div class="label">Fecha de Venta</div><div class="value">${fechaTxt}</div></div>
            <div class="detail-item"><div class="label">Estado de Pago</div><div class="value">${estadoBadge}</div></div>
            <div class="detail-item"><div class="label">Método de Pago</div><div class="value">${d.pago || 'Efectivo'}</div></div>
            <div class="detail-item"><div class="label">Cliente / Referencia</div><div class="value">${clienteTxt}</div></div>
        </div>
        <h4 style="color:var(--primary); margin:1rem 0 0.5rem;">📦 Productos en esta Venta</h4>
        ${itemsHTML}
        <div style="display:flex; justify-content:flex-end; margin-top:1rem; padding:12px; background:#f5f5f0; border-radius:8px;">
            <span style="font-size:1.2rem; font-weight:bold; color:var(--primary);">TOTAL DE LA VENTA: Q ${totalVenta.toFixed(2)}</span>
        </div>
    `;

    document.getElementById('modal-venta-contenido').innerHTML = contenido;
    document.getElementById('modal-ver-venta').style.display = 'flex';
};

window.editarVenta = async (docId) => {
    try {
        const snap = await getDoc(doc(db, "ventas", docId));
        if (!snap.exists()) return alert("Venta no encontrada.");
        const v = snap.data();
        ventaActualEditando = { id: docId, data: v };
        
        const nombreProd = preciosListaActual[v.tipo] ? preciosListaActual[v.tipo].nombre : v.tipo;
        document.getElementById('ev-tipo').value = nombreProd;
        document.getElementById('ev-lote').value = v.loteInfo || 'N/A';
        document.getElementById('ev-cantidad').value = v.cantidad;
        document.getElementById('ev-precio').value = v.precio;
        document.getElementById('ev-pago').value = v.pago || 'Efectivo';
        
        // Estado de pago solo puede ser 'pagado' o 'pendiente'
        let estadoNormalizado = v.estadoPago || derivarEstadoPagoDeMetodo(v.pago);
        if (estadoNormalizado !== 'pendiente') estadoNormalizado = 'pagado';
        document.getElementById('ev-estado-pago').value = estadoNormalizado;
        
        const evCli = document.getElementById('ev-cliente-id');
        if (evCli) evCli.value = v.clienteId || '';

        document.getElementById('ev-notas').value = v.notas || '';
        
        document.getElementById('modal-editar-venta').style.display = 'flex';
    } catch (e) { alert("Error: " + e.message); }
};

window.sincronizarEstadoPagoEditar = () => {
    const pago = document.getElementById('ev-pago').value;
    document.getElementById('ev-estado-pago').value = derivarEstadoPagoDeMetodo(pago);
};

window.guardarEdicionVenta = async () => {
    if (!ventaActualEditando) return;
    const nuevaCantidad = parseFloat(document.getElementById('ev-cantidad').value) || 0;
    const nuevoPrecio = parseFloat(document.getElementById('ev-precio').value) || 0;
    const nuevoPago = document.getElementById('ev-pago').value;
    let nuevoEstado = document.getElementById('ev-estado-pago').value;
    if (nuevoEstado !== 'pendiente') nuevoEstado = 'pagado';
    
    const evCli = document.getElementById('ev-cliente-id');
    const nuevoClienteId = evCli ? evCli.value : '';
    let nuevoClienteNombre = '';
    if (nuevoClienteId) {
        const cliObj = todosLosClientes.find(c => c.id === nuevoClienteId);
        if (cliObj) nuevoClienteNombre = cliObj.data.nombre || '';
    }

    const nuevasNotas = document.getElementById('ev-notas').value;
    
    if (nuevaCantidad <= 0) return alert("La cantidad debe ser mayor a 0.");
    
    const v = ventaActualEditando.data;
    const diffCantidad = nuevaCantidad - v.cantidad;
    
    if (diffCantidad !== 0 && v.tipo === 'Tostado' && v.loteDocId) {
        try {
            const loteSnap = await getDoc(doc(db, "inventario", v.loteDocId));
            if (loteSnap.exists()) {
                const loteData = loteSnap.data();
                if (diffCantidad > 0 && loteData.cantidad < diffCantidad) {
                    return alert(`❌ Stock insuficiente en el lote.\nDisponible: ${loteData.cantidad.toFixed(2)} lb\nNecesario: ${diffCantidad.toFixed(2)} lb`);
                }
                await updateDoc(doc(db, "inventario", v.loteDocId), { cantidad: loteData.cantidad - diffCantidad });
            }
        } catch (e) { return alert("Error ajustando inventario: " + e.message); }
    } else if (diffCantidad !== 0 && v.tipo !== 'Tostado') {
        if (diffCantidad > 0) {
            let pend = diffCantidad;
            const snap = await getDocs(query(collection(db,"inventario"), where("estado","==",v.tipo)));
            for (const d of snap.docs) {
                if (pend <= 0) break;
                const inv = d.data();
                if (inv.cantidad >= pend) { await updateDoc(doc(db,"inventario",d.id), { cantidad: inv.cantidad - pend }); pend = 0; }
                else { await updateDoc(doc(db,"inventario",d.id), { cantidad: 0 }); pend -= inv.cantidad; }
            }
            if (pend > 0) return alert(`⚠️ Venta actualizada, pero faltan ${pend.toFixed(2)} en inventario.`);
        } else {
            const devolver = Math.abs(diffCantidad);
            const snap = await getDocs(query(collection(db,"inventario"), where("estado","==",v.tipo)));
            let agregado = 0;
            for (const d of snap.docs) {
                if (agregado >= devolver) break;
                const invData = d.data();
                await updateDoc(doc(db, "inventario", d.id), { cantidad: (invData.cantidad || 0) + (devolver - agregado) });
                agregado = devolver;
            }
        }
    }
    
    try {
        await updateDoc(doc(db, "ventas", ventaActualEditando.id), {
            cantidad: nuevaCantidad,
            precio: nuevoPrecio,
            pago: nuevoPago,
            estadoPago: nuevoEstado,
            clienteId: nuevoClienteId || null,
            clienteNombre: nuevoClienteNombre || null,
            notas: nuevasNotas
        });
        alert("✅ Venta actualizada.");
        window.cerrarModal('modal-editar-venta');
        ventaActualEditando = null;
        cargarDatosIniciales();
    } catch (e) { alert("Error: " + e.message); }
};

window.eliminarVenta = async (docId) => {
    if (!confirm("⚠️ ¿Eliminar esta venta?\n\nNota: El inventario NO se restaurará automáticamente.")) return;
    try {
        await deleteDoc(doc(db, "ventas", docId));
        alert("✅ Venta eliminada.");
        cargarDatosIniciales();
    } catch (e) { alert("Error: " + e.message); }
};

window.editarInventario = async (docId) => {
    try {
        const snap = await getDoc(doc(db, "inventario", docId));
        if (!snap.exists()) return alert("No encontrado.");
        const inv = snap.data();
        inventarioActualEditando = { id: docId, data: inv };
        
        document.getElementById('ei-estado').value = inv.estado;
        document.getElementById('ei-cantidad').value = inv.cantidad;
        document.getElementById('ei-finca').value = inv.finca || '';
        document.getElementById('ei-variedad').value = inv.variedad || '';
        document.getElementById('ei-proceso').value = inv.proceso || 'Lavado';
        
        window.toggleEditarInvFields();
        
        if (inv.estado === 'Tostado') {
            document.getElementById('ei-presentacion').value = inv.presentacion || 'Entero';
            document.getElementById('ei-fecha-tostado').value = inv.fechaTostado || '';
        }
        
        document.getElementById('modal-editar-inventario').style.display = 'flex';
    } catch (e) { alert("Error: " + e.message); }
};

window.toggleEditarInvFields = () => {
    const est = document.getElementById('ei-estado').value;
    const isTostado = est === 'Tostado';
    const isCafe = ['Pergamino','Oro','Tostado'].includes(est);
    document.getElementById('ei-presentacion-group').style.display = isTostado ? 'flex' : 'none';
    document.getElementById('ei-tostado-group').style.display = isTostado ? 'flex' : 'none';
    document.getElementById('ei-variedad-group').style.display = isCafe ? 'flex' : 'none';
    document.getElementById('ei-proceso-group').style.display = isCafe ? 'flex' : 'none';
};

window.guardarEdicionInventario = async () => {
    if (!inventarioActualEditando) return;
    const est = document.getElementById('ei-estado').value;
    const isCafe = ['Pergamino','Oro','Tostado'].includes(est);
    const nuevaCantidad = parseFloat(document.getElementById('ei-cantidad').value) || 0;
    
    if (nuevaCantidad < 0) return alert("La cantidad no puede ser negativa.");
    
    const datos = {
        estado: est,
        presentacion: est === 'Tostado' ? document.getElementById('ei-presentacion').value : 'N/A',
        cantidad: nuevaCantidad,
        finca: document.getElementById('ei-finca').value,
        variedad: isCafe ? document.getElementById('ei-variedad').value : 'N/A',
        proceso: isCafe ? document.getElementById('ei-proceso').value : 'N/A',
        fechaTostado: est === 'Tostado' ? document.getElementById('ei-fecha-tostado').value : ''
    };
    
    try {
        await updateDoc(doc(db, "inventario", inventarioActualEditando.id), datos);
        alert("✅ Inventario actualizado.");
        window.cerrarModal('modal-editar-inventario');
        inventarioActualEditando = null;
        cargarDatosIniciales();
    } catch (e) { alert("Error: " + e.message); }
};

window.eliminarInventario = async (docId) => {
    if (!confirm("⚠️ ¿Eliminar este item del inventario?")) return;
    try {
        await deleteDoc(doc(db, "inventario", docId));
        alert("✅ Item eliminado.");
        cargarDatosIniciales();
    } catch (e) { alert("Error: " + e.message); }
};

window.filtrarVentas = (filtro, btn) => {
    filtroVentasActual = filtro;
    document.querySelectorAll('#ventas .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTablaVentas();
};

function renderTablaVentas() {
    const tbody = document.querySelector('#tabla-ventas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let ventasFiltradas = todasLasVentas;
    if (filtroVentasActual !== 'todas') {
        ventasFiltradas = todasLasVentas.filter(v => v.data.estadoPago === filtroVentasActual);
    }
    ventasFiltradas.forEach(v => {
        const d = v.data;
        const docId = v.id;
        const f = d.fecha ? new Date(d.fecha.seconds*1000).toLocaleDateString() : (d.fechaVentaPersonalizada || 'N/A');
        
        let clienteNotasHTML = '';
        if (d.clienteId) {
            clienteNotasHTML = `<span class="cliente-badge-link" onclick="window.verHistorialCliente('${d.clienteId}')" title="Clic para ver historial completo del cliente">👤 <strong>${d.clienteNombre || 'Cliente'}</strong></span>`;
            if (d.notas && d.notas !== d.clienteNombre) {
                clienteNotasHTML += `<br><small style="color:#666;">${d.notas}</small>`;
            }
        } else if (d.clienteNombre) {
            clienteNotasHTML = `👤 <strong>${d.clienteNombre}</strong>`;
            if (d.notas && d.notas !== d.clienteNombre) {
                clienteNotasHTML += `<br><small style="color:#666;">${d.notas}</small>`;
            }
        } else {
            clienteNotasHTML = d.notas || '<span style="color:#999; font-style:italic;">-</span>';
        }
        
        let nombreProdHTML = '';
        let loteInfoHTML = '';
        let cantidadHTML = '';
        let totalMonto = 0;

        if (d.items && Array.isArray(d.items) && d.items.length > 0) {
            totalMonto = d.total !== undefined ? d.total : d.items.reduce((s, it) => s + (it.subtotal || it.cantidad * it.precio), 0);
            const totalCant = d.cantidad !== undefined ? d.cantidad : d.items.reduce((s, it) => s + (parseFloat(it.cantidad) || 0), 0);

            if (d.items.length === 1) {
                const it = d.items[0];
                nombreProdHTML = `<strong>${it.nombre}</strong> ${it.presentacion !== 'N/A' ? `<span class="cart-badge">${it.presentacion}</span>` : ''}`;
                loteInfoHTML = `<span style="font-size:0.75rem;">${it.loteInfo || '-'}</span>`;
                cantidadHTML = `${it.cantidad} ${it.unidad}`;
            } else {
                nombreProdHTML = `<div style="display:flex; flex-direction:column; gap:2px;">
                    <span class="badge-multi-items">📦 ${d.items.length} productos</span>
                    <small style="color:#555;">${d.items.map(it => it.nombre).join(', ').substring(0, 40)}...</small>
                </div>`;
                const lotes = d.items.filter(it => it.loteDocId).map(it => it.loteInfo);
                loteInfoHTML = lotes.length > 0 ? `<span style="font-size:0.75rem;">${lotes.join('<br>')}</span>` : '-';
                cantidadHTML = `<strong>${totalCant.toFixed(1)}</strong> un.`;
            }
        } else {
            // Venta tradicional de un solo producto
            const nombreProd = preciosListaActual[d.tipo] ? preciosListaActual[d.tipo].nombre : d.tipo;
            const unidad = preciosListaActual[d.tipo] ? preciosListaActual[d.tipo].unidad : '';
            nombreProdHTML = `<strong>${nombreProd}</strong> ${d.presentacion && d.presentacion !== 'N/A' ? `<span class="cart-badge">${d.presentacion}</span>` : ''}`;
            loteInfoHTML = `<span style="font-size:0.75rem;">${d.loteInfo || '-'}</span>`;
            cantidadHTML = `${d.cantidad} ${unidad}`;
            totalMonto = (d.cantidad * d.precio);
        }
        
        let estadoBadge = '';
        if (d.estadoPago === 'pendiente') {
            estadoBadge = '<span class="pago-badge pago-pendiente">🔴 PENDIENTE</span>';
        } else {
            estadoBadge = '<span class="pago-badge pago-pagado">🟢 PAGADO</span>';
        }
        
        tbody.innerHTML += `<tr>
            <td>${f}</td>
            <td class="cliente-nota" title="${(d.notas||'').replace(/"/g,'&quot;')}">${clienteNotasHTML}</td>
            <td>${nombreProdHTML}</td>
            <td>${loteInfoHTML}</td>
            <td>${cantidadHTML}</td>
            <td><strong>Q ${totalMonto.toFixed(2)}</strong></td>
            <td>${d.pago || 'Efectivo'}</td>
            <td>${estadoBadge}</td>
            <td class="actions-cell">
                <button class="btn btn-xs btn-view" title="Ver detalle completo" onclick="verVentaDetalle('${docId}')">👁️</button>
                <button class="btn btn-xs btn-edit" title="Editar venta" onclick="editarVenta('${docId}')">✏️</button>
                <button class="btn btn-xs btn-danger" title="Eliminar venta" onclick="eliminarVenta('${docId}')">🗑️</button>
            </td>
        </tr>`;
    });
}

window.calcularPrecioSugerido = () => {
    const v = parseFloat(document.getElementById('costo-verde').value)||0;
    const t = parseFloat(document.getElementById('costo-tostado').value)||0;
    const e = parseFloat(document.getElementById('costo-empaque').value)||0;
    const m = parseFloat(document.getElementById('costo-margen').value)||0;
    const ct = v+t+e;
    if (m >= 100) { 
        document.getElementById('precio-sugerido').innerText='∞'; 
        document.getElementById('costo-total').innerText='Q '+ct.toFixed(2); 
        document.getElementById('ganancia-neta').innerText='N/A'; 
        return; 
    }
    const pv = m > 0 ? ct/(1-(m/100)) : ct;
    document.getElementById('costo-total').innerText = 'Q '+ct.toFixed(2);
    document.getElementById('precio-sugerido').innerText = 'Q '+pv.toFixed(2);
    document.getElementById('ganancia-neta').innerText = 'Q '+(pv-ct).toFixed(2);
};

window.guardarCosto = async () => {
    const lote = document.getElementById('costo-lote').value.trim();
    if (!lote) return alert("Ingresa un nombre de lote.");
    const btn = event.target; btn.disabled = true; btn.innerText = "Guardando...";
    try {
        const v = parseFloat(document.getElementById('costo-verde').value)||0;
        const t = parseFloat(document.getElementById('costo-tostado').value)||0;
        const e = parseFloat(document.getElementById('costo-empaque').value)||0;
        const m = parseFloat(document.getElementById('costo-margen').value)||0;
        const ct = v+t+e; const pv = m<100 ? ct/(1-(m/100)) : 0;
        await addDoc(collection(db,"costosTostado"), {
            lote, variedad:document.getElementById('costo-variedad').value,
            proceso:document.getElementById('costo-proceso').value,
            fechaTostado:document.getElementById('costo-fecha-tostado').value,
            costoVerde:v, costoTostado:t, costoEmpaque:e,
            costoTotal:ct, margenPorc:m, precioSugerido:pv,
            gananciaNeta:pv-ct, fechaRegistro:serverTimestamp()
        });
        alert("✅ Costo guardado."); cargarDatosIniciales();
        ['costo-lote','costo-verde','costo-tostado','costo-empaque','costo-fecha-tostado'].forEach(id => document.getElementById(id).value='');
        window.calcularPrecioSugerido();
    } catch(e) { alert("Error: "+e.message); }
    finally { btn.disabled = false; btn.innerText = "💾 Guardar Costo de este Lote"; }
};

window.verCostoDetalle = async (id) => {
    try {
        const s = await getDoc(doc(db,"costosTostado",id));
        if (!s.exists()) return alert("No encontrado.");
        const c = s.data();
        document.getElementById('modal-costo-titulo').innerText = 'Lote: '+c.lote;
        document.getElementById('modal-costo-contenido').innerHTML = `
            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">📋 Lote</h4>
            <div class="detail-grid">
                <div class="detail-item"><div class="label">Lote</div><div class="value">${c.lote}</div></div>
                <div class="detail-item"><div class="label">Variedad</div><div class="value">${c.variedad}</div></div>
                <div class="detail-item"><div class="label">Proceso</div><div class="value">${c.proceso}</div></div>
                <div class="detail-item"><div class="label">Fecha Tostado</div><div class="value">${c.fechaTostado||'N/A'}</div></div>
            </div>
            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">💰 Costos/Libra</h4>
            <div class="detail-grid">
                <div class="detail-item"><div class="label">Café Verde</div><div class="value">Q ${(c.costoVerde||0).toFixed(2)}</div></div>
                <div class="detail-item"><div class="label">Tostado</div><div class="value">Q ${(c.costoTostado||0).toFixed(2)}</div></div>
                <div class="detail-item"><div class="label">Empaque</div><div class="value">Q ${(c.costoEmpaque||0).toFixed(2)}</div></div>
                <div class="detail-item highlight"><div class="label">Total</div><div class="value">Q ${(c.costoTotal||0).toFixed(2)}</div></div>
            </div>
            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">📊 Venta</h4>
            <div class="detail-grid">
                <div class="detail-item"><div class="label">Margen</div><div class="value">${c.margenPorc}%</div></div>
                <div class="detail-item highlight"><div class="label">Precio Sugerido</div><div class="value">Q ${(c.precioSugerido||0).toFixed(2)}</div></div>
                <div class="detail-item"><div class="label">Ganancia Neta</div><div class="value">Q ${(c.gananciaNeta||0).toFixed(2)}</div></div>
            </div>`;
        document.getElementById('modal-ver-costo').style.display = 'flex';
    } catch(e) { alert("Error: "+e.message); }
};

window.actualizarCMarket = () => {
    const c = parseFloat(document.getElementById('cmarket-input').value)||0;
    document.getElementById('cmarket-price').innerText = c.toFixed(2)+' ¢/lb';
    document.getElementById('cmarket-usdlb').innerText = 'US$ '+(c/100).toFixed(2);
    document.getElementById('cmarket-usdkg').innerText = 'US$ '+(c/100/0.453592).toFixed(2);
    window.calcularCotizador();
};

window.calcularCotizador = () => {
    const tc = parseFloat(document.getElementById('tipo-cambio').value)||7.80;
    const est = document.getElementById('cot-estado').value;
    const rend = parseFloat(document.getElementById('cot-rendimiento').value)||81;
    const pqlb = parseFloat(document.getElementById('cot-precio-qlb').value)||0;
    const pais = document.getElementById('cot-pais').value;
    const kg = parseFloat(document.getElementById('cot-cantidad-kg').value)||0;
    const seg = parseFloat(document.getElementById('cot-seguro').value)||0.3;
    let oro = pqlb;
    if (est==='pergamino' && rend>0) oro = pqlb*(100/rend);
    const qkg = oro/0.453592, usdlb = oro/tc, usdkg = usdlb/0.453592;
    document.getElementById('conv-qlb').innerText='Q '+oro.toFixed(2);
    document.getElementById('conv-qkg').innerText='Q '+qkg.toFixed(2);
    document.getElementById('conv-usdlb').innerText='US$ '+usdlb.toFixed(2);
    document.getElementById('conv-usdkg').innerText='US$ '+usdkg.toFixed(2);
    const cm = (parseFloat(document.getElementById('cmarket-input').value)||385)/100;
    const dif = usdlb-cm;
    document.getElementById('cot-diferencial-box').innerHTML = dif>=0
        ? `<strong>📈 Diferencial:</strong> <span style="color:#2C5E2E; font-weight:bold;">+US$ ${dif.toFixed(2)}/lb</span>`
        : `<strong>📉 Diferencial:</strong> <span style="color:#d32f2f; font-weight:bold;">US$ ${dif.toFixed(2)}/lb</span>`;
    const fobT = usdkg*kg, flt = (FLETES[pais]||120)*(kg/1000), segT = fobT*(seg/100), cifT = fobT+flt+segT, cifkg = kg>0?cifT/kg:0;
    document.getElementById('fob-usdlb').innerText='US$ '+usdlb.toFixed(2);
    document.getElementById('fob-usdkg').innerText='US$ '+usdkg.toFixed(2);
    document.getElementById('cif-usdlb').innerText='US$ '+(cifkg*0.453592).toFixed(2);
    document.getElementById('cif-usdkg').innerText='US$ '+cifkg.toFixed(2);
    document.getElementById('cif-total').innerText='US$ '+cifT.toFixed(2);
    document.getElementById('flete-total').innerText='US$ '+flt.toFixed(2);
    document.getElementById('seguro-total').innerText='US$ '+segT.toFixed(2);
};

// 🔥 GUARDAR TOSTADO
window.guardarTostado = async () => {
    const nombre = document.getElementById('t-nombre').value.trim();
    if (!nombre) return alert("Ingresa un nombre/código para la prueba.");
    
    const btn = event.target;
    btn.disabled = true;
    btn.innerText = "Guardando...";

    try {
        const temperaturas = [];
        for (let i = 0; i <= 15; i++) {
            const out = document.getElementById(`t-out-${i}`) ? document.getElementById(`t-out-${i}`).value : '';
            const inp = document.getElementById(`t-in-${i}`) ? document.getElementById(`t-in-${i}`).value : '';
            const pot = document.getElementById(`t-pot-${i}`) ? document.getElementById(`t-pot-${i}`).value : '';
            if (out || inp || pot) {
                temperaturas.push({ min: i, out, in: inp, pot });
            }
        }

        const datos = {
            fecha: document.getElementById('t-fecha').value,
            nombre: nombre,
            tostador: document.getElementById('t-tostador').value,
            cafe: document.getElementById('t-cafe').value,
            pesoCarga: parseFloat(document.getElementById('t-peso-carga').value) || 0,
            pesoFinal: parseFloat(document.getElementById('t-peso-final').value) || 0,
            potenciaIni: document.getElementById('t-potencia-ini').value,
            crack: document.getElementById('t-crack').value,
            des: document.getElementById('t-des').value,
            salida: document.getElementById('t-salida').value,
            notas: document.getElementById('t-notas').value,
            temperaturas: temperaturas,
            fechaRegistro: serverTimestamp()
        };

        await addDoc(collection(db, "tostados"), datos);
        alert("✅ Perfil de tueste guardado correctamente.");
        
        document.getElementById('t-nombre').value = '';
        document.getElementById('t-peso-carga').value = '';
        document.getElementById('t-peso-final').value = '';
        document.getElementById('t-crack').value = '';
        document.getElementById('t-des').value = '';
        document.getElementById('t-salida').value = '';
        document.getElementById('t-notas').value = '';
        for (let i = 0; i <= 15; i++) {
            const elOut = document.getElementById(`t-out-${i}`);
            const elIn = document.getElementById(`t-in-${i}`);
            const elPot = document.getElementById(`t-pot-${i}`);
            if (elOut) elOut.value = '';
            if (elIn) elIn.value = '';
            if (elPot) elPot.value = '';
        }
        
        cargarTostados();
    } catch (e) {
        alert("Error al guardar: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "💾 Guardar Perfil de Tostado";
    }
};

async function cargarTostados() {
    try {
        const snap = await getDocs(query(collection(db, "tostados"), orderBy("fechaRegistro", "desc")));
        const tbody = document.querySelector('#tabla-historial-tostados tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        snap.forEach(d => {
            const t = d.data();
            const f = t.fecha || (t.fechaRegistro ? new Date(t.fechaRegistro.seconds*1000).toLocaleDateString() : 'N/A');
            tbody.innerHTML += `
                <tr>
                    <td>${f}</td>
                    <td><strong>${t.nombre}</strong></td>
                    <td>${t.cafe || 'N/A'}</td>
                    <td>${t.pesoCarga} g</td>
                    <td>${t.pesoFinal} g</td>
                    <td class="actions-cell">
                        <button class="btn btn-xs btn-view" onclick="verTostadoDetalle('${d.id}')">👁️ Ver</button>
                        <button class="btn btn-xs btn-pdf" onclick="verTostadoDetalle('${d.id}', true)">📄 PDF</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { console.error("Error cargando tostados:", e); }
}

// Renderizar gráfica en el detalle de Tostado (Ambas curvas en el mismo cuadro)
function renderizarGraficaTostado(temperaturas) {
    const canvas = document.getElementById('tostadoChartCanvas');
    if (!canvas) return;
    
    if (chartTostadoInstance) {
        chartTostadoInstance.destroy();
        chartTostadoInstance = null;
    }

    // Ordenar temperaturas por minuto
    const sortedTemps = [...(temperaturas || [])].sort((a, b) => a.min - b.min);
    
    const labels = [];
    const dataOut = [];
    const dataIn = [];
    
    // Determinar rango de minutos (al menos hasta el máximo registrado o 12-15)
    const maxMin = sortedTemps.length > 0 ? Math.max(...sortedTemps.map(item => item.min), 10) : 12;
    
    for (let m = 0; m <= maxMin; m++) {
        labels.push(`${m} min`);
        const punto = sortedTemps.find(item => item.min === m);
        if (punto) {
            dataOut.push(punto.out !== '' && punto.out !== undefined && !isNaN(Number(punto.out)) ? parseFloat(punto.out) : null);
            dataIn.push(punto.in !== '' && punto.in !== undefined && !isNaN(Number(punto.in)) ? parseFloat(punto.in) : null);
        } else {
            dataOut.push(null);
            dataIn.push(null);
        }
    }

    const ctx = canvas.getContext('2d');
    const ChartClass = getChart();
    if (!ChartClass) {
        console.warn("Chart.js no está cargado.");
        return;
    }
    chartTostadoInstance = new ChartClass(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '🔥 Temp Salida / Out (°F)',
                    data: dataOut,
                    borderColor: '#d32f2f',
                    backgroundColor: 'rgba(211, 47, 47, 0.15)',
                    borderWidth: 3,
                    pointBackgroundColor: '#d32f2f',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.35,
                    spanGaps: true
                },
                {
                    label: '💨 Temp Entrada / In (°F)',
                    data: dataIn,
                    borderColor: '#2C5E2E',
                    backgroundColor: 'rgba(44, 94, 46, 0.15)',
                    borderWidth: 3,
                    pointBackgroundColor: '#2C5E2E',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.35,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 13, weight: 'bold', family: "'Segoe UI', sans-serif" },
                        padding: 14,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 40, 30, 0.92)',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 6
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo de Tostado (Minutos)',
                        font: { size: 12, weight: 'bold' },
                        color: '#555'
                    },
                    grid: { color: 'rgba(0,0,0,0.06)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatura (°F)',
                        font: { size: 12, weight: 'bold' },
                        color: '#555'
                    },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    suggestedMin: 150,
                    suggestedMax: 450
                }
            }
        }
    });
}

window.verTostadoDetalle = async (id, autoPDF = false) => {
    try {
        const snap = await getDoc(doc(db, "tostados", id));
        if (!snap.exists()) return alert("No encontrado.");
        const t = snap.data();
        tostadoActualEnModal = { id, ...t };
        
        document.getElementById('modal-tostado-titulo').innerText = `🔥 Perfil de Tueste: ${t.nombre}`;
        
        let tempRows = (t.temperaturas || []).map(temp => `
            <tr>
                <td style="font-weight:bold; text-align:center;">${temp.min}</td>
                <td style="color:#d32f2f; font-weight:bold;">${temp.out ? temp.out + ' °F' : '-'}</td>
                <td style="color:#2C5E2E; font-weight:bold;">${temp.in ? temp.in + ' °F' : '-'}</td>
                <td>${temp.pot || '-'}</td>
            </tr>
        `).join('');

        document.getElementById('modal-tostado-contenido').innerHTML = `
            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">📋 Datos Generales</h4>
            <div class="detail-grid">
                <div class="detail-item"><div class="label">Fecha</div><div class="value">${t.fecha || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Tostador</div><div class="value">${t.tostador || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Café</div><div class="value">${t.cafe || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Potencia Inicial</div><div class="value">${t.potenciaIni || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Peso Carga</div><div class="value">${t.pesoCarga} g</div></div>
                <div class="detail-item"><div class="label">Peso Final</div><div class="value">${t.pesoFinal} g</div></div>
            </div>
            
            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">⏱️ Tiempos Clave</h4>
            <div class="tostado-summary">
                <div class="tostado-summary-item"><div class="label">Crack</div><div class="value">${t.crack || '-'}</div></div>
                <div class="tostado-summary-item"><div class="label">Desarrollo</div><div class="value">${t.des || '-'}</div></div>
                <div class="tostado-summary-item"><div class="label">Salida</div><div class="value">${t.salida || '-'}</div></div>
            </div>

            <h4 style="color:var(--primary); margin:1.5rem 0 0.5rem; display:flex; align-items:center; gap:8px;">
                📈 Gráfica de Perfil de Tueste (Temp Salida vs Tiempo y Temp Entrada vs Tiempo)
            </h4>
            <div class="chart-container-box">
                <div class="chart-header">
                    <span style="font-weight:bold; color:var(--primary); font-size:0.95rem;">Curva de Tostado en Tiempo Real</span>
                    <div style="display:flex; gap:12px;">
                        <span class="chart-legend-badge"><span class="chart-legend-color" style="background:#d32f2f;"></span> Salida (Out)</span>
                        <span class="chart-legend-badge"><span class="chart-legend-color" style="background:#2C5E2E;"></span> Entrada (In)</span>
                    </div>
                </div>
                <div style="position:relative; height:320px; width:100%;">
                    <canvas id="tostadoChartCanvas"></canvas>
                </div>
            </div>

            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">🌡️ Registro de Temperaturas</h4>
            <div class="table-wrapper">
                <table class="tostado-table">
                    <thead><tr><th>Min</th><th>Temp Out (°F)</th><th>Temp In (°F)</th><th>Potencia</th></tr></thead>
                    <tbody>${tempRows || '<tr><td colspan="4" style="text-align:center;">Sin registro de temperaturas</td></tr>'}</tbody>
                </table>
            </div>

            ${t.notas ? `<h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">👅 Notas de Catación</h4><div class="detail-item"><div class="value">${t.notas}</div></div>` : ''}
        `;
        
        document.getElementById('modal-ver-tostado').style.display = 'flex';
        
        // Renderizar la gráfica
        setTimeout(() => {
            renderizarGraficaTostado(t.temperaturas);
            if (autoPDF) {
                setTimeout(() => window.generarPDFTostado(), 500);
            }
        }, 100);

    } catch (e) { alert("Error: " + e.message); }
};

window.generarPDFTostado = () => {
    if (!tostadoActualEnModal) return alert("Sin datos de tostado cargados.");
    const t = tostadoActualEnModal;
    const jsPDFClass = getJsPDF();
    const doc = new jsPDFClass();
    
    // Encabezado
    doc.setFillColor(44, 94, 46);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Finca Los Robles", 105, 14, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text("CONTROL DE PERFIL DE TOSTADO", 105, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 40;
    
    // Cuadrícula datos generales
    doc.setFillColor(245, 245, 220);
    doc.rect(14, y - 2, 182, 34, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.rect(14, y - 2, 182, 34, 'S');

    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 94, 46);
    doc.text("Código de Prueba: " + (t.nombre || "N/A"), 18, y + 4);
    doc.text("Fecha: " + (t.fecha || "N/A"), 110, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Tostador: " + (t.tostador || "N/A"), 18, y + 12);
    doc.text("Café: " + (t.cafe || "N/A"), 110, y + 12);
    doc.text("Peso Carga: " + (t.pesoCarga || 0) + " g", 18, y + 20);
    doc.text("Peso Final: " + (t.pesoFinal || 0) + " g", 70, y + 20);
    doc.text("Potencia Inicial: " + (t.potenciaIni || "N/A"), 135, y + 20);

    const perdidaPeso = t.pesoCarga > 0 && t.pesoFinal > 0 
        ? (((t.pesoCarga - t.pesoFinal) / t.pesoCarga) * 100).toFixed(1) + "%" 
        : "N/A";
    doc.setFont("helvetica", "bold");
    doc.text("Merma / Pérdida: " + perdidaPeso, 18, y + 27);
    doc.text(`Tiempos Clave:  Crack: ${t.crack || '-'}   |   Desarrollo: ${t.des || '-'}   |   Salida: ${t.salida || '-'}`, 70, y + 27);

    y += 40;

    // INSERCIÓN DE LA GRÁFICA EN EL PDF
    const canvas = document.getElementById('tostadoChartCanvas');
    if (canvas) {
        try {
            const chartDataUrl = canvas.toDataURL('image/png', 1.0);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(139, 90, 43);
            doc.text("GRÁFICA: CURVA DE TEMPERATURA vs TIEMPO (SALIDA & ENTRADA)", 14, y);
            y += 4;
            // Dibujar imagen del gráfico
            doc.addImage(chartDataUrl, 'PNG', 14, y, 182, 85);
            y += 92;
        } catch (err) {
            console.error("Error al exportar gráfico a PDF:", err);
        }
    }

    // Tabla de temperaturas
    if (y > 220) { doc.addPage(); y = 20; }
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 90, 43);
    doc.text("TABLA DE REGISTRO MINUTO A MINUTO", 14, y);
    y += 5;

    doc.setFillColor(44, 94, 46);
    doc.rect(14, y - 4, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Minuto", 20, y);
    doc.text("Temp Salida / Out (°F)", 60, y);
    doc.text("Temp Entrada / In (°F)", 115, y);
    doc.text("Potencia", 170, y);
    y += 7;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    if (t.temperaturas && t.temperaturas.length > 0) {
        const sorted = [...t.temperaturas].sort((a, b) => a.min - b.min);
        sorted.forEach((temp, index) => {
            if (y > 275) { doc.addPage(); y = 20; }
            if (index % 2 === 1) {
                doc.setFillColor(248, 248, 248);
                doc.rect(14, y - 4, 182, 6, 'F');
            }
            doc.text(String(temp.min) + " min", 20, y);
            doc.text(temp.out ? String(temp.out) + " °F" : "-", 60, y);
            doc.text(temp.in ? String(temp.in) + " °F" : "-", 115, y);
            doc.text(temp.pot || "-", 170, y);
            y += 6;
        });
    }

    if (t.notas) {
        y += 4;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(139, 90, 43);
        doc.text("Notas de Catación / Observaciones:", 14, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const splitNotes = doc.splitTextToSize(t.notas, 180);
        doc.text(splitNotes, 14, y);
    }

    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("Generado: " + new Date().toLocaleString('es-GT') + "  |  Finca Los Robles - Café de Especialidad  |  v2026.09.11", 105, 290, { align: "center" });

    doc.save(`Tueste_${t.nombre || 'Perfil'}_${t.fecha || Date.now()}.pdf`);
    alert("✅ Reporte PDF de Tostado generado con gráfica incluida.");
};

window.calcularMuestreo = () => {
    const pp = parseFloat(document.getElementById('m-peso-perg').value)||0;
    const po = parseFloat(document.getElementById('m-peso-oro').value)||0;
    const z = [18,16,15,14].map(n => parseFloat(document.getElementById('m-z'+n).value)||0);
    const r = parseFloat(document.getElementById('m-residuo').value)||0;
    const tot = z[0]+z[1]+z[2]+z[3]+r;
    document.getElementById('m-total').value = tot.toFixed(2);
    document.getElementById('m-rendimiento').value = (pp>0?(po/pp)*100:0).toFixed(2)+'%';
    const pct = v => tot>0?((v/tot)*100).toFixed(1)+'%':'0%';
    document.getElementById('m-pct-z18').value=pct(z[0]);
    document.getElementById('m-pct-z16').value=pct(z[1]);
    document.getElementById('m-pct-z15').value=pct(z[2]);
    document.getElementById('m-pct-z14').value=pct(z[3]);
    document.getElementById('m-pct-residuo').value=pct(r);
};

window.guardarMuestreo = async () => {
    const btn = event.target; btn.disabled = true; btn.innerText = "Guardando...";
    try {
        const ids = ['m-nombre','m-fecha','m-finca','m-altitud','m-variedad','m-proceso','m-lote','m-muestra','m-peso-perg','m-peso-oro','m-humedad','m-densidad','m-atw','m-muestra-zaranda','m-z18','m-z16','m-z15','m-z14','m-residuo','m-total','m-pct-z18','m-pct-z16','m-pct-z15','m-pct-z14','m-pct-residuo','m-rendimiento','m-defectos','m-observaciones'];
        const keys = ['nombre','fecha','finca','altitud','variedad','proceso','lote','muestraNum','pesoPerg','pesoOro','humedad','densidad','atw','muestraZaranda','z18','z16','z15','z14','residuo','total','pctZ18','pctZ16','pctZ15','pctZ14','pctResiduo','rendimiento','defectos','observaciones'];
        const data = {};
        ids.forEach((id,i) => {
            const el = document.getElementById(id);
            data[keys[i]] = el ? el.value : '';
        });
        data.fechaRegistro = serverTimestamp();
        await addDoc(collection(db,"muestreos"), data);
        alert("✅ Ficha de muestreo guardada exitosamente.");
        cargarDatosIniciales();
        ids.forEach(id => { 
            if(!['m-finca','m-altitud','m-variedad','m-proceso'].includes(id)) {
                const el = document.getElementById(id);
                if (el) el.value = '';
            }
        });
        ['m-total','m-rendimiento','m-pct-z18','m-pct-z16','m-pct-z15','m-pct-z14','m-pct-residuo'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    } catch(e) { alert("Error: "+e.message); }
    finally { btn.disabled = false; btn.innerText = "💾 Guardar Ficha de Muestreo"; }
};

// Detalle completo de Muestreo con datos de ANÁLISIS DE ZARANDA
window.verMuestraCompleta = async (id) => {
    try {
        const s = await getDoc(doc(db,"muestreos",id));
        if (!s.exists()) return alert("No encontrada.");
        const m = s.data(); 
        muestraActualEnModal = {id, ...m};
        
        document.getElementById('modal-titulo').innerText = `🔬 Ficha: ${m.nombre||'N/A'} - Lote: ${m.lote||'N/A'}`;
        document.getElementById('modal-contenido').innerHTML = `
            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">📋 Datos Generales</h4>
            <div class="detail-grid">
                <div class="detail-item"><div class="label">Nombre / Código</div><div class="value">${m.nombre||'N/A'}</div></div>
                <div class="detail-item"><div class="label">Fecha</div><div class="value">${m.fecha||'N/A'}</div></div>
                <div class="detail-item"><div class="label">Finca</div><div class="value">${m.finca||'N/A'}</div></div>
                <div class="detail-item"><div class="label">Altitud</div><div class="value">${m.altitud||'N/A'} msnm</div></div>
                <div class="detail-item"><div class="label">Variedad</div><div class="value">${m.variedad||'N/A'}</div></div>
                <div class="detail-item"><div class="label">Proceso</div><div class="value">${m.proceso||'N/A'}</div></div>
                <div class="detail-item"><div class="label">Lote</div><div class="value">${m.lote||'N/A'}</div></div>
                <div class="detail-item"><div class="label">Muestra #</div><div class="value">${m.muestraNum||'-'}</div></div>
            </div>

            <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">⚖️ Pesos y Mediciones Físicas</h4>
            <div class="detail-grid">
                <div class="detail-item"><div class="label">Peso Pergamino (Inicial)</div><div class="value">${m.pesoPerg||'0'} g</div></div>
                <div class="detail-item"><div class="label">Peso Oro (Final)</div><div class="value">${m.pesoOro||'0'} g</div></div>
                <div class="detail-item highlight"><div class="label">Rendimiento Pergamino → Oro</div><div class="value">${m.rendimiento||'0%'}</div></div>
                <div class="detail-item"><div class="label">Humedad</div><div class="value">${m.humedad||'0'}%</div></div>
                <div class="detail-item"><div class="label">Densidad</div><div class="value">${m.densidad||'0'} g/ml</div></div>
                <div class="detail-item"><div class="label">ATW (1000 granos)</div><div class="value">${m.atw||'0'} g</div></div>
                <div class="detail-item"><div class="label">Muestra Zarandas</div><div class="value">${m.muestraZaranda||'0'} g</div></div>
                <div class="detail-item"><div class="label">Defectos</div><div class="value">${m.defectos||'N/A'} / 300g</div></div>
            </div>

            <h4 style="color:var(--primary); margin:1.5rem 0 0.5rem; border-bottom:1px solid var(--accent); padding-bottom:4px;">
                🗂️ Análisis Granulométrico por Zarandas
            </h4>
            <table class="zaranda-table">
                <thead>
                    <tr>
                        <th>Zaranda</th>
                        <th>Peso (g)</th>
                        <th>Porcentaje (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Zaranda 18</strong> (Malla 18/64")</td>
                        <td>${m.z18 || '0.00'} g</td>
                        <td><strong>${m.pctZ18 || '0%'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Zaranda 16</strong> (Malla 16/64")</td>
                        <td>${m.z16 || '0.00'} g</td>
                        <td><strong>${m.pctZ16 || '0%'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Zaranda 15</strong> (Malla 15/64")</td>
                        <td>${m.z15 || '0.00'} g</td>
                        <td><strong>${m.pctZ15 || '0%'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Zaranda 14</strong> (Malla 14/64")</td>
                        <td>${m.z14 || '0.00'} g</td>
                        <td><strong>${m.pctZ14 || '0%'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Residuo / Fondo</strong></td>
                        <td>${m.residuo || '0.00'} g</td>
                        <td><strong>${m.pctResiduo || '0%'}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td>TOTAL ZARANDAS</td>
                        <td>${m.total || '0.00'} g</td>
                        <td>100%</td>
                    </tr>
                </tbody>
            </table>

            ${m.observaciones ? `
                <h4 style="color:var(--secondary); margin:1rem 0 0.5rem;">📝 Observaciones</h4>
                <div class="detail-item"><div class="value">${m.observaciones}</div></div>
            ` : ''}
        `;
        document.getElementById('modal-ver-muestra').style.display = 'flex';
    } catch(e) { alert("Error: "+e.message); }
};

// Generar PDF de Muestreo incluyendo los datos completos de Zaranda
window.generarPDFMuestra = () => {
    if (!muestraActualEnModal) return alert("Sin datos de muestra.");
    const m = muestraActualEnModal;
    const jsPDFClass = getJsPDF();
    if (!jsPDFClass) return alert("⚠️ La librería de PDF aún no está disponible. Espera un segundo o recarga la página.");
    const d = new jsPDFClass();

    // Encabezado
    d.setFillColor(44,94,46); 
    d.rect(0,0,210,32,'F');
    d.setTextColor(255,255,255); 
    d.setFont("helvetica", "bold");
    d.setFontSize(20); 
    d.text("Finca Los Robles",105,14,{align:"center"});
    d.setFontSize(13); 
    d.setFont("helvetica", "normal");
    d.text("FICHA DE MUESTREO Y ANÁLISIS DE CAFÉ ORO",105,25,{align:"center"});

    d.setTextColor(0,0,0); 
    d.setFontSize(10); 
    let y = 40;

    // Caja datos generales
    d.setFillColor(245, 245, 220);
    d.rect(14, y - 2, 182, 32, 'F');
    d.setDrawColor(212, 175, 55);
    d.rect(14, y - 2, 182, 32, 'S');

    d.setFont("helvetica", "bold");
    d.setTextColor(44, 94, 46);
    d.text("Nombre: " + (m.nombre || "N/A"), 18, y + 4);
    d.text("Fecha: " + (m.fecha || "N/A"), 110, y + 4);

    d.setFont("helvetica", "normal");
    d.setTextColor(0, 0, 0);
    d.text("Finca: " + (m.finca || "N/A"), 18, y + 12);
    d.text("Altitud: " + (m.altitud || "N/A") + " msnm", 110, y + 12);
    d.text("Variedad: " + (m.variedad || "N/A"), 18, y + 20);
    d.text("Proceso: " + (m.proceso || "N/A"), 110, y + 20);
    d.text("Lote: " + (m.lote || "N/A"), 18, y + 27);
    d.text("Muestra #: " + (m.muestraNum || "N/A"), 110, y + 27);

    y += 38;

    // Resultados físicos y pesos
    d.setFont("helvetica", "bold");
    d.setTextColor(139, 90, 43);
    d.text("PESOS Y MEDICIONES FÍSICAS", 14, y);
    y += 5;

    d.setFillColor(44, 94, 46);
    d.rect(14, y - 4, 182, 7, 'F');
    d.setTextColor(255, 255, 255);
    d.setFontSize(9);
    d.text("Parámetro", 20, y);
    d.text("Valor Obtenido", 120, y);
    y += 7;

    const filasFisicas = [
        ["Peso Pergamino (Inicial)", (m.pesoPerg || "0") + " g"],
        ["Peso Oro (Final)", (m.pesoOro || "0") + " g"],
        ["Rendimiento Pergamino -> Oro", (m.rendimiento || "0%")],
        ["Humedad", (m.humedad || "0") + "%"],
        ["Densidad", (m.densidad || "0") + " g/ml"],
        ["ATW (Peso 1000 granos)", (m.atw || "0") + " g"],
        ["Peso Muestra para Zarandas", (m.muestraZaranda || "0") + " g"],
        ["Defectos / 300g", (m.defectos || "N/A")]
    ];

    d.setTextColor(0, 0, 0);
    d.setFont("helvetica", "normal");
    filasFisicas.forEach(([lbl, val], idx) => {
        if (idx % 2 === 1) {
            d.setFillColor(248, 248, 248);
            d.rect(14, y - 4, 182, 6, 'F');
        }
        if (lbl.includes("Rendimiento")) {
            d.setFont("helvetica", "bold");
            d.setTextColor(44, 94, 46);
        } else {
            d.setFont("helvetica", "normal");
            d.setTextColor(0, 0, 0);
        }
        d.text(lbl, 20, y);
        d.text(String(val), 120, y);
        y += 6;
    });

    y += 6;

    // SECCIÓN DE ANÁLISIS DE ZARANDAS
    d.setFont("helvetica", "bold");
    d.setTextColor(139, 90, 43);
    d.text("ANÁLISIS GRANULOMÉTRICO POR ZARANDAS", 14, y);
    y += 5;

    d.setFillColor(139, 90, 43);
    d.rect(14, y - 4, 182, 7, 'F');
    d.setTextColor(255, 255, 255);
    d.setFontSize(9);
    d.text("Malla / Zaranda", 20, y);
    d.text("Peso en Gramos (g)", 90, y);
    d.text("Porcentaje (%)", 150, y);
    y += 7;

    const filasZarandas = [
        ["Zaranda 18 (18/64\")", (m.z18 || "0.00") + " g", m.pctZ18 || "0%"],
        ["Zaranda 16 (16/64\")", (m.z16 || "0.00") + " g", m.pctZ16 || "0%"],
        ["Zaranda 15 (15/64\")", (m.z15 || "0.00") + " g", m.pctZ15 || "0%"],
        ["Zaranda 14 (14/64\")", (m.z14 || "0.00") + " g", m.pctZ14 || "0%"],
        ["Residuo / Fondo", (m.residuo || "0.00") + " g", m.pctResiduo || "0%"]
    ];

    d.setTextColor(0, 0, 0);
    d.setFont("helvetica", "normal");
    filasZarandas.forEach(([zName, zPeso, zPct], idx) => {
        if (idx % 2 === 1) {
            d.setFillColor(248, 248, 248);
            d.rect(14, y - 4, 182, 6, 'F');
        }
        d.text(zName, 20, y);
        d.text(zPeso, 90, y);
        d.setFont("helvetica", "bold");
        d.text(zPct, 150, y);
        d.setFont("helvetica", "normal");
        y += 6;
    });

    // Fila total zarandas
    d.setFillColor(232, 245, 233);
    d.rect(14, y - 4, 182, 7, 'F');
    d.setFont("helvetica", "bold");
    d.setTextColor(44, 94, 46);
    d.text("TOTAL ZARANDAS", 20, y);
    d.text((m.total || "0.00") + " g", 90, y);
    d.text("100.0%", 150, y);
    y += 10;

    if (m.observaciones) {
        if (y > 260) { d.addPage(); y = 20; }
        d.setFont("helvetica", "bold");
        d.setTextColor(139, 90, 43);
        d.text("Observaciones del Análisis:", 14, y);
        y += 5;
        d.setFont("helvetica", "normal");
        d.setTextColor(0, 0, 0);
        const splitObs = d.splitTextToSize(m.observaciones, 180);
        d.text(splitObs, 14, y);
    }

    d.setFontSize(8);
    d.setTextColor(110, 110, 110);
    d.text("Generado: " + new Date().toLocaleString('es-GT') + "  |  Finca Los Robles - Laboratorio de Control de Calidad  |  v2026.09.11", 105, 290, {align:"center"});
    
    d.save(`Muestra_${m.lote||'Lote'}_${m.fecha||Date.now()}.pdf`);
    alert("✅ PDF de Muestreo descargado con datos de zarandas incluidos.");
};

function getColorBarra(valor) {
    if (valor < 6.5) return '#f44336';
    if (valor < 7) return '#ff5722';
    if (valor < 7.5) return '#ff9800';
    if (valor < 8) return '#ffc107';
    if (valor < 8.5) return '#ffeb3b';
    if (valor < 9) return '#cddc39';
    if (valor < 9.5) return '#8bc34a';
    return '#4caf50';
}

window.calcularCatacion = () => {
    let total = 0;
    SCA_CATEGORIAS.forEach(cat => {
        const el = document.getElementById('c-'+cat.k);
        const v = el ? (parseFloat(el.value) || 0) : 0;
        total += v;
        const bar = document.getElementById('bar-'+cat.k);
        if (bar) {
            const pct = ((v - cat.min) / (10 - cat.min)) * 100;
            bar.style.width = Math.max(5, pct) + '%';
            bar.style.background = getColorBarra(v);
            bar.innerText = v.toFixed(2);
        }
    });
    const defEl = document.getElementById('c-defectos');
    const defectos = defEl ? (parseFloat(defEl.value) || 0) : 0;
    const puntajeFinal = total - defectos;
    const barDef = document.getElementById('bar-defectos');
    if (barDef) {
        barDef.style.width = (defectos * 10) + '%';
        barDef.innerText = defectos > 0 ? '-'+defectos.toFixed(2) : '';
    }
    const totEl = document.getElementById('c-total');
    if (totEl) totEl.innerText = puntajeFinal.toFixed(2);
    const pctTotal = Math.max(0, Math.min(100, ((puntajeFinal - 60) / 40) * 100));
    const fillEl = document.getElementById('sca-total-bar-fill');
    if (fillEl) fillEl.style.width = pctTotal + '%';
    const clasif = document.getElementById('c-clasificacion');
    if (clasif) {
        clasif.className = 'sca-classification';
        if (puntajeFinal >= 90) { clasif.innerText = '🏆 Outstanding - Excepcional'; clasif.classList.add('outstanding'); }
        else if (puntajeFinal >= 85) { clasif.innerText = '⭐ Excellent - Excelente'; clasif.classList.add('excellent'); }
        else if (puntajeFinal >= 80) { clasif.innerText = '✅ Very Good - Specialty'; clasif.classList.add('verygood'); }
        else if (puntajeFinal >= 75) { clasif.innerText = '👍 Good - Bueno'; clasif.classList.add('good'); }
        else { clasif.innerText = '⚠️ Below Specialty'; clasif.classList.add('below'); }
    }
};

window.filtrarCataciones = (filtro, btn) => {
    filtroCatacionesActual = filtro;
    document.querySelectorAll('#catacion-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTablaCataciones();
};

function renderTablaCataciones() {
    const tbody = document.querySelector('#tabla-cataciones tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let catacionesFiltradas = todasLasCataciones;
    if (modoInvitado) {
        catacionesFiltradas = catacionesFiltradas.filter(c => c.data.esInvitado && c.data.invitadoId === invitadoId);
    } else if (filtroCatacionesActual === 'propias') {
        catacionesFiltradas = catacionesFiltradas.filter(c => !c.data.esInvitado);
    } else if (filtroCatacionesActual === 'invitados') {
        catacionesFiltradas = catacionesFiltradas.filter(c => c.data.esInvitado);
    }
    catacionesFiltradas.forEach(c => {
        const d = c.data;
        const docId = c.id;
        const f = d.fecha || (d.fechaRegistro ? (d.fechaRegistro.seconds ? new Date(d.fechaRegistro.seconds*1000).toLocaleDateString() : 'N/A') : 'N/A');
        const colorClas = d.clasificacion==='Outstanding'?'#ffd700':d.clasificacion==='Excellent'?'#4caf50':d.clasificacion==='Very Good'?'#8bc34a':d.clasificacion==='Good'?'#2196f3':'#9e9e9e';
        const autorBadge = d.esInvitado ? '<span class="invitado-badge">👥 Inv.</span>' : '<span style="color:#2e7d32; font-size:0.75rem;">✅ Reg.</span>';
        tbody.innerHTML += `<tr>
            <td>${f}</td>
            <td>${d.nombre||'N/A'}</td>
            <td>${d.variedad||'N/A'}</td>
            <td style="font-weight:bold; color:var(--primary);">${(d.puntajeTotal||0).toFixed(2)}</td>
            <td style="background:${colorClas}; color:white; font-weight:bold;">${d.clasificacion||'N/A'}</td>
            <td>${autorBadge}</td>
            <td style="white-space:nowrap;">
                <button class="btn btn-small btn-view" onclick="verCatacionCompleta('${docId}')">👁️ Ver</button>
                <button class="btn btn-small btn-pdf" onclick="verCatacionCompleta('${docId}'); setTimeout(()=>generarPDFCatacion(),600);">📄 PDF</button>
            </td>
        </tr>`;
    });
}

window.guardarCatacion = async () => {
    const nombre = document.getElementById('c-nombre').value.trim();
    if (!nombre) return alert("Ingresa un nombre.");
    const btn = event.target; btn.disabled = true; btn.innerText = "Guardando...";
    try {
        const data = {
            nombre, fecha: document.getElementById('c-fecha').value,
            variedad: document.getElementById('c-variedad').value,
            proceso: document.getElementById('c-proceso').value,
            origen: document.getElementById('c-origen').value,
            altitud: document.getElementById('c-altitud').value,
            catador: document.getElementById('c-catador').value,
            tostado: document.getElementById('c-tostado').value,
            notas: document.getElementById('c-notas').value,
            defectos: parseFloat(document.getElementById('c-defectos').value) || 0,
            puntajeTotal: parseFloat(document.getElementById('c-total').innerText) || 0,
            fechaRegistro: serverTimestamp()
        };
        SCA_CATEGORIAS.forEach(c => data[c.k] = parseFloat(document.getElementById('c-'+c.k).value) || 0);
        if (data.puntajeTotal >= 90) data.clasificacion = 'Outstanding';
        else if (data.puntajeTotal >= 85) data.clasificacion = 'Excellent';
        else if (data.puntajeTotal >= 80) data.clasificacion = 'Very Good';
        else if (data.puntajeTotal >= 75) data.clasificacion = 'Good';
        else data.clasificacion = 'Below Specialty';
        if (modoInvitado) {
            data.esInvitado = true;
            data.invitadoId = invitadoId;
            data.autorNombre = 'Invitado';
        } else {
            data.esInvitado = false;
            data.autorUid = currentAuthUid;
            data.autorNombre = currentAuthEmail;
        }
        await addDoc(collection(db,"cataciones"), data);
        alert("✅ Ficha de catación guardada.");
        cargarCataciones();
        document.getElementById('c-nombre').value = '';
        document.getElementById('c-catador').value = '';
        document.getElementById('c-notas').value = '';
        SCA_CATEGORIAS.forEach(c => document.getElementById('c-'+c.k).value = c.def);
        document.getElementById('c-defectos').value = '0';
        window.calcularCatacion();
    } catch(e) { alert("Error: "+e.message); }
    finally { btn.disabled = false; btn.innerText = "💾 Guardar Ficha de Catación"; }
};

async function cargarCataciones() {
    try {
        const snap = await getDocs(query(collection(db,"cataciones"), orderBy("fechaRegistro","desc")));
        todasLasCataciones = [];
        snap.forEach(d => todasLasCataciones.push({ id: d.id, data: d.data() }));
        renderTablaCataciones();
    } catch (e) { console.error(e); }
}

window.verCatacionCompleta = async (id) => {
    try {
        const s = await getDoc(doc(db, "cataciones", id));
        if (!s.exists()) return alert("Ficha de catación no encontrada.");
        const c = s.data(); 
        catacionActualEnModal = { id, ...c };

        const modalTitulo = document.getElementById('modal-catacion-titulo');
        if (modalTitulo) modalTitulo.innerText = `☕ ${c.nombre || 'Muestra'} - ${(c.puntajeTotal || 0).toFixed(2)} pts`;

        // Atributos sensoriales SCA
        const atributosSensoriales = [
            { k: 'fragancia', n: 'Fragancia / Aroma', val: c.fragancia || 0 },
            { k: 'sabor', n: 'Sabor', val: c.sabor || 0 },
            { k: 'retrgusto', n: 'Retrogusto', val: c.retrgusto || 0 },
            { k: 'acidez', n: 'Acidez', val: c.acidez || 0 },
            { k: 'cuerpo', n: 'Cuerpo', val: c.cuerpo || 0 },
            { k: 'balance', n: 'Balance', val: c.balance || 0 },
            { k: 'uniformidad', n: 'Uniformidad', val: c.uniformidad || 0 },
            { k: 'limpieza', n: 'Limpieza de Taza', val: c.limpieza || 0 },
            { k: 'dulzura', n: 'Dulzura', val: c.dulzura || 0 },
            { k: 'global', n: 'Apreciación Global', val: c.global || 0 }
        ];

        // Badges circulares de puntuación
        const circulosHTML = atributosSensoriales.map(a => `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:10px 6px; box-shadow:0 1px 3px rgba(0,0,0,0.05); min-width:85px;">
                <div style="width:48px; height:48px; border-radius:50%; background:${getColorBarra(a.val)}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.1rem; box-shadow:0 2px 4px rgba(0,0,0,0.15);">
                    ${a.val.toFixed(2)}
                </div>
                <div style="font-size:0.75rem; font-weight:bold; color:var(--primary); margin-top:6px; text-align:center; line-height:1.1;">${a.n}</div>
            </div>
        `).join('');

        const contenido = `
            <div class="detail-grid" style="margin-bottom:1rem;">
                <div class="detail-item"><div class="label">Muestra / Café</div><div class="value"><strong>${c.nombre || 'N/A'}</strong></div></div>
                <div class="detail-item"><div class="label">Fecha</div><div class="value">${c.fecha || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Variedad</div><div class="value">${c.variedad || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Proceso</div><div class="value">${c.proceso || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Origen / Finca</div><div class="value">${c.origen || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Altitud</div><div class="value">${c.altitud ? c.altitud + ' msnm' : 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Catador</div><div class="value">${c.catador || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Registrado por</div><div class="value">${c.autorNombre || 'N/A'} ${c.esInvitado ? '<span class="invitado-badge">Invitado</span>' : ''}</div></div>
            </div>

            <!-- VISUALIZACIÓN CIRCULAR SENSORIAL SCA (RUEDA DE PERFIL DE TAZA) -->
            <div style="background:#fafafa; border:1px solid #e0d8c3; border-radius:12px; padding:1.25rem; margin:1rem 0;">
                <div style="text-align:center; margin-bottom:1rem;">
                    <h4 style="color:var(--primary); margin:0 0 4px 0; font-size:1.15rem;">🎯 Perfil Sensorial Circular SCA (Rueda de Taza)</h4>
                    <small style="color:#666;">Diagrama radial de evaluación según el protocolo internacional SCA</small>
                </div>

                <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:1.5rem;">
                    <!-- Canvas Circular Radar Chart -->
                    <div style="position:relative; width:340px; height:320px; max-width:100%;">
                        <canvas id="catacionRadarCanvas"></canvas>
                    </div>

                    <!-- Resumen del Puntaje Total -->
                    <div style="flex:1; min-width:240px; max-width:320px;">
                        <div class="sca-total-card" style="margin:0;">
                            <h3 style="color:white; margin-bottom:0.35rem; font-size:1rem; letter-spacing:1px;">PUNTAJE TOTAL SCA</h3>
                            <div class="sca-total-score" style="font-size:2.8rem;">${(c.puntajeTotal || 0).toFixed(2)}</div>
                            <div class="sca-classification ${c.clasificacion==='Outstanding'?'outstanding':c.clasificacion==='Excellent'?'excellent':c.clasificacion==='Very Good'?'verygood':c.clasificacion==='Good'?'good':'below'}">
                                ${c.clasificacion || 'N/A'}
                            </div>
                        </div>

                        <div style="margin-top:10px; background:#fff; border:1px solid #ddd; border-radius:8px; padding:10px; text-align:center;">
                            <span style="font-size:0.85rem; color:#666;">Defectos de Taza: </span>
                            <strong style="color:var(--danger); font-size:1.05rem;">-${(c.defectos || 0).toFixed(2)} pts</strong>
                        </div>
                    </div>
                </div>

                <!-- Círculos de Puntaje por Atributo -->
                <div style="margin-top:1.25rem;">
                    <div style="font-size:0.85rem; font-weight:bold; color:#777; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Atributos Evaluados en Círculo:</div>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(80px, 1fr)); gap:8px;">
                        ${circulosHTML}
                    </div>
                </div>
            </div>

            ${c.notas ? `
                <div style="background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:12px; margin-top:1rem;">
                    <h4 style="color:var(--secondary); margin:0 0 6px 0; font-size:0.95rem;">📝 Notas y Descriptores de Catación:</h4>
                    <p style="margin:0; color:#444; line-height:1.5;">${c.notas}</p>
                </div>
            ` : ''}
        `;

        document.getElementById('modal-catacion-contenido').innerHTML = contenido;
        document.getElementById('modal-ver-catacion').style.display = 'flex';

        // Renderizar el gráfico radial / circular de Chart.js
        setTimeout(() => {
            const canvas = document.getElementById('catacionRadarCanvas');
            if (!canvas) return;
            const ChartClass = getChart();
            if (!ChartClass) return;

            if (chartCatacionCirculoInstance) {
                chartCatacionCirculoInstance.destroy();
                chartCatacionCirculoInstance = null;
            }

            const ctx = canvas.getContext('2d');
            chartCatacionCirculoInstance = new ChartClass(ctx, {
                type: 'radar',
                data: {
                    labels: [
                        'Fragancia',
                        'Sabor',
                        'Retrogusto',
                        'Acidez',
                        'Cuerpo',
                        'Balance',
                        'Uniformidad',
                        'Limpieza',
                        'Dulzura',
                        'Global'
                    ],
                    datasets: [{
                        label: 'Puntaje',
                        data: [
                            c.fragancia || 0,
                            c.sabor || 0,
                            c.retrgusto || 0,
                            c.acidez || 0,
                            c.cuerpo || 0,
                            c.balance || 0,
                            c.uniformidad || 0,
                            c.limpieza || 0,
                            c.dulzura || 0,
                            c.global || 0
                        ],
                        backgroundColor: 'rgba(44, 94, 46, 0.35)',
                        borderColor: '#2C5E2E',
                        pointBackgroundColor: '#D4AF37',
                        pointBorderColor: '#ffffff',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#2C5E2E',
                        pointRadius: 4,
                        borderWidth: 2.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            min: 0,
                            max: 10,
                            ticks: {
                                stepSize: 2,
                                backdropColor: 'transparent',
                                color: '#777',
                                font: { size: 9 }
                            },
                            pointLabels: {
                                font: { size: 10, weight: 'bold' },
                                color: '#2C5E2E'
                            },
                            grid: { color: '#ddd' },
                            angleLines: { color: '#ccc' }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }, 150);

    } catch (e) {
        alert("Error al cargar ficha de catación: " + e.message);
    }
};

window.generarPDFCatacion = () => {
    if (!catacionActualEnModal) return alert("⚠️ No hay datos de catación cargados.");
    const c = catacionActualEnModal;
    
    // Obtener clase jsPDF segura
    const jsPDFClass = getJsPDF();
    if (!jsPDFClass) {
        return alert("⚠️ La librería de PDF se está cargando. Por favor espera un segundo e intenta de nuevo.");
    }
    const d = new jsPDFClass();

    // Encabezado institucional
    d.setFillColor(44, 94, 46);
    d.rect(0, 0, 210, 32, 'F');
    d.setTextColor(255, 255, 255);
    d.setFont("helvetica", "bold");
    d.setFontSize(20);
    d.text("Finca Los Robles", 105, 14, { align: "center" });
    d.setFontSize(13);
    d.setFont("helvetica", "normal");
    d.text("FICHA DE CATACIÓN SCA Y PERFIL SENSORIAL", 105, 25, { align: "center" });

    d.setTextColor(0, 0, 0);
    d.setFontSize(10);
    let y = 38;

    // Caja de datos generales
    d.setFillColor(245, 245, 220);
    d.rect(14, y, 182, 32, 'F');
    d.setDrawColor(212, 175, 55);
    d.rect(14, y, 182, 32, 'S');

    d.setFont("helvetica", "bold");
    d.setTextColor(44, 94, 46);
    d.text("Muestra: " + (c.nombre || "N/A"), 18, y + 6);
    d.text("Fecha: " + (c.fecha || "N/A"), 110, y + 6);

    d.setFont("helvetica", "normal");
    d.setTextColor(0, 0, 0);
    d.text("Variedad: " + (c.variedad || "N/A"), 18, y + 14);
    d.text("Proceso: " + (c.proceso || "N/A"), 110, y + 14);
    d.text("Origen / Finca: " + (c.origen || "N/A"), 18, y + 22);
    d.text("Altitud: " + (c.altitud ? c.altitud + " msnm" : "N/A"), 110, y + 22);
    d.text("Catador: " + (c.catador || "N/A"), 18, y + 29);
    d.text("Registrado por: " + (c.autorNombre || "N/A"), 110, y + 29);

    y += 38;

    // Gráfica Circular Sensorial (Radar) extraída del Canvas
    const canvas = document.getElementById('catacionRadarCanvas');
    if (canvas) {
        try {
            const imgData = canvas.toDataURL('image/png', 1.0);
            d.setFont("helvetica", "bold");
            d.setTextColor(139, 90, 43);
            d.text("RUEDA CIRCULAR DE PERFIL SENSORIAL SCA", 110, y);
            d.addImage(imgData, 'PNG', 105, y + 4, 92, 85);
        } catch (err) {
            console.error("No se pudo añadir gráfico circular al PDF:", err);
        }
    }

    // Tabla de Evaluación SCA en la columna izquierda
    d.setFont("helvetica", "bold");
    d.setTextColor(139, 90, 43);
    d.text("EVALUACIÓN DE ATRIBUTOS SCA", 14, y);
    y += 4;

    d.setFillColor(44, 94, 46);
    d.rect(14, y, 86, 7, 'F');
    d.setTextColor(255, 255, 255);
    d.setFontSize(9);
    d.text("Atributo", 18, y + 5);
    d.text("Puntaje", 82, y + 5);
    y += 7;

    d.setTextColor(0, 0, 0);
    d.setFont("helvetica", "normal");
    
    SCA_CATEGORIAS.forEach((cat, idx) => {
        if (idx % 2 === 1) {
            d.setFillColor(248, 248, 248);
            d.rect(14, y, 86, 6, 'F');
        }
        d.text(cat.n.substring(3), 18, y + 4.5);
        d.setFont("helvetica", "bold");
        d.text((c[cat.k] || 0).toFixed(2), 85, y + 4.5);
        d.setFont("helvetica", "normal");
        y += 6;
    });

    // Fila defectos
    d.setFillColor(255, 235, 238);
    d.rect(14, y, 86, 6, 'F');
    d.setFont("helvetica", "bold");
    d.setTextColor(211, 47, 47);
    d.text("Defectos", 18, y + 4.5);
    d.text("-" + (c.defectos || 0).toFixed(2), 85, y + 4.5);
    y += 12;

    // Caja de Puntaje Total y Clasificación
    y = Math.max(y, 136);
    d.setFillColor(44, 94, 46);
    d.rect(14, y, 182, 22, 'F');
    d.setTextColor(255, 255, 255);
    d.setFontSize(13);
    d.setFont("helvetica", "bold");
    d.text("PUNTAJE TOTAL SCA:", 24, y + 10);
    d.setTextColor(212, 175, 55);
    d.setFontSize(22);
    d.text((c.puntajeTotal || 0).toFixed(2), 95, y + 15);

    d.setFillColor(212, 175, 55);
    d.rect(125, y + 4, 65, 14, 'F');
    d.setTextColor(44, 94, 46);
    d.setFontSize(11);
    d.text(c.clasificacion || "N/A", 157, y + 13, { align: "center" });

    y += 28;

    // Notas de catación
    if (c.notas) {
        d.setFont("helvetica", "bold");
        d.setTextColor(139, 90, 43);
        d.setFontSize(10);
        d.text("Notas y Descriptores del Catador:", 14, y);
        y += 5;
        d.setFont("helvetica", "normal");
        d.setTextColor(0, 0, 0);
        const splitNotes = d.splitTextToSize(c.notas, 182);
        d.text(splitNotes, 14, y);
    }

    // Pie de página
    d.setFontSize(8);
    d.setTextColor(110, 110, 110);
    d.text("Generado: " + new Date().toLocaleString('es-GT') + "  |  Finca Los Robles - Laboratorio de Control de Calidad  |  v2026.09.11", 105, 290, { align: "center" });

    d.save(`Catacion_${(c.nombre || 'Muestra').replace(/\s+/g, '_')}_${c.fecha || Date.now()}.pdf`);
    alert("✅ Ficha de catación en PDF descargada exitosamente.");
};

// --- GESTIÓN DE METAS Y ESTADÍSTICAS MENSUALES DEL DASHBOARD ---

function extraerFechaVenta(d) {
    if (!d) return null;
    if (d.fecha && typeof d.fecha.toDate === 'function') {
        return d.fecha.toDate();
    }
    if (d.fecha && typeof d.fecha.seconds === 'number') {
        return new Date(d.fecha.seconds * 1000);
    }
    if (d.fechaVentaPersonalizada && typeof d.fechaVentaPersonalizada === 'string' && d.fechaVentaPersonalizada.trim()) {
        const dt = new Date(d.fechaVentaPersonalizada + 'T12:00:00');
        if (!isNaN(dt.getTime())) return dt;
    }
    if (typeof d.fecha === 'string' && d.fecha.trim()) {
        const dt = new Date(d.fecha);
        if (!isNaN(dt.getTime())) return dt;
    }
    if (d.fechaRegistro && typeof d.fechaRegistro.toDate === 'function') {
        return d.fechaRegistro.toDate();
    }
    if (d.fechaRegistro && typeof d.fechaRegistro.seconds === 'number') {
        return new Date(d.fechaRegistro.seconds * 1000);
    }
    return null;
}

window.configurarMetaMensual = () => {
    const valor = prompt("🎯 Ingresa el monto de la Meta Mensual de Ventas (en Quetzales Q):", metaMensualActual);
    if (valor !== null) {
        const num = parseFloat(valor);
        if (isNaN(num) || num <= 0) {
            return alert("⚠️ Por favor ingresa un número válido mayor a 0.");
        }
        metaMensualActual = num;
        localStorage.setItem('flr_meta_mensual', metaMensualActual);
        actualizarDashboardMetas();
        actualizarGraficasDashboard();
    }
};

window.actualizarDashboardMetas = function() {
    const ahora = new Date();
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    const mesNomEl = document.getElementById('dash-mes-actual-nombre');
    if (mesNomEl) mesNomEl.innerText = `${mesesNombres[mesActual]} ${anioActual}`;

    let ventasMesActualPagadas = 0;
    let ventasMesActualPendientes = 0;

    todasLasVentas.forEach(v => {
        const d = v.data;
        const fechaVenta = extraerFechaVenta(d) || ahora;
        if (fechaVenta && fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual) {
            const monto = d.total !== undefined ? Number(d.total) : (Number(d.cantidad || 0) * Number(d.precio || 0));
            if (d.estadoPago === 'pagado') {
                ventasMesActualPagadas += monto;
            } else {
                ventasMesActualPendientes += monto;
            }
        }
    });

    const metaActualEl = document.getElementById('dash-meta-actual-monto') || document.getElementById('dash-meta-mes');
    if (metaActualEl) metaActualEl.innerText = 'Q ' + metaMensualActual.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const pct = metaMensualActual > 0 ? (ventasMesActualPagadas / metaMensualActual) * 100 : 0;
    
    const alcanzadoLbl = document.getElementById('dash-meta-alcanzado-lbl') || document.getElementById('dash-progreso-meta');
    if (alcanzadoLbl) alcanzadoLbl.innerText = `${pct.toFixed(1)}%`;

    const barFill = document.getElementById('dash-meta-bar-fill') || document.getElementById('meta-progreso-fill');
    if (barFill) barFill.style.width = Math.min(100, Math.max(0, pct)) + '%';

    const recaudadoEl = document.getElementById('dash-meta-recaudado');
    if (recaudadoEl) recaudadoEl.innerText = `Cobrado: Q ${ventasMesActualPagadas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const restanteEl = document.getElementById('dash-meta-restante');
    if (restanteEl) {
        const restante = metaMensualActual - ventasMesActualPagadas;
        if (restante > 0) {
            restanteEl.innerText = `Faltan: Q ${restante.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            restanteEl.innerHTML = `<span style="color:#ffe082; font-weight:bold;">🎉 ¡Meta superada (+Q ${Math.abs(restante).toFixed(2)})!</span>`;
        }
    }

    const txtEl = document.getElementById('meta-progreso-texto');
    if (txtEl) {
        const restante = Math.max(0, metaMensualActual - ventasMesActualPagadas);
        txtEl.innerHTML = `Ventas del mes actual: <strong>Q ${ventasMesActualPagadas.toFixed(2)}</strong> de <strong>Q ${metaMensualActual.toFixed(2)}</strong> (${pct.toFixed(1)}%). ${restante > 0 ? `Faltan Q ${restante.toFixed(2)} para alcanzar la meta.` : '🎉 ¡Meta mensual alcanzada y superada!'}`;
    }
};

window.actualizarGraficasDashboard = function() {
    const canvas = document.getElementById('chartVentasMeses') || document.getElementById('chart-ventas-meses');
    if (!canvas) return;
    const ChartClass = getChart();
    if (!ChartClass) {
        setTimeout(actualizarGraficasDashboard, 300);
        return;
    }

    const filtroAno = document.getElementById('dash-filtro-ano')?.value || '2026';
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const labels = [];
    const dataPagados = [];
    const dataPendientes = [];
    const dataMeta = [];

    const ahora = new Date();

    if (filtroAno === '2026' || filtroAno === '2025') {
        const yyyy = parseInt(filtroAno);
        for (let m = 0; m < 12; m++) {
            labels.push(`${mesesNombres[m]} ${yyyy}`);
            dataPagados.push(0);
            dataPendientes.push(0);
            dataMeta.push(metaMensualActual);
        }

        todasLasVentas.forEach(v => {
            const d = v.data;
            const f = extraerFechaVenta(d) || ahora;
            if (f.getFullYear() === yyyy) {
                const m = f.getMonth();
                const monto = d.total !== undefined ? Number(d.total) : (Number(d.cantidad || 0) * Number(d.precio || 0));
                if (d.estadoPago === 'pendiente') {
                    dataPendientes[m] += monto;
                } else {
                    dataPagados[m] += monto;
                }
            }
        });
    } else {
        // 'todos' los años: Agrupar por mes-año
        const buckets = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            buckets[key] = { label: `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`, pagado: 0, pendiente: 0 };
        }

        todasLasVentas.forEach(v => {
            const d = v.data;
            const f = extraerFechaVenta(d) || ahora;
            const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
            const monto = d.total !== undefined ? Number(d.total) : (Number(d.cantidad || 0) * Number(d.precio || 0));
            if (!buckets[key]) {
                buckets[key] = { label: `${mesesNombres[f.getMonth()]} ${f.getFullYear()}`, pagado: 0, pendiente: 0 };
            }
            if (d.estadoPago === 'pendiente') {
                buckets[key].pendiente += monto;
            } else {
                buckets[key].pagado += monto;
            }
        });

        const sortedKeys = Object.keys(buckets).sort();
        sortedKeys.forEach(k => {
            labels.push(buckets[k].label);
            dataPagados.push(buckets[k].pagado);
            dataPendientes.push(buckets[k].pendiente);
            dataMeta.push(metaMensualActual);
        });
    }

    if (chartVentasMesesInstance) {
        chartVentasMesesInstance.destroy();
        chartVentasMesesInstance = null;
    }

    // Plugin para mostrar los valores en Quetzales sobre cada barra
    const pluginValoresBarras = {
        id: 'pluginValoresBarrasVentas',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
                if (dataset.type === 'line') return;
                const meta = chart.getDatasetMeta(i);
                if (!meta || meta.hidden) return;
                meta.data.forEach((bar, index) => {
                    const val = dataset.data[index];
                    if (val && val > 0) {
                        ctx.save();
                        ctx.fillStyle = dataset.label.includes('Pagadas') ? '#1e4220' : '#8B5A2B';
                        ctx.font = 'bold 9px Segoe UI, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        const txt = val >= 1000 ? `Q${(val / 1000).toFixed(1)}k` : `Q${val.toFixed(0)}`;
                        ctx.fillText(txt, bar.x, bar.y - 2);
                        ctx.restore();
                    }
                });
            });
        }
    };

    chartVentasMesesInstance = new ChartClass(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ventas Pagadas (Q)',
                    data: dataPagados,
                    backgroundColor: 'rgba(44, 94, 46, 0.85)',
                    borderColor: '#1E3F20',
                    borderWidth: 1.5,
                    borderRadius: 4
                },
                {
                    label: 'Ventas Pendientes (Q)',
                    data: dataPendientes,
                    backgroundColor: 'rgba(212, 175, 55, 0.85)',
                    borderColor: '#B8860B',
                    borderWidth: 1.5,
                    borderRadius: 4
                },
                {
                    type: 'line',
                    label: 'Meta Mensual (Q)',
                    data: dataMeta,
                    borderColor: '#E65100',
                    backgroundColor: '#E65100',
                    borderWidth: 2,
                    borderDash: [5, 4],
                    pointRadius: 3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10, weight: 'bold' } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => 'Q ' + Number(val).toLocaleString('es-GT')
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: Q ${Number(ctx.parsed.y).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
                    }
                },
                legend: { position: 'top' }
            }
        },
        plugins: [pluginValoresBarras]
    });

    // Actualizar banner de resumen de ventas mensuales
    const resumenEl = document.getElementById('resumen-ventas-meses-bar');
    if (resumenEl) {
        let totalPeriodoPagado = dataPagados.reduce((a, b) => a + b, 0);
        let totalPeriodoPendiente = dataPendientes.reduce((a, b) => a + b, 0);
        let maxIdx = 0;
        let maxVal = -1;
        dataPagados.forEach((val, idx) => {
            const totMes = val + dataPendientes[idx];
            if (totMes > maxVal) {
                maxVal = totMes;
                maxIdx = idx;
            }
        });
        const mejorMes = labels[maxIdx] || 'N/A';

        resumenEl.innerHTML = `
            <div>💰 <strong>Total Facturado:</strong> Q ${(totalPeriodoPagado + totalPeriodoPendiente).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</div>
            <div>✅ <strong>Cobrado:</strong> <span style="color:var(--primary); font-weight:bold;">Q ${totalPeriodoPagado.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span></div>
            <div>⏳ <strong>Pendiente:</strong> <span style="color:var(--warning); font-weight:bold;">Q ${totalPeriodoPendiente.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span></div>
            <div>🌟 <strong>Mes récord:</strong> ${mejorMes} (Q ${maxVal > 0 ? maxVal.toLocaleString('es-GT', { minimumFractionDigits: 2 }) : '0.00'})</div>
        `;
    }
};

window.actualizarTopProductosDashboard = function() {
    const filtro = document.getElementById('dash-filtro-periodo-top')?.value || 'ano_actual';
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    // Filtrar ventas según el periodo seleccionado
    let ventasFiltradas = todasLasVentas.filter(v => {
        const d = v.data;
        const f = extraerFechaVenta(d) || ahora;
        if (filtro === 'mes_actual') {
            return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        }
        if (filtro === 'ano_actual') {
            return f.getFullYear() === anioActual;
        }
        return true; // 'historico'
    });

    const prodStats = {};
    let granTotalVentas = 0;

    ventasFiltradas.forEach(v => {
        const d = v.data;
        if (d.items && Array.isArray(d.items) && d.items.length > 0) {
            d.items.forEach(it => {
                let nombre = it.nombre || it.tipo || 'Producto';
                if (it.presentacion && it.presentacion !== '-' && !nombre.toLowerCase().includes(it.presentacion.toLowerCase())) {
                    nombre += ` (${it.presentacion})`;
                }
                const unidad = it.unidad || (preciosListaActual[it.tipo] ? preciosListaActual[it.tipo].unidad : 'un.');
                const cant = parseFloat(it.cantidad) || 0;
                const sub = it.subtotal !== undefined ? Number(it.subtotal) : (cant * Number(it.precio || 0));

                if (!prodStats[nombre]) {
                    prodStats[nombre] = { nombre, cantidad: 0, unidad, totalQ: 0 };
                }
                prodStats[nombre].cantidad += cant;
                prodStats[nombre].totalQ += sub;
                granTotalVentas += sub;
            });
        } else {
            let nombre = preciosListaActual[d.tipo] ? preciosListaActual[d.tipo].nombre : (d.tipo || 'Café');
            if (d.presentacion && d.presentacion !== '-' && !nombre.toLowerCase().includes(d.presentacion.toLowerCase())) {
                nombre += ` (${d.presentacion})`;
            }
            const unidad = preciosListaActual[d.tipo] ? preciosListaActual[d.tipo].unidad : 'un.';
            const cant = parseFloat(d.cantidad) || 0;
            const sub = d.total !== undefined ? Number(d.total) : (cant * Number(d.precio || 0));

            if (!prodStats[nombre]) {
                prodStats[nombre] = { nombre, cantidad: 0, unidad, totalQ: 0 };
            }
            prodStats[nombre].cantidad += cant;
            prodStats[nombre].totalQ += sub;
            granTotalVentas += sub;
        }
    });

    const listaOrdenada = Object.values(prodStats).sort((a, b) => b.totalQ - a.totalQ);

    const tbody = document.querySelector('#tabla-ranking-productos tbody') || document.querySelector('#tabla-top-productos tbody');
    if (tbody) {
        if (listaOrdenada.length === 0) {
            const periodoTxt = filtro === 'mes_actual' ? 'este mes' : (filtro === 'ano_actual' ? 'este año' : 'el historial');
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#666;">
                No hay ventas registradas en ${periodoTxt}.
                ${todasLasVentas.length > 0 ? '<br><small style="color:#888;">(Selecciona <strong>"Todo el Histórico"</strong> o <strong>"Todo el Año Actual"</strong> arriba para ver ventas)</small>' : ''}
            </td></tr>`;
        } else {
            tbody.innerHTML = listaOrdenada.map((p, idx) => {
                const pct = granTotalVentas > 0 ? (p.totalQ / granTotalVentas) * 100 : 0;
                const posBadge = idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`;
                return `<tr>
                    <td style="font-weight:bold; text-align:center;">
                        <span class="ranking-rank ${idx === 0 ? 'gold' : ''}">${posBadge}</span>
                    </td>
                    <td><strong style="color:#2C5E2E;">${p.nombre}</strong></td>
                    <td style="text-align:right; font-weight:600;">${p.cantidad.toLocaleString('es-GT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${p.unidad}</td>
                    <td style="text-align:right; font-weight:bold; color:var(--primary); font-size:0.95rem;">Q ${p.totalQ.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style="text-align:left; min-width:140px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="flex:1; background:#e2e8e2; height:12px; border-radius:6px; overflow:hidden;">
                                <div style="background:linear-gradient(90deg, #2C5E2E 0%, #D4AF37 100%); height:100%; width:${Math.min(100, Math.max(2, pct))}%; border-radius:6px;"></div>
                            </div>
                            <span style="font-weight:bold; font-size:0.8rem; min-width:42px; text-align:right;">${pct.toFixed(1)}%</span>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }
    }

    const canvas = document.getElementById('chartTopProductos') || document.getElementById('chart-top-productos');
    if (!canvas) return;
    const ChartClass = getChart();
    if (!ChartClass) {
        setTimeout(actualizarTopProductosDashboard, 300);
        return;
    }

    if (chartTopProductosInstance) {
        chartTopProductosInstance.destroy();
        chartTopProductosInstance = null;
    }

    if (listaOrdenada.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // Mostrar los 7 productos más vendidos en barras horizontales acompañadas de su valor exacto
    const topItems = listaOrdenada.slice(0, 7);
    const labels = topItems.map(p => p.nombre.length > 20 ? p.nombre.substring(0, 18) + '...' : p.nombre);
    const fullNames = topItems.map(p => p.nombre);
    const dataValores = topItems.map(p => p.totalQ);
    const dataCantidades = topItems.map(p => `${p.cantidad.toFixed(1)} ${p.unidad}`);

    const paletaColores = [
        'rgba(44, 94, 46, 0.9)',
        'rgba(212, 175, 55, 0.9)',
        'rgba(139, 90, 43, 0.9)',
        'rgba(62, 120, 65, 0.9)',
        'rgba(194, 149, 50, 0.9)',
        'rgba(160, 106, 59, 0.9)',
        'rgba(92, 141, 137, 0.9)'
    ];

    const pluginValoresBarrasHorizontales = {
        id: 'pluginValoresBarrasHorizontales',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            if (!meta || meta.hidden) return;
            meta.data.forEach((bar, index) => {
                const val = chart.data.datasets[0].data[index];
                if (val !== undefined && val !== null) {
                    ctx.save();
                    ctx.fillStyle = '#1e4220';
                    ctx.font = 'bold 11px Segoe UI, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const txt = ` Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    ctx.fillText(txt, bar.x + 4, bar.y);
                    ctx.restore();
                }
            });
        }
    };

    chartTopProductosInstance = new ChartClass(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Vendido (Q)',
                data: dataValores,
                backgroundColor: paletaColores.slice(0, topItems.length),
                borderColor: '#ffffff',
                borderWidth: 1.5,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { right: 85 } // Margen para que el texto de valor Q no se corte
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => 'Q ' + Number(val).toLocaleString('es-GT')
                    },
                    grid: { color: '#f0f0f0' }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 10, weight: 'bold' }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx => fullNames[ctx[0].dataIndex] || ctx[0].label,
                        label: ctx => {
                            const val = ctx.parsed.x;
                            const pct = granTotalVentas > 0 ? ((val / granTotalVentas) * 100).toFixed(1) : 0;
                            const cant = dataCantidades[ctx.dataIndex];
                            return [
                                `Total: Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2 })} (${pct}% del total)`,
                                `Cantidad: ${cant}`
                            ];
                        }
                    }
                }
            }
        },
        plugins: [pluginValoresBarrasHorizontales]
    });
};

function renderDashMiniCard(label, value, unidad) {
    const isEmpty = value === 0;
    return `<div class="dash-mini-card ${isEmpty?'empty':''}">
        <div class="label">${label}</div>
        <div class="value">${value.toFixed(1)} ${unidad}</div>
    </div>`;
}

async function cargarDatosIniciales() {
    try {
        let sv;
        try {
            sv = await getDocs(query(collection(db,"ventas"), orderBy("fecha","desc")));
        } catch(e) {
            sv = await getDocs(collection(db,"ventas"));
        }
        if (!sv || sv.empty) {
            sv = await getDocs(collection(db,"ventas"));
        }

        todasLasVentas = [];
        let totalVentasPagadas = 0;
        let totalVentasPendientes = 0;
        let countVentasPagadas = 0;
        let countVentasPendientes = 0;
        const promesasMigracion = [];
        
        for (const d of sv.docs) {
            const v = d.data();
            // Migrar 'transferencia' previa a 'pagado'
            if (!v.estadoPago || v.estadoPago === 'transferencia') {
                const estadoDerivado = (v.pago === 'Pendiente') ? 'pendiente' : 'pagado';
                v.estadoPago = estadoDerivado;
                promesasMigracion.push(updateDoc(doc(db, "ventas", d.id), { estadoPago: estadoDerivado }));
            }
            todasLasVentas.push({ id: d.id, data: v });
            
            const montoVenta = v.total !== undefined ? Number(v.total) : (Number(v.cantidad || 0) * Number(v.precio || 0));
            if (v.estadoPago === 'pagado') {
                totalVentasPagadas += montoVenta;
                countVentasPagadas++;
            } else {
                totalVentasPendientes += montoVenta;
                countVentasPendientes++;
            }
        }
        
        if (promesasMigracion.length > 0) {
            await Promise.all(promesasMigracion);
            console.log(`✅ Migradas ${promesasMigracion.length} ventas antiguas a estados vigentes.`);
        }
        
        // Actualizar KPIs de ventas principales
        const dashVentasEl = document.getElementById('dash-ventas');
        if (dashVentasEl) dashVentasEl.innerText = "Q " + totalVentasPagadas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        const subVentas = document.getElementById('dash-ventas-sub');
        if (subVentas) subVentas.innerText = `${countVentasPagadas} venta(s) cobrada(s)`;

        const dashPendientesEl = document.getElementById('dash-ventas-pendientes');
        if (dashPendientesEl) dashPendientesEl.innerText = "Q " + totalVentasPendientes.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const subPend = document.getElementById('dash-ventas-pend-sub');
        if (subPend) subPend.innerText = `${countVentasPendientes} venta(s) pendiente(s)`;

        // Actualizar metas y gráficos mensuales
        actualizarDashboardMetas();
        actualizarGraficasDashboard();
        actualizarTopProductosDashboard();

        renderTablaVentas();
        await cargarClientes();
        await cargarPedidos();

        const si = await getDocs(collection(db,"inventario"));
        const ti = document.querySelector('#tabla-inventario tbody'); 
        if (ti) ti.innerHTML = '';
        const grupos = {
            'Tostado-Entero': 0, 'Tostado-Molido': 0,
            'Oro': 0, 'Pergamino': 0,
            'Miel-Botella': 0, 'Miel-Galon': 0,
            'Licor-Botella': 0, 'Licor-Litro': 0, 'Licor-Galon': 0
        };
        si.forEach(d => {
            const v=d.data();
            const key = v.estado === 'Tostado' ? `Tostado-${v.presentacion||'Entero'}` : v.estado;
            if (grupos[key] !== undefined) grupos[key] += v.cantidad;
            
            const f=v.fecha?new Date(v.fecha.seconds*1000).toLocaleDateString():'N/A';
            const nombreProd = preciosListaActual[v.estado] ? preciosListaActual[v.estado].nombre : v.estado;
            const presentacion = v.estado === 'Tostado' ? (v.presentacion || 'N/A') : '-';
            const variedad = ['Pergamino','Oro','Tostado'].includes(v.estado) ? (v.variedad || 'N/A') : '-';
            const proceso = ['Pergamino','Oro','Tostado'].includes(v.estado) ? (v.proceso || 'N/A') : '-';
            const fechaTostado = v.estado === 'Tostado' ? (v.fechaTostado || 'N/A') : '-';
            const unidad = preciosListaActual[v.estado] ? preciosListaActual[v.estado].unidad : '';
            
            if (ti) {
                ti.innerHTML += `<tr>
                    <td>${f}</td>
                    <td>${nombreProd}</td>
                    <td>${presentacion}</td>
                    <td>${variedad}</td>
                    <td>${proceso}</td>
                    <td>${fechaTostado}</td>
                    <td><strong>${v.cantidad.toFixed(1)}</strong> ${unidad}</td>
                    <td class="actions-cell">
                        <button class="btn btn-xs btn-edit" onclick="editarInventario('${d.id}')">✏️</button>
                        <button class="btn btn-xs btn-danger" onclick="eliminarInventario('${d.id}')">🗑️</button>
                    </td>
                </tr>`;
            }
        });
        
        const cafeGrid = document.getElementById('dash-cafe-grid');
        if (cafeGrid) {
            cafeGrid.innerHTML = 
                renderDashMiniCard('☕ Tostado Entero', grupos['Tostado-Entero'], 'lb') +
                renderDashMiniCard('☕ Tostado Molido', grupos['Tostado-Molido'], 'lb') +
                renderDashMiniCard('🌱 Café Oro', grupos['Oro'], 'lb') +
                renderDashMiniCard('🌾 Café Pergamino', grupos['Pergamino'], 'lb');
        }
        const mielGrid = document.getElementById('dash-miel-grid');
        if (mielGrid) {
            mielGrid.innerHTML = 
                renderDashMiniCard('🍯 Miel Botella', grupos['Miel-Botella'], 'u.') +
                renderDashMiniCard('🍯 Miel Galón', grupos['Miel-Galon'], 'u.');
        }
        const licorGrid = document.getElementById('dash-licor-grid');
        if (licorGrid) {
            licorGrid.innerHTML = 
                renderDashMiniCard('🍷 Licor Botella', grupos['Licor-Botella'], 'u.') +
                renderDashMiniCard('🍷 Licor Litro', grupos['Licor-Litro'], 'u.') +
                renderDashMiniCard('🍷 Licor Galón', grupos['Licor-Galon'], 'u.');
        }

        const sc = await getDocs(query(collection(db,"costosTostado"),orderBy("fechaRegistro","desc")));
        const tc2 = document.querySelector('#tabla-costos tbody'); 
        if (tc2) {
            tc2.innerHTML='';
            sc.forEach(d => { 
                const c=d.data(); 
                const f=c.fechaTostado||(c.fechaRegistro?new Date(c.fechaRegistro.seconds*1000).toLocaleDateString():'N/A'); 
                tc2.innerHTML+=`<tr><td>${f}</td><td>${c.lote}</td><td>${c.variedad}</td><td>${c.proceso}</td><td>Q${(c.costoTotal||0).toFixed(2)}</td><td>Q${(c.precioSugerido||0).toFixed(2)}</td><td><button class="btn btn-small btn-view" onclick="verCostoDetalle('${d.id}')">👁️ Ver</button></td></tr>`; 
            });
        }

        await cargarCataciones();
        await cargarTostados();

        const sm = await getDocs(query(collection(db,"muestreos"),orderBy("fechaRegistro","desc")));
        const tm = document.querySelector('#tabla-muestreos tbody'); 
        if (tm) {
            tm.innerHTML='';
            sm.forEach(d => { 
                const m=d.data(); 
                const f=m.fecha||(m.fechaRegistro?new Date(m.fechaRegistro.seconds*1000).toLocaleDateString():'N/A'); 
                tm.innerHTML+=`<tr><td>${f}</td><td>${m.nombre||'N/A'}</td><td>${m.lote||'N/A'}</td><td>${m.rendimiento||'0%'}</td><td>${m.humedad||'0'}%</td><td style="white-space:nowrap;"><button class="btn btn-small btn-view" onclick="verMuestraCompleta('${d.id}')">👁️ Ver</button><button class="btn btn-small btn-pdf" onclick="verMuestraCompleta('${d.id}'); setTimeout(()=>generarPDFMuestra(),600);">📄 PDF</button></td></tr>`; 
            });
        }
    } catch(e) { console.error("Error cargando datos:", e); }
}

// =========================================================================
// --- CONTROL DE PEDIDOS Y ENTREGAS PENDIENTES (v2026.09.11) ---
// =========================================================================

function generarNuevoFolioPedido() {
    const yyyy = new Date().getFullYear();
    const count = todosLosPedidos.length + 1;
    const numPad = String(count).padStart(3, '0');
    return `PED-${yyyy}-${numPad}`;
}

async function cargarPedidos() {
    try {
        let snap;
        try {
            snap = await getDocs(query(collection(db, "pedidos"), orderBy("fechaCreacion", "desc")));
        } catch (e) {
            snap = await getDocs(collection(db, "pedidos"));
        }
        todosLosPedidos = [];
        snap.forEach(d => {
            todosLosPedidos.push({ id: d.id, data: d.data() });
        });

        // Ordenar en memoria: pendientes de entrega primero (por fecha de entrega), luego entregados
        todosLosPedidos.sort((a, b) => {
            const estA = a.data.estado === 'pendiente_entrega' ? 0 : 1;
            const estB = b.data.estado === 'pendiente_entrega' ? 0 : 1;
            if (estA !== estB) return estA - estB;
            const fA = a.data.fechaEntregaCompromiso || '';
            const fB = b.data.fechaEntregaCompromiso || '';
            if (fA && fB) return fA.localeCompare(fB);
            return 0;
        });

        renderTablaPedidos();
        actualizarKPIsPedidos();
        actualizarBannerPedidosVentas();
    } catch (e) {
        console.error("Error al cargar pedidos:", e);
    }
}
window.cargarPedidos = cargarPedidos;

window.toggleFormPedido = () => {
    const cont = document.getElementById('contenedor-form-pedido');
    const lbl = document.getElementById('btn-toggle-pedido-lbl');
    if (!cont) return;
    const isHidden = cont.style.display === 'none' || !cont.style.display;
    cont.style.display = isHidden ? 'block' : 'none';
    if (lbl) lbl.innerText = isHidden ? 'Ocultar Formulario' : 'Crear Nuevo Pedido';
    if (isHidden) {
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        const fInput = document.getElementById('ped-fecha-entrega');
        if (fInput && !fInput.value) {
            fInput.value = manana.toISOString().split('T')[0];
        }
        window.onPedidoProdTipoChange();
    }
};

window.onPedidoProdTipoChange = () => {
    const tipo = document.getElementById('ped-prod-tipo').value;
    const isTostado = tipo === 'Tostado';
    const presGroup = document.getElementById('ped-prod-presentacion-group');
    if (presGroup) presGroup.style.display = isTostado ? 'flex' : 'none';

    const p = preciosListaActual[tipo];
    const lbl = document.getElementById('ped-prod-unidad-lbl');
    if (lbl && p) lbl.innerText = p.unidad;
    const precioInp = document.getElementById('ped-prod-precio');
    if (precioInp && p) precioInp.value = p.precio;
};

window.onClienteSeleccionadoPedido = () => {
    const sel = document.getElementById('ped-cliente-id');
    const badge = document.getElementById('ped-cliente-badge-info');
    const dirInput = document.getElementById('ped-direccion');
    if (!sel || !badge) return;
    const cid = sel.value;
    if (!cid) {
        badge.style.display = 'none';
        badge.innerHTML = '';
        return;
    }
    const c = todosLosClientes.find(item => item.id === cid);
    if (!c) return;
    const d = c.data;
    if (dirInput && !dirInput.value && d.direccion) {
        dirInput.value = d.direccion;
    }
    badge.style.display = 'block';
    badge.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div>
                <strong>👤 ${d.nombre}</strong> &bull; ${d.tipo || 'Consumidor Final'} &bull; NIT: ${d.nit || 'CF'}
                ${d.telefono ? `<br><small>📞 Tel: ${d.telefono}</small>` : ''}
                ${d.direccion ? `<br><small>📍 Dirección: ${d.direccion}</small>` : ''}
            </div>
            <button type="button" class="btn btn-xs btn-primary" onclick="window.verHistorialCliente('${cid}')" style="width:auto; min-height:26px; padding:3px 8px; font-size:0.75rem;">📜 Ficha Cliente</button>
        </div>
    `;
};

window.agregarItemAlCarritoPedido = () => {
    const tipo = document.getElementById('ped-prod-tipo').value;
    const isTostado = tipo === 'Tostado';
    const presentacion = isTostado ? document.getElementById('ped-prod-presentacion').value : 'N/A';
    const cantidad = parseFloat(document.getElementById('ped-prod-cantidad').value) || 0;
    const precio = parseFloat(document.getElementById('ped-prod-precio').value) || 0;

    if (cantidad <= 0) return alert("⚠️ La cantidad solicitada debe ser mayor a 0.");
    if (precio < 0) return alert("⚠️ El precio no puede ser negativo.");

    const pInfo = preciosListaActual[tipo] || { nombre: tipo, unidad: 'un.' };
    const nombre = pInfo.nombre;
    const unidad = pInfo.unidad;
    const subtotal = cantidad * precio;

    carritoPedido.push({
        idTemporal: 'pit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        tipo,
        nombre,
        presentacion,
        cantidad,
        unidad,
        precio,
        subtotal
    });

    document.getElementById('ped-prod-cantidad').value = '';
    window.renderCarritoPedido();
};

window.renderCarritoPedido = () => {
    const tbody = document.getElementById('carrito-pedidos-body');
    const totalDisplay = document.getElementById('ped-total-display');
    const resumenLbl = document.getElementById('ped-items-resumen-lbl');
    if (!tbody) return;

    if (carritoPedido.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:1.25rem; color:#888;">
                    🛒 No has agregado productos a este pedido. Selecciona arriba y haz clic en <strong>"➕ Agregar al Pedido"</strong>.
                </td>
            </tr>
        `;
        if (totalDisplay) totalDisplay.innerText = 'Q 0.00';
        if (resumenLbl) resumenLbl.innerText = '0 productos en este pedido';
        return;
    }

    let total = 0;
    let totalCant = 0;
    tbody.innerHTML = carritoPedido.map((item, idx) => {
        total += item.subtotal;
        totalCant += item.cantidad;
        return `
            <tr>
                <td style="text-align:center; font-weight:bold; color:#777;">${idx + 1}</td>
                <td><strong>${item.nombre}</strong></td>
                <td>${item.presentacion !== 'N/A' ? `<span class="cart-badge">${item.presentacion}</span>` : '-'}</td>
                <td style="text-align:center; font-weight:bold;">${item.cantidad} ${item.unidad}</td>
                <td style="text-align:right;">Q ${item.precio.toFixed(2)}</td>
                <td style="text-align:right; font-weight:bold; color:#b78103;">Q ${item.subtotal.toFixed(2)}</td>
                <td style="text-align:center;">
                    <button type="button" onclick="eliminarItemCarritoPedido(${idx})" class="cart-remove-btn" title="Quitar ítem">✕</button>
                </td>
            </tr>
        `;
    }).join('');

    if (totalDisplay) totalDisplay.innerText = `Q ${total.toFixed(2)}`;
    if (resumenLbl) resumenLbl.innerText = `${carritoPedido.length} ítem(s) &bull; ${totalCant.toFixed(1)} unidades`;
};

window.eliminarItemCarritoPedido = (idx) => {
    carritoPedido.splice(idx, 1);
    window.renderCarritoPedido();
};

window.limpiarCarritoPedido = () => {
    carritoPedido = [];
    window.renderCarritoPedido();
    document.getElementById('ped-prod-cantidad').value = '';
    document.getElementById('ped-notas').value = '';
    document.getElementById('ped-direccion').value = '';
};

window.guardarPedidoDirecto = async () => {
    if (carritoPedido.length === 0) {
        const cantInp = parseFloat(document.getElementById('ped-prod-cantidad').value) || 0;
        if (cantInp > 0) {
            window.agregarItemAlCarritoPedido();
        }
    }

    if (carritoPedido.length === 0) {
        return alert("⚠️ Debes agregar al menos un producto al pedido antes de guardarlo.");
    }

    const selCli = document.getElementById('ped-cliente-id');
    const clienteId = selCli ? selCli.value : '';
    let clienteNombre = '';
    let clienteTelefono = '';
    let clienteDireccion = '';
    if (clienteId) {
        const cliObj = todosLosClientes.find(c => c.id === clienteId);
        if (cliObj) {
            clienteNombre = cliObj.data.nombre || '';
            clienteTelefono = cliObj.data.telefono || '';
            clienteDireccion = cliObj.data.direccion || '';
        }
    }

    const fechaEntrega = document.getElementById('ped-fecha-entrega').value;
    if (!fechaEntrega) {
        return alert("⚠️ Por favor especifica la fecha estimada / compromiso de entrega.");
    }

    const direccion = document.getElementById('ped-direccion').value.trim() || clienteDireccion;
    const notas = document.getElementById('ped-notas').value.trim();

    const btn = document.getElementById('btn-guardar-pedido-directo');
    if (btn) { btn.disabled = true; btn.innerText = "Guardando Pedido..."; }

    try {
        const total = carritoPedido.reduce((acc, it) => acc + it.subtotal, 0);
        const cantidadTotal = carritoPedido.reduce((acc, it) => acc + it.cantidad, 0);
        const folio = generarNuevoFolioPedido();

        const pedidoDoc = {
            folio,
            clienteId: clienteId || null,
            clienteNombre: clienteNombre || 'Cliente Particular',
            clienteTelefono,
            clienteDireccion,
            items: [...carritoPedido],
            total,
            cantidadTotal,
            fechaEntregaCompromiso: fechaEntrega,
            direccionEntrega: direccion,
            notas,
            estado: 'pendiente_entrega',
            fechaCreacion: serverTimestamp()
        };

        await addDoc(collection(db, "pedidos"), pedidoDoc);

        alert(`✅ Pedido ${folio} registrado con éxito.\n\nCliente: ${pedidoDoc.clienteNombre}\nTotal: Q ${total.toFixed(2)}\nFecha de Entrega: ${fechaEntrega}\n\nEl pedido figura ahora en la lista de 'Pendientes de Entrega'.`);

        window.limpiarCarritoPedido();
        window.toggleFormPedido();
        await cargarPedidos();
    } catch (e) {
        alert("❌ Error al guardar pedido: " + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "💾 Guardar Pedido Pendiente de Entrega"; }
    }
};

window.abrirModalCrearPedidoDesdeCarrito = async () => {
    if (carritoVenta.length === 0) {
        const cantInput = parseFloat(document.getElementById('venta-cantidad').value) || 0;
        if (cantInput > 0) {
            await window.agregarItemAlCarrito();
        }
    }

    if (carritoVenta.length === 0) {
        return alert("⚠️ Debes agregar al menos un producto a la lista con '➕ Agregar a la Venta' para crear un pedido.");
    }

    const selCliente = document.getElementById('venta-cliente-id');
    const clienteId = selCliente ? selCliente.value : '';
    let clienteNombre = '';
    let clienteDireccion = '';
    if (clienteId) {
        const cliObj = todosLosClientes.find(c => c.id === clienteId);
        if (cliObj) {
            clienteNombre = cliObj.data.nombre || '';
            clienteDireccion = cliObj.data.direccion || '';
        }
    }
    const notasVenta = document.getElementById('venta-notas').value.trim();

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fInp = document.getElementById('mc-pedido-fecha-entrega');
    if (fInp) fInp.value = manana.toISOString().split('T')[0];

    const dirInp = document.getElementById('mc-pedido-direccion');
    if (dirInp) dirInp.value = clienteDireccion;

    const notInp = document.getElementById('mc-pedido-notas');
    if (notInp) notInp.value = notasVenta;

    const total = carritoVenta.reduce((acc, it) => acc + it.subtotal, 0);
    const resCont = document.getElementById('resumen-pedido-carrito-contenido');
    if (resCont) {
        resCont.innerHTML = `
            <div><strong>Cliente:</strong> ${clienteNombre || (notasVenta || 'Cliente no seleccionado')}</div>
            <div style="margin-top:4px;"><strong>Productos (${carritoVenta.length}):</strong> ${carritoVenta.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(', ')}</div>
            <div style="margin-top:6px; font-size:1.05rem; font-weight:bold; color:var(--primary);">Total del Pedido: Q ${total.toFixed(2)}</div>
        `;
    }

    document.getElementById('modal-crear-pedido-desde-carrito').style.display = 'flex';
};

window.confirmarPedidoDesdeCarrito = async () => {
    const fechaEntrega = document.getElementById('mc-pedido-fecha-entrega').value;
    if (!fechaEntrega) return alert("⚠️ Ingresa la fecha estimada de entrega.");

    const selCliente = document.getElementById('venta-cliente-id');
    const clienteId = selCliente ? selCliente.value : '';
    let clienteNombre = '';
    let clienteTelefono = '';
    let clienteDireccion = '';
    if (clienteId) {
        const cliObj = todosLosClientes.find(c => c.id === clienteId);
        if (cliObj) {
            clienteNombre = cliObj.data.nombre || '';
            clienteTelefono = cliObj.data.telefono || '';
            clienteDireccion = cliObj.data.direccion || '';
        }
    }
    const notasVenta = document.getElementById('venta-notas').value.trim();
    const direccion = document.getElementById('mc-pedido-direccion').value.trim() || clienteDireccion;
    const notasPedido = document.getElementById('mc-pedido-notas').value.trim();

    const btn = document.getElementById('btn-confirmar-pedido-carrito');
    if (btn) { btn.disabled = true; btn.innerText = "Guardando..."; }

    try {
        const total = carritoVenta.reduce((acc, it) => acc + it.subtotal, 0);
        const cantidadTotal = carritoVenta.reduce((acc, it) => acc + it.cantidad, 0);
        const folio = generarNuevoFolioPedido();

        const pedidoDoc = {
            folio,
            clienteId: clienteId || null,
            clienteNombre: clienteNombre || (notasVenta ? notasVenta : 'Cliente Particular'),
            clienteTelefono,
            clienteDireccion,
            items: [...carritoVenta],
            total,
            cantidadTotal,
            fechaEntregaCompromiso: fechaEntrega,
            direccionEntrega: direccion,
            notas: notasPedido || notasVenta,
            estado: 'pendiente_entrega',
            fechaCreacion: serverTimestamp()
        };

        await addDoc(collection(db, "pedidos"), pedidoDoc);

        alert(`✅ ¡Pedido guardado exitosamente!\n\nFolio: ${folio}\nCliente: ${pedidoDoc.clienteNombre}\nTotal: Q ${total.toFixed(2)}\nEntrega: ${fechaEntrega}\n\nPuedes consultarlo en la sección 📋 Pedidos.`);

        carritoVenta = [];
        window.renderCarritoVenta();
        document.getElementById('venta-cantidad').value = '';
        document.getElementById('venta-notas').value = '';
        if (selCliente) selCliente.value = '';
        const badgeCli = document.getElementById('venta-cliente-badge-info');
        if (badgeCli) { badgeCli.style.display = 'none'; badgeCli.innerHTML = ''; }

        window.cerrarModal('modal-crear-pedido-desde-carrito');
        await cargarPedidos();
    } catch (e) {
        alert("❌ Error al guardar pedido: " + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "💾 Confirmar y Guardar Pedido"; }
    }
};

window.abrirModalCargarPedidoPendiente = () => {
    const cont = document.getElementById('lista-pedidos-pendientes-cargar');
    if (!cont) return;

    const pendientes = todosLosPedidos.filter(p => p.data.estado === 'pendiente_entrega');
    if (pendientes.length === 0) {
        cont.innerHTML = `<div style="text-align:center; padding:2rem; color:#888;">No tienes pedidos pendientes de entrega en este momento.</div>`;
    } else {
        cont.innerHTML = pendientes.map(p => {
            const d = p.data;
            const prods = d.items ? d.items.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(', ') : 'Productos';
            return `
                <div style="background:#fff; border:1px solid #ddd; border-left:4px solid #b78103; border-radius:8px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div style="font-weight:bold; color:var(--primary); font-size:1rem;">${d.folio || 'PED'} &bull; ${d.clienteNombre || 'Cliente'}</div>
                        <div style="font-size:0.85rem; color:#555; margin:3px 0;">📦 ${prods}</div>
                        <div style="font-size:0.8rem; color:#777;">📅 Entrega: <strong>${d.fechaEntregaCompromiso || 'N/A'}</strong> &bull; Total: <strong style="color:var(--primary);">Q ${(d.total||0).toFixed(2)}</strong></div>
                    </div>
                    <button type="button" class="btn btn-small btn-primary" onclick="cargarPedidoSeleccionadoAlCarritoVenta('${p.id}')" style="min-height:36px; padding:6px 14px; font-weight:bold;">
                        📥 Cargar este Pedido
                    </button>
                </div>
            `;
        }).join('');
    }

    document.getElementById('modal-cargar-pedido-a-carrito').style.display = 'flex';
};

window.cargarPedidoSeleccionadoAlCarritoVenta = (pedidoId) => {
    const p = todosLosPedidos.find(item => item.id === pedidoId);
    if (!p) return alert("Pedido no encontrado.");
    const d = p.data;

    carritoVenta = (d.items || []).map(it => ({ ...it }));
    window.renderCarritoVenta();

    const selCli = document.getElementById('venta-cliente-id');
    if (selCli && d.clienteId) {
        selCli.value = d.clienteId;
        window.onClienteSeleccionadoVenta();
    }

    const notasInp = document.getElementById('venta-notas');
    if (notasInp) {
        notasInp.value = `[Pedido ${d.folio || ''}] ${d.notas || ''}`.trim();
    }

    window.cerrarModal('modal-cargar-pedido-a-carrito');
    alert(`✅ Pedido ${d.folio || ''} cargado al carrito de venta. Puedes registrar la venta directamente o agregar más productos.`);
    const cartEl = document.getElementById('tabla-carrito-ventas');
    if (cartEl) cartEl.scrollIntoView({ behavior: 'smooth' });
};

window.abrirModalEntregarPedido = (pedidoId) => {
    const p = todosLosPedidos.find(item => item.id === pedidoId);
    if (!p) return alert("Pedido no encontrado.");
    pedidoActualEnModal = p;
    const d = p.data;

    document.getElementById('modal-entregar-pedido-titulo').innerText = `🚚 Entregar Pedido ${d.folio || ''}`;

    const hoy = new Date().toISOString().split('T')[0];
    const fechaInp = document.getElementById('entregar-fecha-venta');
    if (fechaInp) fechaInp.value = hoy;

    const notasInp = document.getElementById('entregar-notas');
    if (notasInp) notasInp.value = `[Entrega ${d.folio || ''}] ${d.notas || ''}`.trim();

    const resEl = document.getElementById('modal-entregar-pedido-resumen');
    if (resEl) {
        let itemsHTML = '';
        if (d.items && d.items.length > 0) {
            itemsHTML = `
                <table style="width:100%; border-collapse:collapse; margin-top:0.5rem; font-size:0.85rem;">
                    <thead>
                        <tr style="background:#e8f5e9; color:#1b5e20;">
                            <th style="padding:6px;">Producto</th>
                            <th style="padding:6px; text-align:center;">Cantidad</th>
                            <th style="padding:6px; text-align:right;">P. Unit</th>
                            <th style="padding:6px; text-align:right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${d.items.map(it => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:6px;"><strong>${it.nombre}</strong> ${it.presentacion !== 'N/A' ? `(${it.presentacion})` : ''}</td>
                                <td style="padding:6px; text-align:center;">${it.cantidad} ${it.unidad}</td>
                                <td style="padding:6px; text-align:right;">Q ${(it.precio||0).toFixed(2)}</td>
                                <td style="padding:6px; text-align:right; font-weight:bold;">Q ${(it.subtotal || it.cantidad*it.precio).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        resEl.innerHTML = `
            <div style="background:#f4f6f4; border-radius:8px; padding:12px; border-left:4px solid var(--primary);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <div>
                        <div style="font-weight:bold; font-size:1.1rem; color:var(--primary);">👤 ${d.clienteNombre || 'Cliente Particular'}</div>
                        <div style="font-size:0.85rem; color:#555;">📍 Entrega en: ${d.direccionEntrega || d.clienteDireccion || 'No especificada'}</div>
                        ${d.clienteTelefono ? `<div style="font-size:0.85rem; color:#555;">📞 Teléfono: ${d.clienteTelefono}</div>` : ''}
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:0.8rem; color:#777;">TOTAL A COBRAR:</span>
                        <div style="font-size:1.4rem; font-weight:bold; color:var(--primary);">Q ${(d.total||0).toFixed(2)}</div>
                    </div>
                </div>
                ${itemsHTML}
            </div>
        `;
    }

    document.getElementById('entregar-metodo-pago').value = 'Efectivo';
    document.getElementById('entregar-estado-pago').value = 'pagado';

    document.getElementById('modal-entregar-pedido').style.display = 'flex';
};

window.onMetodoPagoEntregaChange = () => {
    const metodo = document.getElementById('entregar-metodo-pago').value;
    const estSelect = document.getElementById('entregar-estado-pago');
    if (estSelect) {
        estSelect.value = derivarEstadoPagoDeMetodo(metodo);
    }
};

window.confirmarEntregaPedido = async () => {
    if (!pedidoActualEnModal) return;
    const p = pedidoActualEnModal;
    const d = p.data;

    const metodoPago = document.getElementById('entregar-metodo-pago').value;
    let estadoPago = document.getElementById('entregar-estado-pago').value;
    if (estadoPago !== 'pendiente') estadoPago = 'pagado';
    const fechaVenta = document.getElementById('entregar-fecha-venta').value;
    const descontarInv = document.getElementById('entregar-descontar-inventario').checked;
    const notasEntrega = document.getElementById('entregar-notas').value.trim();

    const btn = document.getElementById('btn-confirmar-entrega-final');
    if (btn) { btn.disabled = true; btn.innerText = "Registrando Venta de Entrega..."; }

    try {
        const items = d.items || [];
        const totalMonto = d.total !== undefined ? Number(d.total) : items.reduce((a,c) => a + (c.subtotal || c.cantidad*c.precio), 0);
        const totalCantidad = d.cantidadTotal !== undefined ? Number(d.cantidadTotal) : items.reduce((a,c) => a + Number(c.cantidad||0), 0);

        // Descontar inventario si se solicitó
        if (descontarInv) {
            for (const it of items) {
                if (it.tipo === 'Tostado' && it.loteDocId) {
                    const loteSnap = await getDoc(doc(db, "inventario", it.loteDocId));
                    if (loteSnap.exists()) {
                        const cantActual = loteSnap.data().cantidad || 0;
                        await updateDoc(doc(db, "inventario", it.loteDocId), { cantidad: Math.max(0, cantActual - it.cantidad) });
                    }
                } else {
                    let pend = it.cantidad;
                    const snap = await getDocs(query(collection(db, "inventario"), where("estado", "==", it.tipo)));
                    for (const docInv of snap.docs) {
                        if (pend <= 0) break;
                        const inv = docInv.data();
                        if (inv.cantidad >= pend) {
                            await updateDoc(doc(db, "inventario", docInv.id), { cantidad: inv.cantidad - pend });
                            pend = 0;
                        } else {
                            await updateDoc(doc(db, "inventario", docInv.id), { cantidad: 0 });
                            pend -= inv.cantidad;
                        }
                    }
                }
            }
        }

        const nombresResumen = items.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(' + ');
        const lotesResumen = items.filter(it => it.loteDocId).map(it => it.loteInfo).join(' | ') || 'N/A';

        const ventaDoc = {
            items,
            total: totalMonto,
            cantidad: totalCantidad,
            tipo: nombresResumen,
            loteInfo: lotesResumen,
            pago: metodoPago,
            estadoPago: estadoPago, // 'pagado' o 'pendiente' (crédito)
            clienteId: d.clienteId || null,
            clienteNombre: d.clienteNombre || null,
            notas: notasEntrega || `[Entrega ${d.folio || ''}] ${d.notas || ''}`.trim(),
            pedidoId: p.id,
            pedidoFolio: d.folio || null,
            fechaVentaPersonalizada: fechaVenta || null,
            fecha: serverTimestamp()
        };

        const ventaRef = await addDoc(collection(db, "ventas"), ventaDoc);

        // Actualizar pedido a estado 'entregado'
        await updateDoc(doc(db, "pedidos", p.id), {
            estado: 'entregado',
            ventaId: ventaRef.id,
            fechaEntrega: serverTimestamp(),
            fechaVentaRegistrada: fechaVenta,
            metodoPagoFinal: metodoPago,
            estadoPagoFinal: estadoPago,
            notasEntrega: notasEntrega
        });

        alert(`✅ Pedido ${d.folio || ''} entregado exitosamente.\n\nVenta registrada por: Q ${totalMonto.toFixed(2)}\nEstado de Pago: ${estadoPago === 'pendiente' ? '🔴 CRÉDITO (PENDIENTE DE PAGO)' : '🟢 PAGADO'}\n${descontarInv ? 'Inventario descontado correctamente.' : ''}`);

        window.cerrarModal('modal-entregar-pedido');
        window.cerrarModal('modal-ver-pedido');
        pedidoActualEnModal = null;

        await cargarDatosIniciales();
        await cargarPedidos();
    } catch (e) {
        alert("❌ Error al procesar entrega de pedido: " + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "💾 Confirmar Entrega y Registrar Venta"; }
    }
};

window.entregarPedidoDesdeModalVer = () => {
    if (!pedidoActualEnModal) return;
    const pid = pedidoActualEnModal.id;
    window.cerrarModal('modal-ver-pedido');
    window.abrirModalEntregarPedido(pid);
};

window.verPedidoDetalle = (pedidoId) => {
    const p = todosLosPedidos.find(item => item.id === pedidoId);
    if (!p) return alert("Pedido no encontrado.");
    pedidoActualEnModal = p;
    const d = p.data;

    document.getElementById('modal-ver-pedido-titulo').innerText = `📋 Pedido: ${d.folio || 'N/A'}`;

    const fechaCreacionTxt = d.fechaCreacion ? (d.fechaCreacion.seconds ? new Date(d.fechaCreacion.seconds * 1000).toLocaleString('es-GT') : 'N/A') : 'N/A';
    const estadoBadge = d.estado === 'entregado' 
        ? `<span class="pedido-badge pedido-entregado">🟢 ENTREGADO</span>`
        : (d.estado === 'cancelado' ? `<span class="pedido-badge pedido-cancelado">⚪ CANCELADO</span>` : `<span class="pedido-badge pedido-pendiente">🟡 PENDIENTE DE ENTREGA</span>`);

    const btnEntregar = document.getElementById('btn-modal-ver-entregar');
    if (btnEntregar) {
        btnEntregar.style.display = (d.estado === 'pendiente_entrega') ? 'inline-block' : 'none';
    }

    let itemsHTML = '';
    if (d.items && d.items.length > 0) {
        itemsHTML = `
            <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.9rem;">
                <thead>
                    <tr style="background:var(--primary); color:white;">
                        <th style="padding:8px;">Producto</th>
                        <th style="padding:8px;">Presentación</th>
                        <th style="padding:8px; text-align:center;">Cantidad</th>
                        <th style="padding:8px; text-align:right;">Precio Unit.</th>
                        <th style="padding:8px; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${d.items.map(it => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:8px;"><strong>${it.nombre}</strong></td>
                            <td style="padding:8px;">${it.presentacion !== 'N/A' ? `<span class="cart-badge">${it.presentacion}</span>` : '-'}</td>
                            <td style="padding:8px; text-align:center; font-weight:bold;">${it.cantidad} ${it.unidad}</td>
                            <td style="padding:8px; text-align:right;">Q ${(it.precio||0).toFixed(2)}</td>
                            <td style="padding:8px; text-align:right; font-weight:bold; color:var(--primary);">Q ${(it.subtotal || it.cantidad*it.precio).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    const contenido = `
        <div class="detail-grid" style="margin-bottom:1rem;">
            <div class="detail-item"><div class="label">Folio</div><div class="value"><strong>${d.folio || 'N/A'}</strong></div></div>
            <div class="detail-item"><div class="label">Estado del Pedido</div><div class="value">${estadoBadge}</div></div>
            <div class="detail-item"><div class="label">Fecha del Pedido</div><div class="value">${fechaCreacionTxt}</div></div>
            <div class="detail-item highlight"><div class="label">Fecha Compromiso de Entrega</div><div class="value"><strong>${d.fechaEntregaCompromiso || 'No definida'}</strong></div></div>
            <div class="detail-item"><div class="label">Cliente</div><div class="value"><strong>${d.clienteNombre || 'N/A'}</strong> ${d.clienteTelefono ? `&bull; 📞 ${d.clienteTelefono}` : ''}</div></div>
            <div class="detail-item"><div class="label">Dirección de Entrega</div><div class="value">${d.direccionEntrega || d.clienteDireccion || 'No especificada'}</div></div>
            ${d.notas ? `<div class="detail-item" style="grid-column:1/-1;"><div class="label">Observaciones / Notas</div><div class="value">${d.notas}</div></div>` : ''}
            ${d.estado === 'entregado' ? `
                <div class="detail-item" style="grid-column:1/-1; background:#e8f5e9; border:1px solid #c8e6c9;">
                    <div class="label" style="color:#2e7d32;">Datos de Entrega Registrada</div>
                    <div class="value" style="color:#1b5e20;">
                        Pago: <strong>${d.metodoPagoFinal || 'N/A'}</strong> &bull; Estado: <strong>${(d.estadoPagoFinal||'pagado').toUpperCase()}</strong> 
                        ${d.ventaId ? `&bull; <button type="button" class="btn btn-xs btn-primary" onclick="cerrarModal('modal-ver-pedido'); verVentaDetalle('${d.ventaId}')">🧾 Ver Venta #</button>` : ''}
                    </div>
                </div>
            ` : ''}
        </div>
        <h4 style="color:var(--primary); margin:1rem 0 0.5rem;">📦 Productos del Pedido</h4>
        ${itemsHTML}
        <div style="display:flex; justify-content:flex-end; margin-top:1rem; padding:12px; background:#f5f5f0; border-radius:8px;">
            <span style="font-size:1.25rem; font-weight:bold; color:var(--primary);">TOTAL: Q ${(d.total||0).toFixed(2)}</span>
        </div>
    `;

    document.getElementById('modal-ver-pedido-contenido').innerHTML = contenido;
    document.getElementById('modal-ver-pedido').style.display = 'flex';
};

window.cancelarPedido = async (pedidoId) => {
    const p = todosLosPedidos.find(item => item.id === pedidoId);
    if (!p) return;
    if (!confirm(`⚠️ ¿Deseas cancelar el pedido ${p.data.folio || ''} de ${p.data.clienteNombre || 'Cliente'}?\n\nEl pedido se marcará como cancelado.`)) return;

    try {
        await updateDoc(doc(db, "pedidos", pedidoId), {
            estado: 'cancelado',
            fechaCancelacion: serverTimestamp()
        });
        alert("✅ Pedido cancelado.");
        await cargarPedidos();
    } catch (e) {
        alert("❌ Error: " + e.message);
    }
};

window.editarPedido = (pedidoId) => {
    const p = todosLosPedidos.find(item => item.id === pedidoId);
    if (!p) return alert("Pedido no encontrado.");
    pedidoActualEditando = p;
    const d = p.data;

    document.getElementById('ep-id').value = pedidoId;
    document.getElementById('ep-cliente-nombre').value = d.clienteNombre || 'Cliente';
    document.getElementById('ep-fecha-entrega').value = d.fechaEntregaCompromiso || '';
    document.getElementById('ep-direccion').value = d.direccionEntrega || d.clienteDireccion || '';
    document.getElementById('ep-notas').value = d.notas || '';

    document.getElementById('modal-editar-pedido-titulo').innerText = `✏️ Editando ${d.folio || 'Pedido'}`;
    document.getElementById('modal-editar-pedido').style.display = 'flex';
};

window.guardarEdicionPedido = async () => {
    if (!pedidoActualEditando) return;
    const id = document.getElementById('ep-id').value;
    const fecha = document.getElementById('ep-fecha-entrega').value;
    const dir = document.getElementById('ep-direccion').value.trim();
    const notas = document.getElementById('ep-notas').value.trim();

    try {
        await updateDoc(doc(db, "pedidos", id), {
            fechaEntregaCompromiso: fecha,
            direccionEntrega: dir,
            notas: notas,
            fechaActualizacion: serverTimestamp()
        });
        alert("✅ Pedido actualizado.");
        window.cerrarModal('modal-editar-pedido');
        pedidoActualEditando = null;
        await cargarPedidos();
    } catch (e) {
        alert("❌ Error: " + e.message);
    }
};

window.irASeccionPedidos = () => {
    const itemMenuPedidos = document.querySelectorAll('.menu-item')[1];
    window.showSection('pedidos', itemMenuPedidos);
};

window.filtrarPedidos = (filtro, btn) => {
    filtroPedidosActual = filtro;
    document.querySelectorAll('#pedidos-filters .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderTablaPedidos();
};

window.filtrarListaPedidos = () => {
    busquedaPedidoTerm = (document.getElementById('buscar-pedido-input')?.value || '').trim().toLowerCase();
    renderTablaPedidos();
};

function actualizarKPIsPedidos() {
    let countPend = 0;
    let montoPend = 0;
    let countEntregados = 0;
    const clientesSet = new Set();

    todosLosPedidos.forEach(p => {
        const d = p.data;
        const total = d.total !== undefined ? Number(d.total) : 0;
        if (d.estado === 'pendiente_entrega') {
            countPend++;
            montoPend += total;
            if (d.clienteId) clientesSet.add(d.clienteId);
            else if (d.clienteNombre) clientesSet.add(d.clienteNombre.toLowerCase());
        } else if (d.estado === 'entregado') {
            countEntregados++;
        }
    });

    const kpiCountEl = document.getElementById('kpi-pedidos-pendientes-count');
    if (kpiCountEl) kpiCountEl.innerText = countPend;

    const kpiMontoEl = document.getElementById('kpi-pedidos-pendientes-monto');
    if (kpiMontoEl) kpiMontoEl.innerText = "Q " + montoPend.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const kpiEntrEl = document.getElementById('kpi-pedidos-entregados-count');
    if (kpiEntrEl) kpiEntrEl.innerText = countEntregados;

    const kpiCliEl = document.getElementById('kpi-pedidos-clientes-espera');
    if (kpiCliEl) kpiCliEl.innerText = clientesSet.size;

    // En Dashboard
    const dashPedEl = document.getElementById('dash-pedidos-pendientes');
    if (dashPedEl) dashPedEl.innerText = countPend;
    const dashPedSub = document.getElementById('dash-pedidos-pendientes-sub');
    if (dashPedSub) dashPedSub.innerText = `Q ${montoPend.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por entregar`;
}

function actualizarBannerPedidosVentas() {
    const banner = document.getElementById('banner-pedidos-pendientes-ventas');
    if (!banner) return;
    const pendientes = todosLosPedidos.filter(p => p.data.estado === 'pendiente_entrega');
    if (pendientes.length === 0) {
        banner.style.display = 'none';
    } else {
        const totalQ = pendientes.reduce((acc, p) => acc + (p.data.total || 0), 0);
        banner.style.display = 'flex';
        const tit = document.getElementById('banner-pedidos-titulo');
        if (tit) tit.innerText = `🚚 Tienes ${pendientes.length} pedido(s) pendiente(s) de entrega por Q ${totalQ.toFixed(2)}`;
    }
}

function renderTablaPedidos() {
    const tbody = document.querySelector('#tabla-pedidos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const hoyStr = new Date().toISOString().split('T')[0];

    let lista = todosLosPedidos;
    if (filtroPedidosActual === 'pendientes') {
        lista = lista.filter(p => p.data.estado === 'pendiente_entrega');
    } else if (filtroPedidosActual === 'entregados') {
        lista = lista.filter(p => p.data.estado === 'entregado');
    }

    if (busquedaPedidoTerm) {
        lista = lista.filter(p => {
            const d = p.data;
            const folio = (d.folio || '').toLowerCase();
            const cliente = (d.clienteNombre || '').toLowerCase();
            const tel = (d.clienteTelefono || '').toLowerCase();
            const dir = (d.direccionEntrega || d.clienteDireccion || '').toLowerCase();
            const prods = (d.items || []).map(it => it.nombre).join(' ').toLowerCase();
            return folio.includes(busquedaPedidoTerm) || cliente.includes(busquedaPedidoTerm) || tel.includes(busquedaPedidoTerm) || dir.includes(busquedaPedidoTerm) || prods.includes(busquedaPedidoTerm);
        });
    }

    if (lista.length === 0) {
        const txt = filtroPedidosActual === 'pendientes' 
            ? 'No tienes pedidos pendientes de entrega.' 
            : (filtroPedidosActual === 'entregados' ? 'No hay pedidos entregados en este filtro.' : 'No se encontraron pedidos.');
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#888;">${txt}</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const d = p.data;
        const docId = p.id;

        const fPed = d.fechaCreacion ? (d.fechaCreacion.seconds ? new Date(d.fechaCreacion.seconds * 1000).toLocaleDateString('es-GT') : 'N/A') : 'N/A';
        const fCompromiso = d.fechaEntregaCompromiso || 'N/A';

        let urgenciaBadge = '';
        if (d.estado === 'entregado') {
            urgenciaBadge = `<span class="urgencia-badge urgencia-completada">✅ Entregado</span>`;
        } else if (d.estado === 'cancelado') {
            urgenciaBadge = `<span class="urgencia-badge" style="background:#eee; color:#666;">Cancelado</span>`;
        } else if (fCompromiso !== 'N/A') {
            if (fCompromiso < hoyStr) {
                urgenciaBadge = `<span class="urgencia-badge urgencia-atrasada">🔴 Atrasado (${fCompromiso})</span>`;
            } else if (fCompromiso === hoyStr) {
                urgenciaBadge = `<span class="urgencia-badge urgencia-hoy">🟠 Entrega HOY</span>`;
            } else {
                urgenciaBadge = `<span class="urgencia-badge urgencia-normal">🟢 Próximo (${fCompromiso})</span>`;
            }
        }

        let clienteHTML = `<strong>${d.clienteNombre || 'Cliente Particular'}</strong>`;
        if (d.clienteTelefono) {
            const cleanTel = d.clienteTelefono.replace(/\D/g, '');
            clienteHTML += `<br><a href="https://wa.me/502${cleanTel}" target="_blank" style="color:var(--primary); font-size:0.8rem; text-decoration:underline;">📱 ${d.clienteTelefono} (WhatsApp)</a>`;
        }
        if (d.clienteId) {
            clienteHTML += `<br><button type="button" class="btn btn-xs btn-primary" onclick="window.verHistorialCliente('${d.clienteId}')" style="margin-top:2px; padding:1px 6px; font-size:0.72rem; min-height:20px;">📜 Ficha</button>`;
        }

        let prodsHTML = '';
        if (d.items && d.items.length > 0) {
            if (d.items.length === 1) {
                const it = d.items[0];
                prodsHTML = `<strong>${it.nombre}</strong> ${it.presentacion !== 'N/A' ? `(${it.presentacion})` : ''} &bull; ${it.cantidad} ${it.unidad}`;
            } else {
                prodsHTML = `
                    <div style="font-size:0.85rem;">
                        <span class="badge-multi-items" style="background:#fff8e1; color:#b78103; border-color:#ffe082;">📦 ${d.items.length} productos</span>
                        <div style="color:#555; margin-top:2px;">${d.items.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(', ').substring(0, 50)}...</div>
                    </div>
                `;
            }
        } else {
            prodsHTML = '<span style="color:#999;">Sin ítems</span>';
        }

        let estadoBadge = '';
        if (d.estado === 'pendiente_entrega') {
            estadoBadge = `<span class="pedido-badge pedido-pendiente">🟡 PENDIENTE</span>`;
        } else if (d.estado === 'entregado') {
            const pagoTxt = d.metodoPagoFinal ? ` (${d.metodoPagoFinal})` : '';
            estadoBadge = `<span class="pedido-badge pedido-entregado">🟢 ENTREGADO</span><br><small style="color:#2e7d32; font-weight:bold;">${(d.estadoPagoFinal||'pagado').toUpperCase()}${pagoTxt}</small>`;
        } else {
            estadoBadge = `<span class="pedido-badge pedido-cancelado">⚪ CANCELADO</span>`;
        }

        const totalQ = d.total !== undefined ? Number(d.total) : 0;
        const dir = d.direccionEntrega || d.clienteDireccion || '<span style="color:#aaa;">No indicada</span>';

        let accionesHTML = '';
        if (d.estado === 'pendiente_entrega') {
            accionesHTML = `
                <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
                    <button class="btn btn-xs btn-success" title="Entregar y Registrar Venta" onclick="abrirModalEntregarPedido('${docId}')" style="font-weight:bold; padding:4px 8px; font-size:0.8rem;">
                        🚚 Entregar
                    </button>
                    <button class="btn btn-xs btn-view" title="Ver Detalle" onclick="verPedidoDetalle('${docId}')">👁️</button>
                    <button class="btn btn-xs btn-pdf" title="Descargar Hoja de Pedido PDF" onclick="generarPDFHojaPedido('${docId}')">📄</button>
                    <button class="btn btn-xs btn-edit" title="Editar Pedido" onclick="editarPedido('${docId}')">✏️</button>
                    <button class="btn btn-xs btn-danger" title="Cancelar Pedido" onclick="cancelarPedido('${docId}')">❌</button>
                </div>
            `;
        } else {
            accionesHTML = `
                <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
                    <button class="btn btn-xs btn-view" title="Ver Detalle" onclick="verPedidoDetalle('${docId}')">👁️ Ver</button>
                    <button class="btn btn-xs btn-pdf" title="Descargar Hoja de Pedido PDF" onclick="generarPDFHojaPedido('${docId}')">📄 PDF</button>
                </div>
            `;
        }

        tbody.innerHTML += `
            <tr>
                <td style="font-weight:bold; color:var(--primary); font-family:monospace; font-size:0.9rem;">${d.folio || 'PED'}</td>
                <td>
                    <div style="font-size:0.85rem; color:#666;">Ped: ${fPed}</div>
                    <div>${urgenciaBadge}</div>
                </td>
                <td style="max-width:200px;">${clienteHTML}</td>
                <td style="font-size:0.85rem; color:#444; max-width:180px;">${dir}</td>
                <td style="max-width:220px;">${prodsHTML}</td>
                <td style="text-align:right; font-weight:bold; color:var(--primary); font-size:0.95rem;">Q ${totalQ.toFixed(2)}</td>
                <td>${estadoBadge}</td>
                <td style="text-align:center;">${accionesHTML}</td>
            </tr>
        `;
    });
}

window.generarPDFHojaPedidoActual = () => {
    if (!pedidoActualEnModal) return alert("No hay pedido seleccionado.");
    window.generarPDFHojaPedido(pedidoActualEnModal.id);
};

window.generarPDFHojaPedido = (pedidoId) => {
    const p = todosLosPedidos.find(item => item.id === pedidoId);
    if (!p) return alert("Pedido no encontrado.");
    const d = p.data;

    const jsPDFClass = getJsPDF();
    if (!jsPDFClass) return alert("Librería jsPDF no disponible.");
    const doc = new jsPDFClass({ orientation: "portrait", unit: "mm", format: "letter" });

    // Encabezado
    doc.setFillColor(44, 94, 46);
    doc.rect(0, 0, 216, 26, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FINCA LOS ROBLES", 14, 12);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("HOJA DE PEDIDO Y COMPROBANTE DE ENTREGA", 14, 19);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${d.folio || 'PED'}`, 160, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const fechaCreacionTxt = d.fechaCreacion ? (d.fechaCreacion.seconds ? new Date(d.fechaCreacion.seconds * 1000).toLocaleDateString('es-GT') : 'N/A') : 'N/A';
    doc.text(`Fecha Pedido: ${fechaCreacionTxt}`, 160, 19);

    let y = 34;

    // Caja de Información de Cliente y Entrega
    doc.setFillColor(245, 245, 240);
    doc.roundedRect(14, y, 188, 38, 3, 3, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(44, 94, 46);
    doc.text("DATOS DEL CLIENTE Y PUNTO DE ENTREGA", 18, y + 7);

    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 18, y + 14);
    doc.setFont("helvetica", "normal");
    doc.text((d.clienteNombre || 'Cliente Particular').toUpperCase(), 40, y + 14);

    doc.setFont("helvetica", "bold");
    doc.text("Teléfono:", 18, y + 20);
    doc.setFont("helvetica", "normal");
    doc.text(d.clienteTelefono || 'No indicado', 40, y + 20);

    doc.setFont("helvetica", "bold");
    doc.text("Dirección:", 18, y + 26);
    doc.setFont("helvetica", "normal");
    doc.text(d.direccionEntrega || d.clienteDireccion || 'Entrega en Finca / Mostrador', 40, y + 26);

    doc.setFont("helvetica", "bold");
    doc.text("Compromiso de Entrega:", 120, y + 14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(183, 129, 3);
    doc.text(d.fechaEntregaCompromiso || 'Inmediata', 165, y + 14);
    doc.setTextColor(40, 40, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Estado:", 120, y + 20);
    doc.setFont("helvetica", "normal");
    doc.text(d.estado === 'entregado' ? '🟢 ENTREGADO' : '🟡 PENDIENTE DE ENTREGA', 135, y + 20);

    if (d.notas) {
        doc.setFont("helvetica", "bold");
        doc.text("Notas:", 18, y + 32);
        doc.setFont("helvetica", "normal");
        const notasSpl = doc.splitTextToSize(d.notas, 140);
        doc.text(notasSpl, 40, y + 32);
    }

    y += 46;

    // Tabla de Productos Solicitados
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(44, 94, 46);
    doc.text("PRODUCTOS SOLICITADOS EN EL PEDIDO", 14, y);
    y += 4;

    doc.setFillColor(44, 94, 46);
    doc.rect(14, y, 188, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("[ ✓ ]", 17, y + 5);
    doc.text("PRODUCTO Y PRESENTACIÓN", 30, y + 5);
    doc.text("CANTIDAD", 120, y + 5);
    doc.text("PRECIO UNIT.", 145, y + 5);
    doc.text("SUBTOTAL (Q)", 175, y + 5);

    y += 7;

    const items = d.items || [];
    let granTotal = 0;

    items.forEach((it, idx) => {
        const sub = it.subtotal || (it.cantidad * it.precio);
        granTotal += sub;

        if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 248);
            doc.rect(14, y, 188, 7, 'F');
        }

        doc.rect(18, y + 1.5, 4, 4);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(8.5);
        doc.text(it.nombre + (it.presentacion !== 'N/A' ? ` (${it.presentacion})` : ''), 30, y + 5);

        doc.setFont("helvetica", "normal");
        doc.text(`${it.cantidad} ${it.unidad}`, 120, y + 5);
        doc.text(`Q ${(it.precio || 0).toFixed(2)}`, 145, y + 5);
        doc.setFont("helvetica", "bold");
        doc.text(`Q ${sub.toFixed(2)}`, 175, y + 5);

        y += 7;
    });

    // Total Bar
    y += 2;
    doc.setFillColor(240, 245, 240);
    doc.rect(14, y, 188, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(44, 94, 46);
    doc.text("TOTAL DEL PEDIDO A COBRAR:", 80, y + 7);
    doc.setFontSize(12);
    doc.text(`Q ${granTotal.toFixed(2)}`, 165, y + 7);

    y += 18;

    // Sección de Liquidación y Entrega
    doc.setFillColor(250, 250, 248);
    doc.roundedRect(14, y, 188, 48, 2, 2, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14, y, 188, 48, 2, 2, 'D');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(44, 94, 46);
    doc.text("CONSTANCIA DE ENTREGA Y LIQUIDACIÓN", 18, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text("Fecha y Hora de Entrega Efectiva:  ____________________________________", 18, y + 14);
    doc.text("Forma de Pago Recibida:   [  ] Efectivo     [  ] Transferencia     [  ] Tarjeta     [  ] Crédito (Pendiente)", 18, y + 21);

    // Firmas
    doc.line(25, y + 40, 95, y + 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Entregado por (Finca Los Robles)", 35, y + 44);

    doc.line(115, y + 40, 185, y + 40);
    doc.text("Recibido Conforme (Firma y Nombre Cliente)", 120, y + 44);

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("Generado: " + new Date().toLocaleString('es-GT') + "  |  Finca Los Robles - Café de Especialidad  |  v2026.09.11", 108, 270, { align: "center" });

    doc.save(`${d.folio || 'Pedido'}_${(d.clienteNombre || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    alert(`✅ Hoja de Pedido PDF (${d.folio || ''}) descargada.`);
};

// =========================================================================
// --- GESTIÓN DE CLIENTES Y BASE DE DATOS DE COMPRADORES (v2026.09.11) ---
// =========================================================================

function obtenerComprasDeCliente(clienteId, clienteNombre) {
    const nomLower = (clienteNombre || '').trim().toLowerCase();
    return todasLasVentas.filter(v => {
        const vd = v.data;
        if (clienteId && vd.clienteId === clienteId) return true;
        if (nomLower && vd.clienteNombre && vd.clienteNombre.trim().toLowerCase() === nomLower) return true;
        if (!vd.clienteId && nomLower && vd.notas && vd.notas.trim().toLowerCase().includes(nomLower)) return true;
        return false;
    });
}

window.cargarClientes = async () => {
    try {
        let sc;
        try {
            sc = await getDocs(query(collection(db, "clientes"), orderBy("nombre", "asc")));
        } catch (e) {
            sc = await getDocs(collection(db, "clientes"));
        }
        if (!sc || sc.empty) {
            sc = await getDocs(collection(db, "clientes"));
        }

        todosLosClientes = [];
        sc.forEach(d => {
            todosLosClientes.push({ id: d.id, data: d.data() });
        });

        todosLosClientes.sort((a, b) => (a.data.nombre || '').localeCompare(b.data.nombre || ''));

        actualizarSelectClientesVenta();
        renderTablaClientes();
        actualizarKPIsClientes();
    } catch (e) {
        console.error("Error al cargar clientes:", e);
    }
};

function actualizarSelectClientesVenta(selectedId = null) {
    const selVenta = document.getElementById('venta-cliente-id');
    const selEdit = document.getElementById('ev-cliente-id');
    const selPed = document.getElementById('ped-cliente-id');

    const generarOpciones = (actualSel, esObligatorio = false) => {
        let opts = esObligatorio 
            ? `<option value="">-- Seleccionar Cliente Registrado --</option>` 
            : `<option value="">-- Seleccionar Cliente Registrado (Opcional) --</option>`;
        todosLosClientes.forEach(c => {
            const nom = c.data.nombre || 'Sin Nombre';
            const tel = c.data.telefono ? ` (${c.data.telefono})` : '';
            const tipo = c.data.tipo ? ` - ${c.data.tipo}` : '';
            const isSel = (c.id === actualSel) ? 'selected' : '';
            opts += `<option value="${c.id}" ${isSel}>${nom}${tel}${tipo}</option>`;
        });
        return opts;
    };

    if (selVenta) {
        const valActual = selectedId !== null ? selectedId : selVenta.value;
        selVenta.innerHTML = generarOpciones(valActual, false);
        if (selectedId !== null) {
            selVenta.value = selectedId;
            window.onClienteSeleccionadoVenta();
        }
    }

    if (selEdit) {
        selEdit.innerHTML = generarOpciones(selEdit.value, false);
    }

    if (selPed) {
        const valActualPed = selectedId !== null ? selectedId : selPed.value;
        selPed.innerHTML = generarOpciones(valActualPed, true);
        if (selectedId !== null) {
            selPed.value = selectedId;
            if (typeof window.onClienteSeleccionadoPedido === 'function') window.onClienteSeleccionadoPedido();
        }
    }
}

window.onClienteSeleccionadoVenta = () => {
    const sel = document.getElementById('venta-cliente-id');
    const badge = document.getElementById('venta-cliente-badge-info');
    if (!sel || !badge) return;
    const cid = sel.value;
    if (!cid) {
        badge.style.display = 'none';
        badge.innerHTML = '';
        return;
    }
    const cli = todosLosClientes.find(c => c.id === cid);
    if (!cli) {
        badge.style.display = 'none';
        return;
    }
    const d = cli.data;
    const comprasCli = obtenerComprasDeCliente(cid, d.nombre);
    const totalGastado = comprasCli.reduce((sum, v) => sum + (v.data.total !== undefined ? Number(v.data.total) : (Number(v.data.cantidad||0)*Number(v.data.precio||0))), 0);
    const pendCount = comprasCli.filter(v => v.data.estadoPago === 'pendiente').length;

    badge.style.display = 'block';
    badge.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
                <strong>👤 ${d.nombre}</strong> ${d.tipo ? `<span class="badge-tipo-cliente">${d.tipo}</span>` : ''} 
                | 📞 ${d.telefono || 'Sin teléfono'} | 🆔 NIT: ${d.nit || 'CF'}
                <br>
                <small style="color:#2e7d32;">📊 Historial: <strong>${comprasCli.length}</strong> compra(s) previas | Total: <strong>Q ${totalGastado.toFixed(2)}</strong> ${pendCount > 0 ? `<span style="color:#d32f2f; font-weight:bold;">(${pendCount} pendientes de pago)</span>` : ''}</small>
            </div>
            <button type="button" class="btn btn-xs btn-view" onclick="window.verHistorialCliente('${cid}')" style="width:auto; min-height:28px; padding:3px 10px;">
                📜 Ver Historial Completo
            </button>
        </div>
    `;
};

window.guardarCliente = async () => {
    const idEditando = document.getElementById('cli-id-editando').value;
    const nombre = document.getElementById('cli-nombre').value.trim();
    const telefono = document.getElementById('cli-telefono').value.trim();
    const email = document.getElementById('cli-email').value.trim();
    const nit = document.getElementById('cli-nit').value.trim() || 'CF';
    const tipo = document.getElementById('cli-tipo').value;
    const direccion = document.getElementById('cli-direccion').value.trim();
    const notas = document.getElementById('cli-notas').value.trim();

    if (!nombre) {
        return alert("⚠️ Por favor ingresa el nombre del cliente o empresa.");
    }

    const btn = document.getElementById('btn-guardar-cliente');
    if (btn) { btn.disabled = true; btn.innerText = "Guardando..."; }

    try {
        const datos = {
            nombre,
            telefono,
            email,
            nit,
            tipo,
            direccion,
            notas,
            activo: true,
            fechaActualizacion: serverTimestamp()
        };

        if (idEditando) {
            await updateDoc(doc(db, "clientes", idEditando), datos);
            alert("✅ Cliente actualizado exitosamente.");
        } else {
            datos.fechaCreacion = serverTimestamp();
            await addDoc(collection(db, "clientes"), datos);
            alert("✅ Cliente registrado exitosamente.");
        }

        window.limpiarFormCliente();
        await window.cargarClientes();
    } catch (e) {
        alert("❌ Error al guardar cliente: " + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "💾 Guardar Cliente"; }
    }
};

window.limpiarFormCliente = () => {
    document.getElementById('cli-id-editando').value = '';
    document.getElementById('cli-nombre').value = '';
    document.getElementById('cli-telefono').value = '';
    document.getElementById('cli-email').value = '';
    document.getElementById('cli-nit').value = 'CF';
    document.getElementById('cli-tipo').value = 'Consumidor Final';
    document.getElementById('cli-direccion').value = '';
    document.getElementById('cli-notas').value = '';
    const titulo = document.getElementById('form-cliente-titulo');
    if (titulo) titulo.innerText = "➕ Registrar Nuevo Cliente";
    const btn = document.getElementById('btn-guardar-cliente');
    if (btn) btn.innerText = "💾 Guardar Cliente";
};

window.editarCliente = (cid) => {
    const cli = todosLosClientes.find(c => c.id === cid);
    if (!cli) return alert("Cliente no encontrado.");
    const d = cli.data;
    document.getElementById('cli-id-editando').value = cid;
    document.getElementById('cli-nombre').value = d.nombre || '';
    document.getElementById('cli-telefono').value = d.telefono || '';
    document.getElementById('cli-email').value = d.email || '';
    document.getElementById('cli-nit').value = d.nit || 'CF';
    document.getElementById('cli-tipo').value = d.tipo || 'Consumidor Final';
    document.getElementById('cli-direccion').value = d.direccion || '';
    document.getElementById('cli-notas').value = d.notas || '';

    const titulo = document.getElementById('form-cliente-titulo');
    if (titulo) titulo.innerText = `✏️ Editando Cliente: ${d.nombre}`;
    const btn = document.getElementById('btn-guardar-cliente');
    if (btn) btn.innerText = "💾 Actualizar Datos del Cliente";

    const formCont = document.getElementById('contenedor-form-cliente');
    if (formCont && formCont.style.display === 'none') {
        formCont.style.display = 'block';
    }

    const seccionCli = document.getElementById('clientes');
    if (seccionCli) seccionCli.scrollIntoView({ behavior: 'smooth' });
};

window.eliminarCliente = async (cid) => {
    const cli = todosLosClientes.find(c => c.id === cid);
    if (!cli) return;
    const compras = obtenerComprasDeCliente(cid, cli.data.nombre);
    let advertencia = `¿Estás seguro de eliminar el cliente "${cli.data.nombre}"?`;
    if (compras.length > 0) {
        advertencia += `\n\n⚠️ Este cliente tiene ${compras.length} compras asociadas en el historial. Las ventas NO se borrarán, pero el cliente ya no figurará en el directorio activo.`;
    }
    if (!confirm(advertencia)) return;

    try {
        await deleteDoc(doc(db, "clientes", cid));
        alert("✅ Cliente eliminado del directorio.");
        await window.cargarClientes();
    } catch (e) {
        alert("❌ Error al eliminar cliente: " + e.message);
    }
};

window.toggleFormCliente = () => {
    const cont = document.getElementById('contenedor-form-cliente');
    if (!cont) return;
    cont.style.display = (cont.style.display === 'none') ? 'block' : 'none';
};

window.filtrarListaClientes = () => {
    busquedaClienteTerm = (document.getElementById('buscar-cliente-input')?.value || '').toLowerCase().trim();
    filtroTipoClienteActual = document.getElementById('filtro-tipo-cliente')?.value || 'todos';
    renderTablaClientes();
};

function renderTablaClientes() {
    const tbody = document.querySelector('#tabla-clientes tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let filtrados = todosLosClientes.filter(c => {
        const d = c.data;
        const nombre = (d.nombre || '').toLowerCase();
        const tel = (d.telefono || '').toLowerCase();
        const nit = (d.nit || '').toLowerCase();
        const email = (d.email || '').toLowerCase();
        const tipo = d.tipo || '';

        if (busquedaClienteTerm) {
            const match = nombre.includes(busquedaClienteTerm) ||
                          tel.includes(busquedaClienteTerm) ||
                          nit.includes(busquedaClienteTerm) ||
                          email.includes(busquedaClienteTerm);
            if (!match) return false;
        }

        if (filtroTipoClienteActual !== 'todos') {
            const compras = obtenerComprasDeCliente(c.id, d.nombre);
            if (filtroTipoClienteActual === 'con-compras') {
                return compras.length > 0;
            }
            if (filtroTipoClienteActual === 'con-deuda') {
                return compras.some(v => v.data.estadoPago === 'pendiente');
            }
            return tipo === filtroTipoClienteActual;
        }

        return true;
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#888;">No se encontraron clientes registrados con los filtros aplicados.</td></tr>`;
        return;
    }

    filtrados.forEach(c => {
        const d = c.data;
        const compras = obtenerComprasDeCliente(c.id, d.nombre);
        const totalGastado = compras.reduce((sum, v) => sum + (v.data.total !== undefined ? Number(v.data.total) : (Number(v.data.cantidad||0)*Number(v.data.precio||0))), 0);
        const totalPendiente = compras.filter(v => v.data.estadoPago === 'pendiente').reduce((sum, v) => sum + (v.data.total !== undefined ? Number(v.data.total) : (Number(v.data.cantidad||0)*Number(v.data.precio||0))), 0);

        const contactoHTML = `
            <div>
                ${d.telefono ? `<a href="https://wa.me/502${d.telefono.replace(/\D/g,'')}" target="_blank" style="color:var(--primary); font-weight:bold; text-decoration:none;" title="Enviar WhatsApp">📱 ${d.telefono}</a>` : '<span style="color:#aaa;">-</span>'}
                ${d.email ? `<br><small style="color:#666;">✉️ ${d.email}</small>` : ''}
            </div>
        `;

        const tipoBadge = `<span class="badge-tipo-cliente">${d.tipo || 'Consumidor Final'}</span>`;
        const nitDir = `<div><strong>${d.nit || 'CF'}</strong>${d.direccion ? `<br><small style="color:#666;">📍 ${d.direccion}</small>` : ''}</div>`;

        let estadoCuentaBadge = '';
        if (totalPendiente > 0) {
            estadoCuentaBadge = `<span class="pago-badge pago-pendiente" title="Debe Q ${totalPendiente.toFixed(2)}">⏳ Debe Q ${totalPendiente.toFixed(2)}</span>`;
        } else if (compras.length > 0) {
            estadoCuentaBadge = `<span class="pago-badge pago-pagado">🟢 Al día</span>`;
        } else {
            estadoCuentaBadge = `<span style="color:#888; font-size:0.8rem;">Sin compras</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>
                    <span class="cliente-badge-link" onclick="window.verHistorialCliente('${c.id}')" title="Ver perfil e historial completo">
                        <strong>${d.nombre}</strong>
                    </span>
                    ${d.notas ? `<br><small style="color:#777; font-style:italic;">${d.notas.substring(0, 35)}${d.notas.length > 35 ? '...' : ''}</small>` : ''}
                </td>
                <td>${contactoHTML}</td>
                <td>${tipoBadge}</td>
                <td>${nitDir}</td>
                <td style="text-align:right;"><strong>Q ${totalGastado.toFixed(2)}</strong></td>
                <td style="text-align:center;">
                    <span style="font-weight:bold; background:#f0f4f0; padding:2px 8px; border-radius:10px;">${compras.length}</span>
                </td>
                <td>${estadoCuentaBadge}</td>
                <td class="actions-cell">
                    <button class="btn btn-xs btn-view" title="Ver historial de compras" onclick="window.verHistorialCliente('${c.id}')">📜 Historial</button>
                    <button class="btn btn-xs btn-edit" title="Editar datos" onclick="window.editarCliente('${c.id}')">✏️</button>
                    <button class="btn btn-xs btn-danger" title="Eliminar cliente" onclick="window.eliminarCliente('${c.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function actualizarKPIsClientes() {
    const kpiTotal = document.getElementById('kpi-total-clientes');
    const kpiActivosSub = document.getElementById('kpi-clientes-activos-sub');
    const kpiMonto = document.getElementById('kpi-monto-clientes');
    const kpiPedidosSub = document.getElementById('kpi-pedidos-clientes-sub');
    const kpiSaldoPend = document.getElementById('kpi-clientes-saldo-pendiente');
    const kpiPendSub = document.getElementById('kpi-clientes-pend-sub');

    let totalMontoClientes = 0;
    let totalPedidosClientes = 0;
    let totalSaldoPendiente = 0;
    let clientesConCompras = 0;
    let clientesConPendiente = 0;

    todosLosClientes.forEach(c => {
        const compras = obtenerComprasDeCliente(c.id, c.data.nombre);
        if (compras.length > 0) clientesConCompras++;
        let gastado = 0;
        let pend = 0;
        compras.forEach(co => {
            const m = co.data.total !== undefined ? Number(co.data.total) : (Number(co.data.cantidad||0)*Number(co.data.precio||0));
            gastado += m;
            totalPedidosClientes++;
            if (co.data.estadoPago === 'pendiente') {
                pend += m;
            }
        });
        totalMontoClientes += gastado;
        if (pend > 0) {
            totalSaldoPendiente += pend;
            clientesConPendiente++;
        }
    });

    if (kpiTotal) kpiTotal.innerText = todosLosClientes.length;
    if (kpiActivosSub) kpiActivosSub.innerText = `${clientesConCompras} con compras registradas`;
    if (kpiMonto) kpiMonto.innerText = "Q " + totalMontoClientes.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (kpiPedidosSub) kpiPedidosSub.innerText = `${totalPedidosClientes} compras acumuladas`;
    if (kpiSaldoPend) kpiSaldoPend.innerText = "Q " + totalSaldoPendiente.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (kpiPendSub) kpiPendSub.innerText = `${clientesConPendiente} cliente(s) con saldo por cobrar`;
}

window.abrirModalNuevoClienteRapido = () => {
    document.getElementById('rq-cli-nombre').value = '';
    document.getElementById('rq-cli-telefono').value = '';
    document.getElementById('rq-cli-email').value = '';
    document.getElementById('rq-cli-nit').value = 'CF';
    document.getElementById('rq-cli-tipo').value = 'Consumidor Final';
    document.getElementById('rq-cli-notas').value = '';
    document.getElementById('modal-nuevo-cliente-rapido').style.display = 'flex';
};

window.guardarClienteRapido = async () => {
    const nombre = document.getElementById('rq-cli-nombre').value.trim();
    const telefono = document.getElementById('rq-cli-telefono').value.trim();
    const email = document.getElementById('rq-cli-email').value.trim();
    const nit = document.getElementById('rq-cli-nit').value.trim() || 'CF';
    const tipo = document.getElementById('rq-cli-tipo').value;
    const notas = document.getElementById('rq-cli-notas').value.trim();

    if (!nombre) {
        return alert("⚠️ Por favor ingresa el nombre del cliente.");
    }

    const btn = document.getElementById('btn-guardar-cliente-rapido');
    if (btn) { btn.disabled = true; btn.innerText = "Registrando..."; }

    try {
        const datos = {
            nombre,
            telefono,
            email,
            nit,
            tipo,
            direccion: '',
            notas,
            activo: true,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "clientes"), datos);
        alert(`✅ Cliente "${nombre}" registrado con éxito.`);
        window.cerrarModal('modal-nuevo-cliente-rapido');

        await window.cargarClientes();
        actualizarSelectClientesVenta(docRef.id);
    } catch (e) {
        alert("❌ Error al registrar cliente: " + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "💾 Guardar y Seleccionar"; }
    }
};

window.verHistorialCliente = (cid) => {
    const cli = todosLosClientes.find(c => c.id === cid);
    if (!cli) return alert("Cliente no encontrado.");
    clienteActualHistorial = cli;
    const d = cli.data;
    const compras = obtenerComprasDeCliente(cid, d.nombre);

    let totalComprado = 0;
    let totalPagado = 0;
    let totalPendiente = 0;
    const productosMap = {};

    compras.forEach(c => {
        const cd = c.data;
        const monto = cd.total !== undefined ? Number(cd.total) : (Number(cd.cantidad || 0) * Number(cd.precio || 0));
        totalComprado += monto;
        if (cd.estadoPago === 'pendiente') {
            totalPendiente += monto;
        } else {
            totalPagado += monto;
        }

        if (cd.items && Array.isArray(cd.items) && cd.items.length > 0) {
            cd.items.forEach(it => {
                const k = `${it.nombre} ${it.presentacion !== 'N/A' && it.presentacion ? `(${it.presentacion})` : ''}`.trim();
                if (!productosMap[k]) productosMap[k] = { cantidad: 0, unidad: it.unidad || 'u.', monto: 0 };
                productosMap[k].cantidad += (parseFloat(it.cantidad) || 0);
                productosMap[k].monto += (parseFloat(it.subtotal) || (parseFloat(it.cantidad) * parseFloat(it.precio)) || 0);
            });
        } else if (cd.tipo) {
            const nomProd = preciosListaActual[cd.tipo] ? preciosListaActual[cd.tipo].nombre : cd.tipo;
            const unidad = preciosListaActual[cd.tipo] ? preciosListaActual[cd.tipo].unidad : 'u.';
            if (!productosMap[nomProd]) productosMap[nomProd] = { cantidad: 0, unidad: unidad, monto: 0 };
            productosMap[nomProd].cantidad += (parseFloat(cd.cantidad) || 0);
            productosMap[nomProd].monto += monto;
        }
    });

    const productosTopHTML = Object.keys(productosMap).length > 0
        ? Object.entries(productosMap).sort((a,b) => b[1].cantidad - a[1].cantidad).map(([k, v]) => `
            <div style="background:#f1f8e9; border:1px solid #c8e6c9; border-radius:6px; padding:6px 10px; font-size:0.85rem;">
                <strong>☕ ${k}:</strong> ${v.cantidad.toFixed(1)} ${v.unidad} (Q ${v.monto.toFixed(2)})
            </div>
        `).join('')
        : '<span style="color:#888; font-style:italic;">No hay productos registrados en su historial.</span>';

    let comprasRowsHTML = '';
    if (compras.length === 0) {
        comprasRowsHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#888;">Este cliente aún no registra compras en el sistema.</td></tr>`;
    } else {
        compras.forEach(c => {
            const cd = c.data;
            const f = cd.fecha ? new Date(cd.fecha.seconds * 1000).toLocaleDateString('es-GT') : (cd.fechaVentaPersonalizada || 'N/A');
            const total = cd.total !== undefined ? Number(cd.total) : (Number(cd.cantidad||0) * Number(cd.precio||0));
            const badge = cd.estadoPago === 'pendiente' 
                ? '<span class="pago-badge pago-pendiente">🔴 PENDIENTE</span>' 
                : '<span class="pago-badge pago-pagado">🟢 PAGADO</span>';
            
            let prodsTxt = '';
            if (cd.items && Array.isArray(cd.items) && cd.items.length > 0) {
                prodsTxt = cd.items.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(', ');
            } else {
                const nom = preciosListaActual[cd.tipo] ? preciosListaActual[cd.tipo].nombre : cd.tipo;
                prodsTxt = `${cd.cantidad} ${nom}`;
            }

            comprasRowsHTML += `
                <tr>
                    <td>${f}</td>
                    <td style="max-width:280px; font-size:0.85rem;">${prodsTxt}</td>
                    <td style="text-align:right; font-weight:bold; color:var(--primary);">Q ${total.toFixed(2)}</td>
                    <td>${cd.pago || 'Efectivo'}</td>
                    <td>${badge}</td>
                    <td style="text-align:center;">
                        <button type="button" class="btn btn-xs btn-view" title="Ver detalle de venta" onclick="window.verVentaDetalle('${c.id}')">👁️ Ver</button>
                    </td>
                </tr>
            `;
        });
    }

    const telLink = d.telefono ? `<a href="https://wa.me/502${d.telefono.replace(/\D/g,'')}" target="_blank" style="color:var(--primary); font-weight:bold; text-decoration:underline;">📱 ${d.telefono} (WhatsApp)</a>` : 'Sin teléfono';
    const emailLink = d.email ? `<a href="mailto:${d.email}" style="color:var(--primary); text-decoration:underline;">✉️ ${d.email}</a>` : 'Sin correo';

    const modalHTML = `
        <div style="background:#f4f6f4; border-radius:10px; padding:1rem; margin-bottom:1rem; border-left:4px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3 style="margin:0 0 4px 0; color:var(--primary); font-size:1.3rem;">👤 ${d.nombre}</h3>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:6px;">
                        <span class="badge-tipo-cliente" style="font-size:0.8rem; padding:3px 10px;">${d.tipo || 'Consumidor Final'}</span>
                        <span style="font-size:0.85rem; color:#555;">NIT: <strong>${d.nit || 'CF'}</strong></span>
                        ${d.direccion ? `<span style="font-size:0.85rem; color:#555;">📍 ${d.direccion}</span>` : ''}
                    </div>
                    <div style="font-size:0.85rem; display:flex; gap:12px; flex-wrap:wrap;">
                        <span>${telLink}</span>
                        <span>${emailLink}</span>
                    </div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-small btn-primary" onclick="cerrarModal('modal-historial-cliente'); window.iniciarVentaParaCliente('${cid}');" style="min-height:36px; padding:6px 12px;">
                        ➕ Nueva Venta para este Cliente
                    </button>
                </div>
            </div>
            ${d.notas ? `<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #ccc; font-size:0.85rem; color:#555;"><strong>📝 Preferencias / Observaciones:</strong> ${d.notas}</div>` : ''}
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem; margin-bottom:1rem;">
            <div class="dash-mini-card">
                <div class="label">Total Comprado</div>
                <div class="value" style="color:var(--primary); font-size:1.2rem;">Q ${totalComprado.toFixed(2)}</div>
            </div>
            <div class="dash-mini-card">
                <div class="label">Total Pedidos</div>
                <div class="value" style="color:var(--secondary); font-size:1.2rem;">${compras.length}</div>
            </div>
            <div class="dash-mini-card">
                <div class="label">Total Pagado</div>
                <div class="value" style="color:#2e7d32; font-size:1.2rem;">Q ${totalPagado.toFixed(2)}</div>
            </div>
            <div class="dash-mini-card" style="border-left-color:${totalPendiente > 0 ? 'var(--danger)' : '#ccc'};">
                <div class="label">Saldo Pendiente</div>
                <div class="value" style="color:${totalPendiente > 0 ? 'var(--danger)' : '#888'}; font-size:1.2rem;">Q ${totalPendiente.toFixed(2)}</div>
            </div>
        </div>

        ${(() => {
            const pedidosCli = todosLosPedidos.filter(p => p.data.clienteId === cid || (p.data.clienteNombre && p.data.clienteNombre.trim().toLowerCase() === d.nombre.trim().toLowerCase()));
            const pedidosPendientesCli = pedidosCli.filter(p => p.data.estado === 'pendiente_entrega');
            if (pedidosPendientesCli.length === 0) return '';
            return `
                <div style="background:#fff8e1; border:1px solid #ffe082; border-left:4px solid #b78103; border-radius:8px; padding:10px 14px; margin-bottom:1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <strong style="color:#b78103; font-size:0.95rem;">🚚 ${pedidosPendientesCli.length} Pedido(s) Pendiente(s) de Entrega para este Cliente:</strong>
                        <button type="button" class="btn btn-xs btn-primary" onclick="cerrarModal('modal-historial-cliente'); window.irASeccionPedidos();" style="width:auto; padding:4px 10px;">
                            Ver en Pedidos
                        </button>
                    </div>
                    <div style="margin-top:6px; font-size:0.85rem; color:#444;">
                        ${pedidosPendientesCli.map(p => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px dashed #eed; flex-wrap:wrap; gap:6px;">
                                <span><strong>${p.data.folio || 'PED'}</strong>: ${p.data.items ? p.data.items.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(', ') : 'Productos'} &bull; Entrega: <strong>${p.data.fechaEntregaCompromiso || 'N/A'}</strong></span>
                                <span style="display:flex; gap:6px; align-items:center;">
                                    <strong style="color:var(--primary);">Q ${(p.data.total||0).toFixed(2)}</strong>
                                    <button type="button" class="btn btn-xs btn-success" onclick="cerrarModal('modal-historial-cliente'); abrirModalEntregarPedido('${p.id}');" style="padding:2px 8px; font-weight:bold;">🚚 Entregar</button>
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        })()}

        <h4 style="color:var(--secondary); margin:1rem 0 0.5rem; font-size:0.95rem;">📦 Hábitos de Consumo / Productos Adquiridos</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.25rem;">
            ${productosTopHTML}
        </div>

        <h4 style="color:var(--primary); margin:1rem 0 0.5rem; font-size:0.95rem;">📜 Historial Cronológico de Compras (${compras.length})</h4>
        <div class="table-wrapper" style="max-height:300px; overflow-y:auto; margin-top:0.25rem;">
            <table style="width:100%; font-size:0.85rem;">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th style="text-align:right;">Total (Q)</th>
                        <th>Método Pago</th>
                        <th>Estado</th>
                        <th style="text-align:center;">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${comprasRowsHTML}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('modal-historial-contenido').innerHTML = modalHTML;
    document.getElementById('modal-historial-cliente').style.display = 'flex';
};

window.iniciarVentaParaCliente = (cid) => {
    const itemMenuVentas = document.querySelector('.menu-item:nth-child(2)');
    window.showSection('ventas', itemMenuVentas);
    setTimeout(() => {
        actualizarSelectClientesVenta(cid);
    }, 150);
};

window.generarPDFHistorialCliente = () => {
    if (!clienteActualHistorial) return alert("No hay cliente seleccionado.");
    const c = clienteActualHistorial;
    const d = c.data;
    const compras = obtenerComprasDeCliente(c.id, d.nombre);

    const jsPDFClass = getJsPDF();
    if (!jsPDFClass) return alert("Librería jsPDF no disponible.");
    const doc = new jsPDFClass({ orientation: "portrait", unit: "mm", format: "letter" });

    // Encabezado
    doc.setFillColor(44, 94, 46);
    doc.rect(0, 0, 216, 26, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FINCA LOS ROBLES", 14, 12);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Estado de Cuenta e Historial de Compras de Cliente", 14, 19);

    doc.setFontSize(8);
    doc.text("Fecha: " + new Date().toLocaleDateString('es-GT'), 160, 19);

    let y = 34;
    // Datos del cliente
    doc.setFillColor(245, 245, 240);
    doc.roundedRect(14, y, 188, 30, 3, 3, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 94, 46);
    doc.text("CLIENTE: " + (d.nombre || '').toUpperCase(), 18, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("Tipo: " + (d.tipo || 'Consumidor Final'), 18, y + 14);
    doc.text("NIT / Identificación: " + (d.nit || 'CF'), 100, y + 14);
    doc.text("Teléfono / WhatsApp: " + (d.telefono || 'N/A'), 18, y + 21);
    doc.text("Correo: " + (d.email || 'N/A'), 100, y + 21);
    if (d.direccion) doc.text("Dirección: " + d.direccion, 18, y + 27);

    y += 36;

    // Resumen numérico
    let totalComprado = 0;
    let totalPagado = 0;
    let totalPendiente = 0;
    compras.forEach(co => {
        const m = co.data.total !== undefined ? Number(co.data.total) : (Number(co.data.cantidad||0)*Number(co.data.precio||0));
        totalComprado += m;
        if (co.data.estadoPago === 'pendiente') totalPendiente += m;
        else totalPagado += m;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(44, 94, 46);
    doc.text("RESUMEN FINANCIERO DEL CLIENTE", 14, y);
    y += 4;

    const wCard = 44;
    doc.setFillColor(235, 243, 235);
    doc.rect(14, y, wCard, 14, 'F');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text("TOTAL COMPRADO", 16, y + 4);
    doc.setFontSize(10);
    doc.setTextColor(44, 94, 46);
    doc.text("Q " + totalComprado.toFixed(2), 16, y + 11);

    doc.setFillColor(235, 243, 235);
    doc.rect(62, y, wCard, 14, 'F');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text("TOTAL PAGADO", 64, y + 4);
    doc.setFontSize(10);
    doc.setTextColor(46, 125, 50);
    doc.text("Q " + totalPagado.toFixed(2), 64, y + 11);

    doc.setFillColor(totalPendiente > 0 ? 255 : 240, totalPendiente > 0 ? 235 : 240, totalPendiente > 0 ? 238 : 240);
    doc.rect(110, y, wCard, 14, 'F');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text("SALDO PENDIENTE", 112, y + 4);
    doc.setFontSize(10);
    doc.setTextColor(totalPendiente > 0 ? 198 : 100, totalPendiente > 0 ? 40 : 100, totalPendiente > 0 ? 40 : 100);
    doc.text("Q " + totalPendiente.toFixed(2), 112, y + 11);

    doc.setFillColor(235, 243, 235);
    doc.rect(158, y, wCard, 14, 'F');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text("PEDIDOS TOTALES", 160, y + 4);
    doc.setFontSize(10);
    doc.setTextColor(139, 90, 43);
    doc.text(compras.length + " compras", 160, y + 11);

    y += 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(44, 94, 46);
    doc.text("DETALLE DE COMPRAS REALIZADAS (" + compras.length + ")", 14, y);
    y += 4;

    doc.setFillColor(44, 94, 46);
    doc.rect(14, y, 188, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("FECHA", 16, y + 5);
    doc.text("PRODUCTOS ADQUIRIDOS", 42, y + 5);
    doc.text("PAGO", 130, y + 5);
    doc.text("ESTADO", 155, y + 5);
    doc.text("TOTAL (Q)", 182, y + 5);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(8);

    if (compras.length === 0) {
        doc.text("No registra compras en el sistema.", 16, y + 6);
        y += 10;
    } else {
        compras.forEach((co, idx) => {
            if (y > 255) {
                doc.addPage();
                y = 20;
                doc.setFillColor(44, 94, 46);
                doc.rect(14, y, 188, 7, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text("FECHA", 16, y + 5);
                doc.text("PRODUCTOS ADQUIRIDOS", 42, y + 5);
                doc.text("PAGO", 130, y + 5);
                doc.text("ESTADO", 155, y + 5);
                doc.text("TOTAL (Q)", 182, y + 5);
                y += 7;
                doc.setFont("helvetica", "normal");
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(8);
            }

            const cd = co.data;
            const f = cd.fecha ? new Date(cd.fecha.seconds * 1000).toLocaleDateString('es-GT') : (cd.fechaVentaPersonalizada || 'N/A');
            const total = cd.total !== undefined ? Number(cd.total) : (Number(cd.cantidad||0) * Number(cd.precio||0));
            const est = (cd.estadoPago === 'pendiente') ? 'PENDIENTE' : 'PAGADO';

            let prods = '';
            if (cd.items && Array.isArray(cd.items) && cd.items.length > 0) {
                prods = cd.items.map(it => `${it.cantidad} ${it.unidad} ${it.nombre}`).join(', ');
            } else {
                const nom = preciosListaActual[cd.tipo] ? preciosListaActual[cd.tipo].nombre : cd.tipo;
                prods = `${cd.cantidad} ${nom}`;
            }

            if (idx % 2 === 1) {
                doc.setFillColor(248, 250, 248);
                doc.rect(14, y, 188, 7, 'F');
            }

            doc.text(f, 16, y + 5);
            const prodsTrunc = prods.length > 50 ? prods.substring(0, 48) + '...' : prods;
            doc.text(prodsTrunc, 42, y + 5);
            doc.text(cd.pago || 'Efectivo', 130, y + 5);
            if (est === 'PENDIENTE') {
                doc.setTextColor(198, 40, 40);
                doc.text("PENDIENTE", 155, y + 5);
            } else {
                doc.setTextColor(46, 125, 50);
                doc.text("PAGADO", 155, y + 5);
            }
            doc.setTextColor(40, 40, 40);
            doc.text("Q " + total.toFixed(2), 182, y + 5);

            y += 7;
        });
    }

    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("Generado: " + new Date().toLocaleString('es-GT') + "  |  Finca Los Robles - Gestión de Clientes  |  v2026.09.11", 108, 270, { align: "center" });

    doc.save(`Historial_${(d.nombre || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);
    alert("✅ Estado de Cuenta / Historial de Cliente descargado en PDF.");
};

// Inicialización de componentes al cargar el script
construirCategoriasSCA();
window.calcularCatacion();
generarTablaTostado();
