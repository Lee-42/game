import {
  _decorator,
  Collider,
  Component,
  EventKeyboard,
  ICollisionEvent,
  Input,
  input,
  ITriggerEvent,
  KeyCode,
  Node,
  RigidBody,
  Vec2,
  Vec3,
} from "cc";
import { Food } from "./Food";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property
  public speed: number = 5;

  @property
  public moveForce: number = 10;

  private moveDir: Vec2 = Vec2.ZERO;

  @property
  private rgd: RigidBody = null;

  @property
  private collider: Collider = null;

  protected start(): void {
    this.rgd = this.getComponent(RigidBody);
  }

  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);

    // this.collider.on("onCollisionEnter", this.onCollisionEnter, this);
    // this.collider.on("onCollisionExit", this.onCollisionExit, this);
    // this.collider.on("onCollisionStay", this.onCollisionStay, this);

    // 由碰撞器转成触发器, 需要勾选碰撞器的isTrigger属性
    this.collider = this.getComponent(Collider);
    this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
    this.collider.on("onTriggerExit", this.onTriggerExit, this);
    this.collider.on("onTriggerStay", this.onTriggerStay, this);
  }

  onTriggerEnter(event: ITriggerEvent) {
    console.log("onTriggerEnter: " + event);
    const food = event.otherCollider.getComponent(Food);
    if (food) {
      food.node.destroy();
    }
  }
  onTriggerExit(event: ITriggerEvent) {
    console.log("onTriggerExit: " + event);
  }
  onTriggerStay(event: ITriggerEvent) {
    console.log("onTriggerStay: " + event);
  }

  onCollisionEnter(event: ICollisionEvent) {
    // console.log("onCollisionEnter: " + event);
    const food = event.otherCollider.getComponent(Food);
    if (food) {
      food.node.destroy();
    }
  }
  onCollisionExit(event: ICollisionEvent) {
    console.log("onCollisionExit: " + event);
  }
  onCollisionStay(event: ICollisionEvent) {
    console.log("onCollisionStay: " + event);
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.KEY_A:
        this.moveDir = new Vec2(-1, this.moveDir.y);
        break;
      case KeyCode.KEY_D:
        this.moveDir = new Vec2(1, this.moveDir.y);
        break;
      case KeyCode.KEY_W:
        this.moveDir = new Vec2(this.moveDir.x, 1);
        break;
      case KeyCode.KEY_S:
        this.moveDir = new Vec2(this.moveDir.x, -1);
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    console.log("onKeyUp: " + event.keyCode);
    switch (event.keyCode) {
      case KeyCode.KEY_A:
        this.moveDir = Vec2.ZERO;
        break;
      case KeyCode.KEY_D:
        this.moveDir = Vec2.ZERO;
        break;
      case KeyCode.KEY_W:
        this.moveDir = Vec2.ZERO;
        break;
      case KeyCode.KEY_S:
        this.moveDir = Vec2.ZERO;
        break;
    }
  }

  onKeyPressing(event: EventKeyboard) {}

  protected onDestroy(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    input.off(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);

    this.collider.off("onCollisionEnter", this.onCollisionEnter, this);
    this.collider.off("onCollisionExit", this.onCollisionExit, this);
    this.collider.off("onCollisionStay", this.onCollisionStay, this);
  }

  update(deltaTime: number) {
    // const pos = this.node.position;
    // this.node.setPosition(
    //   pos.x + this.moveDir.y * this.speed * deltaTime,
    //   pos.y,
    //   pos.z + this.moveDir.x * this.speed * deltaTime
    // );
    // 施加力
    this.rgd.applyForce(
      new Vec3(this.moveDir.y, 0, this.moveDir.x).multiplyScalar(this.moveForce)
    );
  }
}
