import { Bee } from '../game-objects/Bee';
import { BuiltHoneycomb } from '../game-objects/BuiltHoneycomb';
import { Honeycomb } from '../game-objects/Honeycomb';
import { randomRange, randomIntRange } from '../services/random-range';
import { Jug } from '../game-objects/Jug';
import { Flower } from '../game-objects/Flower';
import { Cloud } from '../game-objects/Cloud';

export class Main extends Phaser.Scene {
  public get leftHoneycombExtremity(): Honeycomb {
    return this._leftHoneycombExtremity;
  }

  public set leftHoneycombExtremity(value: Honeycomb) {
    this._leftHoneycombExtremity = value;
  }

  public get rightHoneycombExtremity(): Honeycomb {
    return this._rightHoneycombExtremity;
  }
  public set rightHoneycombExtremity(value: Honeycomb) {
    this._rightHoneycombExtremity = value;
  }
  public static SCENE_KEY = 'Main';
  public static NUMBER_OF_BEES = 30;
  public static RANDOM_BUILD_ANGLE_AMPLITUDE = 1.25;

  public flowers: Flower[];
  private bees: Bee[] = [];

  private _leftHoneycombExtremity: Honeycomb;
  private _rightHoneycombExtremity: Honeycomb;

  constructor() {
    super(Main.SCENE_KEY);
  }

  public tryNewLeftHoneycomb(): BuiltHoneycomb {
    if (!this.shouldBuildNewHoneycombs() && this.leftHoneycombExtremity instanceof BuiltHoneycomb) {
      return this.leftHoneycombExtremity;
    }

    const rightHoneycombPosition = new Phaser.Math.Vector2(
      this.rightHoneycombExtremity.x,
      this.rightHoneycombExtremity.y,
    );
    const leftHoneycombPosition = new Phaser.Math.Vector2(
      this.leftHoneycombExtremity.x,
      this.leftHoneycombExtremity.y,
    );
    const leftToRightHoneycomb = rightHoneycombPosition.subtract(leftHoneycombPosition);
    const directionBetweenHoneycombs = leftToRightHoneycomb.normalize();

    const randomDeltaAngle = randomRange(
      -Main.RANDOM_BUILD_ANGLE_AMPLITUDE,
      Main.RANDOM_BUILD_ANGLE_AMPLITUDE,
    );

    const newRandomAngle = leftToRightHoneycomb.angle() + randomDeltaAngle;
    directionBetweenHoneycombs.setToPolar(newRandomAngle);
    const xDir = directionBetweenHoneycombs.x;
    const yDir = directionBetweenHoneycombs.y;
    const stepLength = 2 * BuiltHoneycomb.RADIUS;
    const newHoneycombPosition = directionBetweenHoneycombs.add(
      new Phaser.Math.Vector2(stepLength * xDir, stepLength * yDir),
    );

    const newHoneycomb = new BuiltHoneycomb(
      this,
      this.leftHoneycombExtremity.x + newHoneycombPosition.x,
      this.leftHoneycombExtremity.y + newHoneycombPosition.y,
    );
    this.leftHoneycombExtremity = newHoneycomb;

    const unsubscribeList = { list: [] };
    const unsubscribeAll = () => {
      unsubscribeList.list.forEach(unsubscribe => unsubscribe());
    };

    unsubscribeList.list = this.bees.map(bee => {
      // @ts-ignore
      return this.matterCollision.addOnCollideStart({
        objectA: bee,
        objectB: this.leftHoneycombExtremity,
        callback: (eventData: { gameObjectB: any }) => {
          // @ts-ignore
          const { gameObjectB } = eventData;

          gameObjectB.hasBeenTouchedByBee = true;
          unsubscribeAll();
        },
      });
    });

    if (this.isHiveComplete()) {
      this.leftHoneycombExtremity.on(BuiltHoneycomb.BUILT_EVENT, () => {
        // tslint:disable-next-line
        console.log('The hive is complete!');
      });
    }

    return newHoneycomb;
  }

  public isHiveComplete(): boolean {
    const newDistance = new Phaser.Math.Vector2(
      this.leftHoneycombExtremity.x,
      this.leftHoneycombExtremity.y,
    )
      .subtract(
        new Phaser.Math.Vector2(this.rightHoneycombExtremity.x, this.rightHoneycombExtremity.y),
      )
      .length();

    return newDistance < 2 * BuiltHoneycomb.RADIUS;
  }

  public shouldBuildNewHoneycombs(): boolean {
    if (!(this.leftHoneycombExtremity instanceof BuiltHoneycomb)) {
      return true;
    }

    const newDistance = new Phaser.Math.Vector2(
      this.leftHoneycombExtremity.x,
      this.leftHoneycombExtremity.y,
    )
      .subtract(
        new Phaser.Math.Vector2(this.rightHoneycombExtremity.x, this.rightHoneycombExtremity.y),
      )
      .length();

    const isFarEnough = newDistance >= 2 * BuiltHoneycomb.RADIUS;
    const isCurrentHoneycombComplete = this.leftHoneycombExtremity.isComplete;

    return isFarEnough && isCurrentHoneycombComplete;
  }

  protected create() {
    this.checkFullscreen();
    this.matter.world.setBounds();

    // Sun
    this.add.circle(70 + randomIntRange(-30, 400), 50, 50, 0xffff78);

    // tslint:disable-next-line
    new Cloud(this, 0, 0);
    // tslint:disable-next-line
    new Cloud(this, 200, 20);
    // tslint:disable-next-line
    new Cloud(this, 400, 10);

    this.add.ellipse(100, 600, 850, 900, 0xc4ffc6);
    this.add.ellipse(500, 600, 650, 900, 0xc4ffc6);
    this.add.ellipse(-100, 550, 800, 600, 0xa5efa8);
    this.add.ellipse(300, 750, 900, 900, 0xa5efa8);
    this.add.ellipse(600, 450, 500, 500, 0xa5efa8);

    this.flowers = [
      new Flower(this, 400 + randomRange(-30, 30), 388, 0.3 + randomRange(-0.05, 0.05)),
      new Flower(this, 490 + randomRange(-30, 30), 388, 0.2 + randomRange(-0.05, 0.05)),
      new Flower(this, 550 + randomRange(-30, 30), 388, 0.25 + randomRange(-0.05, 0.05)),
    ];

    // tslint:disable-next-line
    new Jug(this);

    // Ground
    this.add.rectangle(300, 453, 1200, 130, 0x89d18c);

    const newRandomBee = (_: any, index: number) => {
      const isAWanderer = index % 6 === 0;
      return new Bee(this, 400 + randomRange(-100, 100), 100 + randomRange(-80, 130), isAWanderer);
    };

    this.bees = Array(Main.NUMBER_OF_BEES)
      .fill(0)
      .map(newRandomBee);

    this.bees.forEach(bee => {
      this.time.addEvent({
        delay: 8000 * Math.random(),
        callbackScope: this,
        callback: () => {
          bee.buildHoneycomb();
        },
      });
    });
  }

  private checkFullscreen() {
    const keyObj = this.input.keyboard.addKey('F');
    keyObj.on('down', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });
  }
}
