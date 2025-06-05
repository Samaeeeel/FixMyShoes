function cerrarSesion() {
  localStorage.removeItem('usuario');
  alert('Sesión cerrada correctamente.');
  window.location.href = 'index.html';
}


document.addEventListener('DOMContentLoaded', () => {
    let next = document.getElementById('next');
    let prev = document.getElementById('prev');
    let carousel = document.querySelector('.carousel');
    let items = document.querySelectorAll('.carousel .item');
    let countItem = items.length;
    let active = 1;
    let other_1 = null;
    let other_2 = null;
    next.onclick = () => {
        carousel.classList.remove('prev');
        carousel.classList.add('next');
        active = active + 1 >= countItem ? 0 : active + 1;
        other_1 = active - 1 < 0 ? countItem - 1 : active - 1;
        other_2 = active + 1 >= countItem ? 0 : active + 1;
        changeSlider();
    }
    prev.onclick = () => {
        carousel.classList.remove('next');
        carousel.classList.add('prev');
        active = active - 1 < 0 ? countItem - 1 : active - 1;
        other_1 = active + 1 >= countItem ? 0 : active + 1;
        other_2 = other_1 + 1 >= countItem ? 0 : other_1 + 1;
        changeSlider();
    }
    const changeSlider = () => {
        if (items.length === 0) return; //agregado recien

        let itemOldActive = document.querySelector('.carousel .item.active');
        if (itemOldActive) itemOldActive.classList.remove('active');

        let itemOldOther_1 = document.querySelector('.carousel .item.other_1');
        if (itemOldOther_1) itemOldOther_1.classList.remove('other_1');

        let itemOldOther_2 = document.querySelector('.carousel .item.other_2');
        if (itemOldOther_2) itemOldOther_2.classList.remove('other_2');

        /*
        items.forEach(e => {
            if (!e.querySelector('.image img') || !e.querySelector('.image figcaption')) return;
            e.querySelector('.image img').style.animation = 'none';
            e.querySelector('.image figcaption').style.animation = 'none';
            void e.offsetWidth;
            e.querySelector('.image img').style.animation = '';
            e.querySelector('.image figcaption').style.animation = '';
        });
        */

        items.forEach(e => {
            e.querySelector('.image img').style.animation = 'none';
            e.querySelector('.image figcaption').style.animation = 'none';
            void e.offsetWidth;
            e.querySelector('.image img').style.animation = '';
            e.querySelector('.image figcaption').style.animation = '';
        })

        items[active].classList.add('active');
        items[other_1].classList.add('other_1');
        items[other_2].classList.add('other_2');

        clearInterval(autoPlay);
        autoPlay = setInterval(() => {
            next.click();
        }, 5000);
    }
    let autoPlay = setInterval(() => {
        next.click();
    }, 5000);

    const apiBaseUrl = 'https://fixmyshoesadmin.runasp.net'; // o la URL directa de tu API

    async function obtenerYMostrarProductos() {
        try {
            const res = await fetch(`${apiBaseUrl}/api/productos`);
            if (!res.ok) throw new Error('Error al obtener productos');
            const productos = await res.json();

            const contenedor = document.querySelector('.carousel .list');
            contenedor.innerHTML = '';

            const colores = ['#f5bfaf', '#dedfe1', '#9c4d2f', '#7eb63d', '#d7d3b5'];

            productos.forEach((prod, index) => {
                let clase = 'item';
                if (index === 0) clase += ' active';
                else if (index === 1) clase += ' other_1';
                else if (index === 2) clase += ' other_2';

                // Usa la primera imagen de prodImg si existe, sino una imagen por defecto
                const urlImagen = Array.isArray(prod.prodImg) && prod.prodImg.length > 0
                    ? prod.prodImg[0]
                    : 'images/default.png';

                const precio = typeof prod.prodPrecio === 'number' ? prod.prodPrecio : 0;
                const colorFondo = colores[index % colores.length];

                const articulo = document.createElement('article');
                articulo.className = clase;
                articulo.innerHTML = `
        <div class="main-content" style="background-color:${colorFondo};">
          <div class="content">
            <h2>${prod.prodNombre}</h2>
            <p class="price">$ ${precio.toFixed(2)}</p>
            <p class="description">${prod.prodDescripcion}</p>
            <button class="addToCard" data-id="${prod.idProducto}" data-nombre="${prod.prodNombre}" data-precio="${precio}" data-imagen="${urlImagen}">
                Agregar al carrito
            </button>
          </div>
        </div>
        <figure class="image"> 
          <img src="${urlImagen}" alt="${prod.prodNombre}">
          <figcaption>${prod.prodNombre}</figcaption>
        </figure>
      `;
                contenedor.appendChild(articulo);
            });

            // Actualiza variables para el carrusel
            items = document.querySelectorAll('.carousel .item');
            countItem = items.length;
            active = 0;
            other_1 = countItem > 1 ? 1 : 0;
            other_2 = countItem > 2 ? 2 : 0;

            changeSlider();

        } catch (error) {
            console.error(error);
        }
    }

    obtenerYMostrarProductos();

    // Mostrar/Ocultar botones según sesión y bienvenida
    const usuarioLogeado = JSON.parse(localStorage.getItem('usuario'));
    const authButtons = document.getElementById('authButtons');
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

//carrito de compras en el local storage
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('addToCard')) {
        const id = e.target.dataset.id;
        const nombre = e.target.dataset.nombre;
        const precio = parseFloat(e.target.dataset.precio);
        const imagen = e.target.dataset.imagen;

        // Aquí está el prompt para que el usuario escriba la cantidad
        const cantidad = parseInt(prompt(`¿Cuántas unidades de "${nombre}" deseas agregar al carrito?`, "1"));

        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Cantidad inválida. No se agregó nada al carrito.");
            return;
        }

        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(p => p.id == id);

        if (index >= 0) {
            carrito[index].cantidad += cantidad;
        } else {
            carrito.push({ idProducto: id, nombre, precio, imagen, cantidad });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert(`${nombre} agregado (${cantidad}) al carrito`);
    }
});



//Menu de hamburguesa
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const authButtons = document.getElementById('authButtons');
  const logoutButton = document.getElementById('logoutButton');

  if (menuToggle) {
    menuToggle.onclick = () => {
      if (authButtons) authButtons.classList.toggle('show');
      if (logoutButton) logoutButton.classList.toggle('show');
    };
  }
});



