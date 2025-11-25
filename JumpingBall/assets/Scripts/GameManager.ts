import { _decorator, Component, instantiate, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_WHITE,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Prefab)
  public boxPrefab: Prefab = null;
  @property
  public roadLength: number = 50;

  private _road: BlockType[] = [];

  start() {
    this.generateRoad();
  }

  generateRoad() {
    this.node.removeAllChildren();
    this._road = [];

    this._road.push(BlockType.BT_WHITE);
    for (let i = 1; i < this.roadLength; i++) {
     if(this._road[i - 1] === BlockType.BT_NONE){
        this._road.push(BlockType.BT_WHITE);
     } else {
        this._road.push(Math.random() > 0.5 ? BlockType.BT_WHITE : BlockType.BT_NONE);
      }
    }

    // 只在 BT_WHITE 的位置创建方块
    for(let i = 0; i < this._road.length; i++) {
      if(this._road[i] === BlockType.BT_WHITE) {
        const block = instantiate(this.boxPrefab);
        block.setParent(this.node);
        block.setPosition(i * 40, -40, 0);
      }
    }
    
    // 调试：输出生成的 road 数组
    console.log("Generated road:", this._road);
    const whiteCount = this._road.filter(type => type === BlockType.BT_WHITE).length;
    const noneCount = this._road.filter(type => type === BlockType.BT_NONE).length;
    console.log(`BT_WHITE: ${whiteCount}, BT_NONE: ${noneCount}`);
  }

  update(deltaTime: number) {}
}
