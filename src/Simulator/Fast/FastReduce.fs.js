import { getMemData } from "../../Common/Helpers.fs.js";
import { op_Modulus, compare, fromFloat64, fromOne, op_BitwiseOr, op_ExclusiveOr, op_LeftShift, op_Subtraction, op_Multiply, fromInt32, op_BitwiseAnd, op_RightShift, toUInt32, op_Addition, fromZero, equals, toUInt64, fromUInt64, fromUInt32, toInt64 } from "../../fable_modules/fable-library.4.1.4/BigInt.js";
import { convertBigintToFastData, convertFastDataToInt, convertIntToFastData, convertFastDataToBigint, convertInt64ToFastData, convertFastDataToInt64, convertBigIntToUInt64, convertInt64ToBigInt, convertInt64ToUInt32 } from "../NumberHelpers.fs.js";
import { FData__get_toFastData, getAlgExpWidth, foldAppends, FData__get_Width, AlgebraNotImplemented, SimulationError, SimulationErrorType, BinaryOp, FData__get_toExp, ComparisonOp, getBits, FastData, FastBits, FastAlgExp, UnaryOp, SimulationComponentState, bigIntMask, getBitsFromBigIntToUInt32, getBitsFromBigInt, getBitsFromUInt32, FData } from "../SimulatorTypes.fs.js";
import { interpolate, printf, toFail } from "../../fable_modules/fable-library.4.1.4/String.js";
import { add } from "../../fable_modules/fable-library.4.1.4/Map.js";
import { Memory1 } from "../../Common/CommonTypes.fs.js";
import { fold, sumBy, forAll, ofArray, cons, append, empty, singleton, reduce, exists, iterateIndexed2, map2, map, reverse, fold2 } from "../../fable_modules/fable-library.4.1.4/List.js";
import { map as map_1, delay, toList } from "../../fable_modules/fable-library.4.1.4/Seq.js";
import { rangeDouble } from "../../fable_modules/fable-library.4.1.4/Range.js";
import { uncurry2 } from "../../fable_modules/fable-library.4.1.4/Util.js";

function readMemoryAddrUInt32DataUInt32(mem, address) {
    const outDataInt = getMemData(toInt64(fromUInt32(address)), mem);
    return convertInt64ToUInt32(mem.WordWidth, outDataInt);
}

function readMemoryAddrUInt32DataBigInt(mem, address) {
    const outDataInt = getMemData(toInt64(fromUInt32(address)), mem);
    return convertInt64ToBigInt(mem.WordWidth, outDataInt);
}

function readMemoryAddrBigIntDataUInt32(mem, address) {
    const intAddr = convertBigIntToUInt64(mem.AddressWidth, address);
    const outDataInt = getMemData(toInt64(fromUInt64(intAddr)), mem);
    return convertInt64ToUInt32(mem.WordWidth, outDataInt);
}

function readMemoryAddrBigIntDataBigInt(mem, address) {
    const intAddr = convertBigIntToUInt64(mem.AddressWidth, address);
    const outDataInt = getMemData(toInt64(fromUInt64(intAddr)), mem);
    return convertInt64ToBigInt(mem.WordWidth, outDataInt);
}

function readMemoryFData(mem, address) {
    if (address.tag === 0) {
        const addr = address.fields[0];
        const intAddr = convertFastDataToInt64(addr);
        const outDataInt = getMemData(toInt64(fromUInt64(intAddr)), mem);
        return new FData(0, [convertInt64ToFastData(mem.WordWidth, outDataInt)]);
    }
    else {
        return toFail(printf("Can\'t read memory from Algebra"));
    }
}

function writeMemory(mem, address, data) {
    const intAddr = toInt64(fromUInt64(convertFastDataToInt64(address)));
    const intData = toInt64(fromUInt64(convertFastDataToInt64(data)));
    return new Memory1(mem.Init, mem.AddressWidth, mem.WordWidth, add(intAddr, intData, mem.Data));
}

function writeMemoryAddrUInt32DataUInt32(mem, address, data) {
    const intAddr = toInt64(fromUInt64(toUInt64(fromUInt32(address))));
    const intData = toInt64(fromUInt64(toUInt64(fromUInt32(data))));
    return new Memory1(mem.Init, mem.AddressWidth, mem.WordWidth, add(intAddr, intData, mem.Data));
}

function writeMemoryAddrUInt32DataBigInt(mem, address, data) {
    const intAddr = toInt64(fromUInt64(toUInt64(fromUInt32(address))));
    const intData = toInt64(fromUInt64(convertBigIntToUInt64(mem.WordWidth, data)));
    return new Memory1(mem.Init, mem.AddressWidth, mem.WordWidth, add(intAddr, intData, mem.Data));
}

function writeMemoryAddrBigIntDataUInt32(mem, address, data) {
    const intAddr = toInt64(fromUInt64(convertBigIntToUInt64(mem.AddressWidth, address)));
    const intData = toInt64(fromUInt32(data));
    return new Memory1(mem.Init, mem.AddressWidth, mem.WordWidth, add(intAddr, intData, mem.Data));
}

function writeMemoryAddrBigIntDataBigInt(mem, address, data) {
    const intAddr = toInt64(fromUInt64(convertBigIntToUInt64(mem.AddressWidth, address)));
    const intData = toInt64(fromUInt64(convertBigIntToUInt64(mem.WordWidth, data)));
    return new Memory1(mem.Init, mem.AddressWidth, mem.WordWidth, add(intAddr, intData, mem.Data));
}

function getRamStateMemory(numSteps, step, state, memory) {
    if (numSteps === 1) {
        return memory;
    }
    else if (state != null) {
        const arr = state;
        const matchValue_1 = arr.Step[step];
        if (matchValue_1.tag === 3) {
            const memory_1 = matchValue_1.fields[0];
            return memory_1;
        }
        else {
            return toFail(printf("What? getRamStateMemory called with invalid state"));
        }
    }
    else {
        return toFail(printf("what? getRamStateMemory called with an invalid state: %A"))(state);
    }
}

export function getRomStateMemory(comp) {
    const matchValue = comp.FType;
    let matchResult, memory;
    switch (matchValue.tag) {
        case 44: {
            matchResult = 0;
            memory = matchValue.fields[0];
            break;
        }
        case 43: {
            matchResult = 0;
            memory = matchValue.fields[0];
            break;
        }
        default:
            matchResult = 1;
    }
    switch (matchResult) {
        case 0:
            return memory;
        default:
            return toFail(printf("What? getRomStateMemory called with invalid state"));
    }
}

/**
 * Given a component, compute its outputs from its inputs, which must already be evaluated.
 * Outputs and inputs are both contained as time sequences in arrays. This function will calculate
 * simStep outputs from (previously calculated) simStep outputs and clocked (simStep-1) outputs.
 * Memory has state separate from simStep-1 output, for this the state is recalculated.
 * Inputs and outputs come from either UInt32Step or BigIntStep arrays in IOArray record.
 */
