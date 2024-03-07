namespace Issie_Avalonia

open Avalonia.Controls
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open System
open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.FuncUI
open Avalonia.FuncUI.Elmish

open ModelType
open SymbolHelper
open SheetView
open TopMenuView
open CatalogueView
open UIPopups

module MainView =


    let init () =
        { polygonParameters = genPolyParam
          compNum = 0
          rotation = 0.0
          projectState = "new" 
          holdingState = false
          IsOverlayVisible = true }

    let view model dispatch =
            Grid.create [
                Grid.children [
                    // Your main content here
                    DockPanel.create
                        [ DockPanel.children
                              [
                                catalogueView model dispatch
                                topMenuView model dispatch
                                sheetView model dispatch ] ]
                    // Overlay
                    overlayView model dispatch 
                ]
            ]         |> generalize
