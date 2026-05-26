document.addEventListener('DOMContentLoaded', () => {
    const formPaciente = document.getElementById('form-paciente');
    const listaPacientes = document.getElementById('lista-pacientes');
    const formTitle = formPaciente.querySelector('h3');
    const submitButton = formPaciente.querySelector('button[type="submit"]');

    // --- Lógica para Edición ---
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        formTitle.textContent = 'Editar Paciente';
        submitButton.textContent = 'Actualizar Paciente';
        const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
        const pacienteAEditar = pacientes.find(p => p.id == editId);

        if (pacienteAEditar) {
            document.getElementById('nombre-completo').value = pacienteAEditar.nombre;
            document.getElementById('telefono').value = pacienteAEditar.telefono;
            document.getElementById('edad').value = pacienteAEditar.edad;
            document.getElementById('direccion').value = pacienteAEditar.direccion;
        }
    }

    // Cargar pacientes guardados al iniciar la página
    if (!editId && listaPacientes) {
        renderizarPacientes();
    }
    formPaciente.addEventListener('submit', (e) => {
        e.preventDefault();

        // Obtener los valores de los inputs
        const nombre = document.getElementById('nombre-completo').value;
        const telefono = document.getElementById('telefono').value;
        const edad = document.getElementById('edad').value;
        const direccion = document.getElementById('direccion').value;

        if (editId) {
            // Actualizar paciente existente
            let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
            pacientes = pacientes.map(p => {
                if (p.id == editId) {
                    return { ...p, nombre, telefono, edad, direccion };
                }
                return p;
            });
            localStorage.setItem('pacientes', JSON.stringify(pacientes));
            alert('Paciente actualizado correctamente.');
            window.location.href = 'admin.html';
        } else {
            // Crear el objeto del paciente
            const nuevoPaciente = {
                id: Date.now(), // ID único
                nombre: nombre,
                telefono: telefono,
                edad: edad,
                direccion: direccion,
                deuda: 0,
                pagos: []
            };

            // Guardar en LocalStorage
            guardarPaciente(nuevoPaciente);

            // Limpiar el formulario y actualizar la vista
            formPaciente.reset();
            renderizarPacientes();
            alert('Paciente guardado correctamente.');
        }
    });

    // Delegación de eventos para el botón de descarga
    if (listaPacientes) {
        listaPacientes.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-download-record')) {
                const patientId = e.target.dataset.patientId;
                generarExpediente(patientId);
            }
        });
    }

    function generarExpediente(patientId) {
        const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        const radiografias = JSON.parse(localStorage.getItem('radiografias')) || [];

        const paciente = pacientes.find(p => p.id == patientId);
        if (!paciente) {
            alert('Paciente no encontrado.');
            return;
        }

        const citasPaciente = citas.filter(c => c.pacienteId == patientId);
        const radiosPaciente = radiografias.filter(r => r.pacienteId == patientId);

        let content = `
            <html><head><title>Expediente de ${paciente.nombre}</title><style>body{font-family: sans-serif;}</style></head><body>
            <h1>Expediente del Paciente: ${paciente.nombre}</h1>
            <hr>
            <h2>Datos Personales</h2>
            <p><strong>Nombre:</strong> ${paciente.nombre}</p>
            <p><strong>Edad:</strong> ${paciente.edad}</p>
            <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
            <p><strong>Dirección:</strong> ${paciente.direccion}</p>
            <hr>
            <h2>Citas Registradas</h2>
        `;

        if (citasPaciente.length > 0) {
            citasPaciente.forEach(cita => {
                content += `<div><p><strong>Fecha:</strong> ${cita.fecha}</p><p><strong>Notas:</strong> ${cita.notas || 'Sin notas'}</p></div><br>`;
            });
        } else {
            content += '<p>No hay citas registradas para este paciente.</p>';
        }

        content += '<hr><h2>Radiografías</h2>';

        if (radiosPaciente.length > 0) {
            radiosPaciente.forEach(radio => {
                content += `<div><p><strong>Fecha de registro:</strong> ${radio.fecha}</p><img src="${radio.imagenData}" alt="Radiografía" style="max-width: 300px; display: block; margin-top: 10px;"></div><br>`;
            });
        } else {
            content += '<p>No hay radiografías guardadas para este paciente.</p>';
        }
        content += '</body></html>';

        const blob = new Blob([content], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `expediente_${paciente.nombre.replace(/ /g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    function guardarPaciente(paciente) {
        const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
        pacientes.push(paciente);
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
    }

    function renderizarPacientes() {
        listaPacientes.innerHTML = ''; // Limpiar lista actual
        const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

        pacientes.forEach(paciente => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${paciente.nombre}</h3>
                <p><strong>Edad:</strong> ${paciente.edad} años</p>
                <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
                <p><strong>Dirección:</strong> ${paciente.direccion}</p><br>
                <button class="btn-primary btn-download-record" data-patient-id="${paciente.id}" style="width:100%;">Descargar Expediente</button>
            `;
            listaPacientes.appendChild(card);
        });
    }
});