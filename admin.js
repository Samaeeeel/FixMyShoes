const sections = document.querySelectorAll('.admin-section');
const menuButtons = document.querySelectorAll('#menuAdmin button');
const apiBase = 'https://fixmyshoesadmin.runasp.net/api';

const modal = document.getElementById('modalForm');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const formAdmin = document.getElementById('formAdmin');

let currentSection = null;
let editId = null; // ID del registro a editar, si es null => agregar

// Abrir modal formulario
function abrirModal(titulo) {
  modalTitle.textContent = titulo;
  modal.style.display = 'block';
}

// Cerrar modal
closeModalBtn.onclick = () => {
  modal.style.display = 'none';
  formAdmin.innerHTML = '';
  editId = null;
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
    formAdmin.innerHTML = '';
    editId = null;
  }
};

// Manejo de navegación
menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    menuButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    sections.forEach(sec => sec.classList.remove('active'));
    const id = btn.getAttribute('data-section');
    document.getElementById(id).classList.add('active');

    currentSection = id;
    cargarDatos(id);
  });
});

async function cargarDatos(seccion) {
  const contenedor = document.getElementById(seccion);
  contenedor.innerHTML = '<p>Cargando...</p>';

  try {
    switch (seccion) {
      case 'usuarios': {
        const res = await fetch(`${apiBase}/usuarios`);
        const usuarios = await res.json();
        contenedor.innerHTML = renderTablaUsuarios(usuarios);
        document.getElementById('btnAgregarUsuario').onclick = () => abrirFormularioUsuario();
        break;
      }
      case 'clientes': {
        const res = await fetch(`${apiBase}/clientes`);
        const clientes = await res.json();
        contenedor.innerHTML = renderTablaClientes(clientes);
        document.getElementById('btnAgregarCliente').onclick = () => abrirFormularioCliente();
        break;
      }
      case 'productos': {
        const res = await fetch(`${apiBase}/productos`);
        const productos = await res.json();
        contenedor.innerHTML = renderTablaProductos(productos);
        document.getElementById('btnAgregarProducto').onclick = () => abrirFormularioProducto();
        break;
      }
      case 'facturas': {
        const res = await fetch(`${apiBase}/facturas`);
        const facturas = await res.json();
        contenedor.innerHTML = renderTablaFacturas(facturas);
        break;
      }
      case 'detalles': {
        const res = await fetch(`${apiBase}/detallefacturas`);
        const detalles = await res.json();
        contenedor.innerHTML = renderTablaDetalles(detalles);
        break;
      }
    }
  } catch (error) {
    contenedor.innerHTML = `<p>Error cargando datos: ${error.message}</p>`;
  }
}

