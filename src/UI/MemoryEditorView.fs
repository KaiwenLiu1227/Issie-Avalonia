//(*
//    MemoryEditorView.fs
//
//    A simple Popup editor to view and change the content of a memory.
//*)
//
module MemoryEditorView

open Elmish
open Avalonia
open Avalonia.Controls
open Avalonia.Controls.Shapes
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.FuncUI.Types
open Avalonia.Layout

open Helpers
open NumberHelpers
(*
open JSHelpers
*)
open CommonTypes
open ModelType
(*open PopupHelpers
open Notifications*)
open DrawModelType
open Sheet.SheetInterface

open Optics
open Optics.Operators


let project_ = currentProj_ >-> Optics.Option.value_


/// Prism to select Memory1 from ComponentType (if it exists)
let memory1_ = 
    Prism.create 
        (fun (a:Component) -> match a.Type with | Memory mem -> Some mem | _ -> None)
        (fun (mem:Memory1) -> 
            Optic.map type_ (fun typ -> 
                match typ with 
                | MemoryAndType(typ, _) -> typ mem 
                | typ -> typ))


/// Updates FromData memories from linked files in all LoadedComponents INCLUDING that of the open sheet
/// For the open sheet the update must also be made be on the draw blok component
let updateLoadedComponentMemory (memUpdate: Memory1 -> Memory1) =
    let compUpdate = Optic.map memory1_ memUpdate
    let updateProject (p: Project) =
        let updateSheetComponents (f: Component -> Component) =
            Optic.map componentsState_ (List.map f) 
        p.LoadedComponents
        |> List.map (updateSheetComponents compUpdate)
        |> (fun ldcs -> Optic.set (loadedComponents_) ldcs p)
    Optic.map project_ (updateProject)

/// Update one FromData Memory1 in project to equal its linked file memory file contents.
/// Silently do not update components where the file reading fails
let updateMemory (p: Project) (mem: Memory1) =
    match mem.Init with
    | FromFile fName ->
        FilesIO.initialiseMem mem p.ProjectPath
        |> function | Ok mem -> mem | Error e -> mem
    | _ -> mem // no change

/// Update all file-linked memory components in Draw Block (attached to symbols) and relevant loadedcomponent
let updateDrawBlockMemoryComps  (memUpdate: Memory1 -> Memory1) (p: Project) =
    let updateSymbol = (Optic.map (SymbolT.component_ >-> memory1_) (updateMemory p))
    Optic.map 
        (sheet_ >->  SheetT.wire_ >-> BusWireT.symbol_ >-> SymbolT.symbols_)
        (Map.map (fun _  -> updateSymbol))

/// Update all file-linked memory components in Draw Block and LoadedComponents   
let updateAllMemoryComps (model: Model) =
    match model.CurrentProj with 
    | None -> model
    | Some p ->
        model
        |> updateDrawBlockMemoryComps (updateMemory p) p
        |> (updateLoadedComponentMemory (updateMemory p))


    

(*
let private popupExtraStyle = [ Width "65%"; Height "80%" ]
let private headerHeight = 60;
let private headerStyle = Style [
    Position PositionOptions.Fixed
    MarginTop (string (-headerHeight-20) + "px")
    PaddingTop "20px"
    PaddingBottom "60px"
    BackgroundColor "white"
    Width "61%"
    Height headerHeight
    CSSProp.ZIndex 32
]
let private bodyStyle = Style [
    MarginTop (string headerHeight + "px")
]

let private showError msg dispatch : unit =
    errorNotification msg CloseMemoryEditorNotification
    |> SetMemoryEditorNotification |> dispatch*)

let private closeError dispatch : unit =
    CloseMemoryEditorNotification |> dispatch

let private showRowWithAdrr memoryEditorData addr =
    match memoryEditorData.Address with
    | None -> true
    | Some a when a = addr -> true
    | _ -> false

let viewNum numBase =
    match numBase with | Hex -> hex64 | Dec -> dec64 | Bin -> bin64 | SDec -> sDec64

let viewFilledNum width numBase =
    match numBase with | Hex -> fillHex64 width | Dec -> dec64 | Bin -> fillBin64 width | SDec -> sDec64

// let private baseToStr b = match b with | Hex -> "hex" | Dec -> "dec" | Bin -> "bin"


let mutable dynamicMem: Memory1 = { 
    Init = FromData; 
    WordWidth = 0; 
    AddressWidth = 0; 
    Data = Map.empty 
    } // Need to use a mutable dynamic memory and update it locally so that the shown values are correct since the model is not immediately updated

let baseSelector numBase changeBase =
    [StackPanel.create [
        StackPanel.orientation Orientation.Horizontal
        StackPanel.children [
            Button.create [
                Button.content "hex"
                Button.onClick (fun _ -> changeBase Hex)
            ]
            Button.create [
                Button.content "dec"
                Button.onClick (fun _ -> changeBase Dec)
            ]
            Button.create [
                Button.content "bin"
                Button.onClick (fun _ -> changeBase Bin)
            ]
        ]
    ] |> generalize]
    (*Level.item [ Level.Item.HasTextCentered ] [
        Field.div [ Field.HasAddonsCentered ] [
            Control.div [] [ Button.button [
                Button.Color (if numBase = Hex then IsPrimary else NoColor)
                Button.OnClick (fun _ -> changeBase Hex)
            ] [ str "hex" ] ]
            Control.div [] [ Button.button [
                Button.Color (if numBase = Dec then IsPrimary else NoColor)
                Button.OnClick (fun _ -> changeBase Dec)
            ] [ str "dec" ] ]
            Control.div [] [ Button.button [
                Button.Color (if numBase = Bin then IsPrimary else NoColor)
                Button.OnClick (fun _ -> changeBase Bin)
            ] [ str "bin" ] ]
        ]
    ]*)

let changeBase memoryEditorData dispatch numBase =
    { memoryEditorData with NumberBase = numBase }
    |> Some |> SetPopupMemoryEditorData |> dispatch

//========//
// Editor //
//========//
/// Function creating react input box for memory address for use in WaveSim code (could also be used here).
/// setMemoryAddress dispatches a message to set the memory address to that typed in the input box.
/// numberBase, addressWidth configure the view.
/// TODO: make box width variable according to memory width?