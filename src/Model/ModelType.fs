(*
    ModelType.fs

    This module provides the type for the FRP UI.
    It could be put next to CommonTypes but non-UI modules should be agnostic of
    the FRP model and run independently of Fable
*)

module rec ModelType
open Avalonia.FuncUI.Types
open CommonTypes
open SimulatorTypes
open TruthTableTypes
open VerilogTypes
open Optics
open Optics.Operators

open Avalonia

module Constants =
    /// waveform simulator constant here for WSHelpers.initialWSModel reference
    /// maybe better to have this with WaveSim and parametrise initilaWSModel?
    let initialWaveformColWidth = 650 - 20 - 20 - 20 - 130 - 100


/// Groups components together in the wave selection table.
/// NB: There are fields which are commented out: these can be added back in
/// later on if we want to group those components together by type rather than
/// separately by name.
type ComponentGroup =
    | WireLabel
    | InputOutput
    | Viewers
    | Buses
    | Gates
    | MuxDemux
    | Arithmetic
    | CustomComp
    | FFRegister
    | Memories
    | Component of string


/// control checkboxes in waveform simulator wave selection
type CheckBoxStyle =
    | PortItem of Wave * string
    | ComponentItem of FastComponent
    | GroupItem of ComponentGroup * string list
    | SheetItem of string list

type RightTab =
    | Properties
    | Catalogue
    | Simulation
    | Build
    | Transition // hack to make a transition from Simulation to Catalog without a scrollbar artifact

type SimSubTab =
    | StepSim
    | TruthTable
    | WaveSim

type MemoryEditorData = {
    OnlyDiff : bool // Only show diffs in Memory Diff Viewer.
    Address : int64 option // Only show the specified memory address.
    Start: int64
    NumberBase : NumberBase
}

type ImportDecision =
    | Overwrite
    | Rename

/// Possible fields that may (or may not) be used in a dialog popup.
type PopupDialogData = {
    Text : string option;
    Int : int option;
    ImportDecisions : Map<string, ImportDecision option>
    Int2: int64 option
    ProjectPath: string
    MemorySetup : (int * int * InitMemData * string option) option // AddressWidth, WordWidth. 
    MemoryEditorData : MemoryEditorData option // For memory editor and viewer.
    Progress: PopupProgress option
    ConstraintTypeSel: ConstraintType option
    ConstraintIOSel: CellIO option
    ConstraintErrorMsg: string option
    NewConstraint: Constraint option
    AlgebraInputs: SimulationIO list option
    AlgebraError: SimulationError option
    VerilogCode: string option
    VerilogErrors: ErrorInfo list
    BadLabel: bool
    IntList: int list option;
    IntList2: int list option;
}

let text_ = Lens.create (fun a -> a.Text) (fun s a -> {a with Text = s})
let int_ = Lens.create (fun a -> a.Int) (fun s a -> {a with Int = s})
let importDecisions_ = Lens.create (fun a -> a.ImportDecisions) (fun s a -> {a with ImportDecisions = s})
let int2_ = Lens.create (fun a -> a.Int2) (fun s a -> {a with Int2 = s})
let projectPath_ = Lens.create (fun a -> a.ProjectPath) (fun s a -> {a with ProjectPath = s})
let memorySetup_ = Lens.create (fun a -> a.MemorySetup) (fun s a -> {a with MemorySetup = s})
let memoryEditorData_ = Lens.create (fun a -> a.MemoryEditorData) (fun s a -> {a with MemoryEditorData = s})
let progress_ = Lens.create (fun a -> a.Progress) (fun s a -> {a with Progress = s})
let constraintTypeSel_ = Lens.create (fun a -> a.ConstraintTypeSel) (fun s a -> {a with ConstraintTypeSel = s})
let constraintIOSel_ = Lens.create (fun a -> a.ConstraintIOSel) (fun s a -> {a with ConstraintIOSel = s})
let constraintErrorMsg_ = Lens.create (fun a -> a.ConstraintErrorMsg) (fun s a -> {a with ConstraintErrorMsg = s})
let newConstraint_ = Lens.create (fun a -> a.NewConstraint) (fun s a -> {a with NewConstraint = s})
let algebraInputs_ = Lens.create (fun a -> a.AlgebraInputs) (fun s a -> {a with AlgebraInputs = s})
let algebraError_ = Lens.create (fun a -> a.AlgebraError) (fun s a -> {a with AlgebraError = s})
let verilogCode_ = Lens.create (fun a -> a.VerilogCode) (fun s a -> {a with VerilogCode = s})
let verilogErrors_ = Lens.create (fun a -> a.VerilogErrors) (fun s a -> {a with VerilogErrors = s})
let badLabel_ = Lens.create (fun a -> a.BadLabel) (fun s a -> {a with BadLabel = s})
let intlist_ = Lens.create (fun a -> a.IntList) (fun s a -> {a with IntList = s})
let intlist2_ = Lens.create (fun a -> a.IntList2) (fun s a -> {a with IntList2 = s})

