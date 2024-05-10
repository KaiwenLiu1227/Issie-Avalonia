module SymbolHelper 
    open System
    open Avalonia.Media
    open DrawModelType.SymbolT
    open ModelType
    open CommonTypes

    let componentTypes = [| "Input1"; "Output"; "NotConnected"; "IOLabel"; "Viewer"; "Constant1"; "MergeWires"; "Mux2"; "BusSelection"; "BusCompare"; "Not" |]

    let genPoints (comp: Component) H W =
            match comp.Type with
            // legacy component: to be deleted
            | Input _
            | Input1 _ |Output _ -> 
                [|{X=0;Y=0};{X=0;Y=H};{X=W*4./5.;Y=H};{X=W;Y=H/2.};{X=W*0.8;Y=0}|] 
            //| Output _ -> 
            //    [|{X=W/5.;Y=0};{X=0;Y=H/2.};{X=W/5.;Y=H};{X=W;Y=H};{X=W;Y=0}|]
            | Constant1 _ -> 
                [|{X=W;Y=H/2.};{X=W/2.;Y=H/2.};{X=0;Y=H};{X=0;Y=0};{X=W/2.;Y=H/2.}|]
            | IOLabel ->
                [|{X=0.;Y=H/2.};{X=W;Y=H/2.}|]
            | Viewer _ ->
                [|{X=W/5.;Y=0};{X=0;Y=H/2.};{X=W/5.;Y=H};{X=W;Y=H};{X=W;Y=0}|]
            | NotConnected ->
                [|{X=0.;Y=H/2.};{X=W/3.;Y=H/2.};{X=W/3.;Y=H-H/4.};{X=W/3.;Y=H/4.};{X=W/3.;Y=H/2.}|]
            | MergeWires -> 
                [|{X=0;Y=H/6.};{X=W/2.;Y=H/6.};{X=W/2.;Y=H/2.};{X=W;Y=H/2.};{X=W/2.;Y=H/2.};{X=W/2.;Y=5.*H/6.};{X=0;Y=5.*H/6.};{X=W/2.;Y=5.*H/6.};{X=W/2.;Y=H/6.}|]
            | SplitWire _ -> 
                [|{X=W;Y=H/6.};{X=W/2.;Y=H/6.};{X=W/2.;Y=H/2.};{X=0;Y=H/2.};{X=W/2.;Y=H/2.};{X=W/2.;Y=5.*H/6.};{X=W;Y=5.*H/6.};{X=W/2.;Y=5.*H/6.};{X=W/2.;Y=H/6.}|]
            // EXTENSION: |Mux4|Mux8 ->(sprintf "%i,%i %i,%f  %i,%f %i,%i" 0 0 w (float(h)*0.2) w (float(h)*0.8) 0 h )
            // EXTENSION: | Demux4 |Demux8 -> (sprintf "%i,%f %i,%f %i,%i %i,%i" 0 (float(h)*0.2) 0 (float(h)*0.8) w h w 0)
            | Demux2 | Demux4 | Demux8 ->
                [|{X=0;Y=0.3*W};{X=0;Y=H-0.3*W};{X=W;Y=H};{X=W;Y=0}|]
            | Mux2 | Mux4 | Mux8 -> 
                [|{X=0;Y=0};{X=0;Y=H};{X=W;Y=H-0.3*W};{X=W;Y=0.3*W}|]
            | BusSelection _ -> 
                [|{X=0;Y=H/2.}; {X=W;Y=H/2.}|]
            | BusCompare _ |BusCompare1 _-> 
                [|{X=0;Y=0};{X=0;Y=H};{X=W*0.6;Y=H};{X=W*0.8;Y=H*0.7};{X=W;Y=H*0.7};{X=W;Y =H*0.3};{X=W*0.8;Y=H*0.3};{X=W*0.6;Y=0}|]
            | Not ->
                [|{X=0;Y=0};{X=0;Y=H};{X=W;Y=H};{X=W;Y=H/2.};{X=W+9.;Y=H/2.};{X=W;Y=H/2.-8.};{X=W;Y=H/2.};{X=W;Y=0}|]
            | GateN (gType, _) when (isNegated gType) ->
                [|{X=0;Y=0};{X=0;Y=H};{X=W;Y=H};{X=W;Y=H/2.};{X=W+9.;Y=H/2.};{X=W;Y=H/2.-8.};{X=W;Y=H/2.};{X=W;Y=0}|]
            | DFF | DFFE | Register _ | RegisterE _ | ROM1 _ |RAM1 _ | AsyncRAM1 _ 
            | Counter _ | CounterNoEnable _ 
            | CounterNoLoad _ | CounterNoEnableLoad _ -> 
                [|{X=0;Y=H-13.};{X=8.;Y=H-7.};{X=0;Y=H-1.};{X=0;Y=0};{X=W;Y=0};{X=W;Y=H};{X=0;Y=H}|]
            | Custom _ -> 
                [|{X=0;Y=H-13.};{X=8.;Y=H-7.};{X=0;Y=H-1.};{X=0;Y=0};{X=W;Y=0};{X=W;Y=H};{X=0;Y=H}|]
            | NbitSpreader _ ->
                [|{X=0;Y=H/2.};{X=W*0.4;Y=H/2.};{X=W*0.4;Y=H};{X=W*0.4;Y=0.};{X=W*0.4;Y=H/2.};{X=W;Y=H/2.}|]
            | _ -> 
                [|{X=0;Y=0};{X=0;Y=H};{X=W;Y=H};{X=W;Y=0}|]

    (*let genPolyParam = 
        [| for id in 0 .. 5 -> 
            {
                Id = id;
                Stroke = Color.FromArgb(255uy, 0uy, 0uy, 0uy);
                FillOpacity = 0.8;
                StrokeThickness = 2.0; 
                Fill = Color.FromArgb(255uy, 255uy, 235uy, 47uy);
                compType = "Not";
                compIdx = 0;
                renderCnt = 0;
                compPos = { X = 150.0 + float id * 30.0; Y = 150.0 };  // Adjust position for each component
                points = genPoints "Not" 20 20
            }
        |]*)
    
    let getCompPos (polygonParameters: Symbol) (dir: string) =
        // printfn $"'{polygonParameters.Pos}'"
        match dir with
        | "X" -> 
            polygonParameters.Pos.X - 500.0
        | _ -> 
            polygonParameters.Pos.Y - 900.0