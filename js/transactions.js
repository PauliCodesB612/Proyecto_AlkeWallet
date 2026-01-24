// Transactions JavaScript - Alke Wallet

$(document).ready(function() {
    let allTransactions = [];
    let filteredTransactions = [];
    
    // Verificar sesión
    checkSession();
    
    // Cargar datos
    loadTransactions();
    loadSummary();
    
    // Eventos de filtros
    $('#applyFilters').on('click', function() {
        applyFilters();
    });
    
    $('#clearHistory').on('click', function() {
        clearHistory();
    });
    
    // Función para verificar sesión
    function checkSession() {
        const userSession = sessionStorage.getItem('userSession');
        if (!userSession) {
            window.location.href = 'login.html';
        }
    }
    
    // Función para cargar transacciones
    function loadTransactions() {
        allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
        filteredTransactions = [...allTransactions];
        displayTransactions(filteredTransactions);
    }
    
    // Función para mostrar transacciones
    function displayTransactions(transactions) {
        if (transactions.length === 0) {
            $('#transactionsList').html(`
                <div class="text-center py-5">
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p class="text-muted">No hay transacciones para mostrar</p>
                        <a href="menu.html" class="btn btn-primary mt-3">Ir al Menú</a>
                    </div>
                </div>
            `);
            return;
        }
        
        let html = '';
        transactions.forEach(function(transaction) {
            html += createTransactionHTML(transaction);
        });
        
        $('#transactionsList').html(html);
        
        // Agregar eventos de click
        $('.transaction-item').on('click', function() {
            const transactionId = $(this).data('transaction-id');
            showTransactionDetail(transactionId);
        });
    }
    
    // Función para crear HTML de transacción
    function createTransactionHTML(transaction) {
        const isDeposit = transaction.type === 'deposit';
        const icon = isDeposit ? '📥' : '📤';
        const typeText = isDeposit ? 'Depósito' : 'Transferencia';
        const amountPrefix = isDeposit ? '+' : '-';
        
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const recipient = transaction.recipient ? `
            <p class="mb-0">Para: ${transaction.recipient}</p>
        ` : '';
        
        const paymentMethod = transaction.paymentMethod ? `
            <span class="me-3">💳 ${transaction.paymentMethod}</span>
        ` : '';
        
        return `
            <div class="transaction-item ${transaction.type}" data-transaction-id="${transaction.id}">
                <div class="transaction-header">
                    <div class="transaction-type">
                        <div class="transaction-icon">${icon}</div>
                        <div class="transaction-details">
                            <h6>${typeText}</h6>
                            <p>${transaction.description}</p>
                            ${recipient}
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <p class="amount">${amountPrefix}$${transaction.amount.toLocaleString('es-CL', {minimumFractionDigits: 2})}</p>
                        <p class="date">${dateStr} ${timeStr}</p>
                    </div>
                </div>
                <div class="transaction-footer">
                    ${paymentMethod}
                    <span>Saldo: $${transaction.balance.toLocaleString('es-CL', {minimumFractionDigits: 2})}</span>
                </div>
            </div>
        `;
    }
    
    // Función para cargar resumen
    function loadSummary() {
        const balance = parseFloat(localStorage.getItem('walletBalance')) || 0;
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        let totalDeposits = 0;
        let totalTransfers = 0;
        
        transactions.forEach(function(t) {
            if (t.type === 'deposit') {
                totalDeposits += t.amount;
            } else if (t.type === 'transfer') {
                totalTransfers += t.amount;
            }
        });
        
        displayBalance('#currentBalance', balance);
        displayBalance('#totalDeposits', totalDeposits);
        displayBalance('#totalTransfers', totalTransfers);
    }
    
    // Función para mostrar saldo
    function displayBalance(selector, amount) {
        const formatted = '$' + amount.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        $(selector).text(formatted);
    }
    
    // Función para aplicar filtros
    function applyFilters() {
        const type = $('#filterType').val();
        const dateFrom = $('#filterDateFrom').val();
        const dateTo = $('#filterDateTo').val();
        
        filteredTransactions = allTransactions.filter(function(t) {
            // Filtrar por tipo
            if (type !== 'all' && t.type !== type) {
                return false;
            }
            
            // Filtrar por fecha desde
            if (dateFrom) {
                const transactionDate = new Date(t.date).setHours(0, 0, 0, 0);
                const filterDate = new Date(dateFrom).setHours(0, 0, 0, 0);
                if (transactionDate < filterDate) {
                    return false;
                }
            }
            
            // Filtrar por fecha hasta
            if (dateTo) {
                const transactionDate = new Date(t.date).setHours(0, 0, 0, 0);
                const filterDate = new Date(dateTo).setHours(0, 0, 0, 0);
                if (transactionDate > filterDate) {
                    return false;
                }
            }
            
            return true;
        });
        
        displayTransactions(filteredTransactions);
        
        // Mostrar notificación
        const count = filteredTransactions.length;
        showNotification(`Se encontraron ${count} transacción${count !== 1 ? 'es' : ''}`, 'info');
    }
    
    // Función para mostrar detalle de transacción
    function showTransactionDetail(transactionId) {
        const transaction = allTransactions.find(t => t.id == transactionId);
        if (!transaction) return;
        
        const isDeposit = transaction.type === 'deposit';
        const typeText = isDeposit ? 'Depósito' : 'Transferencia';
        const amountClass = isDeposit ? 'text-success' : 'text-danger';
        const amountPrefix = isDeposit ? '+' : '-';
        
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let detailHTML = `
            <div class="detail-row">
                <span class="detail-label">ID de Transacción:</span>
                <span class="detail-value">#${transaction.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">${typeText}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Monto:</span>
                <span class="detail-value ${amountClass} fw-bold">${amountPrefix}$${transaction.amount.toLocaleString('es-CL', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fecha y Hora:</span>
                <span class="detail-value">${dateStr}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Descripción:</span>
                <span class="detail-value">${transaction.description}</span>
            </div>
        `;
        
        if (transaction.recipient) {
            detailHTML += `
                <div class="detail-row">
                    <span class="detail-label">Destinatario:</span>
                    <span class="detail-value">${transaction.recipient}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${transaction.recipientEmail}</span>
                </div>
            `;
        }
        
        if (transaction.paymentMethod) {
            detailHTML += `
                <div class="detail-row">
                    <span class="detail-label">Método de Pago:</span>
                    <span class="detail-value">${transaction.paymentMethod}</span>
                </div>
            `;
        }
        
        detailHTML += `
            <div class="detail-row">
                <span class="detail-label">Saldo después:</span>
                <span class="detail-value fw-bold">$${transaction.balance.toLocaleString('es-CL', {minimumFractionDigits: 2})}</span>
            </div>
        `;
        
        $('#transactionDetailContent').html(detailHTML);
        
        const modal = new bootstrap.Modal($('#transactionDetailModal')[0]);
        modal.show();
    }
    
    // Función para limpiar historial
    function clearHistory() {
        if (confirm('¿Estás segura de que deseas eliminar todo el historial de transacciones? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('transactions');
            allTransactions = [];
            filteredTransactions = [];
            displayTransactions([]);
            loadSummary();
            showNotification('Historial eliminado correctamente', 'success');
        }
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notification = $(`
            <div class="alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">
                ${message}
            </div>
        `);
        $('body').append(notification);
        
        setTimeout(function() {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }
    
    // Establecer fecha de hoy como máximo en los filtros
    const today = new Date().toISOString().split('T')[0];
    $('#filterDateFrom, #filterDateTo').attr('max', today);
});