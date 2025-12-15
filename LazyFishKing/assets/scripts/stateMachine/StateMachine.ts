import { _decorator, Component, Animation, log } from 'cc';
const { ccclass, property } = _decorator;

export const States = {
    IDLE: 'idle', //空闲状态
    WALKING: 'walking', //行走状态
    ATTACKING: 'attacking', //攻击状态
    SHOOTING: 'shooting', //射击状态
    HEALING: 'healing', //治疗状态
    CASTING: 'casting', //施法状态
    HURT: 'hurt', //受伤状态
    DYING: 'dying', //死亡状态
    EMPTY: 'empty' //空状态
}

@ccclass('StateMachine')
export class StateMachine extends Component {

    @property(Animation)
    animation: Animation = null;

    private _currentState: string = States.EMPTY;
    public get currentState(): string {
        return this._currentState;
    }
    public set currentState(value: string) {
        this._currentState = value;
    }

    /**
     * change state and play animation
     * @param newState 
     */
    changeState(newState: string) {
        if (this.currentState != newState) {
            this.currentState = newState;
            if (this.currentState != States.CASTING) {
                this.playAnimationByState();
            }
        }
    }

    playAnimationByState() {
        const clips = this.animation.clips;
        const ani = clips.filter(clip => clip.name == this.currentState)
        if (ani.length > 0) {
            this.animation.play(this.currentState);
        } else {
            log("No this state animation " + this.currentState);
        }
    }

    /**
     * 获取状态的动画时长
     * @param state 
     * @returns -1:no duration
     */
    getAnimationDuration(state: string): number {
        const clips = this.animation.clips;
        const ani = clips.filter(clip => clip.name == this.currentState);
        if (ani.length > 0) {
            return ani[0].duration;
        } else {
            log("cannot find state" + state);
            return -1;
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


