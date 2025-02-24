export class SoundFader {
  private scene: Phaser.Scene;
  private key: string;
  private volume: number;
  private loop: boolean;
  private playing: Phaser.Sound.BaseSound | null;

  constructor(scene: Phaser.Scene, key: string, volume: number) {
    this.scene = scene;
    this.key = key;
    this.volume = volume;
    this.loop = true; // TODO: Make dynamic
  }

  fadeInIfNotPlaying(duration: number) {
    if (this.playing) return;
    this.playing = this.scene.sound.add(this.key, { loop: this.loop });
    this.playing.play();
    this.scene.tweens.add({
      targets: this.playing,
      volume: { from: 0, to: this.volume },
      duration: duration
    });
  }

  fadeOut(duration: number) {
    if (!this.playing) return;
    const fadingOut = this.playing;
    this.playing = null;
    const fadeOut = this.scene.tweens.add({
      targets: fadingOut,
      volume: 0,
      duration: duration
    });
    fadeOut.on('complete', () => {
      fadingOut.stop();
    });
  }
}
