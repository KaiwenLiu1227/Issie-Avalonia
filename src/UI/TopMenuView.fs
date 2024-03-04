namespace Issie_Avalonia

open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.Media

module TopMenuView =
    let topMenuView model dispatch =
        Border.create
            [ Border.borderThickness 2.0
              Border.borderBrush (SolidColorBrush(Color.FromArgb(75uy, 0uy, 0uy, 0uy))) // 描边颜色
              Border.padding 10.0
              Border.dock Dock.Top
              Border.child (
                  Menu.create
                      [
                        (*Menu.borderThickness 2.0*)
                        
                        Menu.viewItems
                            [ MenuItem.create
                                  [ MenuItem.header "Project"
                                    MenuItem.viewItems
                                        [ MenuItem.create [ MenuItem.header "File" ]
                                          MenuItem.create [ MenuItem.header "Edit" ] ] ]
                              MenuItem.create
                                  [ MenuItem.header "Sheet"
                                    MenuItem.viewItems
                                        [ MenuItem.create [ MenuItem.header "File" ]
                                          MenuItem.create [ MenuItem.header "Edit" ] ] ]
                              MenuItem.create [ MenuItem.header "Path/this_project/this_sheet" ]
                              Button.create [ Button.content "Save" ]
                              Button.create [ Button.content "Info" ] ] ]
              ) ]
