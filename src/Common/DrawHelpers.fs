(*
  Helper functions for drawing on SVG canvas: mainly used by the draw block.
*)

module DrawHelpers

open Elmish
open Avalonia
open Avalonia.Controls
open Avalonia.Controls.Shapes
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.FuncUI.Types
open System
open System.Globalization

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
    //  UserSelect: UserSelectOptions
    /// auto/middle/hanging: vertical alignment vs (X,Y)
    DominantBaseline: string
}

(*let testCanvas = Browser.Dom.document.createElement("canvas") :?> HTMLCanvasElement
let canvasWidthContext = testCanvas.getContext_2d()

/// To get this to work, note the fonts in the playground.fs test which work well.
/// Add fonts there to test if you like.
let getTextWidthInPixels (font:Text) (txt:string) =
   let askedFont = String.concat " " [font.FontWeight; font.FontSize;  font.FontFamily]; // e.g. "16px bold sans-serif";
   canvasWidthContext.font <- askedFont
   //printf "Measururing '%s' -> '%s' with txt '%s' - fontSize=%s, sizeInpx = %.2f" askedFont canvasWidthContext.font txt font.FontSize sizeInPx
   let textMetrics = canvasWidthContext.measureText(txt)
   let ms = textMetrics.width 
   ms*)
let getTextWidthInPixels (font:Text) (txt:string) =
    2.0

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
    // UserSelect = UserSelectOptions.None
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

let convertToPointArray (pointsStr: string) : Point[] =
    let splitPoints = pointsStr.Split(' ')
    let rec parsePoints acc i =
        if i >= splitPoints.Length then acc
        else
            let splitPoint = splitPoints.[i].Split(',')
            if splitPoint.Length = 2 then
                try
                    let x = System.Double.Parse(splitPoint.[0].Trim())
                    let y = System.Double.Parse(splitPoint.[1].Trim())
                    parsePoints (Point(x,y):: acc) (i + 1)
                with
                | :? System.FormatException ->
                    // printfn "Skipping invalid point: %s" splitPoints.[i]
                    parsePoints acc (i + 1)  // Skip this point and continue with the next
            else
                // printfn "Skipping malformed point: %s" splitPoints.[i]
                parsePoints acc (i + 1)  // Skip this point and continue with the next
    
    parsePoints [] 0 |> List.toArray |> Array.rev

// ----------------------------- SVG Helpers ----------------------------- //

/// Makes a line Element, wildcard inputs as position can be a number or a string 
let makeLine (x1: float) (y1: float) (x2: float) (y2: float) (lineParameters: Line) =
    Line.create [
        Line.startPoint (Point(float x1, float y1))
        Line.endPoint (Point(float x2, float y2))
        Line.stroke lineParameters.Stroke
        Line.strokeThickness (float lineParameters.StrokeWidth)
        // Line.strokeDashArray lineParameters.StrokeDashArray
    ] :> IView


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


let makePathFromAttr (attr:string) (pathParameters: Path) =
    printfn $"{attr}"
    Path.create [
        Path.data attr
        Path.fill (SolidColorBrush(Color.FromArgb(255uy, 255uy, 235uy, 47uy), 1.0))
        Path.strokeThickness (float pathParameters.StrokeWidth)
            (*D attr
            SVGAttr.Stroke pathParameters.Stroke
            SVGAttr.StrokeWidth pathParameters.StrokeWidth
            SVGAttr.StrokeDasharray pathParameters.StrokeDashArray
            SVGAttr.StrokeLinecap pathParameters.StrokeLinecap
            SVGAttr.Fill pathParameters.Fill*)
    ] :> IView

/// Makes a path ReactElement, points are to be given as an XYPos record element.
/// Please note that this function is designed to create ONLY "Move to - Bézier Curve"
///paths (this is what the "M" and "C" attributes stand for) and NOT a generalized SVG path element.
let makeAnyPath (startingPoint: XYPos) (pathAttr:string) (pathParameters: Path) =
    let x1, y1 = startingPoint.X, startingPoint.Y
    let dAttr = sprintf "M %f %f %s" x1 y1 pathAttr
    makePathFromAttr dAttr pathParameters