type TopMenu = | Closed | Project | Files

//==========//
// Messages //
//==========//



// Messages that will be triggered on key combinations.
type KeyboardShortcutMsg =
    | CtrlS | AltC | AltV | AltZ | AltShiftZ | DEL

type UICommandType =
    | CloseProject
    | ChangeSheet
    | RenameSheet
    | ImportSheet
    | DeleteSheet
    | AddSheet
    | SaveSheet
    | StartWaveSim
    | ViewWaveSim
    | CloseWaveSim
    
//---------------------------------------------------------------
//---------------------WaveSim types-----------------------------
//---------------------------------------------------------------

/// Determines whether the user is able to see the wave viewer pane.
/// Changes value depending on the state of the circuit and whether
/// the wave simulator has been run.
type WaveSimState =
    /// If the Wave Sim has not been before
    | Empty
    /// If no project is open
    | NoProject
    /// If there is an error in the circuit diagram
    | SimError of SimulationError
    /// If there is no sequential (clocked) logic in the circuit
    | NonSequential
    /// While waiting for the fast simulator to finish running
    | Loading
    /// If there are no errors in the circuit diagram
    | Success
    /// if waveSim has been explicitly ended
    | Ended

/// Identifies which Component and Port drives a waveform.
/// Must be an Output port (Input ports cannot drive waveforms).
type DriverT = {
    DriverId: FComponentId
    Port: OutputPortNumber
}

/// Information required to display a waveform.
type Wave = {
    /// Uniquely identifies a waveform
    WaveId: WaveIndexT
    /// First cycle displayed
    StartCycle: int
    /// Number of cycles displayed
    ShownCycles: int
    /// width of one cycle: TODO - remove this and stretch SVGs to fit
    CycleWidth: float
    /// radix of waveform numbers
    Radix: NumberBase
    /// unique within design sheet (SheetId)
    /// [] for top-level waveform: path to sheet
    /// Currently unused.
    SheetId: ComponentId list
    SubSheet: string list // SheetId mapped to custom component names
    /// Wires connected to this waveform. Used to highlight wires
    /// when hovering over wave label.
    Conns: ConnectionId list
    /// Name shown in the waveform viewer. Not guaranteed to be unique.
    DisplayName: string
    /// Number of bits in wave
    ViewerDisplayName: string
    CompLabel: string
    PortLabel: string
    /// width of the waveform's bus
    Width: int
    /// Array indexed by clock cycle to show value of wave.
    WaveValues: IOArray
    /// SVG of waveform
    SVG: IView option
}

