///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atomic-wrapper-extension.d.ts" />

module AtomicWrapper {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  context.font = "16px NanumGothicCoding, monospace";

  function wrap(line: string, width: number): number {
    if (context.measureText(line).width <= width)
      return null;

    // Break the text to get proper width, by binary search algorithm.
    var left = 0;
    var right = line.length;
    while (left < right) {
      var middle = (left + right) / 2;
      var slice = line.slice(0, middle);
      var measure = context.measureText(slice);
      if (measure.width === width)
        return slice.length;
      else if (measure.width < width)
        left = Math.ceil(middle);
      else
        right = Math.floor(middle);
    }

    // Last condition
    if (context.measureText(line.slice(0, left)).width < width)
      return left;
    else
      return left - 1;
  }

  export function overwrite(displayBuffer: AtomCore.IDisplayBuffer) {
    displayBuffer._nonatomic_findWrapColumn = displayBuffer.findWrapColumn;

    displayBuffer.findWrapColumn = (line: string) => {
      var buffer: AtomCore.IDisplayBuffer = this;
      if (!buffer.isSoftWrapped)
        return null;

      return wrap(line, buffer.getWidth());
    }
  }
  export function revert(displayBuffer: AtomCore.IDisplayBuffer) {
    displayBuffer.findWrapColumn = displayBuffer._nonatomic_findWrapColumn;
    displayBuffer._nonatomic_findWrapColumn = null;
  }
}

export var activate = (state: AtomCore.IAtomState) => {
  atom.workspaceView.eachEditorView(
    (editorView) => {
      var editor = editorView.getEditor();
      AtomicWrapper.overwrite(editor.displayBuffer);
    });
}

export var deactivate = () => {
  atom.workspaceView.eachEditorView(
    (editorView) => {
      var editor = editorView.getEditor();
      AtomicWrapper.revert(editor.displayBuffer);
    });
}
