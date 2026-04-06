const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

// Adjust canvas size on load and resize
function resize() {
    canvas.setWidth(window.innerWidth - 320);
    canvas.setHeight(window.innerHeight);
    render();
}
window.addEventListener('resize', resize);
resize();

function drawJunction(x, y) {
    canvas.add(new fabric.Circle({ 
        radius: 8, fill: 'black', left: x, top: y, 
        originX: 'center', originY: 'center', selectable: false 
    }));
}

function createLTX(id, x, y, label, linkType, callback) {
    // Load the custom PNG asset
    fabric.Image.fromURL('ltx-100-base2.png', function(img) {
        img.scaleToWidth(200);
        img.set({ originX: 'center', top: 0 });

        const text = new fabric.Text(label, { 
            fontSize: 22, fontWeight: 'bold', top: 40, 
            originX: 'center', fill: 'black' 
        });

        // Antenna Logic
        const antennas = [
            new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: 60, originX: 'center' })
        ];
        
        if (id === 'Home' && linkType === 'Cellular') {
            antennas.push(new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: -60, originX: 'center' }));
        }

        const group = new fabric.Group([img, text, ...antennas], { left: x, top: y });
        canvas.add(group);
        
        // Signal back to render function that this LTX is done
        if (callback) callback(group);
        canvas.renderAll();
    });
}

function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let ltxPositions = {};

    ltxIds.forEach((id, index) => {
        const activeEl = document.getElementById(`active-${id}`);
        if (!activeEl || !activeEl.checked) return;

        const count = parseInt(document.getElementById(`count-${id}`)?.value || 0);
        const link = document.getElementById(`link-${id}`)?.value || '';
        const xPos = 80 + (index * 400);
        const yPos = 120;

        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        
        createLTX(id, xPos, yPos, ltxLabel, link, function(ltxGroup) {
            ltxPositions[id] = { x: xPos + 100, y: yPos };

            // Draw LoRa Link if applicable
            if (id === '2' && link === 'LoRa to Home' && ltxPositions['Home']) {
                const x1 = ltxPositions['2'].x;
                const x2 = ltxPositions['Home'].x;
                const midX = (x1 + x2) / 2;
                const arch = new fabric.Path(`M ${x1} 120 Q ${midX} 40 ${x2} 120`, { 
                    fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5] 
                });
                canvas.add(arch);
                canvas.add(new fabric.Text('LoRa', { 
                    fontSize: 24, fill: CYAN, fontWeight: 'bold', left: midX - 30, top: 30 
                }));
            }

            // Draw Sensors in Grid
            if (count > 0) {
                const busY = 320;
                // Main Trunk
                canvas.add(new fabric.Line([xPos + 100, 220, xPos + 100, busY], { stroke: 'black', strokeWidth: 5 }));
                drawJunction(xPos + 100, 220);
                drawJunction(xPos + 100, busY);
                // Horizontal Bus
                canvas.add(new fabric.Line([xPos + 25, busY, xPos + 175, busY], { stroke: 'black', strokeWidth: 5 }));

                for (let i = 0; i < count; i++) {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    const sX = xPos + (col * 75) - 5;
                    const sY = busY + 70 + (row * 150);

                    const sensor = new fabric.Group([
                        new fabric.Rect({ width: 55, height: 95, fill: CYAN }),
                        new fabric.Text(`NCR ${i+1}`, { fontSize: 13, angle: 90, left: 42, top: 20, fontWeight: 'bold' })
                    ], { left: sX, top: sY });

                    const connX = sX + 27;
                    if (row === 0) {
                        canvas.add(new fabric.Line([connX, sY, connX, busY], { stroke: 'black', strokeWidth: 4 }));
                        drawJunction(connX, busY);
                    } else {
                        canvas.add(new fabric.Line([connX, sY, connX, sY - 55], { stroke: 'black', strokeWidth: 4 }));
                    }
                    drawJunction(connX, sY);
                    canvas.add(sensor);
                }
            }
        });
    });
}

// Button Event Listeners
document.getElementById('map-btn').addEventListener('click', render);

document.getElementById('download-btn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'network-map.png';
    link.href = dataURL;
    link.click();
});
