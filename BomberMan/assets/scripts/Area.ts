import { _decorator, Component, Node, instantiate, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Area')
export class Area extends Component {
    @property
    rows: number = 17;

    @property
    columns: number = 17;

    @property({ type: Number, tooltip: 'Number of bricks to generate' })
    num: number = 0;

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
        const emptySpots: { r: number, c: number }[] = [];

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
                    emptySpots.push({ r, c });
                }
            }
            this._map.push(row);
        }

        // Place Bricks
        if (this.num > emptySpots.length) {
            console.warn(`Requested ${this.num} bricks, but only ${emptySpots.length} empty spots available.`);
        }

        const bricksToPlace = Math.min(this.num, emptySpots.length);

        // Shuffle emptySpots
        for (let i = emptySpots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [emptySpots[i], emptySpots[j]] = [emptySpots[j], emptySpots[i]];
        }

        // Assign bricks
        for (let i = 0; i < bricksToPlace; i++) {
            const spot = emptySpots[i];
            this._map[spot.r][spot.c] = 2; // 2 represents Brick
        }
    }

    renderMap() {
        const wallNode = this.node.getChildByName('Wall');
        const groundNode = this.node.getChildByName('Ground');
        const brickNode = this.node.getChildByName('Brick');

        if (!wallNode || !groundNode || !brickNode) {
            console.error("Area needs 'Wall', 'Ground', and 'Brick' children");
            return;
        }

        wallNode.active = false;
        groundNode.active = false;
        brickNode.active = false;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                const type = this._map[r][c];
                let newNode: Node | null = null;

                if (type === 1) {
                    newNode = instantiate(wallNode);
                } else if (type === 2) {
                    newNode = instantiate(brickNode);
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

