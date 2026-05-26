document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_PASSWORD = 'admin'; // Contraseña simple. Cambiar si es necesario.
    const mainContent = document.getElementById('admin-content');

    const password = prompt('Ingrese la contraseña de administrador:');

    if (password === ADMIN_PASSWORD) {
        mainContent.style.display = 'block';
        initializeAdminPanel();
    } else {
        alert('Contraseña incorrecta. Acceso denegado.');
        document.body.innerHTML = '<h1 style="text-align: center; margin-top: 50px; color: #e5e7eb;">Acceso Denegado</h1>';
    }

    function initializeAdminPanel() {
        const listaPacientes = document.getElementById('lista-pacientes-admin');
        const listaCitas = document.getElementById('lista-citas-admin');
        const listaRadios = document.getElementById('lista-radiografias-admin');

        // Renderizar todas las secciones
        renderPacientes();
        renderCitas();
        renderRadios();

        setupBackupSystem();

        // --- Lógica de Tabs y Filtro ---
        const tabs = document.querySelectorAll('.tab-btn');
        const sections = document.querySelectorAll('.tab-content');
        const searchInput = document.getElementById('admin-search');

        // Manejo de Tabs (Cambiar entre secciones)
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 1. Resetear estilos de botones
                tabs.forEach(t => {
                    t.classList.remove('btn-primary');
                    t.classList.add('btn-ghost');
                });
                // 2. Activar botón clickeado
                tab.classList.remove('btn-ghost');
                tab.classList.add('btn-primary');

                // 3. Mostrar sección correspondiente y ocultar las demás
                const target = tab.dataset.target;
                sections.forEach(section => {
                    section.style.display = section.id === `section-${target}` ? 'block' : 'none';
                });
            });
        });

        // Manejo del Buscador (Filtrar en tiempo real)
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                filterList('lista-pacientes-admin', term);
                filterList('lista-citas-admin', term);
                filterList('lista-radiografias-admin', term);
            });
        }

        function filterList(listId, term) {
            const list = document.getElementById(listId);
            if (!list) return;
            Array.from(list.children).forEach(item => {
                const text = item.textContent.toLowerCase();
                // Usamos 'flex' porque .admin-card tiene display: flex en CSS
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        }

        // Usar delegación de eventos para manejar clics en los botones de eliminar
        document.body.addEventListener('click', handleDelete);

        function handleDelete(e) {
            if (!e.target.matches('.btn-delete')) return;

            if (!confirm('¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.')) return;

            const id = e.target.dataset.id;
            const type = e.target.dataset.type;

            switch (type) {
                case 'paciente':
                    deleteItem('pacientes', id, renderPacientes);
                    break;
                case 'cita':
                    deleteItem('citas', id, renderCitas);
                    break;
                case 'radiografia':
                    deleteItem('radiografias', id, renderRadios);
                    break;
            }
        }

        function deleteItem(storageKey, id, renderFn) {
            let items = JSON.parse(localStorage.getItem(storageKey)) || [];
            items = items.filter(item => item.id != id); // data-id es string, id puede ser number
            localStorage.setItem(storageKey, JSON.stringify(items));
            renderFn(); // Volver a renderizar la lista actualizada
        }

        function renderPacientes() {
            const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
            listaPacientes.innerHTML = pacientes.length ? '' : '<p>No hay pacientes registrados.</p>';
            pacientes.forEach(paciente => {
                const item = document.createElement('div');
                item.className = 'card admin-card';
                item.innerHTML = `
                    <div>
                        <h3>${paciente.nombre}</h3>
                        <p><strong>Tel:</strong> ${paciente.telefono} | <strong>Edad:</strong> ${paciente.edad}</p>
                    </div>
                    <div class="admin-actions">
                        <a href="paciente.html?edit=${paciente.id}" class="btn-edit">Editar</a>
                        <button class="btn-delete" data-id="${paciente.id}" data-type="paciente">Eliminar</button>
                    </div>
                `;
                listaPacientes.appendChild(item);
            });
        }

        function renderCitas() {
            const citas = JSON.parse(localStorage.getItem('citas')) || [];
            listaCitas.innerHTML = citas.length ? '' : '<p>No hay citas agendadas.</p>';
            citas.forEach(cita => {
                const item = document.createElement('div');
                item.className = 'card admin-card';
                item.innerHTML = `
                    <div>
                        <h3>${cita.nombre}</h3>
                        <p><strong>Fecha:</strong> ${cita.fecha}</p>
                    </div>
                    <div class="admin-actions">
                        <a href="Expedientes.html?edit=${cita.id}" class="btn-edit">Editar</a>
                        <button class="btn-delete" data-id="${cita.id}" data-type="cita">Eliminar</button>
                    </div>
                `;
                listaCitas.appendChild(item);
            });
        }

        function renderRadios() {
            const radios = JSON.parse(localStorage.getItem('radiografias')) || [];
            listaRadios.innerHTML = radios.length ? '' : '<p>No hay radiografías guardadas.</p>';
            radios.forEach(radio => {
                const item = document.createElement('div');
                item.className = 'card admin-card';
                item.innerHTML = `
                    <div>
                        <h3>${radio.nombre}</h3>
                        <p><strong>Fecha:</strong> ${radio.fecha}</p>
                    </div>
                    <div class="admin-actions">
                        <a href="Imágenes.html?edit=${radio.id}" class="btn-edit">Editar</a>
                        <button class="btn-delete" data-id="${radio.id}" data-type="radiografia">Eliminar</button>
                    </div>
                `;
                listaRadios.appendChild(item);
            });
        }

        function setupBackupSystem() {
            const btnExport = document.getElementById('btn-export');
            const btnImport = document.getElementById('btn-import');

            // Lógica para DESCARGAR (Guardar en computadora)
            if (btnExport) {
                btnExport.addEventListener('click', () => {
                    const data = {
                        pacientes: JSON.parse(localStorage.getItem('pacientes')) || [],
                        citas: JSON.parse(localStorage.getItem('citas')) || [],
                        radiografias: JSON.parse(localStorage.getItem('radiografias')) || []
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dental_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a); // Necesario para Firefox
                    a.click();
                    document.body.removeChild(a);
                });
            }

            // Lógica para CARGAR (Restaurar desde archivo)
            if (btnImport) {
                btnImport.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (!confirm('ADVERTENCIA: Esto reemplazará los datos actuales con los del archivo de respaldo. ¿Desea continuar?')) return;
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            if (data.pacientes) localStorage.setItem('pacientes', JSON.stringify(data.pacientes));
                            if (data.citas) localStorage.setItem('citas', JSON.stringify(data.citas));
                            if (data.radiografias) localStorage.setItem('radiografias', JSON.stringify(data.radiografias));
                            alert('Datos restaurados correctamente.');
                            location.reload();
                        } catch (err) {
                            alert('Error al leer el archivo. Asegúrese de que sea un respaldo válido.');
                        }
                    };
                    reader.readAsText(file);
                });
            }
        }
    }
});
