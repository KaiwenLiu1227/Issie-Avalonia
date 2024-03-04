
namespace Issie_Avalonia

open Avalonia.Controls
open Avalonia.FuncUI.DSL

module TopMenuView =
    let topMenuView model dispatch =
        Menu.create [
            Menu.viewItems [
                MenuItem.create [
                    MenuItem.header "Project"
                    MenuItem.viewItems [
                        MenuItem.create [
                            MenuItem.header "File"
                        ]
                        MenuItem.create [
                            MenuItem.header "Edit"
                        ]
                    ]
                ]
                MenuItem.create [
                    MenuItem.header "Sheet"
                    MenuItem.viewItems [
                        MenuItem.create [
                            MenuItem.header "File"
                        ]
                        MenuItem.create [
                            MenuItem.header "Edit"
                        ]
                    ]
                ]
                MenuItem.create [
                    MenuItem.header "Path/this_project/this_sheet"
                ]
                Button.create [
                    Button.content "Save"
                ]
                Button.create [
                    Button.content "Info"
                ]
            ]
        ]
        

