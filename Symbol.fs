namespace Issie_Avalonia


module Symbol =

    open System
    open Avalonia
    open Avalonia.Controls
    open Avalonia.Controls.Shapes
    open Avalonia.FuncUI
    open Avalonia.FuncUI.DSL
    open Avalonia.Media
    open Avalonia.Layout
    open SymbolHelper
    open DisplayModelTypes
    
    type PolygonParameters = {
        Stroke: Color
        FillOpacity: float
        Fill: Color
        StrokeThickness: float
        compPos: XYPos
        points: XYPos[]
    }

    
    type State =
        { polygonParameters: PolygonParameters[]
          compType: String
          compIdx: int
          compNum: int
          rotation: float
          holdingState: bool}

    type Msg =
        | Forward
        | Backward
        | Rotate of Input.PointerWheelEventArgs
        | Reset
        | Move of XYPos
        | OnPress of int
        | OnRelease
    
    let genPolyParam = 
        [|
            { Stroke = Color.FromArgb(255uy, 0uy, 0uy, 0uy);
              FillOpacity = 0.8;
              StrokeThickness = 2.0; 
              Fill = Color.FromArgb(255uy, 255uy, 235uy, 47uy);
              compPos = { X = 150.0; Y = 150.0 };
              points= genPoints "Not" 20 20 };
            { Stroke = Color.FromArgb(255uy, 0uy, 0uy, 0uy);
              FillOpacity = 0.8;
              StrokeThickness = 2.0; 
              Fill = Color.FromArgb(255uy, 255uy, 235uy, 47uy);
              compPos = { X = 150.0; Y = 150.0 };
              points= genPoints "Not" 20 20 }
        |]
    

    let init () =
        {  polygonParameters = genPolyParam
           compType = "Not"
           compIdx = 0
           compNum = 0
           rotation = 0.0
           holdingState = false }


    let update msg state =
        match msg with
        | Reset -> init ()
        | Forward ->
            printfn "forward"
            { state with
                compIdx = state.compIdx + 1
                compType =  componentTypes.[state.compIdx % Array.length componentTypes]
                // points = genPoints state.compType 20 20
            }
        | Backward ->
            printfn "back"
            { state with
                compIdx = state.compIdx - 1
                compType =  componentTypes.[state.compIdx % Array.length componentTypes]
                // points = genPoints state.compType 20 20
            }
        | Rotate args ->
            { state with
                 rotation = state.rotation + args.Delta.Y * 0.785
            }
        | Move args ->
            if state.holdingState then
                let updatedPolygonParam = 
                    { state.polygonParameters.[state.compNum] with compPos = args }
                
                let updatedPolygonParameters = 
                    state.polygonParameters
                    |> Array.mapi (fun idx param -> 
                        if idx = state.compNum then updatedPolygonParam else param)

                { state with polygonParameters = updatedPolygonParameters }
            else
                state  // Return the state unchanged if holdingState is false
        | OnRelease ->
            { state with
                holdingState = false 
            }
        | OnPress compPressed ->
            { state with
                compNum = compPressed
                holdingState = true 
            }    
        | _ -> state
