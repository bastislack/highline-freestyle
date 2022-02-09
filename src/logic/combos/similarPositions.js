const arePositionsSimilar = (startPos, endPos) => {
  if ((startPos === "KOREAN" && (endPos === "CHEST" || endPos === "BACK")) || (startPos === "CHEST" && endPos === "KOREAN") || (startPos === "BACK" && endPos === "KOREAN") || (startPos === "EXPOSURE" && endPos === "STAND") || (startPos === "STAND" && endPos === "EXPOSURE") || (startPos === "BELLY" && endPos === "CHEST") || (startPos === "CHEST" && endPos === "BELLY")) {
    return true;
  } else {
    return false;
  }
}
export default arePositionsSimilar;
