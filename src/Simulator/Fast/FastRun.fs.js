import { compare, compareArrays, equals } from "../../fable_modules/fable-library.4.1.4/Util.js";
import { convertIntToFastData, convertInt64ToFastData, emptyFastData } from "../NumberHelpers.fs.js";
import { toFail, toConsole, printf, toText, join } from "../../fable_modules/fable-library.4.1.4/String.js";
import { singleton, append, delay, toList } from "../../fable_modules/fable-library.4.1.4/Seq.js";
import { forAll, tail, head, isEmpty, map as map_4, toArray as toArray_1, length, cons, iterate, ofArray, empty } from "../../fable_modules/fable-library.4.1.4/List.js";
import { isHybridComponent, couldBeSynchronousComponent } from "../SynchronousUtils.fs.js";
import { tryItem, collect, concat, reverse, iterateIndexed, map as map_2 } from "../../fable_modules/fable-library.4.1.4/Array.js";
import { bind, map as map_3 } from "../../fable_modules/fable-library.4.1.4/Option.js";
import { toList as toList_2, map as map_5, filter, iterate as iterate_1, FSharpMap__get_Count, tryFind, toArray, FSharpMap__get_Item } from "../../fable_modules/fable-library.4.1.4/Map.js";
import { evalExp, FSInterface, FastData, FastBits, FData__get_Width, SimulationError, SimulationErrorType, FData, FastSimulation, SimulationComponentState, FastComponent__get_ShortId } from "../SimulatorTypes.fs.js";
import { instrumentTime, getTimeMs } from "../../Common/TimeHelpers.fs.js";
import { fastReduceFData, fastReduce } from "./FastReduce.fs.js";
import { toUInt32, fromUInt32, fromInt32, fromZero } from "../../fable_modules/fable-library.4.1.4/BigInt.js";
import { FSharpSet_op_Subtraction, toList as toList_1, ofSeq } from "../../fable_modules/fable-library.4.1.4/Set.js";
import { Result_Map, FSharpResult$2 } from "../../fable_modules/fable-library.4.1.4/Choice.js";
import { isInput } from "../../Common/Helpers.fs.js";
import { addWavesToFastSimulation, emptyFastSimulation, createInitFastCompPhase, linkFastComponents, determineBigIntState, gatherSimulation } from "./FastCreate.fs.js";
import { loadedComponentIsSameAsProject } from "../Extractor.fs.js";

export const Constants_maxSimulationTime = Math.pow(1, 10);

export const Constants_numberOfStepsBeforeTimeCheck = 5;

function isValidFData(fd) {
    if (fd.tag === 0) {
        const d = fd.fields[0];
        return !equals(d, emptyFastData);
    }
    else {
        return false;
    }
}

function isValidData(fd) {
    return fd.Width !== 0;
}

/**
 * print function for debugging
 */
export function printComp(fs, step, fc) {
    let ct_3, ct_1_1;
    const attr = join("", toList(delay(() => {
        let comp, matchValue, ct, ct_2, ct_1;
        return append(((comp = fc, (matchValue = comp.FType, (matchValue.tag === 0) ? (equals(comp.AccessPath, empty()) ? false : (((ct = matchValue, couldBeSynchronousComponent(ct))) ? ((ct_2 = matchValue, false)) : true)) : ((matchValue.tag === 42) ? true : (((ct_1 = matchValue, couldBeSynchronousComponent(ct_1))) ? ((ct_2 = matchValue, false)) : true))))) ? singleton("Co") : singleton("  "), delay(() => append(fc.Touched ? singleton("T") : singleton("U"), delay(() => append(fc.Active ? singleton("Act") : singleton("Inact"), delay(() => append(singleton("    "), delay(() => singleton(join("", map_2((_arg) => {
            if (_arg) {
                return "*";
            }
            else {
                return "X";
            }
        }, map_2((arr) => {
            if ((arr.UInt32Step.length > 0) ? true : (arr.BigIntStep.length > 0)) {
                return isValidData(arr);
            }
            else {
                return false;
            }
        }, fc.InputLinks))))))))))));
    })));
    const ins = map_2((option) => map_3((tupledArg) => {
        const fid = tupledArg[0];
        const fc_1 = FSharpMap__get_Item(fs.FComps, fid);
        return [fc_1.FullName, FastComponent__get_ShortId(fc_1)];
    }, option), fc.InputDrivers);
    const arg = FastComponent__get_ShortId(fc);
    let arg_3;
    const fc_2 = fc;
    if (((fc_2.NumMissingInputValues === 0) && !fc_2.Touched) && fc_2.Active) {
        const comp_1 = fc_2;
        const matchValue_1 = comp_1.FType;
        let matchResult, ct_2_1;
        switch (matchValue_1.tag) {
            case 0: {
                if (equals(comp_1.AccessPath, empty())) {
                    matchResult = 0;
                }
                else if ((ct_3 = matchValue_1, couldBeSynchronousComponent(ct_3))) {
                    matchResult = 2;
                    ct_2_1 = matchValue_1;
                }
                else {
                    matchResult = 3;
                }
                break;
            }
            case 42: {
                matchResult = 1;
                break;
            }
            default:
                if ((ct_1_1 = matchValue_1, couldBeSynchronousComponent(ct_1_1))) {
                    matchResult = 2;
                    ct_2_1 = matchValue_1;
                }
                else {
                    matchResult = 3;
                }
        }
        switch (matchResult) {
            case 0: {
                arg_3 = false;
                break;
            }
            case 1: {
                arg_3 = true;
                break;
            }
            case 2: {
                arg_3 = false;
                break;
            }
            default:
                arg_3 = true;
        }
    }
    else {
        arg_3 = false;
    }
    return toText(printf("%25s %s %15s %A %A"))(arg)(fc.FullName)(attr)(arg_3)(ins);
}

function printComps(step, fs) {
    const arg = join("\n", map_2((fComp) => printComp(fs, step, fComp), map_2((tuple) => tuple[1], toArray(fs.FComps))));
    toConsole(printf("COMPONENTS\n----------------\n%s\n---------------"))(arg);
}