// Render tablas (igual que antes, solo con botón para abrir modal)
function renderTablaUsuarios(usuarios) {
  return `
    <button id="btnAgregarUsuario">Agregar Usuario</button>
    <table>
      <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
      <tbody>
        ${usuarios.map(u => `
          <tr>
            <td>${u.idUsuario}</td>
            <td>${u.nombre}</td>
            <td>${u.correo}</td>
            <td>${u.rolNombre}</td>
            <td>
              <button onclick="abrirFormularioUsuario(${u.idUsuario})">Editar</button>
              <button onclick="eliminarUsuario(${u.idUsuario})">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderTablaClientes(clientes) {
  return `
    <button id="btnAgregarCliente">Agregar Cliente</button>
    <table>
      <thead><tr><th>ID Cliente</th><th>ID Usuario</th><th>Nombre</th><th>Apellido</th><th>Cédula/RUC</th><th>Teléfono</th><th>Dirección</th><th>Fecha Nac.</th><th>Acciones</th></tr></thead>
      <tbody>
        ${clientes.map(c => `
          <tr>
            <td>${c.idCliente}</td><td>${c.idUsuario}</td><td>${c.nombre}</td><td>${c.apellido}</td><td>${c.cedulaRuc}</td><td>${c.telefono}</td><td>${c.direccion}</td><td>${c.fechaNacimiento}</td>
            <td>
              <button onclick="abrirFormularioCliente(${c.idCliente})">Editar</button>
              <button onclick="eliminarCliente(${c.idCliente})">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderTablaProductos(productos) {
  return `
    <button id="btnAgregarProducto">Agregar Producto</button>
    <table>
      <thead><tr><th>ID Producto</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Acciones</th></tr></thead>
      <tbody>
        ${productos.map(p => `
          <tr>
            <td>${p.idProducto}</td><td>${p.prodNombre}</td><td>${p.prodDescripcion}</td><td>${p.prodPrecio}</td><td>${p.prodStock}</td><td>${p.prodCategoria}</td>
            <td>
              <button onclick="abrirFormularioProducto(${p.idProducto})">Editar</button>
              <button onclick="eliminarProducto(${p.idProducto})">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// Resto tablas igual que antes para facturas y detalles (no modales)

function renderTablaFacturas(facturas) {
  return `
    <table>
      <thead><tr><th>ID Factura</th><th>ID Cliente</th><th>Fecha</th><th>Pago</th><th>Dirección</th><th>Subtotal</th><th>IVA</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        ${facturas.map(f => `
          <tr>
            <td>${f.idFactura}</td><td>${f.idCliente}</td><td>${f.fechaHora}</td><td>${f.metodoPago}</td><td>${f.direccion}</td><td>${f.subtotal}</td><td>${f.iva}</td><td>${f.total}</td><td>${f.estado}</td>
            <td><button onclick="editarEstadoFactura(${f.idFactura}, '${f.estado}')">Editar Estado</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderTablaDetalles(detalles) {
  return `
    <table>
      <thead><tr><th>ID Detalle</th><th>ID Factura</th><th>ID Producto</th><th>Cantidad</th><th>Precio Venta</th><th>Acciones</th></tr></thead>
      <tbody>
        ${detalles.map(d => `
          <tr>
            <td>${d.idDetalleFactura}</td><td>${d.idFactura}</td><td>${d.idProducto}</td><td>${d.cantidad}</td><td>${d.precioVenta}</td>
            <td><button onclick="editarDetalleFactura(${d.idDetalleFactura}, ${d.cantidad})">Editar</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

/* --- CRUD --- */
// PRODUCTOS
function abrirFormularioProducto(id = null) {
  editId = id;
  modal.style.display = 'block';
  modalTitle.textContent = id ? 'Editar Producto' : 'Agregar Producto';

  if (id) {
    fetch(`${apiBase}/productos/${id}`)
      .then(res => res.json())
      .then(p => {
        formAdmin.innerHTML = `
          <input type="hidden" name="idProducto" value="${p.idProducto}" />
          <label>Nombre:<input type="text" name="prodNombre" value="${p.prodNombre}" required /></label><br/>
          <label>Descripción:<input type="text" name="prodDescripcion" value="${p.prodDescripcion}" required /></label><br/>
          <label>Precio:<input type="number" step="0.01" name="prodPrecio" value="${p.prodPrecio}" required /></label><br/>
          <label>Stock:<input type="number" name="prodStock" value="${p.prodStock}" required /></label><br/>
          <label>Categoría:<input type="text" name="prodCategoria" value="${p.prodCategoria}" required /></label><br/>
          <label>Proveedor:<input type="text" name="prodProveedor" value="FIXMYSHOES" readonly /></label><br/>
          <button type="submit">${id ? 'Guardar cambios' : 'Crear producto'}</button>
        `;
      });
  } else {
    formAdmin.innerHTML = `
      <label>Nombre:<input type="text" name="prodNombre" required /></label><br/>
      <label>Descripción:<input type="text" name="prodDescripcion" required /></label><br/>
      <label>Precio:<input type="number" step="0.01" name="prodPrecio" required /></label><br/>
      <label>Stock:<input type="number" name="prodStock" required /></label><br/>
      <label>Categoría:<input type="text" name="prodCategoria" required /></label><br/>
      <button type="submit">Crear producto</button>
    `;
  }
}


// USUARIOS
async function eliminarUsuario(id) {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
  const res = await fetch(`${apiBase}/usuarios/${id}`, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar usuario');
  alert('Usuario eliminado');
  cargarDatos('usuarios');
}

// Formulario usuario
function abrirFormularioUsuario(id = null) {
  editId = id;
  modal.style.display = 'block';
  modalTitle.textContent = id ? 'Editar Usuario' : 'Agregar Usuario';

  // Si es editar, cargar datos
  if (id) {
    fetch(`${apiBase}/usuarios/${id}`)
      .then(res => res.json())
      .then(u => {
        formAdmin.innerHTML = `
          <input type="hidden" name="idUsuario" value="${u.idUsuario}" />
          <label>Nombre:<input type="text" name="nombre" value="${u.nombre}" required /></label><br/>
          <label>Correo:<input type="email" name="correo" value="${u.correo}" required /></label><br/>
          <label>Rol:
            <select name="idRol" required>
              <option value="1" ${u.idRol == 1 ? 'selected' : ''}>Administrador</option>
              <option value="2" ${u.idRol == 2 ? 'selected' : ''}>Cliente</option>
            </select>
          </label><br/>
          <label>Contraseña: <input type="password" name="password" placeholder="Nueva contraseña" /></label><br/>
          <button type="submit">${id ? 'Guardar cambios' : 'Crear usuario'}</button>
        `;
      });
  } else {
    // Formulario vacío para agregar
    formAdmin.innerHTML = `
      <label>Nombre:<input type="text" name="nombre" required /></label><br/>
      <label>Correo:<input type="email" name="correo" required /></label><br/>
      <label>Rol:
        <select name="idRol" required>
          <option value="1">Administrador</option>
          <option value="2" selected>Cliente</option>
        </select>
      </label><br/>
      <label>Contraseña: <input type="password" name="password" required /></label><br/>
      <button type="submit">Crear usuario</button>
    `;
  }
}

// Enviar formulario usuario
formAdmin.onsubmit = async e => {
  e.preventDefault();
  const formData = new FormData(formAdmin);
  const data = Object.fromEntries(formData.entries());

  if (editId) {
    // Editar usuario
    if (!data.password) delete data.password; // Si no cambia contraseña, no enviar
    const res = await fetch(`${apiBase}/usuarios/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) return alert('Error actualizando usuario');
    alert('Usuario actualizado');
  } else {
    // Crear usuario
    if (!data.password) {
      alert('La contraseña es obligatoria');
      return;
    }
    const res = await fetch(`${apiBase}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) return alert('Error creando usuario');
    alert('Usuario creado');
  }
  modal.style.display = 'none';
  cargarDatos('usuarios');
};


// CLIENTES

async function eliminarCliente(id) {
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
  const res = await fetch(`${apiBase}/clientes/${id}`, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar cliente');
  alert('Cliente eliminado');
  cargarDatos('clientes');
}

function abrirFormularioCliente(id = null) {
  editId = id;
  modal.style.display = 'block';
  modalTitle.textContent = id ? 'Editar Cliente' : 'Agregar Cliente';

  if (id) {
    fetch(`${apiBase}/clientes/${id}`)
      .then(res => res.json())
      .then(c => {
        formAdmin.innerHTML = `
          <input type="hidden" name="idCliente" value="${c.idCliente}" />
          <input type="hidden" name="idUsuario" value="${c.idUsuario}" />
          <label>Nombre:<input type="text" name="nombre" value="${c.nombre}" required /></label><br/>
          <label>Apellido:<input type="text" name="apellido" value="${c.apellido}" required /></label><br/>
          <label>Cédula/RUC:<input type="text" name="cedulaRuc" value="${c.cedulaRuc}" required /></label><br/>
          <label>Teléfono:<input type="text" name="telefono" value="${c.telefono}" required /></label><br/>
          <label>Dirección:<input type="text" name="direccion" value="${c.direccion}" required /></label><br/>
          <label>Fecha de Nac.:<input type="date" name="fechaNacimiento" value="${c.fechaNacimiento?.slice(0, 10)}" required /></label><br/>
          <button type="submit">${id ? 'Guardar cambios' : 'Crear cliente'}</button>
        `;
      });
  } else {
    formAdmin.innerHTML = `
      <label>Nombre:<input type="text" name="nombre" required /></label><br/>
      <label>Apellido:<input type="text" name="apellido" required /></label><br/>
      <label>Cédula/RUC:<input type="text" name="cedulaRuc" required /></label><br/>
      <label>Teléfono:<input type="text" name="telefono" required /></label><br/>
      <label>Dirección:<input type="text" name="direccion" required /></label><br/>
      <label>Fecha de Nac.:<input type="date" name="fechaNacimiento" required /></label><br/>
      <button type="submit">Crear cliente</button>
    `;
  }
}

formAdmin.onsubmit = async e => {
  e.preventDefault();
  const formData = new FormData(formAdmin);
  const data = Object.fromEntries(formData.entries());

  if (currentSection === 'usuarios') {
    if (editId) {
      if (!data.password) delete data.password;
      const res = await fetch(`${apiBase}/usuarios/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return alert('Error actualizando usuario');
      alert('Usuario actualizado');
    } else {
      if (!data.password) {
        alert('La contraseña es obligatoria');
        return;
      }
      const res = await fetch(`${apiBase}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return alert('Error creando usuario');
      alert('Usuario creado');
    }
    modal.style.display = 'none';
    cargarDatos('usuarios');
  }
  else if (currentSection === 'clientes') {
    if (editId) {
      const res = await fetch(`${apiBase}/clientes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return alert('Error actualizando cliente');
      alert('Cliente actualizado');
    } else {
      const res = await fetch(`${apiBase}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return alert('Error creando cliente');
      alert('Cliente creado');
    }
    modal.style.display = 'none';
    cargarDatos('clientes');
  }
  else if (currentSection === 'productos') {
    if (editId) {
      const res = await fetch(`${apiBase}/productos/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prodNombre: data.prodNombre,
          prodDescripcion: data.prodDescripcion,
          prodPrecio: parseFloat(data.prodPrecio),
          prodStock: parseInt(data.prodStock),
          prodCategoria: data.prodCategoria
        })
      });
      if (!res.ok) return alert('Error actualizando producto');
      alert('Producto actualizado');
    } else {
      const res = await fetch(`${apiBase}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prodNombre: data.prodNombre,
          prodDescripcion: data.prodDescripcion,
          prodPrecio: parseFloat(data.prodPrecio),
          prodStock: parseInt(data.prodStock),
          prodCategoria: data.prodCategoria
        })
      });
      if (!res.ok) return alert('Error creando producto');
      alert('Producto creado');
    }
    modal.style.display = 'none';
    cargarDatos('productos');
  }
};

// FUNCIONES ELIMINAR (igual que antes)

async function eliminarUsuario(id) {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
  const res = await fetch(`${apiBase}/usuarios/${id}`, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar usuario');
  alert('Usuario eliminado');
  cargarDatos('usuarios');
}

async function eliminarCliente(id) {
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
  const res = await fetch(`${apiBase}/clientes/${id}`, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar cliente');
  alert('Cliente eliminado');
  cargarDatos('clientes');
}

async function eliminarProducto(id) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
  const res = await fetch(`${apiBase}/productos/${id}`, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar producto');
  alert('Producto eliminado');
  cargarDatos('productos');
}

// EDITAR ESTADO FACTURAS y CANTIDAD DETALLES igual que antes

async function editarEstadoFactura(idFactura, estadoActual) {
  const nuevoEstado = prompt('Nuevo estado:', estadoActual);
  if (!nuevoEstado || nuevoEstado === estadoActual) return;
  const res = await fetch(`${apiBase}/facturas/${idFactura}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: nuevoEstado })
  });
  if (!res.ok) return alert('Error al actualizar estado');
  alert('Estado actualizado');
  cargarDatos('facturas');
}

async function editarDetalleFactura(idDetalle, cantidadActual) {
  const nuevaCantidad = parseInt(prompt('Nueva cantidad:', cantidadActual));
  if (isNaN(nuevaCantidad) || nuevaCantidad === cantidadActual) return;
  const res = await fetch(`${apiBase}/detallefacturas/${idDetalle}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad: nuevaCantidad })
  });
  if (!res.ok) return alert('Error al actualizar detalle');
  alert('Detalle actualizado');
  cargarDatos('detalles');
}

// Evento logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = '../index.html';
});

// Carga inicial sección usuarios
currentSection = 'usuarios';
cargarDatos('usuarios');

// Hacer funciones globales para botones inline
window.abrirFormularioUsuario = abrirFormularioUsuario;
window.eliminarUsuario = eliminarUsuario;
window.abrirFormularioCliente = abrirFormularioCliente;
window.eliminarCliente = eliminarCliente;
window.abrirFormularioProducto = abrirFormularioProducto;
window.eliminarProducto = eliminarProducto;
window.editarEstadoFactura = editarEstadoFactura;
window.editarDetalleFactura = editarDetalleFactura;
