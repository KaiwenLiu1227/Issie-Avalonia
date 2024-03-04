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
open CatalogueView

module MainView =


    let init () =
        { polygonParameters = genPolyParam
          compNum = 0
          rotation = 0.0
          holdingState = false }

    let view model dispatch =
        DockPanel.create
            [ DockPanel.children
                  [
                    catalogueView model dispatch
                    topMenuView model dispatch
                    sheetView model dispatch ] ]
        |> generalize
