///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />

declare module AtomCore {
  interface IDisplayBuffer {
    _nonatomic_findWrapColumn: (line: string, softWrapColumn: number) => number;
    isSoftWrapped: boolean;
  }
}