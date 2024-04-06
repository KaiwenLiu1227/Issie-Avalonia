module BusWireUpdate

open CommonTypes
open Elmish
open DrawHelpers
open DrawModelType.SymbolT
open DrawModelType.BusWireT
open BusWire
(*
open BusWireUpdateHelpers*)
open BlockHelpers
(*
open BusWireRoute
*)
open Optics
open Operators
open BlockHelpers

//---------------------------------------------------------------------------------//
//------------------------------BusWire Init & Update functions--------------------//
//---------------------------------------------------------------------------------//

/// Initialises an empty BusWire Model
let init () = 
    let symbols,_ = SymbolView.init()
    {   
        Wires = Map.empty;
        Symbol = symbols; 
        CopiedWires = Map.empty; 
        SelectedSegment = []; 
        LastMousePos = {X = 0.0; Y = 0.0};
        ErrorWires = []
        Notifications = None
        Type = Constants.initialWireType
        ArrowDisplay = Constants.initialArrowDisplay
        SnapToNet = true
    } , Cmd.none
