import { containsKey, tryFind, add, fold as fold_1, iterate, toArray as toArray_2, FSharpMap__get_Item, ofList, toList as toList_1, empty } from "../../fable_modules/fable-library.4.1.4/Map.js";
import { uncurry3, equals, equalArrays, createAtom, comparePrimitives, compareArrays, compare } from "../../fable_modules/fable-library.4.1.4/Util.js";
import { GatherData__getSheetName_4E1F3B82, GatherData__getFullName_4E1F3B82, Driver, GatherTemp, FastComponent, extractLabel, SimulationComponentState, FastData, FastBits, IOArray, FData, StepArray$1, BigIntState as BigIntState_1, FastSimulation, GatherData } from "../SimulatorTypes.fs.js";
import { tail, reverse, cons, iterate as iterate_1, indexed, getSlice, fold, find, mapIndexed, filter, append, singleton, collect, isEmpty, sumBy, map, toArray, exists, length, empty as empty_1 } from "../../fable_modules/fable-library.4.1.4/List.js";
import { printf, toFail } from "../../fable_modules/fable-library.4.1.4/String.js";
import { toString } from "../../fable_modules/fable-library.4.1.4/Types.js";
import { toArray as toArray_1, toList } from "../../fable_modules/fable-library.4.1.4/Seq.js";
import { rangeDouble } from "../../fable_modules/fable-library.4.1.4/Range.js";
import { iterateIndexed, append as append_1, concat, collect as collect_1, mapIndexed as mapIndexed_1, map as map_1, fill } from "../../fable_modules/fable-library.4.1.4/Array.js";
import { emptyFastData } from "../NumberHelpers.fs.js";
import { fromZero } from "../../fable_modules/fable-library.4.1.4/BigInt.js";
import { getHybridComponentAsyncOuts, isHybridComponent, couldBeSynchronousComponent } from "../SynchronousUtils.fs.js";
import { defaultArg, map as map_2 } from "../../fable_modules/fable-library.4.1.4/Option.js";
import { isIOLabel, isCustom, isInput, isOutput } from "../../Common/Helpers.fs.js";
import { instrumentTime, instrumentInterval, getTimeMs } from "../../Common/TimeHelpers.fs.js";
import { PortType, WaveIndexT } from "../../Common/CommonTypes.fs.js";

export const emptyGather = (() => {
    const Labels = empty({
        Compare: compare,
    });
    return new GatherData(empty({
        Compare: compare,
    }), empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    }), Labels, empty({
        Compare: compareArrays,
    }));
})();

export function emptyFastSimulation(diagramName) {
    return new FastSimulation(0, 0, new Array(0), new Array(0), new Array(0), new Array(0), empty({
        Compare: compareArrays,
    }), empty_1(), empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    }), emptyGather, 0, new Array(0), new Array(0), empty({
        Compare: compare,
    }), empty({
        Compare: comparePrimitives,
    }), empty_1(), diagramName);
}

export const simulationPlaceholder = emptyFastSimulation("");

export function getFid(cid, ap) {
    const ff = (_arg) => {
        const Id = _arg;
        return Id;
    };
    return [cid, ap];
}

export function getPortNumbers(sc) {
    let patternInput;
    const matchValue = sc.Type;
    switch (matchValue.tag) {
        case 0:
        case 1:
        case 2:
        case 6:
        case 47:
        case 5:
        case 8:
        case 31:
        case 33:
        case 3:
        case 40:
        case 39:
        case 23:
        case 25:
        case 36: {
            patternInput = [1, 1];
            break;
        }
        case 4: {
            patternInput = [1, 0];
            break;
        }
        case 27:
        case 21:
        case 24:
        case 22:
        case 34:
        case 32:
        case 37: {
            patternInput = [2, 1];
            break;
        }
        case 28: {
            patternInput = [1, 2];
            break;
        }
        case 11:
        case 19:
        case 35: {
            patternInput = [3, 1];
            break;
        }
        case 12: {
            patternInput = [5, 1];
            break;
        }
        case 13: {
            patternInput = [9, 1];
            break;
        }
        case 17: {
            patternInput = [3, 2];
            break;
        }
        case 18: {
            patternInput = [2, 2];
            break;
        }
        case 20:
        case 46: {
            patternInput = [2, 1];
            break;
        }
        case 42:
        case 41: {
            patternInput = [3, 1];
            break;
        }
        case 9: {
            patternInput = [2, 4];
            break;
        }
        case 14: {
            patternInput = [2, 2];
            break;
        }
        case 15: {
            patternInput = [2, 4];
            break;
        }
        case 16: {
            patternInput = [2, 8];
            break;
        }
        case 10: {
            const n = matchValue.fields[1] | 0;
            patternInput = [n, 1];
            break;
        }
        case 29: {
            const n_1 = matchValue.fields[0] | 0;
            patternInput = [n_1, 1];
            break;
        }
        case 30: {
            const n_2 = matchValue.fields[0] | 0;
            patternInput = [1, n_2];
            break;
        }
        case 26: {
            const ct = matchValue.fields[0];
            patternInput = [length(ct.InputLabels), length(ct.OutputLabels)];
            break;
        }
        case 43:
        case 45:
        case 44: {
            patternInput = toFail(printf("legacy component type is not supported"));
            break;
        }
        case 48: {
            patternInput = toFail(printf("Legacy Input component types should never occur"));
            break;
        }
        default:
            patternInput = [0, 1];
    }
    const outs = patternInput[1] | 0;
    const ins = patternInput[0] | 0;
    return [ins, outs];
}

