module MenuHelpers
open EEExtensions
open Helpers
open ModelType
open CommonTypes
open FilesIO
open Extractor
open DrawModelType
open Sheet.SheetInterface
open ModelHelpers
open Optics
open Optics.Operators
open System

module Constants =
    let minGoodAppWidth = 1250.
    let minAppWidth = 1060.
    let typicalAppWidth = 1600.

    let numberOfRecentProjects: int  = 5
    let maxDisplayedPathLengthInRecentProjects: int  = 60
    /// canvas width < this => use fewer chars in path
    let largeScreenCanvasWidth = 1000
    /// max number of chars in path before cropping
    let maxNumPathChars = 25
    /// min number of chars in path before cropping
    let minNumPathChars = 7
    // NB if numCharsHidePath > minNumPathChars than path is either full-size or hidden
    let numCharsHidePath = 10
    


/// Send messages to change Diagram Canvas and specified sheet waveSim in model
let private loadStateIntoModel (finishUI:bool) (compToSetup:LoadedComponent) _ ldComps (model:Model) dispatch =
    // it seems still need this, however code has been deleted!
    //Sheet.checkForTopMenu () // A bit hacky, but need to call this once after everything has loaded to compensate mouse coordinates.
    let ldcs = tryGetLoadedComponents model
    let name = compToSetup.Name
    let components, connections = compToSetup.CanvasState
    //printfn "Loading..."
    let msgs = 
        [
            (*
            SetHighlighted([], []) // Remove current highlights.
            *)
    
            // Clear the canvas.
            Sheet SheetT.ResetModel
            Sheet (SheetT.Wire BusWireT.ResetModel)
            Sheet (SheetT.Wire (BusWireT.Symbol (SymbolT.ResetModel ) ) )
    
            // Finally load the new state in the canvas.
            (*
            SetIsLoading true
            *)
            //printfn "Check 1..."
    
            //Load components
            Sheet (SheetT.Wire (BusWireT.Symbol (SymbolT.LoadComponents (ldcs,components ))))
    
            Sheet (SheetT.Wire (BusWireT.LoadConnections connections))

            Sheet SheetT.FlushCommandStack // Discard all undo/redo.
            // Run the a connection widths inference.
            //printfn "Check 4..."
    
            Sheet (SheetT.Wire (BusWireT.BusWidths))
            // JSdispatch <| InferWidths()
            //printfn "Check 5..."
            // Set no unsaved changes.

            Sheet SheetT.UpdateBoundingBoxes

            // set waveSim data
            (*
            AddWSModel (name, waveSim)
            *)

            // this message actually changes the project in model
            SetProject {
                ProjectPath = dirName compToSetup.FilePath
                OpenFileName =  compToSetup.Name
                WorkingFileName = Some compToSetup.Name
                LoadedComponents = ldComps
            }

            Sheet (SheetT.KeyPress  SheetT.KeyboardMsg.CtrlW)
            SynchroniseCanvas
            (*SetIsLoading false 
            if finishUI then FinishUICmd else DoNothing*)

            //printfn "Check 6..."
        ]
    //INFO - Currently the spinner will ALWAYS load after 'SetTopMenu x', probably it is the last command in a chain
    //Ideally it should happen before this, but it is not currently doing this despite the async call
    //This will set a spinner for both Open project and Change sheet which are the two most lengthly processes
    dispatch <| (Sheet (SheetT.SetSpinner true))
    (*
    dispatch <| SendSeqMsgAsynch msgs
    *)
    // msgs is bundled together and as a result a scroll from the ctrl-W scroll change is inserted in the event queue
    // after the ctrl-w. We need anotehr ctrl-w to make sure this scroll event does not reset scroll
    // the order in which messages get processed is problematic here - and the solution ad hoc - a better
    // solution would be to understand exactly what determines event order in the event queue
    dispatch <| Sheet (SheetT.KeyPress  SheetT.KeyboardMsg.CtrlW)
    dispatch SynchroniseCanvas
    //dispatch <| Sheet (SheetT.KeyPress  SheetT.KeyboardMsg.CtrlW)
    //dispatch SynchroniseCanvas    


