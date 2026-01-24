// SendMoney JavaScript - Alke Wallet

$(document).ready(function() {
    let contacts = [];
    let selectedContactId = null;
    
    // Verificar sesión
    checkSession();
    
    // Cargar saldo actual
    loadCurrentBalance();
    
    // Cargar contactos
    loadContacts();
    
    // Evento de cambio en el monto
    $('#transferAmount').on('input', function() {
        updateTotalAmount();
    });
    
    // Evento de cambio en select de contacto
    $('#recipientSelect').on('change', function() {
        selectedContactId = $(this).val();
        highlightContactInList(selectedContactId);
    });
    
    // Evento de envío del formulario de transferencia
    $('#sendMoneyForm').on('submit', function(e) {
        e.preventDefault();
        processTransfer();
    });
    
    // Evento de guardar contacto
    $('#saveContactBtn').on('click', function() {
        addNewContact();
    });
    
    // Función para verificar sesión
    function checkSession() {
        const userSession = sessionStorage.getItem('userSession');
        if (!userSession) {
            window.location.href = 'login.html';
        }
    }
    
    // Función para cargar saldo actual
    function loadCurrentBalance() {
        const balance = parseFloat(localStorage.getItem('walletBalance')) || 0;
        displayBalance(balance);
    }
    
    // Función para mostrar saldo
    function displayBalance(amount) {
        const formatted = '$' + amount.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        $('#currentBalance').text(formatted);
    }
    
    // Función para cargar contactos
    function loadContacts() {
        contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        displayContacts();
        updateContactsSelect();
    }
    
    // Función para mostrar contactos
    function displayContacts() {
        if (contacts.length === 0) {
            $('#contactsList').html('<p class="text-muted text-center py-3">No tienes contactos guardados</p>');
            return;
        }
        
        let html = '';
        contacts.forEach(function(contact) {
            const initial = contact.name.charAt(0).toUpperCase();
            html += `
                <div class="contact-item" data-contact-id="${contact.id}">
                    <div class="contact-avatar">${initial}</div>
                    <div class="contact-info">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-email">${contact.email}</div>
                    </div>
                    <div class="contact-actions">
                        <button class="btn-contact-action select-contact" data-contact-id="${contact.id}" title="Seleccionar">
                            ✓
                        </button>
                        <button class="btn-contact-action delete-contact" data-contact-id="${contact.id}" title="Eliminar">
                            ×
                        </button>
                    </div>
                </div>
            `;
        });
        
        $('#contactsList').html(html);
        
        // Eventos de botones
        $('.select-contact').on('click', function(e) {
            e.stopPropagation();
            const contactId = $(this).data('contact-id');
            selectContact(contactId);
        });
        
        $('.delete-contact').on('click', function(e) {
            e.stopPropagation();
            const contactId = $(this).data('contact-id');
            deleteContact(contactId);
        });
    }
    
    // Función para actualizar select de contactos
    function updateContactsSelect() {
        let options = '<option value="">Selecciona un contacto</option>';
        contacts.forEach(function(contact) {
            options += `<option value="${contact.id}">${contact.name} - ${contact.email}</option>`;
        });
        $('#recipientSelect').html(options);
    }
    
    // Función para seleccionar contacto
    function selectContact(contactId) {
        selectedContactId = contactId;
        $('#recipientSelect').val(contactId);
        highlightContactInList(contactId);
    }
    
    // Función para resaltar contacto en la lista
    function highlightContactInList(contactId) {
        $('.contact-item').removeClass('selected');
        if (contactId) {
            $(`.contact-item[data-contact-id="${contactId}"]`).addClass('selected');
        }
    }
    
    // Función para eliminar contacto
    function deleteContact(contactId) {
        if (confirm('¿Estás segura de eliminar este contacto?')) {
            contacts = contacts.filter(c => c.id != contactId);
            localStorage.setItem('contacts', JSON.stringify(contacts));
            
            // Si el contacto eliminado estaba seleccionado, limpiar selección
            if (selectedContactId == contactId) {
                selectedContactId = null;
                $('#recipientSelect').val('');
            }
            
            loadContacts();
            showAlert('Contacto eliminado correctamente', 'success');
        }
    }
    
    // Función para agregar nuevo contacto
    function addNewContact() {
        const name = $('#contactName').val().trim();
        const email = $('#contactEmail').val().trim();
        const phone = $('#contactPhone').val().trim();
        
        if (!name || !email) {
            showAlert('Por favor, completa todos los campos requeridos', 'danger');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('Por favor, ingresa un correo electrónico válido', 'danger');
            return;
        }
        
        // Verificar si el contacto ya existe
        const exists = contacts.some(c => c.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            showAlert('Este contacto ya existe en tu lista', 'warning');
            return;
        }
        
        // Crear nuevo contacto
        const newContact = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            createdAt: new Date().toISOString()
        };
        
        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        
        // Limpiar formulario
        $('#addContactForm')[0].reset();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance($('#addContactModal')[0]);
        modal.hide();
        
        // Actualizar lista
        loadContacts();
        
        showAlert('Contacto agregado exitosamente', 'success');
    }
    
    // Función para actualizar total
    function updateTotalAmount() {
        const amount = parseFloat($('#transferAmount').val()) || 0;
        const formatted = '$' + amount.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        $('#totalAmount').text(formatted);
    }
    
    // Función para procesar transferencia
    function processTransfer() {
        const amount = parseFloat($('#transferAmount').val());
        const recipientId = $('#recipientSelect').val();
        const description = $('#transferDescription').val().trim();
        
        // Validar destinatario
        if (!recipientId) {
            showAlert('Por favor, selecciona un destinatario', 'danger');
            return;
        }
        
        // Validar monto
        if (!amount || amount <= 0) {
            showAlert('Por favor, ingresa un monto válido', 'danger');
            return;
        }
        
        // Validar saldo suficiente
        const currentBalance = parseFloat(localStorage.getItem('walletBalance')) || 0;
        if (amount > currentBalance) {
            showAlert('No tienes saldo suficiente para realizar esta transferencia', 'danger');
            return;
        }
        
        // Validar límite diario
        if (amount > 500000) {
            showAlert('El monto excede el límite diario de $500.000', 'danger');
            return;
        }
        
        // Validar descripción
        if (!description) {
            showAlert('Por favor, ingresa una descripción para la transferencia', 'danger');
            return;
        }
        
        // Obtener contacto
        const recipient = contacts.find(c => c.id == recipientId);
        if (!recipient) {
            showAlert('Contacto no encontrado', 'danger');
            return;
        }
        
        // Confirmar transferencia
        if (!confirm(`¿Confirmas enviar $${amount.toLocaleString('es-CL')} a ${recipient.name}?`)) {
            return;
        }
        
        // Deshabilitar botón
        const submitBtn = $('#sendMoneyForm button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Procesando...');
        
        // Simular procesamiento
        setTimeout(function() {
            // Actualizar saldo
            const newBalance = currentBalance - amount;
            localStorage.setItem('walletBalance', newBalance.toString());
            
            // Guardar transacción
            saveTransaction({
                type: 'transfer',
                amount: amount,
                recipient: recipient.name,
                recipientEmail: recipient.email,
                description: description,
                date: new Date().toISOString(),
                balance: newBalance
            });
            
            // Mostrar éxito
            showAlert(`¡Transferencia exitosa! Se enviaron $${amount.toLocaleString('es-CL')} a ${recipient.name}`, 'success');
            
            // Actualizar saldo
            displayBalance(newBalance);
            
            // Limpiar formulario
            $('#sendMoneyForm')[0].reset();
            selectedContactId = null;
            $('.contact-item').removeClass('selected');
            updateTotalAmount();
            
            // Restaurar botón
            submitBtn.prop('disabled', false).html(originalText);
            
            // Redirigir al menú
            setTimeout(function() {
                window.location.href = 'menu.html';
            }, 2000);
            
        }, 1500);
    }
    
    // Función para guardar transacción
    function saveTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transaction.id = Date.now();
        transactions.unshift(transaction);
        
        if (transactions.length > 50) {
            transactions = transactions.slice(0, 50);
        }
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Función para mostrar alertas
    function showAlert(message, type) {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        $('#alertContainer').html(alertHTML);
        
        $('html, body').animate({
            scrollTop: $('#alertContainer').offset().top - 100
        }, 500);
        
        if (type === 'danger' || type === 'warning') {
            setTimeout(function() {
                $('.alert').alert('close');
            }, 5000);
        }
    }
});