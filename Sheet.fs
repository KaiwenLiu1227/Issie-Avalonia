namespace Issie_Avalonia

module SheetModel =

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

    type State =
        { polygonParameters: PolygonParameters[]
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
    
    let init () =
        {  polygonParameters = genPolyParam
           compNum = 0
           rotation = 0.0
           holdingState = false }


    let update msg state =
        match msg with
        | Reset -> init ()
        | Forward ->
            printfn "forward"
            let updatedPolygonParam = 
                {
                    state.polygonParameters.[state.compNum] with
                        renderCnt = state.polygonParameters.[state.compNum].renderCnt + 1
                        compIdx = state.polygonParameters.[state.compNum].compIdx + 1
                        compType =  componentTypes.[state.polygonParameters.[state.compNum].compIdx  % Array.length componentTypes]
                }
            
            let updatedPolygonParameters = 
                state.polygonParameters
                |> Array.mapi (fun idx param -> 
                    if idx = state.compNum then updatedPolygonParam else param)

            { state with polygonParameters = updatedPolygonParameters }

        | Backward ->
            let updatedPolygonParam = 
                {
                    state.polygonParameters.[state.compNum] with
                        renderCnt = state.polygonParameters.[state.compNum].renderCnt + 1
                        compIdx = state.polygonParameters.[state.compNum].compIdx - 1
                        compType =  componentTypes.[state.polygonParameters.[state.compNum].compIdx  % Array.length componentTypes]
                }
            let updatedPolygonParameters = 
                state.polygonParameters
                |> Array.mapi (fun idx param -> 
                    if idx = state.compNum then updatedPolygonParam else param)

            { state with polygonParameters = updatedPolygonParameters }    
        | Rotate args ->
            { state with
                 rotation = state.rotation + args.Delta.Y * 0.785
            }
        | Move newPos ->
            if state.holdingState then
                let oldPos = state.polygonParameters.[state.compNum].compPos
                if newPos <> oldPos then
                        let updatedPolygonParam = 
                            {state.polygonParameters.[state.compNum] with
                                  renderCnt = state.polygonParameters.[state.compNum].renderCnt + 1
                                  compPos = newPos
                              }
                        
                        let updatedPolygonParameters = 
                            state.polygonParameters
                            |> Array.mapi (fun idx param -> 
                                if idx = state.compNum then updatedPolygonParam else param)

                        { state with polygonParameters = updatedPolygonParameters }
                else
                    state
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
