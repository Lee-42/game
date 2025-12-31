import {
  _decorator,
  Component,
  Node,
  instantiate,
  UITransform,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Area")
export class Area extends Component {
  @property
  rows: number = 17;

  @property
  columns: number = 17;

  @property({ type: Number, tooltip: "Number of bricks to generate" })
  num: number = 0;

  private _map: number[][] = [];

  // Cache grid info
  private _tileWidth: number = 40;
  private _tileHeight: number = 40;
  private _startX: number = 0;
  private _startY: number = 0;

  start() {
    this.validateDimensions();
    this.generateMapData();
    // Move renderMap call after we set up grid info, or init grid info inside
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
    const emptySpots: { r: number; c: number }[] = [];

    for (let r = 0; r < this.rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < this.columns; c++) {
        if (
          r === 0 ||
          r === this.rows - 1 ||
          c === 0 ||
          c === this.columns - 1
        ) {
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
      console.warn(
        `Requested ${this.num} bricks, but only ${emptySpots.length} empty spots available.`
      );
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
    const wallNode = this.node.getChildByName("Wall");
    const groundNode = this.node.getChildByName("Ground");
    const brickNode = this.node.getChildByName("Brick");

    if (!wallNode || !groundNode || !brickNode) {
      console.error("Area needs 'Wall', 'Ground', and 'Brick' children");
      return;
    }

    wallNode.active = false;
    groundNode.active = false;
    brickNode.active = false;

    // Cache Tile Size and Start Position
    const transform = groundNode.getComponent(UITransform);
    this._tileWidth = transform ? transform.width : 40;
    this._tileHeight = transform ? transform.height : 40;

    // Assuming anchor is 0.5, 0.5
    this._startX = -(this.columns * this._tileWidth) / 2 + this._tileWidth / 2;
    this._startY = -(this.rows * this._tileHeight) / 2 + this._tileHeight / 2;

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
          newNode.setPosition(
            this._startX + c * this._tileWidth,
            this._startY + r * this._tileHeight
          );
        }
      }
    }

    // Set Robot Position to (1, 1)
    const robotNode = this.node.getChildByName("Robot");
    console.log(robotNode);
    if (robotNode) {
      robotNode.setPosition(
        this._startX + 1 * this._tileWidth,
        this._startY + 1 * this._tileHeight
      );
      robotNode.active = true;
      // Ensure Robot is drawn on top of the generated map tiles
      robotNode.setSiblingIndex(this.node.children.length - 1);
    }
  }

  public spawnBomb(worldPos: Vec3): boolean {
    const bombTemplate = this.node.getChildByName("Bomb");
    if (!bombTemplate) {
      console.warn("Bomb template not found in Area");
      return false;
    }

    // Convert worldPos (or relative pos from Robot) to Area local space
    // Robot is usually child of Area, so its position is already local to Area.
    // If Robot is NOT child of Area, we need conversion.
    // Based on previous code: "robotNode = this.node.getChildByName('Robot')", Robot IS a child.
    // So `worldPos` passed in should be treated as local position or we expect local pos.

    // Calculate Grid Index
    // x = startX + c * w  =>  c = (x - startX) / w
    // y = startY + r * h  =>  r = (y - startY) / h

    // Add 0.5 to round to nearest integer index
    const c = Math.round((worldPos.x - this._startX) / this._tileWidth);
    const r = Math.round((worldPos.y - this._startY) / this._tileHeight);

    // Check bounds
    if (r < 0 || r >= this.rows || c < 0 || c >= this.columns) {
      return false;
    }

    // Check if walls or avoid spamming?
    // For now just Snap to Grid
    const targetX = this._startX + c * this._tileWidth;
    const targetY = this._startY + r * this._tileHeight;

    const newBomb = instantiate(bombTemplate);
    newBomb.active = true;
    this.node.addChild(newBomb);
    newBomb.setPosition(targetX, targetY);

    return true;
  }

  update(deltaTime: number) {}
}
