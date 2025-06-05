function cerrarSesion() {
  localStorage.removeItem('usuario');
  alert('Sesión cerrada correctamente.');
  window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos y mostrarlos como lista con modal
  obtenerYMostrarProductos();

  // Menu hamburguesa
  const menuToggle = document.getElementById('menuToggle');

    if (menuToggle && authButtons) {
        menuToggle.onclick = () => {
            authButtons.classList.toggle('show');
        }
    }
  // Mostrar/Ocultar botones según sesión y bienvenida
    const usuarioLogeado = JSON.parse(localStorage.getItem('usuario'));
    const logoutButton = document.getElementById('logoutButton');
    const divBienvenida = document.getElementById('bienvenida');

    if (usuarioLogeado) {
        if (divBienvenida) {
            divBienvenida.textContent = `¡Bienvenido, ${usuarioLogeado.nombre}!`;
        }
        if (authButtons) authButtons.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'flex';
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (logoutButton) logoutButton.style.display = 'none';
    }
});

// API base URL
const apiBaseUrl = 'https://fixmyshoesadmin.runasp.net';

// Función para crear y mostrar modal de producto
function crearModalProducto(producto) {
  // Crear contenedor modal
  const modal = document.createElement('div');
  modal.className = 'modal';

  // Modal content
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <img src="${producto.prodImg && producto.prodImg.length ? producto.prodImg[0] : 'images/default.png'}" alt="${producto.prodNombre}" />
      <h2>${producto.prodNombre}</h2>
      <p>${producto.prodDescripcion}</p>
      <p class="producto-precio">Precio: $${(typeof producto.prodPrecio === 'number' ? producto.prodPrecio : 0).toFixed(2)}</p>
      <button class="btn-agregar-modal">Agregar al carrito</button>
    </div>
  `;

  // Añadir modal al body
  document.body.appendChild(modal);

  // Mostrar modal
  modal.style.display = 'block';

  // Cerrar modal al hacer click en la X
  modal.querySelector('.close').onclick = () => {
    modal.remove();
  };

  // Cerrar modal si se hace click fuera del contenido
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };

  // Agregar al carrito desde modal
  modal.querySelector('.btn-agregar-modal').onclick = () => {
    const cantidad = parseInt(prompt(`¿Cuántas unidades de "${producto.prodNombre}" deseas agregar al carrito?`, "1"));
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Cantidad inválida. No se agregó nada al carrito.");
      return;
    }
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(p => p.idProducto == producto.idProducto);

    if (index >= 0) {
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        idProducto: producto.idProducto,
        nombre: producto.prodNombre,
        precio: typeof producto.prodPrecio === 'number' ? producto.prodPrecio : 0,
        imagen: producto.prodImg && producto.prodImg.length ? producto.prodImg[0] : 'images/default.png',
        cantidad
      });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.prodNombre} agregado (${cantidad}) al carrito`);
    modal.remove();
  };
}

// Función para obtener y mostrar productos en lista con botones para abrir modal
async function obtenerYMostrarProductos() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/productos`);
    if (!res.ok) throw new Error('Error al obtener productos');
    const productos = await res.json();

    const contenedor = document.getElementById('productosGrid');
    if (!contenedor) {
      console.error('No se encontró el contenedor #productosGrid');
      return;
    }
    contenedor.innerHTML = '';

    productos.forEach(prod => {
      const urlImagen = Array.isArray(prod.prodImg) && prod.prodImg.length > 0
        ? prod.prodImg[0]
        : 'images/default.png';

      const precio = typeof prod.prodPrecio === 'number' ? prod.prodPrecio : 0;

      const tarjeta = document.createElement('div');
      tarjeta.className = 'producto-card';
      tarjeta.innerHTML = `
        <img src="${urlImagen}" alt="${prod.prodNombre}" class="producto-imagen" />
        <h3 class="producto-nombre">${prod.prodNombre}</h3>
        <p class="producto-descripcion">${prod.prodDescripcion}</p>
        <p class="producto-precio">$${precio.toFixed(2)}</p>
        <button class="btn-ver-detalles">Ver detalles</button>
      `;

      // Al hacer click en "Ver detalles", abrir modal con info y botón agregar carrito
      tarjeta.querySelector('.btn-ver-detalles').onclick = () => {
        crearModalProducto(prod);
      };

      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}
