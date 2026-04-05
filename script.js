const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 320,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const MAROON = '#b23a3a';
const CYAN = '#00adef';

const ltxConfigs = [
    { id: 'Home', label: 'LTX Home', links: ['Cellular', 'Ethernet'] },
    { id: '2', label: 'LTX 2', links: ['LoRa to Home', 'Wired'] },
    { id: '3', label: 'LTX 3', links: ['LoRa to Home', 'Wired'] },
    { id: '4', label: 'LTX 4', links: ['LoRa to Home', 'Wired'] }
];

function initMenu() {
    const container = document.getElementById('ltx-inputs');
    ltxConfigs.forEach(ltx => {
        container.innerHTML += `
            <div class="ltx-group">
                <div class="active-row">
                    <strong>${ltx.label}</strong>
                    <input type="checkbox" id="active-${ltx.id}" ${ltx.id === 'Home' || ltx.id === '2' ? 'checked' : ''}>
                </div>
                <label>Number of Sensors:</label>
                <input type="number" id="count-${ltx.id}" value="3">
                <label>Sensor Type:</label>
                <select id="type-${ltx.id}"><option>NCR</option><option>CNCR</option><option>SmartBob</option><option>HerdStar</option></select>
                <label>Protocol:</label>
                <select id="proto-${ltx.id}"><option>Modbus</option><option>4-20</option><option>HART</option><option>SmartBob</option></select>
                <label>Link Type:</label>
                <select id="link-${ltx.id}">${ltx.links.map(l => `<option>${l}</option>`).join('')}</select>
            </div>`;
    });
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 220, height: 120, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 32, fontWeight: 'bold', fill: 'black', top: 40, originX: 'center' });
    
    const antCount = (linkType === 'Cellular') ? 2 : 1;
    const antennas = [];
    for(let i=0; i<antCount; i++) {
        antennas.push(new fabric.Rect({
            width: 14, height: 30, fill: 'black', top: -30,
            left: (antCount === 2) ? (i === 0 ? -50 : 50) : 50, originX: 'center'
        }));
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
    const active = ltxConfigs.filter(c => document.getElementById(`active-${c.id}`).checked);

    active.forEach((config, idx) => {
        const xPos = 100 + (idx * 350);
        const link = document.getElementById(`link-${config.id}`).value;
        const ltx = createLTX(xPos, 120, config.label, link);
        ltxObjs[config.id] = ltx;

        if (config.id !== 'Home' && link === 'LoRa to Home' && ltxObjs['Home']) {
            drawArchedLink(ltx.left + 110, ltxObjs['Home'].left + 110, 120, 'LoRa');
        } else if (config.id === 'Home' && link === 'Cellular') {
            drawArchedLink(ltx.left + 110, ltx.left + 300, 120, 'Cellular');
        }

        const count = parseInt(document.getElementById(`count-${config.id}`).value);
        const proto = document.getElementById(`proto-${config.id}`).value;
        const sType = document.getElementById(`type-${config.id}`).value;
        
        const busY = 320;
        const wireColor = (proto === 'Modbus') ? 'black' : (proto === 'HART' ? 'orange' : 'green');

        // Main Drop from LTX
        canvas.add(new fabric.Line([xPos + 110, 240, xPos + 110, busY], { stroke: wireColor, strokeWidth: 5 }));
        drawJunction(xPos + 110, 240);
        drawJunction(xPos + 110, busY);

        // Horizontal Bus
        canvas.add(new fabric.Line([xPos, busY, xPos + 220, busY], { stroke: wireColor, strokeWidth: 5 }));
        drawJunction(xPos, busY);
        drawJunction(xPos + 220, busY);

        for (let i = 0; i < count; i++) {
            const sX = xPos + (i * 80) - 30;
            const sY = busY + 80;

            const sensor = new fabric.Group([
                new fabric.Rect({ width: 60, height: 100, fill: CYAN }),
                new fabric.Text(`${sType} ${i+1}`, { fontSize: 13, angle: 90, left: 48, top: 15, fontWeight: 'bold' })
            ], { left: sX, top: sY });

            canvas.add(new fabric.Line([sX + 30, sY, sX + 30, busY], { stroke: wireColor, strokeWidth: 5 }));
            drawJunction(sX + 30, busY);
            drawJunction(sX + 30, sY);
            canvas.add(sensor);
        }
    });
}

initMenu();
