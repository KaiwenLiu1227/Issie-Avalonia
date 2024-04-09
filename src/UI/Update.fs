

module Update 

    open ModelType
    open SymbolHelper
    open FilesIO

    let update msg model =
        match msg with
        (*| Forward ->
            printfn "forward"
            let updatedPolygonParam = 
                {
                    model.polygonParameters.[model.compNum] with
                        renderCnt = model.polygonParameters.[model.compNum].renderCnt + 1
                        compIdx = model.polygonParameters.[model.compNum].compIdx + 1
                        compType =  componentTypes.[model.polygonParameters.[model.compNum].compIdx  % Array.length componentTypes]
                }
            
            let updatedPolygonParameters = 
                model.polygonParameters
                |> Array.mapi (fun idx param -> 
                    if idx = model.compNum then updatedPolygonParam else param)

            { model with polygonParameters = updatedPolygonParameters }

        | Backward ->
            let updatedPolygonParam = 
                {
                    model.polygonParameters.[model.compNum] with
                        renderCnt = model.polygonParameters.[model.compNum].renderCnt + 1
                        compIdx = model.polygonParameters.[model.compNum].compIdx - 1
                        compType =  componentTypes.[model.polygonParameters.[model.compNum].compIdx  % Array.length componentTypes]
                }
            let updatedPolygonParameters = 
                model.polygonParameters
                |> Array.mapi (fun idx param -> 
                    if idx = model.compNum then updatedPolygonParam else param)

            { model with polygonParameters = updatedPolygonParameters }    
        | Rotate args ->
            { model with
                 rotation = model.rotation + args.Delta.Y * 0.785
            }
        | Move newPos ->
            if model.holdingState then
                let oldPos = model.polygonParameters.[model.compNum].compPos
                if newPos <> oldPos then
                        let updatedPolygonParam = 
                            {model.polygonParameters.[model.compNum] with
                                  renderCnt = model.polygonParameters.[model.compNum].renderCnt + 1
                                  compPos = newPos
                              }
                        
                        let updatedPolygonParameters = 
                            model.polygonParameters
                            |> Array.mapi (fun idx param -> 
                                if idx = model.compNum then updatedPolygonParam else param)

                        { model with polygonParameters = updatedPolygonParameters }
                else
                    model
            else
                model  // Return the model unchanged if holdingmodel is false
        | OnRelease ->
            { model with
                holdingState =  false 
            }
        | OnPress compPressed ->
            { model with
                compNum = compPressed
                holdingState = true 
            }
        | ShowOverlay -> { model with IsOverlayVisible = true }
        | HideOverlay -> { model with IsOverlayVisible = false }
        | ChangeProjState ->
            printfn $"project: {model.projectState}"
            
            { model with
                IsOverlayVisible = false
            }*)
        | _ -> model