/// Contains all information required by waveform simulator.
/// One WaveSimModel per sheet.
type WaveSimModel = {
    /// Current state of WaveSimModel.
    State: WaveSimState
    /// Top-level sheet for current waveform simulation: copy of model.WaveSimSheet when simulation is running
    TopSheet: string
    /// Copy of all sheets used with reduced canvasState as simulated
    Sheets: Map<string,CanvasState>
    /// Map of all simulatable waves
    AllWaves: Map<WaveIndexT, Wave>
    /// List of which waves are currently visible in the waveform viewer.
    SelectedWaves: WaveIndexT list
    /// Left-most visible clock cycle.
    StartCycle: int
    /// Total number of visible clock cycles.
    ShownCycles: int
    /// Current highlighted clock cycle.
    CurrClkCycle: int
    /// If the user is typing a clock cycle in but erases the contents of the box.
    ClkCycleBoxIsEmpty: bool
    /// Radix in which values are being displayed in the wave simulator.
    Radix: NumberBase
    /// Width of the waveform column.
    WaveformColumnWidth: float
    /// TODO: Should this be refactored into an ActiveModal type option?
    /// If the wave selection modal is visible.
    WaveModalActive: bool
    /// If the ram selection modal is visible.
    RamModalActive: bool
    /// List of RAM components on the sheet.
    RamComps: FastComponent list
    /// Map of which RAM components have been selected.
    SelectedRams: Map<FComponentId, string>
    /// FastSimulation used in the wave simulator.
    FastSim: FastSimulation
    /// String which the user is searching the list of waves by.
    SearchString: string
    /// What is shown in wave sim sheet detail elements
    ShowSheetDetail: Set<string list>
    /// What is shown in wave sim component detail elements
    ShowComponentDetail: Set<FComponentId>
    /// What is shown in wave sim group detail elements
    ShowGroupDetail: Set<ComponentGroup * string list>    /// The label which a user is hovering over.
    HoveredLabel: WaveIndexT option
    /// The index of the wave which the user is dragging.
    DraggedIndex: WaveIndexT option
    /// The value of SelectedWaves when the user started dragging a label.
    /// Used to restore SelectedWaves if the user drops a label in an illegal location.
    PrevSelectedWaves: WaveIndexT list option
}



type DiagEl = | Comp of Component | Conn of Connection

type DragMode = DragModeOn of int | DragModeOff

type IntMode = FirstInt | SecondInt

type MenuCommand =
    | MenuPrint
    | MenuSaveFile
    | MenuSaveProjectInNewFormat
    | MenuNewFile
    | MenuExit
    | MenuZoom of float
    | MenuVerilogOutput
    | MenuLostFocus

type SimulationProgress =
    {
        InitialClock: int
        FinalClock: int
        ClocksPerChunk: int       
    }

type PopupProgress =
    {
        Value: int
        Max: int
        Title: string
        Speed: float
    }
    
type TTMsg =
    | GenerateTruthTable of option<Result<SimulationData,SimulationError> * CanvasState>
    | RegenerateTruthTable
    | FilterTruthTable
    | SortTruthTable
    | DCReduceTruthTable
    | HideTTColumns
    | CloseTruthTable
    | ClearInputConstraints
    | ClearOutputConstraints
    | AddInputConstraint of Constraint
    | AddOutputConstraint of Constraint
    | DeleteInputConstraint of Constraint
    | DeleteOutputConstraint of Constraint
    | ToggleHideTTColumn of CellIO
    | ClearHiddenTTColumns
    | ClearDCMap
    | SetTTSortType of (CellIO * SortType) option
    | MoveColumn of (CellIO * MoveDirection)
    | SetIOOrder of CellIO []
    | SetTTAlgebraInputs of SimulationIO list
    | SetTTBase of NumberBase
    | SetTTGridCache of IView option
    | TogglePopupAlgebraInput of (SimulationIO * SimulationData)
    | SetPopupInputConstraints of ConstraintSet option
    | SetPopupOutputConstraints of ConstraintSet option
    | SetPopupConstraintTypeSel of ConstraintType option
    | SetPopupConstraintIOSel of CellIO option
    | SetPopupConstraintErrorMsg of string option
    | SetPopupNewConstraint of Constraint option
    | SetPopupAlgebraInputs of SimulationIO list option
    | SetPopupAlgebraError of SimulationError option

