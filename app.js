// Description: This file contains the JavaScript code for the drawing app.
// Author: Brian Wu 2024

const canvas = new fabric.Canvas("canvas", { backgroundColor: "#ffffff" });
const colorPicker = document.getElementById("colorPicker");
const colorPickerStyle = document.getElementById("colorPickerStyle");
const defaultColor = colorPicker.value;
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
const clearModal = document.getElementById("clearModal");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const imageUpload = document.getElementById("imageUpload");
const saveBtn = document.getElementById("saveBtn");

// Set the initial tool and stacks
let currentTool = "draw";
let undoStack = [];
let redoStack = [];

// Set the initial brush size and color
canvas.freeDrawingBrush.color = colorPicker.value;
canvas.freeDrawingBrush.width = parseInt(brushSize.value, 10);
colorPickerStyle.style.backgroundColor = defaultColor;
canvas.freeDrawingBrush.color = defaultColor;

// Event listeners for the color picker and brush size input
colorPicker.addEventListener("input", function () {
  colorPickerStyle.style.backgroundColor = this.value;
  canvas.freeDrawingBrush.color = this.value;
});

// Prevent the color picker from closing when clicking on it
colorPicker.addEventListener("click", function (event) {
  event.stopPropagation();
});

// Close the color picker when clicking outside of it
document.addEventListener("click", function () {
  colorPicker.blur();
});

// Update the brush size when the input changes
brushSize.addEventListener("input", function () {
  const size = parseInt(this.value, 10);
  canvas.freeDrawingBrush.width = size;
  brushSizeText.textContent = `${size} px`;
});

// Prevent the brush size input from closing when clicking on it
drawTool.addEventListener("click", function () {
  currentTool = "draw";
  canvas.freeDrawingBrush.color = colorPicker.value;
  canvas.isDrawingMode = true;
  hideEraserAlert();
});

// Event listeners for rectangle tools
rectangleTool.addEventListener("click", function () {
  currentTool = "rectangle";
  canvas.freeDrawingBrush.color = colorPicker.value;
  canvas.isDrawingMode = false;
  canvas.selection = false;
  hideEraserAlert();
});

// Event listeners for circle tools
circleTool.addEventListener("click", function () {
  currentTool = "circle";
  canvas.freeDrawingBrush.color = colorPicker.value;
  canvas.isDrawingMode = false;
  canvas.selection = false;
  hideEraserAlert();
});

// Event listeners for the mouse tool
mouseTool.addEventListener("click", function () {
  currentTool = "mouse";
  canvas.freeDrawingBrush.color = colorPicker.value;
  canvas.isDrawingMode = false;
  canvas.selection = true;
  hideEraserAlert();
});

// Event listeners for the text tool
textTool.addEventListener("click", function () {
  currentTool = "text";
  canvas.freeDrawingBrush.color = colorPicker.value;
  canvas.isDrawingMode = false;
  canvas.selection = false;
  hideEraserAlert();
});

// Event listeners for the eraser tool
eraserTool.addEventListener("click", function () {
  currentTool = "eraser";
  canvas.freeDrawingBrush.color = "#ffffff";
  canvas.isDrawingMode = true;
  showEraserAlert();
});

// Show the eraser alert
function showEraserAlert() {
  const eraserAlert = document.getElementById("eraserAlert");
  eraserAlert.classList.remove("hidden");
}

// Hide the eraser alert
function hideEraserAlert() {
  const eraserAlert = document.getElementById("eraserAlert");
  eraserAlert.classList.add("hidden");
}

// Event listeners for the clear button
clearBtn.addEventListener("click", function () {
  clearModal.classList.remove("hidden");
});

// Event listeners for the confirm and cancel clear buttons
confirmClearBtn.addEventListener("click", function () {
  canvas.clear();
  canvas.setBackgroundColor("#ffffff", canvas.renderAll.bind(canvas));
  canvas.freeDrawingBrush.color = colorPicker.value;
  undoStack = [];
  redoStack = [];
  clearModal.classList.add("hidden");
  hideEraserAlert();
});

// Event listeners after clicking the cancel button
cancelClearBtn.addEventListener("click", function () {
  clearModal.classList.add("hidden");
});

