const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

function initSize() {
    canvas.setWidth(window.innerWidth - 320);
    canvas.setHeight(window.innerHeight);
}
window.addEventListener('resize', initSize);
initSize();

function createLTX(id, x, y, label, callback) {
    fabric.Image.fromURL('ltxbase3.png', function(img, isError) {
        if (isError) {
            // Fallback if image is missing
            const rect = new fabric.Rect({ width: 400, height: 200, fill: '#b23a3a', originX: 'center' });
            assemble(rect);
        } else {
            img.scaleToWidth(400); // Double size
            img.set({ originX: 'center', top: 0 });
            assemble(img);
        }

        function assemble(ltxBody) {
            const text = new fabric.Text(label, { 
                fontSize: 40, fontWeight: 'bold', top: 80, originX: 'center', fill: 'black' 
            });
            const group = new fabric.Group([ltxBody, text], { left: x, top: y, selectable: true });
            canvas.add(group);
            if (callback) callback(group);
            canvas.renderAll();
        }
    });
}

function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let positions = {};

    ltxIds.forEach((id, index) => {
        if (!document.getElementById(`active-${id}`)?.checked) return;

        const count = parseInt(document.getElementById(`count-${id}`).value || 0);
        const link = document.getElementById(`link-${id}`).value;
        const x = 50 + (index * 550); 
        const y = 100;

        createLTX(id, x, y, id === 'Home' ? 'LTX Home' : 'LTX 2', (group) => {
            positions[id] = { x: x + 200, y: y + 200 }; // Center bottom of LTX

            // LoRa Arc
            if (id === '2' && link === 'LoRa to Home' && positions['Home']) {
                const x1 = positions['2'].x;
                const x2 = positions['Home'].x;
                const midX = (x1 + x2) / 2;
                const path = new fabric.Path(`M ${x1} 100 Q ${midX} 0 ${x2} 100`, { 
                    fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5] 
                });
                canvas.add(path);
            }

            // Daisy Chain Sensors
            if (count > 0) {
                let prevX = x + 200;
                let prevY = y + 200;

                for (let i = 0; i < count; i++) {
                    const sX = x + 50 + (i % 3 * 100);
                    const sY = y + 350 + (Math.floor(i / 3) * 150);

                    // Sensor (Half size: 27x45 approx)
                    const sensor = new fabric.Group([
                        new fabric.Rect({ width: 27, height: 45, fill: CYAN }),
                        new fabric.Text(`NCR ${i+1}`, { fontSize: 8, angle: 90, left: 20, top: 10, fontWeight: 'bold' })
                    ], { left: sX, top: sY });

                    // Connect current sensor to previous point (LTX or previous sensor)
                    canvas.add(new fabric.Line([prevX, prevY, sX + 13, sY], { 
                        stroke: 'black', strokeWidth: 3 
                    }));

                    canvas.add(sensor);
                    prevX = sX + 13;
                    prevY = sY + 45;
                }
            }
        });
    });
}

document.getElementById('map-btn').addEventListener('click', render);
document.getElementById('download-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'network_map.png';
    link.href = canvas.toDataURL({ format: 'png' });
    link.click();
});

render();
