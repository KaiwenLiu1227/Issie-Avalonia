module Program

open Elmish
open Avalonia
open Avalonia.Themes.Fluent
open Avalonia.FuncUI.Hosts
open Avalonia.FuncUI.Elmish
open Avalonia.Controls.ApplicationLifetimes
open Avalonia.Input
open ModelType
open Optics
open Optics.Operators

let init() = MainView.init(), Cmd.none
let update (msg: Msg) (model: Model) : Model * Cmd<Msg>  = Update.update msg model
let view model dispatch = MainView.view model dispatch

type MainWindow() as this =
    inherit HostWindow()
    do
        base.Height <- 700.0
        base.Width <- 1200.0
        base.Title <- "Issie Avalonia"
        
        (*let subscriptions (model) =
            let keyDownSub (dispatch : Msg -> unit) =
                this.KeyDown.Subscribe(fun eventArgs ->
                    dispatch <| (ManualKeyDown (ev.Key.ToString()))
                    )

            [[ nameof keyDownSub ], keyDownSub ]*)
            
        this.AttachDevTools();
        Program.mkProgram init update view 
        |> Program.withHost this
        |> Program.runWithAvaloniaSyncDispatch ()
        // |> Program.withSubscription subscriptions
        // |> Program.run    

type App() =
    inherit Application()

    override this.Initialize() =
        this.Styles.Add (FluentTheme())
        this.RequestedThemeVariant <- Styling.ThemeVariant.Light

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