type Msg =
    | ShowExitDialog
    | Sheet of DrawModelType.SheetT.Msg
    | UpdateUISheetTrail of (string list -> string list)
    | SheetBackAction of (Msg -> unit)
    | SynchroniseCanvas
    | JSDiagramMsg of JSDiagramMsg
    | KeyboardShortcutMsg of KeyboardShortcutMsg
    | Benchmark
    | StartSimulation of Result<SimulationData, SimulationError>
    /// Add WaveSimModel to Model.WaveSim map.
    /// String is name of current sheet.
    | AddWSModel of (string * WaveSimModel)
    /// Update the WaveSimModel of the current sheet.
    | SetWSModel of WaveSimModel
    /// Update the WaveSimModel of the specified sheet from update function
    | UpdateWSModel of (WaveSimModel -> WaveSimModel)
    /// Set the current WaveSimModel to the specified sheet
    /// and update the WaveSimModel of the specified sheet.
    | SetWSModelAndSheet of WaveSimModel * string
    /// Generate waveforms according to the current parameters
    /// of the given WaveSimModel
    | GenerateWaveforms of WaveSimModel
    /// Generate waveforms according to the model paramerts of Wavesim
    | GenerateCurrentWaveforms 
    /// Run, or rerun, the FastSimulation with the current state of the Canvas.
    | RefreshWaveSim of WaveSimModel
    /// Sets or clears ShowSheetDetail (clearing will remove all child values in the set)
    | SetWaveSheetSelectionOpen of (string list list * bool)
    /// Sets or clears ShowComponentDetail
    | SetWaveComponentSelectionOpen of (FComponentId list * bool)
    /// Sets or clears GroupDetail
    | SetWaveGroupSelectionOpen of ((ComponentGroup * string list) list * bool)
    | LockTabsToWaveSim
    | UnlockTabsFromWaveSim
    | TryStartSimulationAfterErrorFix of SimSubTab
    | SetSimulationGraph of SimulationGraph  * FastSimulation
    | SetSimulationBase of NumberBase
    | IncrementSimulationClockTick of int
    | EndSimulation
    /// Clears the Model.WaveSim and Model.WaveSimSheet fields.
    | EndWaveSim
    | TruthTableMsg of TTMsg // all the messages used by the truth table code
    | ChangeRightTab of RightTab
    | ChangeSimSubTab of SimSubTab
    | SetHighlighted of ComponentId list * ConnectionId list
    | SetSelWavesHighlighted of ConnectionId array
    | SetClipboard of CanvasState
    | SetCreateComponent of Component
    | SetProject of Project
    | UpdateProject of (Project -> Project)
    | UpdateModel of (Model -> Model)
    | UpdateImportDecisions of Map<string, ImportDecision option>
    | UpdateProjectWithoutSyncing of (Project->Project)
    | ShowPopup of ((Msg -> Unit) -> Model -> IView)
    | ShowStaticInfoPopup of (string * IView * (Msg -> Unit))
    | ClosePopup
    | SetPopupDialogText of string option
    | SetPopupDialogBadLabel of bool
    | SetPopupDialogCode of string option
    | SetPopupDialogVerilogErrors of ErrorInfo list
    | SetPopupDialogInt of int option
    | SetPopupDialogInt2 of int64 option
    | SetPopupDialogTwoInts of (int64 option * IntMode * string option)
    | SetPopupDialogIntList of int list option
    | SetPopupDialogIntList2 of int list option
    | SetPropertiesExtraDialogText of string option
    | SetPopupDialogMemorySetup of (int * int * InitMemData * string option) option
    | SetPopupMemoryEditorData of MemoryEditorData option
    | SetPopupProgress of PopupProgress option
    | UpdatePopupProgress of (PopupProgress -> PopupProgress)
    | SimulateWithProgressBar of SimulationProgress
    | SetSelectedComponentMemoryLocation of int64 * int64
    | CloseDiagramNotification
    | SetSimulationNotification of ((Msg -> unit) -> IView)
    | CloseSimulationNotification
    | CloseWaveSimNotification
    | SetFilesNotification of ((Msg -> unit) -> IView)
    | CloseFilesNotification
    | SetMemoryEditorNotification of ((Msg -> unit) -> IView)
    | CloseMemoryEditorNotification
    | SetPropertiesNotification of ((Msg -> unit) -> IView)
    | ClosePropertiesNotification
    | SetTopMenu of TopMenu
    | ReloadSelectedComponent of int
    | SetDragMode of DragMode
    | ChangeBuildTabVisibility
    /// Set width of right-hand pane when tab is WaveSimulator or TruthTable
    | SetViewerWidth of int
    | MenuAction of MenuCommand * (Msg -> unit)
    | DiagramMouseEvent
    | SelectionHasChanged
    | SetIsLoading of bool
    | SetRouterInteractive of bool
    | CloseApp
    | SetExitDialog of bool
    | ExecutePendingMessages of int
    | DoNothing
    | StartUICmd of UICommandType
    | FinishUICmd
    | ReadUserData of string
    | SetUserData of UserData
    | SetThemeUserData of DrawModelType.SymbolT.ThemeType
    | ExecCmd of Elmish.Cmd<Msg>
    | ExecFuncInMessage of (Model -> (Msg->Unit) -> Unit) * (Msg -> Unit)
    | ExecFuncAsynch of (Unit -> Elmish.Cmd<Msg>)
    | ExecCmdAsynch of Elmish.Cmd<Msg>
    | SendSeqMsgAsynch of seq<Msg>
    | ContextMenuAction of e: Input.PointerEventArgs * dispatch: (Msg -> unit)
    | ContextMenuItemClick of menuType:string * item:string * dispatch: (Msg -> unit)
    
