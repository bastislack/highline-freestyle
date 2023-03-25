import {Position} from "../../types/enums";

export default function arePositionsSimilar(startPos: Position, endPos: Position) {
  if (
    (startPos === "KOREAN" && (endPos === "CHEST" || endPos === "BACK")) ||
    (startPos === "CHEST" && endPos === "KOREAN") ||
    (startPos === "BACK" && endPos === "KOREAN") ||
    (startPos === "EXPOSURE" && endPos === "STAND") ||
    (startPos === "STAND" && endPos === "EXPOSURE") ||
    (startPos === "BELLY" && endPos === "CHEST") ||
    (startPos === "CHEST" && endPos === "BELLY")
  ) {
    return true;
  } else {
    return false;
  }
}
