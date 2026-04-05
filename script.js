const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 300,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const MAROON = '#b23a3a';
const CYAN_SENSOR = '#00adef';
const PROTOCOL_COLORS = { 'Modbus': 'black', 'HART': 'orange', '4-20': 'green', 'SmartBob': 'yellow' };

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
                <label>Sensors:</label><input type="number" id="count-${ltx.id}" value="3">
                <label>Link Type:</label>
                <select id="link-${ltx.id}">${ltx.links.map(l => `<option>${l}</option>`).join('')}</select>
            </div>`;
    });
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 180, height: 100, fill: MAROON, originX: 'center' });
    const text = new fabric.Text(label, { fontSize: 24, fontWeight: 'bold', fill: 'black', top: 35, originX: 'center' });
    
    // Antenna - Welded to the box group
    const antCount = (linkType === 'Cellular') ? 2 : 1;
    const antennas = [];
    for(let i=0; i<antCount; i++) {
        antennas.push(new fabric.Rect({
            width: 10, height: 25, fill: 'black', top: -25,
            left: (antCount === 2) ? (i === 0 ? -40 : 40) : 40,
            originX: 'center'
        }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
    canvas.add(group);
    return group;
}

function drawArchedLink(objStart, objEnd, labelText) {
    const x1 = objStart.left + 90;
    const x2 = objEnd.left + 90;
    const y = 100;
    const midX = (x1 + x2) / 2;

    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${y - 60} ${x2} ${y}`, {
        fill: '', stroke: CYAN_SENSOR, strokeWidth: 4, strokeDashArray: [8, 4], selectable: true
    });

    const label = new fabric.Text(labelText, {
        fontSize: 18, fontWeight: 'bold', fill: CYAN_SENSOR, left: midX - 20, top: y - 55
    });

    canvas.add(path, label);
}

function generateMap() {
    canvas.clear();
    let ltxObjs = {};
    const active = ltxConfigs.filter(c => document.getElementById(`active-${c.id}`).checked);

    active.forEach((config, idx) => {
        const xPos = 100 + (idx * 300);
        const link = document.getElementById(`link-${config.id}`).value;
        const ltx = createLTX(xPos, 120, config.label, link);
        ltxObjs[config.id] = ltx;

        // Connections to Internet or Home
        if (config.id !== 'Home' && link === 'LoRa to Home' && ltxObjs['Home']) {
            drawArchedLink(ltx, ltxObjs['Home'], 'LoRa');
        } else if (config.id === 'Home' && link === 'Cellular') {
            drawArchedLink(ltx, {left: ltx.left + 180}, 'Cellular');
        }

        // T-Junction Bus Logic
        const count = parseInt(document.getElementById(`count-${config.id}`).value);
        const busY = 280;
        
        // Vertical Drop from LTX
        canvas.add(new fabric.Line([xPos + 90, 220, xPos + 90, busY], { stroke: 'black', strokeWidth: 4 }));
        // Horizontal Bus Line
        canvas.add(new fabric.Line([xPos, busY, xPos + 180, busY], { stroke: 'black', strokeWidth: 4 }));

        for (let i = 0; i < count; i++) {
            const sX = xPos + (i * 65) - 20;
            const sY = busY + 30;

            const sensor = new fabric.Group([
                new fabric.Rect({ width: 45, height: 75, fill: CYAN_SENSOR }),
                new fabric.Text(`NCR ${i+1}`, { fontSize: 10, angle: 90, left: 30, top: 10 })
            ], { left: sX, top: sY });

            canvas.add(new fabric.Line([sX + 22, sY, sX + 22, busY], { stroke: 'black', strokeWidth: 3 }));
            canvas.add(sensor);
        }
    });
}

initMenu();