//================================//
// Componenents loaded from files //
//================================//


type Notifications = {
    FromDiagram : ((Msg -> unit) -> IView) option
    FromSimulation : ((Msg -> unit) -> IView) option
    FromWaveSim : ((Msg -> unit) -> IView) option
    FromFiles : ((Msg -> unit) -> IView) option
    FromMemoryEditor : ((Msg -> unit) -> IView) option
    FromProperties : ((Msg -> unit) -> IView) option
}

let fromDiagram_ = Lens.create (fun n -> n.FromDiagram) (fun s n -> {n with FromDiagram = s})
let fromSimulation_ = Lens.create (fun n -> n.FromSimulation) (fun s n -> {n with FromSimulation = s})
let fromWaveSim_ = Lens.create (fun n -> n.FromWaveSim) (fun s n -> {n with FromWaveSim = s})
let fromFiles_ = Lens.create (fun n -> n.FromFiles) (fun s n -> {n with FromFiles = s})
let fromMemoryEditor_ = Lens.create (fun n -> n.FromMemoryEditor) (fun s n -> {n with FromMemoryEditor = s})
let fromProperties_ = Lens.create (fun n -> n.FromProperties) (fun s n -> {n with FromProperties = s})

type UserData = {
    /// Where to save the persistent app data
    UserAppDir : string option
    LastUsedDirectory: string option
    RecentProjects: string list option
    ArrowDisplay: bool
    WireType: DrawModelType.BusWireT.WireType
    Theme: DrawModelType.SymbolT.ThemeType
    }
type SpinnerState =
   | WaveSimSpinner

type SpinPayload = {
    Payload: Model -> Model
    Name: string
    ToDo: int
    Total: int
    }

type TTType = {
    /// bits associated with the maximum number of input rows allowed in a Truth Table
    BitLimit: int
    /// input constraints on truth table generation
    InputConstraints: ConstraintSet
    /// output constraints on truth table viewing
    OutputConstraints: ConstraintSet
    /// which output or viewer columns in the Truth Table should be hidden
    HiddenColumns: CellIO list
    /// by which IO and in what way is the Table being sorted
    SortType: (CellIO * SortType) option
    /// what is the display order of IOs in Table
    IOOrder: CellIO []
    /// Grid Styles for each column in the Table
    GridStyles: Map<CellIO,string list>
    /// Cached CSS Grid for displaying the Truth Table
    GridCache: IView option
    /// which of the Truth Table's inputs are currently algebra
    AlgebraIns: SimulationIO list
}
let gridStyles_ = Lens.create (fun a -> a.GridStyles) (fun s a -> {a with GridStyles = s})
let ioOrder_ = Lens.create (fun a -> a.IOOrder) (fun s a -> {a with IOOrder = s})
let inputConstraints_ = Lens.create (fun a -> a.InputConstraints) (fun s a -> {a with InputConstraints = s})
let outputConstraints_ = Lens.create (fun a -> a.OutputConstraints) (fun s a -> {a with OutputConstraints = s})
let hiddenColumns_ = Lens.create (fun a -> a.HiddenColumns) (fun s a -> {a with HiddenColumns = s})
let sortType_ = Lens.create (fun a -> a.SortType) (fun s a -> {a with SortType = s})
let algebraIns_ = Lens.create (fun a -> a.AlgebraIns) (fun s a -> {a with AlgebraIns = s})
let gridCache_ = Lens.create (fun a -> a.GridCache) (fun s a -> {a with GridCache = s})