let setupProjectFromComponents (finishUI:bool) (sheetName: string) (ldComps: LoadedComponent list) (model: Model) (dispatch: Msg->Unit)=
    let compToSetup =
        match ldComps with
        | [] -> failwithf "setupProjectComponents must be called with at least one LoadedComponent"
        | comps ->
            // load sheetName
            match comps |> List.tryFind (fun comp -> comp.Name = sheetName) with
            | None -> failwithf "What? can't find sheet %s in loaded sheets %A" sheetName (comps |> List.map (fun c -> c.Name))
            | Some comp -> comp
    match model.CurrentProj with
    | None -> ()
    (*| Some p ->
        dispatch EndSimulation // Message ends any running simulation.
        dispatch <|TruthTableMsg CloseTruthTable // Message closes any open Truth Table.
        //dispatch EndWaveSim
        // TODO: make each sheet wavesim remember the list of waveforms.*)
    
    let savedWaveSim = None
        (*compToSetup.WaveInfo
        |> Option.map loadWSModelFromSavedWaveInfo 
        |> Option.defaultValue initWSModel*)

    let waveSim = None
        (*model.WaveSimSheet
        |> Option.map (fun sheet -> (Map.tryFind sheet  model.WaveSim))
        |> Option.defaultValue None
        |> Option.defaultValue savedWaveSim*)
        
    loadStateIntoModel finishUI compToSetup waveSim ldComps model dispatch
    {
        ProjectPath = dirName compToSetup.FilePath
        OpenFileName =  compToSetup.Name
        WorkingFileName = Some compToSetup.Name
        LoadedComponents = ldComps
    }
    |> SetProject // this message actually changes the project in model
    |> dispatch
    dispatch SynchroniseCanvas


let quantifyChanges (ldc1:LoadedComponent) (ldc2:LoadedComponent) =
    let comps1,conns1 = ldc1.CanvasState
    let comps2,conns2 = ldc2.CanvasState
    let reduceComp comp1:Component =
        {comp1 with X=0;Y=0}
    let reduceConn conn1 =
        {conn1 with Vertices = []}
    /// Counts the number of unequal items in the two lists.
    /// Determine equality from whether reduce applied to each item is equal
    let unmatched reduce lst1 lst2 =
        let mapToSet = List.map reduce >> Set
        let rL1, rL2 = mapToSet lst1, mapToSet lst2
        Set.union (Set.difference rL1 rL2) (Set.difference rL2 rL1)
        |> Set.count
    unmatched reduceComp comps1 comps2, unmatched reduceConn conns1 conns2

let writeComponentToFile comp =
    let data =  stateToJsonString (comp.CanvasState,comp.WaveInfo,Some {Form=comp.Form;Description=comp.Description})
    writeFile comp.FilePath data
    
let rec resolveComponentOpenPopup 
        (pPath:string)
        (components: LoadedComponent list)  
        (resolves: LoadStatus list) 
        (model: Model)
        (dispatch: Msg -> Unit) =
    let chooseWhichToOpen comps =
        let onlyUserCreated = List.filter (fun comp -> match comp.Form with |Some User |None -> true |_ ->false) comps
        (List.maxBy (fun comp -> comp.TimeStamp) onlyUserCreated).Name
    (*
    dispatch ClosePopup
    *)
    match resolves with
    | [] -> setupProjectFromComponents false (chooseWhichToOpen components) components model dispatch
    | Resolve (ldComp,autoComp) :: rLst ->
        // ldComp, autocomp are from attemps to load saved file and its autosave version.
        let compChanges, connChanges = quantifyChanges ldComp autoComp
        let buttonAction autoSave _ =
            let comp = {(if autoSave then autoComp else ldComp) with TimeStamp = DateTime.Now}
            writeComponentToFile comp 
            resolveComponentOpenPopup pPath (comp :: components) rLst  model dispatch   
        // special case when autosave data is most recent
        let title = "Warning!"
        let message, color =
            match compChanges + connChanges with
            | 0 -> 
                sprintf "There were layout but no circuit changes made in sheet %s after your last save. \
                         There is an automatically saved version which is \
                         more uptodate. Do you want to keep the newer AutoSaved version or \
                         the older Saved version?"  ldComp.Name, "green"  
            | n when n < 3 ->   
                sprintf "Warning: %d component and %d connection changes were made to sheet '%s' after your last Save. \
                         There is an automatically saved version which is \
                         more uptodate. Do you want to keep the newer AutoSaved version or \
                         the older saved version?"  compChanges connChanges ldComp.Name, "orange"
            | n -> 
                sprintf "Warning: %d component and %d connection changes were made to sheet '%s' after your last Save. \
                         There is an automatically saved version which is \
                         more uptodate. Do you want to keep the newer AutoSaved version or \
                         the older saved version? This is a large change so the option you do not choose \
                         will be saved as file 'backup/%s.dgm'"  compChanges connChanges ldComp.Name ldComp.Name, "red"
        ()
    | OkAuto autoComp :: rLst ->
         let errMsg = "Could not load saved project file '%s' - using autosave file instead"
         (*
         displayFileErrorNotification errMsg dispatch
         *)
         resolveComponentOpenPopup pPath (autoComp::components) rLst model dispatch
    | OkComp comp ::rLst -> 
        resolveComponentOpenPopup pPath (comp::components) rLst model dispatch
        

