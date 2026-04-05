const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 320,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const MAROON = '#b23a3a';
const CYAN = '#00adef';
const PROTOCOL_COLORS = { 'Modbus': 'black', '4-20': 'green', 'HART': 'orange' };

const ltxData = [
    { id: 'Home', label: 'LTX Home', links: ['Cellular', 'Ethernet'] },
    { id: '2', label: 'LTX 2', links: ['LoRa to Home', 'Wired'] },
    { id: '3', label: 'LTX 3', links: ['LoRa to Home', 'Wired'] },
    { id: '4', label: 'LTX 4', links: ['LoRa to Home', 'Wired'] }
];

function initMenu() {
    const container = document.getElementById('ltx-inputs');
    ltxData.forEach(ltx => {
        container.innerHTML += `
            <div class="ltx-group">
                <div class="active-row">
                    <strong>${ltx.label}</strong>
                    <input type="checkbox" id="active-${ltx.id}" ${ltx.id === 'Home' || ltx.id === '2' ? 'checked' : ''}>
                </div>
                <label>Number of Sensors:</label>
                <input type="number" id="count-${ltx.id}" value="${ltx.id === 'Home' ? 3 : 6}">
                <label>Protocol:</label>
                <select id="proto-${ltx.id}"><option>Modbus</option><option>4-20</option><option>HART</option></select>
                <label>Link Type:</label>
                <select id="link-${ltx.id}">${ltx.links.map(l => `<option>${l}</option>`).join('')}</select>
            </div>`;
    });
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 220, height: 120, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 32, fontWeight: 'bold', fill: 'black', top: 40, originX: 'center' });
    
    // Antennas - always part of the box
    const antennas = [];
    antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: 60, originX: 'center' }));
    if(label === 'LTX Home') { // Home has an optional second antenna if Cellular
        if(linkType === 'Cellular') {
            antennas.push(new fabric.Rect({ width: 14, height: 30, fill: 'black', top: -30, left: 100, originX: 'center' }));
        }
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
    canvas.add(group);
    return group;
}

function drawArchedLink(x1, x2, y, labelText) {
    const midX = (x1 + x2) / 2;
    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${y - 80} ${x2} ${y}`, {
        fill: '', stroke: CYAN, strokeWidth: 6, strokeDashArray: [10, 5], selectable: true
    });
    const label = new fabric.Text(labelText, { fontSize: 24, fontWeight: 'bold', fill: CYAN, left: midX - 30, top: y - 75 });
    canvas.add(path, label);
}

function drawJunction(x, y) {
    const circle = new fabric.Circle({ radius: 8, fill: 'black', left: x, top: y, originX: 'center', originY: 'center' });
    canvas.add(circle);
}

function generateMap() {
    canvas.clear();
    let ltxObjs = {};
    const active = ltxData.filter(d => document.getElementById(`active-${d.id}`).checked);

    active.forEach((config, idx) => {
        const xPos = 100 + (idx * 350);
        const link = document.getElementById(`link-${config.id}`).value;
        const ltx = createLTX(xPos, 120, config.label, link);
        ltxObjs[config.id] = ltx;

        // **FIX 1: Logic for the Top Arched Line**
        if (config.id !== 'Home' && link === 'LoRa to Home' && ltxObjs['Home']) {
            drawArchedLink(ltx.left + 110, ltxObjs['Home'].left + 110, 120, 'LoRa');
        } // Cellular removed from arch logic; it's just antennae now.

        const count = parseInt(document.getElementById(`count-${config.id}`).value);
        const proto = document.getElementById(`proto-${config.id}`).value;
        const wireColor = PROTOCOL_COLORS[proto] || 'black';
        
        const busY = 320;

        // Main Drop from LTX
        canvas.add(new fabric.Line([xPos + 110, 240, xPos + 110, busY], { stroke: wireColor, strokeWidth: 5 }));
        drawJunction(xPos + 110, 240);
        drawJunction(xPos + 110, busY);

        // Horizontal Bus
        canvas.add(new fabric.Line([xPos, busY, xPos + 220, busY], { stroke: wireColor, strokeWidth: 5 }));
        drawJunction(xPos, busY);
        drawJunction(xPos + 220, busY);

        let previousSensorNode = null;

        for (let i = 0; i < count; i++) {
            // **FIX 2: Grid Logic (Stacked Sensors)**
            const row = Math.floor(i / 3); // 0, 0, 0, 1, 1, 1
            const col = i % 3; // 0, 1, 2, 0, 1, 2
            
            const sX = xPos + (col * 80) - 30;
            const sY = busY + 80 + (row * 150); // Increased vertical spacing for stacked sensors

            const sensor = new fabric.Group([
                new fabric.Rect({ width: 60, height: 100, fill: CYAN }),
                new fabric.Text(`NCR ${i+1}`, { fontSize: 13, angle: 90, left: 48, top: 15, fontWeight: 'bold' })
            ], { left: sX, top: sY });

            // **FIX 3: Wiring Connection Fix (Daisy Chain for Modbus)**
            if (proto === 'Modbus') {
                if (row === 0) {
                    // Top row connects to bus
                    canvas.add(new fabric.Line([sX + 30, sY, sX + 30, busY], { stroke: wireColor, strokeWidth: 5 }));
                    drawJunction(sX + 30, busY);
                    drawJunction(sX + 30, sY);
                } else {
                    // Subsequent rows connect to the sensor above
                    const sensorAbove = canvas.getObjects('group').find(g => g._objects[1].text === `NCR ${i+1-3}`);
                    if(sensorAbove) {
                        canvas.add(new fabric.Line([sX + 30, sY, sensorAbove.left + 30, sensorAbove.top + 100], { stroke: wireColor, strokeWidth: 5 }));
                        drawJunction(sX + 30, sY);
                        drawJunction(sensorAbove.left + 30, sensorAbove.top + 100);
                    }
                }
            } else {
                // 4-20 and HART logic (Individual runs or different junction style)
                canvas.add(new fabric.Line([sX + 30, sY, sX + 30, busY], { stroke: wireColor, strokeWidth: 5 }));
                drawJunction(sX + 30, busY);
                drawJunction(sX + 30, sY);
            }

            canvas.add(sensor);
        }
    });
}

initMenu();
