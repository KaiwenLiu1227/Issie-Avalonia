module SheetUpdate

open CommonTypes
(*open Browser
open Fable.React*)
open Elmish
open DrawHelpers
open DrawModelType
open DrawModelType.SymbolT
open DrawModelType.BusWireT
open DrawModelType.SheetT
(*
open SheetUpdateHelpers
*)
open Sheet
(*open SheetSnap
open SheetDisplay*)
open Optics
open FilesIO
open FSharp.Core
open Fable.Core.JsInterop
(*open BuildUartHelpers
open Node*)

(*
module node = Node.Api
*)

(*
importReadUart
*)
let emptySnap: SnapXY = 
    let emptyInfo:SnapInfo = {SnapData = [||]; SnapOpt = None}
    {
        SnapX = emptyInfo
        SnapY = emptyInfo
    }
/// Init function
let init () =
    let wireModel, cmds = (BusWireUpdate.init ())
    let boundingBoxes = Symbol.getBoundingBoxes wireModel.Symbol

    {
        Wire = wireModel
        (*
        PopupViewFunc = None
        *)
        PopupDialogData = {Text=None; Int=None; Int2=None}
        BoundingBoxes = boundingBoxes
        LastValidBoundingBoxes = boundingBoxes
        SelectedComponents = []
        SelectedLabel = None
        SelectedWires = []
        NearbyComponents = []
        ErrorComponents = []
        DragToSelectBox = {TopLeft = {X=0.0; Y=0.0}; H=0.0; W=0.0}
        ConnectPortsLine = {X=0.0; Y=0.0}, {X=0.0; Y=0.0}
        TargetPortId = ""
        Action = Idle
        ShowGrid = false
        LastMousePos = { X = 0.0; Y = 0.0 }
        ScalingBoxCentrePos = { X = 0.0; Y = 0.0 }
        InitMouseToScalingBoxCentre = { X = 0.0; Y = 0.0 }
        SnapSymbols=emptySnap
        SnapSegments = emptySnap
        CursorType = Default
        ScreenScrollPos = { X = 0.0; Y = 0.0 }
        LastValidPos = { X = 0.0; Y = 0.0 }
        LastValidSymbol = None
        CurrentKeyPresses = []
        UndoList = []
        RedoList = []
        TmpModel = None
        ScalingTmpModel = None
        Zoom = 1.0
        CanvasSize = Constants.defaultCanvasSize
        AutomaticScrolling = false
        ScrollingLastMousePos = {Pos={ X = 0.0; Y = 0.0 }; Move={X = 0.0; Y  =0.0}}
        MouseCounter = 0
        LastMousePosForSnap = { X = 0.0; Y = 0.0 }
        CtrlKeyDown = false
        PrevWireSelection = []
        Compiling = false
        CompilationStatus = {Synthesis = Queued; PlaceAndRoute = Queued; Generate = Queued; Upload = Queued}
        (*
        CompilationProcess = None
        *)
        DebugState = NotDebugging
        DebugData = [1..256] |> List.map (fun i -> 0b00111011)
        DebugIsConnected = false
        DebugMappings = [||]
        DebugDevice = None
        ScalingBox = None
    }, (Cmd.none: Cmd<ModelType.Msg>)