// Function to clear the canvas
function clearCanvas() {
  if (confirm("Are you sure you want to clear the canvas?")) {
    canvas.clear(); // clear the canvas
    canvas.setBackgroundColor("#ffffff", canvas.renderAll.bind(canvas)); // set the background color to white
    // clear the undo and redo stacks
    undoStack = [];
    redoStack = [];
  }
}

// Event listeners for the image upload button and file input
imageUpload.addEventListener("click", function () {
  fileInput.click();
});
fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  uploadImage(file);
});
saveBtn.addEventListener("click", saveAsJpg);

// Event listeners for the undo and redo buttons
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// Function to undo the last action
function undo() {
  if (undoStack.length > 0) {
    const lastObj = undoStack.pop();
    canvas.remove(lastObj);
    redoStack.push(lastObj);
    canvas.renderAll();
  }
}

// Function to redo the last action
function redo() {
  if (redoStack.length > 0) {
    const lastObj = redoStack.pop();
    canvas.add(lastObj);
    undoStack.push(lastObj);
    canvas.renderAll();
  }
}

/**
 * Uploads an image file and adds it to the canvas.
 *
 * @param {File} file - The image file to upload.
 */
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

// Save the canvas as a JPEG image file.
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

// Create an object to store the drawing tool handlers
const toolHandlers = {
  text: handleTextTool,
  rectangle: handleRectangleTool,
  circle: handleCircleTool,
  mouse: handleMouseTool,
};

// Add event handler for the mouse down event
canvas.on("mouse:down", function (o) {
  const handler = toolHandlers[currentTool];
  if (handler) {
    handler(o);
  }
});

// Add path to undo stack
canvas.on("path:created", function (e) {
  undoStack.push(e.path);
});

// Get the pointer position
function getPointer(event) {
  return canvas.getPointer(event.e);
}

// Add function to add an object to the canvas and undo stack
function addObjectToCanvas(obj) {
  canvas.add(obj);
  undoStack.push(obj);
}

// Add function to handle the text tool
function handleTextTool(event) {
  const pointer = getPointer(event);
  const text = new fabric.IText("Text", {
    left: pointer.x,
    top: pointer.y,
    fill: colorPicker.value,
    fontSize: Math.max(50, brushSize.value),
    selectable: true,
  });
  addObjectToCanvas(text);
  canvas.setActiveObject(text);
  text.enterEditing();
  text.hiddenTextarea.focus();
}

// Add function to handle the rectangle tool
function handleRectangleTool(event) {
  const pointer = getPointer(event);
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
  addObjectToCanvas(rect);

  canvas.on("mouse:move", function (o) {
    if (!rect) return;
    const pointer = getPointer(o);
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
    rect = null;
  });
}

// Add function to handle the circle tool
function handleCircleTool(event) {
  const pointer = getPointer(event);
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
  addObjectToCanvas(circle);

  // Add event listeners for the mouse move events
  canvas.on("mouse:move", function (o) {
    const pointer = getPointer(o);
    const radius = Math.sqrt(
      Math.pow(origX - pointer.x, 2) + Math.pow(origY - pointer.y, 2)
    );
    circle.set({ radius: radius });
    canvas.renderAll();
  });

  // Add event listener for the mouse up event
  canvas.on("mouse:up", function () {
    canvas.off("mouse:move");
    circle.selectable = true;
  });
}

// Add function to handle the mouse tool
function handleMouseTool(event) {
  const pointer = getPointer(event);
  const origX = pointer.x;
  const origY = pointer.y;
  const mouse = new fabric.Path(`M ${origX} ${origY} L ${origX} ${origY}`, {
    stroke: colorPicker.value,
    strokeWidth: brushSize.value,
    fill: false,
    selectable: false,
  });
  addObjectToCanvas(mouse);

  // Add event listeners for the mouse move events
  canvas.on("mouse:move", function (o) {
    const pointer = getPointer(o);
    mouse.set({ path: `M ${origX} ${origY} L ${pointer.x} ${pointer.y}` });
    canvas.renderAll();
  });

  // Add event listener for the mouse up event
  canvas.on("mouse:up", function () {
    canvas.off("mouse:move");
    mouse.selectable = true;
  });
}