function orderCombinationalComponents(numSteps, fs) {
    const startTime = getTimeMs();
    let readyToReduce = empty();
    let orderedComps = ofArray(fs.FConstantComps);
    const propagateEval = (fc) => {
        iterate((fc$0027) => {
            let fc_1, comp, matchValue, ct, ct_2, ct_1;
            fc$0027.NumMissingInputValues = ((fc$0027.NumMissingInputValues - 1) | 0);
            if ((fc_1 = fc$0027, (((fc_1.NumMissingInputValues === 0) && !fc_1.Touched) && fc_1.Active) && ((comp = fc_1, (matchValue = comp.FType, (matchValue.tag === 0) ? (equals(comp.AccessPath, empty()) ? false : (((ct = matchValue, couldBeSynchronousComponent(ct))) ? ((ct_2 = matchValue, false)) : true)) : ((matchValue.tag === 42) ? true : (((ct_1 = matchValue, couldBeSynchronousComponent(ct_1))) ? ((ct_2 = matchValue, false)) : true))))))) {
                readyToReduce = cons(fc$0027, readyToReduce);
            }
        }, fc.DrivenComponents);
    };
    const init = (fc_2) => {
        fastReduce(1, 0, false, fc_2);
        fc_2.Touched = true;
        propagateEval(fc_2);
    };
    const initInput = (fc_3) => {
        let inputVal;
        let value;
        const matchValue_1 = fc_3.FType;
        if (matchValue_1.tag === 0) {
            const w = matchValue_1.fields[0] | 0;
            const defaultVal = matchValue_1.fields[1];
            if (defaultVal == null) {
                value = 0;
            }
            else {
                const defaultVal_1 = defaultVal | 0;
                value = defaultVal_1;
            }
        }
        else {
            toConsole(printf("non-input type component in initInput"));
            value = 0;
        }
        inputVal = (value >>> 0);
        fastReduce(fs.MaxArraySize, 0, false, fc_3);
        fc_3.Touched = true;
        propagateEval(fc_3);
    };
    const initClockedOuts = (fc_4) => {
        iterateIndexed((i, vec) => {
            let w_2, w_6;
            if (!isHybridComponent(fc_4.FType)) {
                fc_4.Touched = true;
                propagateEval(fc_4);
            }
            const matchValue_2 = fc_4.FType;
            const matchValue_3 = fc_4.Outputs[i].Width | 0;
            let matchResult, mem, w_1;
            switch (matchValue_2.tag) {
                case 41: {
                    matchResult = 0;
                    mem = matchValue_2.fields[0];
                    w_1 = matchValue_3;
                    break;
                }
                case 42: {
                    matchResult = 0;
                    mem = matchValue_2.fields[0];
                    w_1 = matchValue_3;
                    break;
                }
                default:
                    matchResult = 1;
            }
            switch (matchResult) {
                case 0: {
                    const matchValue_5 = fc_4.State;
                    if (matchValue_5 != null) {
                        const arr = matchValue_5;
                        arr.Step[0] = (new SimulationComponentState(3, [mem]));
                    }
                    else {
                        toFail(printf("Component %s does not have correct state vector"))(fc_4.FullName);
                    }
                    let initD;
                    const matchValue_6 = tryFind(0n, mem.Data);
                    if (matchValue_6 != null) {
                        const n_1 = matchValue_6;
                        initD = convertInt64ToFastData(w_1, n_1);
                    }
                    else {
                        initD = convertIntToFastData(w_1, 0);
                    }
                    const matchValue_7 = vec.Width | 0;
                    if ((w_2 = (matchValue_7 | 0), w_2 <= 32)) {
                        const w_3 = matchValue_7 | 0;
                        vec.UInt32Step[0] = 0;
                    }
                    else {
                        const w_4 = matchValue_7 | 0;
                        vec.BigIntStep[0] = fromZero();
                    }
                    break;
                }
                case 1: {
                    const w_5 = matchValue_3 | 0;
                    const matchValue_8 = vec.Width | 0;
                    if ((w_6 = (matchValue_8 | 0), w_6 <= 32)) {
                        const w_7 = matchValue_8 | 0;
                        vec.UInt32Step[0] = 0;
                    }
                    else {
                        const w_8 = matchValue_8 | 0;
                        vec.BigIntStep[0] = fromZero();
                    }
                    break;
                }
            }
        }, fc_4.Outputs);
    };
    const pp = (fL) => join(",", map_2((fc_5) => toText(printf("%A (%A)"))(fc_5.FullName)(fc_5.FType), fL));
    fs.FClockedComps.forEach(initClockedOuts);
    fs.FConstantComps.forEach(init);
    fs.FGlobalInputComps.forEach(initInput);
    const arg_3 = fs.FConstantComps.length | 0;
    const arg_4 = fs.FGlobalInputComps.length | 0;
    const arg_5 = fs.FClockedComps.length | 0;
    const arg_6 = length(readyToReduce) | 0;
    const arg_7 = FSharpMap__get_Count(fs.FComps) | 0;
    toConsole(printf("%d constant, %d input, %d clocked, %d ready to reduce from %d"))(arg_3)(arg_4)(arg_5)(arg_6)(arg_7);
    while (length(readyToReduce) !== 0) {
        const readyL = readyToReduce;
        readyToReduce = empty();
        iterate((fc_6) => {
            fastReduce(fs.MaxArraySize, 0, false, fc_6);
            orderedComps = cons(fc_6, orderedComps);
            fc_6.Touched = true;
            propagateEval(fc_6);
        }, readyL);
    }
    const orderedSet = ofSeq(map_2((co) => co.fId, toArray_1(orderedComps)), {
        Compare: compareArrays,
    });
    instrumentTime("orderCombinationalComponents", startTime);
    const FOrderedComps = reverse(toArray_1(orderedComps));
    return new FastSimulation(fs.ClockTick, fs.MaxArraySize, fs.FGlobalInputComps, fs.FConstantComps, fs.FClockedComps, FOrderedComps, fs.FIOActive, fs.FIOLinks, fs.FComps, fs.FCustomComps, fs.WaveComps, fs.FSComps, fs.FCustomOutputCompLookup, fs.G, fs.NumStepArrays, fs.Drivers, fs.WaveIndex, fs.ConnectionsByPort, fs.ComponentsById, fs.SimulatedCanvasState, fs.SimulatedTopSheet);
}

