module ContextMenus

open Elmish
open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.FuncUI
open Avalonia.FuncUI.Elmish

open JSHelpers
open ModelType

(*open Fable.Core
open Fable.Core.JsInterop
open ElectronAPI*)
//
// **** DO NOT open or use renderer module code ****
//

//---------------------------------------------------------------------------------------//
//-------Menus for context-dependent right-click actions - mainly used in draw block-----//
//---------------------------------------------------------------------------------------//

(*
    NB - this file is linked into Main project as well as Renderer - so it cannot reference
    Renderer modules which are not compiled with Main.fs (that is nearly all of the renderer).
*)


/// The context menu info is a map of menu name -> list of menu items
/// menu and item names can be arbitrary strings
/// add menus as here
let contextMenus = [
        "SheetMenuBreadcrumbDev", ["Rename"; "Delete"; "Lock"; "Unlock"; "Lock Subtree"; "Unlock Subtree"]
        "SheetMenuBreadcrumb", ["Rename"; "Delete"]
        "CustomComponent", ["Go to sheet" ; "Properties"]
        "ScalingBox", ["Rotate Clockwise (Ctrl+Right)"; "Rotate AntiClockwise (Ctrl+Left)" ; "Flip Vertical (Ctrl+Up)"; "Flip Horizontal (Ctrl+Down)"; "Delete Box (DEL)"; "Copy Box (Ctrl+C)"; "Move Box (Drag any component)"]
        "Component", ["Rotate Clockwise (Ctrl+Right)"; "Rotate AntiClockwise (Ctrl+Left)" ; "Flip Vertical (Ctrl+Up)"; "Flip Horizontal (Ctrl+Down)" ; "Delete (DEL)"; "Copy (Ctrl+C)"; "Properties"]
        "Canvas", ["Zoom-in (Alt+Up) and centre" ; "Zoom-out (Alt+Down)" ; "Fit to window (Ctrl+W)" ; "Paste (Ctrl+V)"; "Reroute all wires"; "Properties"]
        "Wire", ["Unfix Wire"]
        "WaveSimHelp", ["Waveform and RAM selection"; "Waveform Operations"; "Miscellaneous"]
        "", [] // Empty string for no context menu.
    ]

let menuMap = Map.ofList contextMenus

let makeItem (label : string) (accelerator : string option) iAction  =
    MenuItem.create [
        MenuItem.header  label
        MenuItem.onClick iAction
    ] |> generalize

/// make  a conditional menu item from a condition,
/// name, opt key to trigger, and action
let makeCondItem label accelerator action =
   let item = makeItem label accelerator action
   item

/// A menu item which is visible only if in debug mode
/// (run dev or command line -D on binaries) and on windows.
let makeDebugItem label accelerator option =
    makeCondItem  label accelerator option

/// A menu item which is visible only if in debug mode
/// (run dev or command line -D on binaries) and on windows.
let makeWinDebugItem label accelerator option =
    makeCondItem label accelerator option


/// function used to implement main process 
/// context menu items. It should not be changed.
let makeClickableReturner dispatch menuType (s:string) =
    MenuItem.create [
        MenuItem.header s
        MenuItem.onClick (fun _ -> dispatch <| ContextMenuItemClick(menuType,s,dispatch))
    ] |> generalize

// create different context menu depends on position right click trigger
let makeMenu model dispatch e =
    ()
    (*
    let args = getContextMenu e model
    let menuType:string = unbox args

    //printf "%A" menuType
    let cases =
        Map.tryFind menuType menuMap
        |> function
            | None ->
                printfn "%s" $"Error: '{menuType}' must be a valid menu name: one of {menuMap |> Map.keys |> List.ofSeq}"
                ["unknown_menu"]
            | Some cases ->
                cases
            |> List.toArray
    
    ContextMenu.create [
        ContextMenu.viewItems (
            cases
            |> Array.map (fun s -> makeClickableReturner dispatch menuType s)
            |> List.ofArray
            )
    ]
    *)

let makeTestContextMenu =
    ContextMenu.create [
        ContextMenu.viewItems [
            makeWinDebugItem "Trace all" None (fun _ ->
                debugTraceUI <- Set.ofList ["update";"view"])
            makeWinDebugItem "Trace View function" None (fun _ ->
                debugTraceUI <- Set.ofList ["view"])
            makeWinDebugItem "Trace Update function" None (fun _ ->
                debugTraceUI <- Set.ofList ["update"])
            makeWinDebugItem "Trace off" None (fun _ ->
                debugTraceUI <- Set.ofList [])
        ]
    ]