// TODO following attribute in model not implemented yet    
(*/// If the application has a modal spinner waiting for simulation
Spinner: (Model -> Model) option
/// style info for the truth table
TTConfig: TTType
/// function to create popup pane if present
PopupViewFunc : ((Msg -> Unit) -> Model -> Fable.React.ReactElement) option
/// function to create spinner popup pane if present (overrides otehr popups)
SpinnerPayload : SpinPayload option 
/// record containing functions that create react elements of notifications
Notifications : Notifications
/// State of menus for sheets, projects etc
TopMenuOpenState : TopMenu*)


[<CustomEquality; NoComparison>]
type Model = {
    UserData: UserData
    WaveSim : Map<string, WaveSimModel>
    WaveSimSheet: string option
    UISheetTrail: string list
    Sheet: DrawModelType.SheetT.Model
    IsLoading: bool
    LastChangeCheckTime: float
    LastSimulatedCanvasState: CanvasState option
    LastDetailedSavedState: CanvasState
    CurrentSelected: Component list * Connection list
    LastSelectedIds: string list * string list
    LastUsedDialogWidth: int
    SelectedComponent : Component option
    CurrentStepSimulationStep : Result<SimulationData,SimulationError> option
    CurrentTruthTable: Result<TruthTable,SimulationError> option
    RightPaneTabVisible : RightTab
    SimSubTabVisible: SimSubTab
    Hilighted : (ComponentId list * ConnectionId list) * ConnectionId list
    Clipboard : CanvasState
    LastCreatedComponent : Component option
    SavedSheetIsOutOfDate : bool
    CurrentProj : Project option
    PopupDialogData : PopupDialogData
    DividerDragMode: DragMode
    WaveSimViewerWidth: int
    ConnsOfSelectedWavesAreHighlighted: bool
    Pending: Msg list
    UIState: UICommandType Option
    BuildVisible: bool
} with
    override this.Equals(other) =
        match other with
        | :? Model as m ->
            this.UserData = m.UserData &&
            this.WaveSim = m.WaveSim &&
            this.WaveSimSheet = m.WaveSimSheet &&
            this.UISheetTrail = m.UISheetTrail &&
            this.Sheet = m.Sheet &&
            this.IsLoading = m.IsLoading &&
            this.LastChangeCheckTime = m.LastChangeCheckTime &&
            this.LastSimulatedCanvasState = m.LastSimulatedCanvasState &&
            this.LastDetailedSavedState = m.LastDetailedSavedState &&
            this.CurrentSelected = m.CurrentSelected &&
            this.LastSelectedIds = m.LastSelectedIds &&
            this.LastUsedDialogWidth = m.LastUsedDialogWidth &&
            this.SelectedComponent = m.SelectedComponent &&
            this.CurrentStepSimulationStep = m.CurrentStepSimulationStep &&
            this.CurrentTruthTable = m.CurrentTruthTable &&
            this.RightPaneTabVisible = m.RightPaneTabVisible &&
            this.SimSubTabVisible = m.SimSubTabVisible &&
            this.Hilighted = m.Hilighted &&
            this.Clipboard = m.Clipboard &&
            this.LastCreatedComponent = m.LastCreatedComponent &&
            this.SavedSheetIsOutOfDate = m.SavedSheetIsOutOfDate &&
            this.CurrentProj = m.CurrentProj &&
            this.PopupDialogData = m.PopupDialogData &&
            this.DividerDragMode = m.DividerDragMode &&
            this.WaveSimViewerWidth = m.WaveSimViewerWidth &&
            this.ConnsOfSelectedWavesAreHighlighted = m.ConnsOfSelectedWavesAreHighlighted &&
            this.UIState = m.UIState &&
            this.BuildVisible = m.BuildVisible
        | _ -> false

    override this.GetHashCode() =
        hash (this.UserData, this.WaveSim, this.WaveSimSheet, this.UISheetTrail, this.Sheet, this.IsLoading,
              this.LastChangeCheckTime, this.LastSimulatedCanvasState, this.LastDetailedSavedState,
              this.CurrentSelected, this.LastSelectedIds, this.LastUsedDialogWidth, this.SelectedComponent,
              this.CurrentStepSimulationStep, this.CurrentTruthTable, this.RightPaneTabVisible,
              this.SimSubTabVisible, this.Hilighted, this.Clipboard, this.LastCreatedComponent,
              this.SavedSheetIsOutOfDate, this.CurrentProj, this.PopupDialogData, this.DividerDragMode,
              this.WaveSimViewerWidth, this.ConnsOfSelectedWavesAreHighlighted, this.UIState, this.BuildVisible)
    member this.WaveSimOrCurrentSheet =
        match this.WaveSimSheet, this.CurrentProj with
        | None, Some {OpenFileName = name} -> name
        | Some name, _ -> name
        | None, None -> failwithf "What? Project is not open cannot guess sheet!"

