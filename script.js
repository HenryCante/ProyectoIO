document.getElementById('generateTable').addEventListener('click', function() {
    const rowName = document.getElementById('rowName').value;
    const rowCount = parseInt(document.getElementById('rowCount').value);
    const colName = document.getElementById('colName').value;
    const colCount = parseInt(document.getElementById('colCount').value);

    const initialTableHead = document.querySelector('#initialTable thead');
    const initialTableBody = document.querySelector('#initialTable tbody');
    
    // Limpiar las tablas antes de generar nuevas
    initialTableHead.innerHTML = '';
    initialTableBody.innerHTML = '';

    // Crear encabezados de columnas
    let headerRow = document.createElement('tr');
    let emptyHeaderCell = document.createElement('th');
    headerRow.appendChild(emptyHeaderCell); // Celda vacía en la esquina superior izquierda

    for (let i = 1; i <= colCount; i++) {
        let colHeader = document.createElement('th');
        colHeader.textContent = `${colName} ${i}`;
        headerRow.appendChild(colHeader);
    }

    let offerHeader = document.createElement('th');
    offerHeader.textContent = 'Oferta';
    headerRow.appendChild(offerHeader);

    initialTableHead.appendChild(headerRow);

    // Crear filas con nombres de fila
    for (let i = 1; i <= rowCount; i++) {
        let row = document.createElement('tr');
        let rowHeader = document.createElement('td');
        rowHeader.textContent = `${rowName} ${i}`;
        row.appendChild(rowHeader);

        for (let j = 1; j <= colCount; j++) {
            let cell = document.createElement('td');
            cell.contentEditable = true;
            row.appendChild(cell);
        }

        let offerCell = document.createElement('td');
        offerCell.contentEditable = true;
        row.appendChild(offerCell);

        initialTableBody.appendChild(row);
    }

    // Agregar fila de Demanda
    let demandRow = document.createElement('tr');
    let demandHeader = document.createElement('td');
    demandHeader.textContent = 'Demanda';
    demandRow.appendChild(demandHeader);

    for (let i = 1; i <= colCount; i++) {
        let demandCell = document.createElement('td');
        demandCell.contentEditable = true;
        demandRow.appendChild(demandCell);
    }

    let demandOfferCell = document.createElement('td');
    demandRow.appendChild(demandOfferCell); // Celda vacía en la intersección de Oferta y Demanda

    initialTableBody.appendChild(demandRow);

    // Agregar evento para balancear la tabla
    document.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('input', checkBalance);
    });

    // Agregar evento para calcular el modelo de la esquina noroeste
    document.getElementById('calculateNorthwestModel').addEventListener('click', function() {
        calculateNorthwestModel(initialTableBody);
    });
});

// Función para verificar el balance
function checkBalance() {
    const initialTableBody = document.querySelector('#initialTable tbody');
    let totalDemand = 0;
    let totalOffer = 0;
    let rows = initialTableBody.rows;
    let lastColumnIndex = rows[0].cells.length - 1;
    let lastRowIndex = rows.length - 1;

    for (let i = 0; i < lastRowIndex; i++) {
        let offerValue = parseFloat(rows[i].cells[lastColumnIndex].innerText) || 0;
        totalOffer += offerValue;
    }

    for (let i = 0; i < lastColumnIndex; i++) {
        let demandValue = parseFloat(rows[lastRowIndex].cells[i].innerText) || 0;
        totalDemand += demandValue;
    }

    const balanceStatus = document.getElementById('balanceStatus');
    let balanceValue = totalOffer - totalDemand;

    rows[lastRowIndex].cells[lastColumnIndex].innerText = balanceValue.toFixed(2);

    if (balanceValue === 0) {
        balanceStatus.textContent = 'Balanceado';
    } else {
        balanceStatus.textContent = 'No Balanceado';
    }
}

// Función para calcular el modelo de la esquina noroeste
function calculateNorthwestModel(initialTableBody) {
    const northwestTableHead = document.querySelector('#northwestTable thead');
    const northwestTableBody = document.querySelector('#northwestTable tbody');

    // Limpiar la tabla modelo noroeste
    northwestTableHead.innerHTML = '';
    northwestTableBody.innerHTML = '';

    // Crear encabezados de columnas
    let headerRow = document.createElement('tr');
    let emptyHeaderCell = document.createElement('th');
    headerRow.appendChild(emptyHeaderCell); // Celda vacía en la esquina superior izquierda

    const colCount = document.getElementById('colCount').value; // Obtener el número de columnas

    for (let i = 1; i <= colCount; i++) {
        let colHeader = document.createElement('th');
        colHeader.textContent = `Distribución ${i}`;
        headerRow.appendChild(colHeader);
    }

    let offerHeader = document.createElement('th');
    offerHeader.textContent = 'Oferta';
    headerRow.appendChild(offerHeader);

    northwestTableHead.appendChild(headerRow);

    // Lógica del modelo de la esquina noroeste
    const rows = initialTableBody.rows;
    for (let i = 0; i < rows.length - 1; i++) { // Ignora la última fila (Demanda)
        let row = document.createElement('tr');
        let rowHeader = document.createElement('td');
        rowHeader.textContent = rows[i].cells[0].innerText; // Nombre del suministro
        row.appendChild(rowHeader);

        for (let j = 1; j < rows[i].cells.length; j++) { // Ignora la celda de la oferta
            let supplyValue = parseFloat(rows[i].cells[j].innerText) || 0;
            let demandValue = parseFloat(rows[rows.length - 1].cells[j - 1].innerText) || 0; // Obtener valor de demanda

            // Solo muestra valores si hay oferta y demanda
            if (supplyValue > 0 && demandValue > 0) {
                let allocation = Math.min(supplyValue, demandValue);
                row.appendChild(document.createElement('td')).textContent = allocation;
                // Actualiza las cantidades de oferta y demanda
                rows[i].cells[j].innerText = supplyValue - allocation;
                rows[rows.length - 1].cells[j - 1].innerText = demandValue - allocation;
            } else {
                row.appendChild(document.createElement('td')).textContent = 0; // Si no hay oferta o demanda, colocar 0
            }
        }

        // Coloca el total de oferta en la última celda
        let offerCell = document.createElement('td');
        offerCell.textContent = rows[i].cells[rows[i].cells.length - 1].innerText; // Colocar el valor original de oferta
        row.appendChild(offerCell);

        northwestTableBody.appendChild(row);
    }
}

// Manejar el desplazamiento con las flechas
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const focusedElement = document.activeElement;

        if (focusedElement.tagName === 'TD' && focusedElement.isContentEditable) {
            const currentRow = focusedElement.parentElement;
            const currentCellIndex = Array.from(currentRow.cells).indexOf(focusedElement);

            let targetCell;
            if (event.key === 'ArrowUp' && currentRow.previousElementSibling) {
                targetCell = currentRow.previousElementSibling.cells[currentCellIndex];
            } else if (event.key === 'ArrowDown' && currentRow.nextElementSibling) {
                targetCell = currentRow.nextElementSibling.cells[currentCellIndex];
            } else if (event.key === 'ArrowLeft' && currentCellIndex > 0) {
                targetCell = currentRow.cells[currentCellIndex - 1];
            } else if (event.key === 'ArrowRight' && currentCellIndex < currentRow.cells.length - 1) {
                targetCell = currentRow.cells[currentCellIndex + 1];
            }

            if (targetCell) {
                targetCell.focus();
                event.preventDefault(); // Prevenir el comportamiento predeterminado
            }
        }
    }
});
