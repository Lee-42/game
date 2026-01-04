import {
  _decorator,
  Vec2,
  Collider2D,
  IPhysics2DContact,
  Contact2DType,
  Animation,
} from "cc";
import { Enemy } from "./Enemy";
const { ccclass, property } = _decorator;

@ccclass("Balloon")
export class Balloon extends Enemy {
  start() {
    super.start();
    console.log("Balloon started");
    this.changeDirection();
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // preserve Enemy death logic (e.g. hitting Fire)
    super.onBeginContact(selfCollider, otherCollider, contact);

    if (this._isDead) return;

    console.log(`Balloon collided with ${otherCollider.node.name}`);

    // Optimization: Don't change direction immediately.
    // Let CircleCollider2D slide along the wall.
    // If we actually stop (hit head-on), update() will handle it.
  }

  changeDirection() {
    if (this._isDead || !this._rb) return;

    const dirs = [
      new Vec2(0, 1),
      new Vec2(0, -1),
      new Vec2(-1, 0),
      new Vec2(1, 0),
    ];
    const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
    this._rb.linearVelocity = randomDir.multiplyScalar(this.speed);

    this.playAnimation(randomDir);
  }

  playAnimation(dir: Vec2) {
    if (!this._anim) return;

    if (dir.x < 0) {
      this._anim.play("balloon-walk-left");
    } else if (dir.x > 0) {
      this._anim.play("balloon-walk-right");
    } else {
      // Vertical movement: keep previous side animation.
      // If no animation is playing (e.g. at start), default to left.
      const state = this._anim.getState("balloon-walk-left");
      const stateRight = this._anim.getState("balloon-walk-right");

      if (!state.isPlaying && !stateRight.isPlaying) {
        this._anim.play("balloon-walk-left");
      }
    }
  }

  update(deltaTime: number) {
    if (this._isDead) return;

    // Safety check: if stopped, move again
    if (this._rb && this._rb.linearVelocity.lengthSqr() < 0.1) {
      this.changeDirection();
    }
  }

  protected die() {
    if (this._isDead) return;
    this._isDead = true;

    // Stop physics
    if (this._collider) this._collider.enabled = false;
    if (this._rb) this._rb.linearVelocity = new Vec2(0, 0);

    // Play death animation
    if (this._anim) {
      this._anim.play("balloon-dead");
      this._anim.once(Animation.EventType.FINISHED, () => {
        this.node.destroy();
      });
    } else {
      this.node.destroy();
    }
  }
}
