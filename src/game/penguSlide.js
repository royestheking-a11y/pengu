import Phaser from 'phaser';

class PenguSlide extends Phaser.Scene {
    constructor() {
        super('PenguSlide');
    }

    init() {
        // Physics constants (Pro-level refinements)
        this.GRAVITY = 2500;
        this.FALL_GRAVITY_MULT = 1.5;
        this.JUMP_FORCE = -850;
        this.COYOTE_TIME = 150; // ms
        this.JUMP_BUFFER_TIME = 150; // ms
        this.OBSTACLE_SPEED = -450;
        this.SPEED_INCREMENT = -0.5;

        // State variables
        this.isGameOver = false;
        this.score = 0;
        this.coinsCollected = 0;
        this.lastGroundedTime = 0;
        this.jumpBufferTime = 0;
        this.currentObstacleSpeed = this.OBSTACLE_SPEED;
    }

    preload() {
        this.load.image('pengu_run', '/assets/game/pengu_run.png');
        this.load.image('pengu_jump', '/assets/game/pengu_jump.png');
        this.load.image('pengu_snowball', '/assets/game/pengu_snowball.png');
        this.load.image('gold_fish', '/assets/game/gold_fish.png');
        this.load.image('silver_fish', '/assets/game/silver_fish.png');
        this.load.image('rock', '/assets/game/rock.png');

        // Ground placeholder (white rect if no image)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillRect(0, 0, 1280, 100);
        graphics.generateTexture('ground_tex', 1280, 100);
    }

    create() {
        const { width, height } = this.scale;

        // Ground
        this.ground = this.add.tileSprite(0, height - 60, width, 120, 'ground_tex').setOrigin(0, 0.5);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = this.physics.add.sprite(150, height - 150, 'pengu_run').setScale(0.6);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(this.GRAVITY);

        // Small Hitbox Leniency (as requested: 15-20% smaller)
        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.7);
        this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.2);

        // Input
        this.input.on('pointerdown', () => this.handleJumpInput());
        this.input.keyboard.on('keydown-SPACE', () => this.handleJumpInput());

        // Groups (Object Pooling via Group)
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        // Spawning Logic
        this.spawnTimer = this.time.addEvent({
            delay: 1800,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        this.coinTimer = this.time.addEvent({
            delay: 1200,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });

        // Collisions
        this.physics.add.collider(this.player, this.ground, () => {
            this.lastGroundedTime = this.time.now;
        });

        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // 1. Delta-Time Movement consistent across 60/144Hz
        const dt = delta / 16.666; // Normalized to 60fps
        this.ground.tilePositionX += 8 * dt;

        // 2. Score Progression
        this.score += 1;

        // 3. Difficulty curve
        this.currentObstacleSpeed += this.SPEED_INCREMENT * (delta / 1000);

        // 4. Asymmetric Gravity (Heavier on falling)
        if (this.player.body.velocity.y > 0) {
            this.player.body.setGravityY(this.GRAVITY * this.FALL_GRAVITY_MULT);
        } else {
            this.player.body.setGravityY(this.GRAVITY);
        }

        // 5. Sprite state
        if (!this.player.body.touching.down) {
            this.player.setTexture('pengu_jump');
        } else {
            this.player.setTexture('pengu_run');
        }

        // 6. Jump Buffering
        if (this.jumpBufferTime > 0 && (this.time.now - this.jumpBufferTime < this.JUMP_BUFFER_TIME)) {
            if (this.player.body.touching.down || (this.time.now - this.lastGroundedTime < this.COYOTE_TIME)) {
                this.executeJump();
                this.jumpBufferTime = 0;
            }
        }

        // Cleanup
        this.obstacles.getChildren().forEach(obj => {
            if (obj.x < -100) obj.destroy();
        });
        this.coins.getChildren().forEach(obj => {
            if (obj.x < -100) obj.destroy();
        });
    }

    handleJumpInput() {
        if (this.isGameOver) return;

        const isGrounded = this.player.body.touching.down;
        const withinCoyoteTime = this.time.now - this.lastGroundedTime < this.COYOTE_TIME;

        if (isGrounded || withinCoyoteTime) {
            this.executeJump();
        } else {
            // Buffer the jump if not grounded
            this.jumpBufferTime = this.time.now;
        }
    }

    executeJump() {
        this.player.setVelocityY(this.JUMP_FORCE);
        this.lastGroundedTime = 0; // Prevent double coyote jump
    }

    spawnObstacle() {
        if (this.isGameOver) return;
        const x = this.scale.width + 100;
        const y = this.scale.height - 110;
        const rock = this.obstacles.create(x, y, 'rock').setScale(0.5);
        rock.setVelocityX(this.currentObstacleSpeed);

        // Randomize next spawn a bit
        this.spawnTimer.reset({
            delay: Phaser.Math.Between(1500, 3000),
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
    }

    spawnCoin() {
        if (this.isGameOver) return;
        const x = this.scale.width + 100;
        const y = Phaser.Math.Between(this.scale.height - 350, this.scale.height - 180);

        const isGold = Phaser.Math.Between(1, 10) > 8; // 20% gold chance
        const key = isGold ? 'gold_fish' : 'silver_fish';

        const coin = this.coins.create(x, y, key).setScale(0.4);
        coin.setData('isGold', isGold);
        coin.setVelocityX(this.currentObstacleSpeed);
    }

    collectCoin(player, coin) {
        const isGold = coin.getData('isGold');
        coin.destroy();

        if (isGold) {
            this.coinsCollected += 1;
            this.events.emit('coinCollected', this.coinsCollected);
        } else {
            this.score += 50; // Points for silver
        }
    }

    hitObstacle() {
        if (this.isGameOver) return;

        // 1. Hit Stop (Micro-pause)
        this.physics.pause();
        this.isGameOver = true;

        // 2. Camera Shake
        this.cameras.main.shake(200, 0.01);

        // 3. Visual swap
        this.player.setTexture('pengu_snowball');
        this.player.setTint(0xff8888);

        // Delay emitting game over for psychological impact
        this.time.delayedCall(1000, () => {
            this.events.emit('gameOver', {
                score: Math.floor(this.score / 10),
                coins: this.coinsCollected
            });
        });
    }
}

export default PenguSlide;
