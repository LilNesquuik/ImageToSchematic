# ImageToSchematic
Welcome to the README for this project, which is a basic Discord bot that allows for the conversion of PNG or JPG images into schematics made of Unity PrimitivesObject for use with the MapEditorReborn plugin in SCP: Secret Laboratory. The conversion is done by creating a grid of Unity PrimitivesObject based on each pixel in the source image. Each pixel is then mapped to a specific Unity PrimitivesObject using a pre-defined lookup table.

## Requirements
- Schematic uses [MapEditorReborn](https://github.com/Michal78900/MapEditorReborn).
- /Schematic `Px` `Url`.
- Image need to be a `.png` or `.jpg` to work.

## Config

```js
{
    "Token": "PUT_YOUR_BOT_TOKEN_HERE",
    "Output": "./Json",
}
```
