const MAROON = '#b23a3a';
const CYAN = '#00adef';

// Initialize the canvas once the script loads
const canvas = new fabric.Canvas('networkCanvas');

// Set dimensions to fill the remaining screen space
function resizeCanvas() {
    canvas.setWidth(window.innerWidth - 300);
    canvas.setHeight(window.innerHeight);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawJunction(x, y) {
    const circle = new fabric.Circle({ 
        radius: 8, fill: 'black', left: x, top: y, 
        originX: 'center', originY: 'center', selectable: false 
    });
    canvas.add(circle);
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 200, height: 100, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 24, fontWeight: 'bold', top: 35, originX: 'center', fill: 'black' });
    
    const antennas = [];
    // Right antenna
    antennas.push(new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: 50, originX: 'center' }));
    
    // Double antenna ONLY for Home + Cellular
    if (label === 'LTX Home' && linkType === 'Cellular') {
        antennas.push(new fabric.Rect({ width: 12, height: 28, fill: 'black', top: -28, left: 80, originX: 'center' }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y, selectable: true });
    canvas.add(group);
    return group;
}

function drawArchedLink(x1, x2, y, labelText) {
    const midX = (x1 + x2) / 2;
    const curveTop = y - 70;
    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${curveTop} ${x2} ${y}`, {
        fill: '', stroke: CYAN, strokeWidth: 5, strokeDashArray: [10, 5], selectable: false
    });
    const label = new fabric.Text(labelText, { 
        fontSize: 22, fontWeight: 'bold', fill: CYAN, left: midX - 25, top: curveTop - 25 
    });
    canvas.add(path, label);
}

function generateMap() {
    canvas.clear();
    const ltxIds = ['Home', '2'];
    let ltxObjs = {};

    ltxIds.forEach((id, idx) => {
        const checkbox = document.getElementById(`active-${id}`);
        if (!checkbox || !checkbox.checked) return;

        const count = parseInt(document.getElementById(`count-${id}`).value) || 0;
        const link = document.getElementById(`link-${id}`).value;
        const xPos = 50 + (idx * 350);

        const ltxLabel = id === 'Home' ? 'LTX Home' : `LTX ${id}`;
        const ltx = createLTX(xPos, 120, ltxLabel, link);
        ltxObjs[id] = ltx;

        // Arch Logic: Only draw if LoRa is selected
        if (id !== 'Home' && ltxObjs['Home'] && link === 'LoRa to Home') {
            drawArchedLink(ltx.left + 100, ltxObjs['Home'].left + 100, 120, 'LoRa');
        }

        const busY = 300;
        if (count > 0) {
            // Main Drop
            canvas.add(new fabric.Line([xPos + 100, 220, xPos + 100, busY], { stroke: 'black', strokeWidth: 4 }));
            drawJunction(xPos + 100, 220);
            drawJunction(xPos + 100, busY);

            // Horizontal Bus
            canvas.add(new fabric.Line([xPos + 15, busY, xPos + 185, busY], { stroke: 'black', strokeWidth: 4 }));
            drawJunction(xPos + 15, busY);
            drawJunction(xPos + 185, busY);

            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const sX = xPos + (col * 75) - 10;
                const sY = busY + 60 + (row * 140);

                const sensor = new fabric.Group([
                    new fabric.Rect({ width: 55, height: 90, fill: CYAN }),
                    new fabric.Text(`NCR ${i+1}`, { fontSize: 12, angle: 90, left: 40, top: 15, fontWeight: 'bold' })
                ], { left: sX, top: sY });

                if (row === 0) {
                    canvas.add(new fabric.Line([sX + 27, sY, sX + 27, busY], { stroke: 'black', strokeWidth: 4 }));
                    drawJunction(sX + 27, busY);
                } else {
                    // Vertical daisy chain to the sensor above
                    const aboveBottom = sY - 50; 
                    canvas.add(new fabric.Line([sX + 27, sY, sX + 27, aboveBottom], { stroke: 'black', strokeWidth: 4 }));
                    drawJunction(sX + 27, aboveBottom);
                }
                
                drawJunction(sX + 27, sY);
                canvas.add(sensor);
            }
        }
    });
}

// Attach event listener to the button
document.getElementById('map-btn').addEventListener('click', generateMap);

// Trigger initial map on load
generateMap();
