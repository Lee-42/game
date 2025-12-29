import { _decorator, Component, Node, instantiate, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Area')
export class Area extends Component {
    @property
    rows: number = 17;

    @property
    columns: number = 17;

    private _map: number[][] = [];

    start() {
        this.validateDimensions();
        this.generateMapData();
        this.renderMap();
    }

    validateDimensions() {
        if (this.rows % 2 === 0) this.rows += 1;
        if (this.columns % 2 === 0) this.columns += 1;
        if (this.rows < 17) this.rows = 17;
        if (this.columns < 17) this.columns = 17;
    }

    generateMapData() {
        this._map = [];
        for (let r = 0; r < this.rows; r++) {
            const row: number[] = [];
            for (let c = 0; c < this.columns; c++) {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.columns - 1) {
                    // Borders are always walls
                    row.push(1);
                } else if (r % 2 === 0 && c % 2 === 0) {
                    // Even rows and columns inside are walls
                    row.push(1);
                } else {
                    // Everything else is ground
                    row.push(0);
                }
            }
            this._map.push(row);
        }
    }

    renderMap() {
        const wallNode = this.node.getChildByName('Wall');
        const groundNode = this.node.getChildByName('Ground');

        if (!wallNode || !groundNode) {
            console.error("Area needs 'Wall' and 'Ground' children");
            return;
        }

        wallNode.active = false;
        groundNode.active = false;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                const type = this._map[r][c];
                let newNode: Node | null = null;

                if (type === 1) {
                    newNode = instantiate(wallNode);
                } else {
                    newNode = instantiate(groundNode);
                }

                if (newNode) {
                    newNode.active = true;
                    this.node.addChild(newNode);

                    // Position logic: assuming 40x40 tiles, centered or bottom-left
                    // Adjust position calculation as needed. Here we keep it simple relative to parent 
                    // or you might want to ask user for tile size. 
                    // For now, let's assume specific tile size is handled by layout or just set position based on index.
                    // We need to know the size of the sprite to position correctly.

                    // Taking a simpler approach: Just set position. 
                    // WARNING: We don't know the tile size. 
                    // Let's assume 40 for now or get it from UITransform if available.

                    const transform = newNode.getComponent(UITransform);
                    const w = transform ? transform.width : 40;
                    const h = transform ? transform.height : 40;

                    // Centering the map? Or starting from 0,0? User didn't specify.
                    // Let's center it for better view if anchor is 0.5,0.5

                    const startX = -(this.columns * w) / 2 + w / 2;
                    const startY = -(this.rows * h) / 2 + h / 2;

                    newNode.setPosition(startX + c * w, startY + r * h);
                }
            }
        }
    }

    update(deltaTime: number) {

    }
}

