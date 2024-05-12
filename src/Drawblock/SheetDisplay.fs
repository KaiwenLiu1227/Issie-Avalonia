module SheetDisplay

open System
open Avalonia
open Avalonia.Controls
open Avalonia.Controls.Shapes
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.Layout
open Avalonia.FuncUI.Helpers
open Avalonia.FuncUI.Types
open ModelType
open DrawHelpers
open DrawModelType
open DrawModelType.SheetT
open Optics
open Operators  
open Sheet
module Constants =
    let KeyPressPersistTimeMs = 1000.

/// Hack to deal with possible Ctrl Key up when window is not focussed.
/// This will not register as a keyup and so will stay in CurrentKeyPresses forever.
/// Use the fact that keys auto-repeat, and time-stamp each KeyDown.
/// If the mots recent keydown is longer than some cutoff time assume key is no longer pressed.
let getActivePressedKeys model =
    let timeNow = TimeHelpers.getTimeMs()
    List.filter (fun (_,time) -> timeNow - time < Constants.KeyPressPersistTimeMs) model.CurrentKeyPresses


(*/// This actually writes to the DOM a new scroll position.
/// In the special case that DOM has not yet been created it does nothing.
let writeCanvasScroll (scrollPos:XYPos) =
    //printf "%s" $"***writing canvas scroll: {scrollPos.X},{scrollPos.Y}"
    canvasDiv
    |> Option.iter (fun el -> el.scrollLeft <- scrollPos.X; el.scrollTop <- scrollPos.Y)

let getDrawBlockPos (ev: Types.MouseEvent) (headerHeight: float) (sheetModel:Model) =
    {
        X = (ev.pageX + sheetModel.ScreenScrollPos.X) / sheetModel.Zoom  ;
        Y = (ev.pageY - headerHeight + sheetModel.ScreenScrollPos.Y) / sheetModel.Zoom
    }

/// This function zooms an SVG canvas by transforming its content and altering its size.
/// Currently the zoom expands based on top left corner.
let displaySvgWithZoom 
        (model: Model) 
        (headerHeight: float) 
        (style: CSSProp list) 
        (svgReact: ReactElement List) 
        (dispatch: Dispatch<Msg>) 
            : ReactElement=

    let zoom = model.Zoom
    // Hacky way to get keypresses such as Ctrl+C to work since Electron does not pick them up.
    document.onkeydown <- (fun key ->
        //printf "%s" $"Down {key.key} ({model.CurrentKeyPresses})"
        if key.which = 32.0 then// Check for spacebar
            // key.preventDefault() // Disable scrolling with spacebar
            dispatch <| (ManualKeyDown key.key)
        else
            dispatch <| (ManualKeyDown key.key) )
    document.onkeyup <- (fun key ->
        //printf "%s" $"Up {key.key} ({model.CurrentKeyPresses})"
        dispatch <| (ManualKeyUp key.key))


    let sizeInPixels = sprintf "%.2fpx" ((model.CanvasSize * model.Zoom))

    /// Is the mouse button currently down?
    let mDown (ev:Types.MouseEvent) = ev.buttons <> 0.
    

    /// Dispatch a MouseMsg (compensated for zoom)
    let mouseOp op (ev:Types.MouseEvent) =
        // right button oprations are only used for context menus
        if int ev.button = 0 then // button = 0 => left, button = 2 => right
            dispatch <| MouseMsg {
                Op = op ;
                ShiftKeyDown = ev.shiftKey
                ScreenMovement = {X= ev.movementX;Y=ev.movementY}
                ScreenPage = {X=ev.pageX; Y=ev.pageY}
                Pos = getDrawBlockPos ev headerHeight model
                }

    let wheelUpdate (ev: Types.WheelEvent) =
        if List.exists (fun (k,_) -> k = "CONTROL") (getActivePressedKeys model) then
            // ev.preventDefault()
            if ev.deltaY > 0.0 then // Wheel Down
                dispatch <| KeyPress ZoomOut
            else
                dispatch <| KeyPress ZoomIn
        else () // Scroll normally if Ctrl is not held down
    let cursorText = model.CursorType.Text()
    let firstView = viewIsAfterUpdateScroll
    viewIsAfterUpdateScroll <- false
    div [ 
          HTMLAttr.Id "Canvas"
          Key cursorText // force cursor change to be rendered
          Style (CSSProp.Cursor cursorText :: style)
          OnMouseDown (fun ev -> (mouseOp Down ev))
          OnMouseUp (fun ev -> (mouseOp Up ev))
          OnMouseMove (fun ev -> mouseOp (if mDown ev then Drag else Move) ev)
          OnScroll (fun _ ->
            match canvasDiv with
            | None -> ()
            |Some el ->
                if not firstView then
                    dispatch <| UpdateScrollPosFromCanvas(scrollSequence,{X= el.scrollLeft; Y=el.scrollTop}, dispatch))
          Ref (fun el ->
            canvasDiv <- Some el
            //printfn "%s" $"Writing from Ref {scrollSequence}: {model.ScreenScrollPos.X},{model.ScreenScrollPos.Y}"
            writeCanvasScroll model.ScreenScrollPos)
          OnWheel wheelUpdate
        ]
        [
          svg
            [ Style
                [
                    Height sizeInPixels
                    Width sizeInPixels
                ]
              Id "DrawBlockSVGTop"
            ]
            [ g // group list of elements with list of attributes
                [ Style [Transform (sprintf "scale(%f)" zoom)]] // top-level transform style attribute for zoom
                    svgReact // the application code
            ]
        ]*)

/// View function, displays symbols / wires and possibly also a grid / drag-to-select box / connecting ports line / snap-to-grid visualisation
let view 
    (model:Model) 
    (dispatch : Msg -> unit)  =
        let wDispatch wMsg = dispatch (Wire wMsg)

        let wireSvg = BusWire.view model.Wire wDispatch

        Canvas.create [
            Canvas.background (SolidColorBrush(Color.FromArgb(25uy, 25uy, 0uy, 0uy)))
            Canvas.children (
                wireSvg
            )  
        ] :> IView
          
        
    
