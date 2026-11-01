// Script para manejar la edición de tickets
(function() {
    // Verificar si hay un ticket para editar
    const ticketToEdit = localStorage.getItem('ticketToEdit');
    if (ticketToEdit && window.location.pathname === '/ventas') {
        // Esperar a que el DOM esté completamente cargado
        window.addEventListener('DOMContentLoaded', function() {
            // Llenar el input con el ID del ticket
            const noOldTicketInput = document.querySelector('#noOldTicket');
            if (noOldTicketInput) {
                noOldTicketInput.value = ticketToEdit;
                
                // Simular click en el botón de editar
                const btnEditar = document.querySelector('#btnEditar');
                if (btnEditar) {
                    setTimeout(() => {
                        btnEditar.click();
                        // Limpiar el ticket del localStorage después de cargarlo
                        localStorage.removeItem('ticketToEdit');
                    }, 500); // Pequeño delay para asegurar que todo esté listo
                }

                home2sell()
            }
        });
    }
})();
