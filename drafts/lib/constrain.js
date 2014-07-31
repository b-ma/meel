var constrain = function(value, min, max) {
    if (value > max) { value = max; }
    if (value < min) { value = min; }
    return value;
}