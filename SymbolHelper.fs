namespace Issie_Avalonia



module SymbolHelper =
    open Avalonia.Media
    open DisplayModelTypes

    let componentTypes = [| "Input1"; "Output"; "NotConnected"; "IOLabel"; "Viewer"; "Constant1"; "MergeWires"; "Mux2"; "BusSelection"; "BusCompare"; "Not" |]

    let genPoints (compType: string) H W =
        match compType with
        | "Input1" | "Output"  -> 
            [|{X=0;Y=0};{X=0;Y=H};{X=W*4./5.;Y=H};{X=W;Y=H/2.};{X=W*0.8;Y=0}|] 
        | "Constant1"  -> 
            [|{X=W;Y=H/2.};{X=W/2.;Y=H/2.};{X=0;Y=H};{X=0;Y=0};{X=W/2.;Y=H/2.}|]
        | "IOLabel" ->
            [|{X=0.;Y=H/2.};{X=W;Y=H/2.}|]
        | "Viewer" ->
            [|{X=W/5.;Y=0};{X=0;Y=H/2.};{X=W/5.;Y=H};{X=W;Y=H};{X=W;Y=0}|]
        | "NotConnected" ->
            [|{X=0.;Y=H/2.};{X=W/3.;Y=H/2.};{X=W/3.;Y=H-H/4.};{X=W/3.;Y=H/4.};{X=W/3.;Y=H/2.}|]
        | "MergeWires" -> 
            [|{X=0;Y=H/6.};{X=W/2.;Y=H/6.};{X=W/2.;Y=H/2.};{X=W;Y=H/2.};{X=W/2.;Y=H/2.};{X=W/2.;Y=5.*H/6.};{X=0;Y=5.*H/6.};{X=W/2.;Y=5.*H/6.};{X=W/2.;Y=H/6.}|]
        | "Mux2"  -> 
            [|{X=0;Y=0};{X=0;Y=H};{X=W;Y=H-0.3*W};{X=W;Y=0.3*W}|]
        | "BusSelection" -> 
            [|{X=0;Y=H/2.}; {X=W;Y=H/2.}|]
        | "BusCompare" -> 
            [|{X=0;Y=0};{X=0;Y=H};{X=W*0.6;Y=H};{X=W*0.8;Y=H*0.7};{X=W;Y=H*0.7};{X=W;Y =H*0.3};{X=W*0.8;Y=H*0.3};{X=W*0.6;Y=0}|]
        | _ ->
            [|{X=0;Y=0};{X=0;Y=H};{X=W;Y=H};{X=W;Y=H/2.};{X=W+9.;Y=H/2.};{X=W;Y=H/2.-8.};{X=W;Y=H/2.};{X=W;Y=0}|]

    let genPolyParam = 
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
        |]
    
    let getCompPos (polygonParameters: PolygonParameters) (dir: string) =
        match dir with
        | "X" -> 
            polygonParameters.compPos.X - 175.0
        | _ -> 
            polygonParameters.compPos.Y - 50.0