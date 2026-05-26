document.addEventListener('DOMContentLoaded', () => {
    const formRadio = document.getElementById('form-radio');
    const pacienteSelect = document.getElementById('paciente-select-radio');
    const listaRadios = document.getElementById('lista-radios');
    const submitButton = formRadio.querySelector('button[type="submit"]');

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
        submitButton.textContent = 'Actualizar Radiografía';
        cargarPacientesEnSelect();
        const radios = JSON.parse(localStorage.getItem('radiografias')) || [];
        const radioAEditar = radios.find(r => r.id == editId);

        if (radioAEditar) {
            pacienteSelect.value = radioAEditar.pacienteId;
            // Mostrar imagen actual y hacer opcional el input de archivo
            const currentImage = document.createElement('img');
            currentImage.src = radioAEditar.imagenData;
            currentImage.style = 'max-width: 200px; margin-top: 10px; border-radius: 8px; display: block;';
            formRadio.querySelector('.input-group').insertAdjacentElement('afterend', currentImage);
            document.getElementById('archivo-radio').required = false;
        }
    }

    // Cargar radiografías guardadas al iniciar
    if (!editId && listaRadios) {
        renderizarRadios();
    }
    if (pacienteSelect) {
        cargarPacientesEnSelect();
    }
    formRadio.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const pacienteId = pacienteSelect.value;
        const nombre = pacienteSelect.options[pacienteSelect.selectedIndex].text;
        const archivoInput = document.getElementById('archivo-radio');
        const archivo = archivoInput.files[0];

        if (editId) {
            // Actualizar radiografía existente
            let radios = JSON.parse(localStorage.getItem('radiografias')) || [];
            const radioAActualizar = radios.find(r => r.id == editId);

            if (archivo) { // Si se eligió un nuevo archivo
                const reader = new FileReader();
                reader.onload = (event) => {
                    radioAActualizar.nombre = nombre;
                    radioAActualizar.pacienteId = pacienteId;
                    radioAActualizar.imagenData = event.target.result;
                    localStorage.setItem('radiografias', JSON.stringify(radios));
                    alert('Radiografía actualizada correctamente.');
                    window.location.href = 'admin.html';
                };
                reader.readAsDataURL(archivo);
            } else { // Si no se eligió archivo, solo actualizar el nombre
                radioAActualizar.nombre = nombre;
                radioAActualizar.pacienteId = pacienteId;
                localStorage.setItem('radiografias', JSON.stringify(radios));
                alert('Radiografía actualizada correctamente.');
                window.location.href = 'admin.html';
            }
        } else {
            // Crear nueva radiografía
            if (nombre && archivo) {
                const reader = new FileReader();

                reader.onload = function(event) {
                    const nuevaRadio = {
                        id: Date.now(),
                        pacienteId: pacienteId,
                        nombre: nombre,
                        fecha: new Date().toLocaleDateString('es-ES'),
                        imagenData: event.target.result
                    };
                    guardarRadio(nuevaRadio);
                    formRadio.reset();
                    renderizarRadios();
                    alert('Radiografía guardada correctamente.');
                };

                reader.readAsDataURL(archivo);
            } else {
                alert('Por favor, complete todos los campos.');
            }
        }
    });

    function guardarRadio(radio) {
        const radios = JSON.parse(localStorage.getItem('radiografias')) || [];
        radios.push(radio);
        localStorage.setItem('radiografias', JSON.stringify(radios));
    }

    function renderizarRadios() {
        listaRadios.innerHTML = '';
        const radios = JSON.parse(localStorage.getItem('radiografias')) || [];

        radios.forEach(radio => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${radio.nombre}</h3>
                <p><strong>Fecha:</strong> ${radio.fecha}</p>
                <img src="${radio.imagenData}" alt="Radiografía de ${radio.nombre}" style="width: 100%; border-radius: 8px; margin-top: 10px;">
            `;
            listaRadios.appendChild(card);
        });
    }
});