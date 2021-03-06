import { Honeycomb } from './Honeycomb';
import { Jug } from './Jug';

export class InitialHoneycomb extends Honeycomb {
  public matterGameObject: any;
  public scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, InitialHoneycomb.RADIUS, 0, 360, false, Jug.COLOR);
    this.scene = scene;

    scene.add.existing(this);

    this.matterGameObject = this.scene.matter.add.gameObject(this, {
      shape: { type: 'circle', radius: InitialHoneycomb.RADIUS },
      isStatic: true,
    });
  }
}
