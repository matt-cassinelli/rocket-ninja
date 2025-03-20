export {};

declare global {
  interface Array<T> {
    pushUnique(item: T): void;
  }
  namespace Phaser.Animations {
    interface AnimationManager {
      createUnique(config: Phaser.Types.Animations.Animation)
        : Phaser.Animations.Animation | false;
    }
  }
}

Array.prototype.pushUnique = function(item): void {
  if (this.indexOf(item) == -1) {
    this.push(item);
  }
};

Phaser.Animations.AnimationManager.prototype.createUnique =
  function(config: Phaser.Types.Animations.Animation) {
    if (this.exists(config.key)) return false;
    return this.create(config);
  };
