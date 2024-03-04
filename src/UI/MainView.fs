namespace Issie_Avalonia

open Avalonia.Controls
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.Layout
open ModelType
open SymbolHelper
open SheetView
open TopMenuView

module MainView =


    let init () = {
        polygonParameters = genPolyParam
        compNum = 0
        rotation = 0.0
        holdingState = false 
    }

    let view model dispatch =
        StackPanel.create [
            StackPanel.children [
                topMenuView model dispatch
                (*Button.create [
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
                ]*)
                sheetView model dispatch
            ]
        ]
        |> generalize
    