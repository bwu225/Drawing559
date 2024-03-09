const canvas = new fabric.Canvas("canvas", {
  backgroundColor: "#ffffff",
});
let currentTool = "draw";
let undoStack = [];
let redoStack = [];

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const brushSizeText = document.getElementById("brushSizeText");
const drawTool = document.getElementById("drawTool");
const rectangleTool = document.getElementById("rectangleTool");
const circleTool = document.getElementById("circleTool");
const mouseTool = document.getElementById("mouseTool");
const textTool = document.getElementById("textTool");
const eraserTool = document.getElementById("eraserTool");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const clearBtn = document.getElementById("clearBtn");
const imageUpload = document.getElementById("imageUpload");
const saveBtn = document.getElementById("saveBtn");

canvas.freeDrawingBrush.color = colorPicker.value;
canvas.freeDrawingBrush.width = parseInt(brushSize.value, 10);

colorPicker.addEventListener("change", function () {
  canvas.freeDrawingBrush.color = this.value;
});

brushSize.addEventListener("input", function () {
  const size = parseInt(this.value, 10);
  canvas.freeDrawingBrush.width = size;
  brushSizeText.textContent = `${size} px`;
});

drawTool.addEventListener("click", function () {
  currentTool = "draw";
  canvas.isDrawingMode = true;
});

rectangleTool.addEventListener("click", function () {
  currentTool = "rectangle";
  canvas.isDrawingMode = false;
  canvas.selection = false;
});

circleTool.addEventListener("click", function () {
  currentTool = "circle";
  canvas.isDrawingMode = false;
  canvas.selection = false;
});

mouseTool.addEventListener("click", function () {
  currentTool = "mouse";
  canvas.isDrawingMode = false;
  canvas.selection = true;
});

textTool.addEventListener("click", function () {
  currentTool = "text";
  canvas.isDrawingMode = false;
  canvas.selection = false;
});

eraserTool.addEventListener("click", function () {
  currentTool = "eraser";
  canvas.freeDrawingBrush.color = "#ffffff";
  canvas.isDrawingMode = true;
});

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
clearBtn.addEventListener("click", clearCanvas);
imageUpload.addEventListener("click", function () {
    fileInput.click();
});
fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    uploadImage(file);
});
saveBtn.addEventListener("click", saveAsJpg);

function undo() {
  if (undoStack.length > 0) {
    const lastObj = undoStack.pop();
    canvas.remove(lastObj);
    redoStack.push(lastObj);
    canvas.renderAll();
  }
}

function redo() {
  if (redoStack.length > 0) {
    const lastObj = redoStack.pop();
    canvas.add(lastObj);
    undoStack.push(lastObj);
    canvas.renderAll();
  }
}

function clearCanvas() {
  if (confirm("Are you sure you want to clear the canvas?")) {
    canvas.clear();
    canvas.setBackgroundColor("#ffffff", canvas.renderAll.bind(canvas));
    undoStack = [];
    redoStack = [];
  }
}

function uploadImage(file) {
    const reader = new FileReader();

    // create a new image object
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const maxSize = 400;
            let width = img.width;
            let height = img.height;
            let scaleRatio = 1;
            
            // scale the image down if it's too large
            if (width > maxSize || height > maxSize) {
                scaleRatio = Math.min(maxSize / width, maxSize / height);
                width = width * scaleRatio;
                height = height * scaleRatio;
            }
            
            // create a new fabric image instance
            const imgInstance = new fabric.Image(img, {
                left: 0,
                top: 0,
                scaleX: scaleRatio,
                scaleY: scaleRatio,
                selectable: true,
            });
            canvas.add(imgInstance);
            undoStack.push(imgInstance);
            canvas.renderAll();
        };
    };
    // read the image file as a data URL
    reader.readAsDataURL(file);
}


function saveAsJpg() {
  const dataURL = canvas.toDataURL({
    format: "jpeg",
    quality: 1,
  });
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "drawing.jpg";
  link.click();
}

canvas.on("mouse:down", function (o) {
  if (currentTool === "text") {
    const pointer = canvas.getPointer(o.e);
    const text = new fabric.IText("Text", {
      left: pointer.x,
      top: pointer.y,
      fill: colorPicker.value,
      fontSize: Math.max(50, brushSize.value),
      selectable: true,
    });
    canvas.add(text);
    undoStack.push(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.hiddenTextarea.focus();
  }
});

canvas.on("mouse:down", function (o) {
  if (currentTool === "rectangle") {
    const pointer = canvas.getPointer(o.e);
    const origX = pointer.x;
    const origY = pointer.y;
    let rect = new fabric.Rect({
      left: origX,
      top: origY,
      width: 0,
      height: 0,
      stroke: colorPicker.value,
      strokeWidth: parseInt(brushSize.value, 10),
      fill: "transparent",
      selectable: false,
    });
    canvas.add(rect);
    undoStack.push(rect);

    canvas.on("mouse:move", function (o) {
      if (!rect) return;
      const pointer = canvas.getPointer(o.e);
      rect.set({
        width: Math.abs(origX - pointer.x),
        height: Math.abs(origY - pointer.y),
        left: origX < pointer.x ? origX : pointer.x,
        top: origY < pointer.y ? origY : pointer.y,
      });
      canvas.renderAll();
    });

    canvas.on("mouse:up", function () {
      canvas.off("mouse:move");
      canvas.off("mouse:up");
      rect.set({ selectable: true });
      rect = null; // reset the rectangle
    });
  } else if (currentTool === "circle") {
    const pointer = canvas.getPointer(o.e);
    const origX = pointer.x;
    const origY = pointer.y;
    const circle = new fabric.Circle({
      left: origX,
      top: origY,
      radius: 0,
      stroke: colorPicker.value,
      strokeWidth: brushSize.value,
      fill: "transparent",
      selectable: false,
      originX: "center",
      originY: "center",
    });
    canvas.add(circle);
    undoStack.push(circle);

    canvas.on("mouse:move", function (o) {
      const pointer = canvas.getPointer(o.e);
      const radius = Math.sqrt(
        Math.pow(origX - pointer.x, 2) + Math.pow(origY - pointer.y, 2)
      );
      circle.set({
        radius: radius,
      });
      canvas.renderAll();
    });

    canvas.on("mouse:up", function () {
      canvas.off("mouse:move");
      circle.selectable = true;
    });
  } else if (currentTool === "mouse") {
    const pointer = canvas.getPointer(o.e);
    const origX = pointer.x;
    const origY = pointer.y;
    const mouse = new fabric.Path(`M ${origX} ${origY} L ${origX} ${origY}`, {
      stroke: colorPicker.value,
      strokeWidth: brushSize.value,
      fill: false,
      selectable: false,
    });
    canvas.add(mouse);
    undoStack.push(mouse);

    canvas.on("mouse:move", function (o) {
      const pointer = canvas.getPointer(o.e);
      mouse.set({
        path: `M ${origX} ${origY} L ${pointer.x} ${pointer.y}`,
      });
      canvas.renderAll();
    });

    canvas.on("mouse:up", function () {
      canvas.off("mouse:move");
      mouse.selectable = true;
    });
  }
});

canvas.on("path:created", function (e) {
  undoStack.push(e.path);
});
