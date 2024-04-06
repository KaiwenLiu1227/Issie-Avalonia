module SymbolView

open System
open CommonTypes.JSONComponent
open Elmish
open Avalonia
open Avalonia.Controls
open Avalonia.Controls.Shapes
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.FuncUI.Types
open ModelType
open CommonTypes
open DrawModelType.SymbolT
open SymbolHelper

let drawComponent (polygonParameter:Component) dispatch=
        let points = genPoints polygonParameter.Type 20 20
        let pointList = points |> Array.toList |> List.map (fun p -> Point(p.X, p.Y))
        Polygon.create [
            Polygon.points pointList
            Polygon.stroke (SolidColorBrush(polygonParameter.Stroke))
            Polygon.strokeThickness polygonParameter.StrokeThickness
            Polygon.fill (SolidColorBrush(polygonParameter.Fill, polygonParameter.FillOpacity))
            (*
            Component.onPointerPressed (fun args -> dispatch (OnPress polygonParameter.Id))
        *)
        ]

// WITH COMPONENT KEY BIND FOR CACHING 
let renderSymbol props dispatch :IView=
    Component.create($"comp-{props.Id}", fun ctx ->
        let xPosition = getCompPos props "X"
        let yPosition = getCompPos props "Y"
        ctx.attrs[
            Component.renderTransform (
                TranslateTransform(xPosition, yPosition)
            )
        ]
        drawComponent props.Component dispatch
    )

 (*// STANDARD IMPLEMENTATION WITHOUT COMPONENT KEY BIND FOR CACHING 
let renderSymbol props dispatch :IView=
    printfn "polygon %d render called" props.Id
    let xPosition = getCompPos props "X"
    let yPosition = getCompPos props "Y"
    Viewbox.create[
        Viewbox.renderTransform (
            TranslateTransform(xPosition, yPosition)
        )
        Viewbox.child (
           drawComponent props dispatch 
        )
    ]   *) 


let symbolView (model:Model) dispatch =
        (*let handlePointerMoved (args: Input.PointerEventArgs) =
                let newPos = args.GetPosition(null) 
                let roundUpToTen n = Math.Ceiling(n / 10.0) * 10.0
                // Apply the function to both X and Y coordinates
                let roundedX = roundUpToTen newPos.X
                let roundedY = roundUpToTen newPos.Y
                // Dispatch the Move message with the rounded coordinates
                dispatch (Move { X = roundedX; Y = roundedY })
            
        let matrixTransform = MatrixTransform(Matrix.CreateRotation(state.rotation))*)



        Canvas.create [
            (*
            Canvas.renderTransform matrixTransform
            *)
            Canvas.height 250
            Canvas.width 250
            (*Canvas.onPointerWheelChanged (fun args -> dispatch (Rotate args))
            Canvas.onPointerMoved (fun args -> handlePointerMoved args)
            Canvas.onPointerReleased (fun args -> dispatch OnRelease) *)
            Canvas.children (
                model.Symbols
                |> Map.toSeq // Convert the map to a sequence of key-value pairs
                |> Seq.map (fun (_, symbol) -> renderSymbol symbol dispatch) // Ignore the key with '_'
                |> Seq.toList // Convert back to a list if needed for Canvas.children
            )
        ]    
        

let init () = 
    { 
        Symbols = Map.empty; CopiedSymbols = Map.empty
        Ports = Map.empty ; InputPortsConnected= Set.empty
        OutputPortsConnected = Map.empty; Theme = Colourful
        (*
        HintPane = None
    *)
    }, Cmd.none