let waveSimSheet_ = Lens.create (fun a -> a.WaveSimSheet) (fun s a -> {a with WaveSimSheet = s})
let waveSim_ = Lens.create (fun a -> a.WaveSim) (fun s a -> {a with WaveSim = s})
let rightPaneTabVisible_ = Lens.create (fun a -> a.RightPaneTabVisible) (fun s a -> {a with RightPaneTabVisible = s})
let simSubTabVisible_ = Lens.create (fun a -> a.SimSubTabVisible) (fun s a -> {a with SimSubTabVisible = s})
let buildVisible_ = Lens.create (fun a -> a.BuildVisible) (fun s a -> {a with BuildVisible = s})
(*
let popupViewFunc_ = Lens.create (fun a -> a.PopupViewFunc) (fun s a -> {a with PopupViewFunc = s})
*)

let sheet_ = Lens.create (fun a -> a.Sheet) (fun s a -> {a with Sheet = s})
// let tTType_ = Lens.create (fun a -> a.TTConfig) (fun s a -> {a with TTConfig = s})
let currentStepSimulationStep_ = Lens.create (fun a -> a.CurrentStepSimulationStep) (fun s a -> {a with CurrentStepSimulationStep = s})
let currentTruthTable_ = Lens.create (fun a -> a.CurrentTruthTable) (fun s a -> {a with CurrentTruthTable = s})
let popupDialogData_ = Lens.create (fun a -> a.PopupDialogData) (fun p a -> {a with PopupDialogData = p})
let selectedComponent_ = Lens.create (fun a -> a.SelectedComponent) (fun s a -> {a with SelectedComponent = s})
let userData_ = Lens.create (fun a -> a.UserData) (fun s a -> {a with UserData = s})
let uISheetTrail_ = Lens.create (fun a -> a.UISheetTrail) (fun s a -> {a with UISheetTrail = s})


let currentProj_ = Lens.create (fun a -> a.CurrentProj) (fun s a -> {a with CurrentProj = s})
let openLoadedComponentOfModel_ = currentProj_ >-> Optics.Option.value_ >?> openLoadedComponent_
(*
let notifications_ = Lens.create (fun a -> a.Notifications) (fun s a -> {a with Notifications = s})
*)
let project_ = Lens.create (fun a -> Option.get (a.CurrentProj)) (fun s a -> {a with CurrentProj = Some s})
let projectOpt_ = Prism.create (fun a -> a.CurrentProj) (fun s a -> {a with CurrentProj =  a.CurrentProj |> Option.map (fun _ -> s)})
let ldcM = project_ >-> loadedComponents_
let ldcOptM = projectOpt_ >?> loadedComponents_
let nameM = project_ >-> openFileName_
let nameOptM = projectOpt_ >?> openFileName_




