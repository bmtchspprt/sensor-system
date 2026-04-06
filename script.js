const MAROON = '#b23a3a';
const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

function initSize() {
    canvas.setWidth(window.innerWidth - 320);
    canvas.setHeight(window.innerHeight);
}
window.addEventListener('resize', initSize);
initSize();

function drawJunction(x, y) {
    canvas.add(new fabric.Circle({ radius: 8, fill: 'black', left: x, top: y, originX: 'center', originY: 'center', selectable: false }));
}

function createLTX(id, x, y, label, linkType, callback) {
    // Attempt to load the PNG
    fabric.Image.fromURL('ltx-100-base2.png', function(img, isError) {
        let ltxBody;

        if (isError) {
            // Fallback to maroon box if image is missing
            ltxBody = new fabric.Rect({ width: 200, height: 100, fill: MAROON, originX: 'center' });
        } else {
            img.scaleToWidth(200);
            img.set({ originX: 'center', top: 0 });
            ltxBody = img;
        }

        const text = new fabric.Text(label, { 
            fontSize: 22, fontWeight: 'bold', top: 40, originX: 'center', fill: isError ? 'white' : 'black' 
        });

        const antennas = [new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: 60, originX: 'center' })];
        if (id === 'Home' && linkType === 'Cellular') {
            antennas.push(new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: -60, originX: 'center' }));
        }

        const group = new fabric.Group([ltxBody, text, ...antennas], { left: x, top: y });
        canvas.add(group);
        if (callback) callback(group);
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
}

async function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let positions = {};

    ltxIds.forEach((id, index) => {
        const active = document.getElementById(`active-${id}`)?.checked;
        if (!active) return;

        const count = parseInt(document.getElementById(`count-${id}`).value || 0);
        const link = document.getElementById(`link-${id}`).value;
        const x = 100 + (index * 420);
        const y = 120;

        createLTX(id, x, y, id === 'Home' ? 'LTX Home' : 'LTX 2', link, (group) => {
            positions[id] = { x: x + 100, y: y };

            // Draw LoRa Link
            if (id === '2' && link === 'LoRa to Home' && positions['Home']) {
                const x1 = positions['2'].x;
                const x2 = positions['Home'].x;
                const midX = (x1 + x2) / 2;
                const path = new fabric.Path(`M ${x1} 120 Q ${midX} 30 ${x2} 120`, { fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5] });
                canvas.add(path);
                canvas.add(new fabric.Text('LoRa', { fontSize: 24, fill: CYAN, fontWeight: 'bold', left: midX - 30, top: 25 }));
            }

            // Draw Grid
            if (count > 0) {
                const busY = 320;
                canvas.add(new fabric.Line([x + 100, 220, x + 100, busY], { stroke: 'black', strokeWidth: 4 }));
                drawJunction(x + 100, 220);
                drawJunction(x + 100, busY);
                canvas.add(new fabric.Line([x + 25, busY, x + 175, busY], { stroke: 'black', strokeWidth: 4 }));

                for (let i = 0; i < count; i++) {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    const sX = x + (col * 75) - 5;
                    const sY = busY + 70 + (row * 150);

                    const sensor = new fabric.Group([
                        new fabric.Rect({ width: 55, height: 95, fill: CYAN }),
                        new fabric.Text(`NCR ${i+1}`, { fontSize: 13, angle: 90, left: 42, top: 20, fontWeight: 'bold' })
                    ], { left: sX, top: sY });

                    const cx = sX + 27;
                    if (row === 0) {
                        canvas.add(new fabric.Line([cx, sY, cx, busY], { stroke: 'black', strokeWidth: 4 }));
                        drawJunction(cx, busY);
                    } else {
                        canvas.add(new fabric.Line([cx, sY, cx, sY - 55], { stroke: 'black', strokeWidth: 4 }));
                    }
                    drawJunction(cx, sY);
                    canvas.add(sensor);
                }
            }
        });
    });
}

document.getElementById('map-btn').addEventListener('click', render);
document.getElementById('download-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'map.png';
    link.href = canvas.toDataURL({ format: 'png' });
    link.click();
});
render();