function orderCombinationalComponentsFData(numSteps, fs) {
    const startTime = getTimeMs();
    let readyToReduce = empty();
    let orderedComps = ofArray(fs.FConstantComps);
    const propagateEval = (fc) => {
        iterate((fc$0027) => {
            let fc_1, comp, matchValue, ct, ct_2, ct_1;
            fc$0027.NumMissingInputValues = ((fc$0027.NumMissingInputValues - 1) | 0);
            if ((fc_1 = fc$0027, (((fc_1.NumMissingInputValues === 0) && !fc_1.Touched) && fc_1.Active) && ((comp = fc_1, (matchValue = comp.FType, (matchValue.tag === 0) ? (equals(comp.AccessPath, empty()) ? false : (((ct = matchValue, couldBeSynchronousComponent(ct))) ? ((ct_2 = matchValue, false)) : true)) : ((matchValue.tag === 42) ? true : (((ct_1 = matchValue, couldBeSynchronousComponent(ct_1))) ? ((ct_2 = matchValue, false)) : true))))))) {
                readyToReduce = cons(fc$0027, readyToReduce);
            }
        }, fc.DrivenComponents);
    };
    const init = (fc_2) => {
        fastReduceFData(0, 0, false, fc_2);
        fc_2.Touched = true;
        propagateEval(fc_2);
    };
    const initInput = (fc_3) => {
        let inputVal;
        let value;
        const matchValue_1 = fc_3.FType;
        if (matchValue_1.tag === 0) {
            const w = matchValue_1.fields[0] | 0;
            const defaultVal = matchValue_1.fields[1];
            if (defaultVal == null) {
                value = 0;
            }
            else {
                const defaultVal_1 = defaultVal | 0;
                value = defaultVal_1;
            }
        }
        else {
            toConsole(printf("non-input type component in initInput"));
            value = 0;
        }
        inputVal = (value >>> 0);
        iterateIndexed((i, _arg) => {
            fc_3.InputLinks[0].FDataStep[i] = (new FData(0, [convertIntToFastData(fc_3.Outputs[0].Width, 0)]));
        }, fc_3.InputLinks[0].FDataStep);
        fastReduceFData(fs.MaxArraySize, 0, false, fc_3);
        fc_3.Touched = true;
        propagateEval(fc_3);
    };
    const initClockedOuts = (fc_4) => {
        iterateIndexed((i_1, vec) => {
            if (!isHybridComponent(fc_4.FType)) {
                fc_4.Touched = true;
                propagateEval(fc_4);
            }
            const matchValue_2 = fc_4.FType;
            const matchValue_3 = fc_4.Outputs[i_1].Width | 0;
            let matchResult, mem, w_1;
            switch (matchValue_2.tag) {
                case 41: {
                    matchResult = 0;
                    mem = matchValue_2.fields[0];
                    w_1 = matchValue_3;
                    break;
                }
                case 42: {
                    matchResult = 0;
                    mem = matchValue_2.fields[0];
                    w_1 = matchValue_3;
                    break;
                }
                default:
                    matchResult = 1;
            }
            switch (matchResult) {
                case 0: {
                    const matchValue_5 = fc_4.State;
                    if (matchValue_5 != null) {
                        const arr = matchValue_5;
                        arr.Step[0] = (new SimulationComponentState(3, [mem]));
                    }
                    else {
                        toFail(printf("Component %s does not have correct state vector"))(fc_4.FullName);
                    }
                    let initD;
                    const matchValue_6 = tryFind(0n, mem.Data);
                    if (matchValue_6 != null) {
                        const n_2 = matchValue_6;
                        initD = convertInt64ToFastData(w_1, n_2);
                    }
                    else {
                        initD = convertIntToFastData(w_1, 0);
                    }
                    vec.FDataStep[0] = (new FData(0, [convertIntToFastData(w_1, 0)]));
                    break;
                }
                case 1: {
                    const w_2 = matchValue_3 | 0;
                    vec.FDataStep[0] = (new FData(0, [convertIntToFastData(w_2, 0)]));
                    break;
                }
            }
        }, fc_4.Outputs);
    };
    const pp = (fL) => join(",", map_2((fc_5) => toText(printf("%A (%A)"))(fc_5.FullName)(fc_5.FType), fL));
    fs.FClockedComps.forEach(initClockedOuts);
    fs.FConstantComps.forEach(init);
    fs.FGlobalInputComps.forEach(initInput);
    const arg_3 = fs.FConstantComps.length | 0;
    const arg_4 = fs.FGlobalInputComps.length | 0;
    const arg_5 = fs.FClockedComps.length | 0;
    const arg_6 = length(readyToReduce) | 0;
    const arg_7 = FSharpMap__get_Count(fs.FComps) | 0;
    toConsole(printf("%d constant, %d input, %d clocked, %d ready to reduce from %d"))(arg_3)(arg_4)(arg_5)(arg_6)(arg_7);
    while (length(readyToReduce) !== 0) {
        const readyL = readyToReduce;
        readyToReduce = empty();
        iterate((fc_6) => {
            fastReduceFData(fs.MaxArraySize, 0, false, fc_6);
            orderedComps = cons(fc_6, orderedComps);
            fc_6.Touched = true;
            propagateEval(fc_6);
        }, readyL);
    }
    const orderedSet = ofSeq(map_2((co) => co.fId, toArray_1(orderedComps)), {
        Compare: compareArrays,
    });
    instrumentTime("orderCombinationalComponents", startTime);
    const FOrderedComps = reverse(toArray_1(orderedComps));
    return new FastSimulation(fs.ClockTick, fs.MaxArraySize, fs.FGlobalInputComps, fs.FConstantComps, fs.FClockedComps, FOrderedComps, fs.FIOActive, fs.FIOLinks, fs.FComps, fs.FCustomComps, fs.WaveComps, fs.FSComps, fs.FCustomOutputCompLookup, fs.G, fs.NumStepArrays, fs.Drivers, fs.WaveIndex, fs.ConnectionsByPort, fs.ComponentsById, fs.SimulatedCanvasState, fs.SimulatedTopSheet);
}