export function compType(t) {
    if (t.tag === 26) {
        const c = t.fields[0];
        return c.Name;
    }
    else {
        return toString(t);
    }
}

export function findBigIntState(fc) {
    const matchValue = fc.FType;
    let matchResult, w, m;
    switch (matchValue.tag) {
        case 3:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16: {
            matchResult = 2;
            break;
        }
        case 4: {
            matchResult = 3;
            break;
        }
        case 27: {
            matchResult = 4;
            break;
        }
        case 29: {
            matchResult = 5;
            break;
        }
        case 30: {
            matchResult = 6;
            break;
        }
        case 28: {
            matchResult = 7;
            break;
        }
        case 6: {
            matchResult = 8;
            break;
        }
        case 26: {
            matchResult = 10;
            break;
        }
        case 9:
        case 46:
        case 43:
        case 44:
        case 45: {
            matchResult = 11;
            break;
        }
        case 49: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 7: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 48: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 0: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 1: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 2: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 22: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 24: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 23: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 17: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 18: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 19: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 20: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 25: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 21: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 33: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 34: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 35: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 36: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 37: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 38: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 47: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 5: {
            matchResult = 1;
            w = matchValue.fields[0];
            break;
        }
        case 39: {
            matchResult = 9;
            m = matchValue.fields[0];
            break;
        }
        case 40: {
            matchResult = 9;
            m = matchValue.fields[0];
            break;
        }
        case 41: {
            matchResult = 9;
            m = matchValue.fields[0];
            break;
        }
        case 42: {
            matchResult = 9;
            m = matchValue.fields[0];
            break;
        }
        default:
            matchResult = 0;
    }
    switch (matchResult) {
        case 0:
            return [false, void 0];
        case 1:
            return [w > 32, void 0];
        case 2:
            return [fc.Outputs[0].Width > 32, void 0];
        case 3:
            return [false, void 0];
        case 4:
            return [((fc.InputLinks[0].Width > 32) ? true : (fc.InputLinks[1].Width > 32)) ? true : (fc.Outputs[0].Width > 32), new BigIntState_1([fc.InputLinks[0].Width > 32, fc.InputLinks[1].Width > 32], [fc.Outputs[0].Width > 32])];
        case 5: {
            const n_7 = matchValue.fields[0] | 0;
            return [(fc.Outputs[0].Width > 32) ? true : exists((n_9) => (fc.InputLinks[n_9].Width > 32), toList(rangeDouble(0, 1, n_7 - 1))), new BigIntState_1(toArray(map((n_11) => (fc.InputLinks[n_11].Width > 32), toList(rangeDouble(0, 1, n_7 - 1)))), [fc.Outputs[0].Width > 32])];
        }
        case 6: {
            const n_14 = matchValue.fields[0] | 0;
            return [(fc.InputLinks[0].Width > 32) ? true : exists((n_16) => (fc.Outputs[n_16].Width > 32), toList(rangeDouble(0, 1, n_14 - 1))), new BigIntState_1([fc.InputLinks[0].Width > 32], toArray(map((n_19) => (fc.Outputs[n_19].Width > 32), toList(rangeDouble(0, 1, n_14 - 1)))))];
        }
        case 7:
            return [fc.InputLinks[0].Width > 32, new BigIntState_1([fc.InputLinks[0].Width > 32], [fc.Outputs[0].Width > 32, fc.Outputs[1].Width > 32])];
        case 8:
            return [fc.InputLinks[0].Width > 32, new BigIntState_1([fc.InputLinks[0].Width > 32], [fc.Outputs[0].Width > 32])];
        case 9: {
            const matchValue_1 = m.WordWidth > 32;
            const matchValue_2 = m.AddressWidth > 32;
            if (matchValue_1) {
                if (matchValue_2) {
                    return [true, new BigIntState_1([true], [true])];
                }
                else {
                    return [true, new BigIntState_1([false], [true])];
                }
            }
            else if (matchValue_2) {
                return [true, new BigIntState_1([true], [false])];
            }
            else {
                return [false, void 0];
            }
        }
        case 10: {
            const c = matchValue.fields[0];
            return [false, void 0];
        }
        default:
            throw new Error("Legacy components, not Implemented");
    }
}

