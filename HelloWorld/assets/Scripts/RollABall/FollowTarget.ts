import { _decorator, Component, Node, RigidBody, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("FollowTarget")
export class FollowTarget extends Component {
  @property(Node)
  public target: Node;

  private offset: Vec3 = null;

  start() {
    const p1 = this.node.position;
    const p2 = this.target.position;
    this.offset = new Vec3(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
  }

  // 如果Player update和FollowTarget的 update同时执行, 会导致相机抖动
  // 先执行所有的 update 函数，再执行所有的 lateUpdate 函数
  lateUpdate(deltaTime: number) {
    this.node.setPosition(
      this.target.position.x + this.offset.x,
      this.target.position.y + this.offset.y,
      this.target.position.z + this.offset.z
    );
  }
}
