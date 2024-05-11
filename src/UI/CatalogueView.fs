module CatalogueView

open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.Layout
open Avalonia

let catalogueView model dispatch =
    DockPanel.create
        [ DockPanel.dock Dock.Right
          DockPanel.lastChildFill true
          DockPanel.children
              [

                Border.create
                    [ Border.borderThickness 2.0
                      Border.borderBrush (SolidColorBrush(Color.FromArgb(75uy, 0uy, 0uy, 0uy))) // 描边颜色
                      Border.padding 10.0
                      Border.width 350
                      Border.child (
                          StackPanel.create
                              [ StackPanel.children
                                    [ Menu.create
                                          [
                                            (*Menu.borderThickness 2.0*)
                                            Menu.viewItems
                                                [ MenuItem.create [ MenuItem.header "Catalogue" ]
                                                  MenuItem.create [ MenuItem.header "Properties" ]
                                                  MenuItem.create [ MenuItem.header "Simulation" ] ] ]
                                      TextBlock.create
                                          [ TextBlock.text "Catalogue"
                                            TextBlock.padding (Thickness 10.0)
                                            TextBlock.fontSize 20.0 // Optionally, set a larger font size for the title
                                            // Other styling properties for the title
                                            ]
                                      TextBlock.create
                                          [ TextBlock.text
                                                "Click on a component to add it to the diagram. Hover on components for details."
                                            TextBlock.padding (Thickness 10.0)
                                            TextBlock.textWrapping TextWrapping.Wrap ]
                                      Button.create
                                          [ Button.background (SolidColorBrush(Color.FromArgb(55uy, 0uy, 0uy, 0uy))) // Example: Set a distinct background for the button
                                            Button.dock Dock.Bottom
                                            (*
                                                Button.onClick (fun _ -> dispatch Forward)
                                                *)
                                            Button.content "+"
                                            Button.horizontalAlignment HorizontalAlignment.Stretch
                                            Button.horizontalContentAlignment HorizontalAlignment.Center ]
                                      Button.create
                                          [ Button.background (SolidColorBrush(Color.FromArgb(55uy, 0uy, 0uy, 0uy))) // Example: Set a distinct background for the button
                                            Button.dock Dock.Bottom
                                            (*
                                                Button.onClick (fun _ -> dispatch Backward)
                                                *)
                                            Button.content "-"
                                            Button.horizontalAlignment HorizontalAlignment.Stretch
                                            Button.horizontalContentAlignment HorizontalAlignment.Center ] ] ]
                      ) ] ] ]
