import {
  _decorator,
  Component,
  Node,
  Animation,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  RigidBody2D,
} from "cc";
import { Area } from "./Area";
const { ccclass, property } = _decorator;

@ccclass("Bomb")
export class Bomb extends Component {
  start() {
    const anim = this.getComponent(Animation);
    if (anim) {
      anim.play("bomb-idle");
    }

    const rb = this.getComponent(RigidBody2D);
    if (rb) {
      rb.enabledContactListener = true; // Ensure we get callbacks
    }

    const collider = this.getComponent(Collider2D);
    if (collider) {
      collider.sensor = true; // Start as sensor so it doesn't push the robot
      collider.on(Contact2DType.END_CONTACT, this.onExitBomb, this);
    }

    // Explode after 3 seconds
    this.scheduleOnce(this.explode, 3);
  }

  explode() {
    if (this.node.parent) {
      const area = this.node.parent.getComponent(Area);
      if (area) {
        area.onBombExplode(this.node.position, 1);
      }
    }
    this.node.destroy();
  }

  onExitBomb(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // Use scheduleOnce to modify physics properties safely outside the callback
    this.scheduleOnce(() => {
      const collider = this.getComponent(Collider2D);
      if (collider && collider.sensor) {
        // Force update by toggling enabled state
        collider.enabled = false;
        collider.sensor = false; // Become solid
        collider.enabled = true;

        collider.off(Contact2DType.END_CONTACT, this.onExitBomb, this);
      }
    }, 0);
  }

  update(deltaTime: number) {}
}
