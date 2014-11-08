///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atomic-wrapper-extension.d.ts" />

module AtomicWrapper {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var font: { fontFamily: string; fontSize: number } = <any>{};
  var subscriptions: { [key: string]: eventKit.Disposable } = {};
  //context.font = "16px NanumGothicCoding";

  function wrap(line: string, width: number, spaceCutter: (line: string, softWrapColumn: number) => number): number {
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
        return spaceCutter(line, slice.length);
      else if (measure.width < width)
        left = Math.ceil(middle);
      else
        right = Math.floor(middle);
    }

    // Last condition
    if (context.measureText(line.slice(0, left)).width > width)
      left--;

    // Current Atom wrapper algorithm
    return spaceCutter(line, left);
  }

  export function overwrite(displayBuffer: AtomCore.IDisplayBuffer) {
    displayBuffer._nonatomic_findWrapColumn = displayBuffer.findWrapColumn;

    displayBuffer.findWrapColumn = (line: string) => {
      if (!displayBuffer.isSoftWrapped)
        return null;

      return wrap(line, displayBuffer.getWidth(), displayBuffer._nonatomic_findWrapColumn.bind(displayBuffer));
    }
  }
  export function revert(displayBuffer: AtomCore.IDisplayBuffer) {
    displayBuffer.findWrapColumn = displayBuffer._nonatomic_findWrapColumn;
    displayBuffer._nonatomic_findWrapColumn = null;
  }

  function setFont(fontSize: number, fontFamily: string) {
    font.fontSize = fontSize || 16;
    font.fontFamily = fontFamily || "Consolas";
    return fontSize + "px " + fontFamily;
  }

  export function subscribeFontEvent() {
    context.font = setFont(atom.config.get("editor.fontSize"), atom.config.get("editor.fontFamily"));
    console.log(context.font);
    subscriptions["fontFamily"]
    = atom.config.onDidChange("editor.fontFamily", (change) => context.font = setFont(font.fontSize, change.newValue));
    subscriptions["fontSize"]
    = atom.config.onDidChange("editor.fontSize", (change) => context.font = setFont(change.newValue, font.fontFamily));
  }

  export function unsubscribeFontEvent() {
    for (var subscription in subscriptions)
      (<eventKit.Disposable>subscription).dispose();
  }
}

export var activate = (state: AtomCore.IAtomState) => {
  AtomicWrapper.subscribeFontEvent();
  atom.workspaceView.eachEditorView(
    (editorView) => {
      var editor = editorView.getEditor();
      AtomicWrapper.overwrite(editor.displayBuffer);
    });
}

export var deactivate = () => {
  AtomicWrapper.unsubscribeFontEvent();
  atom.workspaceView.eachEditorView(
    (editorView) => {
      var editor = editorView.getEditor();
      AtomicWrapper.revert(editor.displayBuffer);
    });
}
