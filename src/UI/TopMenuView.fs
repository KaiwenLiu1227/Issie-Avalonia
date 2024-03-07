namespace Issie_Avalonia

open Avalonia.Controls
open Avalonia.FuncUI.DSL
open Avalonia.Media
open ModelType
open FilesIO

module TopMenuView =
    
    let loadDemoProject basename =
            let newDir = ".\\demos\\" + basename
            let sourceDir = staticDir() + "\\demos\\" + basename
            printfn "%s" $"loading demo {sourceDir} into {newDir}"

            (*ensureDirectory ".\\demos\\"
            ensureDirectory newDir*)

            (*readFilesFromDirectory newDir
            |> List.iter (fun path -> unlink <| pathJoin[|newDir; path|])*)

            let files = readFilesFromDirectory sourceDir
            printfn $"coping {files}"

            // copy over files from source path to new path
            (*
            files
            |> List.iter (fun basename ->
                let newPath = pathJoin [|newDir; basename|]
                copyFile (pathJoin [|sourceDir; basename|]) newPath)
                *)

            match loadAllComponentFiles newDir with
            | Ok(_) -> () // Explicitly return unit
            | Error(_) -> () // Explicitly return unit
        

    let topMenuView model dispatch =
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
                            [ MenuItem.create
                                  [ MenuItem.header "Project"
                                    MenuItem.viewItems
                                        [ MenuItem.create [ MenuItem.header "File"
                                                            MenuItem.onClick (fun _ -> dispatch ShowOverlay)
                                                            ]
                                          MenuItem.create [ MenuItem.header "Demo"
                                                            MenuItem.onClick (fun _ -> loadDemoProject "1fulladder")
                                                          ]
                                                        
                                          ] ]
                              MenuItem.create
                                  [ MenuItem.header "Sheet"
                                    MenuItem.viewItems
                                        [ MenuItem.create [ MenuItem.header "File" ]
                                          MenuItem.create [ MenuItem.header "Edit" ] ] ]
                              MenuItem.create [ MenuItem.header "Path/this_project/this_sheet" ]
                              Button.create [ Button.content "Save" ]
                              Button.create [ Button.content "Info" ] ] ]
              ) ]
