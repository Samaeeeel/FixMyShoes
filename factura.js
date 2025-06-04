document.addEventListener('DOMContentLoaded', async () => {
    const idFactura = localStorage.getItem('idFactura');

    if (!idFactura) {
        alert('No se encontró la factura.');
        window.location.href = '../index.html'; // Redirigir si no hay factura
        return;
    }

    try {
        // Recupera los detalles de la factura con la API usando el idFactura
        const resFactura = await fetch(`http://fixmyshoesadmin.runasp.net/api/facturas/${idFactura}`);
        if (!resFactura.ok) throw new Error('Error al obtener la factura');
        const factura = await resFactura.json();

        // Recupera los detalles del carrito
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Recupera el usuario del localStorage
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        // Mostrar los detalles de la factura en el HTML
        mostrarFactura(factura, carrito, usuario);
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al cargar la factura.');
    }

    // Agregar el evento para el botón de "Volver a los productos"
    document.getElementById('regresarBtn').addEventListener('click', () => {
        // Eliminar el idFactura y carrito del localStorage
        localStorage.removeItem('idFactura');
        localStorage.removeItem('carrito');

        window.location.href = '../index.html'; // Redirigir al index
    });

    // Agregar el evento para el botón de "Pagar Factura"
    document.getElementById('pagarBtn').addEventListener('click', async () => {
        try {
            const res = await fetch('http://fixmyshoesadmin.runasp.net/api/compraYTransacciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idFactura })
            });

            if (!res.ok) {
                const errorText = await res.text();
                alert(`Error al procesar el pago: ${errorText}`);
                throw new Error('Error en la transacción.');
            }

            const data = await res.json();
            console.log('Respuesta de la API:', data);
            if (!res.ok) {
                throw new Error('Error al procesar el pago.');
            }

            // Comprobar el mensaje "OK"
            if (data.Message === 'OK') {
                alert('Pago realizado con éxito.');
                window.location.href = '../index.html'; // Redirigir al inicio
            } else {
                alert('Hubo un error al procesar el pago. Inténtalo nuevamente.');
            }
        } catch (error) {
            console.error('Error en la transacción', error);
            alert('Hubo un error al intentar pagar la factura.');
        }
    });
});


// Función para mostrar la factura en el HTML
function mostrarFactura(factura, carrito, usuario) {
    const facturaContainer = document.getElementById('facturaContainer');
    const productosFactura = document.getElementById('productosFactura');

    facturaContainer.innerHTML = `
    <p>FACTURA #${factura.idFactura}</p>
    <p>FECHA: ${factura.fechaHora}</p>
    <p>DIRECCIÓN: ${factura.direccion}</p>
    <p>MÉTODO DE PAGO: ${factura.metodoPago}</p>
    <p>SUBTOTAL: $${factura.subtotal.toFixed(2)}</p>
    <p>IVA: $${factura.iva.toFixed(2)}</p>
    <p>TOTAL: $${factura.total.toFixed(2)}</p>
  `;

    productosFactura.innerHTML = carrito.map(producto => {
        return `
      <div>
        <p>${producto.nombre} - $${producto.precio.toFixed(2)} X ${producto.cantidad}</p>
      </div>
    `;
    }).join('');

    // Mostrar el nombre del usuario
    if (usuario) {
        const nombreUsuario = document.getElementById('bienvenida');
        if (nombreUsuario) {
            nombreUsuario.textContent = `¡Hola, ${usuario.nombre}!`;
        }
    }
}