export let stepArrayIndex = createAtom(-1);

export function makeStepArray(arr) {
    stepArrayIndex(stepArrayIndex() + 1);
    return new StepArray$1(arr, stepArrayIndex());
}

export function makeIOArray(size) {
    stepArrayIndex(stepArrayIndex() + 1);
    return new IOArray(fill(new Array(2), 0, 2, new FData(0, [emptyFastData])), new Uint32Array(0), new Array(0), 0, stepArrayIndex());
}

export function makeIOArrayW(w, size) {
    let w_1;
    stepArrayIndex(stepArrayIndex() + 1);
    if ((w_1 = (w | 0), w_1 <= 32)) {
        const w_2 = w | 0;
        return new IOArray(fill(new Array(2), 0, 2, new FData(0, [new FastData(new FastBits(0, [0]), w_2)])), fill(new Uint32Array(size), 0, size, 0), new Array(0), w_2, stepArrayIndex());
    }
    else {
        return new IOArray(fill(new Array(2), 0, 2, new FData(0, [new FastData(new FastBits(1, [fromZero()]), w)])), new Uint32Array(0), fill(new Array(size), 0, size, fromZero()), w, stepArrayIndex());
    }
}

/**
 * create a FastComponent data structure with data arrays from a SimulationComponent.
 * numSteps is the number of past clocks data kept - arrays are managed as circular buffers.
 */
export function createFastComponent(maxArraySize, sComp, accessPath) {
    let inputRecord;
    const patternInput = getPortNumbers(sComp);
    const outPortNum = patternInput[1] | 0;
    const inPortNum = patternInput[0] | 0;
    const ins = map_1((n) => makeIOArray(maxArraySize), toArray_1(rangeDouble(0, 1, inPortNum - 1)));
    let outs;
    const matchValue_1 = sComp.OutputWidths.length | 0;
    let matchResult;
    if (sComp.Type.tag === 3) {
        if (matchValue_1 === 0) {
            matchResult = 0;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            outs = [makeIOArray(maxArraySize)];
            break;
        }
        default:
            outs = map_1((w) => makeIOArrayW(w, maxArraySize), sComp.OutputWidths);
    }
    const state = couldBeSynchronousComponent(sComp.Type) ? fill(new Array(maxArraySize), 0, maxArraySize, new SimulationComponentState(0, [])) : void 0;
    const fId = getFid(sComp.Id, accessPath);
    const reduceIfHybrid = (sc, ipn) => {
        if (isHybridComponent(sc.Type)) {
            return sumBy((ipn_1) => {
                const _arg = getHybridComponentAsyncOuts(sc.Type, ipn_1);
                let matchResult_1;
                if (_arg != null) {
                    if (isEmpty(_arg)) {
                        matchResult_1 = 0;
                    }
                    else {
                        matchResult_1 = 1;
                    }
                }
                else {
                    matchResult_1 = 0;
                }
                switch (matchResult_1) {
                    case 0:
                        return 0;
                    default:
                        return 1;
                }
            }, toList(rangeDouble(0, 1, ipn)), {
                GetZero: () => 0,
                Add: (x, y) => (x + y),
            }) | 0;
        }
        else {
            return ipn | 0;
        }
    };
    const matchValue_3 = sComp.Type;
    if (matchValue_3.tag === 0) {
        const w_1 = matchValue_3.fields[0] | 0;
        const d = matchValue_3.fields[1];
        ins[0] = ((inputRecord = ins[0], new IOArray(inputRecord.FDataStep, inputRecord.UInt32Step, inputRecord.BigIntStep, w_1, inputRecord.Index)));
    }
    const State = map_2(makeStepArray, state);
    const NumMissingInputValues = reduceIfHybrid(sComp, inPortNum) | 0;
    return new FastComponent(fId, sComp.Id, sComp.Type, State, !(sComp.Type.tag === 3), false, void 0, ins, fill(new Array(inPortNum), 0, inPortNum, void 0), outs, sComp, accessPath, "", extractLabel(sComp.Label), empty_1(), false, empty_1(), NumMissingInputValues, fill(new Array(outPortNum), 0, outPortNum, ""), "");
}

