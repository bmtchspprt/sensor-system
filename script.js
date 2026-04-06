const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

function initSize() {
    canvas.setWidth(window.innerWidth - 320);
    canvas.setHeight(window.innerHeight);
}
window.addEventListener('resize', initSize);
initSize();

function createLTX(id, x, y, label, callback) {
    fabric.Image.fromURL('ltxbase3.png', function(img) {
        img.scaleToWidth(400); // Double size
        img.set({ left: x, top: y, selectable: true });
        
        // Name placed BELOW the device
        const text = new fabric.Text(label, { 
            fontSize: 32, fontWeight: 'bold', left: x + 200, top: y + 210, originX: 'center' 
        });

        canvas.add(img);
        canvas.add(text);
        
        if (callback) callback({ x: x, y: y });
        canvas.renderAll();
    });
}

function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let positions = {};

    ltxIds.forEach((id, index) => {
        const activeBox = document.getElementById(`active-${id}`);
        if (!activeBox || !activeBox.checked) return;

        const count = parseInt(document.getElementById(`count-${id}`).value || 0);
        const link = document.getElementById(`link-${id}`).value;
        const x = 50 + (index * 550);
        const y = 120;

        createLTX(id, x, y, id === 'Home' ? 'LTX Home' : 'LTX 2', (pos) => {
            positions[id] = pos;

            // LoRa Arc connecting Left Antennas
            if (id === '2' && link === 'LoRa to Home' && positions['Home']) {
                const xStart = positions['2'].x + 130; // Approx left antenna position
                const xEnd = positions['Home'].x + 130; 
                const midX = (xStart + xEnd) / 2;
                const path = new fabric.Path(`M ${xStart} 120 Q ${midX} 20 ${xEnd} 120`, { 
                    fill: '', stroke: CYAN, strokeWidth: 6, strokeDashArray: [10, 5] 
                });
                canvas.add(path);
                canvas.add(new fabric.Text('LoRa', { fontSize: 24, fill: CYAN, left: midX - 30, top: 40, fontWeight: 'bold' }));
            }

            // Daisy Chain Sensors
            if (count > 0) {
                // Initial wire from the center bottom of LTX
                let prevX = x + 200;
                let prevY = y + 200;

                for (let i = 0; i < count; i++) {
                    const row = Math.floor(i / 3);
                    const col = (row % 2 === 0) ? (i % 3) : (2 - (i % 3)); // Snake pattern
                    
                    const sX = x + 50 + (col * 140);
                    const sY = y + 400 + (row * 160);

                    // Small Sensor
                    const sensorRect = new fabric.Rect({ width: 50, height: 80, fill: CYAN });
                    const sensorLabel = new fabric.Text(`NCR ${i+1}`, { 
                        fontSize: 14, fontWeight: 'bold', top: 20, left: 55, angle: 90 
                    });
                    
                    const sensorGroup = new fabric.Group([sensorRect, sensorLabel], { left: sX, top: sY });
                    
                    // Connection Line
                    canvas.add(new fabric.Line([prevX, prevY, sX + 25, sY], { 
                        stroke: 'black', strokeWidth: 8 
                    }));

                    canvas.add(sensorGroup);
                    
                    // Update connection point to current sensor
                    prevX = sX + 25;
                    prevY = sY + 80;
                }
            }
        });
    });
}

document.getElementById('map-btn').addEventListener('click', render);
document.getElementById('download-btn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'network_map.png';
    link.href = dataURL;
    link.click();
});

render();