/**
 * Check all the active FastComponents to ensure everything is valid
 * Use data from initialisation to write any not-yet-written component output widths
 */
export function checkAndValidate(fs) {
    const start = getTimeMs();
    let activeComps;
    const array_1 = map_2((tuple) => tuple[1], toArray(fs.FComps));
    activeComps = array_1.filter((fc) => fc.Active);
    const inSimulationComps = concat([fs.FClockedComps.filter((fc_1) => !isHybridComponent(fc_1.FType)), fs.FGlobalInputComps, fs.FOrderedComps]);
    if (activeComps.length !== inSimulationComps.length) {
        const arg = activeComps.length | 0;
        const arg_1 = inSimulationComps.length | 0;
        toConsole(printf("Validation problem: %d active components, %d components in simulation"))(arg)(arg_1);
        inSimulationComps.forEach((fc_2) => {
            const arg_2 = printComp(fs, 0, fc_2);
            toConsole(printf("Simulation: %s\n"))(arg_2);
        });
        iterate_1((fid, fc_3) => {
            const arg_3 = printComp(fs, 0, fc_3);
            toConsole(printf("FComps: %s\n"))(arg_3);
        }, fs.FComps);
        const possibleCycleComps = toList_1(FSharpSet_op_Subtraction(ofSeq(map_4((fc_4) => fc_4.SimComponent.Id, ofArray(activeComps)), {
            Compare: compare,
        }), ofSeq(map_4((fc_5) => fc_5.SimComponent.Id, ofArray(inSimulationComps)), {
            Compare: compare,
        })));
        return new FSharpResult$2(1, [new SimulationError(new SimulationErrorType(14, ["Issie has discovered an asynchronous cyclic path in your circuit - probably through asynchronous RAM address and dout ports. This is not allowed.This cycle detection is not precise, the components in red comprise this cycle and all components driven only from it"]), void 0, possibleCycleComps, empty())]);
    }
    else {
        activeComps.forEach((fc_6) => {
            iterateIndexed((i, output) => {
                let n, m;
                const width = fc_6.Outputs[i].Width | 0;
                const matchValue = output.Width | 0;
                if ((n = (width | 0), (m = (matchValue | 0), n !== m))) {
                    const n_1 = width | 0;
                    const m_1 = matchValue | 0;
                    toFail(printf("Inconsistent simulation data width found on signal output width %d from %A %s:%d"))(m_1)(fc_6.FType)(fc_6.FullName)(i);
                }
                else if (width === 0) {
                    toFail(printf("Unexpected output data width %A found on initialised component %A %s:%d"))(width)(fc_6.FType)(fc_6.FullName)(i);
                }
            }, fc_6.Outputs);
        });
        instrumentTime("checkAndValidate", start);
        return new FSharpResult$2(0, [fs]);
    }
}

export function checkAndValidateFData(fs) {
    const start = getTimeMs();
    let activeComps;
    const array_1 = map_2((tuple) => tuple[1], toArray(fs.FComps));
    activeComps = array_1.filter((fc) => fc.Active);
    const inSimulationComps = concat([fs.FClockedComps.filter((fc_1) => !isHybridComponent(fc_1.FType)), fs.FGlobalInputComps, fs.FOrderedComps]);
    if (activeComps.length !== inSimulationComps.length) {
        const arg = activeComps.length | 0;
        const arg_1 = inSimulationComps.length | 0;
        toConsole(printf("Validation problem: %d active components, %d components in simulation"))(arg)(arg_1);
        inSimulationComps.forEach((fc_2) => {
            const arg_2 = printComp(fs, 0, fc_2);
            toConsole(printf("Simulation: %s\n"))(arg_2);
        });
        iterate_1((fid, fc_3) => {
            const arg_3 = printComp(fs, 0, fc_3);
            toConsole(printf("FComps: %s\n"))(arg_3);
        }, fs.FComps);
        const possibleCycleComps = toList_1(FSharpSet_op_Subtraction(ofSeq(map_4((fc_4) => fc_4.SimComponent.Id, ofArray(activeComps)), {
            Compare: compare,
        }), ofSeq(map_4((fc_5) => fc_5.SimComponent.Id, ofArray(inSimulationComps)), {
            Compare: compare,
        })));
        return new FSharpResult$2(1, [new SimulationError(new SimulationErrorType(14, ["Issie has discovered an asynchronous cyclic path in your circuit - probably through asynchronous RAM address and dout ports. This is not allowed.This cycle detection is not precise, the components in red comprise this cycle and all components driven only from it"]), void 0, possibleCycleComps, empty())]);
    }
    else {
        activeComps.forEach((fc_6) => {
            iterateIndexed((i, output) => {
                let n, m;
                const data = fc_6.Outputs[i].FDataStep[0];
                const matchValue = FData__get_Width(data) | 0;
                const matchValue_1 = output.Width | 0;
                if ((n = (matchValue | 0), (m = (matchValue_1 | 0), n !== m))) {
                    const n_1 = matchValue | 0;
                    const m_1 = matchValue_1 | 0;
                    toFail(printf("Inconsistent simulation data %A data found on signal output width %d from %s:%d"))(data)(m_1)(fc_6.FullName)(i);
                }
                else if (matchValue === 0) {
                    toFail(printf("Unexpected output data %A found on initialised component %s:%d"))(data)(fc_6.FullName)(i);
                }
            }, fc_6.Outputs);
        });
        instrumentTime("checkAndValidate", start);
        return new FSharpResult$2(0, [fs]);
    }
}

export function createFastArrays(fs, gather) {
    const getArrayOf = (pred, fComps) => map_2((tuple) => tuple[1], toArray(filter((cid, comp) => pred(comp), fComps)));
    const FGlobalInputComps = getArrayOf((fc) => (isInput(fc.FType) && equals(fc.AccessPath, empty())), fs.FComps);
    const FConstantComps = getArrayOf((fc_1) => (fc_1.FType.tag === 7), fs.FComps);
    const FClockedComps = getArrayOf((fc_2) => couldBeSynchronousComponent(fc_2.FType), fs.FComps);
    return new FastSimulation(fs.ClockTick, fs.MaxArraySize, FGlobalInputComps, FConstantComps, FClockedComps, new Array(0), fs.FIOActive, fs.FIOLinks, fs.FComps, fs.FCustomComps, fs.WaveComps, gather.AllComps, fs.FCustomOutputCompLookup, gather, fs.NumStepArrays, fs.Drivers, fs.WaveIndex, fs.ConnectionsByPort, fs.ComponentsById, fs.SimulatedCanvasState, fs.SimulatedTopSheet);
}

