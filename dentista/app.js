document.addEventListener('DOMContentLoaded', () => {
    const formCita = document.getElementById('form-cita');
    const pacienteSelect = document.getElementById('paciente-select');
    const listaCitas = document.getElementById('lista-citas');
    const submitButton = formCita.querySelector('button[type="submit"]');

    function cargarPacientesEnSelect() {
        if (!pacienteSelect) return;
        const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
        pacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = paciente.nombre;
            pacienteSelect.appendChild(option);
        });
    }

    // --- Lógica para Edición ---
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        // Modo edición
        submitButton.textContent = 'Actualizar Cita';
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        const citaAEditar = citas.find(c => c.id == editId);

        if (citaAEditar) {
            cargarPacientesEnSelect(); // Cargar pacientes primero
            pacienteSelect.value = citaAEditar.pacienteId;
            document.getElementById('fecha-cita').value = citaAEditar.fecha;
            document.getElementById('notas-cita').value = citaAEditar.notas;
        }
    }

    // Cargar citas guardadas al iniciar la página
    if (listaCitas) { 
        if (!editId) { // No renderizar la lista en modo edición
            renderizarCitas();
        }
        cargarPacientesEnSelect();
    }
    formCita.addEventListener('submit', (e) => {
        // 1. Evitar que la página se recargue al enviar el formulario
        e.preventDefault();

        // 2. Obtener los valores de los inputs
        const pacienteId = pacienteSelect.value;
        const nombre = pacienteSelect.options[pacienteSelect.selectedIndex].text;
        const fecha = document.getElementById('fecha-cita').value;
        const notas = document.getElementById('notas-cita').value;

        if (editId) {
            // Actualizar cita existente
            let citas = JSON.parse(localStorage.getItem('citas')) || [];
            citas = citas.map(cita => {
                if (cita.id == editId) {
                    return { ...cita, pacienteId, nombre, fecha, notas };
                }
                return cita;
            });
            localStorage.setItem('citas', JSON.stringify(citas));
            alert('Cita actualizada correctamente.');
            window.location.href = 'admin.html'; // Redirigir al panel de admin
        } else {
            // 3. Crear el objeto de la cita
            const nuevaCita = {
                id: Date.now(), // ID único basado en la fecha actual
                pacienteId: pacienteId,
                nombre: nombre,
                fecha: fecha,
                notas: notas
            };

            // 4. Guardar en LocalStorage
            guardarCita(nuevaCita);

            // 5. Limpiar el formulario y actualizar la vista
            formCita.reset();
            renderizarCitas();
            alert('Cita guardada correctamente.');
        }
    });

    function guardarCita(cita) {
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        citas.push(cita);
        localStorage.setItem('citas', JSON.stringify(citas));
    }

    function renderizarCitas() {
        listaCitas.innerHTML = ''; // Limpiar lista actual
        const citas = JSON.parse(localStorage.getItem('citas')) || [];

        citas.forEach(cita => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${cita.nombre}</h3>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p>${cita.notas}</p>
            `;
            listaCitas.appendChild(card);
        });
    }
});