export function fastReduce(maxArraySize, numStep, isClockedReduction, comp) {
    let gateType_3, gateType_4;
    const componentType = comp.FType;
    const n = comp.InputLinks.length | 0;
    const simStep = (numStep % maxArraySize) | 0;
    const simStepOld = ((simStep === 0) ? (maxArraySize - 1) : (simStep - 1)) | 0;
    const matchValue = comp.UseBigInt;
    let matchResult, width, width_2, cVal, width_4, cVal_1, width_5, width_6, width_8, width_10, width_12, lsb, width_14, lsb_1, width_15, compareVal, width_16, compareVal_1, width_17, gateType, n_23, numberOfBits, numberOfBits_1, numberOfBits_2, numberOfBits_3, numberOfBits_4, op, numberOfBits_5, op_1, numberOfBits_6, numberOfBits_7, numberOfBits_8, numberOfBits_9, numberOfBits_10, numberOfBits_11, numberOfBits_12, numberOfBits_13, c, n_101, n_104, topWireWidth, lsBits, n_108, outputWidths, topWireWidth_1, width_21, width_22, width_23, width_24, width_25, width_26, width_27, width_28, width_29, width_30, width_31, width_32, mem, mem_1, mem_2, mem_3, memory, memory_1, memory_2, mem_13;
    switch (componentType.tag) {
        case 44:
        case 45:
        case 43: {
            matchResult = 0;
            break;
        }
        case 48: {
            matchResult = 1;
            break;
        }
        case 4: {
            matchResult = 12;
            break;
        }
        case 0: {
            if (matchValue) {
                matchResult = 3;
                width_2 = componentType.fields[0];
            }
            else {
                matchResult = 2;
                width = componentType.fields[0];
            }
            break;
        }
        case 7: {
            if (matchValue) {
                matchResult = 5;
                cVal_1 = componentType.fields[1];
                width_5 = componentType.fields[0];
            }
            else {
                matchResult = 4;
                cVal = componentType.fields[1];
                width_4 = componentType.fields[0];
            }
            break;
        }
        case 49: {
            if (matchValue) {
                matchResult = 5;
                cVal_1 = componentType.fields[1];
                width_5 = componentType.fields[0];
            }
            else {
                matchResult = 4;
                cVal = componentType.fields[1];
                width_4 = componentType.fields[0];
            }
            break;
        }
        case 1: {
            if (matchValue) {
                matchResult = 7;
                width_8 = componentType.fields[0];
            }
            else {
                matchResult = 6;
                width_6 = componentType.fields[0];
            }
            break;
        }
        case 2: {
            if (matchValue) {
                matchResult = 9;
                width_12 = componentType.fields[0];
            }
            else {
                matchResult = 8;
                width_10 = componentType.fields[0];
            }
            break;
        }
        case 3: {
            if (matchValue) {
                matchResult = 11;
            }
            else {
                matchResult = 10;
            }
            break;
        }
        case 8: {
            if (matchValue) {
                matchResult = 19;
            }
            else {
                matchResult = 13;
            }
            break;
        }
        case 6: {
            if (matchValue) {
                matchResult = 15;
                lsb_1 = componentType.fields[1];
                width_15 = componentType.fields[0];
            }
            else {
                matchResult = 14;
                lsb = componentType.fields[1];
                width_14 = componentType.fields[0];
            }
            break;
        }
        case 47: {
            if (matchValue) {
                matchResult = 17;
                compareVal_1 = componentType.fields[1];
                width_17 = componentType.fields[0];
            }
            else {
                matchResult = 16;
                compareVal = componentType.fields[1];
                width_16 = componentType.fields[0];
            }
            break;
        }
        case 5: {
            if (matchValue) {
                matchResult = 17;
                compareVal_1 = componentType.fields[1];
                width_17 = componentType.fields[0];
            }
            else {
                matchResult = 16;
                compareVal = componentType.fields[1];
                width_16 = componentType.fields[0];
            }
            break;
        }
        case 10: {
            if (matchValue) {
                matchResult = 19;
            }
            else {
                matchResult = 18;
                gateType = componentType.fields[0];
                n_23 = componentType.fields[1];
            }
            break;
        }
        case 11: {
            if (matchValue) {
                matchResult = 21;
            }
            else {
                matchResult = 20;
            }
            break;
        }
        case 12: {
            if (matchValue) {
                matchResult = 23;
            }
            else {
                matchResult = 22;
            }
            break;
        }
        case 13: {
            if (matchValue) {
                matchResult = 25;
            }
            else {
                matchResult = 24;
            }
            break;
        }
        case 14: {
            if (matchValue) {
                matchResult = 27;
            }
            else {
                matchResult = 26;
            }
            break;
        }
        case 15: {
            if (matchValue) {
                matchResult = 29;
            }
            else {
                matchResult = 28;
            }
            break;
        }
        case 16: {
            if (matchValue) {
                matchResult = 31;
            }
            else {
                matchResult = 30;
            }
            break;
        }
        case 17: {
            if (matchValue) {
                matchResult = 33;
                numberOfBits_1 = componentType.fields[0];
            }
            else {
                matchResult = 32;
                numberOfBits = componentType.fields[0];
            }
            break;
        }
        case 19: {
            if (matchValue) {
                matchResult = 33;
                numberOfBits_1 = componentType.fields[0];
            }
            else {
                matchResult = 32;
                numberOfBits = componentType.fields[0];
            }
            break;
        }
        case 18: {
            if (matchValue) {
                matchResult = 35;
                numberOfBits_3 = componentType.fields[0];
            }
            else {
                matchResult = 34;
                numberOfBits_2 = componentType.fields[0];
            }
            break;
        }
        case 20: {
            if (matchValue) {
                matchResult = 35;
                numberOfBits_3 = componentType.fields[0];
            }
            else {
                matchResult = 34;
                numberOfBits_2 = componentType.fields[0];
            }
            break;
        }
        case 21: {
            if (matchValue) {
                matchResult = 37;
                numberOfBits_5 = componentType.fields[0];
                op_1 = componentType.fields[1];
            }
            else {
                matchResult = 36;
                numberOfBits_4 = componentType.fields[0];
                op = componentType.fields[1];
            }
            break;
        }
        case 24: {
            if (matchValue) {
                matchResult = 39;
                numberOfBits_7 = componentType.fields[0];
            }
            else {
                matchResult = 38;
                numberOfBits_6 = componentType.fields[0];
            }
            break;
        }
        case 22: {
            if (matchValue) {
                matchResult = 41;
                numberOfBits_9 = componentType.fields[0];
            }
            else {
                matchResult = 40;
                numberOfBits_8 = componentType.fields[0];
            }
            break;
        }
        case 23: {
            if (matchValue) {
                matchResult = 43;
                numberOfBits_11 = componentType.fields[0];
            }
            else {
                matchResult = 42;
                numberOfBits_10 = componentType.fields[0];
            }
            break;
        }
        case 25: {
            if (matchValue) {
                matchResult = 45;
                numberOfBits_13 = componentType.fields[0];
            }
            else {
                matchResult = 44;
                numberOfBits_12 = componentType.fields[0];
            }
            break;
        }
        case 26: {
            matchResult = 46;
            c = componentType.fields[0];
            break;
        }
        case 27: {
            if (matchValue) {
                matchResult = 48;
            }
            else {
                matchResult = 47;
            }
            break;
        }
        case 29: {
            if (matchValue) {
                matchResult = 50;
                n_104 = componentType.fields[0];
            }
            else {
                matchResult = 49;
                n_101 = componentType.fields[0];
            }
            break;
        }
        case 28: {
            if (matchValue) {
                matchResult = 54;
                topWireWidth_1 = componentType.fields[0];
            }
            else {
                matchResult = 51;
                topWireWidth = componentType.fields[0];
            }
            break;
        }
        case 30: {
            if (matchValue) {
                matchResult = 53;
            }
            else {
                matchResult = 52;
                lsBits = componentType.fields[2];
                n_108 = componentType.fields[0];
                outputWidths = componentType.fields[1];
            }
            break;
        }
        case 31: {
            if (matchValue) {
                matchResult = 57;
            }
            else {
                matchResult = 55;
            }
            break;
        }
        case 32: {
            if (matchValue) {
                matchResult = 57;
            }
            else {
                matchResult = 56;
            }
            break;
        }
        case 33: {
            if (matchValue) {
                matchResult = 59;
                width_22 = componentType.fields[0];
            }
            else {
                matchResult = 58;
                width_21 = componentType.fields[0];
            }
            break;
        }
        case 34: {
            if (matchValue) {
                matchResult = 61;
                width_24 = componentType.fields[0];
            }
            else {
                matchResult = 60;
                width_23 = componentType.fields[0];
            }
            break;
        }
        case 35: {
            if (matchValue) {
                matchResult = 63;
                width_26 = componentType.fields[0];
            }
            else {
                matchResult = 62;
                width_25 = componentType.fields[0];
            }
            break;
        }
        case 37: {
            if (matchValue) {
                matchResult = 65;
                width_28 = componentType.fields[0];
            }
            else {
                matchResult = 64;
                width_27 = componentType.fields[0];
            }
            break;
        }
        case 36: {
            if (matchValue) {
                matchResult = 67;
                width_30 = componentType.fields[0];
            }
            else {
                matchResult = 66;
                width_29 = componentType.fields[0];
            }
            break;
        }
        case 38: {
            if (matchValue) {
                matchResult = 69;
                width_32 = componentType.fields[0];
            }
            else {
                matchResult = 68;
                width_31 = componentType.fields[0];
            }
            break;
        }
        case 39: {
            if (matchValue) {
                matchResult = 71;
                mem_1 = componentType.fields[0];
            }
            else {
                matchResult = 70;
                mem = componentType.fields[0];
            }
            break;
        }
        case 40: {
            if (matchValue) {
                matchResult = 73;
                mem_3 = componentType.fields[0];
            }
            else {
                matchResult = 72;
                mem_2 = componentType.fields[0];
            }
            break;
        }
        case 41: {
            if (matchValue) {
                matchResult = 75;
                memory_1 = componentType.fields[0];
            }
            else {
                matchResult = 74;
                memory = componentType.fields[0];
            }
            break;
        }
        case 42: {
            if (matchValue) {
                matchResult = 77;
                mem_13 = componentType.fields[0];
            }
            else {
                matchResult = 76;
                memory_2 = componentType.fields[0];
            }
            break;
        }
        default:
            matchResult = 78;
    }
    switch (matchResult) {
        case 0: {
            toFail(printf("What? Legacy RAM component types should never occur"));
            break;
        }
        case 1: {
            toFail(printf("Legacy Input component types should never occur"));
            break;
        }
        case 2: {
            if (comp.Active) {
                let bits;
                bits = comp.InputLinks[0].UInt32Step[simStep];
                const w = comp.InputLinks[0].Width | 0;
                const n_2 = 0;
                comp.Outputs[n_2].UInt32Step[simStep] = bits;
            }
            break;
        }
        case 3: {
            if (comp.Active) {
                let bits_1;
                bits_1 = comp.InputLinks[0].BigIntStep[simStep];
                const w_1 = comp.Outputs[0].Width | 0;
                const n_4 = 0;
                comp.Outputs[n_4].BigIntStep[simStep] = bits_1;
            }
            break;
        }
        case 4: {
            const fd_2 = convertInt64ToUInt32(width_4, cVal);
            const n_5 = 0;
            comp.Outputs[n_5].UInt32Step[simStep] = fd_2;
            break;
        }
        case 5: {
            const fd_3 = convertInt64ToBigInt(width_5, cVal_1);
            const n_6 = 0;
            comp.Outputs[n_6].BigIntStep[simStep] = fd_3;
            break;
        }
        case 6: {
            let bits_2;
            bits_2 = comp.InputLinks[0].UInt32Step[simStep];
            const w_2 = comp.InputLinks[0].Width | 0;
            const n_8 = 0;
            comp.Outputs[n_8].UInt32Step[simStep] = bits_2;
            break;
        }
        case 7: {
            let bits_3;
            bits_3 = comp.InputLinks[0].BigIntStep[simStep];
            const w_3 = comp.InputLinks[0].Width | 0;
            const n_10 = 0;
            comp.Outputs[n_10].BigIntStep[simStep] = bits_3;
            break;
        }
        case 8: {
            let bits_4;
            bits_4 = comp.InputLinks[0].UInt32Step[simStep];
            const w_4 = comp.InputLinks[0].Width | 0;
            const n_12 = 0;
            comp.Outputs[n_12].UInt32Step[simStep] = bits_4;
            break;
        }
        case 9: {
            let bits_5;
            bits_5 = comp.InputLinks[0].BigIntStep[simStep];
            const w_5 = comp.InputLinks[0].Width | 0;
            const n_14 = 0;
            comp.Outputs[n_14].BigIntStep[simStep] = bits_5;
            break;
        }
        case 10: {
            let bits_6;
            bits_6 = comp.InputLinks[0].UInt32Step[simStep];
            const n_15 = 0;
            comp.Outputs[n_15].UInt32Step[simStep] = bits_6;
            break;
        }
        case 11: {
            let bits_7;
            bits_7 = comp.InputLinks[0].BigIntStep[simStep];
            const n_16 = 0;
            comp.Outputs[n_16].BigIntStep[simStep] = bits_7;
            break;
        }
        case 12: {
            break;
        }
        case 13: {
            let bit;
            bit = comp.InputLinks[0].UInt32Step[simStep];
            const fd_10 = (bit ^ 1) >>> 0;
            const n_17 = 0;
            comp.Outputs[n_17].UInt32Step[simStep] = fd_10;
            break;
        }
        case 14: {
            let bits_8;
            bits_8 = comp.InputLinks[0].UInt32Step[simStep];
            const outBits = getBitsFromUInt32((lsb + width_14) - 1, lsb, bits_8);
            const n_18 = 0;
            comp.Outputs[n_18].UInt32Step[simStep] = outBits;
            break;
        }
        case 15: {
            let bits_9;
            bits_9 = comp.InputLinks[0].BigIntStep[simStep];
            const matchValue_2 = comp.BigIntState;
            if (matchValue_2 != null) {
                const outs = matchValue_2.OutputIsBigInt;
                if (outs[0]) {
                    const outBits_1 = getBitsFromBigInt((lsb_1 + width_15) - 1, lsb_1, bits_9);
                    const n_19 = 0;
                    comp.Outputs[n_19].BigIntStep[simStep] = outBits_1;
                }
                else {
                    const outBits_2 = getBitsFromBigIntToUInt32((lsb_1 + width_15) - 1, lsb_1, bits_9);
                    const n_20 = 0;
                    comp.Outputs[n_20].UInt32Step[simStep] = outBits_2;
                }
            }
            else {
                throw new Error("This should never happen, BusSelection with UseBigInt = true must have Some(BigIntState), but get None");
            }
            break;
        }
        case 16: {
            let bits_10;
            bits_10 = comp.InputLinks[0].UInt32Step[simStep];
            const inputNum = fromUInt32(bits_10);
            const outNum = equals(inputNum, fromUInt32(compareVal)) ? 1 : 0;
            const n_21 = 0;
            comp.Outputs[n_21].UInt32Step[simStep] = outNum;
            break;
        }
        case 17: {
            let bits_11;
            bits_11 = comp.InputLinks[0].BigIntStep[simStep];
            const inputNum_1 = bits_11;
            const outNum_1 = equals(inputNum_1, fromUInt32(compareVal_1)) ? 1 : 0;
            const n_22 = 0;
            comp.Outputs[n_22].UInt32Step[simStep] = outNum_1;
            break;
        }
        case 18: {
            if (n_23 === 2) {
                let bitOp;
                const gateType_1 = gateType;
                bitOp = ((gateType_1 === "or") ? ((bit_2_1) => ((bit_3) => ((bit_2_1 | bit_3) >>> 0))) : ((gateType_1 === "xor") ? ((bit_4) => ((bit_5) => ((bit_4 ^ bit_5) >>> 0))) : ((gateType_1 === "nand") ? ((bit_6) => ((bit_7) => ((((bit_6 & bit_7) >>> 0) ^ 1) >>> 0))) : ((gateType_1 === "nor") ? ((bit_8_1) => ((bit_9_1) => ((((bit_8_1 | bit_9_1) >>> 0) ^ 1) >>> 0))) : ((gateType_1 === "xnor") ? ((bit_10_1) => ((bit_11_1) => ((((bit_10_1 ^ bit_11_1) >>> 0) ^ 1) >>> 0))) : ((bit_2) => ((bit_1_1) => ((bit_2 & bit_1_1) >>> 0))))))));
                let matchValue_3;
                matchValue_3 = comp.InputLinks[0].UInt32Step[simStep];
                let bit1;
                bit1 = comp.InputLinks[1].UInt32Step[simStep];
                const bit0 = matchValue_3;
                const fd_16 = bitOp(bit1)(bit0);
                const n_24 = 0;
                comp.Outputs[n_24].UInt32Step[simStep] = fd_16;
            }
            else {
                const gateType_2 = gateType;
                let gateResult;
                gateResult = comp.InputLinks[0].UInt32Step[simStep];
                for (let gateInputNum = 1; gateInputNum <= (n_23 - 1); gateInputNum++) {
                    gateResult = ((gateType_3 = gateType_2, (gateType_3 === "nand") ? ((bit_14) => ((bit_1_2) => ((bit_14 & bit_1_2) >>> 0))) : ((gateType_3 === "or") ? ((bit_2_2) => ((bit_3_1) => ((bit_2_2 | bit_3_1) >>> 0))) : ((gateType_3 === "nor") ? ((bit_2_2) => ((bit_3_1) => ((bit_2_2 | bit_3_1) >>> 0))) : ((gateType_3 === "xor") ? ((bit_4_1) => ((bit_5_1) => ((bit_4_1 ^ bit_5_1) >>> 0))) : ((gateType_3 === "xnor") ? ((bit_4_1) => ((bit_5_1) => ((bit_4_1 ^ bit_5_1) >>> 0))) : ((bit_14) => ((bit_1_2) => ((bit_14 & bit_1_2) >>> 0)))))))))(gateResult)(comp.InputLinks[gateInputNum].UInt32Step[simStep]);
                }
                if ((gateType_4 = gateType_2, (gateType_4 === "nor") ? true : ((gateType_4 === "xnor") ? true : ((gateType_4 === "and") ? false : ((gateType_4 === "or") ? false : (!(gateType_4 === "xor"))))))) {
                    const fd_17 = (gateResult ^ 1) >>> 0;
                    const n_25 = 0;
                    comp.Outputs[n_25].UInt32Step[simStep] = fd_17;
                }
                else {
                    const fd_18 = gateResult;
                    const n_26 = 0;
                    comp.Outputs[n_26].UInt32Step[simStep] = fd_18;
                }
            }
            break;
        }
        case 19: {
            throw new Error("This should never happen, 1-bit component should not use BigInt");
            break;
        }
        case 20: {
            let matchValue_5;
            matchValue_5 = comp.InputLinks[0].UInt32Step[simStep];
            let bits1;
            bits1 = comp.InputLinks[1].UInt32Step[simStep];
            const bits0 = matchValue_5;
            let bitSelect;
            bitSelect = comp.InputLinks[2].UInt32Step[simStep];
            const out = (bitSelect === 0) ? bits0 : bits1;
            const n_27 = 0;
            comp.Outputs[n_27].UInt32Step[simStep] = out;
            break;
        }
        case 21: {
            let matchValue_8;
            matchValue_8 = comp.InputLinks[0].BigIntStep[simStep];
            let bits1_1;
            bits1_1 = comp.InputLinks[1].BigIntStep[simStep];
            const bits0_1 = matchValue_8;
            let bitSelect_1;
            bitSelect_1 = comp.InputLinks[2].UInt32Step[simStep];
            const out_1 = (bitSelect_1 === 0) ? bits0_1 : bits1_1;
            const n_28 = 0;
            comp.Outputs[n_28].BigIntStep[simStep] = out_1;
            break;
        }
        case 22: {
            let matchValue_11;
            matchValue_11 = comp.InputLinks[0].UInt32Step[simStep];
            let matchValue_12;
            matchValue_12 = comp.InputLinks[1].UInt32Step[simStep];
            let matchValue_13;
            matchValue_13 = comp.InputLinks[2].UInt32Step[simStep];
            let bits3;
            bits3 = comp.InputLinks[3].UInt32Step[simStep];
            const bits2 = matchValue_13;
            const bits1_2 = matchValue_12;
            const bits0_2 = matchValue_11;
            let bitSelect_2;
            bitSelect_2 = comp.InputLinks[4].UInt32Step[simStep];
            const out_2 = (bitSelect_2 === 0) ? bits0_2 : ((bitSelect_2 === 1) ? bits1_2 : ((bitSelect_2 === 2) ? bits2 : ((bitSelect_2 === 3) ? bits3 : toFail(printf("Cannot happen")))));
            const n_29 = 0;
            comp.Outputs[n_29].UInt32Step[simStep] = out_2;
            break;
        }
        case 23: {
            let matchValue_16;
            matchValue_16 = comp.InputLinks[0].BigIntStep[simStep];
            let matchValue_17;
            matchValue_17 = comp.InputLinks[1].BigIntStep[simStep];
            let matchValue_18;
            matchValue_18 = comp.InputLinks[2].BigIntStep[simStep];
            let bits3_1;
            bits3_1 = comp.InputLinks[3].BigIntStep[simStep];
            const bits2_1 = matchValue_18;
            const bits1_3 = matchValue_17;
            const bits0_3 = matchValue_16;
            let bitSelect_3;
            bitSelect_3 = comp.InputLinks[4].UInt32Step[simStep];
            const out_3 = (bitSelect_3 === 0) ? bits0_3 : ((bitSelect_3 === 1) ? bits1_3 : ((bitSelect_3 === 2) ? bits2_1 : ((bitSelect_3 === 3) ? bits3_1 : toFail(printf("Cannot happen")))));
            const n_30 = 0;
            comp.Outputs[n_30].BigIntStep[simStep] = out_3;
            break;
        }
        case 24: {
            let matchValue_21;
            matchValue_21 = comp.InputLinks[0].UInt32Step[simStep];
            let matchValue_22;
            matchValue_22 = comp.InputLinks[1].UInt32Step[simStep];
            let matchValue_23;
            matchValue_23 = comp.InputLinks[2].UInt32Step[simStep];
            let matchValue_24;
            matchValue_24 = comp.InputLinks[3].UInt32Step[simStep];
            let matchValue_25;
            matchValue_25 = comp.InputLinks[4].UInt32Step[simStep];
            let matchValue_26;
            matchValue_26 = comp.InputLinks[5].UInt32Step[simStep];
            let matchValue_27;
            matchValue_27 = comp.InputLinks[6].UInt32Step[simStep];
            let bits7;
            bits7 = comp.InputLinks[7].UInt32Step[simStep];
            const bits6 = matchValue_27;
            const bits5 = matchValue_26;
            const bits4 = matchValue_25;
            const bits3_2 = matchValue_24;
            const bits2_2 = matchValue_23;
            const bits1_4 = matchValue_22;
            const bits0_4 = matchValue_21;
            let bitSelect_4;
            bitSelect_4 = comp.InputLinks[8].UInt32Step[simStep];
            const out_4 = (bitSelect_4 === 0) ? bits0_4 : ((bitSelect_4 === 1) ? bits1_4 : ((bitSelect_4 === 2) ? bits2_2 : ((bitSelect_4 === 3) ? bits3_2 : ((bitSelect_4 === 4) ? bits4 : ((bitSelect_4 === 5) ? bits5 : ((bitSelect_4 === 6) ? bits6 : ((bitSelect_4 === 7) ? bits7 : toFail(printf("Cannot happen")))))))));
            const n_31 = 0;
            comp.Outputs[n_31].UInt32Step[simStep] = out_4;
            break;
        }
        case 25: {
            let matchValue_30;
            matchValue_30 = comp.InputLinks[0].BigIntStep[simStep];
            let matchValue_31;
            matchValue_31 = comp.InputLinks[1].BigIntStep[simStep];
            let matchValue_32;
            matchValue_32 = comp.InputLinks[2].BigIntStep[simStep];
            let matchValue_33;
            matchValue_33 = comp.InputLinks[3].BigIntStep[simStep];
            let matchValue_34;
            matchValue_34 = comp.InputLinks[4].BigIntStep[simStep];
            let matchValue_35;
            matchValue_35 = comp.InputLinks[5].BigIntStep[simStep];
            let matchValue_36;
            matchValue_36 = comp.InputLinks[6].BigIntStep[simStep];
            let bits7_1;
            bits7_1 = comp.InputLinks[7].BigIntStep[simStep];
            const bits6_1 = matchValue_36;
            const bits5_1 = matchValue_35;
            const bits4_1 = matchValue_34;
            const bits3_3 = matchValue_33;
            const bits2_3 = matchValue_32;
            const bits1_5 = matchValue_31;
            const bits0_5 = matchValue_30;
            let bitSelect_5;
            bitSelect_5 = comp.InputLinks[8].UInt32Step[simStep];
            const out_5 = (bitSelect_5 === 0) ? bits0_5 : ((bitSelect_5 === 1) ? bits1_5 : ((bitSelect_5 === 2) ? bits2_3 : ((bitSelect_5 === 3) ? bits3_3 : ((bitSelect_5 === 4) ? bits4_1 : ((bitSelect_5 === 5) ? bits5_1 : ((bitSelect_5 === 6) ? bits6_1 : ((bitSelect_5 === 7) ? bits7_1 : toFail(printf("Cannot happen")))))))));
            const n_32 = 0;
            comp.Outputs[n_32].BigIntStep[simStep] = out_5;
            break;
        }
        case 26: {
            let fdIn;
            fdIn = comp.InputLinks[0].UInt32Step[simStep];
            let bitSelect_6;
            bitSelect_6 = comp.InputLinks[1].UInt32Step[simStep];
            const patternInput_8 = (bitSelect_6 === 0) ? [fdIn, 0] : [0, fdIn];
            const out1 = patternInput_8[1];
            const out0 = patternInput_8[0];
            const n_33 = 0;
            comp.Outputs[n_33].UInt32Step[simStep] = out0;
            const n_34 = 1;
            comp.Outputs[n_34].UInt32Step[simStep] = out1;
            break;
        }
        case 27: {
            let fdIn_1;
            fdIn_1 = comp.InputLinks[0].BigIntStep[simStep];
            let bitSelect_7;
            bitSelect_7 = comp.InputLinks[1].UInt32Step[simStep];
            const patternInput_10 = (bitSelect_7 === 0) ? [fdIn_1, fromZero()] : [fromZero(), fdIn_1];
            const out1_1 = patternInput_10[1];
            const out0_1 = patternInput_10[0];
            const n_35 = 0;
            comp.Outputs[n_35].BigIntStep[simStep] = out0_1;
            const n_36 = 1;
            comp.Outputs[n_36].BigIntStep[simStep] = out1_1;
            break;
        }
        case 28: {
            let fdIn_2;
            fdIn_2 = comp.InputLinks[0].UInt32Step[simStep];
            let bitSelect_8;
            bitSelect_8 = comp.InputLinks[1].UInt32Step[simStep];
            const patternInput_12 = (bitSelect_8 === 0) ? [fdIn_2, 0, 0, 0] : ((bitSelect_8 === 1) ? [0, fdIn_2, 0, 0] : ((bitSelect_8 === 2) ? [0, 0, fdIn_2, 0] : ((bitSelect_8 === 3) ? [0, 0, 0, fdIn_2] : toFail(printf("Cannot happen")))));
            const out3 = patternInput_12[3];
            const out2 = patternInput_12[2];
            const out1_2 = patternInput_12[1];
            const out0_2 = patternInput_12[0];
            const n_37 = 0;
            comp.Outputs[n_37].UInt32Step[simStep] = out0_2;
            const n_38 = 1;
            comp.Outputs[n_38].UInt32Step[simStep] = out1_2;
            const n_39 = 2;
            comp.Outputs[n_39].UInt32Step[simStep] = out2;
            const n_40 = 3;
            comp.Outputs[n_40].UInt32Step[simStep] = out3;
            break;
        }
        case 29: {
            let fdIn_3;
            fdIn_3 = comp.InputLinks[0].BigIntStep[simStep];
            let bitSelect_9;
            bitSelect_9 = comp.InputLinks[1].UInt32Step[simStep];
            const patternInput_14 = (bitSelect_9 === 0) ? [fdIn_3, fromZero(), fromZero(), fromZero()] : ((bitSelect_9 === 1) ? [fromZero(), fdIn_3, fromZero(), fromZero()] : ((bitSelect_9 === 2) ? [fromZero(), fromZero(), fdIn_3, fromZero()] : ((bitSelect_9 === 3) ? [fromZero(), fromZero(), fromZero(), fdIn_3] : toFail(printf("Cannot happen")))));
            const out3_1 = patternInput_14[3];
            const out2_1 = patternInput_14[2];
            const out1_3 = patternInput_14[1];
            const out0_3 = patternInput_14[0];
            const n_41 = 0;
            comp.Outputs[n_41].BigIntStep[simStep] = out0_3;
            const n_42 = 1;
            comp.Outputs[n_42].BigIntStep[simStep] = out1_3;
            const n_43 = 2;
            comp.Outputs[n_43].BigIntStep[simStep] = out2_1;
            const n_44 = 3;
            comp.Outputs[n_44].BigIntStep[simStep] = out3_1;
            break;
        }
        case 30: {
            let fdIn_4;
            fdIn_4 = comp.InputLinks[0].UInt32Step[simStep];
            let bitSelect_10;
            bitSelect_10 = comp.InputLinks[1].UInt32Step[simStep];
            const patternInput_16 = (bitSelect_10 === 0) ? [fdIn_4, 0, 0, 0, 0, 0, 0, 0] : ((bitSelect_10 === 1) ? [0, fdIn_4, 0, 0, 0, 0, 0, 0] : ((bitSelect_10 === 2) ? [0, 0, fdIn_4, 0, 0, 0, 0, 0] : ((bitSelect_10 === 3) ? [0, 0, 0, fdIn_4, 0, 0, 0, 0] : ((bitSelect_10 === 4) ? [0, 0, 0, 0, fdIn_4, 0, 0, 0] : ((bitSelect_10 === 5) ? [0, 0, 0, 0, 0, fdIn_4, 0, 0] : ((bitSelect_10 === 6) ? [0, 0, 0, 0, 0, 0, fdIn_4, 0] : ((bitSelect_10 === 7) ? [0, 0, 0, 0, 0, 0, 0, fdIn_4] : toFail(printf("Cannot happen")))))))));
            const out7 = patternInput_16[7];
            const out6 = patternInput_16[6];
            const out5 = patternInput_16[5];
            const out4 = patternInput_16[4];
            const out3_2 = patternInput_16[3];
            const out2_2 = patternInput_16[2];
            const out1_4 = patternInput_16[1];
            const out0_4 = patternInput_16[0];
            const n_45 = 0;
            comp.Outputs[n_45].UInt32Step[simStep] = out0_4;
            const n_46 = 1;
            comp.Outputs[n_46].UInt32Step[simStep] = out1_4;
            const n_47 = 2;
            comp.Outputs[n_47].UInt32Step[simStep] = out2_2;
            const n_48 = 3;
            comp.Outputs[n_48].UInt32Step[simStep] = out3_2;
            const n_49 = 4;
            comp.Outputs[n_49].UInt32Step[simStep] = out4;
            const n_50 = 5;
            comp.Outputs[n_50].UInt32Step[simStep] = out5;
            const n_51 = 6;
            comp.Outputs[n_51].UInt32Step[simStep] = out6;
            const n_52 = 7;
            comp.Outputs[n_52].UInt32Step[simStep] = out7;
            break;
        }
        case 31: {
            let fdIn_5;
            fdIn_5 = comp.InputLinks[0].BigIntStep[simStep];
            let bitSelect_11;
            bitSelect_11 = comp.InputLinks[1].UInt32Step[simStep];
            const patternInput_18 = (bitSelect_11 === 0) ? [fdIn_5, fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fromZero()] : ((bitSelect_11 === 1) ? [fromZero(), fdIn_5, fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fromZero()] : ((bitSelect_11 === 2) ? [fromZero(), fromZero(), fdIn_5, fromZero(), fromZero(), fromZero(), fromZero(), fromZero()] : ((bitSelect_11 === 3) ? [fromZero(), fromZero(), fromZero(), fdIn_5, fromZero(), fromZero(), fromZero(), fromZero()] : ((bitSelect_11 === 4) ? [fromZero(), fromZero(), fromZero(), fromZero(), fdIn_5, fromZero(), fromZero(), fromZero()] : ((bitSelect_11 === 5) ? [fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fdIn_5, fromZero(), fromZero()] : ((bitSelect_11 === 6) ? [fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fdIn_5, fromZero()] : ((bitSelect_11 === 7) ? [fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fromZero(), fdIn_5] : toFail(printf("Cannot happen")))))))));
            const out7_1 = patternInput_18[7];
            const out6_1 = patternInput_18[6];
            const out5_1 = patternInput_18[5];
            const out4_1 = patternInput_18[4];
            const out3_3 = patternInput_18[3];
            const out2_3 = patternInput_18[2];
            const out1_5 = patternInput_18[1];
            const out0_5 = patternInput_18[0];
            const n_53 = 0;
            comp.Outputs[n_53].BigIntStep[simStep] = out0_5;
            const n_54 = 1;
            comp.Outputs[n_54].BigIntStep[simStep] = out1_5;
            const n_55 = 2;
            comp.Outputs[n_55].BigIntStep[simStep] = out2_3;
            const n_56 = 3;
            comp.Outputs[n_56].BigIntStep[simStep] = out3_3;
            const n_57 = 4;
            comp.Outputs[n_57].BigIntStep[simStep] = out4_1;
            const n_58 = 5;
            comp.Outputs[n_58].BigIntStep[simStep] = out5_1;
            const n_59 = 6;
            comp.Outputs[n_59].BigIntStep[simStep] = out6_1;
            const n_60 = 7;
            comp.Outputs[n_60].BigIntStep[simStep] = out7_1;
            break;
        }
        case 32: {
            let matchValue_51;
            matchValue_51 = comp.InputLinks[0].UInt32Step[simStep];
            let matchValue_52;
            matchValue_52 = comp.InputLinks[1].UInt32Step[simStep];
            const cin = matchValue_51;
            let b;
            b = comp.InputLinks[2].UInt32Step[simStep];
            const a = matchValue_52;
            let patternInput_20;
            const w_6 = comp.InputLinks[1].Width | 0;
            const mask = ((1 << w_6) >>> 0) - 1;
            if (w_6 === 32) {
                const sumInt = toUInt64(op_Addition(toUInt64(op_Addition(toUInt64(fromUInt32(a)), toUInt64(fromUInt32(b)))), toUInt64(fromUInt32((cin & 1) >>> 0))));
                const cout = ((toUInt32(toUInt64(op_RightShift(sumInt, w_6))) >>> 0) & 1) >>> 0;
                const sum = toUInt32(sumInt) >>> 0;
                patternInput_20 = [sum, cout];
            }
            else {
                const sumInt_1 = (((a & mask) >>> 0) + ((b & mask) >>> 0)) + ((cin & 1) >>> 0);
                const cout_1 = ((sumInt_1 >>> w_6) & 1) >>> 0;
                const sum_1 = (sumInt_1 & mask) >>> 0;
                patternInput_20 = [sum_1, cout_1];
            }
            const sum_2 = patternInput_20[0];
            const cout_2 = patternInput_20[1];
            if (componentType.tag === 17) {
                const n_62 = 0;
                comp.Outputs[n_62].UInt32Step[simStep] = sum_2;
                const n_63 = 1;
                comp.Outputs[n_63].UInt32Step[simStep] = cout_2;
            }
            else {
                const n_64 = 0;
                comp.Outputs[n_64].UInt32Step[simStep] = sum_2;
            }
            break;
        }
        case 33: {
            let matchValue_54;
            matchValue_54 = comp.InputLinks[0].UInt32Step[simStep];
            let matchValue_55;
            matchValue_55 = comp.InputLinks[1].BigIntStep[simStep];
            const cin_1 = matchValue_54;
            let b_1;
            b_1 = comp.InputLinks[2].BigIntStep[simStep];
            const a_1 = matchValue_55;
            let patternInput_22;
            const w_7 = comp.InputLinks[1].Width | 0;
            const mask_1 = bigIntMask(w_7);
            const a_2 = op_BitwiseAnd(a_1, mask_1);
            const b_2 = op_BitwiseAnd(b_1, mask_1);
            const sumInt_2 = (cin_1 === 0) ? op_Addition(a_2, b_2) : op_Addition(op_Addition(a_2, b_2), fromInt32(1));
            const sum_3 = op_BitwiseAnd(sumInt_2, bigIntMask(w_7));
            const cout_3 = equals(op_RightShift(sumInt_2, w_7), fromInt32(0)) ? 0 : 1;
            patternInput_22 = [sum_3, cout_3];
            const sum_4 = patternInput_22[0];
            const cout_4 = patternInput_22[1];
            if (componentType.tag === 17) {
                const n_66 = 0;
                comp.Outputs[n_66].BigIntStep[simStep] = sum_4;
                const n_67 = 1;
                comp.Outputs[n_67].UInt32Step[simStep] = cout_4;
            }
            else {
                const n_68 = 0;
                comp.Outputs[n_68].BigIntStep[simStep] = sum_4;
            }
            break;
        }
        case 34: {
            let matchValue_57;
            matchValue_57 = comp.InputLinks[0].UInt32Step[simStep];
            let b_3;
            b_3 = comp.InputLinks[1].UInt32Step[simStep];
            const a_3 = matchValue_57;
            let patternInput_24;
            const cin_2 = 0;
            const w_8 = comp.InputLinks[1].Width | 0;
            const mask_2 = ((1 << w_8) >>> 0) - 1;
            if (w_8 === 32) {
                const sumInt_3 = toUInt64(op_Addition(toUInt64(op_Addition(toUInt64(fromUInt32(a_3)), toUInt64(fromUInt32(b_3)))), toUInt64(fromUInt32((cin_2 & 1) >>> 0))));
                const cout_5 = ((toUInt32(toUInt64(op_RightShift(sumInt_3, w_8))) >>> 0) & 1) >>> 0;
                const sum_5 = toUInt32(sumInt_3) >>> 0;
                patternInput_24 = [sum_5, cout_5];
            }
            else {
                const sumInt_4 = (((a_3 & mask_2) >>> 0) + ((b_3 & mask_2) >>> 0)) + ((cin_2 & 1) >>> 0);
                const cout_6 = ((sumInt_4 >>> w_8) & 1) >>> 0;
                const sum_6 = (sumInt_4 & mask_2) >>> 0;
                patternInput_24 = [sum_6, cout_6];
            }
            const sum_7 = patternInput_24[0];
            const cout_7 = patternInput_24[1];
            if (componentType.tag === 18) {
                const n_70 = 0;
                comp.Outputs[n_70].UInt32Step[simStep] = sum_7;
                const n_71 = 1;
                comp.Outputs[n_71].UInt32Step[simStep] = cout_7;
            }
            else {
                const n_72 = 0;
                comp.Outputs[n_72].UInt32Step[simStep] = sum_7;
            }
            break;
        }
        case 35: {
            let matchValue_59;
            matchValue_59 = comp.InputLinks[0].BigIntStep[simStep];
            let b_4;
            b_4 = comp.InputLinks[1].BigIntStep[simStep];
            const a_4 = matchValue_59;
            let patternInput_26;
            const cin_3 = 0;
            const w_9 = comp.InputLinks[1].Width | 0;
            const mask_3 = bigIntMask(w_9);
            const a_5 = op_BitwiseAnd(a_4, mask_3);
            const b_5 = op_BitwiseAnd(b_4, mask_3);
            const sumInt_5 = (cin_3 === 0) ? op_Addition(a_5, b_5) : op_Addition(op_Addition(a_5, b_5), fromInt32(1));
            const sum_8 = op_BitwiseAnd(sumInt_5, bigIntMask(w_9));
            const cout_8 = equals(op_RightShift(sumInt_5, w_9), fromInt32(0)) ? 0 : 1;
            patternInput_26 = [sum_8, cout_8];
            const sum_9 = patternInput_26[0];
            const cout_9 = patternInput_26[1];
            if (componentType.tag === 18) {
                const n_74 = 0;
                comp.Outputs[n_74].BigIntStep[simStep] = sum_9;
                const n_75 = 1;
                comp.Outputs[n_75].UInt32Step[simStep] = cout_9;
            }
            else {
                const n_76 = 0;
                comp.Outputs[n_76].BigIntStep[simStep] = sum_9;
            }
            break;
        }
        case 36: {
            let matchValue_61;
            matchValue_61 = comp.InputLinks[0].UInt32Step[simStep];
            let b_6;
            b_6 = comp.InputLinks[1].UInt32Step[simStep];
            const a_6 = matchValue_61;
            const res = (op != null) ? (((a_6 * b_6) & (((1 << comp.InputLinks[0].Width) >>> 0) - 1)) >>> 0) : ((a_6 ^ b_6) >>> 0);
            const n_78 = 0;
            comp.Outputs[n_78].UInt32Step[simStep] = res;
            break;
        }
        case 37: {
            let matchValue_63;
            matchValue_63 = comp.InputLinks[0].BigIntStep[simStep];
            let b_7;
            b_7 = comp.InputLinks[1].BigIntStep[simStep];
            const a_7 = matchValue_63;
            const res_1 = (op_1 != null) ? op_BitwiseAnd(op_Multiply(a_7, b_7), op_Subtraction(op_LeftShift(fromInt32(1), comp.InputLinks[0].Width), fromInt32(1))) : op_ExclusiveOr(a_7, b_7);
            const n_80 = 0;
            comp.Outputs[n_80].BigIntStep[simStep] = res_1;
            break;
        }
        case 38: {
            let matchValue_65;
            matchValue_65 = comp.InputLinks[0].UInt32Step[simStep];
            let b_8;
            b_8 = comp.InputLinks[1].UInt32Step[simStep];
            const a_8 = matchValue_65;
            const res_2 = (a_8 | b_8) >>> 0;
            const n_81 = 0;
            comp.Outputs[n_81].UInt32Step[simStep] = res_2;
            break;
        }
        case 39: {
            let matchValue_67;
            matchValue_67 = comp.InputLinks[0].BigIntStep[simStep];
            let b_9;
            b_9 = comp.InputLinks[1].BigIntStep[simStep];
            const a_9 = matchValue_67;
            const res_3 = op_BitwiseOr(a_9, b_9);
            const n_82 = 0;
            comp.Outputs[n_82].BigIntStep[simStep] = res_3;
            break;
        }
        case 40: {
            let matchValue_69;
            matchValue_69 = comp.InputLinks[0].UInt32Step[simStep];
            let b_10;
            b_10 = comp.InputLinks[1].UInt32Step[simStep];
            const a_10 = matchValue_69;
            const res_4 = (a_10 & b_10) >>> 0;
            const n_83 = 0;
            comp.Outputs[n_83].UInt32Step[simStep] = res_4;
            break;
        }
        case 41: {
            let matchValue_71;
            matchValue_71 = comp.InputLinks[0].BigIntStep[simStep];
            let b_11;
            b_11 = comp.InputLinks[1].BigIntStep[simStep];
            const a_11 = matchValue_71;
            const res_5 = op_BitwiseAnd(a_11, b_11);
            const n_84 = 0;
            comp.Outputs[n_84].BigIntStep[simStep] = res_5;
            break;
        }
        case 42: {
            let a_12;
            a_12 = comp.InputLinks[0].UInt32Step[simStep];
            const w_10 = comp.InputLinks[0].Width | 0;
            const minusOne = ((1 << w_10) >>> 0) - 1;
            const res_6 = (w_10 === 32) ? (~a_12 >>> 0) : ((minusOne & (~a_12 >>> 0)) >>> 0);
            const n_86 = 0;
            comp.Outputs[n_86].UInt32Step[simStep] = res_6;
            break;
        }
        case 43: {
            let a_13;
            a_13 = comp.InputLinks[0].BigIntStep[simStep];
            const w_11 = comp.InputLinks[0].Width | 0;
            const mask_4 = op_Subtraction(op_LeftShift(fromInt32(1), w_11), fromInt32(1));
            const res_7 = op_Subtraction(mask_4, op_BitwiseAnd(a_13, mask_4));
            const n_88 = 0;
            comp.Outputs[n_88].BigIntStep[simStep] = res_7;
            break;
        }
        case 44: {
            let a_14;
            a_14 = comp.InputLinks[0].UInt32Step[simStep];
            const res_8 = (a_14 === 0) ? 0 : ((a_14 === 1) ? (((1 << numberOfBits_12) >>> 0) - 1) : toFail(printf("Can\'t happen")));
            const n_89 = 0;
            comp.Outputs[n_89].UInt32Step[simStep] = res_8;
            break;
        }
        case 45: {
            let a_15;
            a_15 = comp.InputLinks[0].UInt32Step[simStep];
            const res_9 = (a_15 === 0) ? fromZero() : ((a_15 === 1) ? op_Subtraction(op_LeftShift(fromOne(), numberOfBits_13), fromOne()) : toFail(printf("Can\'t happen")));
            const n_90 = 0;
            comp.Outputs[n_90].BigIntStep[simStep] = res_9;
            break;
        }
        case 46: {
            toFail(printf("what? Custom components are removed before the fast simulation: %A"))(c);
            break;
        }
        case 47: {
            let matchValue_73;
            matchValue_73 = comp.InputLinks[0].UInt32Step[simStep];
            let bits1_6;
            bits1_6 = comp.InputLinks[1].UInt32Step[simStep];
            const bits0_6 = matchValue_73;
            const res_10 = (((bits1_6 << comp.InputLinks[0].Width) >>> 0) | bits0_6) >>> 0;
            const n_92 = 0;
            comp.Outputs[n_92].UInt32Step[simStep] = res_10;
            break;
        }
        case 48: {
            const matchValue_75 = comp.BigIntState;
            if (matchValue_75 != null) {
                const outs_1 = matchValue_75.OutputIsBigInt;
                const ins = matchValue_75.InputIsBigInt;
                const matchValue_76 = ins[0];
                const matchValue_77 = ins[1];
                if (matchValue_76) {
                    if (matchValue_77) {
                        let matchValue_85;
                        matchValue_85 = comp.InputLinks[0].BigIntStep[simStep];
                        let bits1_10;
                        bits1_10 = comp.InputLinks[1].BigIntStep[simStep];
                        const bits0_10 = matchValue_85;
                        const res_14 = op_BitwiseOr(op_LeftShift(bits1_10, comp.InputLinks[0].Width), bits0_10);
                        const n_100 = 0;
                        comp.Outputs[n_100].BigIntStep[simStep] = res_14;
                    }
                    else {
                        let matchValue_83;
                        matchValue_83 = comp.InputLinks[0].BigIntStep[simStep];
                        let bits1_9;
                        bits1_9 = comp.InputLinks[1].UInt32Step[simStep];
                        const bits0_9 = matchValue_83;
                        const res_13 = op_BitwiseOr(op_LeftShift(fromUInt32(bits1_9), comp.InputLinks[0].Width), bits0_9);
                        const n_98 = 0;
                        comp.Outputs[n_98].BigIntStep[simStep] = res_13;
                    }
                }
                else if (matchValue_77) {
                    let matchValue_81;
                    matchValue_81 = comp.InputLinks[0].UInt32Step[simStep];
                    let bits1_8;
                    bits1_8 = comp.InputLinks[1].BigIntStep[simStep];
                    const bits0_8 = matchValue_81;
                    const res_12 = op_BitwiseOr(op_LeftShift(bits1_8, comp.InputLinks[0].Width), fromUInt32(bits0_8));
                    const n_96 = 0;
                    comp.Outputs[n_96].BigIntStep[simStep] = res_12;
                }
                else {
                    let matchValue_79;
                    matchValue_79 = comp.InputLinks[0].UInt32Step[simStep];
                    let bits1_7;
                    bits1_7 = comp.InputLinks[1].UInt32Step[simStep];
                    const bits0_7 = matchValue_79;
                    const res_11 = op_BitwiseOr(op_LeftShift(fromUInt32(bits1_7), comp.InputLinks[0].Width), fromUInt32(bits0_7));
                    const n_94 = 0;
                    comp.Outputs[n_94].BigIntStep[simStep] = res_11;
                }
            }
            else {
                throw new Error("MergeWires with BigIntState");
            }
            break;
        }
        case 49: {
            const mergeTwoValues = (width_18, value1, value2) => ((((value1 << width_18) >>> 0) | value2) >>> 0);
            const res_15 = fold2((acc, width_19, input) => {
                if (input < 0) {
                    throw new Error("Input values must be non-negative");
                }
                return mergeTwoValues(width_19, acc, comp.InputLinks[input].UInt32Step[simStep]);
            }, 0, reverse(map((x) => comp.InputLinks[x].Width, toList(rangeDouble(0, 1, n_101 - 1)))), toList(delay(() => map_1((x_1) => x_1, rangeDouble(n_101 - 1, -1, 0)))));
            const n_103 = 0;
            comp.Outputs[n_103].UInt32Step[simStep] = res_15;
            break;
        }
        case 50: {
            const matchValue_87 = comp.BigIntState;
            if (matchValue_87 != null) {
                const outs_2 = matchValue_87.OutputIsBigInt;
                const ins_1 = matchValue_87.InputIsBigInt;
                throw new Error("TODO: MergeN with BigIntState");
            }
            else {
                throw new Error("MergeN with BigIntState");
            }
            break;
        }
        case 51: {
            let bits_12;
            bits_12 = comp.InputLinks[0].UInt32Step[simStep];
            let patternInput_38;
            const bits1_11 = getBitsFromUInt32(comp.InputLinks[0].Width - 1, topWireWidth, bits_12);
            const bits0_11 = getBitsFromUInt32(topWireWidth - 1, 0, bits_12);
            patternInput_38 = [bits0_11, bits1_11];
            const bits1_12 = patternInput_38[1];
            const bits0_12 = patternInput_38[0];
            const n_106 = 0;
            comp.Outputs[n_106].UInt32Step[simStep] = bits0_12;
            const n_107 = 1;
            comp.Outputs[n_107].UInt32Step[simStep] = bits1_12;
            break;
        }
        case 52: {
            const msBits = map2((width_20, lsb_2) => ((width_20 + lsb_2) - 1), outputWidths, lsBits);
            let bits_13;
            bits_13 = comp.InputLinks[0].UInt32Step[simStep];
            iterateIndexed2((index, lsb_3, msb) => {
                const outBits_3 = getBitsFromUInt32(msb, lsb_3, bits_13);
                const n_109 = index | 0;
                comp.Outputs[n_109].UInt32Step[simStep] = outBits_3;
            }, lsBits, msBits);
            break;
        }
        case 53: {
            const matchValue_88 = comp.BigIntState;
            if (matchValue_88 != null) {
                const outs_3 = matchValue_88.OutputIsBigInt;
                const ins_2 = matchValue_88.InputIsBigInt;
                throw new Error("TODO: SplitN with BigIntState");
            }
            else {
                throw new Error("SplitN with BigIntState");
            }
            break;
        }
        case 54: {
            let bits_14;
            bits_14 = comp.InputLinks[0].BigIntStep[simStep];
            const matchValue_89 = comp.BigIntState;
            if (matchValue_89 != null) {
                const outs_4 = matchValue_89.OutputIsBigInt;
                const ins_3 = matchValue_89.InputIsBigInt;
                const matchValue_90 = ins_3[0];
                const matchValue_91 = outs_4[0];
                if (matchValue_90) {
                    if (matchValue_91) {
                        const bits0_16 = getBitsFromBigInt(topWireWidth_1 - 1, 0, bits_14);
                        const bits1_16 = getBitsFromBigInt(comp.InputLinks[0].Width - 1, topWireWidth_1, bits_14);
                        const n_120 = 0;
                        comp.Outputs[n_120].BigIntStep[simStep] = bits0_16;
                        const n_121 = 1;
                        comp.Outputs[n_121].BigIntStep[simStep] = bits1_16;
                    }
                    else {
                        const bits0_15 = getBitsFromBigInt(topWireWidth_1 - 1, 0, bits_14);
                        const bits1_15 = getBitsFromBigIntToUInt32(comp.InputLinks[0].Width - 1, topWireWidth_1, bits_14);
                        const n_117 = 0;
                        comp.Outputs[n_117].BigIntStep[simStep] = bits0_15;
                        const n_118 = 1;
                        comp.Outputs[n_118].UInt32Step[simStep] = bits1_15;
                    }
                }
                else if (matchValue_91) {
                    const bits0_14 = getBitsFromBigIntToUInt32(topWireWidth_1 - 1, 0, bits_14);
                    const bits1_14 = getBitsFromBigInt(comp.InputLinks[0].Width - 1, topWireWidth_1, bits_14);
                    const n_114 = 0;
                    comp.Outputs[n_114].UInt32Step[simStep] = bits0_14;
                    const n_115 = 1;
                    comp.Outputs[n_115].BigIntStep[simStep] = bits1_14;
                }
                else {
                    const bits0_13 = getBitsFromBigIntToUInt32(topWireWidth_1 - 1, 0, bits_14);
                    const bits1_13 = getBitsFromBigIntToUInt32(comp.InputLinks[0].Width - 1, topWireWidth_1, bits_14);
                    const n_111 = 0;
                    comp.Outputs[n_111].UInt32Step[simStep] = bits0_13;
                    const n_112 = 1;
                    comp.Outputs[n_112].UInt32Step[simStep] = bits1_13;
                }
            }
            else {
                throw new Error("SplitWire with BigIntState");
            }
            break;
        }
        case 55: {
            let d;
            if (numStep === 0) {
                d = 0;
            }
            else {
                const n_122 = 0;
                d = comp.InputLinks[n_122].UInt32Step[simStepOld];
            }
            const n_123 = 0;
            comp.Outputs[n_123].UInt32Step[simStep] = d;
            break;
        }
        case 56: {
            let matchValue_93;
            if (numStep === 0) {
                matchValue_93 = 0;
            }
            else {
                const n_124 = 0;
                matchValue_93 = comp.InputLinks[n_124].UInt32Step[simStepOld];
            }
            let en;
            if (numStep === 0) {
                en = 0;
            }
            else {
                const n_125 = 1;
                en = comp.InputLinks[n_125].UInt32Step[simStepOld];
            }
            const d_1 = matchValue_93;
            switch (en) {
                case 0: {
                    let fd_93;
                    fd_93 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                    const n_126 = 0;
                    comp.Outputs[n_126].UInt32Step[simStep] = fd_93;
                    break;
                }
                case 1: {
                    const n_128 = 0;
                    comp.Outputs[n_128].UInt32Step[simStep] = d_1;
                    break;
                }
                default:
                    throw new Error("Can\'t happen");
            }
            break;
        }
        case 57: {
            toFail(printf("DFF/DFFE with BigIntState"));
            break;
        }
        case 58: {
            let bits_15;
            if (numStep === 0) {
                bits_15 = 0;
            }
            else {
                const n_129 = 0;
                bits_15 = comp.InputLinks[n_129].UInt32Step[simStepOld];
            }
            const n_130 = 0;
            comp.Outputs[n_130].UInt32Step[simStep] = bits_15;
            break;
        }
        case 59: {
            let bits_16;
            if (numStep === 0) {
                bits_16 = fromZero();
            }
            else {
                const n_131 = 0;
                bits_16 = comp.InputLinks[n_131].BigIntStep[simStepOld];
            }
            const n_132 = 0;
            comp.Outputs[n_132].BigIntStep[simStep] = bits_16;
            break;
        }
        case 60: {
            let matchValue_95;
            if (numStep === 0) {
                matchValue_95 = 0;
            }
            else {
                const n_133 = 0;
                matchValue_95 = comp.InputLinks[n_133].UInt32Step[simStepOld];
            }
            let enable;
            if (numStep === 0) {
                enable = 0;
            }
            else {
                const n_134 = 1;
                enable = comp.InputLinks[n_134].UInt32Step[simStepOld];
            }
            const bits_17 = matchValue_95;
            switch (enable) {
                case 0: {
                    let fd_97;
                    fd_97 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                    const n_135 = 0;
                    comp.Outputs[n_135].UInt32Step[simStep] = fd_97;
                    break;
                }
                case 1: {
                    const n_137 = 0;
                    comp.Outputs[n_137].UInt32Step[simStep] = bits_17;
                    break;
                }
                default:
                    toFail(printf("RegisterE received invalid enable value: %A"))(enable);
            }
            break;
        }
        case 61: {
            let matchValue_97;
            if (numStep === 0) {
                matchValue_97 = fromZero();
            }
            else {
                const n_138 = 0;
                matchValue_97 = comp.InputLinks[n_138].BigIntStep[simStepOld];
            }
            let enable_1;
            if (numStep === 0) {
                enable_1 = 0;
            }
            else {
                const n_139 = 1;
                enable_1 = comp.InputLinks[n_139].UInt32Step[simStepOld];
            }
            const bits_18 = matchValue_97;
            switch (enable_1) {
                case 0: {
                    let fd_99;
                    fd_99 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
                    const n_140 = 0;
                    comp.Outputs[n_140].BigIntStep[simStep] = fd_99;
                    break;
                }
                case 1: {
                    const n_142 = 0;
                    comp.Outputs[n_142].BigIntStep[simStep] = bits_18;
                    break;
                }
                default:
                    toFail(printf("RegisterE received invalid enable value: %A"))(enable_1);
            }
            break;
        }
        case 62: {
            let matchValue_99;
            if (numStep === 0) {
                matchValue_99 = 0;
            }
            else {
                const n_143 = 0;
                matchValue_99 = comp.InputLinks[n_143].UInt32Step[simStepOld];
            }
            let load;
            if (numStep === 0) {
                load = 0;
            }
            else {
                const n_144 = 1;
                load = comp.InputLinks[n_144].UInt32Step[simStepOld];
            }
            let enable_2;
            if (numStep === 0) {
                enable_2 = 0;
            }
            else {
                const n_145 = 2;
                enable_2 = comp.InputLinks[n_145].UInt32Step[simStepOld];
            }
            const bits_19 = matchValue_99;
            let res_16;
            let matchResult_1;
            if (enable_2 === 1) {
                switch (load) {
                    case 0: {
                        matchResult_1 = 0;
                        break;
                    }
                    case 1: {
                        matchResult_1 = 1;
                        break;
                    }
                    default:
                        matchResult_1 = 2;
                }
            }
            else {
                matchResult_1 = 2;
            }
            switch (matchResult_1) {
                case 0: {
                    let lastOut;
                    lastOut = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                    const n_147 = op_Addition(fromUInt32(lastOut), fromInt32(1));
                    res_16 = (equals(n_147, fromFloat64(Math.pow(2, width_25))) ? 0 : (toUInt32(n_147) >>> 0));
                    break;
                }
                case 1: {
                    res_16 = bits_19;
                    break;
                }
                default: {
                    res_16 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                }
            }
            const n_149 = 0;
            comp.Outputs[n_149].UInt32Step[simStep] = res_16;
            break;
        }
        case 63: {
            let matchValue_103;
            if (numStep === 0) {
                matchValue_103 = fromZero();
            }
            else {
                const n_150 = 0;
                matchValue_103 = comp.InputLinks[n_150].BigIntStep[simStepOld];
            }
            let load_1;
            if (numStep === 0) {
                load_1 = 0;
            }
            else {
                const n_151 = 1;
                load_1 = comp.InputLinks[n_151].UInt32Step[simStepOld];
            }
            let enable_3;
            if (numStep === 0) {
                enable_3 = 0;
            }
            else {
                const n_152 = 2;
                enable_3 = comp.InputLinks[n_152].UInt32Step[simStepOld];
            }
            const bits_20 = matchValue_103;
            let res_17;
            let matchResult_2;
            if (enable_3 === 1) {
                switch (load_1) {
                    case 0: {
                        matchResult_2 = 0;
                        break;
                    }
                    case 1: {
                        matchResult_2 = 1;
                        break;
                    }
                    default:
                        matchResult_2 = 2;
                }
            }
            else {
                matchResult_2 = 2;
            }
            switch (matchResult_2) {
                case 0: {
                    let lastOut_1;
                    lastOut_1 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
                    const n_154 = op_Addition(lastOut_1, fromInt32(1));
                    res_17 = (equals(n_154, fromFloat64(Math.pow(2, width_26))) ? fromZero() : n_154);
                    break;
                }
                case 1: {
                    res_17 = bits_20;
                    break;
                }
                default: {
                    res_17 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
                }
            }
            const n_156 = 0;
            comp.Outputs[n_156].BigIntStep[simStep] = res_17;
            break;
        }
        case 64: {
            let matchValue_107;
            if (numStep === 0) {
                matchValue_107 = 0;
            }
            else {
                const n_157 = 0;
                matchValue_107 = comp.InputLinks[n_157].UInt32Step[simStepOld];
            }
            let load_2;
            if (numStep === 0) {
                load_2 = 0;
            }
            else {
                const n_158 = 1;
                load_2 = comp.InputLinks[n_158].UInt32Step[simStepOld];
            }
            const bits_21 = matchValue_107;
            let res_18;
            switch (load_2) {
                case 0: {
                    let lastOut_2;
                    lastOut_2 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                    const n_160 = op_Addition(fromUInt32(lastOut_2), fromOne());
                    res_18 = (equals(n_160, fromFloat64(Math.pow(2, width_27))) ? 0 : (toUInt32(n_160) >>> 0));
                    break;
                }
                case 1: {
                    res_18 = bits_21;
                    break;
                }
                default:
                    res_18 = toFail(printf("CounterNoEnable received invalid load value: %A"))(load_2);
            }
            const n_161 = 0;
            comp.Outputs[n_161].UInt32Step[simStep] = res_18;
            break;
        }
        case 65: {
            let matchValue_109;
            if (numStep === 0) {
                matchValue_109 = fromZero();
            }
            else {
                const n_162 = 0;
                matchValue_109 = comp.InputLinks[n_162].BigIntStep[simStepOld];
            }
            let load_3;
            if (numStep === 0) {
                load_3 = 0;
            }
            else {
                const n_163 = 1;
                load_3 = comp.InputLinks[n_163].UInt32Step[simStepOld];
            }
            const bits_22 = matchValue_109;
            let res_19;
            switch (load_3) {
                case 0: {
                    let lastOut_3;
                    lastOut_3 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
                    const n_165 = op_Addition(lastOut_3, fromOne());
                    res_19 = (equals(n_165, fromFloat64(Math.pow(2, width_28))) ? fromZero() : n_165);
                    break;
                }
                case 1: {
                    res_19 = bits_22;
                    break;
                }
                default:
                    res_19 = toFail(printf("CounterNoEnable received invalid load value: %A"))(load_3);
            }
            const n_166 = 0;
            comp.Outputs[n_166].BigIntStep[simStep] = res_19;
            break;
        }
        case 66: {
            let enable_4;
            if (numStep === 0) {
                enable_4 = 0;
            }
            else {
                const n_167 = 0;
                enable_4 = comp.InputLinks[n_167].UInt32Step[simStepOld];
            }
            let res_20;
            switch (enable_4) {
                case 0: {
                    res_20 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                    break;
                }
                case 1: {
                    let lastOut_4;
                    lastOut_4 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
                    const n_169 = op_Addition(fromUInt32(lastOut_4), fromOne());
                    res_20 = (equals(n_169, fromFloat64(Math.pow(2, width_29))) ? 0 : (toUInt32(n_169) >>> 0));
                    break;
                }
                default:
                    res_20 = toFail(printf("CounterNoLoad received invalid enable value: %A"))(enable_4);
            }
            const n_171 = 0;
            comp.Outputs[n_171].UInt32Step[simStep] = res_20;
            break;
        }
        case 67: {
            let enable_5;
            if (numStep === 0) {
                enable_5 = 0;
            }
            else {
                const n_172 = 0;
                enable_5 = comp.InputLinks[n_172].UInt32Step[simStepOld];
            }
            let res_21;
            switch (enable_5) {
                case 0: {
                    res_21 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
                    break;
                }
                case 1: {
                    let lastOut_5;
                    lastOut_5 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
                    const n_174 = op_Addition(lastOut_5, fromOne());
                    res_21 = (equals(n_174, fromFloat64(Math.pow(2, width_30))) ? fromZero() : n_174);
                    break;
                }
                default:
                    res_21 = toFail(printf("CounterNoLoad received invalid enable value: %A"))(enable_5);
            }
            const n_176 = 0;
            comp.Outputs[n_176].BigIntStep[simStep] = res_21;
            break;
        }
        case 68: {
            let lastOut_6;
            lastOut_6 = ((numStep === 0) ? 0 : comp.Outputs[0].UInt32Step[simStepOld]);
            const n_178 = op_Addition(fromUInt32(lastOut_6), fromOne());
            const res_22 = equals(n_178, fromFloat64(Math.pow(2, width_31))) ? 0 : (toUInt32(n_178) >>> 0);
            const n_179 = 0;
            comp.Outputs[n_179].UInt32Step[simStep] = res_22;
            break;
        }
        case 69: {
            let lastOut_7;
            lastOut_7 = ((numStep === 0) ? fromZero() : comp.Outputs[0].BigIntStep[simStepOld]);
            const n_181 = op_Addition(lastOut_7, fromOne());
            const res_23 = equals(n_181, fromFloat64(Math.pow(2, width_32))) ? fromZero() : n_181;
            const n_182 = 0;
            comp.Outputs[n_182].BigIntStep[simStep] = res_23;
            break;
        }
        case 70: {
            let addr;
            addr = comp.InputLinks[0].UInt32Step[simStep];
            const outData = readMemoryAddrUInt32DataUInt32(mem, addr);
            const n_183 = 0;
            comp.Outputs[n_183].UInt32Step[simStep] = outData;
            break;
        }
        case 71: {
            const matchValue_111 = comp.BigIntState;
            if (matchValue_111 != null) {
                const outs_5 = matchValue_111.OutputIsBigInt;
                const ins_4 = matchValue_111.InputIsBigInt;
                const matchValue_112 = ins_4[0];
                const matchValue_113 = outs_5[0];
                if (matchValue_112) {
                    if (matchValue_113) {
                        let addr_1;
                        addr_1 = comp.InputLinks[0].BigIntStep[simStep];
                        const outData_1 = readMemoryAddrBigIntDataBigInt(mem_1, addr_1);
                        const n_185 = 0;
                        comp.Outputs[n_185].BigIntStep[simStep] = outData_1;
                    }
                    else {
                        let addr_3;
                        addr_3 = comp.InputLinks[0].BigIntStep[simStep];
                        const outData_3 = readMemoryAddrBigIntDataUInt32(mem_1, addr_3);
                        const n_187 = 0;
                        comp.Outputs[n_187].UInt32Step[simStep] = outData_3;
                    }
                }
                else if (matchValue_113) {
                    let addr_2;
                    addr_2 = comp.InputLinks[0].UInt32Step[simStep];
                    const outData_2 = readMemoryAddrUInt32DataBigInt(mem_1, addr_2);
                    const n_186 = 0;
                    comp.Outputs[n_186].BigIntStep[simStep] = outData_2;
                }
                else {
                    const arg_391 = comp.InputLinks[0].Width | 0;
                    toFail(printf("ROM received data with wrong width: expected %d but got %A"))(mem_1.WordWidth)(arg_391);
                }
            }
            else {
                const arg_380 = comp.InputLinks[0].Width | 0;
                toFail(printf("ROM received data with wrong width: expected %d but got %A"))(mem_1.WordWidth)(arg_380);
            }
            break;
        }
        case 72: {
            let addr_4;
            if (numStep === 0) {
                addr_4 = 0;
            }
            else {
                const n_189 = 0;
                addr_4 = comp.InputLinks[n_189].UInt32Step[simStepOld];
            }
            const outData_4 = readMemoryAddrUInt32DataUInt32(mem_2, addr_4);
            const n_190 = 0;
            comp.Outputs[n_190].UInt32Step[simStep] = outData_4;
            break;
        }
        case 73: {
            const matchValue_115 = comp.BigIntState;
            if (matchValue_115 != null) {
                const outs_6 = matchValue_115.OutputIsBigInt;
                const ins_5 = matchValue_115.InputIsBigInt;
                const matchValue_116 = ins_5[0];
                const matchValue_117 = outs_6[0];
                if (matchValue_116) {
                    if (matchValue_117) {
                        let addr_5;
                        addr_5 = comp.InputLinks[0].BigIntStep[simStep];
                        const outData_5 = readMemoryAddrBigIntDataBigInt(mem_3, addr_5);
                        const n_192 = 0;
                        comp.Outputs[n_192].BigIntStep[simStep] = outData_5;
                    }
                    else {
                        let addr_7;
                        addr_7 = comp.InputLinks[0].BigIntStep[simStep];
                        const outData_7 = readMemoryAddrBigIntDataUInt32(mem_3, addr_7);
                        const n_194 = 0;
                        comp.Outputs[n_194].UInt32Step[simStep] = outData_7;
                    }
                }
                else if (matchValue_117) {
                    let addr_6;
                    addr_6 = comp.InputLinks[0].UInt32Step[simStep];
                    const outData_6 = readMemoryAddrUInt32DataBigInt(mem_3, addr_6);
                    const n_193 = 0;
                    comp.Outputs[n_193].BigIntStep[simStep] = outData_6;
                }
                else {
                    const arg_409 = comp.InputLinks[0].Width | 0;
                    toFail(printf("ROM received data with wrong width: expected %d but got %A"))(mem_3.WordWidth)(arg_409);
                }
            }
            else {
                const arg_398 = comp.InputLinks[0].Width | 0;
                toFail(printf("ROM received data with wrong width: expected %d but got %A"))(mem_3.WordWidth)(arg_398);
            }
            break;
        }
        case 74: {
            const mem_4 = getRamStateMemory(numStep, simStepOld, comp.State, memory);
            let matchValue_119;
            if (numStep === 0) {
                matchValue_119 = 0;
            }
            else {
                const n_196 = 0;
                matchValue_119 = comp.InputLinks[n_196].UInt32Step[simStepOld];
            }
            let matchValue_120;
            if (numStep === 0) {
                matchValue_120 = 0;
            }
            else {
                const n_197 = 1;
                matchValue_120 = comp.InputLinks[n_197].UInt32Step[simStepOld];
            }
            let write;
            if (numStep === 0) {
                write = 0;
            }
            else {
                const n_198 = 2;
                write = comp.InputLinks[n_198].UInt32Step[simStepOld];
            }
            const dataIn = matchValue_120;
            const address = matchValue_119;
            const patternInput_47 = (write === 0) ? [mem_4, readMemoryAddrUInt32DataUInt32(mem_4, address)] : ((write === 1) ? [writeMemoryAddrUInt32DataUInt32(mem_4, address, dataIn), readMemoryAddrUInt32DataUInt32(mem_4, address)] : toFail(`simulation error: invalid 1 bit write value ${write}`));
            const mem_5 = patternInput_47[0];
            const dataOut = patternInput_47[1];
            const matchValue_122 = comp.State;
            if (matchValue_122 != null) {
                const stateArr = matchValue_122;
                stateArr.Step[simStep] = (new SimulationComponentState(3, [mem_5]));
            }
            else {
                toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
            }
            const n_199 = 0;
            comp.Outputs[n_199].UInt32Step[simStep] = dataOut;
            break;
        }
        case 75: {
            const mem_6 = getRamStateMemory(numStep, simStepOld, comp.State, memory_1);
            const matchValue_123 = comp.BigIntState;
            if (matchValue_123 != null) {
                const outs_7 = matchValue_123.OutputIsBigInt;
                const ins_6 = matchValue_123.InputIsBigInt;
                const matchValue_124 = ins_6[0];
                const matchValue_125 = outs_7[0];
                if (matchValue_124) {
                    if (matchValue_125) {
                        let matchValue_127;
                        if (numStep === 0) {
                            matchValue_127 = fromZero();
                        }
                        else {
                            const n_202 = 0;
                            matchValue_127 = comp.InputLinks[n_202].BigIntStep[simStepOld];
                        }
                        let matchValue_128;
                        if (numStep === 0) {
                            matchValue_128 = fromZero();
                        }
                        else {
                            const n_203 = 1;
                            matchValue_128 = comp.InputLinks[n_203].BigIntStep[simStepOld];
                        }
                        let write_1;
                        if (numStep === 0) {
                            write_1 = 0;
                        }
                        else {
                            const n_204 = 2;
                            write_1 = comp.InputLinks[n_204].UInt32Step[simStepOld];
                        }
                        const dataIn_1 = matchValue_128;
                        const address_1 = matchValue_127;
                        const patternInput_49 = (write_1 === 0) ? [mem_6, readMemoryAddrBigIntDataBigInt(mem_6, address_1)] : ((write_1 === 1) ? [writeMemoryAddrBigIntDataBigInt(mem_6, address_1, dataIn_1), readMemoryAddrBigIntDataBigInt(mem_6, address_1)] : toFail(`simulation error: invalid 1 bit write value ${write_1}`));
                        const mem_7 = patternInput_49[0];
                        const dataOut_1 = patternInput_49[1];
                        const matchValue_130 = comp.State;
                        if (matchValue_130 != null) {
                            const stateArr_1 = matchValue_130;
                            stateArr_1.Step[simStep] = (new SimulationComponentState(3, [mem_7]));
                        }
                        else {
                            toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                        }
                        const n_205 = 0;
                        comp.Outputs[n_205].BigIntStep[simStep] = dataOut_1;
                    }
                    else {
                        let matchValue_135;
                        if (numStep === 0) {
                            matchValue_135 = fromZero();
                        }
                        else {
                            const n_210 = 0;
                            matchValue_135 = comp.InputLinks[n_210].BigIntStep[simStepOld];
                        }
                        let matchValue_136;
                        if (numStep === 0) {
                            matchValue_136 = 0;
                        }
                        else {
                            const n_211 = 1;
                            matchValue_136 = comp.InputLinks[n_211].UInt32Step[simStepOld];
                        }
                        let write_3;
                        if (numStep === 0) {
                            write_3 = 0;
                        }
                        else {
                            const n_212 = 2;
                            write_3 = comp.InputLinks[n_212].UInt32Step[simStepOld];
                        }
                        const dataIn_3 = matchValue_136;
                        const address_3 = matchValue_135;
                        const patternInput_53 = (write_3 === 0) ? [mem_6, readMemoryAddrBigIntDataUInt32(mem_6, address_3)] : ((write_3 === 1) ? [writeMemoryAddrBigIntDataUInt32(mem_6, address_3, dataIn_3), readMemoryAddrBigIntDataUInt32(mem_6, address_3)] : toFail(`simulation error: invalid 1 bit write value ${write_3}`));
                        const mem_9 = patternInput_53[0];
                        const dataOut_3 = patternInput_53[1];
                        const matchValue_138 = comp.State;
                        if (matchValue_138 != null) {
                            const stateArr_3 = matchValue_138;
                            stateArr_3.Step[simStep] = (new SimulationComponentState(3, [mem_9]));
                        }
                        else {
                            toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                        }
                        const n_213 = 0;
                        comp.Outputs[n_213].UInt32Step[simStep] = dataOut_3;
                    }
                }
                else if (matchValue_125) {
                    let matchValue_131;
                    if (numStep === 0) {
                        matchValue_131 = 0;
                    }
                    else {
                        const n_206 = 0;
                        matchValue_131 = comp.InputLinks[n_206].UInt32Step[simStepOld];
                    }
                    let matchValue_132;
                    if (numStep === 0) {
                        matchValue_132 = fromZero();
                    }
                    else {
                        const n_207 = 1;
                        matchValue_132 = comp.InputLinks[n_207].BigIntStep[simStepOld];
                    }
                    let write_2;
                    if (numStep === 0) {
                        write_2 = 0;
                    }
                    else {
                        const n_208 = 2;
                        write_2 = comp.InputLinks[n_208].UInt32Step[simStepOld];
                    }
                    const dataIn_2 = matchValue_132;
                    const address_2 = matchValue_131;
                    const patternInput_51 = (write_2 === 0) ? [mem_6, readMemoryAddrUInt32DataBigInt(mem_6, address_2)] : ((write_2 === 1) ? [writeMemoryAddrUInt32DataBigInt(mem_6, address_2, dataIn_2), readMemoryAddrUInt32DataBigInt(mem_6, address_2)] : toFail(`simulation error: invalid 1 bit write value ${write_2}`));
                    const mem_8 = patternInput_51[0];
                    const dataOut_2 = patternInput_51[1];
                    const matchValue_134 = comp.State;
                    if (matchValue_134 != null) {
                        const stateArr_2 = matchValue_134;
                        stateArr_2.Step[simStep] = (new SimulationComponentState(3, [mem_8]));
                    }
                    else {
                        toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                    }
                    const n_209 = 0;
                    comp.Outputs[n_209].BigIntStep[simStep] = dataOut_2;
                }
                else {
                    const arg_423 = comp.InputLinks[0].Width | 0;
                    toFail(printf("RAM received data with wrong width: expected %d but got %A"))(mem_6.WordWidth)(arg_423);
                }
            }
            else {
                const arg_421 = comp.InputLinks[0].Width | 0;
                toFail(printf("RAM received data with wrong width: expected %d but got %A"))(mem_6.WordWidth)(arg_421);
            }
            break;
        }
        case 76: {
            if (isClockedReduction) {
                const mem_10 = getRamStateMemory(numStep, simStepOld, comp.State, memory_2);
                let matchValue_139;
                if (numStep === 0) {
                    matchValue_139 = 0;
                }
                else {
                    const n_214 = 0;
                    matchValue_139 = comp.InputLinks[n_214].UInt32Step[simStepOld];
                }
                let matchValue_140;
                if (numStep === 0) {
                    matchValue_140 = 0;
                }
                else {
                    const n_215 = 1;
                    matchValue_140 = comp.InputLinks[n_215].UInt32Step[simStepOld];
                }
                let write_4;
                if (numStep === 0) {
                    write_4 = 0;
                }
                else {
                    const n_216 = 2;
                    write_4 = comp.InputLinks[n_216].UInt32Step[simStepOld];
                }
                const dataIn_4 = matchValue_140;
                const address_4 = matchValue_139;
                const mem_11 = (write_4 === 0) ? mem_10 : ((write_4 === 1) ? writeMemoryAddrUInt32DataUInt32(mem_10, address_4, dataIn_4) : toFail(`simulation error: invalid 1 bit write value ${write_4}`));
                const matchValue_142 = comp.State;
                if (matchValue_142 != null) {
                    const stateArr_4 = matchValue_142;
                    stateArr_4.Step[simStep] = (new SimulationComponentState(3, [mem_11]));
                }
                else {
                    toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                }
            }
            else {
                const mem_12 = getRamStateMemory(numStep + 1, simStep, comp.State, memory_2);
                let address_5;
                address_5 = comp.InputLinks[0].UInt32Step[simStep];
                const data = readMemoryAddrUInt32DataUInt32(mem_12, address_5);
                const n_217 = 0;
                comp.Outputs[n_217].UInt32Step[simStep] = data;
            }
            break;
        }
        case 77: {
            const matchValue_143 = comp.BigIntState;
            if (matchValue_143 != null) {
                const outs_8 = matchValue_143.OutputIsBigInt;
                const ins_7 = matchValue_143.InputIsBigInt;
                const matchValue_144 = ins_7[0];
                const matchValue_145 = outs_8[0];
                if (matchValue_144) {
                    if (matchValue_145) {
                        if (isClockedReduction) {
                            const mem_14 = getRamStateMemory(numStep, simStepOld, comp.State, mem_13);
                            let matchValue_147;
                            if (numStep === 0) {
                                matchValue_147 = fromZero();
                            }
                            else {
                                const n_220 = 0;
                                matchValue_147 = comp.InputLinks[n_220].BigIntStep[simStepOld];
                            }
                            let matchValue_148;
                            if (numStep === 0) {
                                matchValue_148 = fromZero();
                            }
                            else {
                                const n_221 = 1;
                                matchValue_148 = comp.InputLinks[n_221].BigIntStep[simStepOld];
                            }
                            let write_5;
                            if (numStep === 0) {
                                write_5 = 0;
                            }
                            else {
                                const n_222 = 2;
                                write_5 = comp.InputLinks[n_222].UInt32Step[simStepOld];
                            }
                            const dataIn_5 = matchValue_148;
                            const address_6 = matchValue_147;
                            const mem_15 = (write_5 === 0) ? mem_14 : ((write_5 === 1) ? writeMemoryAddrBigIntDataBigInt(mem_14, address_6, dataIn_5) : toFail(`simulation error: invalid 1 bit write value ${write_5}`));
                            const matchValue_150 = comp.State;
                            if (matchValue_150 != null) {
                                const stateArr_5 = matchValue_150;
                                stateArr_5.Step[simStep] = (new SimulationComponentState(3, [mem_15]));
                            }
                            else {
                                toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                            }
                        }
                        else {
                            const mem_16 = getRamStateMemory(numStep + 1, simStep, comp.State, mem_13);
                            let address_7;
                            address_7 = comp.InputLinks[0].BigIntStep[simStep];
                            const data_1 = readMemoryAddrBigIntDataBigInt(mem_16, address_7);
                            const n_223 = 0;
                            comp.Outputs[n_223].BigIntStep[simStep] = data_1;
                        }
                    }
                    else if (isClockedReduction) {
                        const mem_20 = getRamStateMemory(numStep, simStepOld, comp.State, mem_13);
                        let matchValue_155;
                        if (numStep === 0) {
                            matchValue_155 = fromZero();
                        }
                        else {
                            const n_228 = 0;
                            matchValue_155 = comp.InputLinks[n_228].BigIntStep[simStepOld];
                        }
                        let matchValue_156;
                        if (numStep === 0) {
                            matchValue_156 = 0;
                        }
                        else {
                            const n_229 = 1;
                            matchValue_156 = comp.InputLinks[n_229].UInt32Step[simStepOld];
                        }
                        let write_7;
                        if (numStep === 0) {
                            write_7 = 0;
                        }
                        else {
                            const n_230 = 2;
                            write_7 = comp.InputLinks[n_230].UInt32Step[simStepOld];
                        }
                        const dataIn_7 = matchValue_156;
                        const address_10 = matchValue_155;
                        const mem_21 = (write_7 === 0) ? mem_20 : ((write_7 === 1) ? writeMemoryAddrBigIntDataUInt32(mem_20, address_10, dataIn_7) : toFail(`simulation error: invalid 1 bit write value ${write_7}`));
                        const matchValue_158 = comp.State;
                        if (matchValue_158 != null) {
                            const stateArr_7 = matchValue_158;
                            stateArr_7.Step[simStep] = (new SimulationComponentState(3, [mem_21]));
                        }
                        else {
                            toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                        }
                    }
                    else {
                        const mem_22 = getRamStateMemory(numStep + 1, simStep, comp.State, mem_13);
                        let address_11;
                        if (numStep === 0) {
                            address_11 = fromZero();
                        }
                        else {
                            const n_231 = 0;
                            address_11 = comp.InputLinks[n_231].BigIntStep[simStepOld];
                        }
                        const data_3 = readMemoryAddrBigIntDataUInt32(mem_22, address_11);
                        const n_232 = 0;
                        comp.Outputs[n_232].UInt32Step[simStep] = data_3;
                    }
                }
                else if (matchValue_145) {
                    if (isClockedReduction) {
                        const mem_17 = getRamStateMemory(numStep, simStepOld, comp.State, mem_13);
                        let matchValue_151;
                        if (numStep === 0) {
                            matchValue_151 = 0;
                        }
                        else {
                            const n_224 = 0;
                            matchValue_151 = comp.InputLinks[n_224].UInt32Step[simStepOld];
                        }
                        let matchValue_152;
                        if (numStep === 0) {
                            matchValue_152 = fromZero();
                        }
                        else {
                            const n_225 = 1;
                            matchValue_152 = comp.InputLinks[n_225].BigIntStep[simStepOld];
                        }
                        let write_6;
                        if (numStep === 0) {
                            write_6 = 0;
                        }
                        else {
                            const n_226 = 2;
                            write_6 = comp.InputLinks[n_226].UInt32Step[simStepOld];
                        }
                        const dataIn_6 = matchValue_152;
                        const address_8 = matchValue_151;
                        const mem_18 = (write_6 === 0) ? mem_17 : ((write_6 === 1) ? writeMemoryAddrUInt32DataBigInt(mem_17, address_8, dataIn_6) : toFail(`simulation error: invalid 1 bit write value ${write_6}`));
                        const matchValue_154 = comp.State;
                        if (matchValue_154 != null) {
                            const stateArr_6 = matchValue_154;
                            stateArr_6.Step[simStep] = (new SimulationComponentState(3, [mem_18]));
                        }
                        else {
                            toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                        }
                    }
                    else {
                        const mem_19 = getRamStateMemory(numStep + 1, simStep, comp.State, mem_13);
                        let address_9;
                        address_9 = comp.InputLinks[0].UInt32Step[simStep];
                        const data_2 = readMemoryAddrUInt32DataBigInt(mem_19, address_9);
                        const n_227 = 0;
                        comp.Outputs[n_227].BigIntStep[simStep] = data_2;
                    }
                }
                else {
                    const arg_467 = comp.InputLinks[0].Width | 0;
                    toFail(printf("RAM received data with wrong width: expected %d but got %A"))(mem_13.WordWidth)(arg_467);
                }
            }
            else {
                const arg_465 = comp.InputLinks[0].Width | 0;
                toFail(printf("RAM received data with wrong width: expected %d but got %A"))(mem_13.WordWidth)(arg_465);
            }
            break;
        }
        case 78: {
            toFail(`simulation error: deprecated component type ${componentType}`);
            break;
        }
    }
}