/**
 * Create a fast simulation data structure, with all necessary arrays, and components
 * ordered for evaluation.
 * This function also creates the reducer functions for each component
 * similar to the reducer builder in Builder, but with inputs and outputs using the FastSimulation
 * mutable arrays
 */
export function buildFastSimulation(simulationArraySize, diagramName, graph) {
    const gather = gatherSimulation(graph);
    const fs = determineBigIntState(linkFastComponents(gather, createInitFastCompPhase(simulationArraySize, gather, emptyFastSimulation(diagramName))));
    return Result_Map(addWavesToFastSimulation, checkAndValidate(orderCombinationalComponents(simulationArraySize, createFastArrays(fs, gather))));
}

export function buildFastSimulationFData(simulationArraySize, diagramName, graph) {
    const gather = gatherSimulation(graph);
    const fs = linkFastComponents(gather, createInitFastCompPhase(simulationArraySize, gather, emptyFastSimulation(diagramName)));
    return Result_Map(addWavesToFastSimulation, checkAndValidateFData(orderCombinationalComponentsFData(simulationArraySize, createFastArrays(fs, gather))));
}

function propagateInputsFromLastStep(step, fastSim) {
    const stepsim = ((step === 0) ? fastSim.MaxArraySize : step) | 0;
    fastSim.FGlobalInputComps.forEach((fc) => {
        const vec = fc.Outputs[0];
        if (vec.Width > 32) {
            vec.BigIntStep[step] = vec.BigIntStep[stepsim - 1];
        }
        else {
            vec.UInt32Step[step] = vec.UInt32Step[stepsim - 1];
        }
    });
}

function setInputstoDefault(fastSim) {
    fastSim.FGlobalInputComps.forEach((fc) => {
        const matchValue = fc.FType;
        if (matchValue.tag === 0) {
            const w = matchValue.fields[0] | 0;
            const defaultVal = matchValue.fields[1];
            if (defaultVal == null) {
            }
            else {
                const defaultVal_1 = defaultVal | 0;
                const vec = fc.Outputs[0];
                if (vec.Width > 32) {
                    vec.BigIntStep[0] = fromInt32(defaultVal_1);
                }
                else {
                    vec.UInt32Step[0] = (defaultVal_1 >>> 0);
                }
            }
        }
    });
}

function stepSimulation(fs) {
    let numStep, numStep_1;
    const index = ((fs.ClockTick + 1) % fs.MaxArraySize) | 0;
    propagateInputsFromLastStep(index, fs);
    fs.FClockedComps.forEach((numStep = ((fs.ClockTick + 1) | 0), (comp) => {
        fastReduce(fs.MaxArraySize, numStep, true, comp);
    }));
    fs.FOrderedComps.forEach((numStep_1 = ((fs.ClockTick + 1) | 0), (comp_1) => {
        fastReduce(fs.MaxArraySize, numStep_1, false, comp_1);
    }));
    fs.ClockTick = ((fs.ClockTick + 1) | 0);
}

function restartSimulation(fs) {
    setInputstoDefault(fs);
    fs.FClockedComps.forEach((comp) => {
        fastReduce(fs.MaxArraySize, 0, true, comp);
    });
    fs.FOrderedComps.forEach((comp_1) => {
        fastReduce(fs.MaxArraySize, 0, false, comp_1);
    });
    fs.ClockTick = 0;
}

function setSimulationInput(cid, fd, step, fs) {
    let w, fc, matchValue_3, n_1, n, this$_1, matchValue_4, n_3, n_2, n_1_1;
    const matchValue = tryFind([cid, empty()], fs.FComps);
    const matchValue_1 = fd.Width | 0;
    if (matchValue == null) {
        toFail(printf("Can\'t find %A in FastSim"))(cid);
    }
    else if ((w = (matchValue_1 | 0), (fc = matchValue, w > 32))) {
        const fc_1 = matchValue;
        const w_1 = matchValue_1 | 0;
        fc_1.Outputs[0].BigIntStep[step % fs.MaxArraySize] = ((matchValue_3 = fd.Dat, (matchValue_3.tag === 1) ? ((n_1 = matchValue_3.fields[0], n_1)) : ((n = matchValue_3.fields[0], fromUInt32(n)))));
    }
    else {
        const fc_2 = matchValue;
        const w_2 = matchValue_1 | 0;
        fc_2.Outputs[0].UInt32Step[step % fs.MaxArraySize] = ((this$_1 = fd, (matchValue_4 = this$_1.Dat, (matchValue_4.tag === 1) ? (((n_3 = matchValue_4.fields[0], this$_1.Width <= 32)) ? ((n_2 = matchValue_4.fields[0], toUInt32(n_2) >>> 0)) : toFail(printf("GetQint32 Can\'t turn Alg into a uint32"))) : ((n_1_1 = matchValue_4.fields[0], n_1_1)))));
    }
}

function setSimulationInputFData(cid, fd, step, fs) {
    const matchValue = tryFind([cid, empty()], fs.FComps);
    if (matchValue == null) {
        toFail(printf("Can\'t find %A in FastSim"))(cid);
    }
    else {
        const fc = matchValue;
        fc.Outputs[0].FDataStep[step % fs.MaxArraySize] = fd;
    }
}

function runCombinationalLogic(step, fastSim) {
    fastSim.FOrderedComps.forEach((comp) => {
        fastReduce(fastSim.MaxArraySize, step, false, comp);
    });
}

function runCombinationalLogicFData(step, fastSim) {
    fastSim.FOrderedComps.forEach((comp) => {
        fastReduceFData(fastSim.MaxArraySize, step, false, comp);
    });
}

