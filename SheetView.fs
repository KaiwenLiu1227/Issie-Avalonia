namespace Issie_Avalonia

module SheetView =

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
    open SheetModel
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
            let matrixTransform = MatrixTransform(Matrix.CreateRotation(state.rotation))
            let gridPathData = generateGridPathData 40 40 400.0 400.0

            Canvas.create [
                Canvas.renderTransform matrixTransform
                Canvas.height 250
                Canvas.width 250
                Canvas.onPointerWheelChanged (fun args -> dispatch (Rotate args))
                Canvas.background (SolidColorBrush(Color.FromArgb(255uy, 255uy, 255uy, 255uy)))
                Canvas.children [
                    Path.create [
                        Canvas.top -100
                        Canvas.left -100
                        Path.data (Geometry.Parse(gridPathData)) // Define your grid lines
                        Path.stroke (Brushes.Black)
                        Path.strokeThickness 1.0
                    ]
                    symbolView state dispatch
                ]    
            ]
          
        
    
    let view state dispatch =
        DockPanel.create [
            DockPanel.background (SolidColorBrush(Color.FromArgb(255uy, 255uy, 255uy, 255uy)))
            DockPanel.children [
                Button.create [
                    Button.background (SolidColorBrush(Color.FromArgb(155uy, 0uy, 0uy, 0uy))) // Example: Set a distinct background for the button
                    Button.dock Dock.Bottom
                    Button.onClick (fun _ -> dispatch Backward)
                    Button.content "-"
                    Button.horizontalAlignment HorizontalAlignment.Stretch
                    Button.horizontalContentAlignment HorizontalAlignment.Center
                ]
                Button.create [
                    Button.background (SolidColorBrush(Color.FromArgb(155uy, 0uy, 0uy, 0uy))) // Example: Set a distinct background for the button
                    Button.dock Dock.Bottom
                    Button.onClick (fun _ -> dispatch Forward)
                    Button.content "+"
                    Button.horizontalAlignment HorizontalAlignment.Stretch
                    Button.horizontalContentAlignment HorizontalAlignment.Center
                ]
                sheetView state dispatch
            ]
        ]
        |> generalize
    