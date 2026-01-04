import {
  _decorator,
  Component,
  Node,
  instantiate,
  UITransform,
  Vec3,
  Animation,
  Vec2,
} from "cc";
import { Fire, FireType } from "./Fire";
const { ccclass, property } = _decorator;

@ccclass("Area")
export class Area extends Component {
  @property
  rows: number = 17;

  @property
  columns: number = 17;

  @property({ type: Number, tooltip: "Number of bricks to generate" })
  num: number = 0;

  @property({ type: Number, tooltip: "Number of balloons to generate" })
  numBalloons: number = 5;

  @property({ type: Number, tooltip: "Number of onions to generate" })
  numOnions: number = 5;

  private _map: number[][] = [];
  private _tileNodes: (Node | null)[][] = [];

  // Cache grid info
  private _tileWidth: number = 32;
  private _tileHeight: number = 32;
  private _startX: number = 0;
  private _startY: number = 0;

  private _bombNode: Node | null = null;
  private _balloonNode: Node | null = null;
  private _onionNode: Node | null = null;
  private _enemyNode: Node | null = null;

  onLoad() {
    // Find and turn off the template so it doesn't execute or render
    const bomb = this.node.getChildByName("Bomb");
    if (bomb) {
      this._bombNode = bomb;
      this._bombNode.active = false;
    } else {
      console.warn("Bomb template not found in Area during onLoad");
    }

    const enemyNode = this.node.getChildByName("Enemy");
    if (enemyNode) {
      this._enemyNode = enemyNode;
      const balloon = enemyNode.getChildByName("Balloon");
      if (balloon) {
        this._balloonNode = balloon;
        this._balloonNode.active = false;
      }
      const onion = enemyNode.getChildByName("Onion");
      if (onion) {
        this._onionNode = onion;
        this._onionNode.active = false;
      }
    } else {
      // Fallback: check direct child just in case
      const balloon = this.node.getChildByName("Balloon");
      if (balloon) {
        this._balloonNode = balloon;
        this._balloonNode.active = false;
      }
      const onion = this.node.getChildByName("Onion");
      if (onion) {
        this._onionNode = onion;
        this._onionNode.active = false;
      }
    }
  }

  start() {
    this.validateDimensions();
    this.generateMapData();
    // Move renderMap call after we set up grid info, or init grid info inside
    this.renderMap();
    this.spawnEnemies();
  }

