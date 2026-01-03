import { _decorator, Vec2, Vec3, random, randomRange } from 'cc';
import { Enemy } from './Enemy';
import { Fire } from '../Fire';
const { ccclass, property } = _decorator;

enum BalloonState {
    Idle,
    Moving,
    Dead
}

@ccclass('Balloon')
export class Balloon extends Enemy {

    @property
    speed: number = 80;

    private _state: BalloonState = BalloonState.Idle;
    private _moveDir: Vec2 = new Vec2(0, 0);
    private _stateTimer: number = 0;
    private _movingTime: number = 0;

    start() {
        super.start();
        this.enterIdleState();
    }

    update(deltaTime: number) {
        if (this._isDead) return;

        if (this._state === BalloonState.Idle) {
            this._stateTimer -= deltaTime;
            if (this._stateTimer <= 0) {
                this.enterMovingState();
            }
        } else if (this._state === BalloonState.Moving) {
            this._movingTime += deltaTime;

            if (this._rb) {
                 const currentVel = this._rb.linearVelocity;
                 // If we have been moving for a bit (>0.1s) and velocity is near zero, we are stuck.
                 if (this._movingTime > 0.1 && currentVel.length() < 1.0) {
                     console.log('[Balloon] Stuck! Force Idle');
                     this.handleCollision();
                     return;
                 }
                
                this._rb.linearVelocity = new Vec2(this._moveDir.x * this.speed, this._moveDir.y * this.speed);
            }
        }
    }

    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        super.onBeginContact(selfCollider, otherCollider, contact);
        if (this._isDead) return;

        // If hit wall/bomb/brick (not Fire), change direction
        // Fire is handled in Consumer (super), but here we handle "Obstacles"
        const isFire = !!otherCollider.getComponent(Fire);
        const isSensor = otherCollider.sensor; 

        if (!isFire && !isSensor) {
            // Hit something solid
            this.handleCollision();
        }
    }

    private handleCollision() {
        console.log('[Balloon] Hit wall/obstacle, entering Idle');
        this.enterIdleState();
    }

    private enterIdleState() {
        this._state = BalloonState.Idle;
        this._stateTimer = randomRange(0.5, 1.5); 
        console.log(`[Balloon] Idle for ${this._stateTimer}s`);
        
        if (this._rb) this._rb.linearVelocity = new Vec2(0, 0);
        
        if (this._anim) {
            this._anim.play('ballon-idle'); 
        }
    }

    private enterMovingState() {
        this._state = BalloonState.Moving;
        this._movingTime = 0;
        this.pickRandomDirection();
        console.log(`[Balloon] Moving dir: ${this._moveDir}, Speed: ${this.speed}`);
        
        if (this._anim) {
            if (this._moveDir.x < 0) {
                this._anim.play('ballon-walk-left');
            } else if (this._moveDir.x > 0) {
                this._anim.play('ballon-walk-right');
            } else {
                // Up or Down
                this._anim.play('ballon-idle');
            }
        }
    }
 
    private pickRandomDirection() {
        const dirs = [
            new Vec2(0, 1),
            new Vec2(0, -1),
            new Vec2(-1, 0),
            new Vec2(1, 0)
        ];
        
        const currentDir = this._moveDir;
        let availableDirs = dirs;

        if (currentDir.length() > 0) {
            availableDirs = dirs.filter(d => !d.equals(currentDir));
        }

        if (availableDirs.length > 0) {
            const idx = Math.floor(random() * availableDirs.length);
            this._moveDir = availableDirs[idx];
        } else {
             this._moveDir = dirs[0];
        }
        console.log(`[Balloon] Picked new dir: ${this._moveDir} from ${availableDirs.length} options`);
    }
}
