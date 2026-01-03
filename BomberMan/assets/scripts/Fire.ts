import { _decorator, Component, Node, Animation, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum FireType {
    Center,
    Body,
    End
}

@ccclass('Fire')
export class Fire extends Component {

    init(type: FireType, direction: Vec2) {
        const anim = this.getComponent(Animation);
        if (!anim) {
            console.error("Fire prefab missing Animation component");
            this.node.destroy();
            return;
        }

        let clipName = "";
        let angle = 0;

        switch (type) {
            case FireType.Center:
                clipName = "fire-center";
                break;
            case FireType.Body:
                clipName = "fire-horizontal";
                // Default is Horizontal (Left-Right)
                // If direction is Vertical (Up-Down), rotate 90
                if (direction.x === 0) {
                    angle = 90;
                }
                break;
            case FireType.End:
                clipName = "fire-right";
                // Default is Right
                if (direction.x === 1) { // Right
                    angle = 0;
                } else if (direction.y === 1) { // Up
                    angle = 90;
                } else if (direction.x === -1) { // Left
                    angle = 180;
                } else if (direction.y === -1) { // Down
                    angle = 270; // or -90
                }
                break;
        }

        this.node.angle = angle;
        
        anim.play(clipName);
        anim.on(Animation.EventType.FINISHED, () => {
            if (this.node && this.node.isValid) {
                this.node.destroy();
            }
        });
    }
}
