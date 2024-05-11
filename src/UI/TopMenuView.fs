module TopMenuView

open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.Media
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

    match loadAllComponentFiles newDir with
    | Ok(componentsToResolve: LoadStatus list) ->
        (*
                printf $"{componentsToResolve}"
                *)
        resolveComponentOpenPopup newDir [] componentsToResolve model dispatch
    | Error(_) -> () // Explicitly return unit
          
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
                                    [ MenuItem.create [ MenuItem.header "New Project" ]
                                      MenuItem.create [ MenuItem.header "Import Project" ]
                                      MenuItem.create [ MenuItem.header "CLose Project" ]
                                      MenuItem.create
                                          [ MenuItem.header "Demo"
                                            MenuItem.onClick (fun _ -> loadDemoProject "test" model dispatch) ] ] ]

                          MenuItem.create [ MenuItem.header "Path/this_project/this_sheet" ]
                          Button.create [ Button.content "Save" ]
                          Button.create [ Button.content "Info" ] ] ]
          ) ]
