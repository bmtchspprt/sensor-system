const CYAN = '#00adef';
const canvas = new fabric.Canvas('networkCanvas');

function initSize() {
    canvas.setWidth(window.innerWidth - 300);
    canvas.setHeight(window.innerHeight);
}
window.addEventListener('resize', initSize);
initSize();

function render() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let ltxData = {};

    ltxIds.forEach((id, index) => {
        if (!document.getElementById(`active-${id}`).checked) return;

        const count = parseInt(document.getElementById(`count-${id}`).value || 0);
        const link = document.getElementById(`link-${id}`).value;
        const xBase = 100 + (index * 550);
        const yBase = 120;

        fabric.Image.fromURL('ltxbase3.png', (img) => {
            img.scaleToWidth(400);
            img.set({ left: xBase, top: yBase, selectable: true });
            canvas.add(img);

            // Name CLEARLY UNDER the image
            const name = new fabric.Text(id === 'Home' ? 'LTX Home' : 'LTX 2', {
                left: xBase + 200, top: yBase + 220, fontSize: 32, fontWeight: 'bold', originX: 'center'
            });
            canvas.add(name);

            ltxData[id] = { x: xBase, y: yBase };

            // 1. LoRa Arc (Left side to left side)
            if (id === '2' && link === 'LoRa to Home' && ltxData['Home']) {
                const xStart = xBase + 130;
                const xEnd = ltxData['Home'].x + 130;
                const midX = (xStart + xEnd) / 2;
                canvas.add(new fabric.Path(`M ${xStart} ${yBase + 10} Q ${midX} ${yBase - 120} ${xEnd} ${yBase + 10}`, {
                    fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5]
                }));
            }

            // 2. Orthogonal Daisy Chain Wiring
            if (count > 0) {
                // Vertical trunk line starting from the bottom of LTX
                const trunkX = xBase + 200;
                canvas.add(new fabric.Line([trunkX, yBase + 200, trunkX, yBase + 350], { stroke: 'black', strokeWidth: 6 }));

                let prevPoint = { x: trunkX, y: yBase + 350 };

                for (let i = 0; i < count; i++) {
                    const row = Math.floor(i / 3);
                    const colInRow = i % 3;
                    const col = (row % 2 === 0) ? colInRow : (2 - colInRow); 

                    const sX = xBase + 50 + (col * 150);
                    const sY = yBase + 350 + (row * 180);

                    // Half-size Sensor
                    const rect = new fabric.Rect({ width: 50, height: 90, fill: CYAN });
                    const lab = new fabric.Text(`NCR ${i+1}`, { 
                        fontSize: 16, fontWeight: 'bold', angle: 90, left: 38, top: 20 
                    });
                    const sensorGroup = new fabric.Group([rect, lab], { left: sX, top: sY });

                    // Straight wiring logic
                    const sensorAttachX = sX + 25;
                    const sensorAttachY = sY + 45;

                    // Horizontal segment
                    canvas.add(new fabric.Line([prevPoint.x, prevPoint.y, sensorAttachX, prevPoint.y], { stroke: 'black', strokeWidth: 6 }));
                    // Vertical segment
                    canvas.add(new fabric.Line([sensorAttachX, prevPoint.y, sensorAttachX, sensorAttachY], { stroke: 'black', strokeWidth: 6 }));

                    canvas.add(sensorGroup);

                    prevPoint = { x: sensorAttachX, y: sensorAttachY };
                }
            }
            canvas.renderAll();
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