/// Makes a path ReactElement, points are to be given as an XYPos record element.
/// Please note that this function is designed to create ONLY "Move to - Bézier Curve"
///paths (this is what the "M" and "C" attributes stand for) and NOT a generalized SVG path element.
let makePath (startingPoint: XYPos) (startingControlPoint: XYPos) (endingControlPoint: XYPos) (endingPoint: XYPos) (pathParameters: Path) =
    let x1, y1, x2, y2 = startingPoint.X, startingPoint.Y, endingPoint.X, endingPoint.Y
    let dx1, dy1, dx2, dy2 = startingControlPoint.X, startingControlPoint.Y, endingControlPoint.X, endingControlPoint.Y
    let dAttrribute = sprintf "M %f %f C %f %f, %f %f, %f %f" x1 y1 dx1 dy1 dx2 dy2 x2 y2
    Path.create [
        Path.data dAttrribute
        ] :> IView
    (*path [
            D dAttrribute
            SVGAttr.Stroke pathParameters.Stroke
            SVGAttr.StrokeWidth pathParameters.StrokeWidth
            SVGAttr.StrokeDasharray pathParameters.StrokeDashArray
            SVGAttr.StrokeLinecap pathParameters.StrokeLinecap
            SVGAttr.Fill pathParameters.Fill
    ] []*)
    
/// Makes a polygon ReactElement, points are to be given as a correctly formatted SVGAttr.Points string 
let makePolygon (points: string) (polygonParameters: Polygon) =
    Polygon.create [
        Polygon.points (convertToPointArray points)
        Polygon.stroke (SolidColorBrush(Color.FromArgb(255uy, 0uy, 0uy, 0uy)))
        Polygon.strokeThickness 2.0
        Polygon.fill (SolidColorBrush(Color.FromArgb(255uy, 255uy, 235uy, 47uy), polygonParameters.FillOpacity))
        (*
        Component.onPointerPressed (fun args -> dispatch (OnPress polygonParameter.Id))
    *)
    ] :> IView
    

/// Makes a circle ReactElement
let makeCircle (centreX: float) (centreY: float) (circleParameters: Circle) =
    printfn $"{circleParameters}"
    Ellipse.create
      [
        Ellipse.width (circleParameters.R*2.0)
        Ellipse.height (circleParameters.R*2.0)
        (*Cx centreX
        Cy centreY
        R circleParameters.R
        SVGAttr.Fill circleParameters.Fill
        SVGAttr.FillOpacity circleParameters.FillOpacity
        SVGAttr.Stroke circleParameters.Stroke
        SVGAttr.StrokeWidth circleParameters.StrokeWidth*)
      ] :> IView
      
/// Makes a text ReactElement
let makeText (posX: float) (posY: float) (displayedText: string) (textParameters: Text) =
    TextBlock.create [
            TextBlock.text displayedText
            // TextBlock.textAnchor textParameters.TextAnchor
            // TextBlock.dominantBaseline textParameters.DominantBaseline
            // TextBlock.fontWeight textParameters.FontWeight
            // TextBlock.fontSize (float textParameters.FontSize)
            TextBlock.fontFamily textParameters.FontFamily
            // TextBlock.fill textParameters.Fill
            // TextBlock.userSelect textParameters.UserSelect
        ] :> IView

/// makes a two-line text ReactElement
/// Dy parameter determines line spacing
let makeTwoLinesOfText (posX: float) (posY: float) (line1: string) (line2: string) (textParameters: Text) =
    StackPanel.create[
        StackPanel.children[
            makeText posX posY line1 textParameters
            makeText posX posY line2 textParameters
        ]
    ] :> IView
    

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



    

