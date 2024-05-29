module TopMenuView

open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.Media
open Avalonia.FuncUI
open Avalonia.FuncUI.Types
open MenuHelpers
open FilesIO
open System
open EEExtensions
open Helpers
open ModelType
open ModelHelpers
open CommonTypes
open FilesIO
open Extractor
open DrawModelType
open Sheet.SheetInterface
open Optics
open Optics.Operators
open MenuHelpers


let loadDemoProject basename model dispatch =
    let newDir = ".\\demos\\" + basename

    let sourceDir = FilesIO.staticDir() + "/demos/" + basename
    printf "%s" $"loading demo {sourceDir} into {newDir}"

    ensureDirectory "./demos/"
    ensureDirectory newDir

    readFilesFromDirectory newDir
    |> List.iter (fun path -> unlink <| pathJoin[|newDir; path|])

    (*dispatch EndSimulation // End any running simulation.
    dispatch <| TruthTableMsg CloseTruthTable // Close any open Truth Table.
    dispatch EndWaveSim*)

    //let projectFile = baseName newDir + ".dprj"
    //writeFile (pathJoin [| newDir; projectFile |]) ""
    //|> displayAlertOnError dispatch

    let files = readFilesFromDirectory sourceDir

    let isNotDir path =
        hasExtn ".dgm" path || hasExtn ".txt" path || hasExtn ".ram" path

    // copy over files from source path to new path
    files
    |> List.filter isNotDir
    |> List.iter (fun basename ->
        let newPath = pathJoin [|newDir; basename|]
        copyFile (pathJoin [|sourceDir; basename|]) newPath)

    openDemoProjectFromPath newDir model dispatch

/// force either save of current file before action, or abort (closeProject is special case of this)
let doActionWithSaveFileDialog (name: string) (nextAction: Msg)  model dispatch _ =
    let closeDialogButtons keepOpen _ =
        if keepOpen then
            dispatch ClosePopup
        else
            dispatch nextAction

    if model.SavedSheetIsOutOfDate then 
        (*choicePopup 
                $"{name}?" 
                (div [] [ str "The current sheet has unsaved changes."])
                "Go back to sheet" 
                $"{name} without saving changes"  
                closeDialogButtons 
                dispatch
    else*)
        dispatch nextAction
        
/// open an existing project
let private openProject model dispatch topLevel=
    //trying to force the spinner to load earlier
    //doesn't really work right now
    // warnAppWidth dispatch (fun _ -> 
    dispatch (Sheet (SheetT.SetSpinner true))
    let dirName =
        match Option.map readFilesFromDirectory model.UserData.LastUsedDirectory with
        | Some [] | None -> None
        | _ -> model.UserData.LastUsedDirectory
    async {
        let! folder = askForExistingProjectPath dirName topLevel
        match folder with
        | None -> () // User gave no path.
        | Some path -> openProjectFromPath path model dispatch
    }    

let newProjectBtn model dispatch :IView=
    Component.create("newProject", fun ctx ->
        let topLevel = TopLevel.GetTopLevel(ctx.control)
        MenuItem.create
          [ MenuItem.header "New Project"
            MenuItem.onClick (fun _ -> 
                async {
                    do! (openProject model dispatch topLevel)
                } |> Async.StartImmediate
            )
            ]
    )
let importProjectBtn model dispatch :IView=
    Component.create("importProject", fun ctx ->
        let topLevel = TopLevel.GetTopLevel(ctx.control)
        MenuItem.create
          [ MenuItem.header "Import Project"
            MenuItem.onClick (fun _ -> 
                async {
                    do! (openProject model dispatch topLevel)
                } |> Async.StartImmediate
            )
            ]
    )

let topMenuView model dispatch =
    let fileTab model =
        match model.CurrentProj with
        | None ->
         MenuItem.create
            [ MenuItem.header "Sheet"]
        | Some project ->
        let updatedProject = getUpdatedLoadedComponents project model
        let updatedModel = {model with CurrentProj = Some updatedProject}

        let sTrees = getSheetTrees false updatedProject

        let allRoots = allRootSheets sTrees
        let isSubSheet sh = not <| Set.contains sh allRoots
        let openSheetAction  (sheet:SheetTree) dispatch =
            //printfn "Trying to open %s with %A" sheet.SheetName sheet.SheetNamePath
            dispatch (StartUICmd ChangeSheet)
            //printfn "Starting UI Cmd"
            dispatch <| ExecFuncInMessage(
                (fun model dispatch -> 
                    let p = Option.get model.CurrentProj
                    openFileInProject (sheet.SheetName) p model dispatch), dispatch)

        (*
        let sheetColor (sheet:SheetTree) =
            match sheet.SheetName = project.OpenFileName, sheetIsLocked sheet.SheetName updatedModel with
            | true, true -> IColor.IsCustomColor "pink"
            | true, false -> IColor.IsCustomColor "lightslategrey"
            | false, true -> IColor.IsDanger
            | false, false -> IColor.IsCustomColor "darkslategrey"
            *)

        let breadcrumbConfig =  {
            MiscMenuView.Constants.defaultConfig with
                ClickAction = openSheetAction
                BreadcrumbIdPrefix = "SheetMenuBreadcrumb"
            }
        let breadcrumbs = 
            MiscMenuView.allRootHierarchiesFromProjectBreadcrumbs breadcrumbConfig dispatch updatedModel

            
        MenuItem.create
          [ MenuItem.header "Sheet"
            MenuItem.viewItems
                ([ MenuItem.create [ MenuItem.header "New Sheet" ]
                   MenuItem.create [ MenuItem.header "Import Sheet" ]
                   MenuItem.create [ MenuItem.header "Sheet with Design Hierarchy" ]
                ] @ breadcrumbs)
          ]
    let saveBtn model =
        match model.CurrentProj with
        | None ->
            Button.create
              [
                  Button.content "Save"
              ]
        | Some project ->
        Button.create
          [
              Button.content "Save"
              Button.background "LightGreen"
              Button.onClick (fun _ -> 
                    dispatch (StartUICmd SaveSheet)
                    saveOpenFileActionWithModelUpdate model dispatch |> ignore
                    dispatch <| Sheet(SheetT.DoNothing) //To update the savedsheetisoutofdate send a sheet message
                    ) 
          ]
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
                        [
                          fileTab model
                          MenuItem.create
                              [ MenuItem.header "Project"
                                MenuItem.viewItems
                                    [
                                      newProjectBtn model dispatch
                                      MenuItem.create [ MenuItem.header "Import Project" ]
                                      MenuItem.create [ MenuItem.header "CLose Project" ]
                                      MenuItem.create
                                          [ MenuItem.header "Demo"
                                            // MenuItem.onClick (fun _ -> loadDemoProject "2adder (4-bit)" model dispatch) ] ] ]
                                            MenuItem.onClick (fun _ -> loadDemoProject "3cpu" model dispatch) ] ] ]

                          TextBlock.create [ TextBlock.text "Path/this_project/this_sheet" ]
                          saveBtn model
                          Button.create
                              [
                                  Button.content "Info"
                                  Button.background "LightBlue"
                              ] ] ]
          ) ]
