(*
  Helper functions for drawing on SVG canvas: mainly used by the draw block.
*)

module DrawHelpers
(*open Browser.Types
open Fable.Core.JsInterop
open Fable.React
open Fable.React.Props*)
open CommonTypes


//-------------------------------------------------------------------------//
//------------------------------Types--------------------------------------//
//-------------------------------------------------------------------------//




type PortLocation = {
    X: float
    Y: float
    R: float
}

type MouseOp = 
    /// button up
    | Up
    /// button down
    | Down
    /// Move with button up
    | Move 
    /// Move with button Down
    | Drag

type MouseT = {
    /// DrawBlock coords (scaled from screen pixels by 1/zoom)
    Pos: XYPos
    /// movement in screen pixel coords
    ScreenMovement: XYPos
    /// position on screen in screen pixel coords
    ScreenPage: XYPos
    ShiftKeyDown: bool
    Op: MouseOp}

/// Record to help draw SVG circles
type Circle = {
    ///  Radius of the circle
    R: float  
    /// color of outline: default => black color
    Stroke: string
    /// width of outline: default => thin
    StrokeWidth: string
    /// Fill: 0.0 => transparent, 1.0 => opaque
    FillOpacity: float // transparent fill
    /// color of fill: default => black color
    Fill: string
}

/// Record tonhelp draw SVG lines
type Line = {
    /// color of outline: default => black color
    Stroke: string
    /// width of outline: default => thin
    StrokeWidth: string
    /// what type of line: default => solid
    StrokeDashArray: string
}


/// Record to help create SVG paths (for wire segment jumps ONLY)
type Path = {
    Stroke: string
    StrokeWidth: string
    StrokeDashArray: string
    StrokeLinecap: string
    Fill: string
}

/// Record to help create SVG polygons
type Polygon = {
    Stroke: string
    StrokeWidth: string
    FillOpacity: float
    Fill: string
}

/// Record to help create SVG text
type Text = {
    /// start/end/middle: horizontal algnment vs (X,Y)
    TextAnchor: string
    FontSize: string
    FontWeight: string
    FontFamily: string
    Fill: string
    (*
    UserSelect: UserSelectOptions
    *)
    /// auto/middle/hanging: vertical alignment vs (X,Y)
    DominantBaseline: string
}

(*
let testCanvas = Browser.Dom.document.createElement("canvas") :?> HTMLCanvasElement
let canvasWidthContext = testCanvas.getContext_2d()
*)

/// To get this to work, note the fonts in the playground.fs test which work well.
/// Add fonts there to test if you like.
let getTextWidthInPixels (font:Text) (txt:string) =
   1.0

/// Default line, change this one to create new lines
let defaultLine = {
    Stroke = "Black"
    StrokeWidth = "1px"
    StrokeDashArray = "None"
}

/// Default path, change this one to create new paths
let defaultPath = {
    Stroke = "Black"
    StrokeWidth = "1px"
    StrokeDashArray = "None"
    StrokeLinecap = "butt"
    Fill = "transparent"
}

/// Default polygon, change this one to create new polygons
let defaultPolygon = {
    Stroke = "Black"
    StrokeWidth = "1px"
    FillOpacity = 1.0
    Fill = "None"
}

/// Default circle, change this one to create new circles
let defaultCircle = {
    R = 5.0
    Stroke = "Black"
    StrokeWidth = "1px"
    FillOpacity = 1.0
    Fill = "None"
}

/// Default text, change this to create new text types
let defaultText = {
    TextAnchor = "middle"
    FontSize = "10px"
    FontFamily = "verdana"
    FontWeight = "normal"
    Fill = "black"
    (*
    UserSelect = UserSelectOptions.None
    *)
    DominantBaseline = "hanging"
}

/// Port circle, used by both Sheet and Symbol to create ports
let portCircle = { defaultCircle with R = 5.0; Stroke = "Black"; StrokeWidth = "1.0px"; Fill = "Grey"}
let portCircleTarget= { defaultCircle with R = 8.0; Stroke = "DodgerBlue"; StrokeWidth = "2.0px"; Fill = "None"}

