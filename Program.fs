namespace Issie_Avalonia

open Elmish
open Avalonia
open Avalonia.Themes.Fluent
open Avalonia.FuncUI.Hosts
open Avalonia.FuncUI.Elmish
open Avalonia.Controls.ApplicationLifetimes

type MainWindow() as this =
    inherit HostWindow()
    do
        base.Height <- 900.0
        base.Width <- 1600.0
        base.Title <- "Issie Avalonia"
        this.AttachDevTools();
        Program.mkSimple MainView.init Update.update MainView.view 
        |> Program.withHost this
        |> Program.run    

type App() =
    inherit Application()

    override this.Initialize() =
        this.Styles.Add (FluentTheme())
        this.RequestedThemeVariant <- Styling.ThemeVariant.Dark

    override this.OnFrameworkInitializationCompleted() =
        match this.ApplicationLifetime with
        | :? IClassicDesktopStyleApplicationLifetime as desktopLifetime ->
            desktopLifetime.MainWindow <- MainWindow()
        | _ -> ()

module Program =

    [<EntryPoint>]
    let main(args: string[]) =
        AppBuilder
            .Configure<App>()
            .UsePlatformDetect()
            .UseSkia()
            .StartWithClassicDesktopLifetime(args)