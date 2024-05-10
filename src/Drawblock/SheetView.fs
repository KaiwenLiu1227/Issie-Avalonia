module SheetView

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
          
        
    
