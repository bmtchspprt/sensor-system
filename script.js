const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 320,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const MAROON = '#b23a3a';
const CYAN = '#00adef';

function drawJunction(x, y) {
    const circle = new fabric.Circle({ 
        radius: 8, fill: 'black', left: x, top: y, 
        originX: 'center', originY: 'center', selectable: false 
    });
    canvas.add(circle);
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 220, height: 120, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 30, fontWeight: 'bold', top: 40, originX: 'center' });
    
    // Antennas are part of the box group
    const antennas = [];
    antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: 50, originX: 'center' }));
    if (label === 'LTX Home' && linkType === 'Cellular') {
        antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: -50, originX: 'center' }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
    canvas.add(group);
    return group;
}

function generateMap() {
    canvas.clear();
    const ltxList = ['Home', '2', '3', '4'];
    let ltxObjs = {};

    ltxList.forEach((id, idx) => {
        const checkbox = document.getElementById(`active-${id}`);
        if (!checkbox || !checkbox.checked) return;

        const xPos = 100 + (idx * 380);
        const count = parseInt(document.getElementById(`count-${id}`).value);
        const link = document.getElementById(`link-${id}`).value;
        const proto = document.getElementById(`proto-${id}`).value;
        const sType = document.getElementById(`type-${id}`).value;

        const ltx = createLTX(xPos, 120, id === 'Home' ? 'LTX Home' : `LTX ${id}`, link);
        ltxObjs[id] = ltx;

        // Arched Link Logic: Only LoRa or Wired (No Cellular arch)
        if (id !== 'Home' && ltxObjs['Home']) {
            const x1 = ltx.left + 110;
            const x2 = ltxObjs['Home'].left + 110;
            if (link === 'LoRa to Home') {
                drawArchedLink(x1, x2, 120, 'LoRa');
            } else if (link === 'Wired') {
                drawArchedLink(x1, x2, 240, 'Wired', true); // Arches from bottom
            }
        }

        // Sensor Grid Logic: 2 Rows of 3
        const busY = 320;
        if (count > 0) {
            // Drop from LTX to Bus
            canvas.add(new fabric.Line([xPos + 110, 240, xPos + 110, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 110, 240);
            drawJunction(xPos + 110, busY);

            // Main Horizontal Bus
            canvas.add(new fabric.Line([xPos + 20, busY, xPos + 200, busY], { stroke: 'black', strokeWidth: 5 }));
            drawJunction(xPos + 20, busY);
            drawJunction(xPos + 200, busY);

            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const sX = xPos + (col * 80) - 10;
                const sY = busY + 80 + (row * 160);

                const sensor = new fabric.Group([
                    new fabric.Rect({ width: 60, height: 100, fill: CYAN }),
                    new fabric.Text(`${sType} ${i+1}`, { fontSize: 12, angle: 90, left: 45, top: 15, fontWeight: 'bold' })
                ], { left: sX, top: sY });

                // Wiring Logic
                if (row === 0) {
                    // Row 1 connects to the Bus
                    canvas.add(new fabric.Line([sX + 30, sY, sX + 30, busY], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 30, busY);
                } else if (proto === 'Modbus') {
                    // Row 2 daisy-chains to Row 1
                    const prevY = busY + 80 + 100; // Bottom of Row 1 sensor
                    canvas.add(new fabric.Line([sX + 30, sY, sX + 30, prevY], { stroke: 'black', strokeWidth: 5 }));
                    drawJunction(sX + 30, prevY);
                }
                drawJunction(sX + 30, sY);
                canvas.add(sensor);
            }
        }
    });
}

function drawArchedLink(x1, x2, y, labelText, isBottom = false) {
    const midX = (x1 + x2) / 2;
    const curve = isBottom ? y + 80 : y - 80;
    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${curve} ${x2} ${y}`, {
        fill: '', stroke: CYAN, strokeWidth: 6, strokeDashArray: [10, 5]
    });
    const label = new fabric.Text(labelText, { fontSize: 24, fontWeight: 'bold', fill: CYAN, left: midX - 30, top: curve - 20 });
    canvas.add(path, label);
}
