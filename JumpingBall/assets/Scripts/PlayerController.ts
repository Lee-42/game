import {
  _decorator,
  Animation,
  Component,
  EventMouse,
  Input,
  input,
  Node,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  private _startJump = false;
  private _jumpTime = 0.2;
  private _curJumpTimer = 0;
  private _jumpSpeed = 0;
  private _targetPos = new Vec3(0, 0, 0);
  private _curPos = new Vec3(0, 0, 0);

  @property(Animation)
  public bodyAnim: Animation = null;

  start() {
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
  }

  onMouseDown(event: EventMouse) {
    console.log("onMouseDown: " + event.getLocationX());
    const button = event.getButton();
    switch (button) {
      case 0:
        this.jumpByStep(1);
        break;
      case 2:
        this.jumpByStep(2);
        break;
    }
  }

  // Canvas 取消 Align Canvas With Screen
  jumpByStep(step: number) {
    if (this._startJump) {
      return;
    }

    const animName = step === 1 ? "JumpOneStep" : "JumpTwoStep";
    console.log('animName: ', animName)
    const animState = this.bodyAnim.getState(animName);
    const animDuration = animState.duration;
    this._jumpTime = animDuration;

    const moveDistance = 40 * step;
    this._startJump = true;
    this._curJumpTimer = 0;
    this._jumpSpeed = moveDistance / this._jumpTime;

    this._curPos = this.node.position;
    // this._targetPos = new Vec3(this._curPos.x + 40 * step, this._curPos.y);
    Vec3.add(this._targetPos, this._curPos, new Vec3(moveDistance, 0, 0));

    if(step === 1){
      this.bodyAnim.play("JumpOneStep");
    } else if(step === 2){
      this.bodyAnim.play("JumpTwoStep");
    }
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTimer += deltaTime;
      if (this._curJumpTimer >= this._jumpTime) {
        this._startJump = false;
        this.node.setPosition(this._targetPos);
      } else {
        const curPos = this.node.position;
        this.node.setPosition(curPos.x + this._jumpSpeed * deltaTime, curPos.y);
      }
    }
  }

  onDestroy() {
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
  }
}
