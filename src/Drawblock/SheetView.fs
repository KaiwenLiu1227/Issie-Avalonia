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
open SymbolHelper
open SymbolView
open DrawModelType.SheetT
   
    
    let sheetView model dispatch =
            (*
            printfn $"{model}"
            *)

            Canvas.create [
                (*Canvas.height 250
                Canvas.width 250*)
                Canvas.background (SolidColorBrush(Color.FromArgb(25uy, 25uy, 0uy, 0uy)))
                Canvas.children [
                    symbolView model.Wire.Symbol dispatch
                ]    
            ]
          
        
    
