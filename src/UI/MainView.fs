module DiagramMainView

open Avalonia.Controls
open Avalonia.FuncUI
open Avalonia.FuncUI.DSL
open Avalonia.Media

open ModelType
open DrawModelType
open TopMenuView
open CatalogueView
open SimulationView
open UIPopups
open ContextMenu


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
      CurrentStepSimulationStep = None
      CurrentTruthTable = None
      (*TTConfig = TruthTableUpdate.tTTypeInit*)
      WaveSim = Map.empty
      WaveSimSheet = None
      RightPaneTabVisible = Catalogue
      SimSubTabVisible = StepSim
      CurrentProj = None
      Hilighted = ([], []), []
      Clipboard = [], []
      LastCreatedComponent = None
      SavedSheetIsOutOfDate = false
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
      TopMenuOpenState = Closed
      DividerDragMode = DragModeOff
      WaveSimViewerWidth = 0
      ConnsOfSelectedWavesAreHighlighted = false
      (*
        Pending = []
        *)
      UIState = None
      BuildVisible = false }

// -- Create View

let viewSimSubTab canvasState model dispatch =
    match model.SimSubTabVisible with
    | StepSim -> 
        SimulationView.viewSimulation canvasState model dispatch
    | _ ->
        StackPanel.create[]
        
    (*| TruthTable ->
        div [ Style [Width "90%"; MarginLeft "5%"; MarginTop "15px" ] ] [
            Heading.h4 [] [ str "Truth Tables" ]
            TruthTableView.viewTruthTable canvasState model dispatch
        ]
    | WaveSim -> 
        div [ Style [Width "100%"; Height "calc(100% - 72px)"; MarginTop "15px" ] ]
            [ viewWaveSim canvasState model dispatch ]*)

/// Display the content of the right tab.
let private  viewRightTab canvasState model dispatch =
    let pane = model.RightPaneTabVisible
    match pane with
    | Catalogue | Transition ->
        CatalogueView.viewCatalogue model dispatch        
        (*div [ Style [Width "90%"; MarginLeft "5%"; MarginTop "15px" ; Height "calc(100%-100px)"] ] [
            Heading.h4 [] [ str "Catalogue" ]
            div [ Style [ MarginBottom "15px" ; Height "100%"; OverflowY OverflowOptions.Auto] ] 
                [ str "Click on a component to add it to the diagram. Hover on components for details." ]
            CatalogueView.viewCatalogue model dispatch
        ]*)
    (*
    | Properties ->
        div [ Style [Width "90%"; MarginLeft "5%"; MarginTop "15px" ] ] [
            Heading.h4 [] [ str "Component properties" ]
            SelectedComponentView.viewSelectedComponent model dispatch
        ]
        *)

    | Simulation ->
        let subtabs =
            Menu.create
                  [ Menu.viewItems
                        [ MenuItem.create
                              [ MenuItem.header "Step Simulation"
                                MenuItem.onClick (fun _ -> dispatch <| ChangeSimSubTab StepSim) ]
                          MenuItem.create
                              [ MenuItem.header "Sruth Tables"]
                          MenuItem.create
                              [ MenuItem.header "Wave Simulation" ] ] ]
        StackPanel.create [
            StackPanel.children [
                subtabs
                viewSimSubTab canvasState model dispatch
            ]
        ]

            
    (*| Build ->
        div [ Style [Width "90%"; MarginLeft "5%"; MarginTop "15px" ] ] [
            Heading.h4 [] [ str "Build" ]
            div [ Style [ MarginBottom "15px" ] ] [ str "Compile your design and upload it to one of the supported devices" ]
            BuildView.viewBuild model dispatch
        ]*)


let viewRightTabs canvasState model dispatch =
    /// Hack to avoid scrollbar artifact changing from Simulation to Catalog
    /// The problem is that the HTML is bistable - with Y scrollbar on the catalog <aside> 
    /// moves below the tab body div due to reduced available width, keeping scrollbar on. 
    /// Not fully understood.
    /// This code temporarily switches the scrollbar off during the transition.
    (*
    let scrollType = 
        if model.RightPaneTabVisible = Transition then 
            dispatch <| ChangeRightTab Catalogue // after one view in transition it is OK to go to Catalogue
            OverflowOptions.Clip // ensure no scrollbar temporarily after the transition
        else 
            OverflowOptions.Auto
            
    
    let buildTab =
        if model.BuildVisible then
            Tabs.tab
                [ Tabs.Tab.IsActive (model.RightPaneTabVisible = Build)]
                [ a [  OnClick (fun _ -> 
                        if model.RightPaneTabVisible <> Simulation 
                        then
                            dispatch <| ChangeRightTab Build ) 
                    ] [str "Build"] ]
        else
            null*)
            
    DockPanel.create
        [ DockPanel.dock Dock.Right
          DockPanel.zIndex 1
          DockPanel.background "white"
          DockPanel.lastChildFill true
          DockPanel.children
              [ Border.create
                    [ Border.borderThickness 1.0
                      Border.borderBrush (SolidColorBrush(Color.FromArgb(75uy, 0uy, 0uy, 0uy)))
                      Border.width 350
                      Border.child (
                          StackPanel.create
                              [ StackPanel.children
                                    [ Menu.create
                                          [ Menu.borderThickness 1.0
                                            Menu.borderBrush (SolidColorBrush(Color.FromArgb(75uy, 0uy, 0uy, 0uy))) 
                                            Menu.viewItems
                                                [ MenuItem.create
                                                      [ MenuItem.header "Catalogue"
                                                        MenuItem.onClick (fun _ -> dispatch <| ChangeRightTab Catalogue) ]
                                                  MenuItem.create
                                                      [ MenuItem.header "Properties"
                                                        MenuItem.onClick (fun _ ->
                                                            dispatch <| ChangeRightTab Properties) ]
                                                  MenuItem.create
                                                      [ MenuItem.header "Simulation"
                                                        MenuItem.onClick (fun _ ->
                                                            dispatch <| ChangeRightTab Simulation) ] ] ]
                                      // buildTab
                                      viewRightTab canvasState model dispatch
                                      ] ]
                      ) ] ] ]

let displayView model dispatch =
    let sheetDispatch sMsg = dispatch (Sheet sMsg)
    let conns = BusWire.extractConnections model.Sheet.Wire
    let comps = SymbolUpdate.extractComponents model.Sheet.Wire.Symbol
    let canvasState = comps, conns

    Grid.create
        [ Grid.children
              [
                // Your main content here
                DockPanel.create
                    [
                        DockPanel.contextMenu (
                            ContextMenus.makeTestContextMenu dispatch
                        )
                        DockPanel.children
                          [ viewRightTabs canvasState model dispatch
                            topMenuView model dispatch
                            SheetDisplay.view model.Sheet 50.0 [] sheetDispatch ] ]
                // Overlay
                overlayView model dispatch ] ]
    |> generalize
