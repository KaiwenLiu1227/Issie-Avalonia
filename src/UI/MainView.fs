module MainView

open Avalonia.Controls
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media

open ModelType
open DrawModelType
open TopMenuView
open CatalogueView
open UIPopups


let init () =
    {
      (*SpinnerPayload = None
        Spinner = None*)
      UISheetTrail = []
      UserData =
        { WireType = BusWireT.Radial
          ArrowDisplay = true
          UserAppDir = None
          LastUsedDirectory = None
          RecentProjects = None
          Theme = SymbolT.ThemeType.Colourful }
      LastChangeCheckTime = 0.
      // Diagram = new Draw2dWrapper()
      Sheet = fst (SheetUpdate.init ())
      IsLoading = false
      LastDetailedSavedState = ([], [])
      LastSimulatedCanvasState = None
      LastSelectedIds = [], []
      CurrentSelected = [], []
      SelectedComponent = None
      LastUsedDialogWidth = 1
      (*CurrentStepSimulationStep = None
        CurrentTruthTable = None
        TTConfig = TruthTableUpdate.tTTypeInit*)
      WaveSim = Map.empty
      WaveSimSheet = None
      RightPaneTabVisible = Catalogue
      SimSubTabVisible = StepSim
      CurrentProj = None
      Hilighted = ([], []), []
      Clipboard = [], []
      LastCreatedComponent = None
      SavedSheetIsOutOfDate = false
      (*
        PopupViewFunc = None
        PopupDialogData = {
            ProjectPath = ""
            Text = None
            ImportDecisions = Map.empty
            Int = None
            Int2 = None
            MemorySetup = None
            MemoryEditorData = None
            Progress = None
            ConstraintTypeSel = None
            ConstraintIOSel = None
            ConstraintErrorMsg = None
            NewConstraint = None
            AlgebraInputs = None
            AlgebraError = None
            VerilogCode = None
            VerilogErrors = []
            BadLabel = false
            IntList = None
            IntList2 = None
        }
        Notifications = {
            FromDiagram = None
            FromSimulation = None
            FromWaveSim = None
            FromFiles = None
            FromMemoryEditor = None
            FromProperties = None
        }
        TopMenuOpenState = Closed*)
      DividerDragMode = DragModeOff
      WaveSimViewerWidth = 0
      ConnsOfSelectedWavesAreHighlighted = false
      (*
        Pending = []
        *)
      UIState = None
      BuildVisible = false }

let viewRightTabs canvasState model dispatch =
    DockPanel.create
        [ DockPanel.dock Dock.Right
          DockPanel.lastChildFill true
          DockPanel.children
              [
                Border.create
                    [ Border.borderThickness 2.0
                      Border.borderBrush (SolidColorBrush(Color.FromArgb(75uy, 0uy, 0uy, 0uy)))
                      Border.padding 10.0
                      Border.width 350
                      Border.child (
                          StackPanel.create
                              [ StackPanel.children
                                    [
                                    Menu.create
                                          [Menu.viewItems
                                                [ MenuItem.create [ MenuItem.header "Catalogue" ]
                                                  MenuItem.create [ MenuItem.header "Properties" ]
                                                  MenuItem.create [ MenuItem.header "Simulation" ] ] ]
                                    CatalogueView.viewCatalogue model dispatch
                                    ]
                                ]
                      ) ] ] ]

let view model dispatch =
    let sheetDispatch sMsg = dispatch (Sheet sMsg)
    let conns = BusWire.extractConnections model.Sheet.Wire
    let comps = SymbolUpdate.extractComponents model.Sheet.Wire.Symbol
    let canvasState = comps,conns  
    Grid.create
        [ Grid.children
              [
                // Your main content here
                DockPanel.create
                    [ DockPanel.children
                          [ viewRightTabs canvasState model dispatch 
                            topMenuView model dispatch
                            SheetDisplay.view model.Sheet 50.0 [] sheetDispatch ] ]
                // Overlay
                overlayView model dispatch ] ]
    |> generalize
