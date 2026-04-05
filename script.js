const canvas = new fabric.Canvas('networkCanvas', {
    width: window.innerWidth - 300,
    height: window.innerHeight,
    backgroundColor: '#fff'
});

// Define Protocol Colors
const colors = {
    'Modbus': 'blue',
    'HART': 'orange',
    '4-20': 'green',
    'SmartBob': 'yellow',
    'HerdStar': 'purple'
};

// Initialize LTX Menu items
const ltxConfigs = [
    { id: 'Home', defaultLink: ['Ethernet', 'Cellular'] },
    { id: '2', defaultLink: ['LoRa to Home', 'Wired'] },
    { id: '3', defaultLink: ['LoRa to Home', 'Wired'] },
    { id: '4', defaultLink: ['LoRa to Home', 'Wired'] }
];

function initMenu() {
    const container = document.getElementById('ltx-inputs');
    ltxConfigs.forEach(ltx => {
        container.innerHTML += `
            <div class="ltx-group">
                <strong>LTX ${ltx.id}</strong>
                <label>Sensors Count:</label>
                <input type="number" id="count-${ltx.id}" value="2">
                <label>Sensor Type:</label>
                <select id="type-${ltx.id}">
                    <option>NCR</option><option>CNCR</option><option>SmartBob</option><option>HerdStar</option>
                </select>
                <label>Protocol:</label>
                <select id="proto-${ltx.id}">
                    <option>Modbus</option><option>HART</option><option>4-20</option><option>SmartBob</option><option>HerdStar</option>
                </select>
                <label>Link Type:</label>
                <select id="link-${ltx.id}">
                    ${ltx.defaultLink.map(opt => `<option>${opt}</option>`).join('')}
                </select>
            </div>`;
    });
}

function createLTX(x, y, name, linkType) {
    const rect = new fabric.Rect({
        width: 120, height: 70, fill: '#8b0000', // Maroon-Red
        originX: 'center', originY: 'center'
    });
    
    const text = new fabric.Text(name, {
        fontSize: 14, fill: '#fff', originX: 'center', originY: 'center'
    });

    // Simple Antenna markers
    const antennaCount = linkType === 'Cellular' ? 2 : 1;
    const antennas = [];
    for(let i=0; i<antennaCount; i++) {
        antennas.push(new fabric.Rect({
            width: 4, height: 15, fill: '#000',
            left: (x - 20) + (i * 10), top: y - 45
        }));
    }

    const group = new fabric.Group([rect, text, ...antennas], { left: x, top: y });
    canvas.add(group);
    return group;
}

function generateMap() {
    canvas.clear();
    let startX = 100;
    
    ltxConfigs.forEach((ltx, index) => {
        const count = document.getElementById(`count-${ltx.id}`).value;
        const proto = document.getElementById(`proto-${ltx.id}`).value;
        const link = document.getElementById(`link-${ltx.id}`).value;
        
        const ltxObj = createLTX(startX + (index * 200), 50, `LTX ${ltx.id}`, link);
        
        let lastSensor = ltxObj;

        for (let i = 0; i < count; i++) {
            const sX = (startX + (index * 200));
            const sY = 150 + (i * 80);
            
            const sensor = new fabric.Rect({
                width: 80, height: 40, fill: '#00a8e8',
                left: sX, top: sY, originX: 'center'
            });
            
            const sText = new fabric.Text(`${proto} ${i+1}`, {
                fontSize: 12, left: sX, top: sY + 10, originX: 'center'
            });

            const sGroup = new fabric.Group([sensor, sText], { left: sX, top: sY });
            
            // Wiring Logic
            let lineColor = colors[proto] || 'black';
            let target = (proto === '4-20') ? ltxObj : lastSensor;

            const line = new fabric.Line([
                target.left + 40, target.top + 20, 
                sGroup.left + 40, sGroup.top
            ], {
                stroke: lineColor, strokeWidth: 3, selectable: true
            });

            canvas.add(line);
            canvas.add(sGroup);
            lastSensor = sGroup;
            
            // Click to rename
            sGroup.on('mousedblclick', () => {
                const newName = prompt("Enter Sensor Name:", sText.text);
                if(newName) sText.set('text', newName);
                canvas.renderAll();
            });
        }
    });
}

function downloadPNG() {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'network-map.png';
    link.href = dataURL;
    link.click();
}

initMenu();
