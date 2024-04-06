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

    
    let generateGridPathData (rows: int) (cols: int) (width: float) (height: float) =
        let rowSpacing = height / float rows
        let colSpacing = width / float cols
        let horizontalLines = 
            [ for row in 1 .. rows -> sprintf "M0,%f L%f,%f" (rowSpacing * float row) width (rowSpacing * float row) ]
        let verticalLines = 
            [ for col in 1 .. cols -> sprintf "M%f,0 L%f,%f" (colSpacing * float col) (colSpacing * float col) height ]
        String.concat " " (horizontalLines @ verticalLines)

    
    let sheetView state dispatch =
            let gridPathData = generateGridPathData 40 40 400.0 400.0

            Canvas.create [
                (*Canvas.height 250
                Canvas.width 250*)
                Canvas.background (SolidColorBrush(Color.FromArgb(25uy, 25uy, 0uy, 0uy)))
                Canvas.children [
                    (*Path.create [
                        Canvas.top -100
                        Canvas.left -100
                        Path.data (Geometry.Parse(gridPathData)) // Define your grid lines
                        Path.stroke (Brushes.Black)
                        Path.strokeThickness 1.0
                    ]*)
                    symbolView state dispatch
                ]    
            ]
          
        
    
