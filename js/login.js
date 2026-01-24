// Login JavaScript - Alke Wallet

$(document).ready(function() {
    // Credenciales válidas (en producción esto estaría en el backend)
    const validCredentials = {
        email: 'demo@alkewallet.com',
        password: 'demo123'
    };
    
    // Función para mostrar alertas
    function showAlert(message, type) {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        $('#alertContainer').html(alertHTML);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(function() {
            $('.alert').alert('close');
        }, 5000);
    }
    
    // Función para validar email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Función para validar credenciales
    function validateCredentials(email, password) {
        return email === validCredentials.email && password === validCredentials.password;
    }
    
    // Evento de envío del formulario
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');
        
        // Validar email
        if (!validateEmail(email)) {
            showAlert('Por favor, ingresa un correo electrónico válido.', 'danger');
            return;
        }
        
        // Validar que la contraseña no esté vacía
        if (password.length === 0) {
            showAlert('Por favor, ingresa tu contraseña.', 'danger');
            return;
        }
        
        // Validar credenciales
        if (validateCredentials(email, password)) {
            // Guardar sesión
            const userData = {
                email: email,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };
            
            // Simular inicio de sesión exitoso
            showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            // Animación de carga
            const submitButton = $(this).find('button[type="submit"]');
            const originalText = submitButton.text();
            submitButton.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...');
            
            // Redirigir después de 1.5 segundos
            setTimeout(function() {
                // En producción, aquí guardaríamos el token de sesión
                sessionStorage.setItem('userSession', JSON.stringify(userData));
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', email);
                }
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            showAlert('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.', 'danger');
            
            // Limpiar contraseña en caso de error
            $('#password').val('').focus();
        }
    });
    
    // Autocompletar email si está recordado
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        $('#email').val(rememberedUser);
        $('#rememberMe').prop('checked', true);
    }
    
    // Efecto de enfoque en inputs
    $('.form-control').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
    
    // Animación de placeholder
    $('.form-control').each(function() {
        if ($(this).val() !== '') {
            $(this).addClass('has-value');
        }
    });
    
    $('.form-control').on('input', function() {
        if ($(this).val() !== '') {
            $(this).addClass('has-value');
        } else {
            $(this).removeClass('has-value');
        }
    });
});