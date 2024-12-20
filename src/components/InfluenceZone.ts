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

    // Check if zoneImage is provided

    const groupElements: (fabric.Object | fabric.Textbox | fabric.Image)[] = [];
    groupElements.push(circle);
    groupElements.push(text);

    if (this.zoneImage) {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';  // Explicitly set crossOrigin
      imgElement.src = this.zoneImage;
    
      imgElement.onload = () => {
        const customImage = new fabric.Image(imgElement, {
          selectable: false,
          evented: false,
          hasControls: false,
          crossOrigin: 'anonymous'  // Also ensure crossOrigin is set on fabric.Image
        });
    
        customImage.scaleToHeight(this.zoneSize);
        customImage.scaleToWidth(this.zoneSize);
    
        customImage.set({
          top: zonePos.y - customImage.getScaledHeight() / 2,
          left: zonePos.x - customImage.getScaledWidth() / 2,
        });
    
        text.set({
          left: circle.left + circle.width / 2 - text.width / 2,
          top: circle.top + circle.height / 2 + customImage.getScaledHeight() / 2,
        });
    
        groupElements.push(customImage);
    
        const circleWithText = new fabric.Group(groupElements, {
          selectable: false,
          hasBorders: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          evented: false,
        });
    
        // Add the image to the canvas
        canvas.add(circleWithText);
        canvas.renderAll();
      };
    }

    else {
      // If no image, create the group with the circle and text only
      const circleWithText = new fabric.Group(groupElements, {
        selectable: false,
        hasBorders: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        evented: false,
      });

      // Add the group to the canvas
      canvas.add(circleWithText);
      canvas.renderAll();
    }

  }
}