/**
 * Change an input and make simulation correct. N.B. step must be the latest
 * time-step since future steps are not rerun (TODO: perhaps they should be!)
 */
export function changeInput(cid, input, step, fastSim) {
    let fd_1;
    if (input.tag === 1) {
        fd_1 = toFail(printf("Algebraic inputs not supported."));
    }
    else {
        const fd = input.fields[0];
        fd_1 = fd;
    }
    setSimulationInput(cid, fd_1, step, fastSim);
    runCombinationalLogic(step, fastSim);
}

export function changeInputFData(cid, input, step, fastSim) {
    let fd_1;
    if (input.tag === 1) {
        const exp = input.fields[0];
        fd_1 = (new FData(1, [exp]));
    }
    else {
        const fd = input.fields[0];
        fd_1 = (new FData(0, [fd]));
    }
    setSimulationInputFData(cid, fd_1, step, fastSim);
    runCombinationalLogicFData(step, fastSim);
}

/**
 * Change multiple inputs in one batch before re-running the simulation
 * NOTE - Only used in TruthTable
 */
export function changeInputBatch(step, fastSim, changes) {
    iterate((tupledArg) => {
        const cid = tupledArg[0];
        const input = tupledArg[1];
        let fd_1;
        if (input.tag === 1) {
            const exp = input.fields[0];
            fd_1 = (new FData(1, [exp]));
        }
        else {
            const fd = input.fields[0];
            fd_1 = (new FData(0, [fd]));
        }
        setSimulationInputFData(cid, fd_1, step, fastSim);
    }, changes);
    runCombinationalLogicFData(step, fastSim);
}

export function extractStatefulComponents(step, fastSim) {
    return collect((fc) => {
        let w, w_1, w_2, w_3, w_4, w_5;
        if (isEmpty(fc.AccessPath)) {
            const matchValue_1 = fc.FType;
            let matchResult, w_6;
            switch (matchValue_1.tag) {
                case 33: {
                    if ((w = (matchValue_1.fields[0] | 0), w > 32)) {
                        matchResult = 0;
                        w_6 = matchValue_1.fields[0];
                    }
                    else {
                        matchResult = 1;
                    }
                    break;
                }
                case 34: {
                    if ((w_1 = (matchValue_1.fields[0] | 0), w_1 > 32)) {
                        matchResult = 0;
                        w_6 = matchValue_1.fields[0];
                    }
                    else {
                        matchResult = 1;
                    }
                    break;
                }
                case 35: {
                    if ((w_2 = (matchValue_1.fields[0] | 0), w_2 > 32)) {
                        matchResult = 0;
                        w_6 = matchValue_1.fields[0];
                    }
                    else {
                        matchResult = 1;
                    }
                    break;
                }
                case 37: {
                    if ((w_3 = (matchValue_1.fields[0] | 0), w_3 > 32)) {
                        matchResult = 0;
                        w_6 = matchValue_1.fields[0];
                    }
                    else {
                        matchResult = 1;
                    }
                    break;
                }
                case 36: {
                    if ((w_4 = (matchValue_1.fields[0] | 0), w_4 > 32)) {
                        matchResult = 0;
                        w_6 = matchValue_1.fields[0];
                    }
                    else {
                        matchResult = 1;
                    }
                    break;
                }
                case 38: {
                    if ((w_5 = (matchValue_1.fields[0] | 0), w_5 > 32)) {
                        matchResult = 0;
                        w_6 = matchValue_1.fields[0];
                    }
                    else {
                        matchResult = 1;
                    }
                    break;
                }
                default:
                    matchResult = 1;
            }
            switch (matchResult) {
                case 0:
                    return [[fc, new SimulationComponentState(2, [new FastData(new FastBits(1, [fc.Outputs[0].BigIntStep[step % fastSim.MaxArraySize]]), w_6)])]];
                default: {
                    let matchResult_1, w_7;
                    switch (matchValue_1.tag) {
                        case 31:
                        case 32: {
                            matchResult_1 = 0;
                            break;
                        }
                        case 40: {
                            matchResult_1 = 2;
                            break;
                        }
                        case 41:
                        case 42: {
                            matchResult_1 = 3;
                            break;
                        }
                        case 33: {
                            matchResult_1 = 1;
                            w_7 = matchValue_1.fields[0];
                            break;
                        }
                        case 34: {
                            matchResult_1 = 1;
                            w_7 = matchValue_1.fields[0];
                            break;
                        }
                        case 35: {
                            matchResult_1 = 1;
                            w_7 = matchValue_1.fields[0];
                            break;
                        }
                        case 37: {
                            matchResult_1 = 1;
                            w_7 = matchValue_1.fields[0];
                            break;
                        }
                        case 36: {
                            matchResult_1 = 1;
                            w_7 = matchValue_1.fields[0];
                            break;
                        }
                        case 38: {
                            matchResult_1 = 1;
                            w_7 = matchValue_1.fields[0];
                            break;
                        }
                        default:
                            matchResult_1 = 4;
                    }
                    switch (matchResult_1) {
                        case 0:
                            return [[fc, new SimulationComponentState(2, [new FastData(new FastBits(0, [fc.Outputs[0].UInt32Step[step % fastSim.MaxArraySize]]), 1)])]];
                        case 1:
                            return [[fc, new SimulationComponentState(2, [new FastData(new FastBits(0, [fc.Outputs[0].UInt32Step[step % fastSim.MaxArraySize]]), w_7)])]];
                        case 2: {
                            const state = matchValue_1.fields[0];
                            return [[fc, new SimulationComponentState(3, [state])]];
                        }
                        case 3: {
                            const matchValue_2 = map_3((state_1) => state_1.Step[step % fastSim.MaxArraySize], fc.State);
                            if (matchValue_2 != null) {
                                const memState = matchValue_2;
                                return [[fc, memState]];
                            }
                            else {
                                return toFail(printf("Missing RAM state for step %d of %s"))(step)(fc.FullName);
                            }
                        }
                        default:
                            return toFail(printf("Unsupported state extraction from clocked component type %s %A"))(fc.FullName)(fc.FType);
                    }
                }
            }
        }
        else {
            return [];
        }
    }, fastSim.FClockedComps);
}

