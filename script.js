const MAROON = '#b23a3a';
const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

function resize() {
    canvas.setWidth(window.innerWidth - 320);
    canvas.setHeight(window.innerHeight);
    render();
}
window.addEventListener('resize', resize);
resize();

function drawJunction(x, y) {
    canvas.add(new fabric.Circle({ radius: 8, fill: 'black', left: x, top: y, originX: 'center', originY: 'center', selectable: false }));
}

function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let positions = {};

    ltxIds.forEach((id, index) => {
        const isActive = document.getElementById(`active-${id}`)?.checked;
        if (!isActive) return;

        const count = parseInt(document.getElementById(`count-${id}`)?.value || 0);
        const link = document.getElementById(`link-${id}`)?.value || '';
        const x = 80 + (index * 400);
        const y = 100;

        // Draw LTX Box
        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        const rect = new fabric.Rect({ width: 220, height: 110, fill: MAROON, originX: 'center' });
        const text = new fabric.Text(ltxLabel, { fontSize: 26, fontWeight: 'bold', top: 40, originX: 'center' });
        
        // Antenna Logic
        const antennas = [new fabric.Rect({ width: 12, height: 30, fill: 'black', top: -30, left: 60, originX: 'center' })];
        if (id === 'Home' && link === 'Cellular') {
            antennas.push(new fabric.Rect({ width: 12, height: 30, fill: 'black', top: -30, left: -60, originX: 'center' }));
        }

        const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
        canvas.add(group);
        positions[id] = { x: x + 110, y: y };

        // Draw LoRa Link
        if (id === '2' && link === 'LoRa to Home' && positions['Home']) {
            const x1 = positions['2'].x;
            const x2 = positions['Home'].x;
            const midX = (x1 + x2) / 2;
            const arch = new fabric.Path(`M ${x1} 100 Q ${midX} 20 ${x2} 100`, { fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5] });
            canvas.add(arch);
            canvas.add(new fabric.Text('LoRa', { fontSize: 24, fill: CYAN, fontWeight: 'bold', left: midX - 30, top: 20 }));
        }

        // Draw Sensors (2x3 Grid)
        if (count > 0) {
            const busY = 320;
            canvas.add(new fabric.Line([x + 110, 210, x + 110, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(x + 110, 210);
            drawJunction(x + 110, busY);
            canvas.add(new fabric.Line([x + 30, busY, x + 190, busY], { stroke: 'black', strokeWidth: 5 }));

            for (let i = 0; i < count; i++) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const sX = x + (col * 80) - 5;
                const sY = busY + 70 + (row * 150);

                const sensor = new fabric.Group([
                    new fabric.Rect({ width: 60, height: 100, fill: CYAN }),
                    new fabric.Text(`NCR ${i+1}`, { fontSize: 14, angle: 90, left: 45, top: 20, fontWeight: 'bold' })
                ], { left: sX, top: sY });

                // Connection lines
                const connX = sX + 30;
                if (row === 0) {
                    canvas.add(new fabric.Line([connX, sY, connX, busY], { stroke: 'black', strokeWidth: 4 }));
                    drawJunction(connX, busY);
                } else {
                    canvas.add(new fabric.Line([connX, sY, connX, sY - 50], { stroke: 'black', strokeWidth: 4 }));
                }
                drawJunction(connX, sY);
                canvas.add(sensor);
            }
        }
    });
}

document.getElementById('map-btn').addEventListener('click', render);
document.getElementById('download-btn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'network-map.png';
    link.href = dataURL;
    link.click();
});
