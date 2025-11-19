import { _decorator, Component, EventTouch, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        console.log("onTouchStart: " + event.getLocationX());
    }

    onTouchMove(event: EventTouch) {
        // console.log("onTouchMove: " + event.getLocationX());
        const moveScale = 0.05;
        const pos = this.node.position;
        this.node.setPosition(pos.x + event.getDeltaX() * moveScale, pos.y + event.getDeltaY() * moveScale, pos.z);
    }

    onTouchEnd(event: EventTouch) {
        console.log("onTouchEnd: " + event.getLocationX());
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
}