function createFlattenedSimulation(ap, graph) {
    const graphL = toList_1(graph);
    const allComps = map((tupledArg) => {
        const cid = tupledArg[0];
        const comp = tupledArg[1];
        return [[cid, ap], [comp, ap]];
    }, graphL);
    const labels = map((tupledArg_1) => {
        let s;
        const cid_1 = tupledArg_1[0];
        const comp_1 = tupledArg_1[1];
        return [cid_1, (s = comp_1.Label, s)];
    }, graphL);
    const topGather = new GatherTemp(empty_1(), empty_1(), labels, allComps);
    const customComps = collect((tupledArg_2) => {
        const cid_2 = tupledArg_2[0];
        const comp_2 = tupledArg_2[1];
        const matchValue = comp_2.Type;
        const matchValue_1 = comp_2.CustomSimulationGraph;
        let matchResult, csg, ct;
        if (matchValue.tag === 26) {
            if (matchValue_1 != null) {
                matchResult = 0;
                csg = matchValue_1;
                ct = matchValue.fields[0];
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0:
                return singleton([cid_2, ct, csg]);
            default:
                return empty_1();
        }
    }, graphL);
    const insideCustomGathers = map((tupledArg_3) => {
        const cid_3 = tupledArg_3[0];
        const ct_1 = tupledArg_3[1];
        const csg_1 = tupledArg_3[2];
        const ap$0027 = append(ap, singleton(cid_3));
        const gatherT = createFlattenedSimulation(ap$0027, csg_1);
        const compsInCustomComp = map((tuple) => tuple[1], toList_1(csg_1));
        const getCustomNameIdsOf = (compSelectFun) => map((comp_4) => {
            let matchValue_3, n, n_1;
            return [[comp_4.Label, (matchValue_3 = comp_4.Type, (matchValue_3.tag === 0) ? ((n = (matchValue_3.fields[0] | 0), n)) : ((matchValue_3.tag === 1) ? ((n_1 = (matchValue_3.fields[0] | 0), n_1)) : -1))], comp_4.Id];
        }, filter((comp_3) => compSelectFun(comp_3.Type), compsInCustomComp));
        const outputs = getCustomNameIdsOf(isOutput);
        const outLinks = mapIndexed((i, tupledArg_4) => {
            const lab = tupledArg_4[0];
            const labOutWidth = tupledArg_4[1] | 0;
            const out = find((tupledArg_5) => {
                const k = tupledArg_5[0];
                const v = tupledArg_5[1];
                return equalArrays(k, [lab, labOutWidth]);
            }, outputs)[1];
            return [[out, ap$0027], [[cid_3, ap], i]];
        }, ct_1.OutputLabels);
        const inputs = getCustomNameIdsOf(isInput);
        const inLinks = mapIndexed((i_1, tupledArg_6) => {
            const lab_1 = tupledArg_6[0];
            const labOutWidth_1 = tupledArg_6[1] | 0;
            const inp = find((tupledArg_7) => {
                const k_1 = tupledArg_7[0];
                const v_1 = tupledArg_7[1];
                return equalArrays(k_1, [lab_1, labOutWidth_1]);
            }, inputs)[1];
            return [[[cid_3, ap], i_1], [inp, ap$0027]];
        }, ct_1.InputLabels);
        return new GatherTemp(append(inLinks, gatherT.CustomInputCompLinksT), append(outLinks, gatherT.CustomOutputCompLinksT), append(labels, gatherT.Labels), gatherT.AllCompsT);
    }, customComps);
    return fold((total, thisGather) => (new GatherTemp(append(thisGather.CustomInputCompLinksT, total.CustomInputCompLinksT), append(thisGather.CustomOutputCompLinksT, total.CustomOutputCompLinksT), append(thisGather.Labels, total.Labels), append(thisGather.AllCompsT, total.AllCompsT))), topGather, insideCustomGathers);
}

/**
 * Convert the data in the a SimulationGraph, created from the circuit
 * into a final GatherData structure suitable for simulation stored as a set of maps
 * Calls createFlattenedSimulation as first step.
 */
export function gatherSimulation(graph) {
    let g, CustomInputCompLinks, CustomOutputCompLinks, Labels, AllComps;
    const startTime = getTimeMs();
    return instrumentInterval("gatherGraph", startTime, (g = createFlattenedSimulation(empty_1(), graph), (CustomInputCompLinks = ofList(g.CustomInputCompLinksT, {
        Compare: compareArrays,
    }), (CustomOutputCompLinks = ofList(g.CustomOutputCompLinksT, {
        Compare: compareArrays,
    }), (Labels = ofList(g.Labels, {
        Compare: compare,
    }), (AllComps = ofList(g.AllCompsT, {
        Compare: compareArrays,
    }), new GatherData(graph, CustomInputCompLinks, CustomOutputCompLinks, ofList(map((tupledArg) => {
        const k = tupledArg[0];
        const v = tupledArg[1];
        return [v, k];
    }, g.CustomOutputCompLinksT), {
        Compare: compareArrays,
    }), Labels, AllComps)))))));
}

/**
 * Add one driver changing the fs.Driver array reference.
 * Return a WaveIndex reference.
 * WaveIndex refrences are bound to specific component ports
 * and not unique per driver.
 */
export function addComponentWaveDrivers(f, fc, pType) {
    const makeWaveIndex = (index, pn, pType_1, arr) => (new WaveIndexT(index, fc.fId, pType_1, pn));
    const addStepArray = (pn_1, index_1, stepA) => {
        f.Drivers[index_1] = defaultArg(f.Drivers[index_1], new Driver(index_1, 0, stepA));
        const addWidth = (w, optDriver) => map_2((d) => (new Driver(d.Index, w, d.DriverData)), optDriver);
        const output = fc.Outputs[pn_1];
        f.Drivers[index_1] = addWidth(output.Width, f.Drivers[index_1]);
    };
    const ioLabelIsActive = (fc_1) => !equalArrays(FSharpMap__get_Item(f.FIOActive, [fc_1.FLabel, fc_1.fId[1]]).fId, fc_1.fId);
    return mapIndexed_1((pn_2, stepA_1) => {
        let this$, this$_1;
        const index_2 = stepA_1.Index | 0;
        let patternInput;
        const matchValue = fc.FType;
        let matchResult;
        switch (matchValue.tag) {
            case 3: {
                if (pType.tag === 0) {
                    matchResult = 0;
                }
                else if (ioLabelIsActive(fc)) {
                    matchResult = 2;
                }
                else {
                    matchResult = 3;
                }
                break;
            }
            case 0: {
                if (pType.tag === 0) {
                    matchResult = 0;
                }
                else {
                    matchResult = 3;
                }
                break;
            }
            case 2: {
                if (pType.tag === 0) {
                    matchResult = 0;
                }
                else {
                    matchResult = 3;
                }
                break;
            }
            case 4: {
                if (pType.tag === 0) {
                    matchResult = 0;
                }
                else {
                    matchResult = 3;
                }
                break;
            }
            case 1: {
                if (pType.tag === 0) {
                    matchResult = 0;
                }
                else {
                    matchResult = 3;
                }
                break;
            }
            case 7: {
                matchResult = 1;
                break;
            }
            default:
                matchResult = 3;
        }
        switch (matchResult) {
            case 0: {
                patternInput = [false, false];
                break;
            }
            case 1: {
                patternInput = [true, false];
                break;
            }
            case 2: {
                patternInput = [false, false];
                break;
            }
            default:
                patternInput = [true, true];
        }
        const addWave = patternInput[1];
        const addDriver = patternInput[0];
        if (equals(pType, new PortType(1, [])) && addDriver) {
            addStepArray(pn_2, index_2, stepA_1);
        }
        if (addWave) {
            const matchValue_2 = fc.FType;
            let matchResult_1;
            switch (matchValue_2.tag) {
                case 28:
                case 6:
                case 27:
                case 29:
                case 30:
                case 7: {
                    matchResult_1 = 0;
                    break;
                }
                case 1: {
                    if (!equals((this$ = fc, getSlice(0, length(this$.SheetName) - 2, this$.SheetName)), empty_1())) {
                        matchResult_1 = 1;
                    }
                    else {
                        matchResult_1 = 3;
                    }
                    break;
                }
                case 0: {
                    if (!equals((this$_1 = fc, getSlice(0, length(this$_1.SheetName) - 2, this$_1.SheetName)), empty_1())) {
                        matchResult_1 = 2;
                    }
                    else {
                        matchResult_1 = 3;
                    }
                    break;
                }
                default:
                    matchResult_1 = 3;
            }
            switch (matchResult_1) {
                case 0:
                    return [];
                case 1:
                    return [];
                case 2:
                    return [];
                default:
                    return [makeWaveIndex(index_2, pn_2, pType, stepA_1)];
            }
        }
        else {
            return [];
        }
    }, (pType.tag === 0) ? fc.InputLinks : fc.Outputs);
}

/**
 * Called after the fs.Drivers array is created.
 * waveComps must contain all components that can be viewed in the wave simulation.
 * This function mutates fs.Drivers adding the correct arrays where
 * these are used. In some cases an array may never be used and therefore is not added.
 * In parallel with this, the function returns an array of WaveIndexT records that
 * reference component ports which can be viewed in a wave simulation.
 * Every WaveIndex references an element of fs.Drivers from which the simulation data is found.
 */
export function addWaveIndexAndDrivers(waveComps, f) {
    const comps = map_1((tuple) => tuple[1], toArray_2(waveComps));
    const addDrivers = (pType, array_1) => collect_1((fc) => addComponentWaveDrivers(f, fc, pType), array_1);
    const outs = addDrivers(new PortType(1, []), comps);
    const ins = addDrivers(new PortType(0, []), comps);
    return concat(append_1(outs, ins));
}

/**
 * Changes all the custom component in and out StepArray links so they point to the correct drivers.
 * (fid, fc) must be a custom component.
 * Called after the simulation has been fully constructed and linked.
 */
export function linkFastCustomComponentsToDriverArrays(fs, fid_, fid__1, fc) {
    const fid = [fid_, fid__1];
    const cid = fid[0];
    const ap$0027 = fid[1];
    const ap = append(ap$0027, singleton(cid));
    let ct_1;
    const matchValue = fc.FType;
    if (matchValue.tag === 26) {
        const ct = matchValue.fields[0];
        ct_1 = ct;
    }
    else {
        ct_1 = toFail(printf("linkFastCustomComponent must be called with a custom component"));
    }
    let graph;
    const matchValue_1 = fc.SimComponent.CustomSimulationGraph;
    if (matchValue_1 == null) {
        graph = toFail(printf("What? Can\'t find customSimulationGraph"));
    }
    else {
        const g = matchValue_1;
        graph = g;
    }
    iterate((cid_1, sc) => {
        const matchValue_2 = sc.Type;
        switch (matchValue_2.tag) {
            case 0: {
                const w = matchValue_2.fields[0] | 0;
                const portNum = find((tupledArg) => {
                    const i = tupledArg[0] | 0;
                    const lab = tupledArg[1][0];
                    return lab === sc.Label;
                }, indexed(ct_1.InputLabels))[0] | 0;
                fc.InputLinks[portNum] = FSharpMap__get_Item(fs.FComps, [cid_1, ap]).Outputs[0];
                break;
            }
            case 1: {
                const w_1 = matchValue_2.fields[0] | 0;
                const portNum_1 = find((tupledArg_1) => {
                    const i_1 = tupledArg_1[0] | 0;
                    const lab_1 = tupledArg_1[1][0];
                    return lab_1 === sc.Label;
                }, indexed(ct_1.OutputLabels))[0] | 0;
                fc.Outputs[portNum_1] = FSharpMap__get_Item(fs.FComps, [cid_1, ap]).InputLinks[0];
                break;
            }
            default:
                0;
        }
    }, graph);
}

/**
 * Adds WaveComps, Drivers and WaveIndex fields to a fast simulation.
 * For use by waveform Simulator.
 * Needs to be run after widths are calculated.
 */
export function addWavesToFastSimulation(fs) {
    iterate((tupledArg, fc) => {
        linkFastCustomComponentsToDriverArrays(fs, tupledArg[0], tupledArg[1], fc);
    }, fs.FCustomComps);
    const waveComps = fold_1((s, fid, fc_1) => add(fid, fc_1, s), fs.FComps, fs.FCustomComps);
    let fs_1;
    const Drivers = fill(new Array(fs.NumStepArrays), 0, fs.NumStepArrays, void 0);
    fs_1 = (new FastSimulation(fs.ClockTick, fs.MaxArraySize, fs.FGlobalInputComps, fs.FConstantComps, fs.FClockedComps, fs.FOrderedComps, fs.FIOActive, fs.FIOLinks, fs.FComps, fs.FCustomComps, waveComps, fs.FSComps, fs.FCustomOutputCompLookup, fs.G, fs.NumStepArrays, Drivers, fs.WaveIndex, fs.ConnectionsByPort, fs.ComponentsById, fs.SimulatedCanvasState, fs.SimulatedTopSheet));
    const WaveIndex = addWaveIndexAndDrivers(waveComps, fs_1);
    return new FastSimulation(fs_1.ClockTick, fs_1.MaxArraySize, fs_1.FGlobalInputComps, fs_1.FConstantComps, fs_1.FClockedComps, fs_1.FOrderedComps, fs_1.FIOActive, fs_1.FIOLinks, fs_1.FComps, fs_1.FCustomComps, fs_1.WaveComps, fs_1.FSComps, fs_1.FCustomOutputCompLookup, fs_1.G, fs_1.NumStepArrays, fs_1.Drivers, WaveIndex, fs_1.ConnectionsByPort, fs_1.ComponentsById, fs_1.SimulatedCanvasState, fs_1.SimulatedTopSheet);
}

export function createInitFastCompPhase(simulationArraySize, g, f) {
    const numSteps = simulationArraySize | 0;
    stepArrayIndex(-1);
    const start = getTimeMs();
    const makeFastComp = (fid) => {
        const patternInput = FSharpMap__get_Item(g.AllComps, fid);
        const comp = patternInput[0];
        const ap = patternInput[1];
        const fc = createFastComponent(numSteps, comp, ap);
        let FullName;
        const tupledArg = fid;
        FullName = GatherData__getFullName_4E1F3B82(g, tupledArg[0], tupledArg[1]);
        let SheetName;
        const tupledArg_1 = fid;
        SheetName = GatherData__getSheetName_4E1F3B82(g, tupledArg_1[0], tupledArg_1[1]);
        return new FastComponent(fc.fId, fc.cId, fc.FType, fc.State, fc.Active, fc.UseBigInt, fc.BigIntState, fc.InputLinks, fc.InputDrivers, fc.Outputs, fc.SimComponent, fc.AccessPath, FullName, fc.FLabel, SheetName, fc.Touched, fc.DrivenComponents, fc.NumMissingInputValues, fc.VerilogOutputName, fc.VerilogComponentName);
    };
    const patternInput_1 = fold_1(uncurry3((tupledArg_2) => ((cid) => {
        const m = tupledArg_2[0];
        const mc = tupledArg_2[1];
        return (tupledArg_3) => {
            const comp_1 = tupledArg_3[0];
            const ap_1 = tupledArg_3[1];
            return isCustom(comp_1.Type) ? [m, add([comp_1.Id, ap_1], makeFastComp([comp_1.Id, ap_1]), mc)] : [add([comp_1.Id, ap_1], makeFastComp([comp_1.Id, ap_1]), m), mc];
        };
    })), [empty({
        Compare: compareArrays,
    }), empty({
        Compare: compareArrays,
    })], g.AllComps);
    const customComps = patternInput_1[1];
    const comps = patternInput_1[0];
    const customOutLookup = ofList(map((tupledArg_4) => {
        const a = tupledArg_4[0];
        const b = tupledArg_4[1];
        return [b, a];
    }, toList_1(g.CustomOutputCompLinks)), {
        Compare: compareArrays,
    });
    instrumentTime("createInitFastCompPhase", start);
    const NumStepArrays = (stepArrayIndex() + 1) | 0;
    return new FastSimulation(f.ClockTick, simulationArraySize, f.FGlobalInputComps, f.FConstantComps, f.FClockedComps, f.FOrderedComps, f.FIOActive, f.FIOLinks, comps, customComps, f.WaveComps, g.AllComps, customOutLookup, f.G, NumStepArrays, new Array(0), f.WaveIndex, f.ConnectionsByPort, f.ComponentsById, f.SimulatedCanvasState, f.SimulatedTopSheet);
}

function reLinkIOLabels(fs) {
    iterate_1((tupledArg) => {
        const _arg = tupledArg[0];
        const ioDriver = tupledArg[1];
        const ipn = _arg[1];
        const fcDriven = _arg[0];
        const labKey = [ioDriver.SimComponent.Label, ioDriver.AccessPath];
        const fcActiveDriver = FSharpMap__get_Item(fs.FIOActive, labKey);
        fcDriven.InputLinks[ipn] = fcActiveDriver.Outputs[0];
        fcDriven.InputDrivers[ipn] = [fcActiveDriver.fId, 0];
        const matchValue = getHybridComponentAsyncOuts(fcDriven.FType, ipn);
        let matchResult;
        if (matchValue != null) {
            if (!isEmpty(matchValue)) {
                matchResult = 0;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 0;
        }
        switch (matchResult) {
            case 0: {
                fcActiveDriver.DrivenComponents = cons(fcDriven, fcActiveDriver.DrivenComponents);
                break;
            }
        }
        ioDriver.Outputs[0] = fcActiveDriver.Outputs[0];
    }, fs.FIOLinks);
}

/**
 * Use the Outputs links from the original SimulationComponents in gather to link together the data arrays
 * of the FastComponents.
 * InputLinks[i] array is set equal to the correct driving Outputs array so that Input i reads the data reduced by the
 * correct output of the component that drives it.
 * The main work is dealing with custom components which represent whole design sheets with recursively defined component graphs
 * The custom component itself is not linked, and does not exist as a simulatable FastComponent.
 * Note: custom components are linked in later as unsimulatable placeholders to allow wave simulation to access ports
 * Instead its CustomSimulationGraph Input and Output components
 * are linked to the components that connect the corresponding inputs and outputs of the custom component.
 */
export function linkFastComponents(g, f) {
    const start = getTimeMs();
    const outer = (arg_1) => reverse(tail(reverse(arg_1)));
    const sComps = g.AllComps;
    const fComps = f.FComps;
    const getSComp = (tupledArg) => {
        const cid = tupledArg[0];
        const ap = tupledArg[1];
        const x = tryFind([cid, ap], sComps);
        if (x != null) {
            const comp = x;
            return comp[0];
        }
        else {
            return toFail(`Error in linkFastComponents: can't find
---${cid}
----${ap}
`);
        }
    };
    const apOf = (fid) => FSharpMap__get_Item(fComps, fid).AccessPath;
    const getLinks = (_arg_mut, opn_mut, ipnOpt_mut) => {
        let array;
        getLinks:
        while (true) {
            const _arg = _arg_mut, opn = opn_mut, ipnOpt = ipnOpt_mut;
            const cid_1 = _arg[0];
            const ap_1 = _arg[1];
            const sComp = getSComp([cid_1, ap_1]);
            const matchValue = isOutput(sComp.Type);
            const matchValue_1 = isCustom(sComp.Type);
            let matchResult, ipn, ipn_1, x_1;
            if (matchValue) {
                if (ipnOpt != null) {
                    if (matchValue_1) {
                        matchResult = 5;
                        x_1 = [matchValue, matchValue_1, ipnOpt];
                    }
                    else {
                        matchResult = 3;
                        ipn_1 = ipnOpt;
                    }
                }
                else if (equals(apOf([cid_1, ap_1]), empty_1())) {
                    matchResult = 0;
                }
                else {
                    matchResult = 1;
                }
            }
            else if (matchValue_1) {
                if (ipnOpt == null) {
                    matchResult = 4;
                }
                else {
                    matchResult = 2;
                    ipn = ipnOpt;
                }
            }
            else if (ipnOpt == null) {
                matchResult = 4;
            }
            else {
                matchResult = 3;
                ipn_1 = ipnOpt;
            }
            switch (matchResult) {
                case 0:
                    return [];
                case 1: {
                    const patternInput = FSharpMap__get_Item(g.CustomOutputCompLinks, [cid_1, ap_1]);
                    const opn_1 = patternInput[1];
                    const fid_1 = patternInput[0];
                    _arg_mut = fid_1;
                    opn_mut = opn_1;
                    ipnOpt_mut = void 0;
                    continue getLinks;
                }
                case 2:
                    return [[FSharpMap__get_Item(g.CustomInputCompLinks, [[cid_1, ap_1], ipn]), opn, 0]];
                case 3:
                    return [[[cid_1, ap_1], opn, ipn_1]];
                case 4:
                    return collect_1((tupledArg_2) => {
                        const opn_2 = tupledArg_2[0];
                        const lst = tupledArg_2[1];
                        return collect_1((tupledArg_3) => {
                            const cid_2 = tupledArg_3[0];
                            const ipn_2 = tupledArg_3[1];
                            return getLinks([cid_2, ap_1], opn_2, ipn_2);
                        }, toArray(lst));
                    }, (array = toArray_2(sComp.Outputs), array.filter((tupledArg_1) => {
                        const opn$0027 = tupledArg_1[0];
                        return equals(opn$0027, opn);
                    })));
                default: {
                    const tupledArg_4 = x_1;
                    return toFail(printf("Unexpected link match: %A"))([tupledArg_4[0], tupledArg_4[1], tupledArg_4[2]]);
                }
            }
            break;
        }
    };
    let linkCheck = empty({
        Compare: compareArrays,
    });
    iterate((fDriverId, fDriver) => {
        iterateIndexed((iOut, _arg_2) => {
            const array_4 = map_1((tupledArg_5) => {
                const fid_2 = tupledArg_5[0];
                const ip = tupledArg_5[2];
                return [fid_2, iOut, ip];
            }, getLinks(fDriverId, iOut, void 0));
            array_4.forEach((tupledArg_6) => {
                const fDrivenId = tupledArg_6[0];
                const opn_3 = tupledArg_6[1] | 0;
                const ipn_3 = tupledArg_6[2];
                const linked = tryFind([fDrivenId, ipn_3], linkCheck);
                if (linked != null) {
                    const opn_4 = linked[1];
                    const fid_3 = linked[0];
                    let arg_5;
                    const tupledArg_7 = fid_3;
                    arg_5 = GatherData__getFullName_4E1F3B82(g, tupledArg_7[0], tupledArg_7[1]);
                    toFail(printf("Multiple linkage: (previous driver was %A,%A)"))(arg_5)(opn_4);
                }
                linkCheck = add([fDrivenId, ipn_3], [fDriverId, opn_3], linkCheck);
                const fDriven = FSharpMap__get_Item(f.FComps, fDrivenId);
                const ap_2 = fDrivenId[1];
                if (isIOLabel(fDriven.FType)) {
                    const labelKey = [fDriven.SimComponent.Label, ap_2];
                    if (!containsKey(labelKey, f.FIOActive)) {
                        f.FIOActive = add(labelKey, fDriven, f.FIOActive);
                        fDriven.Active = true;
                    }
                }
                if (isIOLabel(fDriver.FType)) {
                    f.FIOLinks = cons([[fDriven, ipn_3], fDriver], f.FIOLinks);
                }
                else {
                    fDriven.InputLinks[ipn_3] = fDriver.Outputs[opn_3];
                    const matchValue_3 = getHybridComponentAsyncOuts(fDriven.FType, ipn_3);
                    let matchResult_1;
                    if (matchValue_3 != null) {
                        if (!isEmpty(matchValue_3)) {
                            matchResult_1 = 0;
                        }
                        else {
                            matchResult_1 = 1;
                        }
                    }
                    else {
                        matchResult_1 = 0;
                    }
                    switch (matchResult_1) {
                        case 0: {
                            fDriver.DrivenComponents = cons(fDriven, fDriver.DrivenComponents);
                            break;
                        }
                    }
                    fDriven.InputDrivers[ipn_3] = [fDriver.fId, opn_3];
                }
            });
        }, fDriver.Outputs);
    }, f.FComps);
    reLinkIOLabels(f);
    instrumentTime("linkFastComponents", start);
    return f;
}

export function determineBigIntState(f) {
    iterate((_arg, fc) => {
        const patternInput = findBigIntState(fc);
        const u = patternInput[0];
        const state = patternInput[1];
        fc.UseBigInt = u;
        fc.BigIntState = state;
    }, f.FComps);
    return f;
}

//# sourceMappingURL=FastCreate.fs.js.map
