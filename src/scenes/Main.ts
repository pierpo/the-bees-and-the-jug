import { InitialHoneycomb } from '../game-objects/InitialHoneycomb';
import { Bee } from '../game-objects/Bee';
import { BuiltHoneycomb } from '../game-objects/BuiltHoneycomb';
import { Honeycomb } from '../game-objects/Honeycomb';

export class Main extends Phaser.Scene {
  constructor(key: string) {
    super(key);
  }

  static RED_COLOR = 0xffa2a9;

  private leftHoneycombExtremity: Honeycomb;
  private rightHoneycombExtremity: Honeycomb;

  bees: Bee[] = [];

  protected create() {
    this.matter.world.setBounds();

    const rot = Phaser.Math.DegToRad(90);

    const rect1 = this.add.rectangle(200, 400, 100, 10, Main.RED_COLOR);
    this.matter.add.gameObject(rect1, { isStatic: true });

    const rect2 = this.add.rectangle(150, 350, 100, 10, Main.RED_COLOR);
    const react2go = this.matter.add.gameObject(rect2, { isStatic: true });
    // @ts-ignore
    react2go.setRotation(rot);

    const rect3 = this.add.rectangle(250, 350, 100, 10, Main.RED_COLOR);
    const react3go = this.matter.add.gameObject(rect3, { isStatic: true });
    // @ts-ignore
    react3go.setRotation(rot);

    this.initHoneycombs();

    this.bees.push(new Bee(this, 400, 100));
    this.bees.push(new Bee(this, 400, 70));
    this.bees.push(new Bee(this, 380, 50));

    this.bees[0].moveTo(350, 300);
    this.bees[1].moveTo(350, 300);
    this.bees[2].moveTo(350, 300);

    this.newRightHoneycomb();
    this.time.addEvent({
      delay: 4000,
      callbackScope: this,
      callback: () => {
        this.bees[0].moveToHoneycomb(this.rightHoneycombExtremity);
        this.bees[1].moveToHoneycomb(this.leftHoneycombExtremity);
        this.bees[2].moveToHoneycomb(this.leftHoneycombExtremity);
      },
    });
  }

  private newRightHoneycomb() {
    const rightHoneycombPosition = new Phaser.Math.Vector2(
      this.rightHoneycombExtremity.x,
      this.rightHoneycombExtremity.y,
    );
    const leftHoneycombPosition = new Phaser.Math.Vector2(
      this.leftHoneycombExtremity.x,
      this.leftHoneycombExtremity.y,
    );
    const rightToLeftHoneycomb = rightHoneycombPosition.subtract(leftHoneycombPosition);
    const directionBetweenHoneycombs = rightToLeftHoneycomb.normalize();
    const xDir = directionBetweenHoneycombs.x;
    const yDir = directionBetweenHoneycombs.y;
    const stepLength = 2 * BuiltHoneycomb.MAX_RADIUS;
    const newHoneycombPosition = directionBetweenHoneycombs.add(
      new Phaser.Math.Vector2(stepLength * xDir, stepLength * yDir),
    );
    this.leftHoneycombExtremity = new BuiltHoneycomb(
      this,
      this.leftHoneycombExtremity.x + newHoneycombPosition.x,
      this.leftHoneycombExtremity.y + newHoneycombPosition.y,
    );

    const newDistance = new Phaser.Math.Vector2(
      this.leftHoneycombExtremity.x,
      this.leftHoneycombExtremity.y,
    )
      .subtract(
        new Phaser.Math.Vector2(this.rightHoneycombExtremity.x, this.rightHoneycombExtremity.y),
      )
      .length();

    if (newDistance < BuiltHoneycomb.MAX_RADIUS) {
      console.log('The hive is complete!');
      return;
    }

    this.time.addEvent({
      delay: 2000,
      callbackScope: this,
      callback: () => {
        this.newRightHoneycomb();
      },
    });
  }

  private initHoneycombs() {
    this.rightHoneycombExtremity = new InitialHoneycomb(this, 250, 300);
    this.leftHoneycombExtremity = new InitialHoneycomb(this, 150, 300);
  }
}
