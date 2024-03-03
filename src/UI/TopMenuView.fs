(*
namespace Issie_Avalonia

open Avalonia.Controls
open Avalonia.FuncUI.DSL

module TopMenuView =
    let menuItems = [
        MenuItem.create[
            MenuItem.header "File"
        ]
        MenuItem.create[
            MenuItem.header "Edit"
        ]
    ]
    let topMenuView model dispatch =
        (*Menu.create [
          Menu.viewItems menuItems
        ]*)
        *)

