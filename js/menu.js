// Menu JavaScript - Alke Wallet

$(document).ready(function() {
    // Verificar sesión
    checkSession();
    
    // Cargar información del usuario
    loadUserInfo();
    
    // Cargar saldo
    loadBalance();
    
    // Actualizar hora
    updateLastUpdate();
    
    // Evento de logout
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Evento de actualizar saldo
    $('#refreshBalance').on('click', function() {
        refreshBalance();
    });
    
    // Función para verificar sesión
    function checkSession() {
        const userSession = sessionStorage.getItem('userSession');
        
        if (!userSession) {
            // No hay sesión, redirigir a login
            window.location.href = 'login.html';
        }
    }
    
    // Función para cargar información del usuario
    function loadUserInfo() {
        const userSession = JSON.parse(sessionStorage.getItem('userSession'));
        
        if (userSession && userSession.email) {
            $('#userEmail').text(userSession.email);
            
            // Extraer nombre del email
            const name = userSession.email.split('@')[0];
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
            $('#welcomeName').text(capitalizedName);
        }
    }
    
    // Función para cargar saldo
    function loadBalance() {
        // Obtener saldo guardado o inicializar en 0
        let balance = parseFloat(localStorage.getItem('walletBalance')) || 0;
        displayBalance(balance);
    }
    
    // Función para mostrar saldo
    function displayBalance(balance) {
        const formattedBalance = '$' + balance.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        // Animación del saldo
        $('#currentBalance').fadeOut(200, function() {
            $(this).text(formattedBalance).fadeIn(200);
        });
    }
    
    // Función para actualizar la hora
    function updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        $('#lastUpdate').text(timeString);
    }
    
    // Función para refrescar saldo
    function refreshBalance() {
        const btn = $('#refreshBalance');
        const originalHTML = btn.html();
        
        // Mostrar spinner
        btn.html('<span class="spinner-border spinner-border-sm"></span>').prop('disabled', true);
        
        // Simular carga
        setTimeout(function() {
            loadBalance();
            updateLastUpdate();
            btn.html(originalHTML).prop('disabled', false);
            
            // Mostrar notificación
            showNotification('Saldo actualizado correctamente', 'success');
        }, 1000);
    }
    
    // Función para cerrar sesión
    function logout() {
        if (confirm('¿Estás segura de que deseas cerrar sesión?')) {
            // Limpiar sesión
            sessionStorage.removeItem('userSession');
            
            // Mostrar mensaje
            showNotification('Cerrando sesión...', 'info');
            
            // Redirigir después de un momento
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notification = $('<div class="alert alert-' + type + ' position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">' + message + '</div>');
        $('body').append(notification);
        
        setTimeout(function() {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }
    
    // Animación de las tarjetas del menú
    $('.menu-card').each(function(index) {
        $(this).css({
            'animation-delay': (0.1 * index) + 's',
            'animation': 'fadeInUp 0.6s ease both'
        });
    });
    
    // Actualizar hora cada minuto
    setInterval(updateLastUpdate, 60000);
});