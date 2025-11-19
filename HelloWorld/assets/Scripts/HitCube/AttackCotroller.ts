import {
  _decorator,
  Component,
  EventTouch,
  Input,
  input,
  instantiate,
  Node,
  Prefab,
  RigidBody,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("AttackCotroller")
export class AttackCotroller extends Component {
  @property
  public maxNumberOfAttack: number = 20;

  @property
  public testString: string = "hello";

  @property(Node)
  public ground: Node = null;

  @property(Prefab)
  public bulletPrefab: Prefab = null;

  @property
  public bulletSpeed: number = 50;

  @property(Node)
  public bulletParent: Node = null;

  start() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  onTouchStart(event: EventTouch) {
    // 根据预制体生成实例
    const bullet = instantiate(this.bulletPrefab);
    bullet.setParent(this.bulletParent);
    // bullet.setPosition(0, 0, 0);
    // or
    bullet.setWorldPosition(this.node.position);
    const rgd = bullet.getComponent(RigidBody);
    rgd.setLinearVelocity(new Vec3(0, 0, -this.bulletSpeed));
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }
}
