// Deposit JavaScript - Alke Wallet

$(document).ready(function() {
    // Verificar sesión
    checkSession();
    
    // Cargar saldo actual
    loadCurrentBalance();
    
    // Eventos de botones rápidos
    $('.quick-btn').on('click', function() {
        const amount = $(this).data('amount');
        $('#depositAmount').val(amount);
        $('.quick-btn').removeClass('active');
        $(this).addClass('active');
        updateNewBalance();
    });
    
    // Evento de cambio en el monto
    $('#depositAmount').on('input', function() {
        $('.quick-btn').removeClass('active');
        updateNewBalance();
    });
    
    // Evento de envío del formulario
    $('#depositForm').on('submit', function(e) {
        e.preventDefault();
        processDeposit();
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
        displayBalance('#currentBalance', balance);
        displayBalance('#newBalance', balance);
    }
    
    // Función para mostrar saldo formateado
    function displayBalance(selector, amount) {
        const formatted = '$' + amount.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        $(selector).text(formatted);
    }
    
    // Función para actualizar nuevo saldo
    function updateNewBalance() {
        const currentBalance = parseFloat(localStorage.getItem('walletBalance')) || 0;
        const depositAmount = parseFloat($('#depositAmount').val()) || 0;
        const newBalance = currentBalance + depositAmount;
        
        $('#newBalance').addClass('balance-update');
        displayBalance('#newBalance', newBalance);
        
        setTimeout(function() {
            $('#newBalance').removeClass('balance-update');
        }, 600);
    }
    
    // Función para procesar el depósito
    function processDeposit() {
        const amount = parseFloat($('#depositAmount').val());
        const paymentMethod = $('#paymentMethod').val();
        const description = $('#description').val().trim();
        
        // Validar monto
        if (!amount || amount < 1.000) {
            showAlert('Por favor, ingresa un monto mínimo de $1.000', 'danger');
            return;
        }
        
        // Validar método de pago
        if (!paymentMethod) {
            showAlert('Por favor, selecciona un método de pago', 'danger');
            return;
        }
        
        // Deshabilitar botón y mostrar cargando
        const submitBtn = $('#depositForm button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Procesando...');
        
        // Simular procesamiento
        setTimeout(function() {
            // Obtener saldo actual
            const currentBalance = parseFloat(localStorage.getItem('walletBalance')) || 0;
            const newBalance = currentBalance + amount;
            
            // Actualizar saldo
            localStorage.setItem('walletBalance', newBalance.toString());
            
            // Guardar transacción
            saveTransaction({
                type: 'deposit',
                amount: amount,
                paymentMethod: getPaymentMethodName(paymentMethod),
                description: description || 'Depósito a billetera',
                date: new Date().toISOString(),
                balance: newBalance
            });
            
            // Mostrar éxito
            showAlert('¡Depósito realizado exitosamente! Tu nuevo saldo es ' + formatCurrency(newBalance), 'success');
            
            // Actualizar balances
            displayBalance('#currentBalance', newBalance);
            displayBalance('#newBalance', newBalance);
            
            // Limpiar formulario
            resetForm();
            
            // Restaurar botón
            submitBtn.prop('disabled', false).html(originalText);
            
            // Redirigir al menú después de 2 segundos
            setTimeout(function() {
                window.location.href = 'menu.html';
            }, 2000);
            
        }, 1500);
    }
    
    // Función para obtener nombre del método de pago
    function getPaymentMethodName(method) {
        const methods = {
            'debit': 'Tarjeta de Débito',
            'credit': 'Tarjeta de Crédito',
            'transfer': 'Transferencia Bancaria',
            'cash': 'Efectivo (PuntosPagos)'
        };
        return methods[method] || method;
    }
    
    // Función para guardar transacción
    function saveTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transaction.id = Date.now();
        transactions.unshift(transaction);
        
        // Mantener solo las últimas 50 transacciones
        if (transactions.length > 50) {
            transactions = transactions.slice(0, 50);
        }
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Función para formatear moneda
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
    
    // Función para resetear formulario
    function resetForm() {
        $('#depositForm')[0].reset();
        $('.quick-btn').removeClass('active');
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
        
        // Scroll hacia la alerta
        $('html, body').animate({
            scrollTop: $('#alertContainer').offset().top - 100
        }, 500);
        
        // Auto-cerrar después de 5 segundos para alertas de error
        if (type === 'danger') {
            setTimeout(function() {
                $('.alert').alert('close');
            }, 5000);
        }
    }
    
    // Animación de entrada del formulario
    $('.deposit-card').addClass('animate-in');
});