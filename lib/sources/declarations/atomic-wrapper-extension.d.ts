///<reference﻿ path="../DefinitelyTyped/atom/atom.d.ts" />

declare module eventKit {
  class Disposable {
    disposed: boolean;

    constructor(disposalAction: any);
    dispose(): void;
  }
}

declare module AtomCore {
  interface IDisplayBuffer {
    _nonatomic_findWrapColumn: (line: string, softWrapColumn: number) => number;
    isSoftWrapped(): boolean;
    getClientWidth(): number;
  }
  interface IConfig {
    onDidChange(callback: any): eventKit.Disposable;
    onDidChange(keyPath: string, callback: (ev: ICallbackEvent) => any): eventKit.Disposable;
    onDidChange(scopeDescriptor: string[], keyPath: string, callback: (ev: ICallbackEvent) => any): eventKit.Disposable;
  }
  interface ICallbackEvent {
    newValue: any;
    oldValue: any;
    keyPath: string;
  }
}
