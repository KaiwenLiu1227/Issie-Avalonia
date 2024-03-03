namespace Issie_Avalonia

module DisplayModelTypes=
    open System
    open Avalonia
    open Avalonia.Controls
    open Avalonia.Controls.Shapes
    open Avalonia.FuncUI
    open Avalonia.FuncUI.DSL
    open Avalonia.Media
    open Avalonia.FuncUI.Types

    type XYPos ={
        X : float
        Y : float
    }
    
    type PolygonParameters = {
        Id: int
        Stroke: Color
        FillOpacity: float
        Fill: Color
        StrokeThickness: float
        compType: string
        compIdx: int
        compPos: XYPos
        renderCnt: int
        points: XYPos[]
    }
