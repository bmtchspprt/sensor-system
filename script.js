const MAROON = '#b23a3a';
const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

function initSize() {
    canvas.setWidth(window.innerWidth - 300);
    canvas.setHeight(window.innerHeight);
}
window.addEventListener('resize', initSize);
initSize();

function drawJunction(x, y) {
    canvas.add(new fabric.Circle({ radius: 8, fill: 'black', left: x, top: y, originX: 'center', originY: 'center', selectable: false }));
}

function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let ltxPositions = {};

    ltxIds.forEach((id, index) => {
        const isActive = document.getElementById(`active-${id}`)?.checked;
        if (!isActive) return;

        const count = parseInt(document.getElementById(`count-${id}`)?.value || 0);
        const link = document.getElementById(`link-${id}`)?.value || '';
        const x = 100 + (index * 400);
        const y = 120;

        // Draw LTX
        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        const rect = new fabric.Rect({ width: 200, height: 100, fill: MAROON, originX: 'center' });
        const text = new fabric.Text(ltxLabel, { fontSize: 24, fontWeight: 'bold', top: 35, originX: 'center' });
        
        // Antenna Logic
        const antennas = [new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: 60, originX: 'center' })];
        if (id === 'Home' && link === 'Cellular') {
            antennas.push(new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: -60, originX: 'center' }));
        }

        const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
        canvas.add(group);
        ltxPositions[id] = { x: x + 100, y: y };

        // LoRa Arch
        if (id === '2' && link === 'LoRa to Home' && ltxPositions['Home']) {
            const x1 = ltxPositions['2'].x;
            const x2 = ltxPositions['Home'].x;
            const midX = (x1 + x2) / 2;
            const path = new fabric.Path(`M ${x1} 120 Q ${midX} 40 ${x2} 120`, { fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5] });
            canvas.add(path);
            canvas.add(new fabric.Text('LoRa', { fontSize: 24, fill: CYAN, fontWeight: 'bold', left: midX - 30, top: 30 }));
        }

        // Sensors (2x3 Grid)
        if (count > 0) {
            const busY = 320;
            canvas.add(new fabric.Line([x + 100, 220, x + 100, busY], { stroke: 'black', strokeWidth: 4 }));
            drawJunction(x + 100, 220);
            drawJunction(x + 100, busY);
            canvas.add(new fabric.Line([x + 20, busY, x + 180, busY], { stroke: 'black', strokeWidth: 4 }));

            for (let i = 0; i < count; i++) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const sX = x + (col * 75) - 10;
                const sY = busY + 65 + (row * 140);

                const sensor = new fabric.Group([
                    new fabric.Rect({ width: 55, height: 90, fill: CYAN }),
                    new fabric.Text(`NCR ${i+1}`, { fontSize: 13, angle: 90, left: 40, top: 15, fontWeight: 'bold' })
                ], { left: sX, top: sY });

                const cx = sX + 27;
                if (row === 0) {
                    canvas.add(new fabric.Line([cx, sY, cx, busY], { stroke: 'black', strokeWidth: 4 }));
                    drawJunction(cx, busY);
                } else {
                    canvas.add(new fabric.Line([cx, sY, cx, sY - 50], { stroke: 'black', strokeWidth: 4 }));
                }
                drawJunction(cx, sY);
                canvas.add(sensor);
            }
        }
    });
}

document.getElementById('map-btn').addEventListener('click', render);
render();
