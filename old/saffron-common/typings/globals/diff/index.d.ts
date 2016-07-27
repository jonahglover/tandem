// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/3bf834b6e8808d2faddba9a5a6305937b7ae5bb3/diff/diff.d.ts
declare namespace JsDiff {
    interface IDiffResult {
        value: string;
        count?: number;
        added?: boolean;
        removed?: boolean;
    }

    interface IBestPath {
        newPos: number;
        componenets: IDiffResult[];
    }

    class Diff {
        ignoreWhitespace:boolean;

        constructor(ignoreWhitespace?:boolean);

        diff(oldString:string, newString:string):IDiffResult[];

        pushComponent(components:IDiffResult[], value:string, added:boolean, removed:boolean):void;

        extractCommon(basePath:IBestPath, newString:string, oldString:string, diagonalPath:number):number;

        equals(left:string, right:string):boolean;

        join(left:string, right:string):string;

        tokenize(value:string):any; // return types are string or string[]
    }

    function diffChars(oldStr:string, newStr:string):IDiffResult[];

    function diffWords(oldStr:string, newStr:string):IDiffResult[];

    function diffWordsWithSpace(oldStr:string, newStr:string):IDiffResult[];

    function diffJson(oldObj: Object, newObj: Object): IDiffResult[];

    function diffLines(oldStr:string, newStr:string):IDiffResult[];

    function diffCss(oldStr:string, newStr:string):IDiffResult[];

    function createPatch(fileName:string, oldStr:string, newStr:string, oldHeader:string, newHeader:string):string;

    function applyPatch(oldStr:string, uniDiff:string):string;

    function convertChangesToXML(changes:IDiffResult[]):string;

    function convertChangesToDMP(changes:IDiffResult[]):{0: number; 1:string;}[];
}

declare module "diff" {
    export = JsDiff;
}