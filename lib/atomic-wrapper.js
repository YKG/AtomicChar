///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atomic-wrapper-extension.d.ts" />
var AtomicWrapper;
(function (AtomicWrapper) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = "16px NanumGothicCoding, monospace";

    function wrap(line, width) {
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

    function overwrite(displayBuffer) {
        var _this = this;
        displayBuffer._nonatomic_findWrapColumn = displayBuffer.findWrapColumn;

        displayBuffer.findWrapColumn = function (line) {
            var buffer = _this;
            if (!buffer.isSoftWrapped)
                return null;

            return wrap(line, buffer.getWidth());
        };
    }
    AtomicWrapper.overwrite = overwrite;
    function revert(displayBuffer) {
        displayBuffer.findWrapColumn = displayBuffer._nonatomic_findWrapColumn;
        displayBuffer._nonatomic_findWrapColumn = null;
    }
    AtomicWrapper.revert = revert;
})(AtomicWrapper || (AtomicWrapper = {}));

exports.activate = function (state) {
    atom.workspaceView.eachEditorView(function (editorView) {
        var editor = editorView.getEditor();
        AtomicWrapper.overwrite(editor.displayBuffer);
    });
};

exports.deactivate = function () {
    atom.workspaceView.eachEditorView(function (editorView) {
        var editor = editorView.getEditor();
        AtomicWrapper.revert(editor.displayBuffer);
    });
};
