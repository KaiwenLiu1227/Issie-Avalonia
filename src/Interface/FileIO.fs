module FilesIO

    open System.IO
    open System.Text
    open Thoth.Json.Net
    open CommonTypes
    open LegacyCanvas
    open Helpers
    open Extractor
    open EEExtensions

    let readFile (filePath: string) =
        File.ReadAllText(filePath, Encoding.UTF8)


    let readdir (folderPath: string) =
        Directory.GetFiles folderPath |> Array.map Path.GetFileName


    let dirName (filePath: string) = Path.GetDirectoryName filePath


    let baseName (filePath: string) = Path.GetFileName filePath

    let exists (filePath: string) = File.Exists filePath
    
    let dirExists (filePath: string) = Directory.Exists filePath

    let extName (filePath: string) = Path.GetExtension filePath
    
    let pathJoin args = Path.Join args
    
    let unlink (folderPath: string) = File.Delete folderPath
    
    let hasExtn extn fName =
        (String.toLower fName).EndsWith (String.toLower extn)
    
    let mkdir (folderPath: string) =
        let dirInfo = Directory.CreateDirectory folderPath
        printfn "created directory: %A" dirInfo

    let staticDir() =
            Directory.GetCurrentDirectory()
            
    let ensureDirectory dPath =
        if (not <| dirExists dPath) then 
            mkdir dPath
    
    let readFilesFromDirectory (path:string) : string list =
        if dirExists path then
            try 
                readdir path |> Seq.toList
            with
            | ex -> 
                printfn "Getting files failed for '%s': %s" path ex.Message
                []
        else
            printfn $"read failed {path}"
            []
    let writeFile path data =
        try
            File.WriteAllText(path, data, System.Text.ASCIIEncoding.UTF8)
            Ok ()
        with
            | e -> Result.Error $"Error '{e.Message}' writing file '{path}'"

    let copyFile (sourcePath: string) (newPath: string) =
        match readFile sourcePath |> writeFile newPath with
        | Ok _ -> ()
        | Error _ -> ()
        
    let readFilesFromDirectoryWithExtn (path:string) (extn:string) : string list =
        readFilesFromDirectory path
        |> List.filter (fun name -> hasExtn extn name)

    type LoadStatus =
    | Resolve  of LoadedComponent * LoadedComponent
    | OkComp of LoadedComponent
    | OkAuto of LoadedComponent
    
    let fileNameIsBad name =
        match (name |> Seq.tryItem 0) |> Option.map (fun c -> System.Char.IsDigit c || c = '_') with
        | Some true -> true
        | Some false | None -> 
            name
            |> Seq.filter (fun ch -> not (ch = ' '))
            |> Seq.isEmpty
            |> not
    
    let pathWithoutExtension filePath =
        let ext = extName filePath
        filePath 
        |> Seq.rev
        |> Seq.skip ext.Length
        |> Seq.rev
        |> System.String.Concat

    
    let jsonStringToState (jsonString : string) =
            match Decode.Auto.fromString<LegacyCanvasState>(jsonString, extra = extraCoder) with
            | Ok state -> Ok (CanvasOnly state)
            | Error str ->
                // printfn "Error in Json parse of %s " str
                match Decode.Auto.fromString<SavedInfo>(jsonString, extra = extraCoder) with
                | Ok state -> Ok state
                | Error str ->
                    printfn "Error in Json parse of %s " str
                    match Decode.Auto.fromString<SavedCanvasUnknownWaveInfo<obj>>(jsonString, extra = extraCoder) with
                    | Ok (SavedCanvasUnknownWaveInfo.NewCanvasWithFileWaveSheetInfoAndNewConns(cState,_,sheetInfo,time)) ->
                        Ok <| NewCanvasWithFileWaveSheetInfoAndNewConns(cState,None,sheetInfo,time)
                    | Error str ->
                        // printfn "Error in Json parse of %s : %s" jsonString str
                        Error str

    let getBaseNameNoExtension filePath =
        let name = baseName filePath

        match name.Split '.' |> Seq.toList with
        | [] -> failwithf "what? split at . in a filename should never return empty list"
        | [ name ] -> name // No dots found.
        | firstSplit :: splits ->
            // Quite ugly but works.
            let rest =
                ("", [ 0 .. splits.Length - 2 ])
                ||> List.fold (fun baseName i -> name + "." + splits[i])

            firstSplit + rest

    let private tryLoadStateFromPath (filePath: string) =
        if not (exists filePath) then
            Result.Error
            <| sprintf "Can't read file from %s because it does not seem to exist!" filePath
        else
            try
                Ok(readFile filePath)
            with e ->
                Result.Error $"Error {e.Message} reading file '{filePath}'"

            |> Result.map jsonStringToState
            |> (function
            | Error msg ->
                Result.Error
                <| sprintf "could not convert file '%s' to a valid issie design sheet. Details: %s" filePath msg
            | Ok res -> Ok res)


    /// load a component from its canvas and other elements
    let makeLoadedComponentFromCanvasData
        (canvas: CanvasState)
        filePath
        timeStamp
        waveInfo
        (sheetInfo: SheetInfo option)
        =
        let projectPath = dirName filePath
        let inputs, outputs = Extractor.parseDiagramSignature canvas
        printfn "parsed component"
        let comps, conns = canvas
        // let comps' = List.map (checkMemoryContents projectPath) comps
        let comps' = comps
        printfn "checked component"
        let canvas = comps', conns

        let ramChanges =
            List.zip comps' comps
            |> List.filter (fun (c1, c2) -> c1.Type <> c2.Type)
            |> List.map fst

        printfn "ram changes processed"

        let form, description =
            match sheetInfo with
            | None -> (Some User), None
            | Some sI -> sI.Form, sI.Description

        let ldc =
            { Name = getBaseNameNoExtension filePath
              TimeStamp = timeStamp
              WaveInfo = waveInfo
              FilePath = filePath
              CanvasState = canvas
              InputLabels = inputs
              OutputLabels = outputs
              Form = form
              Description = description }

        ldc, ramChanges
    let stripVertices (conn: LegacyCanvas.LegacyConnection) =
        {conn with Vertices = []}

    let magnifySheet magnification (comp: LegacyCanvas.LegacyComponent) =
        {comp with 
            X = magnification * (comp.X + comp.W / 2. ); 
            Y = magnification * (comp.Y + comp.H/2.)
            H = -1 // overwritten correctly by Sheet based on componnet type
            W = -1 // as above
        }
    
    /// Update from old component types to new
    /// In addition do some sanity checks
    /// The standard way to add functionality to an existing component is to create a new
    /// component type, keeping the old type. Then on reading sheets from disk both new and old
    /// will be correctly read. This function will be called on load and will convert from the old
    /// type to the new one so that the rest of issie need only process new types, but compatibility
    /// with saved old types remains.
    let getLatestComp (comp: Component) =
        let updateMem (mem:Memory) : Memory1 =
            {
                Init = FromData
                Data = mem.Data
                AddressWidth = mem.AddressWidth
                WordWidth = mem.WordWidth
            }
        match comp.Type with
        | RAM mem -> {comp with Type = RAM1 (updateMem mem)}
        | ROM mem -> {comp with Type = ROM1 (updateMem mem)}
        | AsyncROM mem -> { comp with Type = AsyncROM1 (updateMem mem)}
        | Constant(width,cVal) -> {comp with Type = Constant1(width, cVal, $"%d{cVal}")}
        | Input width -> { comp with Type = Input1 (width, None)}
        | _ -> comp
    
    /// Interface function that can read old-style circuits (without wire vertices)
    /// as well as new circuits with vertices. Old circuits have an expansion parameter
    /// since new symbols are larger (in units) than old ones.
    let getLatestCanvas state =
        let oldCircuitMagnification = 1.25
        let stripConns (canvas: LegacyCanvas.LegacyCanvasState) =
            let (comps,conns) = canvas
            let noVertexConns = List.map stripVertices conns
            let expandedComps = List.map (magnifySheet oldCircuitMagnification) comps
            (expandedComps, noVertexConns)
            |> legacyTypesConvert
        let comps,conns =
            match state  with
            | CanvasOnly canvas -> stripConns canvas
            | CanvasWithFileWaveInfo(canvas, _, _) -> stripConns canvas
            | CanvasWithFileWaveInfoAndNewConns(canvas, _, _) -> legacyTypesConvert canvas
            | NewCanvasWithFileWaveInfoAndNewConns(canvas,_,_) -> canvas
            | NewCanvasWithFileWaveSheetInfoAndNewConns (canvas,_,_,_) -> canvas
        let comps = List.map convertFromJSONComponent comps
        List.map getLatestComp comps, conns

    /// Make a loadedComponent from the file read from filePath.
    /// Return the component, or an Error string.
    let tryLoadComponentFromPath filePath : Result<LoadedComponent, string> =
        match tryLoadStateFromPath filePath with
        | Result.Error msg
        | Ok(Result.Error msg) ->
            Error
            <| sprintf "Can't load component %s because of Error: %s" (getBaseNameNoExtension filePath) msg
        | Ok(Ok state) ->
            printf $"loading component {state}"
            let canvas = getLatestCanvas state

            makeLoadedComponentFromCanvasData canvas filePath state.getTimeStamp state.getWaveInfo state.getSheetInfo
            |> fst // ignore ram change info, they will always be loaded
            |> Result.Ok

    /// load all files in folderpath. Return Ok list of LoadStatus or a single Error.
    let loadAllComponentFiles (folderPath: string) =
        let x =
            try
                Ok <| readdir folderPath
            with e ->
                Error <| sprintf "Error reading Issie project directory at '%s: %A" folderPath e

        match x with
        | Error msg -> Error msg
        | Ok x ->
            x
            |> Seq.toList
            |> List.filter (extName >> ((=) ".dgm"))
            |> List.map (fun fileName ->
                let filePath = pathJoin [| folderPath; fileName |]
                printfn $"loading {fileName}"
                let ldComp = filePath |> tryLoadComponentFromPath
                let autoComp = filePath + "auto" |> tryLoadComponentFromPath
                printfn $"{fileName} Loaded"

                match (ldComp, autoComp) with
                | Ok ldComp, Ok autoComp when ldComp.TimeStamp < autoComp.TimeStamp ->
                    Resolve(ldComp, autoComp) |> Ok
                | Ok ldComp, _ -> OkComp ldComp |> Ok
                | Error _, Ok autoComp -> OkAuto autoComp |> Ok
                | Error msg, _ -> Error msg)
            |> tryFindError
