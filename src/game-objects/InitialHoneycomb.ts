import { Main } from '../scenes/Main';
import { Honeycomb } from './Honeycomb';

export class InitialHoneycomb extends Honeycomb {
  public matterGameObject: any;
  public scene: Phaser.Scene;

  static RADIUS = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, InitialHoneycomb.RADIUS, 0, 360, false, Main.RED_COLOR);
    this.scene = scene;

    scene.add.existing(this);

    this.matterGameObject = this.scene.matter.add.gameObject(this, {
      shape: { type: 'circle', radius: InitialHoneycomb.RADIUS },
      isStatic: true,
    });
  }
}