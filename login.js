function validarCedulaEcuatoriana(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  const provinciasValidas = [...Array(24).keys()].map(n => n + 1).concat(30); // [1..24,30]

  if (!provinciasValidas.includes(provincia)) return false;

  const digitos = cedula.split('').map(Number);
  const verificador = digitos.pop();

  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    let mult = digitos[i] * (i % 2 === 0 ? 2 : 1);
    if (mult > 9) mult -= 9;
    suma += mult;
  }
  const decena = Math.ceil(suma / 10) * 10;
  return verificador === (decena - suma) % 10;
}


function validarRucEcuatoriano(ruc) {
    return /^\d{13}$/.test(ruc) && ruc.endsWith("001") && validarCedulaEcuatoriana(ruc.substring(0, 10));
}

function validarTelefonoEcuador(telefono) {
    return /^09\d{8}$/.test(telefono);
}

document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('http://fixmyshoesadmin.runasp.net/api/usuarios');
                const usuarios = await res.json();

                const usuario = usuarios.find(u => u.correo === correo && u.password === password);

                if (usuario) {
                    localStorage.setItem('usuario', JSON.stringify(usuario));
                    alert('Inicio de sesión exitoso');
                    if (usuario.rolNombre === 'Administrador') {
                        window.location.href = '../admin.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                } else {
                    alert('Correo o contraseña incorrectos');
                }

            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error al conectar con el servidor');
            }
        });
    }

    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Usuario
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const password = document.getElementById('password').value.trim();

            // Cliente
            const apellido = document.getElementById('apellido').value.trim();
            const cedulaRuc = document.getElementById('cedula').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const fechaNacimiento = document.getElementById('nacimiento').value;

            // Validaciones básicas
            const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
            if (!nombre || !correoValido || !password || !apellido || !cedulaRuc || !telefono || !direccion || !fechaNacimiento) {
                alert('Por favor, completa todos los campos correctamente.');
                return;
            }

            if (!(validarCedulaEcuatoriana(cedulaRuc) || validarRucEcuatoriano(cedulaRuc))) {
                alert('Cédula o RUC ecuatoriano inválido.');
                return;
            }

            if (!validarTelefonoEcuador(telefono)) {
                alert('Número de celular inválido. Debe tener 10 dígitos y comenzar con 09.');
                return;
            }

            try {
                const resUsuarios = await fetch('http://fixmyshoesadmin.runasp.net/api/usuarios');
                const usuarios = await resUsuarios.json();

                const existeCorreo = usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase());
                if (existeCorreo) {
                    alert('Ya existe una cuenta con ese correo electrónico.');
                    return;
                }

                // 1. Crear Usuario
                const nuevoUsuario = {
                    idRol: 2,
                    nombre,
                    correo,
                    password,
                    fechaRegistro: new Date().toISOString().split('T')[0],
                    rolNombre: "Cliente"
                };

                const res = await fetch('http://fixmyshoesadmin.runasp.net/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoUsuario)
                });

                if (!res.ok) throw new Error('No se pudo registrar el usuario');

                const usuarioCreado = await res.json();
                const idUsuarioNuevo = usuarioCreado.idUsuario;

                // 2. Crear Cliente asociado
                const nuevoCliente = {
                    idUsuario: idUsuarioNuevo,
                    nombre,
                    apellido,
                    cedulaRuc,
                    telefono,
                    direccion,
                    fechaNacimiento
                };

                const resCliente = await fetch('http://fixmyshoesadmin.runasp.net/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoCliente)
                });

                if (!resCliente.ok) throw new Error('No se pudo registrar el cliente');

                alert('Registro exitoso. Ya puedes iniciar sesión.');
                window.location.href = 'login.html';

            } catch (error) {
                console.error(error);
                alert('Hubo un error al registrarse. Inténtalo de nuevo.');
            }
        });
    }
});


