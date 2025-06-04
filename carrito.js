const carritoContainer = document.getElementById('carrito');
const totalContainer = document.getElementById('totalContainer');
const btnComprar = document.getElementById('btnComprar');

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function renderCarrito() {
  if (carrito.length === 0) {
    carritoContainer.innerHTML = "<p style='text-align:center;'>Tu carrito está vacío</p>";
    totalContainer.textContent = "";
    btnComprar.disabled = true;
    return;
  }

  let total = 0;
  carritoContainer.innerHTML = carrito.map((p, i) => {
    total += p.precio * p.cantidad;
    return `
        <div style="margin: 1rem; padding: 1rem; border: 1px solid #ccc;">
          <img src="${p.imagen}" alt="${p.nombre}" style="width: 80px;" />
          <h3>${p.nombre}</h3>
          <p>Precio unitario: $${p.precio.toFixed(2)}</p>
          <p>
            Cantidad: 
            <button onclick="cambiarCantidad(${i}, -1)">-</button>
            ${p.cantidad}
            <button onclick="cambiarCantidad(${i}, 1)">+</button>
          </p>
          <p>Subtotal: $${(p.precio * p.cantidad).toFixed(2)}</p>
          <button onclick="eliminarProducto(${i})">🗑️ Eliminar</button>
        </div>
      `;
  }).join('');

  totalContainer.textContent = `Total: $${total.toFixed(2)}`;
  btnComprar.disabled = false;
}

function cambiarCantidad(index, delta) {
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderCarrito();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderCarrito();
}

async function confirmarCompra() {
  if (carrito.length === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    alert('Debes iniciar sesión para realizar una compra.');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Obtener cliente asociado al idUsuario del usuario logeado
    const resCliente = await fetch(`http://fixmyshoesadmin.runasp.net/api/clientes`);
    if (!resCliente.ok) throw new Error('Error al obtener clientes');
    const clientes = await resCliente.json();

    const cliente = clientes.find(c => c.idUsuario === usuario.idUsuario);
    if (!cliente) {
      alert('No se encontró cliente asociado al usuario.');
      return;
    }

    // Construir el JSON para la API /api/integracion/compra
    const compraData = {
      carrito: {
        productos: carrito.map(p => ({
          idProducto: parseInt(p.idProducto || p.id), // según cómo guardes el id en carrito
          cantidad: parseInt(p.cantidad)
        }))
      },
      direccion: cliente.direccion || "Dirección cliente",
      metodoPago: "Transaccion", // o pedir al usuario
      cliente: {
        cliCedula: cliente.cedulaRuc,
        cliNombre: cliente.nombre,
        cliApellido: cliente.apellido,
        cliTelefono: cliente.telefono
      }
    };

    // POST a la API de compra
    const resCompra = await fetch('http://fixmyshoes.runasp.net/api/integracion/compra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compraData)
    });

    if (!resCompra.ok) {
      const errorBody = await resCompra.text();
      console.error("Error al crear compra:", resCompra.status, errorBody);
      throw new Error('Error al crear la compra');
    }

    const compraCreada = await resCompra.json();
    console.log("idFactura:", compraCreada?.idFactura);
    console.log("numeroFactura:", compraCreada?.numeroFactura);
    console.log("Respuesta completa de compra:", compraCreada);
    console.log('Compra creada:', compraCreada);


    // Si compraCreada es un número, ese es el idFactura:
    const idFactura = compraCreada;
    // Guardar idFactura en localStorage para utilizarlo después
    localStorage.setItem('idFactura', idFactura);
    // Redirigir a la página de factura

    if (idFactura == null) {
      console.error("Error: idFactura es null o undefined.");
      throw new Error("No se puede confirmar la compra sin un identificador de factura.");
    }
/*
    let resConfirmar = await fetch('http://fixmyshoes.runasp.net/api/integracion/confirmarCompra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idFactura })
    });

    if (!resConfirmar.ok) {
      const errorConfirmarBody = await resConfirmar.text();
      console.error("Error al confirmar compra:", resConfirmar.status, errorConfirmarBody);
      throw new Error('Error al confirmar la compra');
    }*/

    alert('Factura realizada con exito!');
    carrito = [];
    renderCarrito();

  } catch (error) {
    console.error(error);
    alert('Hubo un error al procesar la compra.');
  }

  window.location.href = 'factura.html';
}



// Escucha el click para confirmar compra
btnComprar.addEventListener('click', confirmarCompra);

// Render inicial
renderCarrito();

// Funciones globales para botones dentro del html
window.cambiarCantidad = cambiarCantidad;
window.eliminarProducto = eliminarProducto;
