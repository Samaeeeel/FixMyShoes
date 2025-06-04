function cerrarSesion() {
  localStorage.removeItem('usuario');
  alert('Sesión cerrada correctamente.');
  window.location.href = '../index.html';
}

//Menu de hamburguesa
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const authButtons = document.getElementById('authButtons');

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