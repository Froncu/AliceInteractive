import * as fabric from 'fabric';

export class InfluenceZone {
  zoneSize: number;
  zoneName: string;
  zoneColor: string;
  borderColor: string;
  borderSize: number;
  fontSize: number;
  textColor: string;
  zoneImage: string;

  constructor(
    zoneSize: number,
    zoneName = "",
    zoneColor = 'white',
    borderColor = 'white',
    borderSize = 1,
    fontSize = 16,
    textColor = 'black',
    zoneImage = ''
  ) {
    this.zoneSize = zoneSize;
    this.zoneName = zoneName;
    this.zoneColor = zoneColor;
    this.borderColor = borderColor;
    this.borderSize = borderSize;
    this.fontSize = fontSize;
    this.textColor = textColor;
    this.zoneImage = zoneImage;
  }

  placeOnCanvas(canvas: fabric.Canvas, zonePos: { x: number; y: number }) {
    const radius = this.zoneSize;
    const circle = new fabric.Circle({
      radius: radius,
      fill: this.zoneColor,
      left: zonePos.x - radius,
      top: zonePos.y - radius,
      stroke: this.borderColor,
      strokeWidth: this.borderSize,
      selectable: false,
    });

    const text = new fabric.Textbox(this.zoneName, {
      fontSize: this.fontSize,
      fill: this.textColor,
      width: this.zoneSize,
      textAlign: 'center',
      fontFamily: 'century gothic',
      selectable: false,
    });

    text.set({
      left: circle.left + circle.width / 2 - text.width / 2,
      top: circle.top + circle.height / 2 - text.height / 2,
    });

    const circleWithText = new fabric.Group([circle, text], {
      selectable: false,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      evented: false,
    });

    // Check if zoneImage is provided

    if (this.zoneImage) {
      const imgElement = new Image();
      imgElement.src = this.zoneImage;

      imgElement.onload = () => {
        const customImage = new fabric.FabricImage(imgElement, {
          selectable: false,
          evented: false,
          hasControls: false,
        });

        customImage.scaleToHeight(this.zoneSize);
        customImage.scaleToWidth(this.zoneSize);

        customImage.set({
          top: zonePos.y - customImage.getScaledHeight()/2,
          left: zonePos.x - customImage.getScaledWidth()/2,
        });

        text.set({
          left: circle.left + circle.width / 2 - text.width / 2,
          top: circle.top + circle.height / 2 + customImage.getScaledHeight()/2,
        });

        // Add the image to the canvas
        canvas.add(customImage);
        canvas.renderAll();
      };
    }

    // Add the influence zone with text to the canvas
    canvas.add(circleWithText);
    canvas.renderAll();
  }
}