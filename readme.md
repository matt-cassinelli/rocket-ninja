## Rocket Ninja

A 2D platformer with a focus on enjoyable movement.

Dodge rockets and reach the door before your time runs out!

## To play:

(website coming soon)


## To build:

1. `npm install`
2. `npm run start`


## Design notes

An OOP style has been used, although some of Phaser 3's methods are not the cleanest to work with.

To wrap your head around Phaser-specific things such as 'Scenes' I would recommend reading their documentation.

Where possible, complex code has been seperated into its own classes/files/methods in order to improve readability.

When the code is built, the "parcel-plugin-static-files-copy" script copies files from `./static` into `./dist`