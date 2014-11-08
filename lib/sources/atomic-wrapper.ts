///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atomic-wrapper-extension.d.ts" />

module AtomicWrapper {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var font: { fontFamily: string; fontSize: number } = <any>{};
  var subscriptions: { [key: string]: eventKit.Disposable } = {};
  //context.font = "16px NanumGothicCoding";

  /*space, CJK 4e00-, kana 3041-, hangul 1100-*/
  var breakable = /[\s\u4e00-\u9fff\u3400-\u4dbf\u3041-\u309f\u30a1-\u30ff\u31f0-\u31ff\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/;

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

  function spaceCutter(line: string, softWrapColumn: number) {
    if (breakable.test(line[softWrapColumn])) {
      var firstNonspace = line.slice(softWrapColumn).search(/\S/)
      if (firstNonspace != -1)
        return firstNonspace + softWrapColumn;
      else
        return line.length;
    }
    else {
      for (var column = softWrapColumn; column >= 0; column--)
        if (breakable.test(line[column]))
          return column + 1;
      return softWrapColumn;
    }
  }

  export function overwrite(displayBuffer: AtomCore.IDisplayBuffer) {
    displayBuffer._nonatomic_findWrapColumn = displayBuffer.findWrapColumn;

    displayBuffer.findWrapColumn = (line: string) => {
      if (!displayBuffer.isSoftWrapped)
        return null;

      return wrap(line, displayBuffer.getWidth());
    }
  }
  export function revert(displayBuffer: AtomCore.IDisplayBuffer) {
    displayBuffer.findWrapColumn = displayBuffer._nonatomic_findWrapColumn;
    displayBuffer._nonatomic_findWrapColumn = null;
  }

  function setFont(fontSize: number, fontFamily: string) {
    font.fontSize = fontSize || 16;
    font.fontFamily = fontFamily.trim() || "Inconsolata, Monaco, Consolas, 'Courier New', Courier";
    return font.fontSize + "px " + font.fontFamily;
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
