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
        img.scaleToWidth(400); // Doubled size
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
        if (!document.getElementById(`active-${id}`)?.checked) return;

        const count = parseInt(document.getElementById(`count-${id}`).value || 0);
        const link = document.getElementById(`link-${id}`).value;
        const x = 50 + (index * 550);
        const y = 100;

        createLTX(id, x, y, id === 'Home' ? 'LTX Home' : 'LTX 2', (pos) => {
            positions[id] = pos;

            // LoRa Arc: Starts from the left side of LTX 2 and ends on left side of Home
            if (id === '2' && link === 'LoRa to Home' && positions['Home']) {
                const xStart = positions['2'].x + 50; // Left antenna area
                const xEnd = positions['Home'].x + 50; 
                const midX = (xStart + xEnd) / 2;
                const path = new fabric.Path(`M ${xStart} 100 Q ${midX} 0 ${xEnd} 100`, { 
                    fill: '', stroke: CYAN, strokeWidth: 6, strokeDashArray: [10, 5] 
                });
                canvas.add(path);
                canvas.add(new fabric.Text('LoRa', { fontSize: 24, fill: CYAN, left: midX - 30, top: 20, fontWeight: 'bold' }));
            }

            // Daisy Chain Sensors
            if (count > 0) {
                // Initial wire from center-bottom of LTX
                let prevX = x + 200;
                let prevY = y + 200;

                for (let i = 0; i < count; i++) {
                    const row = Math.floor(i / 3);
                    const col = (row % 2 === 0) ? (i % 3) : (2 - (i % 3)); // S-curve logic
                    
                    const sX = x + 50 + (col * 120);
                    const sY = y + 380 + (row * 150);

                    // Half-size Sensor
                    const sensorRect = new fabric.Rect({ width: 40, height: 70, fill: CYAN });
                    const sensorLabel = new fabric.Text(`NCR ${i+1}`, { 
                        fontSize: 14, fontWeight: 'bold', top: 75, left: 20, originX: 'center' 
                    });
                    
                    const sensorGroup = new fabric.Group([sensorRect, sensorLabel], { left: sX, top: sY });
                    
                    // Wire connection (Daisy chain)
                    canvas.add(new fabric.Line([prevX, prevY, sX + 20, sY + 35], { 
                        stroke: 'black', strokeWidth: 5 
                    }));

                    canvas.add(sensorGroup);
                    
                    // Update previous point to current sensor center
                    prevX = sX + 20;
                    prevY = sY + 35;
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
