import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    start() {
        console.log('start')
    }

    // 每帧执行一次, 最多执行60次/秒
    update(deltaTime: number) {
        console.log('update' + deltaTime)
    }
}

