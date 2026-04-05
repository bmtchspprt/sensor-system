const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 300,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const MAROON = '#b23a3a';
const SENSOR_BLUE = '#00adef';

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
    // The Box
    const rect = new fabric.Rect({ width: 200, height: 110, fill: MAROON, originX: 'center' });
    
    // The Label
    const text = new fabric.Text(label, { 
        fontSize: 26, fontWeight: 'bold', fill: 'black', top: 35, originX: 'center' 
    });

    // The Antennas (Permanent Parts of the Group)
    const antennas = [];
    const count = (linkType === 'Cellular') ? 2 : 1;
    for(let i=0; i<count; i++) {
        antennas.push(new fabric.Rect({
            width: 12, height: 25, fill: 'black',
            top: -25, left: (count === 2) ? (i === 0 ? -40 : 40) : 0,
            originX: 'center'
        }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { 
        left: x, top: y, hasRotatingPoint: false 
    });
    
    canvas.add(group);
    return group;
}

function drawArchedLink(objA, objB, labelText) {
    const x1 = objA.left + 100;
    const x2 = objB.left + 100;
    const y = 100;
    const midX = (x1 + x2) / 2;

    const path = new fabric.Path(`M ${x1} ${y} Q ${midX} ${y - 80} ${x2} ${y}`, {
        fill: '', stroke: SENSOR_BLUE, strokeWidth: 5, strokeDashArray: [10, 5], selectable: true
    });

    const text = new fabric.Text(labelText, {
        fontSize: 20, fontWeight: 'bold', fill: SENSOR_BLUE, left: midX - 25, top: y - 75
    });

    canvas.add(path, text);
}

function generateMap() {
    canvas.clear();
    let ltxObjects = {};
    const active = ltxConfigs.filter(c => document.getElementById(`active-${c.id}`).checked);

    active.forEach((config, idx) => {
        const xPos = 50 + (idx * 280);
        const link = document.getElementById(`link-${config.id}`).value;
        const ltx = createLTX(xPos, 120, config.label, link);
        ltxObjects[config.id] = ltx;

        // Draw Internet/LoRa Links
        if (config.id !== 'Home' && link === 'LoRa to Home' && ltxObjects['Home']) {
            drawArchedLink(ltx, ltxObjects['Home'], 'LoRa');
        } else if (config.id === 'Home' && link === 'Cellular') {
            // Self-arch for cellular signal
            drawArchedLink(ltx, {left: ltx.left + 150}, 'Cellular');
        }

        // Sensor Trunk Line (The "T" junction)
        const sensorCount = parseInt(document.getElementById(`count-${config.id}`).value);
        const trunkY = 280;
        
        // Vertical drop from LTX
        canvas.add(new fabric.Line([xPos + 100, 230, xPos + 100, trunkY], { stroke: 'black', strokeWidth: 5 }));
        // Horizontal trunk
        canvas.add(new fabric.Line([xPos + 20, trunkY, xPos + 180, trunkY], { stroke: 'black', strokeWidth: 5 }));

        for (let i = 0; i < sensorCount; i++) {
            const sX = xPos + (i * 70);
            const sY = trunkY + 40;

            const sRect = new fabric.Rect({ width: 50, height: 80, fill: SENSOR_BLUE });
            const sText = new fabric.Text(`NCR ${i+1}`, { fontSize: 10, angle: 90, left: 35, top: 10 });
            const sensor = new fabric.Group([sRect, sText], { left: sX, top: sY });
            
            // Branch line to trunk
            canvas.add(new fabric.Line([sX + 25, sY, sX + 25, trunkY], { stroke: 'black', strokeWidth: 3 }));
            canvas.add(sensor);
        }
    });
}

initMenu();