  spawnEnemies() {
    const potentialSpots: { r: number; c: number }[] = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        // 1. Must be empty ground
        if (this._map[r][c] !== 0) continue;

        // 2. Safety check: Avoid sticking to player spawn (1, 1)
        if (r <= 3 && c <= 3) continue;

        potentialSpots.push({ r, c });
      }
    }

    // Shuffle
    for (let i = potentialSpots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [potentialSpots[i], potentialSpots[j]] = [
        potentialSpots[j],
        potentialSpots[i],
      ];
    }

    let spotIndex = 0;

    // Spawn Balloons
    if (this._balloonNode && this.numBalloons > 0) {
      const count = Math.min(
        this.numBalloons,
        potentialSpots.length - spotIndex
      );
      for (let i = 0; i < count; i++) {
        this.spawnSingleEnemy(this._balloonNode, potentialSpots[spotIndex]);
        spotIndex++;
      }
    }

    // Spawn Onions
    if (this._onionNode && this.numOnions > 0) {
      const count = Math.min(this.numOnions, potentialSpots.length - spotIndex);
      for (let i = 0; i < count; i++) {
        this.spawnSingleEnemy(this._onionNode, potentialSpots[spotIndex]);
        spotIndex++;
      }
    }
  }

  spawnSingleEnemy(prefab: Node, spot: { r: number; c: number }) {
    const enemy = instantiate(prefab);
    enemy.active = true;

    if (this._enemyNode) {
      this._enemyNode.addChild(enemy);
    } else {
      this.node.addChild(enemy);
    }

    enemy.setPosition(
      this._startX + spot.c * this._tileWidth,
      this._startY + spot.r * this._tileHeight
    );
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
    this._tileWidth = transform ? transform.width : 32;
    this._tileHeight = transform ? transform.height : 32;

    // Assuming anchor is 0.5, 0.5
    this._startX = -(this.columns * this._tileWidth) / 2 + this._tileWidth / 2;
    this._startY = -(this.rows * this._tileHeight) / 2 + this._tileHeight / 2;

    // Initialize node storage
    this._tileNodes = [];

    for (let r = 0; r < this.rows; r++) {
      const nodeRow: (Node | null)[] = [];
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

        nodeRow.push(newNode);
      }
      this._tileNodes.push(nodeRow);
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

    if (this._enemyNode) {
      this._enemyNode.setSiblingIndex(this.node.children.length - 1);
    }
  }

  public spawnBomb(worldPos: Vec3): boolean {
    if (!this._bombNode) {
      console.warn("Bomb template not found (check Area.onLoad)");
      return false;
    }

    // Calculate Grid Index
    const c = Math.round((worldPos.x - this._startX) / this._tileWidth);
    const r = Math.round((worldPos.y - this._startY) / this._tileHeight);

    // Check bounds
    if (r < 0 || r >= this.rows || c < 0 || c >= this.columns) {
      return false;
    }

    const targetX = this._startX + c * this._tileWidth;
    const targetY = this._startY + r * this._tileHeight;

    const newBomb = instantiate(this._bombNode);
    newBomb.active = true;
    this.node.addChild(newBomb);
    newBomb.setPosition(targetX, targetY);

    return true;
  }

  public onBombExplode(worldPos: Vec3, range: number = 1) {
    const c = Math.round((worldPos.x - this._startX) / this._tileWidth);
    const r = Math.round((worldPos.y - this._startY) / this._tileHeight);

    // 1. Explode Center
    this.createExplosionEffect(r, c, new Vec2(0, 0), false);

    // 2. Explode Directions
    const dirs = [
      { x: 0, y: 1 }, // Up
      { x: 0, y: -1 }, // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 }, // Right
    ];

    for (const dir of dirs) {
      for (let i = 1; i <= range; i++) {
        const targetR = r + dir.y * i;
        const targetC = c + dir.x * i;

        // Bounds Check
        if (
          targetR < 0 ||
          targetR >= this.rows ||
          targetC < 0 ||
          targetC >= this.columns
        ) {
          break;
        }

        const type = this._map[targetR][targetC];

        // Wall: Stop
        if (type === 1) {
          break;
        }

        // Brick: Destroy and Stop
        if (type === 2) {
          this.destroyBrick(targetR, targetC);
          // Show Tip effect since it's blocked here
          this.createExplosionEffect(
            targetR,
            targetC,
            new Vec2(dir.x, dir.y),
            true
          );
          break;
        }

        // Ground: Continue
        if (type === 0) {
          const isEnd = i === range;
          this.createExplosionEffect(
            targetR,
            targetC,
            new Vec2(dir.x, dir.y),
            isEnd
          );
        }
      }
    }
  }

  private destroyBrick(r: number, c: number) {
    const node = this._tileNodes[r][c];
    if (node) {
      const anim = node.getComponent(Animation);
      if (anim) {
        anim.play("brick-explode");
        anim.once(
          Animation.EventType.FINISHED,
          () => {
            node.destroy();
          },
          this
        );
      } else {
        node.destroy();
      }
    }

    // Update Map Data
    this._map[r][c] = 0; // Become ground
    this._tileNodes[r][c] = null;

    // Spawn ground underneath so no black hole
    this.spawnGround(r, c);
  }

  private spawnGround(r: number, c: number) {
    const groundNodeTemplate = this.node.getChildByName("Ground");
    if (groundNodeTemplate) {
      const newGround = instantiate(groundNodeTemplate);
      newGround.active = true;
      this.node.addChild(newGround);
      newGround.setPosition(
        this._startX + c * this._tileWidth,
        this._startY + r * this._tileHeight
      );
      newGround.setSiblingIndex(0);
      this._tileNodes[r][c] = newGround;
    }
  }

  private createExplosionEffect(
    r: number,
    c: number,
    direction: Vec2,
    isTip: boolean
  ) {
    const fireNodeTemplate = this.node.getChildByName("Fire");
    if (!fireNodeTemplate) {
      console.warn("Fire template not found in Area");
      return;
    }

    const newFire = instantiate(fireNodeTemplate);
    newFire.active = true;
    this.node.addChild(newFire);
    newFire.setPosition(
      this._startX + c * this._tileWidth,
      this._startY + r * this._tileHeight
    );

    // Fix Layering: Ensure Fire is below Enemy (Balloon)
    if (this._enemyNode) {
      // Insert fire underneath the enemy layer
      // If there are other top-layer objects (like Player), this might need refinement,
      // but for now this ensures Balloon > Fire.
      newFire.setSiblingIndex(this._enemyNode.getSiblingIndex());
    }

    const fireComp = newFire.getComponent(Fire);
    if (fireComp) {
      let type = FireType.Body;
      if (direction.x === 0 && direction.y === 0) {
        type = FireType.Center;
      } else if (isTip) {
        type = FireType.End;
      }

      fireComp.init(type, direction);
    }
  }

  update(deltaTime: number) {}
}
