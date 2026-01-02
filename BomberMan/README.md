#### 一、解决"卡墙角"问题

1、在网格游戏里，如果主角的碰撞框和通道一样宽（例如都是 40 像素），那么只要歪了 1 个像素，就会撞到墙角走不动。

1. 缩小主角碰撞体（最推荐）
   不要让主角的碰撞体和格子一样大。这是一切《炸弹人》或《坦克大战》类游戏的手感秘诀。

   - **方案 A（最佳）**：使用 **CircleCollider2D (圆形碰撞体)**。
     - 将半径 (Radius) 设为 14-15 (略小于格子的一半)。
     - **原理**：圆形边缘天生顺滑，撞到墙角会自动“滑”进通道，手感最丝滑，且彻底解决“小人钻方块缝隙”的问题。
   - **方案 B**：使用 BoxCollider2D 并缩小尺寸。
     - 例如格子 40，将 Size 设为 30。
     - **注意**：可能会导致物理穿透（小人钻进两块墙的缝隙里），不如圆形稳定。

#### 二、AudioSource 和 AudioClip 的区别

1. **AudioClip (音频剪辑)**

   - **实质**：音频资源数据（CD / 磁带）。
   - **作用**：存储声音波形，自己不发声。
   - **代码**：`@property(AudioClip) public clip: AudioClip = null;`

2. **AudioSource (音频源)**
   - **实质**：播放器组件（CD 播放机）。
   - **作用**：读取 AudioClip 并播放。
   - **代码**：
     ```typescript
     const audioSource = this.getComponent(AudioSource);
     // 播放默认 Clip
     audioSource.play();
     // 临时播放指定 Clip
     audioSource.playOneShot(this.explodeClip);
     ```