/**
 * Run an existing fast simulation up to the given number of steps. This function will mutate the write-once data arrays
 * of simulation data and only simulate the new steps needed, so it may return immediately doing no work.
 * If the simulation data arrays are not large enough they are extended up to a limit. After that, they act as a circular buffer.
 * TimeOut if not None is the cutoff time after which the simulation terminates execution unfinished.
 * Use fs.ClockTick to determine whether simulation has completed.
 * returns speed, in clock cycles per ms, or None if complete
 */
export function runFastSimulation(timeOut, lastStepNeeded, fs) {
    if (fs.MaxArraySize === 0) {
        toFail(printf("ERROR: can\'t run a fast simulation with 0 length arrays!"));
    }
    const simStartTime = getTimeMs();
    const stepsToDo = (lastStepNeeded - fs.ClockTick) | 0;
    if (stepsToDo <= 0) {
        if ((fs.ClockTick - lastStepNeeded) < fs.MaxArraySize) {
            return void 0;
        }
        else {
            restartSimulation(fs);
            const startTick = fs.ClockTick | 0;
            let time = simStartTime;
            const stepsBeforeCheck = 100;
            if (timeOut != null) {
                const incr = timeOut;
                while ((fs.ClockTick < lastStepNeeded) && (time < (simStartTime + incr))) {
                    stepSimulation(fs);
                    if (((fs.ClockTick - startTick) % stepsBeforeCheck) === 0) {
                        time = getTimeMs();
                    }
                }
            }
            else {
                while (fs.ClockTick < lastStepNeeded) {
                    stepSimulation(fs);
                }
            }
            return lastStepNeeded / (getTimeMs() - simStartTime);
        }
    }
    else {
        const startTick_1 = fs.ClockTick | 0;
        let time_1 = simStartTime;
        const stepsBeforeCheck_1 = 100;
        if (timeOut != null) {
            const incr_1 = timeOut;
            while ((fs.ClockTick < lastStepNeeded) && (time_1 < (simStartTime + incr_1))) {
                stepSimulation(fs);
                if (((fs.ClockTick - startTick_1) % stepsBeforeCheck_1) === 0) {
                    time_1 = getTimeMs();
                }
            }
        }
        else {
            while (fs.ClockTick < lastStepNeeded) {
                stepSimulation(fs);
            }
        }
        return stepsToDo / (getTimeMs() - simStartTime);
    }
}

/**
 * Look up a simulation (not a FastSimulation) component or return None.
 */
export function findSimulationComponentOpt(_arg1_, _arg1__1, graph) {
    const _arg = [_arg1_, _arg1__1];
    const cid = _arg[0];
    const ap = _arg[1];
    if (!isEmpty(ap)) {
        const customCompId = head(ap);
        const ap$0027 = tail(ap);
        return bind((graph_1) => bind((graph_2) => findSimulationComponentOpt(cid, ap$0027, graph_2), graph_1.CustomSimulationGraph), tryFind(customCompId, graph));
    }
    else {
        return tryFind(cid, graph);
    }
}

/**
 * Look up  a simulation component (not a FastComponent)
 */
export function findSimulationComponent(_arg1_, _arg1__1, sd) {
    const _arg = [_arg1_, _arg1__1];
    const cid = _arg[0];
    const ap = _arg[1];
    const fs = sd.FastSim;
    const graph = sd.Graph;
    const matchValue = findSimulationComponentOpt(cid, ap, graph);
    if (matchValue != null) {
        const sComp = matchValue;
        return sComp;
    }
    else {
        const arg = FSharpMap__get_Item(fs.FComps, [cid, ap]).FullName;
        return toFail(printf("What? Can\'t find component %A in SimulationData"))(arg);
    }
}

/**
 * return output port data from simulation as a Bit list
 * Each element in list is one bit
 */
export function extractFastSimulationOutput(fs_mut, step_mut, _arg1__mut, _arg1__1_mut, opn_mut) {
    let w;
    extractFastSimulationOutput:
    while (true) {
        const fs = fs_mut, step = step_mut, _arg1_ = _arg1__mut, _arg1__1 = _arg1__1_mut, opn = opn_mut;
        const _arg = [_arg1_, _arg1__1];
        const cid = _arg[0];
        const ap = _arg[1];
        const n = opn;
        const matchValue = tryFind([cid, ap], fs.FComps);
        if (matchValue == null) {
            const matchValue_4 = tryFind([[cid, ap], opn], fs.G.CustomOutputLookup);
            if (matchValue_4 == null) {
                return toFail(printf("What? extracting component data failed - can\'t find component from id"));
            }
            else {
                const cid_1 = matchValue_4[0];
                const ap_1 = matchValue_4[1];
                fs_mut = fs;
                step_mut = step;
                _arg1__mut = cid_1;
                _arg1__1_mut = ap_1;
                opn_mut = 0;
                continue extractFastSimulationOutput;
            }
        }
        else {
            const fc = matchValue;
            const matchValue_1 = fc.Outputs[n].Width | 0;
            if (matchValue_1 === 0) {
                return toFail(`Can't find valid data in step ${step}:index${step % fs.MaxArraySize} from ${fc.FullName} with clockTick=${fs.ClockTick}`);
            }
            else if ((w = (matchValue_1 | 0), w > 32)) {
                const w_1 = matchValue_1 | 0;
                const matchValue_2 = tryItem(step % fs.MaxArraySize, fc.Outputs[n].BigIntStep);
                if (matchValue_2 != null) {
                    const d = matchValue_2;
                    return new FSInterface(0, [new FastData(new FastBits(1, [d]), w_1)]);
                }
                else {
                    return toFail(`What? extracting output ${n}- in step ${step} from ${fc.FullName} failed with clockTick=${fs.ClockTick}`);
                }
            }
            else {
                const w_2 = matchValue_1 | 0;
                const matchValue_3 = tryItem(step % fs.MaxArraySize, fc.Outputs[n].UInt32Step);
                if (matchValue_3 != null) {
                    const d_1 = matchValue_3;
                    return new FSInterface(0, [new FastData(new FastBits(0, [d_1]), w_2)]);
                }
                else {
                    return toFail(`What? extracting output ${n}- in step ${step} from ${fc.FullName} failed with clockTick=${fs.ClockTick}`);
                }
            }
        }
        break;
    }
}

