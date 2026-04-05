const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 320,
    height: window.innerHeight,
    backgroundColor: '#ffffff'
});

const PROTOCOL_COLORS = {
    'Modbus': 'blue',
    'HART': 'orange',
    '4-20': 'green',
    'SmartBob': 'yellow'
};

const MAROON = '#b23a3a';
const SENSOR_BLUE = '#00adef';

// Menu Setup
const configKeys = ['Home', '2', '3', '4'];
function initMenu() {
    const container = document.getElementById('ltx-inputs');
    configKeys.forEach(id => {
        container.innerHTML += `
            <div class="ltx-group">
                <strong>LTX ${id}</strong>
                <label>Active?</label>
                <input type="checkbox" id="active-${id}" ${id === 'Home' || id === '2' ? 'checked' : ''}>
                <label>Sensors Count:</label>
                <input type="number" id="count-${id}" value="3">
                <label>Protocol:</label>
                <select id="proto-${id}">
                    <option>Modbus</option><option>4-20</option><option>HART</option><option>SmartBob</option>
                </select>
                <label>Link Type:</label>
                <select id="link-${id}">
                    ${id === 'Home' ? '<option>Cellular</option><option>Ethernet</option>' : '<option>LoRa to Home</option><option>Wired</option>'}
                </select>
            </div>`;
    });
}

function createLTX(x, y, label, linkType) {
    const rect = new fabric.Rect({ width: 160, height: 90, fill: MAROON, rx: 2, ry: 2 });
    const text = new fabric.Text(label, { fontSize: 22, fontWeight: 'bold', fill: 'white', left: 30, top: 30 });
    
    // Antenna Logic: 2 for Cellular, 1 for everything else
    const antennas = [];
    const antCount = (linkType === 'Cellular') ? 2 : 1;
    for(let i=0; i<antCount; i++) {
        antennas.push(new fabric.Rect({
            width: 8, height: 22, fill: 'black',
            left: 70 + (i * 40), top: -22
        }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
    canvas.add(group);
    return group;
}

function drawLoRaLink(fromObj, toObj) {
    const startX = fromObj.left + 80;
    const startY = fromObj.top;
    const endX = toObj.left + 80;
    const endY = toObj.top;

    // Dotted Blue Line
    const line = new fabric.Line([startX, startY - 10, endX, endY - 10], {
        stroke: '#00adef', strokeWidth: 4, strokeDashArray: [10, 5], selectable: true
    });

    // LoRa Label
    const label = new fabric.Text('LoRa', {
        fontSize: 18, fontWeight: 'bold', fill: '#00adef',
        left: (startX + endX) / 2 - 20, top: startY - 40
    });

    canvas.add(line, label);
}

function generateMap() {
    canvas.clear();
    let ltxMap = {};
    let activeIds = configKeys.filter(id => document.getElementById(`active-${id}`).checked);
    
    // Render LTXs based on active selection
    activeIds.forEach((id, index) => {
        const link = document.getElementById(`link-${id}`).value;
        const xPos = 50 + (index * 280);
        ltxMap[id] = createLTX(xPos, 80, id === 'Home' ? 'LTX Home' : `LTX ${id}`, link);
        
        // If not home and LoRa is selected, link to home
        if (id !== 'Home' && link === 'LoRa to Home' && ltxMap['Home']) {
            drawLoRaLink(ltxMap[id], ltxMap['Home']);
        }

        // Sensors
        const count = parseInt(document.getElementById(`count-${id}`).value);
        const proto = document.getElementById(`proto-${id}`).value;
        let prevNode = ltxMap[id];

        for (let i = 0; i < count; i++) {
            const sX = xPos + 20;
            const sY = 220 + (i * 80);
            
            const sRect = new fabric.Rect({ width: 70, height: 45, fill: SENSOR_BLUE });
            const sText = new fabric.Text(`NCR ${i+1}`, { fontSize: 11, fontWeight: 'bold', left: 5, top: 15 });
            const sGroup = new fabric.Group([sRect, sText], { left: sX, top: sY });
            
            canvas.add(sGroup);

            // Wiring Logic: 4-20 goes to LTX, others daisy chain
            const wireTarget = (proto === '4-20') ? ltxMap[id] : prevNode;
            const wire = new fabric.Line([
                wireTarget.left + 40, wireTarget.top + 45,
                sGroup.left + 40, sGroup.top
            ], { stroke: PROTOCOL_COLORS[proto] || 'black', strokeWidth: 3 });
            
            canvas.add(wire);
            canvas.sendToBack(wire);
            prevNode = sGroup;
        }
    });
}

function downloadPNG() {
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = 'network-diagram.png';
    link.href = dataURL;
    link.click();
}

initMenu();