/**
 * Version of fastReduce which operates on the IOArray.FDataStep arrays,
 * and simulates using posibly algebraic data.
 * Given the input port values for a component comp, work out its output in the same clock cycle.
 * Used by TruthTable simulations, which use FData type that includes algebraic data.
 * Because TruthTable simulations are only combinational the match statement is much simpler than normal FastReduce.
 * Clocked operations need not be implemented.
 */
export function fastReduceFData(maxArraySize, numStep, isClockedReduction, comp) {
    let _arg_13, list_2, gateType_2, exp_6, gateType_3, exp_7, exp_8, gateType_4, x, gateType_5, fd__1, fd_29, matchValue_10, n_19, fd__2, fd_31, matchValue_11, n_21, fd__3, fd_33, matchValue_12, n_23, fd__4, fd_35, matchValue_13, n_25, fd__7, fd_57, matchValue_37, n_31, n_74, fd__13, fd_160, matchValue_117, n_117, fd__14, fd_167, matchValue_124, n_125, fd__15, fd_168, matchValue_125, n_126, matchValue_128, n_1_2, n_129, w_17, w_1_1, fd__16, fd_171, matchValue_129, n_132, fd__17, fd_172, matchValue_130, n_133, fd__18, fd_178, matchValue_136, n_140, matchValue_139, n_1_3, n_143, w_22, w_1_2, fd__19, fd_183, matchValue_141, n_148, matchValue_144, n_1_4, n_151, w_25, w_1_3, matchValue_149, n_1_5, n_159, w_30, w_1_4;
    const componentType = comp.FType;
    const simStep = (numStep % maxArraySize) | 0;
    const simStepOld = ((simStep === 0) ? (maxArraySize - 1) : (simStep - 1)) | 0;
    let matchResult, cVal, width_2, numberOfBits, numberOfBits_1;
    switch (componentType.tag) {
        case 44:
        case 45:
        case 43: {
            matchResult = 0;
            break;
        }
        case 48: {
            matchResult = 1;
            break;
        }
        case 0: {
            matchResult = 2;
            break;
        }
        case 1: {
            matchResult = 4;
            break;
        }
        case 2: {
            matchResult = 5;
            break;
        }
        case 3: {
            matchResult = 6;
            break;
        }
        case 4: {
            matchResult = 7;
            break;
        }
        case 8: {
            matchResult = 8;
            break;
        }
        case 6: {
            matchResult = 9;
            break;
        }
        case 47: {
            matchResult = 10;
            break;
        }
        case 5: {
            matchResult = 11;
            break;
        }
        case 10: {
            matchResult = 12;
            break;
        }
        case 11: {
            matchResult = 13;
            break;
        }
        case 12: {
            matchResult = 14;
            break;
        }
        case 13: {
            matchResult = 15;
            break;
        }
        case 14: {
            matchResult = 16;
            break;
        }
        case 15: {
            matchResult = 17;
            break;
        }
        case 16: {
            matchResult = 18;
            break;
        }
        case 21: {
            matchResult = 21;
            break;
        }
        case 24: {
            matchResult = 22;
            break;
        }
        case 22: {
            matchResult = 23;
            break;
        }
        case 23: {
            matchResult = 24;
            break;
        }
        case 25: {
            matchResult = 25;
            break;
        }
        case 26: {
            matchResult = 26;
            break;
        }
        case 27: {
            matchResult = 27;
            break;
        }
        case 29: {
            matchResult = 28;
            break;
        }
        case 28: {
            matchResult = 29;
            break;
        }
        case 30: {
            matchResult = 30;
            break;
        }
        case 31: {
            matchResult = 31;
            break;
        }
        case 32: {
            matchResult = 32;
            break;
        }
        case 33: {
            matchResult = 33;
            break;
        }
        case 34: {
            matchResult = 34;
            break;
        }
        case 35: {
            matchResult = 35;
            break;
        }
        case 37: {
            matchResult = 36;
            break;
        }
        case 36: {
            matchResult = 37;
            break;
        }
        case 38: {
            matchResult = 38;
            break;
        }
        case 39: {
            matchResult = 39;
            break;
        }
        case 40: {
            matchResult = 40;
            break;
        }
        case 41: {
            matchResult = 41;
            break;
        }
        case 42: {
            matchResult = 42;
            break;
        }
        case 7: {
            matchResult = 3;
            cVal = componentType.fields[1];
            width_2 = componentType.fields[0];
            break;
        }
        case 49: {
            matchResult = 3;
            cVal = componentType.fields[1];
            width_2 = componentType.fields[0];
            break;
        }
        case 17: {
            matchResult = 19;
            numberOfBits = componentType.fields[0];
            break;
        }
        case 19: {
            matchResult = 19;
            numberOfBits = componentType.fields[0];
            break;
        }
        case 18: {
            matchResult = 20;
            numberOfBits_1 = componentType.fields[0];
            break;
        }
        case 20: {
            matchResult = 20;
            numberOfBits_1 = componentType.fields[0];
            break;
        }
        default:
            matchResult = 43;
    }
    switch (matchResult) {
        case 0: {
            toFail(printf("What? Legacy RAM component types should never occur"));
            break;
        }
        case 1: {
            toFail(printf("Legacy Input component types should never occur"));
            break;
        }
        case 2: {
            const width = componentType.fields[0] | 0;
            if (comp.Active) {
                let bits;
                const fd = comp.InputLinks[0].FDataStep[simStep];
                bits = fd;
                const n = 0;
                comp.Outputs[n].FDataStep[simStep] = bits;
            }
            break;
        }
        case 3: {
            const fd_2 = new FData(0, [convertInt64ToFastData(width_2, cVal)]);
            const n_1 = 0;
            comp.Outputs[n_1].FDataStep[simStep] = fd_2;
            break;
        }
        case 4: {
            const width_3 = componentType.fields[0] | 0;
            let bits_2;
            const fd_3 = comp.InputLinks[0].FDataStep[simStep];
            bits_2 = fd_3;
            const n_2 = 0;
            comp.Outputs[n_2].FDataStep[simStep] = bits_2;
            break;
        }
        case 5: {
            const width_5 = componentType.fields[0] | 0;
            let bits_4;
            const fd_5 = comp.InputLinks[0].FDataStep[simStep];
            bits_4 = fd_5;
            const n_3 = 0;
            comp.Outputs[n_3].FDataStep[simStep] = bits_4;
            break;
        }
        case 6: {
            let bits_6;
            const fd_7 = comp.InputLinks[0].FDataStep[simStep];
            bits_6 = fd_7;
            const n_4 = 0;
            comp.Outputs[n_4].FDataStep[simStep] = bits_6;
            break;
        }
        case 7: {
            break;
        }
        case 8: {
            let matchValue;
            const fd_9 = comp.InputLinks[0].FDataStep[simStep];
            matchValue = fd_9;
            if (matchValue.tag === 1) {
                const exp = matchValue.fields[0];
                const n_7 = 0;
                comp.Outputs[n_7].FDataStep[simStep] = (new FData(1, [new FastAlgExp(2, [new UnaryOp(1, []), exp])]));
            }
            else {
                let bit;
                let fd_;
                const fd_10 = comp.InputLinks[0].FDataStep[simStep];
                fd_ = fd_10;
                if (fd_.tag === 0) {
                    const fd_11 = fd_.fields[0];
                    const matchValue_1 = fd_11.Dat;
                    if (matchValue_1.tag === 1) {
                        bit = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_11.Dat, fd_11.Width]));
                    }
                    else {
                        const n_5 = matchValue_1.fields[0];
                        bit = n_5;
                    }
                }
                else {
                    bit = toFail(printf("Can\'t extract data from Algebra"));
                }
                const fd_12 = (((bit ^ 1) >>> 0) === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]));
                const n_6 = 0;
                comp.Outputs[n_6].FDataStep[simStep] = fd_12;
            }
            break;
        }
        case 9: {
            const width_7 = componentType.fields[0] | 0;
            const lsb = componentType.fields[1] | 0;
            let matchValue_2;
            const fd_14 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_2 = fd_14;
            if (matchValue_2.tag === 1) {
                const exp_2 = matchValue_2.fields[0];
                const newExp = new FastAlgExp(2, [new UnaryOp(2, [lsb, (lsb + width_7) - 1]), exp_2]);
                const n_9 = 0;
                comp.Outputs[n_9].FDataStep[simStep] = (new FData(1, [newExp]));
            }
            else {
                const bits_7 = matchValue_2.fields[0];
                const outBits = getBits((lsb + width_7) - 1, lsb, bits_7);
                const n_8 = 0;
                comp.Outputs[n_8].FDataStep[simStep] = (new FData(0, [outBits]));
            }
            break;
        }
        case 10: {
            const width_8 = componentType.fields[0] | 0;
            const compareVal = componentType.fields[1];
            let matchValue_3;
            const fd_17 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_3 = fd_17;
            if (matchValue_3.tag === 1) {
                const exp_3 = matchValue_3.fields[0];
                const n_11 = 0;
                comp.Outputs[n_11].FDataStep[simStep] = (new FData(1, [new FastAlgExp(4, [exp_3, new ComparisonOp(), compareVal])]));
            }
            else {
                const bits_8 = matchValue_3.fields[0];
                const inputNum = convertFastDataToBigint(bits_8);
                const outNum = ((equals(inputNum, fromUInt32(compareVal)) ? 1 : 0) === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]));
                const n_10 = 0;
                comp.Outputs[n_10].FDataStep[simStep] = outNum;
            }
            break;
        }
        case 11: {
            const width_9 = componentType.fields[0] | 0;
            const dialogText = componentType.fields[2];
            const compareVal_1 = componentType.fields[1];
            let matchValue_4;
            const fd_20 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_4 = fd_20;
            if (matchValue_4.tag === 1) {
                const exp_4 = matchValue_4.fields[0];
                const n_13 = 0;
                comp.Outputs[n_13].FDataStep[simStep] = (new FData(1, [new FastAlgExp(4, [exp_4, new ComparisonOp(), compareVal_1])]));
            }
            else {
                const bits_9 = matchValue_4.fields[0];
                const inputNum_1 = convertFastDataToBigint(bits_9);
                const outNum_1 = ((equals(inputNum_1, fromUInt32(compareVal_1)) ? 1 : 0) === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]));
                const n_12 = 0;
                comp.Outputs[n_12].FDataStep[simStep] = outNum_1;
            }
            break;
        }
        case 12: {
            const n_14 = componentType.fields[1] | 0;
            const gateType = componentType.fields[0];
            const gateType_1 = gateType;
            const isAlgExp = (inp) => {
                if (inp.tag === 0) {
                    return false;
                }
                else {
                    return true;
                }
            };
            const inputs = map((i_9) => {
                const fd_23 = comp.InputLinks[i_9].FDataStep[simStep];
                return fd_23;
            }, toList(rangeDouble(0, 1, n_14 - 1)));
            if (exists(isAlgExp, inputs)) {
                const fd_24 = new FData(1, [(_arg_13 = ((list_2 = map(FData__get_toExp, inputs), reduce(uncurry2((gateType_2 = gateType_1, (gateType_2 === "nand") ? ((exp_5) => ((exp_1_1) => (new FastAlgExp(3, [exp_5, new BinaryOp(2, []), exp_1_1])))) : ((gateType_2 === "or") ? ((exp_2_1) => ((exp_3_1) => (new FastAlgExp(3, [exp_2_1, new BinaryOp(3, []), exp_3_1])))) : ((gateType_2 === "nor") ? ((exp_2_1) => ((exp_3_1) => (new FastAlgExp(3, [exp_2_1, new BinaryOp(3, []), exp_3_1])))) : ((gateType_2 === "xor") ? ((exp_4_1) => ((exp_5_1) => (new FastAlgExp(3, [exp_4_1, new BinaryOp(4, []), exp_5_1])))) : ((gateType_2 === "xnor") ? ((exp_4_1) => ((exp_5_1) => (new FastAlgExp(3, [exp_4_1, new BinaryOp(4, []), exp_5_1])))) : ((exp_5) => ((exp_1_1) => (new FastAlgExp(3, [exp_5, new BinaryOp(2, []), exp_1_1])))))))))), list_2))), ((exp_6 = _arg_13, (gateType_3 = gateType_1, (gateType_3 === "nor") ? true : ((gateType_3 === "xnor") ? true : ((gateType_3 === "and") ? false : ((gateType_3 === "or") ? false : (!(gateType_3 === "xor")))))))) ? ((exp_7 = _arg_13, new FastAlgExp(2, [new UnaryOp(1, []), exp_7]))) : ((exp_8 = _arg_13, exp_8)))]);
                const n_16 = 0;
                comp.Outputs[n_16].FDataStep[simStep] = fd_24;
            }
            else {
                let fd_25;
                let _arg_16;
                const list_4 = map((_arg_15) => {
                    let n_17;
                    if (_arg_15.tag === 1) {
                        throw new Error("Can\'t encounter algebraic expression here");
                    }
                    else {
                        const d = _arg_15.fields[0];
                        const this$_14 = d;
                        const matchValue_5 = this$_14.Dat;
                        if (matchValue_5.tag === 1) {
                            if ((n_17 = matchValue_5.fields[0], this$_14.Width <= 32)) {
                                const n_2_1 = matchValue_5.fields[0];
                                return toUInt32(n_2_1) >>> 0;
                            }
                            else {
                                return toFail(printf("GetQint32 Can\'t turn Alg into a uint32"));
                            }
                        }
                        else {
                            const n_1_1 = matchValue_5.fields[0];
                            return n_1_1;
                        }
                    }
                }, inputs);
                _arg_16 = reduce(uncurry2((gateType_4 = gateType_1, (gateType_4 === "nand") ? ((bit_7) => ((bit_1_1) => ((bit_7 & bit_1_1) >>> 0))) : ((gateType_4 === "or") ? ((bit_2_1) => ((bit_3_1) => ((bit_2_1 | bit_3_1) >>> 0))) : ((gateType_4 === "nor") ? ((bit_2_1) => ((bit_3_1) => ((bit_2_1 | bit_3_1) >>> 0))) : ((gateType_4 === "xor") ? ((bit_4_1) => ((bit_5_1) => ((bit_4_1 ^ bit_5_1) >>> 0))) : ((gateType_4 === "xnor") ? ((bit_4_1) => ((bit_5_1) => ((bit_4_1 ^ bit_5_1) >>> 0))) : ((bit_7) => ((bit_1_1) => ((bit_7 & bit_1_1) >>> 0))))))))), list_4);
                if ((x = _arg_16, (gateType_5 = gateType_1, (gateType_5 === "nor") ? true : ((gateType_5 === "xnor") ? true : ((gateType_5 === "and") ? false : ((gateType_5 === "or") ? false : (!(gateType_5 === "xor")))))))) {
                    const x_1 = _arg_16;
                    fd_25 = ((x_1 === 1) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)])));
                }
                else {
                    const x_2 = _arg_16;
                    fd_25 = (new FData(0, [new FastData(new FastBits(0, [x_2]), 1)]));
                }
                const n_18 = 0;
                comp.Outputs[n_18].FDataStep[simStep] = fd_25;
            }
            break;
        }
        case 13: {
            let matchValue_6;
            const fd_26 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_6 = fd_26;
            let matchValue_7;
            const fd_27 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_7 = fd_27;
            let matchValue_8;
            const fd_28 = comp.InputLinks[2].FDataStep[simStep];
            matchValue_8 = fd_28;
            let matchResult_1, bitSelect, exp1_3, exp2_3, bitSelect_1, bits_10, exp_9, bitSelect_2, bits_11, exp_10, bitSelect_3, bits0, bits1;
            if (matchValue_6.tag === 0) {
                if (matchValue_7.tag === 0) {
                    if (matchValue_8.tag === 1) {
                        matchResult_1 = 4;
                    }
                    else {
                        matchResult_1 = 3;
                        bitSelect_3 = matchValue_8.fields[0];
                        bits0 = matchValue_6.fields[0];
                        bits1 = matchValue_7.fields[0];
                    }
                }
                else if (matchValue_8.tag === 1) {
                    matchResult_1 = 4;
                }
                else {
                    matchResult_1 = 2;
                    bitSelect_2 = matchValue_8.fields[0];
                    bits_11 = matchValue_6.fields[0];
                    exp_10 = matchValue_7.fields[0];
                }
            }
            else if (matchValue_7.tag === 0) {
                if (matchValue_8.tag === 1) {
                    matchResult_1 = 4;
                }
                else {
                    matchResult_1 = 1;
                    bitSelect_1 = matchValue_8.fields[0];
                    bits_10 = matchValue_7.fields[0];
                    exp_9 = matchValue_6.fields[0];
                }
            }
            else if (matchValue_8.tag === 1) {
                matchResult_1 = 4;
            }
            else {
                matchResult_1 = 0;
                bitSelect = matchValue_8.fields[0];
                exp1_3 = matchValue_6.fields[0];
                exp2_3 = matchValue_7.fields[0];
            }
            switch (matchResult_1) {
                case 0: {
                    const out = (((fd__1 = (new FData(0, [bitSelect])), (fd__1.tag === 0) ? ((fd_29 = fd__1.fields[0], (matchValue_10 = fd_29.Dat, (matchValue_10.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_29.Dat, fd_29.Width])) : ((n_19 = matchValue_10.fields[0], n_19))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0) ? (new FData(1, [exp1_3])) : (new FData(1, [exp2_3]));
                    const n_20 = 0;
                    comp.Outputs[n_20].FDataStep[simStep] = out;
                    break;
                }
                case 1: {
                    const out_1 = (((fd__2 = (new FData(0, [bitSelect_1])), (fd__2.tag === 0) ? ((fd_31 = fd__2.fields[0], (matchValue_11 = fd_31.Dat, (matchValue_11.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_31.Dat, fd_31.Width])) : ((n_21 = matchValue_11.fields[0], n_21))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0) ? (new FData(1, [exp_9])) : (new FData(0, [bits_10]));
                    const n_22 = 0;
                    comp.Outputs[n_22].FDataStep[simStep] = out_1;
                    break;
                }
                case 2: {
                    const out_2 = (((fd__3 = (new FData(0, [bitSelect_2])), (fd__3.tag === 0) ? ((fd_33 = fd__3.fields[0], (matchValue_12 = fd_33.Dat, (matchValue_12.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_33.Dat, fd_33.Width])) : ((n_23 = matchValue_12.fields[0], n_23))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0) ? (new FData(0, [bits_11])) : (new FData(1, [exp_10]));
                    const n_24 = 0;
                    comp.Outputs[n_24].FDataStep[simStep] = out_2;
                    break;
                }
                case 3: {
                    const out_3 = (((fd__4 = (new FData(0, [bitSelect_3])), (fd__4.tag === 0) ? ((fd_35 = fd__4.fields[0], (matchValue_13 = fd_35.Dat, (matchValue_13.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_35.Dat, fd_35.Width])) : ((n_25 = matchValue_13.fields[0], n_25))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0) ? bits0 : bits1;
                    const n_26 = 0;
                    comp.Outputs[n_26].FDataStep[simStep] = (new FData(0, [out_3]));
                    break;
                }
                case 4: {
                    const err = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    SEL port of a Mux2. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                    throw new AlgebraNotImplemented(err);
                    break;
                }
            }
            break;
        }
        case 14: {
            let matchValue_14;
            const fd_37 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_14 = fd_37;
            let matchValue_15;
            const fd_38 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_15 = fd_38;
            let matchValue_16;
            const fd_39 = comp.InputLinks[2].FDataStep[simStep];
            matchValue_16 = fd_39;
            let matchValue_17;
            const fd_40 = comp.InputLinks[3].FDataStep[simStep];
            matchValue_17 = fd_40;
            let matchValue_18;
            const fd_41 = comp.InputLinks[4].FDataStep[simStep];
            matchValue_18 = fd_41;
            if (matchValue_18.tag === 1) {
                const err_1 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    SEL port of a Mux4. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_1);
            }
            else {
                const fd3 = matchValue_17;
                const fd2 = matchValue_16;
                const fd1 = matchValue_15;
                const fd0 = matchValue_14;
                const bitSelect_4 = matchValue_18.fields[0];
                let out_4;
                let matchValue_21;
                const fd__5 = new FData(0, [bitSelect_4]);
                if (fd__5.tag === 0) {
                    const fd_42 = fd__5.fields[0];
                    const matchValue_20 = fd_42.Dat;
                    if (matchValue_20.tag === 1) {
                        matchValue_21 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [2, fd_42.Dat, fd_42.Width]));
                    }
                    else {
                        const n_27 = matchValue_20.fields[0];
                        matchValue_21 = n_27;
                    }
                }
                else {
                    matchValue_21 = toFail(printf("Can\'t extract data from Algebra"));
                }
                out_4 = ((matchValue_21 === 0) ? fd0 : ((matchValue_21 === 1) ? fd1 : ((matchValue_21 === 2) ? fd2 : ((matchValue_21 === 3) ? fd3 : toFail(printf("Cannot happen"))))));
                const n_28 = 0;
                comp.Outputs[n_28].FDataStep[simStep] = out_4;
            }
            break;
        }
        case 15: {
            let matchValue_22;
            const fd_44 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_22 = fd_44;
            let matchValue_23;
            const fd_45 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_23 = fd_45;
            let matchValue_24;
            const fd_46 = comp.InputLinks[2].FDataStep[simStep];
            matchValue_24 = fd_46;
            let matchValue_25;
            const fd_47 = comp.InputLinks[3].FDataStep[simStep];
            matchValue_25 = fd_47;
            let matchValue_26;
            const fd_48 = comp.InputLinks[4].FDataStep[simStep];
            matchValue_26 = fd_48;
            let matchValue_27;
            const fd_49 = comp.InputLinks[5].FDataStep[simStep];
            matchValue_27 = fd_49;
            let matchValue_28;
            const fd_50 = comp.InputLinks[6].FDataStep[simStep];
            matchValue_28 = fd_50;
            let matchValue_29;
            const fd_51 = comp.InputLinks[7].FDataStep[simStep];
            matchValue_29 = fd_51;
            let matchValue_30;
            const fd_52 = comp.InputLinks[8].FDataStep[simStep];
            matchValue_30 = fd_52;
            if (matchValue_30.tag === 1) {
                const err_2 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    SEL port of a Mux8. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_2);
            }
            else {
                const fd7 = matchValue_29;
                const fd6 = matchValue_28;
                const fd5 = matchValue_27;
                const fd4 = matchValue_26;
                const fd3_1 = matchValue_25;
                const fd2_1 = matchValue_24;
                const fd1_1 = matchValue_23;
                const fd0_1 = matchValue_22;
                const bitSelect_5 = matchValue_30.fields[0];
                let out_5;
                let matchValue_33;
                const fd__6 = new FData(0, [bitSelect_5]);
                if (fd__6.tag === 0) {
                    const fd_53 = fd__6.fields[0];
                    const matchValue_32 = fd_53.Dat;
                    if (matchValue_32.tag === 1) {
                        matchValue_33 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [3, fd_53.Dat, fd_53.Width]));
                    }
                    else {
                        const n_29 = matchValue_32.fields[0];
                        matchValue_33 = n_29;
                    }
                }
                else {
                    matchValue_33 = toFail(printf("Can\'t extract data from Algebra"));
                }
                out_5 = ((matchValue_33 === 0) ? fd0_1 : ((matchValue_33 === 1) ? fd1_1 : ((matchValue_33 === 2) ? fd2_1 : ((matchValue_33 === 3) ? fd3_1 : ((matchValue_33 === 4) ? fd4 : ((matchValue_33 === 5) ? fd5 : ((matchValue_33 === 6) ? fd6 : ((matchValue_33 === 7) ? fd7 : toFail(printf("Cannot happen"))))))))));
                const n_30 = 0;
                comp.Outputs[n_30].FDataStep[simStep] = out_5;
            }
            break;
        }
        case 16: {
            let matchValue_34;
            const fd_55 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_34 = fd_55;
            let matchValue_35;
            const fd_56 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_35 = fd_56;
            if (matchValue_35.tag === 1) {
                const err_3 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    SEL port of a Demux2. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_3);
            }
            else {
                const fdIn = matchValue_34;
                const bitSelect_6 = matchValue_35.fields[0];
                const zeros = new FData(0, [convertIntToFastData(FData__get_Width(fdIn), 0)]);
                const patternInput = (((fd__7 = (new FData(0, [bitSelect_6])), (fd__7.tag === 0) ? ((fd_57 = fd__7.fields[0], (matchValue_37 = fd_57.Dat, (matchValue_37.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_57.Dat, fd_57.Width])) : ((n_31 = matchValue_37.fields[0], n_31))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0) ? [fdIn, zeros] : [zeros, fdIn];
                const out1 = patternInput[1];
                const out0 = patternInput[0];
                const w = FData__get_Width(fdIn) | 0;
                const n_32 = 0;
                comp.Outputs[n_32].FDataStep[simStep] = out0;
                const n_33 = 1;
                comp.Outputs[n_33].FDataStep[simStep] = out1;
            }
            break;
        }
        case 17: {
            let matchValue_38;
            const fd_60 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_38 = fd_60;
            let matchValue_39;
            const fd_61 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_39 = fd_61;
            if (matchValue_39.tag === 1) {
                const err_4 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    SEL port of a Demux4. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_4);
            }
            else {
                const fdIn_1 = matchValue_38;
                const bitSelect_7 = matchValue_39.fields[0];
                const zeros_1 = new FData(0, [convertIntToFastData(FData__get_Width(fdIn_1), 0)]);
                let patternInput_1;
                let matchValue_42;
                const fd__8 = new FData(0, [bitSelect_7]);
                if (fd__8.tag === 0) {
                    const fd_62 = fd__8.fields[0];
                    const matchValue_41 = fd_62.Dat;
                    if (matchValue_41.tag === 1) {
                        matchValue_42 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [2, fd_62.Dat, fd_62.Width]));
                    }
                    else {
                        const n_34 = matchValue_41.fields[0];
                        matchValue_42 = n_34;
                    }
                }
                else {
                    matchValue_42 = toFail(printf("Can\'t extract data from Algebra"));
                }
                patternInput_1 = ((matchValue_42 === 0) ? [fdIn_1, zeros_1, zeros_1, zeros_1] : ((matchValue_42 === 1) ? [zeros_1, fdIn_1, zeros_1, zeros_1] : ((matchValue_42 === 2) ? [zeros_1, zeros_1, fdIn_1, zeros_1] : ((matchValue_42 === 3) ? [zeros_1, zeros_1, zeros_1, fdIn_1] : toFail(printf("Cannot happen"))))));
                const out3 = patternInput_1[3];
                const out2 = patternInput_1[2];
                const out1_1 = patternInput_1[1];
                const out0_1 = patternInput_1[0];
                const w_1 = FData__get_Width(fdIn_1) | 0;
                const n_35 = 0;
                comp.Outputs[n_35].FDataStep[simStep] = out0_1;
                const n_36 = 1;
                comp.Outputs[n_36].FDataStep[simStep] = out1_1;
                const n_37 = 2;
                comp.Outputs[n_37].FDataStep[simStep] = out2;
                const n_38 = 3;
                comp.Outputs[n_38].FDataStep[simStep] = out3;
            }
            break;
        }
        case 18: {
            let matchValue_43;
            const fd_67 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_43 = fd_67;
            let matchValue_44;
            const fd_68 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_44 = fd_68;
            if (matchValue_44.tag === 1) {
                const err_5 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    SEL port of a Demux8. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_5);
            }
            else {
                const fdIn_2 = matchValue_43;
                const bitSelect_8 = matchValue_44.fields[0];
                const zeros_2 = new FData(0, [convertIntToFastData(FData__get_Width(fdIn_2), 0)]);
                let patternInput_2;
                let matchValue_47;
                const fd__9 = new FData(0, [bitSelect_8]);
                if (fd__9.tag === 0) {
                    const fd_69 = fd__9.fields[0];
                    const matchValue_46 = fd_69.Dat;
                    if (matchValue_46.tag === 1) {
                        matchValue_47 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [3, fd_69.Dat, fd_69.Width]));
                    }
                    else {
                        const n_39 = matchValue_46.fields[0];
                        matchValue_47 = n_39;
                    }
                }
                else {
                    matchValue_47 = toFail(printf("Can\'t extract data from Algebra"));
                }
                patternInput_2 = ((matchValue_47 === 0) ? [fdIn_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2] : ((matchValue_47 === 1) ? [zeros_2, fdIn_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2] : ((matchValue_47 === 2) ? [zeros_2, zeros_2, fdIn_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2] : ((matchValue_47 === 3) ? [zeros_2, zeros_2, zeros_2, fdIn_2, zeros_2, zeros_2, zeros_2, zeros_2] : ((matchValue_47 === 4) ? [zeros_2, zeros_2, zeros_2, zeros_2, fdIn_2, zeros_2, zeros_2, zeros_2] : ((matchValue_47 === 5) ? [zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, fdIn_2, zeros_2, zeros_2] : ((matchValue_47 === 6) ? [zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, fdIn_2, zeros_2] : ((matchValue_47 === 7) ? [zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, zeros_2, fdIn_2] : toFail(printf("Cannot happen"))))))))));
                const out7 = patternInput_2[7];
                const out6 = patternInput_2[6];
                const out5 = patternInput_2[5];
                const out4 = patternInput_2[4];
                const out3_1 = patternInput_2[3];
                const out2_1 = patternInput_2[2];
                const out1_2 = patternInput_2[1];
                const out0_2 = patternInput_2[0];
                const w_2 = FData__get_Width(fdIn_2) | 0;
                const n_40 = 0;
                comp.Outputs[n_40].FDataStep[simStep] = out0_2;
                const n_41 = 1;
                comp.Outputs[n_41].FDataStep[simStep] = out1_2;
                const n_42 = 2;
                comp.Outputs[n_42].FDataStep[simStep] = out2_1;
                const n_43 = 3;
                comp.Outputs[n_43].FDataStep[simStep] = out3_1;
                const n_44 = 4;
                comp.Outputs[n_44].FDataStep[simStep] = out4;
                const n_45 = 5;
                comp.Outputs[n_45].FDataStep[simStep] = out5;
                const n_46 = 6;
                comp.Outputs[n_46].FDataStep[simStep] = out6;
                const n_47 = 7;
                comp.Outputs[n_47].FDataStep[simStep] = out7;
            }
            break;
        }
        case 19: {
            let matchValue_48;
            const fd_78 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_48 = fd_78;
            let matchValue_49;
            const fd_79 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_49 = fd_79;
            let matchValue_50;
            const fd_80 = comp.InputLinks[2].FDataStep[simStep];
            matchValue_50 = fd_80;
            let matchResult_2, A, B, cin, A_1, B_1, cin_2;
            if (matchValue_48.tag === 0) {
                if (matchValue_49.tag === 0) {
                    if (matchValue_50.tag === 0) {
                        matchResult_2 = 0;
                        A = matchValue_49.fields[0];
                        B = matchValue_50.fields[0];
                        cin = matchValue_48.fields[0];
                    }
                    else {
                        matchResult_2 = 1;
                        A_1 = matchValue_49;
                        B_1 = matchValue_50;
                        cin_2 = matchValue_48;
                    }
                }
                else {
                    matchResult_2 = 1;
                    A_1 = matchValue_49;
                    B_1 = matchValue_50;
                    cin_2 = matchValue_48;
                }
            }
            else {
                matchResult_2 = 1;
                A_1 = matchValue_49;
                B_1 = matchValue_50;
                cin_2 = matchValue_48;
            }
            switch (matchResult_2) {
                case 0: {
                    let patternInput_3;
                    const cin_1 = convertFastDataToInt(cin);
                    const w_3 = A.Width | 0;
                    const matchValue_52 = A.Dat;
                    const matchValue_53 = B.Dat;
                    let matchResult_3, a, b, a_2, b_2, a_3, b_3;
                    if (matchValue_52.tag === 0) {
                        if (matchValue_53.tag === 0) {
                            matchResult_3 = 1;
                            a_2 = matchValue_52.fields[0];
                            b_2 = matchValue_53.fields[0];
                        }
                        else {
                            matchResult_3 = 2;
                            a_3 = matchValue_52;
                            b_3 = matchValue_53;
                        }
                    }
                    else if (matchValue_53.tag === 1) {
                        matchResult_3 = 0;
                        a = matchValue_52.fields[0];
                        b = matchValue_53.fields[0];
                    }
                    else {
                        matchResult_3 = 2;
                        a_3 = matchValue_52;
                        b_3 = matchValue_53;
                    }
                    switch (matchResult_3) {
                        case 0: {
                            const mask = bigIntMask(w_3);
                            const a_1 = op_BitwiseAnd(a, mask);
                            const b_1 = op_BitwiseAnd(b, mask);
                            const sumInt = (cin_1 === 0) ? op_Addition(a_1, b_1) : op_Addition(op_Addition(a_1, b_1), fromInt32(1));
                            const sum = new FastData(new FastBits(1, [op_BitwiseAnd(sumInt, bigIntMask(w_3))]), w_3);
                            const cout = equals(op_RightShift(sumInt, w_3), fromInt32(0)) ? 0 : 1;
                            patternInput_3 = [sum, (cout === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]))];
                            break;
                        }
                        case 1: {
                            const mask_1 = ((1 << w_3) >>> 0) - 1;
                            if (w_3 === 32) {
                                const sumInt_1 = toUInt64(op_Addition(toUInt64(op_Addition(toUInt64(fromUInt32(a_2)), toUInt64(fromUInt32(b_2)))), toUInt64(fromUInt32((cin_1 & 1) >>> 0))));
                                const cout_1 = ((toUInt32(toUInt64(op_RightShift(sumInt_1, w_3))) >>> 0) & 1) >>> 0;
                                const sum_1 = convertIntToFastData(w_3, toUInt32(sumInt_1) >>> 0);
                                patternInput_3 = [sum_1, (cout_1 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]))];
                            }
                            else {
                                const sumInt_2 = (((a_2 & mask_1) >>> 0) + ((b_2 & mask_1) >>> 0)) + ((cin_1 & 1) >>> 0);
                                const cout_2 = ((sumInt_2 >>> w_3) & 1) >>> 0;
                                const sum_2 = convertIntToFastData(w_3, (sumInt_2 & mask_1) >>> 0);
                                patternInput_3 = [sum_2, (cout_2 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]))];
                            }
                            break;
                        }
                        default:
                            patternInput_3 = toFail(`Inconsistent inputs to NBitsAdder ${comp.FullName} A=${a_3},${A}; B=${b_3},${B}`);
                    }
                    const sum_3 = patternInput_3[0];
                    const cout_3 = patternInput_3[1];
                    if (componentType.tag === 17) {
                        const n_48 = 0;
                        comp.Outputs[n_48].FDataStep[simStep] = (new FData(0, [sum_3]));
                        const n_49 = 1;
                        comp.Outputs[n_49].FDataStep[simStep] = cout_3;
                    }
                    else {
                        const n_50 = 0;
                        comp.Outputs[n_50].FDataStep[simStep] = (new FData(0, [sum_3]));
                    }
                    break;
                }
                case 1: {
                    const matchValue_55 = FData__get_toExp(cin_2);
                    const matchValue_56 = FData__get_toExp(A_1);
                    const cinExp = matchValue_55;
                    const bExp = FData__get_toExp(B_1);
                    const aExp = matchValue_56;
                    const newExp_1 = new FastAlgExp(3, [new FastAlgExp(3, [aExp, new BinaryOp(0, []), bExp]), new BinaryOp(0, []), cinExp]);
                    const out0_3 = newExp_1;
                    const out1_3 = new FastAlgExp(2, [new UnaryOp(3, []), newExp_1]);
                    if (componentType.tag === 17) {
                        const n_51 = 0;
                        comp.Outputs[n_51].FDataStep[simStep] = (new FData(1, [out0_3]));
                        const n_52 = 1;
                        comp.Outputs[n_52].FDataStep[simStep] = (new FData(1, [out1_3]));
                    }
                    else {
                        const n_53 = 0;
                        comp.Outputs[n_53].FDataStep[simStep] = (new FData(1, [out0_3]));
                    }
                    break;
                }
            }
            break;
        }
        case 20: {
            let matchValue_58;
            const fd_87 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_58 = fd_87;
            let matchValue_59;
            const fd_88 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_59 = fd_88;
            let matchResult_4, A_2, B_2, A_3, B_3;
            if (matchValue_58.tag === 0) {
                if (matchValue_59.tag === 0) {
                    matchResult_4 = 0;
                    A_2 = matchValue_58.fields[0];
                    B_2 = matchValue_59.fields[0];
                }
                else {
                    matchResult_4 = 1;
                    A_3 = matchValue_58;
                    B_3 = matchValue_59;
                }
            }
            else {
                matchResult_4 = 1;
                A_3 = matchValue_58;
                B_3 = matchValue_59;
            }
            switch (matchResult_4) {
                case 0: {
                    let patternInput_5;
                    const cin_3 = 0;
                    const w_4 = A_2.Width | 0;
                    const matchValue_61 = A_2.Dat;
                    const matchValue_62 = B_2.Dat;
                    let matchResult_5, a_4, b_4, a_6, b_6, a_7, b_7;
                    if (matchValue_61.tag === 0) {
                        if (matchValue_62.tag === 0) {
                            matchResult_5 = 1;
                            a_6 = matchValue_61.fields[0];
                            b_6 = matchValue_62.fields[0];
                        }
                        else {
                            matchResult_5 = 2;
                            a_7 = matchValue_61;
                            b_7 = matchValue_62;
                        }
                    }
                    else if (matchValue_62.tag === 1) {
                        matchResult_5 = 0;
                        a_4 = matchValue_61.fields[0];
                        b_4 = matchValue_62.fields[0];
                    }
                    else {
                        matchResult_5 = 2;
                        a_7 = matchValue_61;
                        b_7 = matchValue_62;
                    }
                    switch (matchResult_5) {
                        case 0: {
                            const mask_2 = bigIntMask(w_4);
                            const a_5 = op_BitwiseAnd(a_4, mask_2);
                            const b_5 = op_BitwiseAnd(b_4, mask_2);
                            const sumInt_3 = (cin_3 === 0) ? op_Addition(a_5, b_5) : op_Addition(op_Addition(a_5, b_5), fromInt32(1));
                            const sum_4 = new FastData(new FastBits(1, [op_BitwiseAnd(sumInt_3, bigIntMask(w_4))]), w_4);
                            const cout_4 = equals(op_RightShift(sumInt_3, w_4), fromInt32(0)) ? 0 : 1;
                            patternInput_5 = [sum_4, (cout_4 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]))];
                            break;
                        }
                        case 1: {
                            const mask_3 = ((1 << w_4) >>> 0) - 1;
                            if (w_4 === 32) {
                                const sumInt_4 = toUInt64(op_Addition(toUInt64(op_Addition(toUInt64(fromUInt32(a_6)), toUInt64(fromUInt32(b_6)))), toUInt64(fromUInt32((cin_3 & 1) >>> 0))));
                                const cout_5 = ((toUInt32(toUInt64(op_RightShift(sumInt_4, w_4))) >>> 0) & 1) >>> 0;
                                const sum_5 = convertIntToFastData(w_4, toUInt32(sumInt_4) >>> 0);
                                patternInput_5 = [sum_5, (cout_5 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]))];
                            }
                            else {
                                const sumInt_5 = (((a_6 & mask_3) >>> 0) + ((b_6 & mask_3) >>> 0)) + ((cin_3 & 1) >>> 0);
                                const cout_6 = ((sumInt_5 >>> w_4) & 1) >>> 0;
                                const sum_6 = convertIntToFastData(w_4, (sumInt_5 & mask_3) >>> 0);
                                patternInput_5 = [sum_6, (cout_6 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]))];
                            }
                            break;
                        }
                        default:
                            patternInput_5 = toFail(`Inconsistent inputs to NBitsAdder ${comp.FullName} A=${a_7},${A_2}; B=${b_7},${B_2}`);
                    }
                    const sum_7 = patternInput_5[0];
                    const cout_7 = patternInput_5[1];
                    if (componentType.tag === 18) {
                        const n_54 = 0;
                        comp.Outputs[n_54].FDataStep[simStep] = (new FData(0, [sum_7]));
                        const n_55 = 1;
                        comp.Outputs[n_55].FDataStep[simStep] = cout_7;
                    }
                    else {
                        const n_56 = 0;
                        comp.Outputs[n_56].FDataStep[simStep] = (new FData(0, [sum_7]));
                    }
                    break;
                }
                case 1: {
                    const matchValue_64 = FData__get_toExp(A_3);
                    const bExp_1 = FData__get_toExp(B_3);
                    const aExp_1 = matchValue_64;
                    const newExp_2 = new FastAlgExp(3, [aExp_1, new BinaryOp(0, []), bExp_1]);
                    const out0_4 = newExp_2;
                    const out1_4 = new FastAlgExp(2, [new UnaryOp(3, []), newExp_2]);
                    if (componentType.tag === 18) {
                        const n_57 = 0;
                        comp.Outputs[n_57].FDataStep[simStep] = (new FData(1, [out0_4]));
                        const n_58 = 1;
                        comp.Outputs[n_58].FDataStep[simStep] = (new FData(1, [out1_4]));
                    }
                    else {
                        const n_59 = 0;
                        comp.Outputs[n_59].FDataStep[simStep] = (new FData(1, [out0_4]));
                    }
                    break;
                }
            }
            break;
        }
        case 21: {
            const op = componentType.fields[1];
            const numberOfBits_2 = componentType.fields[0] | 0;
            let matchValue_66;
            const fd_95 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_66 = fd_95;
            let matchValue_67;
            const fd_96 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_67 = fd_96;
            let matchResult_6, A_4, B_4, exp_11, num, w_5, A_5, B_5;
            if (matchValue_66.tag === 1) {
                if (matchValue_67.tag === 0) {
                    if (matchValue_67.fields[0].Dat.tag === 0) {
                        matchResult_6 = 1;
                        exp_11 = matchValue_66.fields[0];
                        num = matchValue_67.fields[0].Dat.fields[0];
                        w_5 = matchValue_67.fields[0].Width;
                    }
                    else {
                        matchResult_6 = 2;
                        A_5 = matchValue_66;
                        B_5 = matchValue_67;
                    }
                }
                else {
                    matchResult_6 = 2;
                    A_5 = matchValue_66;
                    B_5 = matchValue_67;
                }
            }
            else if (matchValue_67.tag === 1) {
                if (matchValue_66.fields[0].Dat.tag === 0) {
                    matchResult_6 = 1;
                    exp_11 = matchValue_67.fields[0];
                    num = matchValue_66.fields[0].Dat.fields[0];
                    w_5 = matchValue_66.fields[0].Width;
                }
                else {
                    matchResult_6 = 2;
                    A_5 = matchValue_66;
                    B_5 = matchValue_67;
                }
            }
            else {
                matchResult_6 = 0;
                A_4 = matchValue_66.fields[0];
                B_4 = matchValue_67.fields[0];
            }
            switch (matchResult_6) {
                case 0: {
                    let outDat;
                    const matchValue_69 = A_4.Dat;
                    const matchValue_70 = B_4.Dat;
                    let matchResult_7, a_8, b_8, a_9, b_9, a_10, b_10;
                    if (matchValue_69.tag === 0) {
                        if (matchValue_70.tag === 0) {
                            matchResult_7 = 1;
                            a_9 = matchValue_69.fields[0];
                            b_9 = matchValue_70.fields[0];
                        }
                        else {
                            matchResult_7 = 2;
                            a_10 = matchValue_69;
                            b_10 = matchValue_70;
                        }
                    }
                    else if (matchValue_70.tag === 1) {
                        matchResult_7 = 0;
                        a_8 = matchValue_69.fields[0];
                        b_8 = matchValue_70.fields[0];
                    }
                    else {
                        matchResult_7 = 2;
                        a_10 = matchValue_69;
                        b_10 = matchValue_70;
                    }
                    switch (matchResult_7) {
                        case 0: {
                            outDat = (new FastBits(1, [(op != null) ? op_BitwiseAnd(op_Multiply(a_8, b_8), op_Subtraction(op_LeftShift(fromInt32(1), A_4.Width), fromInt32(1))) : op_ExclusiveOr(a_8, b_8)]));
                            break;
                        }
                        case 1: {
                            outDat = (new FastBits(0, [(op != null) ? (((a_9 * b_9) & (((1 << A_4.Width) >>> 0) - 1)) >>> 0) : ((a_9 ^ b_9) >>> 0)]));
                            break;
                        }
                        default:
                            outDat = toFail(`Inconsistent inputs to NBitsXOr ${comp.FullName} A=${a_10},${A_4}; B=${b_10},${B_4}`);
                    }
                    const fd_97 = new FData(0, [new FastData(outDat, A_4.Width)]);
                    const n_60 = 0;
                    comp.Outputs[n_60].FDataStep[simStep] = fd_97;
                    break;
                }
                case 1: {
                    let minusOne;
                    const value = Math.pow(2, w_5) - 1;
                    minusOne = (value >>> 0);
                    if (num === minusOne) {
                        const n_61 = 0;
                        comp.Outputs[n_61].FDataStep[simStep] = (new FData(1, [new FastAlgExp(2, [new UnaryOp(1, []), exp_11])]));
                    }
                    else {
                        const numExp = FData__get_toExp((num === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)])));
                        const n_62 = 0;
                        comp.Outputs[n_62].FDataStep[simStep] = (new FData(1, [new FastAlgExp(3, [exp_11, new BinaryOp(0, []), numExp])]));
                    }
                    break;
                }
                case 2: {
                    const matchValue_72 = FData__get_toExp(A_5);
                    const bExp_2 = FData__get_toExp(B_5);
                    const aExp_2 = matchValue_72;
                    const n_63 = 0;
                    comp.Outputs[n_63].FDataStep[simStep] = (new FData(1, [new FastAlgExp(3, [aExp_2, new BinaryOp(4, []), bExp_2])]));
                    break;
                }
            }
            break;
        }
        case 22: {
            const numberOfBits_3 = componentType.fields[0] | 0;
            let matchValue_74;
            const fd_101 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_74 = fd_101;
            let matchValue_75;
            const fd_102 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_75 = fd_102;
            let matchResult_8, A_6, B_6, exp_12, num_1, w_6, A_7, B_7;
            if (matchValue_74.tag === 1) {
                if (matchValue_75.tag === 0) {
                    if (matchValue_75.fields[0].Dat.tag === 0) {
                        matchResult_8 = 1;
                        exp_12 = matchValue_74.fields[0];
                        num_1 = matchValue_75.fields[0].Dat.fields[0];
                        w_6 = matchValue_75.fields[0].Width;
                    }
                    else {
                        matchResult_8 = 2;
                        A_7 = matchValue_74;
                        B_7 = matchValue_75;
                    }
                }
                else {
                    matchResult_8 = 2;
                    A_7 = matchValue_74;
                    B_7 = matchValue_75;
                }
            }
            else if (matchValue_75.tag === 1) {
                if (matchValue_74.fields[0].Dat.tag === 0) {
                    matchResult_8 = 1;
                    exp_12 = matchValue_75.fields[0];
                    num_1 = matchValue_74.fields[0].Dat.fields[0];
                    w_6 = matchValue_74.fields[0].Width;
                }
                else {
                    matchResult_8 = 2;
                    A_7 = matchValue_74;
                    B_7 = matchValue_75;
                }
            }
            else {
                matchResult_8 = 0;
                A_6 = matchValue_74.fields[0];
                B_6 = matchValue_75.fields[0];
            }
            switch (matchResult_8) {
                case 0: {
                    let outDat_1;
                    const matchValue_77 = A_6.Dat;
                    const matchValue_78 = B_6.Dat;
                    let matchResult_9, a_11, b_11, a_12, b_12, a_13, b_13;
                    if (matchValue_77.tag === 0) {
                        if (matchValue_78.tag === 0) {
                            matchResult_9 = 1;
                            a_12 = matchValue_77.fields[0];
                            b_12 = matchValue_78.fields[0];
                        }
                        else {
                            matchResult_9 = 2;
                            a_13 = matchValue_77;
                            b_13 = matchValue_78;
                        }
                    }
                    else if (matchValue_78.tag === 1) {
                        matchResult_9 = 0;
                        a_11 = matchValue_77.fields[0];
                        b_11 = matchValue_78.fields[0];
                    }
                    else {
                        matchResult_9 = 2;
                        a_13 = matchValue_77;
                        b_13 = matchValue_78;
                    }
                    switch (matchResult_9) {
                        case 0: {
                            outDat_1 = (new FastBits(1, [op_BitwiseOr(a_11, b_11)]));
                            break;
                        }
                        case 1: {
                            outDat_1 = (new FastBits(0, [(a_12 | b_12) >>> 0]));
                            break;
                        }
                        default:
                            outDat_1 = toFail(`Inconsistent inputs to NBitsXOr ${comp.FullName} A=${a_13},${A_6}; B=${b_13},${B_6}`);
                    }
                    const fd_103 = new FData(0, [new FastData(outDat_1, A_6.Width)]);
                    const n_64 = 0;
                    comp.Outputs[n_64].FDataStep[simStep] = fd_103;
                    break;
                }
                case 1: {
                    let minusOne_1;
                    const value_1 = Math.pow(2, w_6) - 1;
                    minusOne_1 = (value_1 >>> 0);
                    if (num_1 === 0) {
                        const n_65 = 0;
                        comp.Outputs[n_65].FDataStep[simStep] = (new FData(1, [exp_12]));
                    }
                    else {
                        const numExp_1 = FData__get_toExp(new FData(0, [new FastData(new FastBits(0, [num_1]), w_6)]));
                        const n_66 = 0;
                        comp.Outputs[n_66].FDataStep[simStep] = (new FData(1, [new FastAlgExp(3, [exp_12, new BinaryOp(3, []), numExp_1])]));
                    }
                    break;
                }
                case 2: {
                    const matchValue_80 = FData__get_toExp(A_7);
                    const bExp_3 = FData__get_toExp(B_7);
                    const aExp_3 = matchValue_80;
                    const n_67 = 0;
                    comp.Outputs[n_67].FDataStep[simStep] = (new FData(1, [new FastAlgExp(3, [aExp_3, new BinaryOp(3, []), bExp_3])]));
                    break;
                }
            }
            break;
        }
        case 23: {
            const numberOfBits_4 = componentType.fields[0] | 0;
            let matchValue_82;
            const fd_107 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_82 = fd_107;
            let matchValue_83;
            const fd_108 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_83 = fd_108;
            let matchResult_10, A_8, B_8, exp_13, num_2, w_7, A_9, B_9;
            if (matchValue_82.tag === 1) {
                if (matchValue_83.tag === 0) {
                    if (matchValue_83.fields[0].Dat.tag === 0) {
                        matchResult_10 = 1;
                        exp_13 = matchValue_82.fields[0];
                        num_2 = matchValue_83.fields[0].Dat.fields[0];
                        w_7 = matchValue_83.fields[0].Width;
                    }
                    else {
                        matchResult_10 = 2;
                        A_9 = matchValue_82;
                        B_9 = matchValue_83;
                    }
                }
                else {
                    matchResult_10 = 2;
                    A_9 = matchValue_82;
                    B_9 = matchValue_83;
                }
            }
            else if (matchValue_83.tag === 1) {
                if (matchValue_82.fields[0].Dat.tag === 0) {
                    matchResult_10 = 1;
                    exp_13 = matchValue_83.fields[0];
                    num_2 = matchValue_82.fields[0].Dat.fields[0];
                    w_7 = matchValue_82.fields[0].Width;
                }
                else {
                    matchResult_10 = 2;
                    A_9 = matchValue_82;
                    B_9 = matchValue_83;
                }
            }
            else {
                matchResult_10 = 0;
                A_8 = matchValue_82.fields[0];
                B_8 = matchValue_83.fields[0];
            }
            switch (matchResult_10) {
                case 0: {
                    let outDat_2;
                    const matchValue_85 = A_8.Dat;
                    const matchValue_86 = B_8.Dat;
                    let matchResult_11, a_14, b_14, a_15, b_15, a_16, b_16;
                    if (matchValue_85.tag === 0) {
                        if (matchValue_86.tag === 0) {
                            matchResult_11 = 1;
                            a_15 = matchValue_85.fields[0];
                            b_15 = matchValue_86.fields[0];
                        }
                        else {
                            matchResult_11 = 2;
                            a_16 = matchValue_85;
                            b_16 = matchValue_86;
                        }
                    }
                    else if (matchValue_86.tag === 1) {
                        matchResult_11 = 0;
                        a_14 = matchValue_85.fields[0];
                        b_14 = matchValue_86.fields[0];
                    }
                    else {
                        matchResult_11 = 2;
                        a_16 = matchValue_85;
                        b_16 = matchValue_86;
                    }
                    switch (matchResult_11) {
                        case 0: {
                            outDat_2 = (new FastBits(1, [op_BitwiseAnd(a_14, b_14)]));
                            break;
                        }
                        case 1: {
                            outDat_2 = (new FastBits(0, [(a_15 & b_15) >>> 0]));
                            break;
                        }
                        default:
                            outDat_2 = toFail(`Inconsistent inputs to NBitsAnd ${comp.FullName} A=${a_16},${A_8}; B=${b_16},${B_8}`);
                    }
                    const fd_109 = new FData(0, [new FastData(outDat_2, A_8.Width)]);
                    const n_68 = 0;
                    comp.Outputs[n_68].FDataStep[simStep] = fd_109;
                    break;
                }
                case 1: {
                    let minusOne_2;
                    const value_2 = Math.pow(2, w_7) - 1;
                    minusOne_2 = (value_2 >>> 0);
                    if (num_2 === minusOne_2) {
                        const n_69 = 0;
                        comp.Outputs[n_69].FDataStep[simStep] = (new FData(1, [exp_13]));
                    }
                    else {
                        const numExp_2 = FData__get_toExp(new FData(0, [new FastData(new FastBits(0, [num_2]), w_7)]));
                        const n_70 = 0;
                        comp.Outputs[n_70].FDataStep[simStep] = (new FData(1, [new FastAlgExp(3, [exp_13, new BinaryOp(2, []), numExp_2])]));
                    }
                    break;
                }
                case 2: {
                    const matchValue_88 = FData__get_toExp(A_9);
                    const bExp_4 = FData__get_toExp(B_9);
                    const aExp_4 = matchValue_88;
                    const n_71 = 0;
                    comp.Outputs[n_71].FDataStep[simStep] = (new FData(1, [new FastAlgExp(3, [aExp_4, new BinaryOp(2, []), bExp_4])]));
                    break;
                }
            }
            break;
        }
        case 24: {
            const numberOfBits_5 = componentType.fields[0] | 0;
            let matchValue_90;
            const fd_113 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_90 = fd_113;
            if (matchValue_90.tag === 1) {
                const exp_14 = matchValue_90.fields[0];
                const n_73 = 0;
                comp.Outputs[n_73].FDataStep[simStep] = (new FData(1, [new FastAlgExp(2, [new UnaryOp(1, []), exp_14])]));
            }
            else {
                const A_10 = matchValue_90.fields[0];
                let outDat_3;
                const matchValue_91 = A_10.Dat;
                if (matchValue_91.tag === 0) {
                    const a_18 = matchValue_91.fields[0];
                    outDat_3 = (new FastBits(0, [~a_18 >>> 0]));
                }
                else {
                    const a_17 = matchValue_91.fields[0];
                    const w_8 = A_10.Width | 0;
                    const minusOne_3 = op_Subtraction(op_LeftShift(fromInt32(2), w_8), fromInt32(1));
                    outDat_3 = (new FastBits(1, [op_Subtraction(minusOne_3, a_17)]));
                }
                const fd_114 = new FData(0, [new FastData(outDat_3, A_10.Width)]);
                const n_72 = 0;
                comp.Outputs[n_72].FDataStep[simStep] = fd_114;
            }
            break;
        }
        case 25: {
            const numberOfBits_6 = componentType.fields[0] | 0;
            let matchValue_92;
            const fd_116 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_92 = fd_116;
            if (matchValue_92.tag === 0) {
                const A_11 = matchValue_92.fields[0];
                let outDat_4;
                const matchValue_93 = convertFastDataToInt(A_11);
                switch (matchValue_93) {
                    case 0: {
                        outDat_4 = convertIntToFastData(numberOfBits_6, 0);
                        break;
                    }
                    case 1: {
                        if ((n_74 = (numberOfBits_6 | 0), n_74 <= 32)) {
                            const n_75 = numberOfBits_6 | 0;
                            outDat_4 = convertIntToFastData(numberOfBits_6, ((1 << numberOfBits_6) >>> 0) - 1);
                        }
                        else {
                            outDat_4 = convertBigintToFastData(numberOfBits_6, op_Subtraction(op_LeftShift(fromInt32(1), numberOfBits_6), fromInt32(1)));
                        }
                        break;
                    }
                    default:
                        outDat_4 = toFail(printf("Can\'t happen"));
                }
                const n_76 = 0;
                comp.Outputs[n_76].FDataStep[simStep] = (new FData(0, [outDat_4]));
            }
            else {
                const err_6 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to the\r\n                    input port of a Bit-Spreader. Only values can be passed to this port."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_6);
            }
            break;
        }
        case 26: {
            const c = componentType.fields[0];
            toFail(printf("what? Custom components are removed before the fast simulation: %A"))(c);
            break;
        }
        case 27: {
            let matchValue_94;
            const fd_118 = comp.InputLinks[0].FDataStep[simStep];
            matchValue_94 = fd_118;
            let matchValue_95;
            const fd_119 = comp.InputLinks[1].FDataStep[simStep];
            matchValue_95 = fd_119;
            let matchResult_12, bits0_1, bits1_1, exps0, exps1, exps0_1, fd1_2, exps1_1, fd0_2, fd0_3, fd1_3;
            if (matchValue_94.tag === 1) {
                if (matchValue_94.fields[0].tag === 5) {
                    if (matchValue_95.tag === 1) {
                        if (matchValue_95.fields[0].tag === 5) {
                            matchResult_12 = 1;
                            exps0 = matchValue_94.fields[0].fields[0];
                            exps1 = matchValue_95.fields[0].fields[0];
                        }
                        else {
                            matchResult_12 = 2;
                            exps0_1 = matchValue_94.fields[0].fields[0];
                            fd1_2 = matchValue_95;
                        }
                    }
                    else {
                        matchResult_12 = 2;
                        exps0_1 = matchValue_94.fields[0].fields[0];
                        fd1_2 = matchValue_95;
                    }
                }
                else if (matchValue_95.tag === 1) {
                    if (matchValue_95.fields[0].tag === 5) {
                        matchResult_12 = 3;
                        exps1_1 = matchValue_95.fields[0].fields[0];
                        fd0_2 = matchValue_94;
                    }
                    else {
                        matchResult_12 = 4;
                        fd0_3 = matchValue_94;
                        fd1_3 = matchValue_95;
                    }
                }
                else {
                    matchResult_12 = 4;
                    fd0_3 = matchValue_94;
                    fd1_3 = matchValue_95;
                }
            }
            else if (matchValue_95.tag === 1) {
                if (matchValue_95.fields[0].tag === 5) {
                    matchResult_12 = 3;
                    exps1_1 = matchValue_95.fields[0].fields[0];
                    fd0_2 = matchValue_94;
                }
                else {
                    matchResult_12 = 4;
                    fd0_3 = matchValue_94;
                    fd1_3 = matchValue_95;
                }
            }
            else {
                matchResult_12 = 0;
                bits0_1 = matchValue_94.fields[0];
                bits1_1 = matchValue_95.fields[0];
            }
            switch (matchResult_12) {
                case 0: {
                    const wOut = (bits0_1.Width + bits1_1.Width) | 0;
                    let outBits_1;
                    if (wOut <= 32) {
                        const matchValue_97 = bits0_1.Dat;
                        const matchValue_98 = bits1_1.Dat;
                        let matchResult_13, b0, b1;
                        if (matchValue_97.tag === 0) {
                            if (matchValue_98.tag === 0) {
                                matchResult_13 = 0;
                                b0 = matchValue_97.fields[0];
                                b1 = matchValue_98.fields[0];
                            }
                            else {
                                matchResult_13 = 1;
                            }
                        }
                        else {
                            matchResult_13 = 1;
                        }
                        switch (matchResult_13) {
                            case 0: {
                                outBits_1 = convertIntToFastData(wOut, (((b1 << bits0_1.Width) >>> 0) | b0) >>> 0);
                                break;
                            }
                            default:
                                outBits_1 = toFail(`inconsistent merge widths: ${bits0_1},${bits1_1}`);
                        }
                    }
                    else {
                        const b0_1 = convertFastDataToBigint(bits0_1);
                        const b1_1 = convertFastDataToBigint(bits1_1);
                        outBits_1 = convertBigintToFastData(wOut, op_BitwiseOr(op_LeftShift(b1_1, bits0_1.Width), b0_1));
                    }
                    const n_78 = 0;
                    comp.Outputs[n_78].FDataStep[simStep] = (new FData(0, [outBits_1]));
                    break;
                }
                case 1: {
                    const newExp_3 = new FastAlgExp(5, [foldAppends(append(exps1, exps0))]);
                    const n_79 = 0;
                    comp.Outputs[n_79].FDataStep[simStep] = (new FData(1, [newExp_3]));
                    break;
                }
                case 2: {
                    const exp1_4 = FData__get_toExp(fd1_2);
                    const newExp_4 = new FastAlgExp(5, [foldAppends(cons(exp1_4, exps0_1))]);
                    const n_80 = 0;
                    comp.Outputs[n_80].FDataStep[simStep] = (new FData(1, [newExp_4]));
                    break;
                }
                case 3: {
                    const exp0 = FData__get_toExp(fd0_2);
                    const newExp_5 = new FastAlgExp(5, [foldAppends(append(exps1_1, singleton(exp0)))]);
                    const n_81 = 0;
                    comp.Outputs[n_81].FDataStep[simStep] = (new FData(1, [newExp_5]));
                    break;
                }
                case 4: {
                    const matchValue_100 = FData__get_toExp(fd0_3);
                    const exp1_5 = FData__get_toExp(fd1_3);
                    const exp0_1 = matchValue_100;
                    const newExp_6 = new FastAlgExp(5, [foldAppends(ofArray([exp1_5, exp0_1]))]);
                    const n_82 = 0;
                    comp.Outputs[n_82].FDataStep[simStep] = (new FData(1, [newExp_6]));
                    break;
                }
            }
            break;
        }
        case 28: {
            const n_83 = componentType.fields[0] | 0;
            const fdata = map((i_48) => {
                const fd_125 = comp.InputLinks[i_48].FDataStep[simStep];
                return fd_125;
            }, toList(rangeDouble(0, 1, n_83 - 1)));
            const allData = forAll((fdata_1) => {
                if (fdata_1.tag === 0) {
                    return true;
                }
                else {
                    return false;
                }
            }, fdata);
            if (allData) {
                const bitsList = map((n_84) => {
                    if (n_84.tag === 0) {
                        const bits_12 = n_84.fields[0];
                        return bits_12;
                    }
                    else {
                        return toFail(printf("Wrong Case"));
                    }
                }, fdata);
                const wOut_1 = sumBy((bits_13) => bits_13.Width, bitsList, {
                    GetZero: () => 0,
                    Add: (x_3, y) => (x_3 + y),
                }) | 0;
                let outBits_2;
                if (wOut_1 <= 32) {
                    const inBits = map((bits_14) => {
                        const matchValue_102 = bits_14.Dat;
                        if (matchValue_102.tag === 0) {
                            const b_18 = matchValue_102.fields[0];
                            return b_18;
                        }
                        else {
                            return toFail(printf("inconsistent merge widths"));
                        }
                    }, bitsList);
                    const mergeTwoValues = (width_10, value1, value2) => ((((value1 << width_10) >>> 0) | value2) >>> 0);
                    outBits_2 = convertIntToFastData(wOut_1, fold2((acc, width_11, input) => {
                        if (input < 0) {
                            throw new Error("Input values must be non-negative");
                        }
                        return mergeTwoValues(width_11, input, acc);
                    }, 0, map((bits_15) => bits_15.Width, bitsList), inBits));
                }
                else {
                    const inBits_1 = map(convertFastDataToBigint, bitsList);
                    const mergeTwoValues_1 = (width_12, value1_1, value2_1) => op_BitwiseOr(op_LeftShift(value1_1, width_12), value2_1);
                    outBits_2 = convertBigintToFastData(wOut_1, fold2((acc_1, width_13, input_1) => {
                        if (compare(input_1, fromZero()) < 0) {
                            throw new Error("Input values must be non-negative");
                        }
                        return mergeTwoValues_1(width_13, input_1, acc_1);
                    }, fromZero(), map((bits_17) => bits_17.Width, bitsList), inBits_1));
                }
                const n_87 = 0;
                comp.Outputs[n_87].FDataStep[simStep] = (new FData(0, [outBits_2]));
            }
            else {
                const fd_128 = new FData(1, [new FastAlgExp(5, [foldAppends(fold((acc_2, data) => {
                    let exps, fd_127;
                    return (data.tag === 1) ? ((data.fields[0].tag === 5) ? ((exps = data.fields[0].fields[0], append(exps, acc_2))) : ((fd_127 = data, cons(FData__get_toExp(fd_127), acc_2)))) : ((fd_127 = data, cons(FData__get_toExp(fd_127), acc_2)));
                }, empty(), fdata))])]);
                const n_88 = 0;
                comp.Outputs[n_88].FDataStep[simStep] = fd_128;
            }
            break;
        }
        case 29: {
            const topWireWidth = componentType.fields[0] | 0;
            let fd_130;
            const fd_129 = comp.InputLinks[0].FDataStep[simStep];
            fd_130 = fd_129;
            let matchResult_14, bits_18, exp_16, l, u, exp_17, exp_18;
            if (fd_130.tag === 1) {
                if (fd_130.fields[0].tag === 2) {
                    switch (fd_130.fields[0].fields[0].tag) {
                        case 2: {
                            matchResult_14 = 1;
                            exp_16 = fd_130.fields[0].fields[1];
                            l = fd_130.fields[0].fields[0].fields[0];
                            u = fd_130.fields[0].fields[0].fields[1];
                            break;
                        }
                        case 1: {
                            matchResult_14 = 2;
                            exp_17 = fd_130.fields[0].fields[1];
                            break;
                        }
                        default: {
                            matchResult_14 = 3;
                            exp_18 = fd_130.fields[0];
                        }
                    }
                }
                else {
                    matchResult_14 = 3;
                    exp_18 = fd_130.fields[0];
                }
            }
            else {
                matchResult_14 = 0;
                bits_18 = fd_130.fields[0];
            }
            switch (matchResult_14) {
                case 0: {
                    let patternInput_11;
                    const bits1_2 = getBits(bits_18.Width - 1, topWireWidth, bits_18);
                    const bits0_2 = getBits(topWireWidth - 1, 0, bits_18);
                    patternInput_11 = [bits0_2, bits1_2];
                    const bits1_3 = patternInput_11[1];
                    const bits0_3 = patternInput_11[0];
                    const n_89 = 0;
                    comp.Outputs[n_89].FDataStep[simStep] = (new FData(0, [bits0_3]));
                    const n_90 = 1;
                    comp.Outputs[n_90].FDataStep[simStep] = (new FData(0, [bits1_3]));
                    break;
                }
                case 1: {
                    const exp1_6 = new FastAlgExp(2, [new UnaryOp(2, [l + topWireWidth, u]), exp_16]);
                    const exp0_2 = new FastAlgExp(2, [new UnaryOp(2, [l, (l + topWireWidth) - 1]), exp_16]);
                    const n_91 = 0;
                    comp.Outputs[n_91].FDataStep[simStep] = (new FData(1, [exp0_2]));
                    const n_92 = 1;
                    comp.Outputs[n_92].FDataStep[simStep] = (new FData(1, [exp1_6]));
                    break;
                }
                case 2: {
                    const w_9 = getAlgExpWidth(new FastAlgExp(2, [new UnaryOp(1, []), exp_17])) | 0;
                    const exp1_7 = new FastAlgExp(2, [new UnaryOp(2, [topWireWidth, w_9 - 1]), exp_17]);
                    const exp0_3 = new FastAlgExp(2, [new UnaryOp(2, [0, topWireWidth - 1]), exp_17]);
                    const n_93 = 0;
                    comp.Outputs[n_93].FDataStep[simStep] = (new FData(1, [new FastAlgExp(2, [new UnaryOp(1, []), exp0_3])]));
                    const n_94 = 1;
                    comp.Outputs[n_94].FDataStep[simStep] = (new FData(1, [new FastAlgExp(2, [new UnaryOp(1, []), exp1_7])]));
                    break;
                }
                case 3: {
                    const w_10 = getAlgExpWidth(exp_18) | 0;
                    const exp1_8 = new FastAlgExp(2, [new UnaryOp(2, [topWireWidth, w_10 - 1]), exp_18]);
                    const exp0_4 = new FastAlgExp(2, [new UnaryOp(2, [0, topWireWidth - 1]), exp_18]);
                    const n_95 = 0;
                    comp.Outputs[n_95].FDataStep[simStep] = (new FData(1, [exp0_4]));
                    const n_96 = 1;
                    comp.Outputs[n_96].FDataStep[simStep] = (new FData(1, [exp1_8]));
                    break;
                }
            }
            break;
        }
        case 30: {
            const widths = componentType.fields[1];
            const n_97 = componentType.fields[0] | 0;
            const lsbs = componentType.fields[2];
            let fd_140;
            const fd_139 = comp.InputLinks[0].FDataStep[simStep];
            fd_140 = fd_139;
            let matchResult_15, bits_19, exp_19, l_1, u_1, exp_20, exp_21;
            if (fd_140.tag === 1) {
                if (fd_140.fields[0].tag === 2) {
                    switch (fd_140.fields[0].fields[0].tag) {
                        case 2: {
                            matchResult_15 = 1;
                            exp_19 = fd_140.fields[0].fields[1];
                            l_1 = fd_140.fields[0].fields[0].fields[0];
                            u_1 = fd_140.fields[0].fields[0].fields[1];
                            break;
                        }
                        case 1: {
                            matchResult_15 = 2;
                            exp_20 = fd_140.fields[0].fields[1];
                            break;
                        }
                        default: {
                            matchResult_15 = 3;
                            exp_21 = fd_140.fields[0];
                        }
                    }
                }
                else {
                    matchResult_15 = 3;
                    exp_21 = fd_140.fields[0];
                }
            }
            else {
                matchResult_15 = 0;
                bits_19 = fd_140.fields[0];
            }
            switch (matchResult_15) {
                case 0: {
                    iterateIndexed2((i_51, width_14, lsb_1) => {
                        const fd_141 = new FData(0, [getBits((lsb_1 + width_14) - 1, lsb_1, bits_19)]);
                        const n_98 = i_51 | 0;
                        comp.Outputs[n_98].FDataStep[simStep] = fd_141;
                    }, widths, lsbs);
                    break;
                }
                case 1: {
                    iterateIndexed2((i_52, width_15, lsb_2) => {
                        const fd_142 = new FData(1, [new FastAlgExp(2, [new UnaryOp(2, [l_1 + lsb_2, ((l_1 + lsb_2) + width_15) - 1]), exp_19])]);
                        const n_99 = i_52 | 0;
                        comp.Outputs[n_99].FDataStep[simStep] = fd_142;
                    }, widths, lsbs);
                    break;
                }
                case 2: {
                    iterateIndexed2((i_53, width_16, lsb_3) => {
                        const expi = new FastAlgExp(2, [new UnaryOp(2, [lsb_3, (lsb_3 + width_16) - 1]), exp_20]);
                        const n_100 = i_53 | 0;
                        comp.Outputs[n_100].FDataStep[simStep] = (new FData(1, [new FastAlgExp(2, [new UnaryOp(1, []), expi])]));
                    }, widths, lsbs);
                    break;
                }
                case 3: {
                    iterateIndexed2((i_54, width_17, lsb_4) => {
                        const fd_144 = new FData(1, [new FastAlgExp(2, [new UnaryOp(2, [lsb_4, (lsb_4 + width_17) - 1]), exp_21])]);
                        const n_101 = i_54 | 0;
                        comp.Outputs[n_101].FDataStep[simStep] = fd_144;
                    }, widths, lsbs);
                    break;
                }
            }
            break;
        }
        case 31: {
            let matchValue_103;
            let fd_145;
            const n_102 = 0;
            fd_145 = comp.InputLinks[n_102].FDataStep[simStepOld];
            matchValue_103 = fd_145;
            if (matchValue_103.tag === 0) {
                const bits_20 = matchValue_103.fields[0];
                let d_1;
                const fd__10 = new FData(0, [bits_20]);
                if (fd__10.tag === 0) {
                    const fd_146 = fd__10.fields[0];
                    const matchValue_104 = fd_146.Dat;
                    if (matchValue_104.tag === 1) {
                        d_1 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_146.Dat, fd_146.Width]));
                    }
                    else {
                        const n_103 = matchValue_104.fields[0];
                        d_1 = n_103;
                    }
                }
                else {
                    d_1 = toFail(printf("Can\'t extract data from Algebra"));
                }
                const fd_147 = (d_1 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]));
                const n_104 = 0;
                comp.Outputs[n_104].FDataStep[simStep] = fd_147;
            }
            else {
                const err_7 = new SimulationError(new SimulationErrorType(15, ["Algebraic Simulation not implemented for DFF."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_7);
            }
            break;
        }
        case 32: {
            let matchValue_105;
            let fd_148;
            const n_105 = 0;
            fd_148 = comp.InputLinks[n_105].FDataStep[simStepOld];
            matchValue_105 = fd_148;
            let matchValue_106;
            let fd_149;
            const n_106 = 1;
            fd_149 = comp.InputLinks[n_106].FDataStep[simStepOld];
            matchValue_106 = fd_149;
            let matchResult_16, bits0_4, bits1_4;
            if (matchValue_105.tag === 0) {
                if (matchValue_106.tag === 0) {
                    matchResult_16 = 0;
                    bits0_4 = matchValue_105.fields[0];
                    bits1_4 = matchValue_106.fields[0];
                }
                else {
                    matchResult_16 = 1;
                }
            }
            else {
                matchResult_16 = 1;
            }
            switch (matchResult_16) {
                case 0: {
                    let matchValue_110;
                    const fd__11 = new FData(0, [bits0_4]);
                    if (fd__11.tag === 0) {
                        const fd_150 = fd__11.fields[0];
                        const matchValue_108 = fd_150.Dat;
                        if (matchValue_108.tag === 1) {
                            matchValue_110 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_150.Dat, fd_150.Width]));
                        }
                        else {
                            const n_107 = matchValue_108.fields[0];
                            matchValue_110 = n_107;
                        }
                    }
                    else {
                        matchValue_110 = toFail(printf("Can\'t extract data from Algebra"));
                    }
                    let en;
                    const fd__12 = new FData(0, [bits1_4]);
                    if (fd__12.tag === 0) {
                        const fd_151 = fd__12.fields[0];
                        const matchValue_109 = fd_151.Dat;
                        if (matchValue_109.tag === 1) {
                            en = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_151.Dat, fd_151.Width]));
                        }
                        else {
                            const n_108 = matchValue_109.fields[0];
                            en = n_108;
                        }
                    }
                    else {
                        en = toFail(printf("Can\'t extract data from Algebra"));
                    }
                    const d_2 = matchValue_110;
                    if (en === 1) {
                        const fd_152 = (d_2 === 0) ? (new FData(0, [new FastData(new FastBits(0, [0]), 1)])) : (new FData(0, [new FastData(new FastBits(0, [1]), 1)]));
                        const n_109 = 0;
                        comp.Outputs[n_109].FDataStep[simStep] = fd_152;
                    }
                    else {
                        let fd_153;
                        let fd_154;
                        const matchValue_112 = comp.Outputs[0].Width | 0;
                        if (matchValue_112 === 0) {
                            fd_154 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                        }
                        else if (numStep === 0) {
                            const w_11 = matchValue_112 | 0;
                            fd_154 = ((w_11 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_11)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_11)])));
                        }
                        else {
                            const w_12 = matchValue_112 | 0;
                            fd_154 = comp.Outputs[0].FDataStep[simStepOld];
                        }
                        fd_153 = fd_154;
                        const n_110 = 0;
                        comp.Outputs[n_110].FDataStep[simStep] = fd_153;
                    }
                    break;
                }
                case 1: {
                    const err_8 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to a\r\n                    DFFE. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                    throw new AlgebraNotImplemented(err_8);
                    break;
                }
            }
            break;
        }
        case 33: {
            const width_18 = componentType.fields[0] | 0;
            let fd_156;
            let fd_155;
            const n_113 = 0;
            fd_155 = comp.InputLinks[n_113].FDataStep[simStepOld];
            fd_156 = fd_155;
            if (fd_156.tag === 0) {
                const bits_21 = fd_156.fields[0];
                const n_114 = 0;
                comp.Outputs[n_114].FDataStep[simStep] = (new FData(0, [bits_21]));
            }
            else {
                const err_9 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to a\r\n                    Register. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_9);
            }
            break;
        }
        case 34: {
            const width_19 = componentType.fields[0] | 0;
            let matchValue_114;
            let fd_158;
            const n_115 = 0;
            fd_158 = comp.InputLinks[n_115].FDataStep[simStepOld];
            matchValue_114 = fd_158;
            let matchValue_115;
            let fd_159;
            const n_116 = 1;
            fd_159 = comp.InputLinks[n_116].FDataStep[simStepOld];
            matchValue_115 = fd_159;
            let matchResult_17, bits_22, enable;
            if (matchValue_114.tag === 0) {
                if (matchValue_115.tag === 0) {
                    matchResult_17 = 0;
                    bits_22 = matchValue_114.fields[0];
                    enable = matchValue_115.fields[0];
                }
                else {
                    matchResult_17 = 1;
                }
            }
            else {
                matchResult_17 = 1;
            }
            switch (matchResult_17) {
                case 0: {
                    if (((fd__13 = (new FData(0, [enable])), (fd__13.tag === 0) ? ((fd_160 = fd__13.fields[0], (matchValue_117 = fd_160.Dat, (matchValue_117.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_160.Dat, fd_160.Width])) : ((n_117 = matchValue_117.fields[0], n_117))))) : toFail(printf("Can\'t extract data from Algebra")))) === 1) {
                        const n_118 = 0;
                        comp.Outputs[n_118].FDataStep[simStep] = (new FData(0, [bits_22]));
                    }
                    else {
                        let fd_162;
                        let fd_163;
                        const matchValue_118 = comp.Outputs[0].Width | 0;
                        if (matchValue_118 === 0) {
                            fd_163 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                        }
                        else if (numStep === 0) {
                            const w_13 = matchValue_118 | 0;
                            fd_163 = ((w_13 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_13)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_13)])));
                        }
                        else {
                            const w_14 = matchValue_118 | 0;
                            fd_163 = comp.Outputs[0].FDataStep[simStepOld];
                        }
                        fd_162 = fd_163;
                        const n_119 = 0;
                        comp.Outputs[n_119].FDataStep[simStep] = fd_162;
                    }
                    break;
                }
                case 1: {
                    const err_10 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to a\r\n                    RegisterE. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                    throw new AlgebraNotImplemented(err_10);
                    break;
                }
            }
            break;
        }
        case 35: {
            const width_20 = componentType.fields[0] | 0;
            let matchValue_120;
            let fd_164;
            const n_122 = 0;
            fd_164 = comp.InputLinks[n_122].FDataStep[simStepOld];
            matchValue_120 = fd_164;
            let matchValue_121;
            let fd_165;
            const n_123 = 1;
            fd_165 = comp.InputLinks[n_123].FDataStep[simStepOld];
            matchValue_121 = fd_165;
            let matchValue_122;
            let fd_166;
            const n_124 = 2;
            fd_166 = comp.InputLinks[n_124].FDataStep[simStepOld];
            matchValue_122 = fd_166;
            let matchResult_18, bits_23, enable_1, load;
            if (matchValue_120.tag === 0) {
                if (matchValue_121.tag === 0) {
                    if (matchValue_122.tag === 0) {
                        matchResult_18 = 0;
                        bits_23 = matchValue_120.fields[0];
                        enable_1 = matchValue_122.fields[0];
                        load = matchValue_121.fields[0];
                    }
                    else {
                        matchResult_18 = 1;
                    }
                }
                else {
                    matchResult_18 = 1;
                }
            }
            else {
                matchResult_18 = 1;
            }
            switch (matchResult_18) {
                case 0: {
                    if ((((fd__14 = (new FData(0, [enable_1])), (fd__14.tag === 0) ? ((fd_167 = fd__14.fields[0], (matchValue_124 = fd_167.Dat, (matchValue_124.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_167.Dat, fd_167.Width])) : ((n_125 = matchValue_124.fields[0], n_125))))) : toFail(printf("Can\'t extract data from Algebra")))) === 1) && (((fd__15 = (new FData(0, [load])), (fd__15.tag === 0) ? ((fd_168 = fd__15.fields[0], (matchValue_125 = fd_168.Dat, (matchValue_125.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_168.Dat, fd_168.Width])) : ((n_126 = matchValue_125.fields[0], n_126))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0)) {
                        let lastOut;
                        let fd_169;
                        const matchValue_126 = comp.Outputs[0].Width | 0;
                        if (matchValue_126 === 0) {
                            fd_169 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                        }
                        else if (numStep === 0) {
                            const w_15 = matchValue_126 | 0;
                            fd_169 = ((w_15 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_15)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_15)])));
                        }
                        else {
                            const w_16 = matchValue_126 | 0;
                            fd_169 = comp.Outputs[0].FDataStep[simStepOld];
                        }
                        lastOut = fd_169;
                        const n_130 = op_Addition((matchValue_128 = FData__get_toFastData(lastOut).Dat, (matchValue_128.tag === 1) ? ((n_1_2 = matchValue_128.fields[0], n_1_2)) : ((n_129 = matchValue_128.fields[0], fromUInt32(n_129)))), fromInt32(1));
                        const n$0027 = equals(n_130, fromFloat64(Math.pow(2, bits_23.Width))) ? fromInt32(0) : n_130;
                        let res;
                        const width_21 = bits_23.Width | 0;
                        const data_1 = n$0027;
                        if ((w_17 = (width_21 | 0), (w_17 <= 32) && (compare(data_1, fromInt32(0)) >= 0))) {
                            const w_2_1 = width_21 | 0;
                            res = (new FastData(new FastBits(0, [toUInt32(data_1) >>> 0]), w_2_1));
                        }
                        else if ((w_1_1 = (width_21 | 0), (w_1_1 <= 32) && (compare(data_1, fromInt32(0)) < 0))) {
                            const w_3_1 = width_21 | 0;
                            const data_1_1 = op_Modulus(data_1, Math.pow(fromInt32(2), w_3_1));
                            res = (new FastData(new FastBits(0, [toUInt32(data_1_1) >>> 0]), w_3_1));
                        }
                        else {
                            const w_4_1 = width_21 | 0;
                            res = (new FastData(new FastBits(1, [data_1]), w_4_1));
                        }
                        const n_131 = 0;
                        comp.Outputs[n_131].FDataStep[simStep] = (new FData(0, [res]));
                    }
                    else if ((((fd__16 = (new FData(0, [enable_1])), (fd__16.tag === 0) ? ((fd_171 = fd__16.fields[0], (matchValue_129 = fd_171.Dat, (matchValue_129.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_171.Dat, fd_171.Width])) : ((n_132 = matchValue_129.fields[0], n_132))))) : toFail(printf("Can\'t extract data from Algebra")))) === 1) && (((fd__17 = (new FData(0, [load])), (fd__17.tag === 0) ? ((fd_172 = fd__17.fields[0], (matchValue_130 = fd_172.Dat, (matchValue_130.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_172.Dat, fd_172.Width])) : ((n_133 = matchValue_130.fields[0], n_133))))) : toFail(printf("Can\'t extract data from Algebra")))) === 1)) {
                        const n_134 = 0;
                        comp.Outputs[n_134].FDataStep[simStep] = (new FData(0, [bits_23]));
                    }
                    else {
                        let fd_174;
                        let fd_175;
                        const matchValue_131 = comp.Outputs[0].Width | 0;
                        if (matchValue_131 === 0) {
                            fd_175 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                        }
                        else if (numStep === 0) {
                            const w_18 = matchValue_131 | 0;
                            fd_175 = ((w_18 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_18)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_18)])));
                        }
                        else {
                            const w_19 = matchValue_131 | 0;
                            fd_175 = comp.Outputs[0].FDataStep[simStepOld];
                        }
                        fd_174 = fd_175;
                        const n_135 = 0;
                        comp.Outputs[n_135].FDataStep[simStep] = fd_174;
                    }
                    break;
                }
                case 1: {
                    const err_11 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to a\r\n                    Counter. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                    throw new AlgebraNotImplemented(err_11);
                    break;
                }
            }
            break;
        }
        case 36: {
            const width_22 = componentType.fields[0] | 0;
            let matchValue_133;
            let fd_176;
            const n_138 = 0;
            fd_176 = comp.InputLinks[n_138].FDataStep[simStepOld];
            matchValue_133 = fd_176;
            let matchValue_134;
            let fd_177;
            const n_139 = 1;
            fd_177 = comp.InputLinks[n_139].FDataStep[simStepOld];
            matchValue_134 = fd_177;
            let matchResult_19, bits_24, load_1;
            if (matchValue_133.tag === 0) {
                if (matchValue_134.tag === 0) {
                    matchResult_19 = 0;
                    bits_24 = matchValue_133.fields[0];
                    load_1 = matchValue_134.fields[0];
                }
                else {
                    matchResult_19 = 1;
                }
            }
            else {
                matchResult_19 = 1;
            }
            switch (matchResult_19) {
                case 0: {
                    if (((fd__18 = (new FData(0, [load_1])), (fd__18.tag === 0) ? ((fd_178 = fd__18.fields[0], (matchValue_136 = fd_178.Dat, (matchValue_136.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_178.Dat, fd_178.Width])) : ((n_140 = matchValue_136.fields[0], n_140))))) : toFail(printf("Can\'t extract data from Algebra")))) === 0) {
                        let lastOut_1;
                        let fd_179;
                        const matchValue_137 = comp.Outputs[0].Width | 0;
                        if (matchValue_137 === 0) {
                            fd_179 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                        }
                        else if (numStep === 0) {
                            const w_20 = matchValue_137 | 0;
                            fd_179 = ((w_20 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_20)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_20)])));
                        }
                        else {
                            const w_21 = matchValue_137 | 0;
                            fd_179 = comp.Outputs[0].FDataStep[simStepOld];
                        }
                        lastOut_1 = fd_179;
                        const n_144 = op_Addition((matchValue_139 = FData__get_toFastData(lastOut_1).Dat, (matchValue_139.tag === 1) ? ((n_1_3 = matchValue_139.fields[0], n_1_3)) : ((n_143 = matchValue_139.fields[0], fromUInt32(n_143)))), fromInt32(1));
                        const n$0027_1 = equals(n_144, fromFloat64(Math.pow(2, bits_24.Width))) ? fromInt32(0) : n_144;
                        let res_1;
                        const width_23 = bits_24.Width | 0;
                        const data_2 = n$0027_1;
                        if ((w_22 = (width_23 | 0), (w_22 <= 32) && (compare(data_2, fromInt32(0)) >= 0))) {
                            const w_2_2 = width_23 | 0;
                            res_1 = (new FastData(new FastBits(0, [toUInt32(data_2) >>> 0]), w_2_2));
                        }
                        else if ((w_1_2 = (width_23 | 0), (w_1_2 <= 32) && (compare(data_2, fromInt32(0)) < 0))) {
                            const w_3_2 = width_23 | 0;
                            const data_1_2 = op_Modulus(data_2, Math.pow(fromInt32(2), w_3_2));
                            res_1 = (new FastData(new FastBits(0, [toUInt32(data_1_2) >>> 0]), w_3_2));
                        }
                        else {
                            const w_4_2 = width_23 | 0;
                            res_1 = (new FastData(new FastBits(1, [data_2]), w_4_2));
                        }
                        const n_145 = 0;
                        comp.Outputs[n_145].FDataStep[simStep] = (new FData(0, [res_1]));
                    }
                    else {
                        const n_146 = 0;
                        comp.Outputs[n_146].FDataStep[simStep] = (new FData(0, [bits_24]));
                    }
                    break;
                }
                case 1: {
                    const err_12 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to a\r\n                    Counter. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                    throw new AlgebraNotImplemented(err_12);
                    break;
                }
            }
            break;
        }
        case 37: {
            const width_24 = componentType.fields[0] | 0;
            let matchValue_140;
            let fd_182;
            const n_147 = 0;
            fd_182 = comp.InputLinks[n_147].FDataStep[simStepOld];
            matchValue_140 = fd_182;
            if (matchValue_140.tag === 0) {
                const enable_2 = matchValue_140.fields[0];
                if (((fd__19 = (new FData(0, [enable_2])), (fd__19.tag === 0) ? ((fd_183 = fd__19.fields[0], (matchValue_141 = fd_183.Dat, (matchValue_141.tag === 1) ? toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_183.Dat, fd_183.Width])) : ((n_148 = matchValue_141.fields[0], n_148))))) : toFail(printf("Can\'t extract data from Algebra")))) === 1) {
                    let lastOut_2;
                    let fd_184;
                    const matchValue_142 = comp.Outputs[0].Width | 0;
                    if (matchValue_142 === 0) {
                        fd_184 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                    }
                    else if (numStep === 0) {
                        const w_23 = matchValue_142 | 0;
                        fd_184 = ((w_23 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_23)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_23)])));
                    }
                    else {
                        const w_24 = matchValue_142 | 0;
                        fd_184 = comp.Outputs[0].FDataStep[simStepOld];
                    }
                    lastOut_2 = fd_184;
                    const n_152 = op_Addition((matchValue_144 = FData__get_toFastData(lastOut_2).Dat, (matchValue_144.tag === 1) ? ((n_1_4 = matchValue_144.fields[0], n_1_4)) : ((n_151 = matchValue_144.fields[0], fromUInt32(n_151)))), fromInt32(1));
                    const n$0027_2 = equals(n_152, fromFloat64(Math.pow(2, width_24))) ? fromInt32(0) : n_152;
                    let res_2;
                    const width_25 = width_24 | 0;
                    const data_3 = n$0027_2;
                    if ((w_25 = (width_25 | 0), (w_25 <= 32) && (compare(data_3, fromInt32(0)) >= 0))) {
                        const w_2_3 = width_25 | 0;
                        res_2 = (new FastData(new FastBits(0, [toUInt32(data_3) >>> 0]), w_2_3));
                    }
                    else if ((w_1_3 = (width_25 | 0), (w_1_3 <= 32) && (compare(data_3, fromInt32(0)) < 0))) {
                        const w_3_3 = width_25 | 0;
                        const data_1_3 = op_Modulus(data_3, Math.pow(fromInt32(2), w_3_3));
                        res_2 = (new FastData(new FastBits(0, [toUInt32(data_1_3) >>> 0]), w_3_3));
                    }
                    else {
                        const w_4_3 = width_25 | 0;
                        res_2 = (new FastData(new FastBits(1, [data_3]), w_4_3));
                    }
                    const n_153 = 0;
                    comp.Outputs[n_153].FDataStep[simStep] = (new FData(0, [res_2]));
                }
                else {
                    let fd_186;
                    let fd_187;
                    const matchValue_145 = comp.Outputs[0].Width | 0;
                    if (matchValue_145 === 0) {
                        fd_187 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
                    }
                    else if (numStep === 0) {
                        const w_26 = matchValue_145 | 0;
                        fd_187 = ((w_26 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_26)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_26)])));
                    }
                    else {
                        const w_27 = matchValue_145 | 0;
                        fd_187 = comp.Outputs[0].FDataStep[simStepOld];
                    }
                    fd_186 = fd_187;
                    const n_154 = 0;
                    comp.Outputs[n_154].FDataStep[simStep] = fd_186;
                }
            }
            else {
                const err_13 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to a\r\n                    Counter. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_13);
            }
            break;
        }
        case 38: {
            const width_26 = componentType.fields[0] | 0;
            let lastOut_3;
            let fd_188;
            const matchValue_147 = comp.Outputs[0].Width | 0;
            if (matchValue_147 === 0) {
                fd_188 = toFail(printf("Can\'t reduce %A (%A) because outputwidth is not known"))(comp.FullName)(comp.FType);
            }
            else if (numStep === 0) {
                const w_28 = matchValue_147 | 0;
                fd_188 = ((w_28 < 33) ? (new FData(0, [new FastData(new FastBits(0, [0]), w_28)])) : (new FData(0, [new FastData(new FastBits(1, [fromInt32(0)]), w_28)])));
            }
            else {
                const w_29 = matchValue_147 | 0;
                fd_188 = comp.Outputs[0].FDataStep[simStepOld];
            }
            lastOut_3 = fd_188;
            const n_160 = op_Addition((matchValue_149 = FData__get_toFastData(lastOut_3).Dat, (matchValue_149.tag === 1) ? ((n_1_5 = matchValue_149.fields[0], n_1_5)) : ((n_159 = matchValue_149.fields[0], fromUInt32(n_159)))), fromInt32(1));
            const n$0027_3 = equals(n_160, fromFloat64(Math.pow(2, width_26))) ? fromInt32(0) : n_160;
            let res_3;
            const width_27 = width_26 | 0;
            const data_4 = n$0027_3;
            if ((w_30 = (width_27 | 0), (w_30 <= 32) && (compare(data_4, fromInt32(0)) >= 0))) {
                const w_2_4 = width_27 | 0;
                res_3 = (new FastData(new FastBits(0, [toUInt32(data_4) >>> 0]), w_2_4));
            }
            else if ((w_1_4 = (width_27 | 0), (w_1_4 <= 32) && (compare(data_4, fromInt32(0)) < 0))) {
                const w_3_4 = width_27 | 0;
                const data_1_4 = op_Modulus(data_4, Math.pow(fromInt32(2), w_3_4));
                res_3 = (new FastData(new FastBits(0, [toUInt32(data_1_4) >>> 0]), w_3_4));
            }
            else {
                const w_4_4 = width_27 | 0;
                res_3 = (new FastData(new FastBits(1, [data_4]), w_4_4));
            }
            const n_161 = 0;
            comp.Outputs[n_161].FDataStep[simStep] = (new FData(0, [res_3]));
            break;
        }
        case 39: {
            const mem = componentType.fields[0];
            let fd_191;
            const fd_190 = comp.InputLinks[0].FDataStep[simStep];
            fd_191 = fd_190;
            if (fd_191.tag === 0) {
                const addr = fd_191.fields[0];
                const outData = readMemoryFData(mem, new FData(0, [addr]));
                const n_162 = 0;
                comp.Outputs[n_162].FDataStep[simStep] = outData;
            }
            else {
                const err_14 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to\r\n                    AsyncRom. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_14);
            }
            break;
        }
        case 40: {
            const mem_1 = componentType.fields[0];
            let fd_194;
            let fd_193;
            const n_163 = 0;
            fd_193 = comp.InputLinks[n_163].FDataStep[simStepOld];
            fd_194 = fd_193;
            if (fd_194.tag === 0) {
                const addr_1 = fd_194.fields[0];
                const outData_1 = readMemoryFData(mem_1, new FData(0, [addr_1]));
                const n_164 = 0;
                comp.Outputs[n_164].FDataStep[simStep] = outData_1;
            }
            else {
                const err_15 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to\r\n                    ROM. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                throw new AlgebraNotImplemented(err_15);
            }
            break;
        }
        case 41: {
            const memory = componentType.fields[0];
            const mem_2 = getRamStateMemory(numStep, simStepOld, comp.State, memory);
            let matchValue_150;
            let fd_196;
            const n_165 = 0;
            fd_196 = comp.InputLinks[n_165].FDataStep[simStepOld];
            matchValue_150 = fd_196;
            let matchValue_151;
            let fd_197;
            const n_166 = 1;
            fd_197 = comp.InputLinks[n_166].FDataStep[simStepOld];
            matchValue_151 = fd_197;
            let matchResult_20, address, dataIn;
            if (matchValue_150.tag === 0) {
                if (matchValue_151.tag === 0) {
                    matchResult_20 = 0;
                    address = matchValue_150.fields[0];
                    dataIn = matchValue_151.fields[0];
                }
                else {
                    matchResult_20 = 1;
                }
            }
            else {
                matchResult_20 = 1;
            }
            switch (matchResult_20) {
                case 0: {
                    let write;
                    let fd__20;
                    let fd_198;
                    const n_167 = 2;
                    fd_198 = comp.InputLinks[n_167].FDataStep[simStepOld];
                    fd__20 = fd_198;
                    if (fd__20.tag === 0) {
                        const fd_199 = fd__20.fields[0];
                        const matchValue_153 = fd_199.Dat;
                        if (matchValue_153.tag === 1) {
                            write = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_199.Dat, fd_199.Width]));
                        }
                        else {
                            const n_168 = matchValue_153.fields[0];
                            write = n_168;
                        }
                    }
                    else {
                        write = toFail(printf("Can\'t extract data from Algebra"));
                    }
                    const patternInput_13 = (write === 0) ? [mem_2, readMemoryFData(mem_2, new FData(0, [address]))] : ((write === 1) ? [writeMemory(mem_2, address, dataIn), readMemoryFData(mem_2, new FData(0, [address]))] : toFail(`simulation error: invalid 1 bit write value ${write}`));
                    const mem_3 = patternInput_13[0];
                    const dataOut = patternInput_13[1];
                    const matchValue_154 = comp.State;
                    if (matchValue_154 != null) {
                        const stateArr = matchValue_154;
                        stateArr.Step[simStep] = (new SimulationComponentState(3, [mem_3]));
                    }
                    else {
                        toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                    }
                    const n_169 = 0;
                    comp.Outputs[n_169].FDataStep[simStep] = dataOut;
                    break;
                }
                case 1: {
                    const err_16 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to\r\n                    RAM. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
                    throw new AlgebraNotImplemented(err_16);
                    break;
                }
            }
            break;
        }
        case 42: {
            const memory_1 = componentType.fields[0];
            const err_17 = new SimulationError(new SimulationErrorType(15, ["The chosen set of Algebraic inputs results in algebra being passed to\r\n                    AsyncRam. Algebraic Simulation has not been implemented for this component."]), comp.FullName, singleton(comp.cId), empty());
            if (isClockedReduction) {
                const mem_4 = getRamStateMemory(numStep, simStepOld, comp.State, memory_1);
                let address_1;
                let matchValue_155;
                let fd_201;
                const n_170 = 0;
                fd_201 = comp.InputLinks[n_170].FDataStep[simStepOld];
                matchValue_155 = fd_201;
                if (matchValue_155.tag === 1) {
                    throw new AlgebraNotImplemented(err_17);
                }
                else {
                    const d_3 = matchValue_155.fields[0];
                    address_1 = d_3;
                }
                let dataIn_1;
                let matchValue_156;
                let fd_202;
                const n_171 = 1;
                fd_202 = comp.InputLinks[n_171].FDataStep[simStepOld];
                matchValue_156 = fd_202;
                if (matchValue_156.tag === 1) {
                    throw new AlgebraNotImplemented(err_17);
                }
                else {
                    const d_4 = matchValue_156.fields[0];
                    dataIn_1 = d_4;
                }
                let io2;
                let matchValue_157;
                let fd_203;
                const n_172 = 2;
                fd_203 = comp.InputLinks[n_172].FDataStep[simStepOld];
                matchValue_157 = fd_203;
                if (matchValue_157.tag === 1) {
                    throw new AlgebraNotImplemented(err_17);
                }
                else {
                    const d_5 = matchValue_157.fields[0];
                    io2 = d_5;
                }
                let write_1;
                let fd__21;
                let fd_204;
                const n_173 = 2;
                fd_204 = comp.InputLinks[n_173].FDataStep[simStepOld];
                fd__21 = fd_204;
                if (fd__21.tag === 0) {
                    const fd_205 = fd__21.fields[0];
                    const matchValue_158 = fd_205.Dat;
                    if (matchValue_158.tag === 1) {
                        write_1 = toFail(interpolate("Can\'t extract %d%P() bit from BigWord data %P() of width %P()", [1, fd_205.Dat, fd_205.Width]));
                    }
                    else {
                        const n_174 = matchValue_158.fields[0];
                        write_1 = n_174;
                    }
                }
                else {
                    write_1 = toFail(printf("Can\'t extract data from Algebra"));
                }
                const mem_5 = (write_1 === 0) ? mem_4 : ((write_1 === 1) ? writeMemory(mem_4, address_1, dataIn_1) : toFail(`simulation error: invalid 1 bit write value ${write_1}`));
                const matchValue_159 = comp.State;
                if (matchValue_159 != null) {
                    const stateArr_1 = matchValue_159;
                    stateArr_1.Step[simStep] = (new SimulationComponentState(3, [mem_5]));
                }
                else {
                    toFail(printf("Attempt to put state into component %s without state array"))(comp.FullName);
                }
            }
            else {
                const mem_6 = getRamStateMemory(numStep + 1, simStep, comp.State, memory_1);
                let address_2;
                let matchValue_160;
                const fd_206 = comp.InputLinks[0].FDataStep[simStep];
                matchValue_160 = fd_206;
                if (matchValue_160.tag === 1) {
                    throw new AlgebraNotImplemented(err_17);
                }
                else {
                    const d_6 = matchValue_160.fields[0];
                    address_2 = d_6;
                }
                const data_5 = readMemoryFData(mem_6, new FData(0, [address_2]));
                const n_175 = 0;
                comp.Outputs[n_175].FDataStep[simStep] = data_5;
            }
            break;
        }
        case 43: {
            toFail(`simulation error: deprecated component type ${componentType}`);
            break;
        }
    }
}

//# sourceMappingURL=FastReduce.fs.js.map
