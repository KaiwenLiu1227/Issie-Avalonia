namespace Issie_Avalonia

module ModelType =
    open Avalonia
    open Avalonia.Media

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
    
    type State =
        { polygonParameters: PolygonParameters[]
          compNum: int
          rotation: float
          holdingState: bool}

    type Msg =
        | Forward
        | Backward
        | Rotate of Input.PointerWheelEventArgs
        | Reset
        | Move of XYPos
        | OnPress of int
        | OnRelease