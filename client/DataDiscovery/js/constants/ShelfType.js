(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.ShelfType");
    var ShelfType = grace.constants.ShelfType;

    ShelfType.SRC_DIM = "srcDim";
    ShelfType.SRC_MEA = "srcMea";

    ShelfType.DES_DIM = "desDimX";
    ShelfType.DES_VALUE = "desMeaValueY";

    ShelfType.PROC_FILTER = "procFilter";

    ShelfType.like = function(type1, type2) {
        return type1.substring(0, 3) === type2.substring(0, 3);
    }
    ShelfType.src = function(type) {
        return type && type.substring(0, 3) === "src";
    };
    ShelfType.des = function(type) {
        return type && type.substring(0, 3) === "des";
    };
    ShelfType.proc = function(type) {
        return type && type.substring(0, 4) === "proc";
    };

    ShelfType.dim = function(type) {
        return type === ShelfType.SRC_DIM || type === ShelfType.DES_DIM;
    };})();