export function extractFastSimulationOutputFData(fs_mut, step_mut, _arg1__mut, _arg1__1_mut, opn_mut) {
    extractFastSimulationOutputFData:
    while (true) {
        const fs = fs_mut, step = step_mut, _arg1_ = _arg1__mut, _arg1__1 = _arg1__1_mut, opn = opn_mut;
        const _arg = [_arg1_, _arg1__1];
        const cid = _arg[0];
        const ap = _arg[1];
        const n = opn;
        const matchValue = tryFind([cid, ap], fs.FComps);
        if (matchValue == null) {
            const matchValue_2 = tryFind([[cid, ap], opn], fs.G.CustomOutputLookup);
            if (matchValue_2 == null) {
                return toFail(printf("What? extracting component data failed - can\'t find component from id"));
            }
            else {
                const cid_1 = matchValue_2[0];
                const ap_1 = matchValue_2[1];
                fs_mut = fs;
                step_mut = step;
                _arg1__mut = cid_1;
                _arg1__1_mut = ap_1;
                opn_mut = 0;
                continue extractFastSimulationOutputFData;
            }
        }
        else {
            const fc = matchValue;
            const matchValue_1 = tryItem(step % fs.MaxArraySize, fc.Outputs[n].FDataStep);
            if (matchValue_1 != null) {
                if (matchValue_1.tag === 1) {
                    const exp = matchValue_1.fields[0];
                    const evaluated = evalExp(exp);
                    return new FSInterface(1, [evaluated]);
                }
                else {
                    const d = matchValue_1.fields[0];
                    if (d.Width === 0) {
                        return toFail(`Can't find valid data in step ${step}:index${step % fs.MaxArraySize} from ${fc.FullName} with clockTick=${fs.ClockTick}`);
                    }
                    else {
                        return new FSInterface(0, [d]);
                    }
                }
            }
            else {
                return toFail(`What? extracting output ${n} in step ${step} from ${fc.FullName} failed with clockTick=${fs.ClockTick}`);
            }
        }
        break;
    }
}

/**
 * return state data from simulation
 */
export function extractFastSimulationState(fs, step, _arg1_, _arg1__1) {
    const _arg = [_arg1_, _arg1__1];
    const cid = _arg[0];
    const ap = _arg[1];
    const matchValue = tryFind([cid, ap], fs.FComps);
    if (matchValue == null) {
        return toFail(`What? Can't find fast component ${[cid, ap]}`);
    }
    else {
        const fc = matchValue;
        const matchValue_1 = fc.State;
        if (matchValue_1 != null) {
            const stepArr = matchValue_1;
            const matchValue_3 = tryItem(step % fs.MaxArraySize, stepArr.Step);
            if (matchValue_3 == null) {
                return toFail(`What? Can't extract state in step ${step} from ${fc.FullName}`);
            }
            else {
                const state = matchValue_3;
                return state;
            }
        }
        else {
            const matchValue_2 = fc.SimComponent.Type;
            if (matchValue_2.tag === 39) {
                const romContents = matchValue_2.fields[0];
                return new SimulationComponentState(3, [romContents]);
            }
            else {
                return toFail(printf("What? extracting State in step %d from %s failed"))(step)(fc.FullName);
            }
        }
    }
}

/**
 * Extract top-level inputs or outputs with names and wire widths. Used by legacy code.
 */
export function extractFastSimulationIOs(simIOs, simulationData) {
    const fs = simulationData.FastSim;
    const inputs = simulationData.Inputs;
    return map_4((io) => {
        const io_1 = io;
        const width = io_1[2] | 0;
        const label = io_1[1];
        const cid = io_1[0];
        const out = extractFastSimulationOutput(fs, simulationData.ClockTickNumber, cid, empty(), 0);
        return [io_1, out];
    }, simIOs);
}

export function extractFastSimulationIOsFData(simIOs, simulationData) {
    const fs = simulationData.FastSim;
    const inputs = simulationData.Inputs;
    return map_4((io) => {
        const io_1 = io;
        const width = io_1[2] | 0;
        const label = io_1[1];
        const cid = io_1[0];
        const out = extractFastSimulationOutputFData(fs, simulationData.ClockTickNumber, cid, empty(), 0);
        return [io_1, out];
    }, simIOs);
}

export function getFLabel(fs, fId_, fId__1) {
    const fId = [fId_, fId__1];
    const fc = FSharpMap__get_Item(fs.FComps, fId);
    const name = fc.SimComponent.Label;
    return [name, fc.FullName];
}

export function extractFastSimulationWidth(fs, fid_, fid__1, opn) {
    const fid = [fid_, fid__1];
    const n = opn;
    const this$ = FSharpMap__get_Item(fs.FComps, fid);
    return this$.Outputs[n].Width | 0;
}

/**
 * Extract all Viewer components with names and wire widths. Used by legacy code.
 */
export function extractViewers(simulationData) {
    const fs = simulationData.FastSim;
    const comps = map_2((tuple) => tuple[1], toArray(map_5((fid, fc) => fc.FType, simulationData.FastSim.FComps)));
    const viewers = filter((fid_1, fc_1) => {
        if (fc_1.FType.tag === 2) {
            return true;
        }
        else {
            return false;
        }
    }, simulationData.FastSim.FComps);
    return map_4((tupledArg) => {
        const fid_2 = tupledArg[0];
        const fc_2 = tupledArg[1];
        const width = fc_2.Outputs[0].Width | 0;
        return [getFLabel(fs, fid_2[0], fid_2[1]), width, extractFastSimulationOutput(fs, simulationData.ClockTickNumber, fid_2[0], fid_2[1], 0)];
    }, toList_2(viewers));
}

export function compareLoadedStates(fs, canv_, canv__1, p) {
    const canv = [canv_, canv__1];
    return forAll((ldc) => loadedComponentIsSameAsProject(canv[0], canv[1], ldc, p), fs.SimulatedCanvasState);
}

//# sourceMappingURL=FastRun.fs.js.map
