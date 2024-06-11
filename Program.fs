module Program

open Avalonia.FuncUI.Types
open Elmish
open Avalonia
open Avalonia.Controls
open Avalonia.Themes.Fluent
open Avalonia.FuncUI.Hosts
open Avalonia.FuncUI.Elmish
open Avalonia.Controls.ApplicationLifetimes
open Avalonia.Input
open ModelType
open DrawModelType
open Optics
open Optics.Operators

// -- Init Model

let init() =
    //JSHelpers.setDebugLevel()
    DiagramMainView.init(), Cmd.none


// -- Create View
let addDebug dispatch (msg:Msg) =
    let str = UpdateHelpers.getMessageTraceString msg
    //if str <> "" then printfn ">>Dispatch %s" str else ()
    dispatch msg

let view model dispatch = DiagramMainView.displayView model (addDebug dispatch)

// -- Update Model

let update msg model = Update.update msg model

printfn "Starting renderer..."

let view' model dispatch =
    let start = TimeHelpers.getTimeMs()
    view model dispatch
    |> (fun view ->
        if Set.contains "view" JSHelpers.debugTraceUI then
            TimeHelpers.instrumentInterval ">>>View" start view
        else
            view)

let mutable firstPress = true


type MainWindow() as this =
    inherit HostWindow()
    do
        base.Height <- 700.0
        base.Width <- 1200.0
        base.Icon <- WindowIcon("static\icon.png")
        base.Title <- "Issie Avalonia"
        
        let subscriptions _ =
            let keyDownSub (dispatch: Msg -> unit) =
                this.KeyDown.Subscribe(fun eventArgs ->
                    if eventArgs.Key = Input.Key.Space then// Check for spacebar
                        // key.preventDefault() // Disable scrolling with spacebar
                        dispatch (Sheet (SheetT.Msg.ManualKeyDown (eventArgs.Key.ToString())))
                    else
                        dispatch (Sheet (SheetT.Msg.ManualKeyDown (eventArgs.Key.ToString())))
                    )
            [[ nameof keyDownSub ], keyDownSub ]
        
        this.AttachDevTools();
        Program.mkProgram init update view' 
        |> Program.withHost this
        // |> Program.withConsoleTrace
        |> Program.withSubscription subscriptions
        |> Program.runWithAvaloniaSyncDispatch ()
        // |> Program.run    

type App() =
    inherit Application()

    override this.Initialize() =
        this.Styles.Add (FluentTheme())
        this.RequestedThemeVariant <- Styling.ThemeVariant.Light
        this.Name <- "Issie Avalonia"

    override this.OnFrameworkInitializationCompleted() =
        match this.ApplicationLifetime with
        | :? IClassicDesktopStyleApplicationLifetime as desktopLifetime ->
            desktopLifetime.MainWindow <- MainWindow()
        | _ -> ()


    
[<EntryPoint>]
let main(args: string[]) =
    AppBuilder
        .Configure<App>()
        .UsePlatformDetect()
        .UseSkia()
        .StartWithClassicDesktopLifetime(args)