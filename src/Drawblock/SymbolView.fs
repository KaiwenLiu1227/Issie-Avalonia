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

let drawComponent (symbol:Symbol) dispatch=
        let H = symbol.Component.H
        let W = symbol.Component.W
        let points = genPoints symbol.Component H W
        let pointList = points |> Array.toList |> List.map (fun p -> Point(p.X, p.Y))
        let appear = symbol.Appearance

        Polygon.create [
            Polygon.points pointList
            Polygon.stroke (SolidColorBrush(Color.FromArgb(255uy, 0uy, 0uy, 0uy)))
            Polygon.strokeThickness 2.0
            Polygon.fill (SolidColorBrush(Color.FromArgb(255uy, 255uy, 235uy, 47uy), appear.Opacity))
            (*
            Component.onPointerPressed (fun args -> dispatch (OnPress polygonParameter.Id))
        *)
        ]

// WITH COMPONENT KEY BIND FOR CACHING 
let renderSymbol props dispatch :IView=
    // printf $"{props.Id} rendered" 
    Component.create($"comp-{props.Id}", fun ctx ->
        ctx.attrs[
            Component.renderTransform (
                TranslateTransform(props.Pos.X-1200.0, props.Pos.Y-600.0)
            )
        ]
        drawComponent props dispatch
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
        Canvas.create [
            (*
            Canvas.renderTransform matrixTransform
            *)
            Canvas.height 1920
            Canvas.width 1080
            (*Canvas.onPointerWheelChanged (fun args -> dispatch (Rotate args))
            Canvas.onPointerMoved (fun args -> handlePointerMoved args)
            Canvas.onPointerReleased (fun args -> dispatch OnRelease) *)
            Canvas.children (
                model.Symbols
                |> Map.toSeq // Convert the map to a sequence of key-value pairs
                |> Seq.map (fun (idx, symbol) ->
                    renderSymbol symbol dispatch) // Ignore the key with '_'
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