/// HLP23 AUTHOR: BRYAN TAN
/// Custom component corner circle
let cornerCircle = { defaultCircle with R = 5.0; Stroke = "Black"; StrokeWidth = "1.0px"; Fill = "Red"}


//--------------------------------------------------------------------------//
//-----------------------------Helpers--------------------------------------//
//--------------------------------------------------------------------------//



/// return a v4 (random) universally unique identifier (UUID)
/// works under .NET and FABLE
#if FABLE_COMPILER
let uuid():string = import "v4" "uuid"
#else
let uuid():string = System.Guid.NewGuid.ToString()
#endif

// ----------------------------- SVG Helpers ----------------------------- //

/// Makes a line ReactElement, wildcard inputs as position can be a number or a string 
(*let makeLine (x1: 'a) (y1: 'b) (x2: 'c) (y2: 'd) (lineParameters: Line) =
    line [
            X1 x1
            Y1 y1
            X2 x2
            Y2 y2
            SVGAttr.Stroke lineParameters.Stroke
            SVGAttr.StrokeWidth lineParameters.StrokeWidth
            SVGAttr.StrokeDasharray lineParameters.StrokeDashArray
    ] []*)


/// Makes path attributes for a horizontal upwards-pointing arc radius r
let makeArcAttr r =
    $"a %.2f{r} %.2f{r} 0 0 0 %.3f{2.0*r} 0"

/// Makes a partial arc radius d, heights h1,h2 at ends, distance d1,d2 to centre from ends horizontally
let makePartArcAttr r h1 d1 h2 d2 =
    let rot = -(180.0 / System.Math.PI) * System.Math.Asin (max -0.99999 (min 0.99999 ((h1-h2)/(d1+d2))))
    let flag = if d1 > 0.0 then 1 else 0
    $"a %.2f{r} %.2f{r} %.2f{rot} 0 {flag} %.3f{d1+d2} %.3f{h1-h2}"

/// makes a line segment offset dx,dy
let makeLineAttr dx dy =
    $"l %.3f{dx} %.3f{dy}"

//Makes a bezier curve that can now be combined with other curves (for use in makeanypath)
//HLP23: Author Ismagilov
let makePathAttr (startingControlPoint: XYPos) (endingControlPoint: XYPos) (endingPoint: XYPos) =
    let x2, y2 = endingPoint.X, endingPoint.Y
    let dx1, dy1, dx2, dy2 = startingControlPoint.X, startingControlPoint.Y, endingControlPoint.X, endingControlPoint.Y
    let dAttrribute = sprintf "C %f %f, %f %f, %f %f" dx1 dy1 dx2 dy2 x2 y2
    dAttrribute

/// deliver string suitable for HTML color from a HighlightColor type value
let getColorString (col: CommonTypes.HighLightColor) =
    (sprintf "%A" col).ToLower()



//--------------------------------Constants----------------------------------//


/// Calculates if two bounding boxes intersect by comparing corner coordinates of each box
let boxesIntersect (box1: BoundingBox) (box2: BoundingBox) =
    // Requires min and max since H & W can be negative, i.e. we don't know which corner is which automatically
    // Boxes intersect if there is overlap in both x and y coordinates 
    min box1.TopLeft.X (box1.TopLeft.X + box1.W) < max box2.TopLeft.X (box2.TopLeft.X + box2.W)
    && min box2.TopLeft.X (box2.TopLeft.X + box2.W) < max box1.TopLeft.X (box1.TopLeft.X + box1.W)
    && min box1.TopLeft.Y (box1.TopLeft.Y + box1.H) < max box2.TopLeft.Y (box2.TopLeft.Y + box2.H)
    && min box2.TopLeft.Y (box2.TopLeft.Y + box2.H) < max box1.TopLeft.Y (box1.TopLeft.Y + box1.H)



    

